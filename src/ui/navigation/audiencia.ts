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
 * QUATRO AUDIÊNCIAS
 * -----------------
 * `publica`          qualquer um abre; a tela pode mudar conforme haja sessão
 * `exigeLogin`       sem sessão, leva ao acesso e volta depois
 * `somenteVisitante` quem já entrou não tem o que fazer ali (login, cadastro)
 * `exigeAdmin`       exige outorga administrativa **assinada pelo servidor**
 *
 * POR QUE `exigeAdmin` PASSOU A EXISTIR
 * -------------------------------------
 * A rota administrativa chamava-se `/admin` e estava declarada aqui como `exigeLogin`, e quem de fato barrava o
 * aluno comum era um efeito no `AppRouterOutlet`, chamando
 * `authService.checkRouteAccess`. A proteção funcionava — mas a **hierarquia
 * estava partida em dois sistemas**: um declarativo, que a auditoria lê, e um
 * imperativo, que ela não lê.
 *
 * Duas fontes de verdade sobre quem alcança o quê divergem na primeira rota
 * nova. Uma tela administrativa fora do prefixo dela não seria protegida
 * por ninguém, e a tabela continuaria dizendo que estava tudo certo.
 *
 * Agora a declaração é a fonte, a guarda a aplica, e `checkRouteAccess`
 * continua como segunda camada — defesa em profundidade, e não verdade
 * concorrente. `scripts/qa/security.mjs` falha se as duas discordarem.
 *
 * A OUTORGA NUNCA VEM DO CLIENTE
 * ------------------------------
 * `isAdmin` é campo da sessão que o servidor assinou a partir da allowlist em
 * variável de ambiente. Nunca de `user.primaryRole`, nunca de comparação de
 * e-mail no cliente. Foi assim que a auditoria S-02 encontrou a plataforma, e
 * é a conclusão que não pode voltar: quem editasse o `localStorage` viraria
 * administrador.
 */

export type Audiencia = 'publica' | 'exigeLogin' | 'somenteVisitante' | 'exigeAdmin';

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
    rota: '/academia',
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
  {
    rota: '/acervo',
    audiencia: 'publica',
    porque:
      'Catálogo de instituição acadêmica. É a cara pública do Conservatório, e esconder o que existe só afastaria quem procura.',
  },
  {
    rota: '/acervo/artigo',
    audiencia: 'publica',
    porque: 'Artigo do Conservatório é texto aberto, e é o que mostra o que a escola pensa.',
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
    audiencia: 'exigeAdmin',
    porque:
      'Catálogo de componentes, ferramenta de quem constrói. Público, abria em produção a vitrine interna a qualquer um (AUD-2).',
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
    rota: '/academia/meu-aprendizado',
    audiencia: 'exigeLogin',
    porque: 'É o progresso de alguém; sem alguém, não há o que mostrar.',
  },
  {
    rota: '/academia/my-learning',
    audiencia: 'exigeLogin',
    porque: 'Mesma tela, rota antiga.',
  },
  {
    rota: '/academia/history',
    audiencia: 'exigeLogin',
    porque: 'Histórico acadêmico é pessoal.',
  },
  {
    rota: '/academia/academic-profile',
    audiencia: 'exigeLogin',
    porque:
      'É o boletim de alguém. Herdava "pública" de /academia e dizia ao visitante "Membro Oficial • Identidade Auditada" (AUD-3).',
  },
  /**
   * Esta herdava "pública" de `/academia`, por prefixo mais longo.
   *
   * Não era descuido de declaração: era vazamento. `/academia/result/<id>`
   * mostrava a nota, a aprovação e o número de certificado de quem tivesse —
   * ou adivinhasse — o identificador. `/academia/certificate` e
   * `/academia/completion` já estavam declaradas; esta tinha ficado de fora.
   *
   * A regra do prefixo mais longo é boa, e é justamente por isso que o que é
   * pessoal precisa se declarar: o silêncio aqui significa "vale o que o pai
   * disser", e o pai é público.
   */
  {
    rota: '/academia/result',
    audiencia: 'exigeLogin',
    porque: 'É a prova de uma pessoa: nota, aprovação e registro.',
  },
  {
    rota: '/academia/certificate',
    audiencia: 'exigeLogin',
    porque: 'Emitir certificado exige aluno; verificar um já emitido é público.',
  },
  {
    rota: '/academia/completion',
    audiencia: 'exigeLogin',
    porque: 'Conclusão de curso pressupõe matrícula.',
  },
  {
    /**
     * 🔴 O LABORATÓRIO ESTAVA FECHADO PARA QUEM CHEGA.
     *
     * A rota exigia login, e o visitante batia na porta — não havia conteúdo
     * dele. Uma escola que não deixa ver a aula antes de matricular perde quem
     * ia se matricular.
     *
     * O que fechava era a **medição**, e ela continua fechada: ofensiva, XP e
     * histórico só existem para quem tem nome. O treino em si é síntese local e
     * roda para qualquer um.
     *
     * É o mesmo desenho do Atlas, que já é público: a tela mostra o que faz, e
     * o que pertence a alguém fica atrás do convite.
     */
    rota: '/practice',
    audiencia: 'publica',
    porque: 'O treino é síntese local. A medição, que exige nome, fica atrás do convite.',
  },
  { rota: '/profile', audiencia: 'exigeLogin', porque: 'Perfil é de quem está logado.' },
  {
    rota: '/studio',
    audiencia: 'publica',
    porque:
      'As ferramentas funcionam sem conta (afinar, escrever, gravar, exportar); só GUARDAR pede nome, e isso cada tela decide. Declarado exigeLogin, escondia o convite que as telas mostram ao visitante (AUD-1).',
  },
  { rota: '/notifications', audiencia: 'exigeLogin', porque: 'Avisos são de alguém.' },
  { rota: '/settings', audiencia: 'exigeLogin', porque: 'Preferências são de alguém.' },
  { rota: '/rooms', audiencia: 'exigeLogin', porque: 'Salas exigem vínculo.' },
  {
    rota: '/founder',
    audiencia: 'exigeAdmin',
    porque: 'Governança exige outorga administrativa assinada pelo servidor.',
  },
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
 * `/academia/meu-aprendizado` supere `/academia`.
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
