import {
  PersistentKidsAccountRepository,
  KidsAccountRepository,
} from '../../repositories/kids-account.repository';
import {
  PerfilInfantil,
  PermissoesInfantis,
  PERMISSOES_PADRAO,
  SolicitacaoParental,
  TipoSolicitacao,
  ModalidadeContaAdulta,
  derivarHashSenha,
  comparacaoSegura,
  validarCredenciais,
  ProblemaCredencial,
  idadeEmAnos,
} from '../../domain/kids-account';

export interface PedidoCriacaoInfantil {
  responsavelUserId: string;
  nomeExibicao: string;
  dataNascimento: string;
  nomeUsuario: string;
  senha: string;
  permissoes?: Partial<PermissoesInfantis>;
}

export class ErroCredenciais extends Error {
  constructor(public problemas: ProblemaCredencial[]) {
    super(problemas.map((p) => p.mensagem).join(' '));
    this.name = 'ErroCredenciais';
  }
}

/** Mapeia cada ação social da criança à permissão que a governa. */
const PERMISSAO_DA_ACAO: Record<TipoSolicitacao, keyof Omit<PermissoesInfantis, 'limiteDiarioMinutos'>> = {
  CONEXAO_ENVIAR: 'enviarPedidoConexao',
  CONEXAO_RECEBER: 'receberPedidoConexao',
  SALA_ENTRAR: 'entrarEmSalas',
  COMUNIDADE_PUBLICAR: 'publicarNaComunidade',
  GRAVACAO_ENVIAR: 'enviarGravacoes',
};

export type ResultadoAcaoInfantil =
  | { desfecho: 'PERMITIDA' }
  | { desfecho: 'BLOQUEADA'; motivo: string }
  | { desfecho: 'AGUARDA_RESPONSAVEL'; solicitacao: SolicitacaoParental };

export class KidsAccountService {
  constructor(private repo: KidsAccountRepository = new PersistentKidsAccountRepository()) {}

  // ------------------------------------------------------------ criação

  /**
   * Cria o perfil infantil atado a uma conta adulta.
   *
   * Quando `responsavelUserId` corresponde a uma conta que ainda não existe
   * como responsável, ela é registrada como GERENCIAL. É o caso de quem chega
   * à plataforma para criar um perfil de criança: a conta adulta nasce como
   * consequência, sem exigir que a pessoa monte um perfil de músico que não
   * veio buscar.
   */
  public async criarPerfilInfantil(pedido: PedidoCriacaoInfantil): Promise<PerfilInfantil> {
    const problemas = validarCredenciais(pedido.nomeUsuario, pedido.senha);
    if (problemas.length > 0) throw new ErroCredenciais(problemas);

    const jaExiste = await this.repo.buscarPorNomeUsuario(pedido.nomeUsuario);
    if (jaExiste) {
      throw new ErroCredenciais([
        { campo: 'nomeUsuario', mensagem: 'Este nome de usuário já está em uso. Escolha outro.' },
      ]);
    }

    if (idadeEmAnos(pedido.dataNascimento) >= 18) {
      throw new ErroCredenciais([
        {
          campo: 'nomeUsuario',
          mensagem:
            'A data de nascimento indica uma pessoa maior de idade. Contas adultas se criam pelo cadastro normal.',
        },
      ]);
    }

    if (!(await this.repo.buscarResponsavel(pedido.responsavelUserId))) {
      await this.repo.salvarResponsavel({
        userId: pedido.responsavelUserId,
        modalidade: 'GERENCIAL',
        criadoEm: new Date().toISOString(),
      });
    }

    const { hash, salt, iteracoes } = await derivarHashSenha(pedido.senha);
    const agora = new Date().toISOString();

    return this.repo.salvarPerfil({
      id: `kid_${Date.now().toString(36)}`,
      userId: `usr_kid_${Date.now().toString(36)}`,
      responsavelUserId: pedido.responsavelUserId,
      nomeExibicao: pedido.nomeExibicao.trim(),
      dataNascimento: pedido.dataNascimento,
      credenciais: {
        nomeUsuario: pedido.nomeUsuario.trim(),
        hashSenha: hash,
        saltSenha: salt,
        iteracoes,
        atualizadoEm: agora,
      },
      permissoes: { ...PERMISSOES_PADRAO, ...pedido.permissoes },
      criadoEm: agora,
      atualizadoEm: agora,
    });
  }

  public listarPerfis(responsavelUserId: string): Promise<PerfilInfantil[]> {
    return this.repo.listarPerfis(responsavelUserId);
  }

  public buscarPerfil(userId: string): Promise<PerfilInfantil | null> {
    return this.repo.buscarPerfil(userId);
  }

  // ------------------------------------------------------------ autenticação

  /**
   * Autentica a criança pelo nome de usuário e senha definidos pelo
   * responsável.
   *
   * Devolve `null` tanto para usuário inexistente quanto para senha errada —
   * mensagens diferentes contariam a um estranho quais nomes de usuário de
   * criança existem na plataforma.
   */
  public async autenticarCrianca(nomeUsuario: string, senha: string): Promise<PerfilInfantil | null> {
    const perfil = await this.repo.buscarPorNomeUsuario(nomeUsuario);
    if (!perfil) return null;

    const { hash } = await derivarHashSenha(senha, perfil.credenciais.saltSenha);
    return comparacaoSegura(hash, perfil.credenciais.hashSenha) ? perfil : null;
  }

  public async trocarSenha(criancaUserId: string, novaSenha: string): Promise<PerfilInfantil> {
    const perfil = await this.repo.buscarPerfil(criancaUserId);
    if (!perfil) throw new Error('Perfil infantil não encontrado.');

    const problemas = validarCredenciais(perfil.credenciais.nomeUsuario, novaSenha);
    if (problemas.length > 0) throw new ErroCredenciais(problemas);

    const { hash, salt, iteracoes } = await derivarHashSenha(novaSenha);
    return this.repo.salvarPerfil({
      ...perfil,
      credenciais: {
        ...perfil.credenciais,
        hashSenha: hash,
        saltSenha: salt,
        iteracoes,
        atualizadoEm: new Date().toISOString(),
      },
      atualizadoEm: new Date().toISOString(),
    });
  }

  // ------------------------------------------------------------ permissões

  public async atualizarPermissoes(
    criancaUserId: string,
    permissoes: PermissoesInfantis
  ): Promise<PerfilInfantil> {
    const perfil = await this.repo.buscarPerfil(criancaUserId);
    if (!perfil) throw new Error('Perfil infantil não encontrado.');
    return this.repo.salvarPerfil({
      ...perfil,
      permissoes,
      atualizadoEm: new Date().toISOString(),
    });
  }

  /**
   * Ponto único por onde toda ação social da criança passa.
   *
   * Existir um só caminho é o que torna a regra verificável: não há como uma
   * tela nova esquecer de consultar a permissão, porque nenhuma tela executa
   * a ação diretamente.
   */
  public async solicitarAcao(
    criancaUserId: string,
    tipo: TipoSolicitacao,
    resumo: string,
    detalhes: Record<string, string> = {}
  ): Promise<ResultadoAcaoInfantil> {
    const perfil = await this.repo.buscarPerfil(criancaUserId);
    if (!perfil) return { desfecho: 'BLOQUEADA', motivo: 'Perfil infantil não encontrado.' };

    const regra = perfil.permissoes[PERMISSAO_DA_ACAO[tipo]];

    if (!regra.permitido) {
      return {
        desfecho: 'BLOQUEADA',
        motivo: 'Esta ação está desligada nas configurações definidas pelo responsável.',
      };
    }

    if (!regra.exigeConfirmacao) {
      return { desfecho: 'PERMITIDA' };
    }

    const solicitacao = await this.repo.salvarSolicitacao({
      id: `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      criancaUserId,
      responsavelUserId: perfil.responsavelUserId,
      tipo,
      resumo,
      detalhes,
      situacao: 'PENDENTE',
      criadaEm: new Date().toISOString(),
    });

    return { desfecho: 'AGUARDA_RESPONSAVEL', solicitacao };
  }

  // ------------------------------------------------------------ solicitações

  public listarSolicitacoes(responsavelUserId: string): Promise<SolicitacaoParental[]> {
    return this.repo.listarSolicitacoes(responsavelUserId);
  }

  public async decidirSolicitacao(
    id: string,
    aprovar: boolean,
    motivoRecusa?: string
  ): Promise<SolicitacaoParental | null> {
    const solicitacao = await this.repo.buscarSolicitacao(id);
    if (!solicitacao) return null;
    // Uma solicitação já decidida não se redecide: o efeito dela já ocorreu
    // (ou não), e reverter aqui daria a impressão falsa de desfazer.
    if (solicitacao.situacao !== 'PENDENTE') return solicitacao;

    return this.repo.salvarSolicitacao({
      ...solicitacao,
      situacao: aprovar ? 'APROVADA' : 'RECUSADA',
      decididaEm: new Date().toISOString(),
      motivoRecusa: aprovar ? undefined : motivoRecusa,
    });
  }

  // ------------------------------------------------------------ responsável

  public async modalidadeDaConta(userId: string): Promise<ModalidadeContaAdulta | null> {
    return (await this.repo.buscarResponsavel(userId))?.modalidade ?? null;
  }

  /** Promove a conta gerencial a perfil completo de músico. */
  public async abrirPerfilCompleto(userId: string): Promise<void> {
    const registro = await this.repo.buscarResponsavel(userId);
    await this.repo.salvarResponsavel({
      userId,
      modalidade: 'COMPLETA',
      criadoEm: registro?.criadoEm ?? new Date().toISOString(),
    });
  }
}

export const kidsAccountService = new KidsAccountService();
