import { EntityId, ISOTimestamp } from './types';
import { TemplateCredencial, TipoCredencial, DadosEmissao } from './credential-design';
import { canonicalJson, sha256Hex } from './integrity';

/**
 * Credencial emitida.
 *
 * DECISÃO CENTRAL: O TEMPLATE VAI CONGELADO JUNTO
 * -----------------------------------------------
 * `templateSnapshot` guarda uma cópia do desenho no instante da emissão, em
 * vez de uma referência ao template vivo.
 *
 * Sem isso, mudar a cor da marca amanhã redesenharia todos os certificados
 * já entregues — inclusive os que alguém anexou a um currículo, imprimiu ou
 * mandou para um empregador. O documento que a pessoa recebeu deixaria de
 * ser o documento que a plataforma mostra, e a verificação passaria a exibir
 * algo diferente do papel em mãos.
 *
 * Custa espaço, e é o custo certo: uma credencial é uma afirmação sobre um
 * momento. O momento não deve mudar porque o design mudou.
 */
export interface CredencialEmitida {
  id: EntityId;
  /** Código legível, o que a pessoa digita se não puder escanear. */
  codigo: string;
  tipo: TipoCredencial;
  userId: EntityId;
  dados: DadosEmissao;
  templateSnapshot: TemplateCredencial;
  /** Origem, quando a emissão veio de um curso concluído. */
  origem?: { tipo: 'COURSE' | 'TRILHA' | 'HABILITACAO' | 'MANUAL'; entidadeId?: EntityId };
  sha256Hash: string;
  emitidaEm: ISOTimestamp;
  revogadaEm?: ISOTimestamp;
  motivoRevogacao?: string;
}

/**
 * Campos que o hash cobre.
 *
 * Cobre o que o documento AFIRMA — quem, o quê, quando, por qual instituição.
 * Não cobre o desenho: trocar a espessura de uma moldura não muda o fato
 * certificado, e fazer o hash quebrar nesse caso produziria alarme falso de
 * adulteração onde nada de substantivo mudou.
 */
export async function calcularHashCredencial(
  c: Pick<CredencialEmitida, 'codigo' | 'tipo' | 'userId' | 'emitidaEm'> & { dados: DadosEmissao }
): Promise<string> {
  const conteudo = canonicalJson({
    codigo: c.codigo,
    tipo: c.tipo,
    userId: c.userId,
    emitidaEm: c.emitidaEm,
    nomeTitular: c.dados.nomeTitular,
    tituloDocumento: c.dados.tituloDocumento,
    nomeCurso: c.dados.nomeCurso ?? null,
    cargaHoraria: c.dados.cargaHoraria ?? null,
    dataEmissao: c.dados.dataEmissao,
    dataValidade: c.dados.dataValidade ?? null,
    nomeInstituicao: c.dados.nomeInstituicao,
    competencias: c.dados.competencias ?? null,
  });
  return `sha256:${await sha256Hex(conteudo)}`;
}

export type ResultadoVerificacao =
  | { situacao: 'VALIDA'; credencial: CredencialEmitida }
  | { situacao: 'REVOGADA'; credencial: CredencialEmitida }
  | { situacao: 'EXPIRADA'; credencial: CredencialEmitida }
  | { situacao: 'ADULTERADA'; credencial: CredencialEmitida; hashRecalculado: string }
  | { situacao: 'NAO_ENCONTRADA' };

export const EXPLICACAO_SITUACAO: Record<
  Exclude<ResultadoVerificacao['situacao'], never>,
  { titulo: string; texto: string }
> = {
  VALIDA: {
    titulo: 'Documento autêntico',
    texto:
      'O código consta no registro da Academia e o conteúdo confere com o que foi emitido.',
  },
  REVOGADA: {
    titulo: 'Documento revogado',
    texto:
      'Esta credencial foi emitida e depois cancelada pela instituição. Não vale como comprovação.',
  },
  EXPIRADA: {
    titulo: 'Documento fora da validade',
    texto:
      'A credencial foi legitimamente emitida, mas o período de validade terminou. O registro histórico permanece.',
  },
  ADULTERADA: {
    titulo: 'Conteúdo não confere',
    texto:
      'O código existe, mas os dados registrados não batem com o hash gravado na emissão. Não aceite este documento.',
  },
  NAO_ENCONTRADA: {
    titulo: 'Código não encontrado',
    texto:
      'Nenhuma credencial foi emitida com este código. Confira a digitação — o código tem o formato PREFIXO-XXXX-XXXX.',
  },
};
