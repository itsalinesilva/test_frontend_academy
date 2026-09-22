import { GraduationCap, Target, Library, Sliders, User, LucideIcon } from 'lucide-react';

/**
 * OS CINCO PILARES — os únicos destinos de primeiro nível da plataforma.
 *
 * 🔴 O DEFEITO QUE ESTE ARQUIVO CORRIGE
 * -------------------------------------
 * Havia **três listas de navegação independentes**: a barra inferior do
 * `AppShell`, o menu do chevron e a `CirculationBar`. Cada uma com itens
 * diferentes, cada uma mantida à mão.
 *
 * O resultado foi o previsível: o **Acervo não estava em nenhuma delas**. A
 * rota existe, é pública, tem ficha de obra e de compositor, e não havia como
 * chegar nela pela interface — nem para quem já entrou.
 *
 * Três listas divergem na primeira tela nova. Uma lista não tem como.
 *
 * O QUE É PILAR E O QUE É SUB-ROTA
 * --------------------------------
 * Pilar é onde a pessoa **vai**; sub-rota é o que ela **faz lá dentro**. O
 * editor de partitura não é um destino: é uma ferramenta do Estúdio. O Atlas
 * não é um destino paralelo ao Acervo: é a **vista de mapa** do mesmo
 * catálogo — os dois leem a mesma verdade, e provado por teste.
 *
 * Uma barra que lista sub-rotas obriga a pessoa a ler o mapa inteiro para
 * achar a sala.
 */

export interface SubRota {
  label: string;
  path: string;
  hint: string;
}

export interface Pilar {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  /** O que se faz ali, em uma linha. Aparece no menu, e não na barra. */
  hint: string;
  /** As telas que vivem DENTRO deste pilar. */
  subRotas: SubRota[];
  /**
   * Só aparece para quem entrou.
   *
   * Perfil é a conta: oferecê-lo a visitante é oferecer uma porta que leva ao
   * pedido de login. A barra de quem chega tem **quatro** destinos, e os
   * quatro abrem.
   */
  exigeSessao?: boolean;
}

/**
 * Os pilares que ESTA pessoa vê.
 *
 * É a única forma de a barra do visitante e a de quem entrou virem da mesma
 * lista. Duas listas divergiriam — foi assim que o Acervo se perdeu.
 */
export function pilaresVisiveis(temSessao: boolean): Pilar[] {
  return PILARES.filter((p) => !p.exigeSessao || temSessao);
}

export const PILARES: Pilar[] = [
  {
    id: 'academia',
    label: 'Academia',
    path: '/academia',
    icon: GraduationCap,
    hint: 'Cursos, programas e lições',
    subRotas: [
      /**
       * 🔴 OS DOIS ESTAVAM MORTOS, e em português inventado.
       *
       * A barra apontava para `/academia/catalogo` e `/academia/grade`; o
       * outlet atende `/academia/catalog` e `/academia/meu-aprendizado`. Os
       * dois links da barra principal caíam em "não encontrado".
       *
       * A causa é a mesma do `/practice/daily`: sub-rota de pilar é **dado**,
       * e o verificador de destino lê **código**. Dado que vira caminho agora
       * tem prova própria, em `tests/ui/pilares-sub-rotas.test.tsx`.
       */
      { label: 'Catálogo de cursos', path: '/academia/catalog', hint: 'Tudo que se pode estudar' },
      {
        label: 'Minha grade',
        path: '/academia/meu-aprendizado',
        hint: 'O que você cursa agora',
      },
    ],
  },
  {
    id: 'laboratorio',
    label: 'Laboratório',
    path: '/practice',
    icon: Target,
    hint: 'Treino com medição real',
    subRotas: [
      /**
       * 🔴 ERA `/practice/daily`, E NINGUÉM SERVIA ESSA ROTA.
       *
       * O outlet atende `/practice/daily-goal`. O link da barra levava a uma
       * tela que não existe — e o verificador de destino de navegação não
       * pegou, porque ele lê chamadas `navigate('...')` literais, e a sub-rota
       * de um pilar é **dado**, não chamada.
       *
       * Link morto na barra principal é pior que o de dentro de uma tela: é o
       * primeiro que alguém clica.
       */
      { label: 'Meta do dia', path: '/practice/daily-goal', hint: 'O que praticar hoje' },
      { label: 'Liga', path: '/practice/league', hint: 'A tabela da semana' },
      /**
       * 🔴 CINCO TELAS CONSTRUÍDAS E INALCANÇÁVEIS.
       *
       * Ranking, defensiva, perfil de prática, matrícula e medidores existiam
       * com rota no outlet e **nenhum link em lugar nenhum**. Não davam erro,
       * não quebravam nada: simplesmente ninguém chegava nelas.
       *
       * O verificador de tela órfã não pegava, porque ele pergunta "existe rota
       * que monta esta tela?" — e existia. A pergunta que faltava era a
       * inversa, e agora ela está em `audit-routes.mjs`.
       */
      { label: 'Classificação', path: '/practice/ranking', hint: 'A tabela completa' },
      { label: 'Defensiva', path: '/practice/streak', hint: 'A sequência de dias' },
      { label: 'Perfil de prática', path: '/practice/profile', hint: 'O que já foi medido' },
      { label: 'Matrícula', path: '/practice/enrollment', hint: 'Entrar numa trilha' },
      /**
       * O simulador de violino é uma das ferramentas maiores da plataforma, e
       * estava sem porta nenhuma. Ele grava execução medida, e por isso a rota
       * `/violin` exige nome — mas exigir nome nunca foi o mesmo que esconder.
       */
      { label: 'Simulador de violino', path: '/violin/simulator', hint: 'Tocar e ser medido' },
    ],
  },
  {
    /**
     * O ACERVO ENTRA NA BARRA, e é a correção mais direta deste arquivo.
     *
     * Vinte e quatro mil novecentas e cinquenta e sete obras, duzentas e
     * trinta e quatro pessoas, mil trezentas e quarenta e nove partituras — e
     * nenhuma porta. A rota é pública desde o início e não estava em lista de
     * navegação nenhuma.
     */
    id: 'acervo',
    label: 'Acervo',
    path: '/acervo',
    icon: Library,
    hint: 'A biblioteca: obras, pessoas e partituras',
    subRotas: [
      {
        label: 'Atlas',
        path: '/worlds',
        hint: 'O mesmo catálogo, visto como mapa',
      },
    ],
  },
  {
    id: 'estudio',
    label: 'Estúdio',
    path: '/studio',
    icon: Sliders,
    hint: 'Editar, gravar e sintetizar',
    subRotas: [
      {
        /**
         * O editor de partitura era um PILAR, ao lado do Estúdio. São a mesma
         * sala: um edita notação, o outro edita som. Separá-los na barra
         * gastava um dos cinco lugares e deixava o Acervo de fora.
         */
        label: 'Editor de partitura',
        path: '/score',
        hint: 'Notação e repertório',
      },
    ],
  },
  {
    id: 'perfil',
    label: 'Perfil',
    exigeSessao: true,
    path: '/profile',
    icon: User,
    hint: 'Seus dados, portfólio e credenciais',
    subRotas: [
      { label: 'Comunidade', path: '/community', hint: 'Fórum e eventos' },
      { label: 'Notificações', path: '/notifications', hint: 'Seus avisos' },
    ],
  },
];

/** O pilar a que uma rota pertence — para a barra saber o que destacar. */
export function pilarDaRota(path: string): Pilar | undefined {
  return PILARES.find(
    (p) =>
      path === p.path ||
      path.startsWith(p.path + '/') ||
      p.subRotas.some((s) => path === s.path || path.startsWith(s.path + '/'))
  );
}
