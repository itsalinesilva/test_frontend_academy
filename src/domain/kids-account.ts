import { EntityId, ISOTimestamp } from './types';

/**
 * Contas infantis e tutela parental.
 *
 * O PRINCÍPIO
 * -----------
 * Um perfil infantil não é um perfil simplificado. É um perfil RESTRINGIDO:
 * as restrições não existem para deixar a interface mais fácil, existem
 * porque a pessoa do outro lado é uma criança. Simplificar é consequência;
 * restringir é o objetivo.
 *
 * Disso decorrem três regras que o resto do módulo apenas implementa:
 *
 *  1. Não existe conta infantil solta. Toda conta infantil nasce de uma conta
 *     adulta e permanece atada a ela. O tipo exige `responsavelUserId`, então
 *     uma criança sem responsável é literalmente inexpressável.
 *
 *  2. Nada social acontece por iniciativa da criança. Pedir conexão, aceitar
 *     conexão, entrar numa sala — tudo vira SOLICITAÇÃO na conta do
 *     responsável. A criança age; o efeito só ocorre depois do aval.
 *
 *  3. A criança não alcança perfil de ninguém. Não é filtro de listagem: é
 *     bloqueio de rota. Um link recebido por fora também não abre.
 *
 * SOBRE O ADULTO QUE NÃO QUER UMA CONTA
 * -------------------------------------
 * Quem chega para criar um perfil infantil normalmente não veio para si. Por
 * isso a conta adulta nasce GERENCIAL: serve só para tutelar, sem biografia,
 * sem portfólio, sem nada para preencher. Vira conta completa quando e se a
 * pessoa quiser — e não antes.
 */

// ---------------------------------------------------------------------------
// Conta do responsável
// ---------------------------------------------------------------------------

export type ModalidadeContaAdulta = 'GERENCIAL' | 'COMPLETA';

export const DESCRICAO_MODALIDADE: Record<ModalidadeContaAdulta, string> = {
  GERENCIAL:
    'Conta de acompanhamento. Existe para tutelar o perfil infantil e não aparece no diretório de músicos. Pode virar um perfil completo quando você quiser.',
  COMPLETA:
    'Perfil de músico na plataforma, com trilhas, prática, portfólio e comunidade — além da tutela do perfil infantil.',
};

// ---------------------------------------------------------------------------
// Permissões
// ---------------------------------------------------------------------------

/**
 * Cada permissão tem dois níveis, e isso é proposital.
 *
 * `permitido` diz se a criança pode sequer tentar. `exigeConfirmacao` diz se
 * cada tentativa precisa de aval, uma a uma.
 *
 * Separar os dois evita a escolha falsa entre "bloqueado" e "liberado geral":
 * o comum é querer que a criança POSSA pedir conexão, mas que cada pedido
 * passe pelo responsável antes de sair.
 */
export interface RegraPermissao {
  permitido: boolean;
  exigeConfirmacao: boolean;
}

export interface PermissoesInfantis {
  /** Enviar pedido de conexão a outra pessoa. */
  enviarPedidoConexao: RegraPermissao;
  /** Receber e aceitar pedidos de conexão. */
  receberPedidoConexao: RegraPermissao;
  /** Entrar em salas de estudo. */
  entrarEmSalas: RegraPermissao;
  /** Publicar na comunidade. */
  publicarNaComunidade: RegraPermissao;
  /** Enviar gravações próprias. */
  enviarGravacoes: RegraPermissao;
  /** Limite diário de estudo, em minutos. Zero significa sem limite. */
  limiteDiarioMinutos: number;
}

/**
 * Padrão de partida: tudo o que envolve outra pessoa nasce fechado.
 *
 * Um responsável que queira abrir abre conscientemente. O contrário — nascer
 * aberto e depender de alguém lembrar de fechar — transfere para o descuido
 * uma decisão sobre uma criança.
 */
export const PERMISSOES_PADRAO: PermissoesInfantis = {
  enviarPedidoConexao: { permitido: false, exigeConfirmacao: true },
  receberPedidoConexao: { permitido: false, exigeConfirmacao: true },
  entrarEmSalas: { permitido: false, exigeConfirmacao: true },
  publicarNaComunidade: { permitido: false, exigeConfirmacao: true },
  enviarGravacoes: { permitido: true, exigeConfirmacao: true },
  limiteDiarioMinutos: 45,
};

export const ROTULOS_PERMISSAO: Record<
  keyof Omit<PermissoesInfantis, 'limiteDiarioMinutos'>,
  { titulo: string; seDesligado: string; seLigadoSemConfirmar: string; seLigadoComConfirmar: string }
> = {
  enviarPedidoConexao: {
    titulo: 'Enviar pedidos de conexão',
    seDesligado: 'A criança não consegue pedir conexão a ninguém. O botão não aparece para ela.',
    seLigadoSemConfirmar: 'Os pedidos saem na hora, sem passar por você.',
    seLigadoComConfirmar: 'Cada pedido fica esperando o seu aval antes de sair. Você vê para quem é.',
  },
  receberPedidoConexao: {
    titulo: 'Receber pedidos de conexão',
    seDesligado: 'Ninguém consegue enviar pedido de conexão para a criança.',
    seLigadoSemConfirmar: 'A criança decide sozinha quem aceitar.',
    seLigadoComConfirmar: 'Cada pedido recebido aparece aqui para você aprovar antes de a criança ver.',
  },
  entrarEmSalas: {
    titulo: 'Entrar em salas de estudo',
    seDesligado: 'As salas ficam visíveis, mas a criança não entra em nenhuma.',
    seLigadoSemConfirmar: 'A criança entra em qualquer sala aberta.',
    seLigadoComConfirmar: 'Cada tentativa de entrar vira um pedido aqui, com o nome da sala e quem a conduz.',
  },
  publicarNaComunidade: {
    titulo: 'Publicar na comunidade',
    seDesligado: 'A criança lê a comunidade, mas não publica.',
    seLigadoSemConfirmar: 'As publicações vão direto ao ar.',
    seLigadoComConfirmar: 'Você lê cada publicação antes de ela aparecer para os outros.',
  },
  enviarGravacoes: {
    titulo: 'Enviar gravações',
    seDesligado: 'A criança pratica, mas nada de áudio sai do aparelho.',
    seLigadoSemConfirmar: 'As gravações são enviadas assim que a criança termina.',
    seLigadoComConfirmar: 'Você ouve antes de a gravação ser enviada para avaliação.',
  },
};

// ---------------------------------------------------------------------------
// Perfil infantil
// ---------------------------------------------------------------------------

export interface CredenciaisInfantis {
  /** Nome de usuário escolhido pelo responsável. Único na plataforma. */
  nomeUsuario: string;
  /** PBKDF2-SHA256. A senha em si nunca é guardada. */
  hashSenha: string;
  saltSenha: string;
  iteracoes: number;
  atualizadoEm: ISOTimestamp;
}

export interface PerfilInfantil {
  id: EntityId;
  /** Id do usuário da criança dentro da plataforma. */
  userId: EntityId;
  /**
   * Conta adulta responsável. Obrigatório, sem exceção — é o que torna
   * "criança sem responsável" um estado impossível de representar.
   */
  responsavelUserId: EntityId;
  nomeExibicao: string;
  /** AAAA-MM-DD. Usado para faixa etária, não exibido a terceiros. */
  dataNascimento: string;
  credenciais: CredenciaisInfantis;
  permissoes: PermissoesInfantis;
  criadoEm: ISOTimestamp;
  atualizadoEm: ISOTimestamp;
}

export function idadeEmAnos(dataNascimento: string, referencia = new Date()): number {
  const nasc = new Date(dataNascimento);
  if (Number.isNaN(nasc.getTime())) return 0;
  let idade = referencia.getFullYear() - nasc.getFullYear();
  const mes = referencia.getMonth() - nasc.getMonth();
  if (mes < 0 || (mes === 0 && referencia.getDate() < nasc.getDate())) idade--;
  return idade;
}

// ---------------------------------------------------------------------------
// Solicitações parentais
// ---------------------------------------------------------------------------

export type TipoSolicitacao =
  | 'CONEXAO_ENVIAR'
  | 'CONEXAO_RECEBER'
  | 'SALA_ENTRAR'
  | 'COMUNIDADE_PUBLICAR'
  | 'GRAVACAO_ENVIAR';

export type SituacaoSolicitacao = 'PENDENTE' | 'APROVADA' | 'RECUSADA';

export interface SolicitacaoParental {
  id: EntityId;
  criancaUserId: EntityId;
  responsavelUserId: EntityId;
  tipo: TipoSolicitacao;
  /** Descrição em linguagem comum do que está sendo pedido. */
  resumo: string;
  /** Contexto da decisão: nome da sala, de quem é o pedido, etc. */
  detalhes: Record<string, string>;
  situacao: SituacaoSolicitacao;
  criadaEm: ISOTimestamp;
  decididaEm?: ISOTimestamp;
  motivoRecusa?: string;
}

export const EXPLICACAO_SOLICITACAO: Record<TipoSolicitacao, string> = {
  CONEXAO_ENVIAR:
    'A criança quer enviar um pedido de conexão. Se você aprovar, o pedido sai em nome dela; a outra pessoa ainda precisa aceitar.',
  CONEXAO_RECEBER:
    'Alguém quer se conectar com a criança. Se você recusar, a criança não é notificada e nada aparece para ela.',
  SALA_ENTRAR:
    'A criança quer entrar numa sala de estudo. Salas têm conversa entre participantes — vale conferir quem conduz.',
  COMUNIDADE_PUBLICAR:
    'A criança escreveu uma publicação. Ela só aparece para os outros depois do seu aval.',
  GRAVACAO_ENVIAR:
    'A criança gravou um exercício e quer enviá-lo para avaliação. Sem o seu aval, o áudio não sai do aparelho.',
};

// ---------------------------------------------------------------------------
// O que a criança não alcança
// ---------------------------------------------------------------------------

/**
 * Rotas fechadas em conta infantil.
 *
 * Prefixos, não rotas exatas: `/profile/qualquer-id` precisa cair aqui tanto
 * quanto `/profile`. Um link que chegue por fora — colado, compartilhado,
 * recebido — encontra o mesmo bloqueio, porque a checagem é na navegação e
 * não num botão escondido.
 */
export const ROTAS_BLOQUEADAS_KIDS: readonly string[] = [
  '/profile/network',
  '/profile/',
  '/community',
  '/rooms',
  '/admin',
  '/studio',
];

/**
 * Exceções: rotas que começam com um prefixo bloqueado mas são da própria
 * criança, e por isso continuam abertas.
 */
const EXCECOES_KIDS: readonly string[] = ['/profile', '/profile/edit'];

export function rotaBloqueadaParaKids(rota: string): boolean {
  if (EXCECOES_KIDS.includes(rota)) return false;
  return ROTAS_BLOQUEADAS_KIDS.some((prefixo) =>
    prefixo.endsWith('/') ? rota.startsWith(prefixo) : rota === prefixo || rota.startsWith(`${prefixo}/`)
  );
}

// ---------------------------------------------------------------------------
// Credenciais
// ---------------------------------------------------------------------------

const ITERACOES_PBKDF2 = 210_000;

/**
 * Deriva o hash da senha com PBKDF2-SHA256.
 *
 * LIMITE HONESTO: a plataforma não tem servidor, então o hash mora no
 * armazenamento do navegador. Quem tiver acesso ao aparelho desbloqueado
 * alcança o hash, e o PBKDF2 então só encarece o ataque de dicionário — não
 * o impede. Isso é muito melhor do que senha em texto puro e é o teto do que
 * dá para garantir sem servidor. Está escrito aqui para que ninguém prometa
 * mais do que isso à família.
 */
export async function derivarHashSenha(
  senha: string,
  saltHex?: string
): Promise<{ hash: string; salt: string; iteracoes: number }> {
  const salt = saltHex
    ? Uint8Array.from(saltHex.match(/.{2}/g)!.map((b) => parseInt(b, 16)))
    : crypto.getRandomValues(new Uint8Array(16));

  const chave = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(senha),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: ITERACOES_PBKDF2, hash: 'SHA-256' },
    chave,
    256
  );

  const paraHex = (b: Uint8Array) =>
    Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');

  return {
    hash: paraHex(new Uint8Array(bits)),
    salt: paraHex(salt),
    iteracoes: ITERACOES_PBKDF2,
  };
}

/** Comparação em tempo constante, para não vazar o acerto parcial. */
export function comparacaoSegura(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diferenca = 0;
  for (let i = 0; i < a.length; i++) diferenca |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diferenca === 0;
}

export interface ProblemaCredencial {
  campo: 'nomeUsuario' | 'senha';
  mensagem: string;
}

/**
 * Regras do nome de usuário e da senha.
 *
 * A senha é escolhida pelo responsável e digitada por uma criança. Exigir
 * símbolo e maiúscula aqui produziria senha anotada num papel colado no
 * monitor — o que é pior. O comprimento mínimo é o que de fato protege.
 */
export function validarCredenciais(nomeUsuario: string, senha: string): ProblemaCredencial[] {
  const problemas: ProblemaCredencial[] = [];

  const nome = nomeUsuario.trim();
  if (nome.length < 3) {
    problemas.push({ campo: 'nomeUsuario', mensagem: 'O nome de usuário precisa de pelo menos 3 caracteres.' });
  } else if (nome.length > 24) {
    problemas.push({ campo: 'nomeUsuario', mensagem: 'O nome de usuário pode ter no máximo 24 caracteres.' });
  } else if (!/^[a-z0-9._-]+$/i.test(nome)) {
    problemas.push({
      campo: 'nomeUsuario',
      mensagem: 'Use apenas letras, números, ponto, hífen e sublinhado — sem espaços nem acentos.',
    });
  }

  if (senha.length < 8) {
    problemas.push({ campo: 'senha', mensagem: 'A senha precisa de pelo menos 8 caracteres.' });
  }
  if (senha && nome && senha.toLowerCase().includes(nome.toLowerCase())) {
    problemas.push({ campo: 'senha', mensagem: 'A senha não pode conter o nome de usuário.' });
  }

  return problemas;
}
