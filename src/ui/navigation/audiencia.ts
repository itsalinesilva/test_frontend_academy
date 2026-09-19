/**
 * A quem cada rota serve.
 *
 * O PROBLEMA QUE ISTO RESOLVE
 * ---------------------------
 * A plataforma tinha oitenta telas e nenhuma declaração de audiência. Cada
 * tela decidia sozinha se checava sessão, e trinta e seis checavam — as outras
 * quarenta e quatro mostravam a mesma coisa a quem entrou e a quem nunca
 * entrou. O resultado aparecia em frases como "Ver meus certificados" numa
 * tela aberta por visitante: uma promessa que a tela não pode cumprir.
 *
 * Agora a audiência é **declarada aqui**, num só lugar, e o roteador a
 * respeita. Uma rota nova sem declaração é tratada como pública e aparece na
 * auditoria — o que é o comportamento certo: erra para o lado de não bloquear,
 * e não deixa a omissão passar silenciosa.
 *
 * TRÊS AUDIÊNCIAS
 * ---------------
 * `publica`          qualquer um abre; a tela pode mudar conforme haja sessão
 * `exigeLogin`       sem sessão, leva ao acesso e volta depois
 * `somenteVisitante` quem já entrou não tem o que fazer ali (login, cadastro)
 */

export type Audiencia = 'publica' | 'exigeLogin' | 'somenteVisitante';

export interface RegraDeAudiencia {
  /** Prefixo da rota. A regra mais específica vence. */
  rota: string;
  audiencia: Audiencia;
  /** Por que esta rota é assim. Serve à revisão, não ao runtime. */
  porque: string;
}

export const REGRAS_DE_AUDIENCIA: RegraDeAudiencia[] = [
  // -------------------------------------------------------------- público --
  {
    rota: '/',
    audiencia: 'publica',
    porque: 'A home é a porta: visitante conhece a plataforma, aluno vê o próprio feed.',
  },
  {
    rota: '/academy',
    audiencia: 'publica',
    porque: 'O catálogo precisa ser visível a quem ainda não se matriculou.',
  },
  {
    rota: '/credential',
    audiencia: 'publica',
    porque:
      'Verificar um certificado não pode exigir conta — quem confere é o empregador, não o aluno.',
  },
  {
    rota: '/search',
    audiencia: 'publica',
    porque: 'Busca pública no catálogo público.',
  },
  {
    rota: '/help',
    audiencia: 'publica',
    porque: 'Ajuda serve sobretudo a quem ainda não entrou.',
  },
  { rota: '/worlds', audiencia: 'publica', porque: 'O atlas é acervo, não progresso.' },
  { rota: '/score', audiencia: 'publica', porque: 'Partituras de domínio público são públicas.' },
  {
    rota: '/community',
    audiencia: 'publica',
    porque: 'Ler o fórum é público; escrever exige conta, e isso é decidido dentro da tela.',
  },
  {
    rota: '/design-system',
    audiencia: 'publica',
    porque: 'Catálogo de componentes, ferramenta de quem constrói.',
  },
  { rota: '/notfound', audiencia: 'publica', porque: '404 não escolhe público.' },
  {
    rota: '/overview',
    audiencia: 'publica',
    porque: 'Endereço antigo da raiz; continua abrindo a home.',
  },

  // ------------------------------------------------------- só visitante ---
  {
    rota: '/auth',
    audiencia: 'somenteVisitante',
    porque: 'Quem já entrou não tem o que fazer na tela de entrar.',
  },
  {
    rota: '/onboarding',
    audiencia: 'somenteVisitante',
    porque: 'A apresentação inicial é para quem acabou de chegar.',
  },

  // --------------------------------------------------------- exige login --
  {
    rota: '/academy/meu-aprendizado',
    audiencia: 'exigeLogin',
    porque: 'É o progresso de alguém; sem alguém, não há o que mostrar.',
  },
  {
    rota: '/academy/my-learning',
    audiencia: 'exigeLogin',
    porque: 'Mesma tela, rota antiga.',
  },
  {
    rota: '/academy/history',
    audiencia: 'exigeLogin',
    porque: 'Histórico acadêmico é pessoal.',
  },
  /**
   * Esta herdava "pública" de `/academy`, por prefixo mais longo.
   *
   * Não era descuido de declaração: era vazamento. `/academy/result/<id>`
   * mostrava a nota, a aprovação e o número de certificado de quem tivesse —
   * ou adivinhasse — o identificador. `/academy/certificate` e
   * `/academy/completion` já estavam declaradas; esta tinha ficado de fora.
   *
   * A regra do prefixo mais longo é boa, e é justamente por isso que o que é
   * pessoal precisa se declarar: o silêncio aqui significa "vale o que o pai
   * disser", e o pai é público.
   */
  {
    rota: '/academy/result',
    audiencia: 'exigeLogin',
    porque: 'É a prova de uma pessoa: nota, aprovação e registro.',
  },
  {
    rota: '/academy/certificate',
    audiencia: 'exigeLogin',
    porque: 'Emitir certificado exige aluno; verificar um já emitido é público.',
  },
  {
    rota: '/academy/completion',
    audiencia: 'exigeLogin',
    porque: 'Conclusão de curso pressupõe matrícula.',
  },
  {
    rota: '/practice',
    audiencia: 'exigeLogin',
    porque: 'Prática grava medição em nome de alguém.',
  },
  { rota: '/profile', audiencia: 'exigeLogin', porque: 'Perfil é de quem está logado.' },
  { rota: '/studio', audiencia: 'exigeLogin', porque: 'Estúdio salva projeto em nome do autor.' },
  { rota: '/notifications', audiencia: 'exigeLogin', porque: 'Avisos são de alguém.' },
  { rota: '/settings', audiencia: 'exigeLogin', porque: 'Preferências são de alguém.' },
  { rota: '/rooms', audiencia: 'exigeLogin', porque: 'Salas exigem vínculo.' },
  { rota: '/admin', audiencia: 'exigeLogin', porque: 'Governança exige papel.' },
  { rota: '/kids', audiencia: 'exigeLogin', porque: 'Conta infantil nasce de um perfil parental.' },
  { rota: '/violin', audiencia: 'exigeLogin', porque: 'O simulador grava execução medida.' },
  {
    rota: '/credentials',
    audiencia: 'exigeLogin',
    porque: 'As credenciais do próprio aluno. A verificação pública é /credential.',
  },
];

/**
 * Audiência de uma rota. A regra de prefixo mais longo vence, de modo que
 * `/academy/meu-aprendizado` supere `/academy`.
 *
 * Rota não declarada é pública — e a auditoria acusa a omissão.
 */
export function audienciaDaRota(rota: string): Audiencia {
  let melhor: RegraDeAudiencia | null = null;

  for (const r of REGRAS_DE_AUDIENCIA) {
    const casa = r.rota === '/' ? rota === '/' || rota === '' : rota.startsWith(r.rota);
    if (!casa) continue;
    if (!melhor || r.rota.length > melhor.rota.length) melhor = r;
  }

  return melhor?.audiencia ?? 'publica';
}

/** Rota declarada explicitamente? Usado pela auditoria. */
export function rotaDeclarada(rota: string): boolean {
  return REGRAS_DE_AUDIENCIA.some((r) =>
    r.rota === '/' ? rota === '/' : rota.startsWith(r.rota)
  );
}
