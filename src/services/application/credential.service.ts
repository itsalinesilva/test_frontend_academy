import {
  PersistentCredentialRepository,
  CredentialRepository,
} from '../../repositories/credential.repository';
import {
  TemplateCredencial,
  TipoCredencial,
  DadosEmissao,
  gerarCodigoVerificacao,
  templateValido,
  validarTemplate,
  ProblemaTemplate,
  TOKENS_PADRAO,
  CANVAS,
} from '../../domain/credential-design';
import {
  CredencialEmitida,
  calcularHashCredencial,
  ResultadoVerificacao,
} from '../../domain/credential';

export interface PedidoEmissao {
  templateId: string;
  userId: string;
  dados: Omit<DadosEmissao, 'codigoVerificacao' | 'urlVerificacao'>;
  origem?: CredencialEmitida['origem'];
}

/**
 * Emissão e verificação de badges, credenciais e certificados.
 */
export class CredentialService {
  constructor(private repo: CredentialRepository = new PersistentCredentialRepository()) {}

  // ---------------------------------------------------------------- templates

  public listarTemplates(): Promise<TemplateCredencial[]> {
    return this.repo.listarTemplates();
  }

  public buscarTemplate(id: string): Promise<TemplateCredencial | null> {
    return this.repo.buscarTemplate(id);
  }

  public validarTemplate(t: TemplateCredencial): ProblemaTemplate[] {
    return validarTemplate(t);
  }

  /**
   * Salva um template. Recusa salvar com erro estrutural.
   *
   * O certo é impedir aqui e não na emissão: um template quebrado descoberto
   * na hora de emitir já custou o tempo de quem estava emitindo, e o desenho
   * pode ter sido feito semanas antes por outra pessoa.
   */
  public async salvarTemplate(template: TemplateCredencial): Promise<TemplateCredencial> {
    const problemas = validarTemplate(template);
    const erros = problemas.filter((p) => p.gravidade === 'erro');
    if (erros.length > 0) {
      throw new Error(`Template inválido: ${erros.map((e) => e.mensagem).join(' ')}`);
    }
    return this.repo.salvarTemplate(template);
  }

  /** Duplica um template — o caminho para alterar um de fábrica. */
  public async duplicarTemplate(id: string, novoNome?: string): Promise<TemplateCredencial> {
    const origem = await this.repo.buscarTemplate(id);
    if (!origem) throw new Error(`Template ${id} não encontrado.`);

    const agora = new Date().toISOString();
    const copia: TemplateCredencial = {
      ...origem,
      id: `tpl_${Date.now().toString(36)}`,
      nome: novoNome || `${origem.nome} (cópia)`,
      ehPadrao: false,
      criadoEm: agora,
      atualizadoEm: agora,
    };
    return this.repo.salvarTemplate(copia);
  }

  public excluirTemplate(id: string): Promise<boolean> {
    return this.repo.excluirTemplate(id);
  }

  /** Template em branco, já com a estrutura mínima do tipo escolhido. */
  public criarTemplateVazio(tipo: TipoCredencial, nome: string): TemplateCredencial {
    const agora = new Date().toISOString();
    const canvas = CANVAS[tipo];
    return {
      id: `tpl_${Date.now().toString(36)}`,
      tipo,
      nome,
      descricao: '',
      tokens: { ...TOKENS_PADRAO },
      elementos: [
        { kind: 'MOLDURA', id: 'moldura', margem: 24 },
        {
          kind: 'CAMPO',
          id: 'titulo',
          campo: 'tituloDocumento',
          caixa: { x: 60, y: 120, largura: canvas.largura - 120, altura: 60 },
          tamanhoFonte: 32,
          fonte: 'titulo',
          peso: 'bold',
          cor: 'primaria',
          alinhamento: 'centro',
        },
        ...(tipo === 'BADGE'
          ? []
          : ([
              {
                kind: 'CAMPO' as const,
                id: 'titular',
                campo: 'nomeTitular' as const,
                caixa: { x: 60, y: 240, largura: canvas.largura - 120, altura: 60 },
                tamanhoFonte: 28,
                fonte: 'titulo' as const,
                peso: 'bold' as const,
                cor: 'texto' as const,
                alinhamento: 'centro' as const,
              },
              {
                kind: 'CAMPO' as const,
                id: 'codigo',
                campo: 'codigoVerificacao' as const,
                caixa: { x: 60, y: canvas.altura - 90, largura: canvas.largura - 120, altura: 24 },
                tamanhoFonte: 12,
                fonte: 'corpo' as const,
                peso: 'bold' as const,
                cor: 'secundaria' as const,
                alinhamento: 'centro' as const,
              },
              {
                kind: 'QRCODE' as const,
                id: 'qr',
                caixa: {
                  x: canvas.largura - 190,
                  y: canvas.altura - 230,
                  largura: 120,
                  altura: 120,
                },
              },
            ] as TemplateCredencial['elementos'])),
        ...(tipo === 'CERTIFICADO'
          ? ([
              {
                kind: 'CAMPO' as const,
                id: 'data',
                campo: 'dataEmissao' as const,
                caixa: { x: 60, y: canvas.altura - 130, largura: 280, altura: 22 },
                tamanhoFonte: 12,
                fonte: 'corpo' as const,
                peso: 'normal' as const,
                cor: 'suave' as const,
                alinhamento: 'esquerda' as const,
              },
            ] as TemplateCredencial['elementos'])
          : []),
      ],
      imagens: {},
      ehPadrao: false,
      criadoEm: agora,
      atualizadoEm: agora,
    };
  }

  // ----------------------------------------------------------------- emissão

  /**
   * Endereço público de verificação.
   *
   * Relativo à origem de onde a plataforma está servida, para funcionar em
   * desenvolvimento, em pré-produção e em produção sem configuração — e para
   * não cravar um domínio que ainda não foi decidido.
   */
  public urlDeVerificacao(codigo: string): string {
    const origem =
      typeof window !== 'undefined' && window.location
        ? window.location.origin
        : 'https://academia-musical-digital.pages.dev';
    return `${origem}/credential/${codigo}`;
  }

  public async emitir(pedido: PedidoEmissao): Promise<CredencialEmitida> {
    const template = await this.repo.buscarTemplate(pedido.templateId);
    if (!template) throw new Error(`Template ${pedido.templateId} não encontrado.`);
    if (!templateValido(template)) {
      throw new Error('O template tem erros estruturais e não pode emitir documentos.');
    }

    const codigo = gerarCodigoVerificacao();
    const emitidaEm = new Date().toISOString();
    const dados: DadosEmissao = {
      ...pedido.dados,
      codigoVerificacao: codigo,
      urlVerificacao: this.urlDeVerificacao(codigo),
    };

    const sha256Hash = await calcularHashCredencial({
      codigo,
      tipo: template.tipo,
      userId: pedido.userId,
      emitidaEm,
      dados,
    });

    const credencial: CredencialEmitida = {
      id: `cred_${Date.now().toString(36)}`,
      codigo,
      tipo: template.tipo,
      userId: pedido.userId,
      dados,
      // Cópia congelada: ver a nota em domain/credential.ts.
      templateSnapshot: JSON.parse(JSON.stringify(template)) as TemplateCredencial,
      origem: pedido.origem,
      sha256Hash,
      emitidaEm,
    };

    return this.repo.salvarEmitida(credencial);
  }

  public async revogar(codigo: string, motivo: string): Promise<CredencialEmitida | null> {
    const credencial = await this.repo.buscarPorCodigo(codigo);
    if (!credencial) return null;
    return this.repo.salvarEmitida({
      ...credencial,
      revogadaEm: new Date().toISOString(),
      motivoRevogacao: motivo,
    });
  }

  public listarEmitidas(userId?: string): Promise<CredencialEmitida[]> {
    return this.repo.listarEmitidas(userId);
  }

  // -------------------------------------------------------------- verificação

  /**
   * Verifica um código.
   *
   * A ordem das respostas importa: adulteração vem antes de revogação e de
   * validade, porque um documento cujo conteúdo não confere não deve ser
   * descrito como "apenas expirado".
   */
  public async verificar(codigo: string): Promise<ResultadoVerificacao> {
    const credencial = await this.repo.buscarPorCodigo(codigo);
    if (!credencial) return { situacao: 'NAO_ENCONTRADA' };

    const hashRecalculado = await calcularHashCredencial(credencial);
    if (hashRecalculado !== credencial.sha256Hash) {
      return { situacao: 'ADULTERADA', credencial, hashRecalculado };
    }

    if (credencial.revogadaEm) return { situacao: 'REVOGADA', credencial };

    const validade = credencial.dados.dataValidade;
    if (validade) {
      const limite = new Date(validade);
      if (!Number.isNaN(limite.getTime()) && limite.getTime() < Date.now()) {
        return { situacao: 'EXPIRADA', credencial };
      }
    }

    return { situacao: 'VALIDA', credencial };
  }
}

export const credentialService = new CredentialService();
