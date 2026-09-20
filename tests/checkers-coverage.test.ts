import { describe, it, expect, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  checkerInventory,
  clearInjectedSources,
  injectFile,
  injectSources,
} from '../scripts/qa/core.mjs';
import * as fluxo from '../scripts/qa/flow.mjs';
import * as seguranca from '../scripts/qa/security.mjs';
import * as texto from '../scripts/qa/text.mjs';
import * as economia from '../scripts/qa/economy.mjs';
import * as instituicao from '../scripts/qa/institution.mjs';

/**
 * Cobertura de ponta a ponta de cada sinal.
 *
 * O QUE A VERSÃO ANTERIOR PROVAVA, E O QUE NÃO PROVAVA
 * ----------------------------------------------------
 * A tabela anterior injetava **um** defeito por verificador e exigia a
 * acusação. Isso prova uma coisa só, e é pouco: que o verificador não nasceu
 * vazio.
 *
 * Não prova cobertura. Um verificador que acusa `alert()` e é cego a todas as
 * outras formas de botão morto passa naquela tabela — e continua deixando
 * passar o defeito na maior parte das vezes em que ele aparece.
 *
 * O QUE ESTA TABELA EXIGE
 * -----------------------
 * Para cada sinal, três coisas:
 *
 *   **variantes** — as formas diferentes em que o defeito aparece na vida
 *   real. Não uma: todas as que conhecemos.
 *
 *   **limpos** — código correto que se parece com o defeito. Verificador que
 *   acusa código certo é pior que verificador ausente: ensina a ignorá-lo, e
 *   aí ele deixa de servir para o caso verdadeiro.
 *
 *   **limites** — o que ele provavadamente NÃO vê, escrito. Limite declarado é
 *   informação; limite escondido é a falsa sensação de cobertura que fez
 *   `checkNavigationTargets` ficar verde por meses sendo incapaz de acusar.
 */

interface Sinal {
  nome: string;
  rodar: () => { file: string; detail?: string }[];
  /**
   * As formas conhecidas do defeito. Todas precisam ser vistas.
   *
   * `extras` existe para o sinal que so aparece com mais de um arquivo:
   * colisao de chave precisa de DOIS repositorios declarando a mesma, e um
   * fixture sozinho nunca a produziria.
   */
  variantes: { como: string; file: string; content: string; extras?: { file: string; content: string }[] }[];
  /** Código correto que se parece com o defeito. Nenhum pode ser acusado. */
  limpos: { como: string; file: string; content: string }[];
  /** O que este verificador não alcança. Declarado, nunca escondido. */
  limites: string[];
}

const SINAIS: Sinal[] = [
  {
    nome: 'checkDeadButton',
    rodar: fluxo.checkDeadButton,
    variantes: [
      {
        como: 'alert() no lugar da ação',
        file: 'src/ui/screens/a/A1Screen.tsx',
        content: `export const A = () => <button onClick={() => alert('faria isso')}>Ir</button>;`,
      },
      {
        como: 'corpo vazio',
        file: 'src/ui/screens/a/A2Screen.tsx',
        content: `export const B = () => <button onClick={() => {}}>Ir</button>;`,
      },
      {
        como: 'handler vazio em objeto de ação',
        file: 'src/ui/screens/a/A3Screen.tsx',
        content: `const acao = { label: 'Salvar', onAction: () => {} };`,
      },
      {
        como: 'confirm() decidindo sozinho',
        file: 'src/ui/screens/a/A4Screen.tsx',
        content: `export const D = () => <button onClick={() => confirm('apagar?')}>Apagar</button>;`,
      },
    ],
    limpos: [
      {
        como: 'ação que navega',
        file: 'src/ui/screens/a/B1Screen.tsx',
        content: `export const E = () => <button onClick={() => navigate('/academia')}>Ir</button>;`,
      },
      {
        como: 'ação que chama serviço',
        file: 'src/ui/screens/a/B2Screen.tsx',
        content: `export const F = () => <button onClick={() => academyService.enroll(id)}>Entrar</button>;`,
      },
      {
        como: 'ação que muda estado',
        file: 'src/ui/screens/a/B3Screen.tsx',
        content: `export const G = () => <button onClick={() => setAberto(true)}>Abrir</button>;`,
      },
    ],
    limites: [
      'handler que chama uma função que por sua vez não faz nada',
      'ação passada por props de um componente pai',
    ],
  },

  {
    nome: 'checkHardcodedMetric',
    rodar: fluxo.checkHardcodedMetric,
    variantes: [
      {
        como: 'número com separador de milhar',
        file: 'src/ui/screens/m/M1Screen.tsx',
        content: `export const A = () => <p className="text-2xl">8.920</p>;`,
      },
      {
        como: 'porcentagem cravada',
        file: 'src/ui/screens/m/M2Screen.tsx',
        content: `export const B = () => <span className="text-xl">87%</span>;`,
      },
      {
        como: 'razão com percentual',
        file: 'src/ui/screens/m/M3Screen.tsx',
        content: `export const C = () => <p className="font-bold">4/4 (100%)</p>;`,
      },
      {
        como: 'inteiro sob rótulo de medida',
        file: 'src/ui/screens/m/M4Screen.tsx',
        content: [
          `export const D = () => (`,
          `  <div>`,
          `    <span className="text-xs text-stone-500 uppercase">Salas ativas</span>`,
          `    <p>42</p>`,
          `  </div>`,
          `);`,
        ].join('\n'),
      },
    ],
    limpos: [
      {
        como: 'número vindo de variável',
        file: 'src/ui/screens/m/N1Screen.tsx',
        content: `export const E = () => <p className="text-2xl">{medidas.usuarios}</p>;`,
      },
      {
        como: 'inteiro sem rótulo de medida por perto',
        file: 'src/ui/screens/m/N2Screen.tsx',
        content: `export const F = () => <li>3</li>;`,
      },
      {
        como: 'texto que contém número',
        file: 'src/ui/screens/m/N3Screen.tsx',
        content: `export const G = () => <p>São 5 dias seguidos até aqui</p>;`,
      },
    ],
    limites: [
      'número montado por interpolação de constante cravada',
      'medida dentro de atributo, como um title ou aria-label',
    ],
  },

  {
    nome: 'checkPersonalSectionWithoutSession',
    rodar: fluxo.checkPersonalSectionWithoutSession,
    variantes: [
      {
        como: 'possessivo em título',
        file: 'src/ui/screens/academy/P1Screen.tsx',
        content: `export const A = () => <h2>Seu progresso</h2>;`,
      },
      {
        como: 'primeira pessoa',
        file: 'src/ui/screens/academy/P2Screen.tsx',
        content: `export const B = () => <h2>Minhas conquistas</h2>;`,
      },
      {
        como: 'plural',
        file: 'src/ui/screens/worlds/P3Screen.tsx',
        content: `export const C = () => <h3>Seus certificados</h3>;`,
      },
    ],
    limpos: [
      {
        como: 'tela que consulta a sessão',
        file: 'src/ui/screens/academy/Q1Screen.tsx',
        content: [
          `export const D = () => {`,
          `  const { userId } = useCurrentUser();`,
          `  return <h2>Seu progresso</h2>;`,
          `};`,
        ].join('\n'),
      },
      {
        /**
         * O nome do arquivo NAO e decorativo aqui.
         *
         * O verificador liga tela a rota pelo nome do componente, que e como o
         * outlet as amarra. `AcademicHistoryScreen` esta em `/academia/history`,
         * declarada `exigeLogin`. Atras da guarda, o possessivo tem sujeito: a
         * sessao ja foi respondida antes da tela montar.
         *
         * A versao anterior deste caso usava `Q2Screen` numa pasta `profile` e
         * AFIRMAVA exigir login sem nunca registrar rota nenhuma. O verificador
         * a acusou, e estava certo: pasta nao e prova. Quem mentia era o teste.
         */
        como: 'tela atras de rota que exige login',
        file: 'src/ui/screens/_prova/AcademicHistoryScreen.tsx',
        content: `export const E = () => <h2>Seu histórico</h2>;`,
      },
      {
        como: 'texto sem possessivo',
        file: 'src/ui/screens/academy/Q3Screen.tsx',
        content: `export const F = () => <h2>Progresso das turmas</h2>;`,
      },
    ],
    limites: [
      'possessivo montado por interpolação',
      'possessivo em componente compartilhado, longe da tela',
      'tela SEM rota no outlet e tratada como alcancavel por visitante — falha alto de proposito: sem rota declarada nao ha protecao provada',
    ],
  },

  {
    nome: 'checkRecordOwnership',
    rodar: seguranca.checkRecordOwnership,
    variantes: [
      {
        como: 'submissão por id',
        file: 'src/services/application/o1.service.ts',
        content: `  public async getThing(id: string): Promise<AssessmentSubmission | null> { return null; }`,
      },
      {
        como: 'certificado por id',
        file: 'src/services/application/o2.service.ts',
        content: `  public async findIt(code: string): Promise<AcademicCertificateRecord | null> { return null; }`,
      },
      {
        como: 'tentativa por id',
        file: 'src/services/application/o3.service.ts',
        content: `  public async load(attemptId: string): Promise<ExerciseAttempt | null> { return null; }`,
      },
    ],
    limpos: [
      {
        como: 'já recebe userId',
        file: 'src/services/application/p1.service.ts',
        content: `  public async getThing(id: string, userId: string): Promise<AssessmentSubmission | null> { return null; }`,
      },
      {
        como: 'devolve algo que não é registro de pessoa',
        file: 'src/services/application/p2.service.ts',
        content: `  public async getCourse(id: string): Promise<AcademyCourse | null> { return null; }`,
      },
      {
        como: 'fora da camada de serviço',
        file: 'src/domain/p3.ts',
        content: `  public async getThing(id: string): Promise<AssessmentSubmission | null> { return null; }`,
      },
    ],
    limites: [
      'método que recebe userId e não o usa para conferir o dono',
      'leitura feita direto no repositório, sem passar por serviço',
    ],
  },

  {
    nome: 'checkEnglishLeakInSentence',
    rodar: texto.checkEnglishLeakInSentence,
    variantes: [
      {
        como: 'substantivo trocado no meio da frase',
        file: 'src/ui/components/i/I1.tsx',
        content: `export const A = () => <p>Sair e perder o progress</p>;`,
      },
      {
        como: 'no meio de frase com acento',
        file: 'src/ui/components/i/I2.tsx',
        content: `export const B = () => <span>A classificação é por week</span>;`,
      },
      {
        como: 'dentro de elemento de ênfase',
        file: 'src/ui/components/i/I3.tsx',
        content: `export const C = () => <strong>sua tier atual</strong>;`,
      },
    ],
    limpos: [
      {
        como: 'frase inteiramente em português',
        file: 'src/ui/components/i/J1.tsx',
        content: `export const D = () => <p>Sair e perder o progresso da lição</p>;`,
      },
      {
        como: 'identificador em expressão, não em prosa',
        file: 'src/ui/components/i/J2.tsx',
        content: `export const E = () => <p>{progress} por cento</p>;`,
      },
      {
        como: 'termo técnico sozinho, sem frase portuguesa',
        file: 'src/ui/components/i/J3.tsx',
        content: `export const F = () => <code>progress</code>;`,
      },
    ],
    limites: [
      'palavra inglesa fora da lista conhecida',
      'texto montado por interpolação de variável',
    ],
  },

  {
    nome: 'checkRetiredVocabulary',
    rodar: fluxo.checkRetiredVocabulary,
    variantes: [
      {
        como: 'identificador com sufixo',
        file: 'src/domain/v1.ts',
        content: `export const triboId = 'x';`,
      },
      {
        como: 'propriedade de objeto',
        file: 'src/domain/v2.ts',
        content: `const registro = { tribo: 'violinistas' };`,
      },
      {
        como: 'palavra anterior ainda mais antiga',
        file: 'src/domain/v3.ts',
        content: `const ilhaId = 'x';`,
      },
    ],
    limpos: [
      {
        como: 'comentário que EXPLICA a remoção',
        file: 'src/domain/w1.ts',
        content: `/** Isto se chamava tribo, e ilha antes disso. Ver 80. */\nexport const casa = 'x';`,
      },
      {
        como: 'o termo novo',
        file: 'src/domain/w2.ts',
        content: `export const houseId = 'x';`,
      },
      {
        como: 'palavra que apenas contém a sequência',
        file: 'src/domain/w3.ts',
        content: `export const distribuicao = 'x';`,
      },
    ],
    limites: ['termo aposentado dentro de string de dado, como um identificador semeado'],
  },
  {
    nome: 'checkPerUserFilter',
    rodar: seguranca.checkPerUserFilter,
    variantes: [
      {
        como: 'devolve a lista inteira sem olhar o dono',
        file: 'src/repositories/v1.repository.ts',
        content: [
          `export class R {`,
          `  public async listProgress(userId: string): Promise<unknown[]> {`,
          `    const todos = this.storage.get(this.STORAGE_KEYS.PROGRESS) || [];`,
          `    return todos;`,
          `  }`,
          `}`,
        ].join('\n'),
      },
      {
        como: 'busca tentativa de prova de qualquer um',
        file: 'src/repositories/v2.repository.ts',
        content: [
          `export class R {`,
          `  public async findAttempt(userId: string, id: string): Promise<unknown> {`,
          `    const todas = this.storage.get(this.STORAGE_KEYS.ATTEMPTS) || [];`,
          `    return todas.find((a) => a.id === id);`,
          `  }`,
          `}`,
        ].join('\n'),
      },
      {
        como: 'ordena o placar de todo mundo',
        file: 'src/repositories/v3.repository.ts',
        content: [
          `export class R {`,
          `  public async getLeaderboard(userId: string): Promise<unknown[]> {`,
          `    const linhas = this.storage.get(this.STORAGE_KEYS.LEADERBOARD) || [];`,
          `    return linhas.sort((a, b) => b.xp - a.xp);`,
          `  }`,
          `}`,
        ].join('\n'),
      },
    ],
    limpos: [
      {
        como: 'filtra por dono com comparacao estrita',
        file: 'src/repositories/w1.repository.ts',
        content: [
          `export class R {`,
          `  public async listProgress(userId: string): Promise<unknown[]> {`,
          `    const todos = this.storage.get(this.STORAGE_KEYS.PROGRESS) || [];`,
          `    return todos.filter((p) => p.userId === userId);`,
          `  }`,
          `}`,
        ].join('\n'),
      },
      {
        como: 'endereca o dono por chave de mapa',
        file: 'src/repositories/w2.repository.ts',
        content: [
          `export class R {`,
          `  public async getStreak(userId: string): Promise<unknown> {`,
          `    const mapa = this.storage.get(this.STORAGE_KEYS.STREAK) || {};`,
          `    return mapa[userId] ?? null;`,
          `  }`,
          `}`,
        ].join('\n'),
      },
      {
        /**
         * Gravar nao precisa filtrar leitura: precisa enderecar o dono, e quem
         * cobra isso e outro verificador. Acusar aqui seria falso positivo.
         */
        como: 'metodo de escrita, que nao le',
        file: 'src/repositories/w3.repository.ts',
        content: [
          `export class R {`,
          `  public async saveProgress(userId: string, p: unknown): Promise<void> {`,
          `    const todos = this.storage.get(this.STORAGE_KEYS.PROGRESS) || [];`,
          `    this.storage.set(this.STORAGE_KEYS.PROGRESS, [...todos, p]);`,
          `  }`,
          `}`,
        ].join('\n'),
      },
    ],
    limites: [
      'metodo cujo corpo nao fecha em dois espacos de indentacao escapa da varredura',
      'filtro feito por funcao auxiliar externa ao metodo nao e reconhecido como filtro',
      'so olha src/repositories — servico que le armazenamento direto passa por outro sinal',
    ],
  },

  {
    nome: 'checkAdminAuthority',
    rodar: seguranca.checkAdminAuthority,
    variantes: [
      {
        como: 'e-mail pessoal cravado no cliente',
        file: 'src/ui/screens/b/B1Screen.tsx',
        content: `const dona = 'fundadora@gmail.com';`,
      },
      {
        como: 'privilegio decidido por comparacao de papel dentro de if',
        file: 'src/ui/screens/b/B2Screen.tsx',
        content: `if (user.role === 'ADMIN') { mostrarConsole(); }`,
      },
      {
        como: 'privilegio decidido antes de um && que renderiza',
        file: 'src/ui/screens/b/B3Screen.tsx',
        content: `export const C = () => <>{user.role === 'ADMIN' && <PainelSecreto />}</>;`,
      },
    ],
    limpos: [
      {
        /**
         * O selo e exibicao dentro de console que a sessao ja protegeu.
         * Ninguem vira administrador por pintar um Badge.
         */
        como: 'selo que apenas exibe o papel',
        file: 'src/ui/screens/c/C1Screen.tsx',
        content: `export const D = () => <Badge variant={papelDoUsuario}>{papelDoUsuario}</Badge>;`,
      },
      {
        como: 'concessao lida da sessao assinada pelo servidor',
        file: 'src/ui/screens/c/C2Screen.tsx',
        content: `const podeAdministrar = sessao.isAdmin === true;`,
      },
      {
        como: 'e-mail de dominio institucional em texto de contato',
        file: 'src/ui/screens/c/C3Screen.tsx',
        content: `export const E = () => <a href="mailto:contato@muscicapa.org">Fale conosco</a>;`,
      },
    ],
    limites: [
      'e-mail montado por concatenacao de pedacos nao e visto como literal',
      'comparacao de papel guardada antes numa variavel intermediaria escapa do padrao',
      'auth.service.ts e isento de proposito: e quem LE a concessao que o servidor assinou',
    ],
  },

  {
    nome: 'checkConsoleLeak',
    rodar: seguranca.checkConsoleLeak,
    variantes: [
      {
        como: 'imprime o endereco da sessao',
        file: 'src/services/application/d1.service.ts',
        content: `console.log('estado', session.user.email);`,
      },
      {
        como: 'imprime o perfil em aviso',
        file: 'src/services/application/d2.service.ts',
        content: `console.warn('cadastro incompleto', profile);`,
      },
      {
        como: 'imprime credencial em erro',
        file: 'src/services/application/d3.service.ts',
        content: `console.error('falhou', idToken);`,
      },
    ],
    limpos: [
      {
        /**
         * A palavra esta no TEXTO FIXO, nao no argumento. Tirar os literais
         * antes de testar e o que separa um caso do outro.
         */
        como: 'palavra sensivel apenas na mensagem fixa',
        file: 'src/services/application/e1.service.ts',
        content: `console.error('Falha ao carregar o perfil do usuario', err);`,
      },
      {
        como: 'imprime contagem, nao pessoa',
        file: 'src/services/application/e2.service.ts',
        content: `console.info('itens carregados', lista.length);`,
      },
      {
        como: 'imprime identificador tecnico sem dado pessoal',
        file: 'src/services/application/e3.service.ts',
        content: `console.debug('rota montada', caminho);`,
      },
    ],
    limites: [
      'console cujo argumento ocupa mais de uma linha nao e alcancado pelo padrao',
      'apelido de variavel sem palavra sensivel no nome carrega o dado sem ser visto',
      'nao distingue ambiente: console legitimo de desenvolvimento cai no mesmo sinal',
    ],
  },

  {
    nome: 'checkHtmlInjection',
    rodar: seguranca.checkHtmlInjection,
    variantes: [
      {
        como: 'dangerouslySetInnerHTML com texto de fora',
        file: 'src/ui/components/f/F1.tsx',
        content: `export const A = () => <div dangerouslySetInnerHTML={{ __html: texto }} />;`,
      },
      {
        como: 'atribuicao direta a innerHTML',
        file: 'src/ui/components/f/F2.tsx',
        content: `elemento.innerHTML = conteudoDoAluno;`,
      },
      {
        como: 'avaliacao dinamica de codigo',
        file: 'src/ui/components/f/F3.tsx',
        content: `const r = new Function('a', 'return a')(entrada);`,
      },
    ],
    limpos: [
      {
        como: 'texto entregue como filho de JSX, que o React escapa',
        file: 'src/ui/components/g/G1.tsx',
        content: `export const B = () => <div>{texto}</div>;`,
      },
      {
        como: 'limpeza de elemento com string vazia',
        file: 'src/ui/components/g/G2.tsx',
        content: `elemento.innerHTML = '';`,
      },
      {
        como: 'escrita de texto puro, sem interpretar marcacao',
        file: 'src/ui/components/g/G3.tsx',
        content: `elemento.textContent = conteudoDoAluno;`,
      },
    ],
    limites: [
      'nao sabe se a entrada ja foi sanitizada antes de chegar ali: acusa o uso, nao a origem',
      'setAttribute com nome de atributo montado em tempo de execucao nao e coberto',
      'href com esquema javascript: escapa deste sinal por completo',
    ],
  },

  {
    nome: 'checkNoGuessableAdminRoute',
    rodar: seguranca.checkNoGuessableAdminRoute,
    variantes: [
      {
        como: 'rota com barra depois',
        file: 'src/ui/navigation/h1.ts',
        content: `const rota = '/admin/users';`,
      },
      {
        como: 'rota exata, sem segmento seguinte',
        file: 'src/ui/navigation/h2.ts',
        content: `navigate('/admin');`,
      },
      {
        como: 'rota com parametro de consulta',
        file: 'src/ui/navigation/h3.ts',
        content: `const alvo = '/admin?aba=logs';`,
      },
    ],
    limpos: [
      {
        como: 'a rota administrativa de verdade',
        file: 'src/ui/navigation/i1.ts',
        content: `const rota = '/founder/users';`,
      },
      {
        /**
         * `/administracao` comeca com as mesmas letras. Sem a exigencia do
         * caractere seguinte, seria acusada — e nao e a rota de ninguem.
         */
        como: 'palavra em portugues que comeca igual',
        file: 'src/ui/navigation/i2.ts',
        content: `const titulo = '/administracao-do-conservatorio';`,
      },
      {
        como: 'caminho de import, que nao e rota',
        file: 'src/ui/navigation/i3.ts',
        content: `import { X } from './admin/painel';`,
      },
    ],
    limites: [
      'rota montada por concatenacao ou por template nao aparece como literal',
      'nao cobre outros nomes obvios de console: /painel, /dashboard, /root',
      'so olha o codigo: rota servida por configuracao de hospedagem escapa',
    ],
  },

  {
    nome: 'checkTechnicalNameInUi',
    rodar: seguranca.checkTechnicalNameInUi,
    variantes: [
      {
        como: 'nome tecnico em rotulo de menu',
        file: 'src/ui/components/j/J1.tsx',
        content: `const item = { label: 'Academy' };`,
      },
      {
        como: 'nome tecnico em titulo de tela',
        file: 'src/ui/components/j/J2.tsx',
        content: `const cabecalho = { title: 'Practice' };`,
      },
      {
        como: 'nome tecnico como texto solto de JSX',
        file: 'src/ui/components/j/J3.tsx',
        content: `export const A = () => <h2>Academy</h2>;`,
      },
    ],
    limpos: [
      {
        como: 'o nome em portugues, que e o certo',
        file: 'src/ui/components/k/K1.tsx',
        content: `const item = { label: 'Academia' };`,
      },
      {
        /**
         * Fora de rotulo, o nome e IDENTIFICADOR: rota, componente, chave.
         * Renomear isso seria trocar arquitetura por traducao.
         */
        como: 'o nome como identificador, e nao como texto',
        file: 'src/ui/components/k/K2.tsx',
        content: `import { PracticeHomeScreen } from '../screens/practice/PracticeHomeScreen';`,
      },
      {
        como: 'o nome dentro de arquivo fora da camada de interface',
        file: 'src/domain/k3.ts',
        content: `export const PRACTICE_ID = 'practice';`,
      },
    ],
    limites: [
      'rotulo montado por interpolacao ou vindo de arquivo de traducao nao e visto',
      'a lista tem dois nomes apenas, Academy e Practice, e cresce a mao',
      'o catalogo do design system e isento: ali o nome tecnico e o proprio assunto',
    ],
  },

  {
    nome: 'checkNavigationTargets',
    rodar: fluxo.checkNavigationTargets,
    variantes: [
      {
        como: 'rota que nao existe em lugar nenhum',
        file: 'src/ui/screens/n/N1Screen.tsx',
        content: `const ir = () => navigate('/rota-que-nunca-foi-servida');`,
      },
      {
        /**
         * Foi ESTE o defeito real: os convites de visitante que eu mesma
         * escrevi mandavam para `/auth`, e o outlet serve `/auth/login` e
         * `/auth/register`. Pai nao servido nao vira prefixo de filho servido.
         */
        como: 'segmento pai que so existe como prefixo dos filhos',
        file: 'src/ui/screens/n/N2Screen.tsx',
        content: `const entrar = () => navigate('/auth');`,
      },
      {
        como: 'rota com erro de digitacao proximo de uma que existe',
        file: 'src/ui/screens/n/N3Screen.tsx',
        content: `const ir = () => navigate('/academiaa/history');`,
      },
    ],
    limpos: [
      {
        como: 'rota servida exatamente como escrita',
        file: 'src/ui/screens/o/O1Screen.tsx',
        content: `const ir = () => navigate('/practice');`,
      },
      {
        como: 'raiz, que e sempre servida',
        file: 'src/ui/screens/o/O2Screen.tsx',
        content: `const ir = () => navigate('/');`,
      },
      {
        como: 'rota servida por prefixo, com identificador no fim',
        file: 'src/ui/screens/o/O3Screen.tsx',
        content: `const ir = () => navigate('/academia/certificate/abc-123');`,
      },
    ],
    limites: [
      'rota montada por template ou concatenacao nao aparece como literal e escapa',
      'so olha chamadas a navigate: href de ancora comum nao e verificado',
      'confere que ALGUEM atende o caminho, nao que a tela certa aparece nele',
    ],
  },

  {
    nome: 'checkDegreeClaims',
    rodar: fluxo.checkDegreeClaims,
    variantes: [
      {
        como: 'reconhecimento pelo MEC',
        file: 'src/ui/screens/p/P1Screen.tsx',
        content: `const texto = 'Certificado reconhecido pelo MEC';`,
      },
      {
        como: 'diploma com validade nacional',
        file: 'src/ui/screens/p/P2Screen.tsx',
        content: `const texto = 'Diploma com validade nacional em todo o territorio';`,
      },
      {
        como: 'curso superior',
        file: 'src/ui/screens/p/P3Screen.tsx',
        content: `const texto = 'Equivalente a um curso superior de musica';`,
      },
    ],
    limpos: [
      {
        /**
         * O que a plataforma PODE dizer: curso livre com certificacao propria.
         * Sem isso o verificador barraria a frase honesta junto com a falsa.
         */
        como: 'a formula correta, de curso livre',
        file: 'src/ui/screens/q/Q1Screen.tsx',
        content: `const texto = 'Curso livre com certificacao propria do Conservatorio.';`,
      },
      {
        como: 'menciona o certificado sem prometer reconhecimento',
        file: 'src/ui/screens/q/Q2Screen.tsx',
        content: `const texto = 'Ao concluir, voce recebe o certificado do curso.';`,
      },
      {
        como: 'fala de nivel de estudo sem invocar titulacao',
        file: 'src/ui/screens/q/Q3Screen.tsx',
        content: `const texto = 'Trilha de estudo avancado em harmonia.';`,
      },
    ],
    limites: [
      'a lista de promessas indevidas cresce a mao: formula nova passa ate alguem escreve-la',
      'nao entende negacao — uma frase dizendo que NAO e reconhecido pelo MEC seria acusada',
      'acusa uma vez por padrao e por arquivo, e nao cada repeticao da mesma promessa',
    ],
  },

  {
    nome: 'checkFabricatedData',
    rodar: fluxo.checkFabricatedData,
    variantes: [
      {
        como: 'pessoa inventada com nome de gente de verdade',
        file: 'src/ui/screens/r/R1Screen.tsx',
        content: `const autor = 'Clara Schumann';`,
      },
      {
        como: 'imagem de banco generico',
        file: 'src/ui/screens/r/R2Screen.tsx',
        content: `const capa = 'https://images.unsplash.com/photo-123';`,
      },
      {
        como: 'endereco de exemplo',
        file: 'src/ui/screens/r/R3Screen.tsx',
        content: `const contato = 'aluno@example.com';`,
      },
    ],
    limpos: [
      {
        /**
         * Compositor de dominio publico citado como REFERENCIA do acervo nao e
         * dado inventado: e catalogo. A lista de suspeitos mira nomes usados
         * como marcador de exemplo, e nao a historia da musica.
         */
        como: 'referencia real do acervo',
        file: 'src/domain/r4.ts',
        content: `export const PERIODO = 'Barroco';`,
      },
      {
        como: 'estado vazio, sem pessoa nenhuma',
        file: 'src/ui/screens/s/S1Screen.tsx',
        content: `const autores: string[] = [];`,
      },
      {
        como: 'imagem servida pela propria plataforma',
        file: 'src/ui/screens/s/S2Screen.tsx',
        content: `const capa = '/assets/capa-do-curso.svg';`,
      },
    ],
    limites: [
      'nome inventado que nao esteja na lista de suspeitos passa sem ser visto',
      'acusa o primeiro casamento de cada padrao por arquivo, e nao todos',
      'nao sabe se o dado veio de repositorio: olha o literal, nao a origem',
    ],
  },

  {
    nome: 'checkComingSoonPromise',
    rodar: fluxo.checkComingSoonPromise,
    variantes: [
      {
        como: 'em breve',
        file: 'src/ui/screens/t/T1Screen.tsx',
        content: `const aviso = 'Esta funcionalidade estara disponivel em breve';`,
      },
      {
        como: 'brevemente',
        file: 'src/ui/screens/t/T2Screen.tsx',
        content: `const aviso = 'O acervo sera publicado brevemente';`,
      },
      {
        como: 'indisponivel no momento',
        file: 'src/ui/screens/t/T3Screen.tsx',
        content: `const aviso = 'Recurso indisponivel no momento';`,
      },
    ],
    limpos: [
      {
        /**
         * A diferenca entre promessa e fato: "ainda nao esta disponivel NESTA
         * VERSAO" diz o estado de hoje sem marcar encontro para amanha. Foi
         * exatamente a formula que o Estudio passou a usar.
         */
        como: 'declara o estado de hoje sem marcar data',
        file: 'src/ui/screens/u/U1Screen.tsx',
        content: `const aviso = 'A mixagem nao esta disponivel nesta versao do estudio.';`,
      },
      {
        como: 'estado vazio que explica a ausencia',
        file: 'src/ui/screens/u/U2Screen.tsx',
        content: `const aviso = 'Nenhuma obra cadastrada ate agora.';`,
      },
      {
        como: 'texto sobre duracao curta, que nao e promessa',
        file: 'src/ui/screens/u/U3Screen.tsx',
        content: `const aviso = 'A sessao dura poucos minutos.';`,
      },
    ],
    limites: [
      'a lista de formulas cresce a mao: "aguarde", "em construcao" e "chegando" nao estao nela',
      'nao distingue promessa ao aluno de comentario tecnico para quem escreve o codigo',
      'so olha arquivos de interface: promessa em documento ou em dominio escapa',
    ],
  },

  {
    nome: 'checkAccessibleName',
    rodar: fluxo.checkAccessibleName,
    variantes: [
      {
        como: 'botao so com icone',
        file: 'src/ui/components/v/V1.tsx',
        content: `export const A = () => <button type="button"><Icone /></button>;`,
      },
      {
        como: 'botao com icone dentro de expressao',
        file: 'src/ui/components/v/V2.tsx',
        content: `export const B = () => <button type="button">{<Play />}</button>;`,
      },
      {
        como: 'botao vazio',
        file: 'src/ui/components/v/V3.tsx',
        content: `export const C = () => <button type="button"></button>;`,
      },
    ],
    limpos: [
      {
        como: 'botao com texto visivel',
        file: 'src/ui/components/x/X1.tsx',
        content: `export const D = () => <button type="button">Salvar</button>;`,
      },
      {
        como: 'botao so com icone, mas com aria-label',
        file: 'src/ui/components/x/X2.tsx',
        content: `export const E = () => <button type="button" aria-label="Reproduzir"><Play /></button>;`,
      },
      {
        como: 'botao com icone e texto ao lado',
        file: 'src/ui/components/x/X3.tsx',
        content: `export const F = () => <button type="button"><Play /> Reproduzir</button>;`,
      },
    ],
    limites: [
      'botao cujo conteudo passa de quatrocentos caracteres escapa da janela do padrao',
      'nome vindo de variavel nao e lido: o verificador ve a expressao, nao o valor dela',
      'componente proprio que renderiza button por dentro nao casa com a etiqueta literal',
    ],
  },

  {
    nome: 'checkKeyboardReach',
    rodar: fluxo.checkKeyboardReach,
    variantes: [
      {
        como: 'div clicavel',
        file: 'src/ui/components/y/Y1.tsx',
        content: `export const A = () => <div onClick={() => abrir()}>Abrir</div>;`,
      },
      {
        como: 'linha de tabela clicavel',
        file: 'src/ui/components/y/Y2.tsx',
        content: `export const B = () => <tr onClick={() => abrir(id)}>conteudo</tr>;`,
      },
      {
        como: 'item de lista clicavel',
        file: 'src/ui/components/y/Y3.tsx',
        content: `export const C = () => <li onClick={() => escolher(x)}>Item</li>;`,
      },
    ],
    limpos: [
      {
        como: 'botao de verdade, que o teclado ja alcanca',
        file: 'src/ui/components/z/Z1.tsx',
        content: `export const D = () => <button type="button" onClick={() => abrir()}>Abrir</button>;`,
      },
      {
        como: 'div clicavel com papel e ordem de foco declarados',
        file: 'src/ui/components/z/Z2.tsx',
        content: `export const E = () => <div role="button" tabIndex={0} onClick={() => abrir()}>Abrir</div>;`,
      },
      {
        como: 'div clicavel que tambem responde ao teclado',
        file: 'src/ui/components/z/Z3.tsx',
        content: `export const F = () => <div onClick={() => abrir()} onKeyDown={aoTeclado}>Abrir</div>;`,
      },
    ],
    limites: [
      'atributos espalhados por varias linhas nao cabem no padrao de uma abertura so',
      'nao confere se o onKeyDown declarado trata de fato Enter e Espaco',
      'papel espalhado por objeto de props, e nao escrito na etiqueta, escapa',
    ],
  },

  {
    nome: 'checkInflatedAggregate',
    rodar: fluxo.checkInflatedAggregate,
    variantes: [
      {
        como: 'soma literal a uma reducao real',
        file: 'src/services/application/aa.service.ts',
        content: `const totalMinutes = lista.reduce((a, b) => a + b, 0) + 125;`,
      },
      {
        como: 'soma literal a uma contagem',
        file: 'src/services/application/ab.service.ts',
        content: `const totalSessions = sessoes.length + 8;`,
      },
      {
        /**
         * O caso mais insidioso: sem dado NENHUM, devolve um numero plausivel.
         * A ausencia deixa de ser representavel, e o zero nunca aparece.
         */
        como: 'ternario que troca a ausencia por numero plausivel',
        file: 'src/services/application/ac.service.ts',
        content: `const accuracy = tentativas.length > 0 ? media(tentativas) : 86;`,
      },
    ],
    limpos: [
      {
        como: 'agregado real, sem enchimento',
        file: 'src/services/application/ad.service.ts',
        content: `const totalMinutes = lista.reduce((a, b) => a + b, 0);`,
      },
      {
        /**
         * Ausencia representavel: sem dado, devolve nulo — e a tela decide como
         * mostrar isso. Era o conserto do perfil de pratica inflado.
         */
        como: 'ausencia devolvida como nulo',
        file: 'src/services/application/ae.service.ts',
        content: `const accuracy = tentativas.length > 0 ? media(tentativas) : null;`,
      },
      {
        como: 'soma de um, que e deslocamento de indice e nao enchimento',
        file: 'src/services/application/af.service.ts',
        content: `const nivelAtual = concluidos.length + 1;`,
      },
    ],
    limites: [
      'so olha linha a linha: enchimento somado algumas linhas depois do agregado escapa',
      'depende do NOME da variavel casar com vocabulario de medida',
      'constante nomeada somada no lugar do literal nao e vista como numero',
    ],
  },

  {
    nome: 'checkSuccessWithoutEffect',
    rodar: fluxo.checkSuccessWithoutEffect,
    variantes: [
      {
        como: 'salvar que so acende o aviso de salvo',
        file: 'src/ui/screens/ag/AgScreen.tsx',
        content: [
          `export const A = () => {`,
          `  const handleSalvar = () => {`,
          `    setIsSaved(true);`,
          `    setTimeout(() => setIsSaved(false), 3000);`,
          `  };`,
          `};`,
        ].join('\n'),
      },
      {
        como: 'enviar que so acende o aviso de enviado',
        file: 'src/ui/screens/ah/AhScreen.tsx',
        content: [
          `export const B = () => {`,
          `  const handleEnviar = () => {`,
          `    setIsEnviado(true);`,
          `  };`,
          `};`,
        ].join('\n'),
      },
      {
        como: 'publicar que so acende o aviso de publicado',
        file: 'src/ui/screens/ai/AiScreen.tsx',
        content: [
          `export const C = () => {`,
          `  const handlePublicar = () => {`,
          `    setIsPublicado(true);`,
          `    fecharModal();`,
          `  };`,
          `};`,
        ].join('\n'),
      },
    ],
    limpos: [
      {
        como: 'salvar que grava antes de anunciar',
        file: 'src/ui/screens/aj/AjScreen.tsx',
        content: [
          `export const D = () => {`,
          `  const handleSalvar = async () => {`,
          `    await perfilService.salvar(dados);`,
          `    setIsSaved(true);`,
          `  };`,
          `};`,
        ].join('\n'),
      },
      {
        como: 'salvar que escreve no repositorio',
        file: 'src/ui/screens/ak/AkScreen.tsx',
        content: [
          `export const E = () => {`,
          `  const handleSalvar = () => {`,
          `    notebookRepository.save(rascunho);`,
          `    setIsSaved(true);`,
          `  };`,
          `};`,
        ].join('\n'),
      },
      {
        /**
         * Sem marca de sucesso nao ha o que verificar: o manipulador nao
         * anuncia nada, entao nao mente. Botao que nao age e outro sinal.
         */
        como: 'manipulador que age e nao anuncia',
        file: 'src/ui/screens/al/AlScreen.tsx',
        content: [
          `export const F = () => {`,
          `  const handleSalvar = () => {`,
          `    abrirConfirmacao();`,
          `  };`,
          `};`,
        ].join('\n'),
      },
    ],
    limites: [
      'o corpo precisa fechar em dois espacos de indentacao: manipulador no topo do modulo escapa',
      'corpo acima de setecentos caracteres passa da janela do padrao',
      'chamar servico NAO prova que ele grava: o verificador ve a chamada, nao o efeito',
    ],
  },

  {
    nome: 'checkDataInsideScreen',
    rodar: fluxo.checkDataInsideScreen,
    variantes: [
      {
        como: 'lista de registros do acervo escrita dentro da tela',
        file: 'src/ui/screens/am/AmScreen.tsx',
        content: [
          `const resultados = [`,
          `  { id: 'a', title: 'Sonata', link: '/x/1', context: 'Atlas' },`,
          `  { id: 'b', title: 'Fuga', link: '/x/2', context: 'Atlas' },`,
          `];`,
        ].join('\n'),
      },
      {
        /**
         * Foi assim que as notificacoes inventadas escaparam: nao como `const`,
         * mas como valor inicial de estado.
         */
        como: 'os mesmos registros como valor inicial de estado',
        file: 'src/ui/screens/an/AnScreen.tsx',
        content: [
          `const [avisos, setAvisos] = useState([`,
          `  { id: 'a', message: 'Tarefa avaliada', teacher: 'Prof. X', date: '2026-01-01' },`,
          `  { id: 'b', message: 'Voce foi mencionado', teacher: 'Prof. Y', date: '2026-01-02' },`,
          `]);`,
        ].join('\n'),
      },
      {
        como: 'registros com contagem, que e medida e nao rotulo',
        file: 'src/ui/screens/ao/AoScreen.tsx',
        content: [
          `const eras = [`,
          `  { id: 'barroco', name: 'Barroco', worksCount: 142 },`,
          `  { id: 'classico', name: 'Classico', worksCount: 98 },`,
          `];`,
        ].join('\n'),
      },
    ],
    limpos: [
      {
        /**
         * Configuracao de interface pertence ao arquivo da tela: mudar as abas
         * E mudar a tela. Acusa-las afogaria o achado que importa.
         */
        como: 'abas da propria tela',
        file: 'src/ui/screens/ap/ApScreen.tsx',
        content: [
          `const abas = [`,
          `  { id: 'geral', label: 'Geral' },`,
          `  { id: 'avancado', label: 'Avancado' },`,
          `];`,
        ].join('\n'),
      },
      {
        como: 'um registro so, que nao e catalogo',
        file: 'src/ui/screens/aq/AqScreen.tsx',
        content: [
          `const destaque = [`,
          `  { id: 'a', title: 'Sonata', link: '/x/1', context: 'Atlas' },`,
          `];`,
        ].join('\n'),
      },
      {
        como: 'lista sem identificador, que e enumeracao de texto',
        file: 'src/ui/screens/ar/ArScreen.tsx',
        content: [
          `const passos = [`,
          `  { titulo: 'Escolha o curso', descricao: 'Comece pela area' },`,
          `  { titulo: 'Matricule-se', descricao: 'Confirme os dados' },`,
          `];`,
        ].join('\n'),
      },
    ],
    limites: [
      'lista acima de quatro mil caracteres passa da janela e nao e examinada',
      'registro cujos campos nao carregam pessoa, data, contagem nem destino escapa dos dois sinais',
      'menu do proprio console e isento por apontar para rota que o outlet atende',
    ],
  },

  {
    nome: 'checkAltText',
    rodar: fluxo.checkAltText,
    variantes: [
      {
        como: 'imagem sem alt nenhum',
        file: 'src/ui/components/al/Al1.tsx',
        content: `export const A = () => <img src="/capa.png" />;`,
      },
      {
        como: 'imagem com classe e sem alt',
        file: 'src/ui/components/al/Al2.tsx',
        content: `export const B = () => <img className="w-8" src={capa} />;`,
      },
      {
        como: 'imagem com largura e altura e sem alt',
        file: 'src/ui/components/al/Al3.tsx',
        content: `export const C = () => <img src="/x.svg" width={24} height={24} />;`,
      },
    ],
    limpos: [
      {
        como: 'imagem com alt descritivo',
        file: 'src/ui/components/am/Am1.tsx',
        content: `export const D = () => <img src="/capa.png" alt="Capa do curso" />;`,
      },
      {
        /**
         * Alt vazio e a forma CORRETA de dizer que a imagem e decorativa: o
         * leitor de tela a ignora. Acusar isso empurraria para o oposto do que
         * se quer, que e o leitor anunciar "imagem" sem dizer de que.
         */
        como: 'imagem decorativa com alt vazio',
        file: 'src/ui/components/am/Am2.tsx',
        content: `export const E = () => <img src="/ornamento.svg" alt="" />;`,
      },
      {
        como: 'alt vindo de variavel',
        file: 'src/ui/components/am/Am3.tsx',
        content: `export const F = () => <img src={capa} alt={tituloDaObra} />;`,
      },
    ],
    limites: [
      'nao julga a QUALIDADE do alt: "imagem" e "foto" passam como se descrevessem algo',
      'imagem renderizada por componente proprio nao casa com a etiqueta img literal',
      'atributos espalhados por varias linhas nao cabem no padrao de uma abertura so',
    ],
  },

  {
    nome: 'checkFieldLabel',
    rodar: fluxo.checkFieldLabel,
    variantes: [
      {
        como: 'campo de texto sem rotulo nenhum',
        file: 'src/ui/components/an/An1.tsx',
        content: `export const A = () => <input type="text" placeholder="Nome" />;`,
      },
      {
        como: 'area de texto sem rotulo',
        file: 'src/ui/components/an/An2.tsx',
        content: `export const B = () => <textarea rows={4} />;`,
      },
      {
        como: 'seletor sem rotulo',
        file: 'src/ui/components/an/An3.tsx',
        content: `export const C = () => <select value={x} onChange={aoMudar}><option>Um</option></select>;`,
      },
    ],
    limpos: [
      {
        como: 'campo com aria-label',
        file: 'src/ui/components/ao/Ao1.tsx',
        content: `export const D = () => <input type="text" aria-label="Nome completo" />;`,
      },
      {
        como: 'campo ligado a um label por identificador',
        file: 'src/ui/components/ao/Ao2.tsx',
        content: [
          `export const E = () => (`,
          `  <>`,
          `    <label htmlFor="nome">Nome</label>`,
          `    <input id="nome" type="text" />`,
          `  </>`,
          `);`,
        ].join('\n'),
      },
      {
        /**
         * Campo oculto nao e campo de ninguem: nao recebe foco, nao e lido, e
         * nao ha o que rotular.
         */
        como: 'campo oculto, que ninguem preenche',
        file: 'src/ui/components/ao/Ao3.tsx',
        content: `export const F = () => <input type="hidden" value={token} />;`,
      },
    ],
    limites: [
      'campo que recebe os atributos por espalhamento e isento: nao da para saber o que vem ali',
      'label envolvente so e reconhecido dentro de seiscentos caracteres antes do campo',
      'nao confere se o texto do rotulo descreve de fato o que o campo pede',
    ],
  },

  {
    nome: 'checkDevToolInProduction',
    rodar: fluxo.checkDevToolInProduction,
    variantes: [
      {
        como: 'painel de depuracao montado sem guarda',
        file: 'src/ui/screens/ap/Ap1Screen.tsx',
        content: `export const A = () => <div>{mostrar && <DebugPanel />}</div>;`,
      },
      {
        /**
         * O defeito que motivou este verificador: um simulador de papel que
         * deixava qualquer pessoa trocar o proprio papel na tela.
         */
        como: 'simulador de papel sem guarda',
        file: 'src/ui/screens/ap/Ap2Screen.tsx',
        content: `export const B = () => <RoleSimulator papel={papel} />;`,
      },
      {
        como: 'conta local de desenvolvimento sem guarda',
        file: 'src/ui/screens/ap/Ap3Screen.tsx',
        content: `const entrar = () => usarContaLocalDeDesenvolvimento();`,
      },
    ],
    limpos: [
      {
        como: 'ferramenta do time atras da guarda de desenvolvimento',
        file: 'src/ui/screens/aq/Aq1Screen.tsx',
        content: [
          `export const D = () => (`,
          `  <div>{import.meta.env.DEV && <DebugPanel />}</div>`,
          `);`,
        ].join('\n'),
      },
      {
        /**
         * So o import nao monta nada. O que importa e o USO sem guarda, e um
         * arquivo que apenas reexporta nao expoe ferramenta a ninguem.
         */
        como: 'apenas o import, sem uso',
        file: 'src/ui/screens/aq/Aq2Screen.tsx',
        content: `import { DebugPanel } from '../../dev/DebugPanel';`,
      },
      {
        como: 'tela comum, sem ferramenta de time nenhuma',
        file: 'src/ui/screens/aq/Aq3Screen.tsx',
        content: `export const F = () => <div>Bem-vinda de volta</div>;`,
      },
    ],
    limites: [
      'a lista de marcas cresce a mao: ferramenta com nome novo passa ate alguem escreve-la',
      'guarda por variavel propria, e nao por import.meta.env.DEV, nao e reconhecida',
      'so olha arquivos de interface: rota de depuracao registrada fora deles escapa',
    ],
  },

  {
    nome: 'checkCommittedSecret',
    rodar: seguranca.checkCommittedSecret,
    variantes: [
      {
        como: 'chave secreta de cliente do Google',
        file: 'src/config/ar1.ts',
        content: `const segredo = 'GOCSPX-abcdefghij1234567890';`,
      },
      {
        como: 'chave de API do Google',
        file: 'src/config/ar2.ts',
        content: `const chave = 'AIzaSyD1234567890abcdefghijklmnopqrstuv';`,
      },
      {
        como: 'chave privada colada inteira',
        file: 'src/config/ar3.ts',
        content: `const pem = '-----BEGIN RSA PRIVATE KEY-----';`,
      },
    ],
    limpos: [
      {
        como: 'segredo lido de variavel de ambiente',
        file: 'src/config/as1.ts',
        content: `const segredo = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;`,
      },
      {
        /**
         * Identificador PUBLICO de cliente e feito para ir no navegador: e o
         * que o Google publica na propria tela de consentimento. Acusa-lo
         * ensinaria a esconder o que nao precisa ser escondido.
         */
        como: 'identificador publico de cliente',
        file: 'src/config/as2.ts',
        content: `const clientId = '1234567890-abc.apps.googleusercontent.com';`,
      },
      {
        como: 'apenas o nome da variavel de ambiente, sem valor',
        file: 'src/config/as3.ts',
        content: `export const NOME_DA_CHAVE = 'VITE_GOOGLE_CLIENT_ID';`,
      },
    ],
    limites: [
      'a lista de formatos cresce a mao: segredo de outro provedor passa sem ser visto',
      'segredo montado por concatenacao ou codificado em base64 nao casa com nenhum padrao',
      'so olha o codigo: segredo em arquivo de ambiente nao versionado esta fora do alcance',
    ],
  },

  {
    nome: 'checkKeyCollision',
    rodar: seguranca.checkKeyCollision,
    variantes: [
      {
        /**
         * Duas chaves iguais em repositorios diferentes significam que um grava
         * por cima do outro — e ninguem descobre ate o aluno perder o
         * progresso.
         */
        como: 'dois repositorios declarando a mesma chave',
        file: 'src/repositories/at1.repository.ts',
        content: [
          `export class R1 {`,
          `  private STORAGE_KEYS = {`,
          `    COLIDE: 'amd_chave_repetida_de_prova',`,
          `  };`,
          `}`,
        ].join('\n'),
        extras: [
          {
            file: 'src/repositories/at1b.repository.ts',
            content: `const PAR = 'amd_chave_repetida_de_prova';`,
          },
        ],
      },
      {
        como: 'a mesma chave declarada como atribuicao solta',
        file: 'src/repositories/at2.repository.ts',
        content: `const CHAVE = 'amd_chave_repetida_de_prova';`,
        extras: [
          {
            file: 'src/repositories/at2b.repository.ts',
            content: `const OUTRA = 'amd_chave_repetida_de_prova';`,
          },
        ],
      },
      {
        como: 'um terceiro repositorio na mesma chave',
        file: 'src/repositories/at3.repository.ts',
        content: [
          `export class R3 {`,
          `  private STORAGE_KEYS = {`,
          `    TAMBEM: 'amd_chave_repetida_de_prova',`,
          `  };`,
          `}`,
        ].join('\n'),
        extras: [
          {
            file: 'src/repositories/at3b.repository.ts',
            content: `const PAR = 'amd_chave_repetida_de_prova';`,
          },
        ],
      },
    ],
    limpos: [
      {
        como: 'chave propria, usada por um repositorio so',
        file: 'src/repositories/au1.repository.ts',
        content: [
          `export class R {`,
          `  private STORAGE_KEYS = {`,
          `    UNICA: 'amd_chave_exclusiva_de_prova',`,
          `  };`,
          `}`,
        ].join('\n'),
      },
      {
        como: 'outra chave propria, tambem unica',
        file: 'src/repositories/au2.repository.ts',
        content: [
          `export class R {`,
          `  private STORAGE_KEYS = {`,
          `    OUTRA: 'amd_outra_chave_exclusiva_de_prova',`,
          `  };`,
          `}`,
        ].join('\n'),
      },
      {
        /**
         * Fora de `src/repositories` a string nao e chave de armazenamento: e
         * texto. O verificador so olha quem tem autoridade para gravar.
         */
        como: 'a mesma string fora da camada de repositorio',
        file: 'src/domain/au3.ts',
        content: `export const ROTULO = 'amd_chave_exclusiva_de_prova';`,
      },
    ],
    limites: [
      'so reconhece chave com o prefixo amd_ escrita como literal',
      'chave montada por template ou por funcao nao aparece na tabela',
      'acusa colisao entre repositorios; colisao com chave gravada fora deles escapa',
    ],
  },

  {
    nome: 'checkContentMarkdown',
    rodar: texto.checkContentMarkdown,
    variantes: [
      {
        como: 'negrito aberto e nao fechado',
        file: 'src/data/av1.ts',
        content: 'export const L = { markdown: `O **intervalo de quinta e consonante.` };',
      },
      {
        como: 'link sem destino',
        file: 'src/data/av2.ts',
        content: 'export const L = { markdown: `Veja o [capitulo anterior]().` };',
      },
      {
        como: 'cabecalho colado no paragrafo anterior',
        file: 'src/data/av3.ts',
        content: 'export const L = { markdown: `Fim do paragrafo\n## Proximo tema` };',
      },
    ],
    limpos: [
      {
        como: 'negrito fechado e link com destino',
        file: 'src/data/aw1.ts',
        content: 'export const L = { markdown: `O **intervalo** e consonante. Veja o [atlas](/atlas).` };',
      },
      {
        como: 'cabecalho separado do paragrafo por linha em branco',
        file: 'src/data/aw2.ts',
        content: 'export const L = { markdown: `Fim do paragrafo\n\n## Proximo tema` };',
      },
      {
        /**
         * Markdown fora de `src/data` nao e conteudo do aluno: e texto de
         * interface ou de documento, e tem outro dono.
         */
        como: 'markdown fora da camada de conteudo',
        file: 'src/ui/components/aw/Aw3.tsx',
        content: 'export const T = { markdown: `**sem fechar` };',
      },
    ],
    limites: [
      'so examina literais em campo markdown dentro de src/data',
      'nao valida a estrutura do documento: nivel de cabecalho fora de ordem passa',
      'italico com um asterisco so, e lista mal indentada, nao sao verificados',
    ],
  },

  {
    nome: 'checkFreeCourseDisclaimer',
    rodar: fluxo.checkFreeCourseDisclaimer,
    variantes: [
      {
        como: 'tela de certificado sem a ressalva',
        file: 'src/ui/screens/ax/CertificateScreen.tsx',
        content: `export const A = () => <h1>Certificado de Conclusao</h1>;`,
      },
      {
        como: 'tela de credencial sem a ressalva',
        file: 'src/ui/screens/ax/CredentialDetailScreen.tsx',
        content: `export const B = () => <h1>Credencial emitida</h1>;`,
      },
      {
        como: 'apresentacao de curso sem a ressalva',
        file: 'src/ui/screens/ax/CoursePresentationScreen.tsx',
        content: `export const C = () => <h1>Harmonia Funcional</h1>;`,
      },
    ],
    limpos: [
      {
        como: 'certificado que declara ser de curso livre',
        file: 'src/ui/screens/ay/CertificateScreen.tsx',
        content: `export const D = () => <p>Curso livre, com certificacao propria.</p>;`,
      },
      {
        como: 'credencial que usa a formula da certificacao propria',
        file: 'src/ui/screens/ay/CredentialDetailScreen.tsx',
        content: `export const E = () => <p>Certificacao propria do Conservatorio.</p>;`,
      },
      {
        /**
         * A ressalva so e exigida de quem FALA de certificado. Tela comum nao
         * precisa carregar o aviso, e exigir isso de todas o tornaria ruido.
         */
        como: 'tela que nao fala de certificado',
        file: 'src/ui/screens/ay/AtlasHomeScreen.tsx',
        content: `export const F = () => <h1>Atlas</h1>;`,
      },
    ],
    limites: [
      'reconhece a tela pelo NOME do arquivo: certificado em tela de nome neutro escapa',
      'basta a formula aparecer no arquivo: nao confere se ela esta visivel na tela',
      'o componente de credencial e aceito como ressalva por conter o aviso dentro dele',
    ],
  },


  {
    nome: 'checkEmptyLiteralAsData',
    rodar: fluxo.checkEmptyLiteralAsData,
    variantes: [
      {
        /**
         * O defeito real, palavra por palavra. `PracticeLeagueScreen` apurava
         * a liga sobre um array vazio LITERAL, com um comentario logo acima
         * afirmando que a apuracao rodava sobre as inscricoes da semana.
         */
        como: 'apuracao sobre array vazio literal',
        file: 'src/ui/screens/liga/L1Screen.tsx',
        content: `const t = computeStandings([], escopo, Faixa.BRONZE, semana);`,
      },
      {
        /**
         * A segunda posicao, depois de uma chamada aninhada. Qualquer regex de
         * argumento que nao atravesse parenteses erra exatamente este caso.
         */
        como: 'constante vazia no segundo argumento',
        file: 'src/ui/screens/liga/L2Screen.tsx',
        content: `const m = missionProgress(missionsOfTheDay(u), EMPTY_ACTIVITY);`,
      },
      {
        como: 'apuracao sobre objeto vazio literal',
        file: 'src/ui/screens/liga/L3Screen.tsx',
        content: `const r = apurarResultado({}, filtro);`,
      },
    ],
    limpos: [
      {
        como: 'apuracao sobre o que foi lido',
        file: 'src/ui/screens/liga/M1Screen.tsx',
        content: `const t = computeStandings(inscricoes, escopo, Faixa.BRONZE, semana);`,
      },
      {
        /**
         * Valor de partida ate a leitura chegar. E correto e comum, e acusa-lo
         * mandaria a tela nascer com dado inventado.
         */
        como: 'vazio como estado inicial',
        file: 'src/ui/screens/liga/M2Screen.tsx',
        content: `const [linhas, setLinhas] = useState([]);`,
      },
      {
        como: 'funcao que nao e apuracao recebendo vazio',
        file: 'src/ui/screens/liga/M3Screen.tsx',
        content: `const x = formatarLista([], opcoes);`,
      },
    ],
    limites: [
      'reconhece apuracao pelo NOME da funcao: compute, apurar, calcular, derive, resolver, rank, progress',
      'so olha dentro de tela: apuracao sobre vazio em servico ou dominio escapa deste sinal',
      'nao alcanca o vazio que chega por variavel intermediaria, nem o que vem de uma leitura que falhou',
    ],
  },

];

afterEach(() => clearInjectedSources());

describe('cada sinal é coberto em todas as formas conhecidas', () => {
  for (const sinal of SINAIS) {
    describe(sinal.nome, () => {
      for (const variante of sinal.variantes) {
        it(`acusa: ${variante.como}`, () => {
          injectSources([variante, ...(variante.extras ?? [])]);
          const achados = sinal.rodar();

          expect(
            achados.some((f) => f.file === variante.file),
            `não viu "${variante.como}" em ${variante.file}`
          ).toBe(true);
        });
      }

      for (const limpo of sinal.limpos) {
        it(`não acusa: ${limpo.como}`, () => {
          /**
           * Falso positivo é pior que ausência: ensina a ignorar o
           * verificador, e aí ele deixa de servir para o caso verdadeiro.
           */
          injectSources([limpo]);
          const achados = sinal.rodar();

          expect(
            achados.filter((f) => f.file === limpo.file),
            `acusou código correto: "${limpo.como}"`
          ).toEqual([]);
        });
      }

      it('declara o que não alcança', () => {
        // Limite escondido é falsa sensação de cobertura.
        expect(sinal.limites.length, 'nenhum limite declarado').toBeGreaterThan(0);
        for (const limite of sinal.limites) {
          expect(limite.length).toBeGreaterThan(20);
        }
      });
    });
  }
});

describe('a cobertura não encolhe', () => {
  it('todo sinal tem mais de uma variante', () => {
    /**
     * Uma variante prova que o verificador não nasceu vazio. Não prova
     * cobertura: um que acusa `alert()` e é cego às outras formas de botão
     * morto passa com uma só, e continua deixando passar o defeito na maior
     * parte das vezes em que ele aparece.
     */
    for (const s of SINAIS) {
      expect(s.variantes.length, s.nome).toBeGreaterThanOrEqual(3);
    }
  });

  it('todo sinal tem caso limpo', () => {
    for (const s of SINAIS) {
      expect(s.limpos.length, s.nome).toBeGreaterThanOrEqual(3);
    }
  });

  it('os sinais cobertos aqui existem de verdade', () => {
    const existentes = new Set(checkerInventory().map((c) => c.nome));
    for (const s of SINAIS) {
      expect(existentes.has(s.nome), `${s.nome} não existe`).toBe(true);
    }
  });
});


// ---------------------------------------------------------------------------
// Sinais que leem ARQUIVO FIXO
// ---------------------------------------------------------------------------

/**
 * Vinte e um verificadores nao varrem arvore nenhuma: leem um caminho
 * conhecido e so. A tabela da economia, o outlet, `audiencia.ts`, a guarda, o
 * repositorio do Academy, o servico de autenticacao.
 *
 * Nenhum deles podia ser provado, porque nao havia como por um defeito na
 * frente deles sem escrever no repositorio de verdade. E eram justamente os
 * mais pesados: heranca de audiencia, cobertura da guarda, permanencia do dado
 * do aluno depois de publicar. Verificacao que ninguem nunca viu acusar, no
 * lugar em que acusar mais importa.
 *
 * `injectFile` poe conteudo no lugar do caminho. Como o conteudo injetado
 * substitui TUDO o que o verificador enxerga, a exigencia aqui e mais forte
 * que na outra tabela: o caso limpo nao pode produzir NENHUM achado, e nao
 * apenas nenhum no arquivo do fixture.
 */
interface SinalDeArquivoFixo {
  nome: string;
  rodar: () => { file: string; detail?: string }[];
  variantes: { como: string; arquivos: Record<string, string> }[];
  limpos: { como: string; arquivos: Record<string, string> }[];
  limites: string[];
}

const AUDIENCIA = 'src/ui/navigation/audiencia.ts';
const GUARDA = 'src/ui/navigation/GuardaDeAudiencia.tsx';
const OUTLET = 'src/ui/screens/AppRouterOutlet.tsx';
const ACADEMY_REPO = 'src/repositories/academy.repository.ts';
const AUTH = 'src/services/application/auth.service.ts';
const REPERTORIO = 'src/data/seed-player-repertoire.ts';
const CADEIRA = 'src/domain/chair.ts';
const CASAS = 'src/data/seed-houses.ts';
const ATLAS_REPO = 'src/repositories/atlas.repository.ts';
const ACERVO_REPO = 'src/repositories/music-knowledge.repository.ts';
const CONHECIMENTO = 'src/domain/music-knowledge.ts';
const PARTITURAS_JSON = 'src/data/acervo/partituras.json';
const UNIFICADO = 'src/data/acervo-unificado.ts';
const TELA_DA_OBRA = 'src/ui/screens/acervo/ObraScreen.tsx';
const FACETAS = 'src/domain/catalog-facets.ts';
const SERVICO_DO_MAPA = 'src/services/application/atlas.service.ts';
const TELA_DO_MAPA = 'src/ui/screens/worlds/WorldsAtlasScreen.tsx';
const MAPA_DO_ATLAS = 'src/domain/atlas-map.ts';

/**
 * A quebra de linha construída, e não escrita.
 *
 * Escrever `\n` dentro de um fixture gerado por script vira quebra de linha
 * real e parte o literal — é a mesma família do `\b` que virou BACKSPACE neste
 * repositório. Construí-la não tem como dar errado.
 */
const NL = String.fromCharCode(10);

/** As tres pontas sadias do mapa, para variar uma de cada vez. */
function mapaSadio(): Record<string, string> {
  return {
    [SERVICO_DO_MAPA]: [
      "import { todasAsObras, todosOsCompositores } from '../../data/acervo-unificado';",
      'export function rotaDoMarcador(m) { return `/acervo/compositor/` + m.id; }',
    ].join(NL),
    [TELA_DO_MAPA]: 'atlasService.vista({ eraId });',
    [MAPA_DO_ATLAS]: 'const temFoco = !!composerId || !!movimentoId;',
  };
}


const UNIFICADO_ACERVO = 'src/data/acervo-unificado.ts';
const RECURSO_DO_CATALOGO = 'src/domain/catalog-resource.ts';
const VOCABULARIO = 'src/domain/catalog-vocabulary.ts';
const PESSOA_DO_CATALOGO = 'src/domain/catalog-person.ts';

/** Uma ligacao de partituras que enfileira em vez de criar obra. */
function ligacaoSadia(): string {
  return [
    'async function ligarPartituras(porId, partituras) {',
    '  for (const p of partituras) {',
    '    const alvo = porCatalogo.get(p.cat);',
    '    if (!alvo) {',
    "      pendentes.push({ recurso: 'PARTITURA', recursoId: p.id });",
    '      continue;',
    '    }',
    '    porId.set(alvo, { ...obra });',
    '  }',
    '}',
  ].join('\n');
}

function fonteSadia(): Record<string, string> {
  return {
    [RECURSO_DO_CATALOGO]:
      'export interface RegistroPendente {}\n' +
      'export type MotivoDaPendencia = string;\n' +
      'export function podeCriarEntidadeCanonica(o) { return o === 1; }',
    [UNIFICADO_ACERVO]: ligacaoSadia(),
    [SERVICO_DO_ACERVO]: "secao === 'PENDENTES'; naFilaDeResolucao: partiturasPendentes().length",
    /**
     * A tela nao entra mais nesta regra.
     *
     * Ela ja precisou oferecer um recorte de edicoes sem obra, e depois
     * contar quantas eram. As duas saiam pelo mesmo motivo: um numero que
     * quem le nao pode enderecar nao informa. A contagem vive no servico.
     */
    [TELA_DO_ACERVO]: "{ id: 'OBRAS', rotulo: 'Obras' }",
  };
}

/** Um vocabulario com instrumentos, vozes e resolucao. */
function vocabularioSadio(quantosInstrumentos = 20, quantasVozes = 7): string {
  const inst = Array.from(
    { length: quantosInstrumentos },
    (_, i) => `  { id: 'inst_${i}', rotulo: 'I${i}' },`
  ).join('\n');
  const nomes = ['SOPRANO', 'TENOR', 'BARITONO', 'BAIXO', 'CONTRALTO', 'MEZZO', 'CONTRATENOR'];
  const vozes = nomes
    .slice(0, quantasVozes)
    .map((n) => `  { id: '${n}', rotulo: '${n}' },`)
    .join('\n');

  return [
    'export const PAPEIS = [];',
    `export const INSTRUMENTOS = [\n${inst}\n];`,
    `export const VOZES = [\n${vozes}\n];`,
    'export function resolverInstrumento(g) { return undefined; }',
    'export function resolverVoz(g) { return undefined; }',
  ].join('\n');
}

function papelSadio(): Record<string, string> {
  return {
    [VOCABULARIO]: vocabularioSadio(),
    [PESSOA_DO_CATALOGO]: 'export interface Pessoa {\n  atuacoes: AtuacaoMusical[];\n}',
  };
}


const SERVICO_DO_ACERVO = 'src/services/application/acervo.service.ts';
const TELA_DO_ACERVO = 'src/ui/screens/acervo/AcervoScreen.tsx';
const OBRAS_JSON = 'src/data/acervo/obras.json';
const SEED_EXTERNO = 'src/data/seed-acervo-externo.ts';

/** Um servico com quatro facetas, todas aplicadas. */
function servicoSadio(): string {
  return [
    "montarFaceta('eraId', 'Era', 'ajuda', contar(x, (o) => o.periodId));",
    "montarFaceta('regionId', 'Regiao', 'ajuda', contar(x, (o) => o.regionId));",
    "montarFaceta('generoId', 'Genero', 'ajuda', contar(x, (o) => o.generoId));",
    "montarFaceta('key', 'Tonalidade', 'ajuda', contar(x, (o) => o.key));",
    '.filter((o) => !filtro.eraId || o.periodId === filtro.eraId)',
    '.filter((o) => !filtro.regionId || o.regionId === filtro.regionId)',
    '.filter((o) => !filtro.generoId || o.generoId === filtro.generoId)',
    '.filter((o) => !filtro.key || o.key === filtro.key)',
  ].join('\n');
}

/** Uma tela que pede as facetas ao servico e nao monta lista fixa. */
function telaSadia(): string {
  return 'acervoService.facetas(secao, filtro).then(setFacetas);';
}

function filtroSadio(): Record<string, string> {
  return { [SERVICO_DO_ACERVO]: servicoSadio(), [TELA_DO_ACERVO]: telaSadia() };
}

/** Obras servidas com era e compositor em todas. */
function obrasJson(quantas: number, comEra = quantas, comCompositor = quantas): string {
  return JSON.stringify(
    Array.from({ length: quantas }, (_, i) => ({
      id: 'o' + i,
      t: 'Obra ' + i,
      ...(i < comEra ? { e: 'era_barroco' } : {}),
      ...(i < comCompositor ? { c: 'alguem' } : {}),
    }))
  );
}

/** Um seed de compositores com cidadania declarada. */
function seedExterno(quantos: number, comCidadania = quantos): string {
  return Array.from(
    { length: quantos },
    (_, i) =>
      `\n    id: 'c${i}',\n    nome: 'Alguem',\n` +
      (i < comCidadania ? "    cidadanias: ['Q183'],\n" : "    cidadanias: [],\n")
  ).join('');
}

function universalSadio(): Record<string, string> {
  return { [OBRAS_JSON]: obrasJson(100), [SEED_EXTERNO]: seedExterno(50) };
}



/** Um catalogo minimo de partituras, na forma servida. */
function partiturasJson(itens: Array<Record<string, unknown>>) {
  return JSON.stringify(itens);
}

/** Os tres elos sadios, para variar um de cada vez. */
function atribuicaoSadia(): Record<string, string> {
  return {
    [PARTITURAS_JSON]: partiturasJson([
      { id: 'part-1', lic: 'Creative Commons Attribution-ShareAlike 4.0', ed: 'Alguem' },
      { id: 'part-2', lic: 'Public Domain' },
    ]),
    [UNIFICADO]: 'const ref = { fileLicense: p.lic, editors: p.ed ? [p.ed] : undefined };',
    [TELA_DA_OBRA]: "<p>{r.editors?.join(', ')}</p>",
  };
}

/** As facetas sadias: dois niveis, sem chave repetida entre eles. */
function facetasSadias(): string {
  return [
    'export const MEIOS_AMPLOS: Record<string, string> = {',
    "  teclado: 'Teclado',",
    "  vocal: 'Vocal',",
    '};',
    'export const INSTRUMENTOS_EXATOS: Record<string, string> = {',
    "  Piano: 'Piano',",
    "  Voice: 'Voz',",
    '};',
    'export function separarPorNivel() { return [] }',
  ].join('\n');
}

/** Um repositorio de Atlas minimo: a interface de filtro e a implementacao. */
const atlas = (campos: string[], aplicados: string[]) =>
  [
    `export interface AtlasFilter {`,
    ...campos.map((c) => `  ${c}?: string;`),
    `}`,
    `  public async listarObras(filtro: AtlasFilter = {}) {`,
    `    return this.obras().filter(`,
    `      (o) =>`,
    ...aplicados.map((c) => `        (!filtro.${c} || o.${c} === filtro.${c}) &&`),
    `        true`,
    `    );`,
    `  }`,
  ].join('\n');
const CURSO_TEORIA = 'src/data/seed-theory-course.ts';
const CURSO_VIOLINO = 'src/data/seed-violino-course.ts';

/** Um mapa curso -> cadeira minimo, na forma que o verificador le. */
const cadeiras = (pares: [string, string][]) =>
  [
    `export enum ChairId {`,
    ...[...new Set(pares.map(([, c]) => c))].map((c) => `  ${c} = 'cad_${c.toLowerCase()}',`),
    `}`,
    `export const CHAIR_OF_COURSE = {`,
    ...pares.map(([curso, chair]) => `  ${curso}: ChairId.${chair},`),
    `};`,
  ].join('\n');

/** Uma Casa minima: nome, status e corpus, na ordem que o verificador pareia. */
const casas = (linhas: [string, string, number][]) =>
  [
    `export const SEED_HOUSES = [`,
    ...linhas.flatMap(([nome, status, obras]) => [
      `  {`,
      `    name: '${nome}',`,
      `    status: HouseStatus.${status},`,
      `    corpus: { obras: ${obras}, ingeridas: 0 },`,
      `  },`,
    ]),
    `];`,
  ].join('\n');
const ECONOMIA_DOC = 'docs/harness/76_PROGRESS_ECONOMY.md';
const ECONOMIA_CODE = 'src/domain/progress-economy.ts';

/**
 * A tabela de contagem do documento da economia, em forma minima.
 *
 * As colunas sao: evento, XP, teto e onde. A ultima carrega o simbolo do
 * codigo entre crases, e e por ela que o documento e cobrado: afirmar
 * `ALGUMA_COISA` ali obriga `ALGUMA_COISA` a existir no codigo.
 */
const tabelaDeContagem = (linhas: string[][]) =>
  [
    '# Economia de progresso',
    '',
    '## 2 \u00b7 Tabela de contagem',
    '',
    '| Evento | XP | Teto | Onde |',
    '| :--- | ---: | ---: | :--- |',
    ...linhas.map((c) => `| ${c.join(' | ')} |`),
    '',
    '## 3 \u00b7 Outra coisa',
  ].join('\n');

/** Uma tabela de audiencia minima, para montar casos sem arrastar a de verdade. */
const audiencia = (linhas: [string, string][]) =>
  [
    `export type Audiencia = 'publica' | 'exigeLogin' | 'somenteVisitante' | 'exigeAdmin';`,
    `export const REGRAS = [`,
    ...linhas.map(([rota, aud]) => `  { rota: '${rota}', audiencia: '${aud}' },`),
    `];`,
  ].join('\n');

/** Um outlet minimo: rota, e a tela que abre nela. */
const outlet = (pares: [string, string][]) =>
  [
    `export const AppRouterOutlet = () => {`,
    ...pares.flatMap(([rota, tela]) => [
      `  if (currentPath === '${rota}') {`,
      `    return <${tela} />;`,
      `  }`,
    ]),
    `};`,
  ].join('\n');

const SINAIS_DE_ARQUIVO_FIXO: SinalDeArquivoFixo[] = [
  {
    nome: 'checkGuardCoversEveryAudience',
    rodar: seguranca.checkGuardCoversEveryAudience,
    variantes: [
      {
        /**
         * Foi ESTE o defeito real: `exigeAdmin` entrou no tipo e a guarda
         * continuou tratando tres niveis. O nivel existia no papel e nao
         * protegia nada.
         */
        como: 'nivel novo no tipo que a guarda nao trata',
        arquivos: {
          [AUDIENCIA]: `export type Audiencia = 'publica' | 'exigeLogin' | 'exigeAdmin';`,
          [GUARDA]: `if (a === 'publica') return filho;\nif (a === 'exigeLogin') return entrar;`,
        },
      },
      {
        como: 'dois niveis de uma vez sem tratamento',
        arquivos: {
          [AUDIENCIA]: `export type Audiencia = 'publica' | 'exigeLogin' | 'somenteVisitante' | 'exigeAdmin';`,
          [GUARDA]: `if (a === 'publica') return filho;`,
        },
      },
      {
        como: 'guarda que perdeu o nivel mais restritivo',
        arquivos: {
          [AUDIENCIA]: `export type Audiencia = 'publica' | 'exigeAdmin';`,
          [GUARDA]: `if (a === 'publica') return filho;\nreturn recusa;`,
        },
      },
    ],
    limpos: [
      {
        como: 'guarda que trata todos os niveis declarados',
        arquivos: {
          [AUDIENCIA]: `export type Audiencia = 'publica' | 'exigeLogin' | 'exigeAdmin';`,
          [GUARDA]: [
            `if (a === 'publica') return filho;`,
            `if (a === 'exigeLogin') return entrar;`,
            `if (a === 'exigeAdmin') return recusa;`,
          ].join('\n'),
        },
      },
      {
        como: 'um nivel so, tratado',
        arquivos: {
          [AUDIENCIA]: `export type Audiencia = 'publica';`,
          [GUARDA]: `if (a === 'publica') return filho;`,
        },
      },
      {
        como: 'guarda que trata mais do que o tipo declara',
        arquivos: {
          [AUDIENCIA]: `export type Audiencia = 'publica' | 'exigeLogin';`,
          [GUARDA]: [
            `if (a === 'publica') return filho;`,
            `if (a === 'exigeLogin') return entrar;`,
            `if (a === 'exigeAdmin') return recusa;`,
          ].join('\n'),
        },
      },
    ],
    limites: [
      'confere que o nivel e MENCIONADO na guarda, e nao que o tratamento dele esteja correto',
      'nivel montado por constante em vez de literal no tipo nao e extraido',
      'nao verifica se a guarda e de fato aplicada as rotas: so se conhece os niveis',
    ],
  },

  {
    nome: 'checkAdminScreensBehindAdminAudience',
    rodar: seguranca.checkAdminScreensBehindAdminAudience,
    variantes: [
      {
        /**
         * O defeito real: `/admin` era `exigeLogin`. Qualquer aluno com sessao
         * abria o console. A hierarquia vivia em dois sistemas e so um era
         * auditado.
         */
        como: 'console atras de simples login',
        arquivos: {
          [AUDIENCIA]: audiencia([['/founder', 'exigeLogin']]),
          [OUTLET]: outlet([['/founder', 'ConsoleHomeScreen']]),
        },
      },
      {
        como: 'tela de console sem regra nenhuma, herdando publica',
        arquivos: {
          [AUDIENCIA]: audiencia([['/', 'publica']]),
          [OUTLET]: outlet([['/founder/users', 'AdminUsersScreen']]),
        },
      },
      {
        como: 'tela cujo nome denuncia o console, fora da rota do console',
        arquivos: {
          [AUDIENCIA]: audiencia([['/relatorios', 'publica']]),
          [OUTLET]: outlet([['/relatorios', 'AdminReportsScreen']]),
        },
      },
    ],
    limpos: [
      {
        como: 'console declarado com o nivel de administracao',
        arquivos: {
          [AUDIENCIA]: audiencia([['/founder', 'exigeAdmin']]),
          [OUTLET]: outlet([['/founder', 'ConsoleHomeScreen']]),
        },
      },
      {
        como: 'subrota do console, herdando o nivel do prefixo',
        arquivos: {
          [AUDIENCIA]: audiencia([['/founder', 'exigeAdmin']]),
          [OUTLET]: outlet([['/founder/users', 'AdminUsersScreen']]),
        },
      },
      {
        /**
         * Tela comum em rota comum nao tem por que exigir administracao.
         * Acusar aqui seria empurrar a plataforma inteira para tras da guarda.
         */
        como: 'tela comum em rota publica',
        arquivos: {
          [AUDIENCIA]: audiencia([['/', 'publica']]),
          [OUTLET]: outlet([['/', 'HomeScreen']]),
        },
      },
    ],
    limites: [
      'reconhece tela de console pelo NOME comecar com Admin ou Console, ou pela rota /founder',
      'tela de console com nome neutro em rota neutra nao e reconhecida como tal',
      'confere a declaracao, e nao se a guarda foi de fato montada em volta daquela rota',
    ],
  },

  {
    nome: 'checkPersonalRouteInheritingPublic',
    rodar: seguranca.checkPersonalRouteInheritingPublic,
    variantes: [
      {
        /**
         * O vazamento real: `/academia/result/<id>` herdava publica de
         * `/academia`, e o servico buscava por id e mais nada. A prova de
         * qualquer aluno abria para qualquer visitante.
         */
        como: 'resultado de prova herdando publica do prefixo',
        arquivos: {
          [AUDIENCIA]: audiencia([['/academia', 'publica']]),
          /*
            Tela INEXISTENTE de proposito.

            A primeira versao usava `AssessmentResultScreen`, que existe e hoje
            consulta a sessao — e por isso o verificador a isentava, com razao.
            O fixture e que estava errado: para provar a heranca de audiencia, a
            tela precisa ser uma que nao decide sozinha quem esta perguntando.
          */
          [OUTLET]: outlet([['/academia/result/', 'ProvaResultadoScreen']]),
        },
      },
      {
        como: 'certificado sem regra nenhuma, publico por omissao',
        arquivos: {
          [AUDIENCIA]: audiencia([['/', 'publica']]),
          [OUTLET]: outlet([['/certificate/', 'DiplomaEmitidoScreen']]),
        },
      },
      {
        como: 'caixa de entrada herdando publica',
        arquivos: {
          [AUDIENCIA]: audiencia([['/comunidade', 'publica']]),
          [OUTLET]: outlet([['/comunidade/inbox', 'InboxScreen']]),
        },
      },
    ],
    limpos: [
      {
        como: 'registro pessoal declarado como exigeLogin',
        arquivos: {
          [AUDIENCIA]: audiencia([['/academia', 'publica'], ['/academia/result', 'exigeLogin']]),
          [OUTLET]: outlet([['/academia/result/', 'AssessmentResultScreen']]),
        },
      },
      {
        /**
         * `search/results` tem a palavra `result` e nao e registro de ninguem:
         * e lista de busca. Sem essa excecao o verificador acusaria a busca.
         */
        como: 'resultado de BUSCA, que nao e registro de pessoa',
        arquivos: {
          [AUDIENCIA]: audiencia([['/', 'publica']]),
          [OUTLET]: outlet([['/search/results', 'SearchResultsScreen']]),
        },
      },
      {
        como: 'rota que nao parece registro de pessoa',
        arquivos: {
          [AUDIENCIA]: audiencia([['/', 'publica']]),
          [OUTLET]: outlet([['/atlas/periodos', 'AtlasPeriodsScreen']]),
        },
      },
      {
        /**
         * A isencao, com uma tela DE VERDADE.
         *
         * `AssessmentResultScreen` esta numa rota que parece pessoal, e a regra
         * de audiencia aqui e publica. Nao e acusada porque a tela consulta a
         * sessao: ela decide sozinha o que mostrar a cada publico.
         *
         * Este caso amarra a isencao ao repositorio real. Se alguem tirar a
         * leitura de sessao dali, este teste passa a falhar — que e exatamente
         * o aviso que se quer.
         */
        como: 'rota pessoal cuja tela consulta a sessao e decide sozinha',
        arquivos: {
          [AUDIENCIA]: audiencia([['/academia', 'publica']]),
          [OUTLET]: outlet([['/academia/result/', 'AssessmentResultScreen']]),
        },
      },
    ],
    limites: [
      'reconhece rota pessoal por vocabulario: nome fora da lista nao e visto como pessoal',
      'tela que consulta a sessao e isenta, mesmo que a rota siga publica',
      'nao confere se o servico por tras filtra por dono: isso e outro sinal',
    ],
  },

  {
    nome: 'checkPublishKeepsStudentData',
    rodar: seguranca.checkPublishKeepsStudentData,
    variantes: [
      {
        /**
         * A regra que nao pode quebrar: publicar conteudo republica CONTEUDO.
         * Se a mesma funcao toca progresso, publicar apaga o que o aluno fez.
         */
        como: 'publicar tocaria o progresso do aluno',
        arquivos: {
          [ACADEMY_REPO]: [
            `export class AcademyRepository {`,
            `  public conteudoPublicado(): void {`,
            `    this.storage.set(this.STORAGE_KEYS.COURSES, cursos);`,
            `    this.storage.remove(this.STORAGE_KEYS.PROGRESS);`,
            `  }`,
            `}`,
          ].join('\n'),
        },
      },
      {
        como: 'publicar tocaria as tentativas de prova',
        arquivos: {
          [ACADEMY_REPO]: [
            `export class AcademyRepository {`,
            `  public conteudoPublicado(): void {`,
            `    this.storage.set(this.STORAGE_KEYS.ATTEMPTS, []);`,
            `  }`,
            `}`,
          ].join('\n'),
        },
      },
      {
        como: 'publicar tocaria os certificados emitidos',
        arquivos: {
          [ACADEMY_REPO]: [
            `export class AcademyRepository {`,
            `  public conteudoPublicado(): void {`,
            `    this.storage.remove(this.STORAGE_KEYS.CERTIFICATES);`,
            `  }`,
            `}`,
          ].join('\n'),
        },
      },
    ],
    limpos: [
      {
        como: 'publicar toca apenas conteudo',
        arquivos: {
          [ACADEMY_REPO]: [
            `export class AcademyRepository {`,
            `  public conteudoPublicado(): void {`,
            `    this.storage.set(this.STORAGE_KEYS.COURSES, cursos);`,
            `    this.storage.set(this.STORAGE_KEYS.LESSONS, licoes);`,
            `  }`,
            `}`,
          ].join('\n'),
        },
      },
      {
        como: 'publicar toca conteudo e trabalho editorial, que sao republicaveis',
        arquivos: {
          [ACADEMY_REPO]: [
            `export class AcademyRepository {`,
            `  public conteudoPublicado(): void {`,
            `    this.storage.set(this.STORAGE_KEYS.DRAFTS, rascunhos);`,
            `  }`,
            `}`,
          ].join('\n'),
        },
      },
      {
        /**
         * A chave do aluno aparece no arquivo, mas FORA de `conteudoPublicado`.
         * Ler o progresso em outro metodo e o trabalho normal do repositorio.
         */
        como: 'chave do aluno usada em outro metodo do mesmo arquivo',
        arquivos: {
          [ACADEMY_REPO]: [
            `export class AcademyRepository {`,
            `  public conteudoPublicado(): void {`,
            `    this.storage.set(this.STORAGE_KEYS.COURSES, cursos);`,
            `  }`,
            ``,
            `  public lerProgresso(): unknown {`,
            `    return this.storage.get(this.STORAGE_KEYS.PROGRESS);`,
            `  }`,
            `}`,
          ].join('\n'),
        },
      },
    ],
    limites: [
      'so examina o corpo de conteudoPublicado: apagamento chamado por funcao auxiliar escapa',
      'o corpo precisa fechar em dois espacos de indentacao para ser recortado',
      'a lista de chaves do aluno cresce a mao: categoria nova passa ate alguem escreve-la',
    ],
  },

  {
    nome: 'checkSessionTeardown',
    rodar: seguranca.checkSessionTeardown,
    variantes: [
      {
        como: 'sair nao apaga a sessao local',
        arquivos: {
          [AUTH]: [
            `export class AuthService {`,
            `  public async logout(): Promise<void> {`,
            `    this.disableGoogleAutoSelect();`,
            `  }`,
            `}`,
          ].join('\n'),
        },
      },
      {
        /**
         * Sem desligar a selecao automatica, o proximo visitante da mesma
         * maquina volta a entrar sozinho na conta de quem saiu.
         */
        como: 'sair nao desliga o login automatico do Google',
        arquivos: {
          [AUTH]: [
            `export class AuthService {`,
            `  public async logout(): Promise<void> {`,
            `    this.clearLocalSession();`,
            `  }`,
            `}`,
          ].join('\n'),
        },
      },
      {
        como: 'sair nao faz nem uma coisa nem outra',
        arquivos: {
          [AUTH]: [
            `export class AuthService {`,
            `  public async logout(): Promise<void> {`,
            `    this.navigate('/');`,
            `  }`,
            `}`,
          ].join('\n'),
        },
      },
    ],
    limpos: [
      {
        como: 'sair apaga a sessao e desliga a selecao automatica',
        arquivos: {
          [AUTH]: [
            `export class AuthService {`,
            `  public async logout(): Promise<void> {`,
            `    this.clearLocalSession();`,
            `    this.disableGoogleAutoSelect();`,
            `  }`,
            `}`,
          ].join('\n'),
        },
      },
      {
        como: 'sair apaga pela chave de sessao em vez do auxiliar',
        arquivos: {
          [AUTH]: [
            `export class AuthService {`,
            `  public async logout(): Promise<void> {`,
            `    localStorage.removeItem(this.sessionKey);`,
            `    this.disableGoogleAutoSelect();`,
            `  }`,
            `}`,
          ].join('\n'),
        },
      },
      {
        como: 'sair faz as duas coisas junto com outras',
        arquivos: {
          [AUTH]: [
            `export class AuthService {`,
            `  public async logout(): Promise<void> {`,
            `    this.clearLocalSession();`,
            `    this.disableGoogleAutoSelect();`,
            `    this.navigate('/');`,
            `  }`,
            `}`,
          ].join('\n'),
        },
      },
    ],
    limites: [
      'confere que as chamadas ESTAO la, e nao que elas apagam de fato',
      'o corpo de logout precisa fechar em dois espacos de indentacao',
      'nao cobre a expiracao por tempo, nem sessao aberta em outra aba',
    ],
  },
  {
    /**
     * ESTE SINAL ERA VAZIO CONTRA O ARQUIVO DE VERDADE.
     *
     * A versao anterior procurava registros na forma `{ id: '...' }`. O acervo
     * e construido por chamadas a `faixa('id', 'titulo', 'autor', ...)`, e nao
     * ha um unico bloco daquela forma no arquivo: o verificador varria trinta
     * e tres faixas e enxergava zero.
     *
     * Os fixtures da tabela ANTERIOR usavam a forma errada tambem — e por isso
     * passavam. Era cobertura de mentira: provava que o verificador acusava um
     * formato que o repositorio nao usa. Errar a forma do fixture e nao provar
     * nada, com aparencia de ter provado.
     */
    nome: 'checkPublicDomainRepertoire',
    rodar: fluxo.checkPublicDomainRepertoire,
    variantes: [
      {
        como: 'faixa cujo autor nao esta no rol declarado',
        arquivos: {
          [REPERTORIO]: [
            `export const AUTORES_DO_ACERVO: Record<string, string> = {`,
            `  'Johann Sebastian Bach': 'morto em 1750',`,
            `};`,
            `faixa('bar-a', 'Tema', 'Autor Ainda Vivo', 'Barroco', 'Do', '4/4', 60, 'C4:1');`,
          ].join('\n'),
        },
      },
      {
        como: 'duas faixas fora do rol',
        arquivos: {
          [REPERTORIO]: [
            `export const AUTORES_DO_ACERVO: Record<string, string> = {`,
            `  'Johann Sebastian Bach': 'morto em 1750',`,
            `};`,
            `faixa('bar-b', 'A', 'Fulano de Tal', 'Barroco', 'Do', '4/4', 60, 'C4:1');`,
            `faixa('bar-c', 'B', 'Beltrano de Tal', 'Barroco', 'Do', '4/4', 60, 'C4:1');`,
          ].join('\n'),
        },
      },
      {
        /**
         * Sem o rol, a verificacao ficaria vazia — e vazia e como ela viveu
         * ate agora. Por isso ela acusa a propria ausencia em vez de passar.
         */
        como: 'rol ausente, o que deixaria a verificacao vazia',
        arquivos: {
          [REPERTORIO]: `faixa('bar-d', 'A', 'Johann Sebastian Bach', 'Barroco', 'Do', '4/4', 60, 'C4:1');`,
        },
      },
    ],
    limpos: [
      {
        como: 'faixa cujo autor esta no rol, com justificativa',
        arquivos: {
          [REPERTORIO]: [
            `export const AUTORES_DO_ACERVO: Record<string, string> = {`,
            `  'Johann Sebastian Bach': 'morto em 1750',`,
            `};`,
            `faixa('bar-e', 'A', 'Johann Sebastian Bach', 'Barroco', 'Do', '4/4', 60, 'C4:1');`,
          ].join('\n'),
        },
      },
      {
        como: 'melodia tradicional, que entra por outra porta',
        arquivos: {
          [REPERTORIO]: [
            `export const AUTORES_DO_ACERVO: Record<string, string> = {`,
            `  'Melodia tradicional': 'tradicional, sem autor conhecido',`,
            `};`,
            `faixa('trad-a', 'A', 'Melodia tradicional', 'Tradicional', 'Do', '4/4', 60, 'C4:1');`,
          ].join('\n'),
        },
      },
      {
        /**
         * Rol declarado e nenhuma faixa ainda: nao ha o que acusar. Acervo
         * vazio e cobrado pelo sinal de prontidao, e nao por este.
         */
        como: 'rol declarado e acervo ainda sem faixa',
        arquivos: {
          [REPERTORIO]: [
            `export const AUTORES_DO_ACERVO: Record<string, string> = {`,
            `  'Johann Sebastian Bach': 'morto em 1750',`,
            `};`,
          ].join('\n'),
        },
      },
    ],
    limites: [
      'confere que o autor foi DECLARADO em dominio publico, e nao a data de morte declarada',
      'le um arquivo so: repertorio construido em outro lugar nao e verificado',
      'a faixa precisa ser construida por faixa() com id, titulo e autor como literais',
    ],
  },
  {
    nome: 'checkCountingSymbol',
    rodar: economia.checkCountingSymbol,
    variantes: [
      {
        /**
         * O defeito real: o documento nomeava `ISLAND_VISITED`,
         * `STAGE_COMPLETED` e `REPERTOIRE_PERFORMED`, e nenhum dos tres existia
         * no codigo. A tabela descrevia um sistema que ninguem escreveu.
         */
        como: 'simbolo afirmado que nao existe no codigo',
        arquivos: {
          [ECONOMIA_DOC]: tabelaDeContagem([['Visitar ilha', '10', '—', '`ISLAND_VISITED`']]),
        },
      },
      {
        como: 'dois simbolos inexistentes na mesma linha',
        arquivos: {
          [ECONOMIA_DOC]: tabelaDeContagem([
            ['Concluir etapa', '20', '—', '`STAGE_COMPLETED` e `REPERTOIRE_PERFORMED`'],
          ]),
        },
      },
      {
        como: 'simbolo inexistente escrito como caminho de propriedade',
        arquivos: {
          [ECONOMIA_DOC]: tabelaDeContagem([['Tocar obra', '30', '—', '`economia.PECA_TOCADA_INEXISTENTE`']]),
        },
      },
    ],
    limpos: [
      {
        /**
         * A convencao do relogio: simbolo ainda nao implementado se declara
         * pendente, e ai o documento nao esta mentindo — esta planejando.
         */
        como: 'simbolo pendente, marcado com o relogio',
        arquivos: {
          [ECONOMIA_DOC]: tabelaDeContagem([['Visitar ilha', '10', '—', '⏳ `ISLAND_VISITED`']]),
        },
      },
      {
        como: 'linha sem simbolo nenhum entre crases',
        arquivos: {
          [ECONOMIA_DOC]: tabelaDeContagem([['Entrar no dia', '5', '1 por dia', 'ainda a definir']]),
        },
      },
      {
        como: 'tabela vazia, sem linha de evento',
        arquivos: {
          [ECONOMIA_DOC]: tabelaDeContagem([]),
        },
      },
    ],
    limites: [
      'confere que o nome APARECE no codigo, e nao que ele signifique a mesma coisa la',
      'nome com menos de quatro letras e ignorado para nao casar com qualquer coisa',
      'a busca e no codigo inteiro junto: simbolo declarado em lugar errado passa',
    ],
  },

  {
    nome: 'checkCountingVocabulary',
    rodar: economia.checkCountingVocabulary,
    variantes: [
      {
        /**
         * "Ilha" foi aposentada quando a hierarquia virou Gremio, Casa e
         * Clube. Palavra aposentada que sobrevive no documento e instrucao
         * errada para quem for implementar.
         */
        como: 'palavra aposentada: ilha',
        arquivos: {
          [ECONOMIA_DOC]: tabelaDeContagem([['Visitar a ilha', '10', '—', 'a definir']]),
        },
      },
      {
        como: 'termo em ingles: streak',
        arquivos: {
          [ECONOMIA_DOC]: tabelaDeContagem([['Manter streak', '15', '—', 'a definir']]),
        },
      },
      {
        como: 'termo em ingles: ranking',
        arquivos: {
          [ECONOMIA_DOC]: tabelaDeContagem([['Subir no ranking', '25', '—', 'a definir']]),
        },
      },
    ],
    limpos: [
      {
        como: 'o termo correto: ofensiva',
        arquivos: {
          [ECONOMIA_DOC]: tabelaDeContagem([['Manter ofensiva', '15', '—', 'a definir']]),
        },
      },
      {
        como: 'o termo correto: classificacao',
        arquivos: {
          [ECONOMIA_DOC]: tabelaDeContagem([['Subir na classificacao', '25', '—', 'a definir']]),
        },
      },
      {
        /**
         * `ilhargas` contem `ilha` e nao e a palavra aposentada. Sem a
         * exigencia de borda, o verificador acusaria qualquer palavra que a
         * contivesse — e falso positivo ensina a ignorar o sinal.
         */
        como: 'palavra que apenas contem a sequencia aposentada',
        arquivos: {
          [ECONOMIA_DOC]: tabelaDeContagem([['Estudo das ilhargas', '10', '—', 'a definir']]),
        },
      },
    ],
    limites: [
      'a lista de palavras aposentadas cresce a mao, a cada mudanca de vocabulario',
      'so olha a tabela de contagem: a palavra no resto do documento escapa',
      'nao alcanca o codigo nem a interface, que tem seus proprios sinais',
    ],
  },

  {
    nome: 'checkDivergentValue',
    rodar: economia.checkDivergentValue,
    variantes: [
      {
        como: 'documento cita constante que o codigo nao declara',
        arquivos: {
          [ECONOMIA_DOC]: tabelaDeContagem([['Concluir licao', '10', '—', '`XP.LICAO_INEXISTENTE`']]),
          [ECONOMIA_CODE]: ['export const XP = {', '  LICAO_CONCLUIDA: 10,', '} as const;'].join('\n'),
        },
      },
      {
        como: 'duas constantes citadas e nenhuma declarada',
        arquivos: {
          [ECONOMIA_DOC]: tabelaDeContagem([['Concluir', '10', '—', '`XP.UM` e `XP.DOIS`']]),
          [ECONOMIA_CODE]: ['export const XP = {', '  OUTRO: 10,', '} as const;'].join('\n'),
        },
      },
      {
        /**
         * Sem nenhuma constante, a verificacao ficaria VAZIA — e passaria
         * verde medindo nada. Por isso ela acusa a propria ausencia.
         */
        como: 'codigo sem constante alguma, o que deixaria a verificacao vazia',
        arquivos: {
          [ECONOMIA_DOC]: tabelaDeContagem([['Concluir licao', '10', '—', '`XP.LICAO_CONCLUIDA`']]),
          [ECONOMIA_CODE]: `export const NADA = 1;`,
        },
      },
    ],
    limpos: [
      {
        como: 'documento e codigo declarando a mesma constante',
        arquivos: {
          [ECONOMIA_DOC]: tabelaDeContagem([['Concluir licao', '10', '—', '`XP.LICAO_CONCLUIDA`']]),
          [ECONOMIA_CODE]: ['export const XP = {', '  LICAO_CONCLUIDA: 10,', '} as const;'].join('\n'),
        },
      },
      {
        como: 'codigo declarando mais do que o documento cita',
        arquivos: {
          [ECONOMIA_DOC]: tabelaDeContagem([['Concluir licao', '10', '—', '`XP.LICAO_CONCLUIDA`']]),
          [ECONOMIA_CODE]: ['export const XP = {', '  LICAO_CONCLUIDA: 10,', '  SESSAO_FEITA: 5,', '} as const;'].join('\n'),
        },
      },
      {
        como: 'linha cujo XP nao e numero, e por isso nao e cobrada',
        arquivos: {
          [ECONOMIA_DOC]: tabelaDeContagem([['Concluir licao', 'variavel', '—', '`XP.QUALQUER`']]),
          [ECONOMIA_CODE]: ['export const XP = {', '  LICAO_CONCLUIDA: 10,', '} as const;'].join('\n'),
        },
      },
    ],
    limites: [
      'compara o NOME da constante, e nao o valor que o documento declara com o que o codigo guarda',
      'so reconhece a forma `XP.NOME` entre crases na ultima coluna',
      'constante declarada fora de progress-economy.ts nao entra na comparacao',
    ],
  },

  {
    nome: 'checkValueOutsideTable',
    rodar: economia.checkValueOutsideTable,
    variantes: [
      {
        /**
         * Valor de XP que a tabela nao preve e economia decidida no codigo,
         * fora do documento que existe para decidi-la.
         */
        como: 'codigo atribui XP que a tabela nao preve',
        arquivos: {
          [ECONOMIA_DOC]: tabelaDeContagem([['Concluir licao', '10', '—', '`XP.LICAO`']]),
          'src/domain/xp-teste-a.ts': `export const xpDaLicao = 37;`,
        },
      },
      {
        como: 'servico atribui XP fora da tabela',
        arquivos: {
          [ECONOMIA_DOC]: tabelaDeContagem([['Concluir licao', '10', '—', '`XP.LICAO`']]),
          'src/services/application/xp-teste-b.service.ts': `const xpGanho = 99;`,
        },
      },
      {
        como: 'repositorio grava XP fora da tabela',
        arquivos: {
          [ECONOMIA_DOC]: tabelaDeContagem([['Concluir licao', '10', '—', '`XP.LICAO`']]),
          'src/repositories/xp-teste-c.repository.ts': `const xpInicial = 55;`,
        },
      },
    ],
    limpos: [
      {
        como: 'codigo atribui exatamente o que a tabela preve',
        arquivos: {
          [ECONOMIA_DOC]: tabelaDeContagem([['Concluir licao', '10', '—', '`XP.LICAO`']]),
          'src/domain/xp-teste-d.ts': `export const xpDaLicao = 10;`,
        },
      },
      {
        /**
         * Zero e sempre permitido: e a ausencia de ganho, e nao um valor de
         * economia que alguem inventou.
         */
        como: 'zero, que e ausencia de ganho',
        arquivos: {
          [ECONOMIA_DOC]: tabelaDeContagem([['Concluir licao', '10', '—', '`XP.LICAO`']]),
          'src/domain/xp-teste-e.ts': `export const xpInicial = 0;`,
        },
      },
      {
        como: 'valor previsto na coluna de teto, e nao na de XP',
        arquivos: {
          [ECONOMIA_DOC]: tabelaDeContagem([['Concluir licao', '10', '50', '`XP.LICAO`']]),
          'src/domain/xp-teste-f.ts': `export const xpMaximo = 50;`,
        },
      },
    ],
    limites: [
      'so olha domain, services e repositories: valor cravado na tela escapa deste sinal',
      'depende do nome da variavel comecar por xp, e nao do que ela significa',
      'valor montado por conta, e nao escrito como numero, nao e visto',
    ],
  },
  {
    nome: 'checkCourseHasChair',
    rodar: instituicao.checkCourseHasChair,
    variantes: [
      {
        /**
         * O erro facil de cometer: acrescentar um curso e esquecer o mapa.
         * Quem se matricula nele nao pertence a Gremio nenhum.
         */
        como: 'curso semeado que ninguem atribuiu a uma cadeira',
        arquivos: {
          [CADEIRA]: cadeiras([['crs_teoria_fundamentos', 'TEORIA']]),
          [CURSO_VIOLINO]: `export const CURSO = { id: 'crs_violino' };`,
        },
      },
      {
        como: 'dois cursos fora do mapa',
        arquivos: {
          [CADEIRA]: cadeiras([['crs_teoria_fundamentos', 'TEORIA']]),
          [CURSO_VIOLINO]: `export const CURSO = { id: 'crs_violino' };`,
          [CURSO_TEORIA]: `export const CURSO = { id: 'crs_teoria_outro' };`,
        },
      },
      {
        /**
         * Mapa vazio deixaria a verificacao sem nada para comparar. Ela acusa
         * a propria ausencia em vez de passar verde medindo nada.
         */
        como: 'mapa ausente, o que deixaria a verificacao vazia',
        arquivos: {
          [CADEIRA]: `export enum ChairId { TEORIA = 'cad_teoria' }`,
        },
      },
    ],
    limpos: [
      {
        como: 'todo curso semeado esta no mapa',
        arquivos: {
          [CADEIRA]: cadeiras([
            ['crs_teoria_fundamentos', 'TEORIA'],
            ['crs_violino', 'VIOLINO'],
          ]),
          [CURSO_TEORIA]: `export const CURSO = { id: 'crs_teoria_fundamentos' };`,
          [CURSO_VIOLINO]: `export const CURSO = { id: 'crs_violino' };`,
        },
      },
      {
        /**
         * Tres cursos de historia numa cadeira so. E o desenho, nao um
         * defeito: e por isso que o Gremio deixou de ser por curso.
         */
        como: 'varios cursos apontando para a MESMA cadeira',
        arquivos: {
          [CADEIRA]: cadeiras([
            ['crs_historia_ocidental', 'HISTORIA'],
            ['crs_historia_brasil', 'HISTORIA'],
            ['crs_historia_social_popular', 'HISTORIA'],
            ['crs_teoria_fundamentos', 'TEORIA'],
            ['crs_violino', 'VIOLINO'],
          ]),
          [CURSO_TEORIA]: `export const CURSO = { id: 'crs_teoria_fundamentos' };`,
          [CURSO_VIOLINO]: `export const CURSO = { id: 'crs_violino' };`,
        },
      },
      {
        como: 'mapa com mais cursos do que os semeados',
        arquivos: {
          [CADEIRA]: cadeiras([
            ['crs_teoria_fundamentos', 'TEORIA'],
            ['crs_violino', 'VIOLINO'],
            ['crs_piano_futuro', 'TEORIA'],
          ]),
          [CURSO_TEORIA]: `export const CURSO = { id: 'crs_teoria_fundamentos' };`,
          [CURSO_VIOLINO]: `export const CURSO = { id: 'crs_violino' };`,
        },
      },
    ],
    limites: [
      'le o id do curso pelo primeiro literal crs_ de cada arquivo de semente',
      'curso declarado fora dos cinco arquivos de semente conhecidos nao e visto',
      'confere que o curso ESTA no mapa, e nao que a cadeira atribuida faca sentido',
    ],
  },

  {
    nome: 'checkChairHasCourse',
    rodar: instituicao.checkChairHasCourse,
    variantes: [
      {
        como: 'cadeira declarada sem curso nenhum',
        arquivos: {
          [CADEIRA]: [
            `export enum ChairId {`,
            `  TEORIA = 'cad_teoria',`,
            `  PIANO = 'cad_piano',`,
            `}`,
            `export const CHAIR_OF_COURSE = {`,
            `  crs_teoria_fundamentos: ChairId.TEORIA,`,
            `};`,
          ].join('\n'),
        },
      },
      {
        como: 'duas cadeiras vazias',
        arquivos: {
          [CADEIRA]: [
            `export enum ChairId {`,
            `  TEORIA = 'cad_teoria',`,
            `  PIANO = 'cad_piano',`,
            `  CANTO = 'cad_canto',`,
            `}`,
            `export const CHAIR_OF_COURSE = {`,
            `  crs_teoria_fundamentos: ChairId.TEORIA,`,
            `};`,
          ].join('\n'),
        },
      },
      {
        como: 'nenhuma cadeira declarada, o que deixaria a verificacao vazia',
        arquivos: {
          [CADEIRA]: `export const CHAIR_OF_COURSE = {};`,
        },
      },
    ],
    limpos: [
      {
        como: 'cada cadeira com o seu curso',
        arquivos: {
          [CADEIRA]: cadeiras([
            ['crs_teoria_fundamentos', 'TEORIA'],
            ['crs_violino', 'VIOLINO'],
          ]),
        },
      },
      {
        como: 'uma cadeira so, com um curso',
        arquivos: {
          [CADEIRA]: cadeiras([['crs_teoria_fundamentos', 'TEORIA']]),
        },
      },
      {
        como: 'cadeira com tres cursos',
        arquivos: {
          [CADEIRA]: cadeiras([
            ['crs_historia_ocidental', 'HISTORIA'],
            ['crs_historia_brasil', 'HISTORIA'],
            ['crs_historia_social_popular', 'HISTORIA'],
          ]),
        },
      },
    ],
    limites: [
      'le as cadeiras pelas entradas do enum que atribuem um literal cad_',
      'cadeira montada por constante em vez de literal no enum nao e extraida',
      'nao sabe se o curso daquela cadeira esta publicado ou so semeado',
    ],
  },

  {
    nome: 'checkHouseStatusMatchesCorpus',
    rodar: instituicao.checkHouseStatusMatchesCorpus,
    variantes: [
      {
        /**
         * O defeito real: duas Casas marcadas "em preparo" com zero obras. A
         * lista dizia que o preparo estava em curso sobre um preparo que nao
         * havia comecado.
         */
        como: 'em preparo com zero obras',
        arquivos: {
          [CASAS]: casas([['Teoricos', 'IN_PREPARATION', 0]]),
        },
      },
      {
        como: 'aberta com zero obras',
        arquivos: {
          [CASAS]: casas([['Pianistas', 'OPEN', 0]]),
        },
      },
      {
        /**
         * O inverso tambem e incoerente: anunciada quer dizer "o lugar esta
         * marcado, nao ha conteudo ainda". Com corpus, ja ha.
         */
        como: 'anunciada com corpus',
        arquivos: {
          [CASAS]: casas([['Violinistas', 'ANNOUNCED', 4]]),
        },
      },
    ],
    limpos: [
      {
        como: 'em preparo com corpus',
        arquivos: {
          [CASAS]: casas([['Violinistas', 'IN_PREPARATION', 4]]),
        },
      },
      {
        como: 'anunciada sem corpus, que e o caminho sedimentado',
        arquivos: {
          [CASAS]: casas([['Pianistas', 'ANNOUNCED', 0]]),
        },
      },
      {
        como: 'as sete Casas como estao hoje',
        arquivos: {
          [CASAS]: casas([
            ['Violinistas', 'IN_PREPARATION', 4],
            ['Historiadores da musica', 'ANNOUNCED', 0],
            ['Teoricos', 'ANNOUNCED', 0],
            ['Pianistas', 'ANNOUNCED', 0],
            ['Cantores', 'ANNOUNCED', 0],
            ['Violonistas', 'ANNOUNCED', 0],
            ['Compositores', 'ANNOUNCED', 0],
          ]),
        },
      },
    ],
    limites: [
      'pareia nome, status e corpus por ORDEM de aparicao no arquivo',
      'recusa-se a medir quando as tres listas nao tem o mesmo tamanho, em vez de adivinhar',
      'confere a coerencia do rotulo, e nao se as obras declaradas existem de fato',
    ],
  },

  {
    nome: 'checkAtlasFilterIsApplied',
    rodar: instituicao.checkAtlasFilterIsApplied,
    variantes: [
      {
        /**
         * O defeito real: `genreId` vivia declarado no filtro sem campo
         * correspondente na obra e sem linha de filtro nenhuma. Quem filtrasse
         * por genero recebia a lista inteira, sem nenhum sinal de que o
         * recorte tinha sido ignorado.
         */
        como: 'campo declarado que a implementacao ignora',
        arquivos: {
          [ATLAS_REPO]: atlas(['eraId', 'generoId'], ['eraId']),
        },
      },
      {
        como: 'dois campos ignorados',
        arquivos: {
          [ATLAS_REPO]: atlas(['eraId', 'generoId', 'houseId'], ['eraId']),
        },
      },
      {
        /**
         * Sem a interface nao ha o que comparar, e a verificacao ficaria
         * vazia. Ela acusa a propria ausencia em vez de passar verde.
         */
        como: 'interface ausente, o que deixaria a verificacao vazia',
        arquivos: {
          [ATLAS_REPO]: `  public async listarObras() { return []; }`,
        },
      },
    ],
    limpos: [
      {
        como: 'todos os campos aplicados',
        arquivos: {
          [ATLAS_REPO]: atlas(['eraId', 'generoId'], ['eraId', 'generoId']),
        },
      },
      {
        como: 'um campo so, aplicado',
        arquivos: {
          [ATLAS_REPO]: atlas(['eraId'], ['eraId']),
        },
      },
      {
        como: 'os cinco recortes do Atlas, todos aplicados',
        arquivos: {
          [ATLAS_REPO]: atlas(
            ['eraId', 'regionId', 'houseId', 'generoId', 'composerId'],
            ['eraId', 'regionId', 'houseId', 'generoId', 'composerId']
          ),
        },
      },
    ],
    limites: [
      'confere que o campo e CITADO no corpo, e nao que a comparacao feita com ele esteja correta',
      'le a implementacao ate o primeiro fechamento em dois espacos de indentacao',
      'nao alcanca filtro aplicado por funcao auxiliar fora de listarObras',
    ],
  },

  {
    nome: 'checkAcervoCatalogaTudo',
    rodar: instituicao.checkAcervoCatalogaTudo,
    variantes: [
      {
        /**
         * O erro real: houve uma versao em que `podeListarFicha()` devolvia
         * `false` para obra protegida — o acervo ESCONDIA o que nao podia
         * tocar. Catalogo assim fica mutilado, sem quase nada do seculo XX.
         */
        como: 'listagem filtrando por situacao de direito autoral',
        arquivos: {
          [ACERVO_REPO]: [
            `  public async listarObras(f) {`,
            `    return this.obras().filter((o) => podeExibirObra(o.publicDomain));`,
            `  }`,
          ].join('\n'),
        },
      },
      {
        como: 'listagem excluindo o protegido',
        arquivos: {
          [ACERVO_REPO]: [
            `  public async listarObras(f) {`,
            `    return this.obras().filter((o) => o.publicDomain.status !== 'PROTECTED');`,
            `  }`,
          ].join('\n'),
        },
      },
      {
        como: 'listagem ausente, o que deixaria a verificacao vazia',
        arquivos: {
          [ACERVO_REPO]: `export class R {}`,
        },
      },
    ],
    limpos: [
      {
        como: 'filtro por recorte do Atlas, que e o legitimo',
        arquivos: {
          [ACERVO_REPO]: [
            `  public async listarObras(f) {`,
            `    return this.obras().filter((o) => !f.generoId || o.generoId === f.generoId);`,
            `  }`,
          ].join('\n'),
        },
      },
      {
        como: 'filtro por compositor',
        arquivos: {
          [ACERVO_REPO]: [
            `  public async listarObras(f) {`,
            `    return this.obras().filter((o) => !f.composerId || o.composerIds.includes(f.composerId));`,
            `  }`,
          ].join('\n'),
        },
      },
      {
        /**
         * Filtrar por ter edicao renderizavel NAO e filtrar por licenca: e
         * responder "o que da para tocar", que e pergunta legitima de quem
         * quer praticar. O item continua no catalogo.
         */
        como: 'filtro por ter edicao nativa',
        arquivos: {
          [ACERVO_REPO]: [
            `  public async listarObras(f) {`,
            `    return this.obras().filter((o) => !f.comEdicaoNativa || o.scoreRefs.length > 0);`,
            `  }`,
          ].join('\n'),
        },
      },
    ],
    limites: [
      'olha o corpo de listarObras: exclusao feita por funcao auxiliar fora dele escapa',
      'reconhece a exclusao por vocabulario — publicDomain, PROTECTED, UNDETERMINED, podeExibirObra',
      'nao alcanca a tela: um filtro de licenca escrito na interface nao e visto aqui',
    ],
  },

  {
    nome: 'checkDisponibilidadeTemMotivo',
    rodar: instituicao.checkDisponibilidadeTemMotivo,
    variantes: [
      {
        como: 'motivo virou opcional no contrato',
        arquivos: {
          [CONHECIMENTO]: [
            `interface DisponibilidadeNoConservatorio {`,
            `  modo: string;`,
            `  motivo?: string;`,
            `}`,
            `export function avaliarDisponibilidade() { return { modo: 'X', motivo: 'y' }; }`,
          ].join('\n'),
        },
      },
      {
        /**
         * "Indisponivel" sozinho deixa o aluno sem saber se o problema e a
         * lei, a falta de edicao ou algo provisorio.
         */
        como: 'uma saida sem motivo',
        arquivos: {
          [CONHECIMENTO]: [
            `interface DisponibilidadeNoConservatorio {`,
            `  modo: string;`,
            `  motivo: string;`,
            `}`,
            `export function avaliarDisponibilidade() {`,
            `  if (x) return { modo: 'A' };`,
            `  return { modo: 'B', motivo: 'y' };`,
            `}`,
          ].join('\n'),
        },
      },
      {
        como: 'contrato ausente, o que deixaria a verificacao vazia',
        arquivos: {
          [CONHECIMENTO]: `export const nada = 1;`,
        },
      },
    ],
    limpos: [
      {
        como: 'toda saida com motivo explicito',
        arquivos: {
          [CONHECIMENTO]: [
            `interface DisponibilidadeNoConservatorio {`,
            `  modo: string;`,
            `  motivo: string;`,
            `}`,
            `export function avaliarDisponibilidade() {`,
            `  if (x) return { modo: 'A', motivo: 'porque sim' };`,
            `  return { modo: 'B', motivo: 'porque nao' };`,
            `}`,
          ].join('\n'),
        },
      },
      {
        /** Atalho de objeto no meio: `{ modo, motivo, link }`. */
        como: 'motivo por atalho, no meio do objeto',
        arquivos: {
          [CONHECIMENTO]: [
            `interface DisponibilidadeNoConservatorio {`,
            `  modo: string;`,
            `  motivo: string;`,
            `}`,
            `export function avaliarDisponibilidade() {`,
            `  if (x) return { modo: 'A', motivo, link };`,
            `  return { modo: 'B', motivo: 'y' };`,
            `}`,
          ].join('\n'),
        },
      },
      {
        /**
         * Atalho no FIM do objeto: `{ modo, motivo }`. A primeira versao do
         * verificador nao casava este caso e acusava codigo correto.
         */
        como: 'motivo por atalho, no fim do objeto',
        arquivos: {
          [CONHECIMENTO]: [
            `interface DisponibilidadeNoConservatorio {`,
            `  modo: string;`,
            `  motivo: string;`,
            `}`,
            `export function avaliarDisponibilidade() {`,
            `  if (x) return { modo: 'A', motivo };`,
            `  return { modo: 'B', motivo: 'y' };`,
            `}`,
          ].join('\n'),
        },
      },
    ],
    limites: [
      'conta saidas e motivos: nao confere se o motivo escrito descreve a situacao de fato',
      'le a funcao ate o fim do arquivo, e nao ate o fecho dela',
      'nao exige link oficial, porque nem todo item tem identificador de onde derivar um',
    ],
  },

  {
    nome: 'checkAtribuicaoDaPartitura',
    rodar: instituicao.checkAtribuicaoDaPartitura,
    variantes: [
      {
        /**
         * O defeito real: a extracao trouxe licenca e link, e nao trouxe o
         * nome. Seiscentas e vinte e uma pecas ficaram impublicaveis, e
         * ninguem percebeu porque a ficha nao tinha onde mostrar a falta.
         */
        como: 'peca sob licenca com atribuicao e sem quem transcreveu',
        arquivos: {
          ...atribuicaoSadia(),
          [PARTITURAS_JSON]: partiturasJson([
            { id: 'part-1', lic: 'Creative Commons Attribution-ShareAlike 4.0' },
            { id: 'part-2', lic: 'Public Domain' },
          ]),
        },
      },
      {
        como: 'o catalogo nao carrega o credito que o arquivo tem',
        arquivos: {
          ...atribuicaoSadia(),
          [UNIFICADO]: 'const ref = { fileLicense: p.lic };',
        },
      },
      {
        /** Credito que existe no dado e nao chega ao olho nao cumpre licenca. */
        como: 'a ficha da obra nao desenha o credito',
        arquivos: {
          ...atribuicaoSadia(),
          [TELA_DA_OBRA]: '<p>{r.fileLicense}</p>',
        },
      },
      {
        /**
         * Nao-vacuidade: se nenhuma peca exigisse atribuicao, o verificador
         * passaria sem olhar nada. Dois verificadores deste projeto nasceram
         * exatamente assim.
         */
        como: 'nenhuma peca exige atribuicao, o que deixaria a verificacao vazia',
        arquivos: {
          ...atribuicaoSadia(),
          [PARTITURAS_JSON]: partiturasJson([{ id: 'part-1', lic: 'Public Domain' }]),
        },
      },
      {
        como: 'o arquivo servido ficou ilegivel',
        arquivos: { ...atribuicaoSadia(), [PARTITURAS_JSON]: '{ isto nao e json' },
      },
    ],
    limpos: [
      {
        como: 'credito presente onde a licenca exige, e os tres elos ligados',
        arquivos: atribuicaoSadia(),
      },
      {
        /** Dominio publico nao obriga, e o credito segue aparecendo. */
        como: 'peca em dominio publico sem credito, ao lado de uma sob CC com credito',
        arquivos: {
          ...atribuicaoSadia(),
          [PARTITURAS_JSON]: partiturasJson([
            { id: 'part-1', lic: 'Public Domain' },
            { id: 'part-2', lic: 'Creative Commons Attribution 4.0', ed: 'Outro' },
          ]),
        },
      },
      {
        /** A licenca vem em caixa diferente, e a obrigacao e a mesma. */
        como: 'licenca escrita em minusculas',
        arquivos: {
          ...atribuicaoSadia(),
          [PARTITURAS_JSON]: partiturasJson([
            { id: 'part-1', lic: 'creative commons attribution 3.0', ed: 'Alguem' },
          ]),
        },
      },
    ],
    limites: [
      'confere que o nome existe e aparece: nao confere que o nome esteja certo',
      'nao le o texto renderizado, so a presenca de `r.editors` no componente',
      'nao cobre licenca que exija atribuicao sem a palavra "attribution" no nome',
    ],
  },

  {
    nome: 'checkNiveisDeMeioSeparados',
    rodar: instituicao.checkNiveisDeMeioSeparados,
    variantes: [
      {
        como: 'o mapa de meio amplo sumiu',
        arquivos: {
          [FACETAS]: [
            "export const INSTRUMENTOS_EXATOS: Record<string, string> = { Piano: 'Piano' };",
            'export function separarPorNivel() { return [] }',
          ].join('\n'),
        },
      },
      {
        como: 'a funcao que separa os niveis sumiu',
        arquivos: {
          [FACETAS]: facetasSadias().replace('export function separarPorNivel() { return [] }', ''),
        },
      },
      {
        /**
         * O caso que torna a separacao mentira: a mesma chave nos dois lados.
         * Contar "Piano" como amplo E como exato duplicaria a obra na faceta.
         */
        como: 'a mesma chave nos dois niveis',
        arquivos: {
          [FACETAS]: facetasSadias().replace("  Piano: 'Piano',", "  Piano: 'Piano',\n  teclado: 'Teclado',"),
        },
      },
      {
        como: 'um dos niveis ficou vazio, o que deixaria a verificacao sem comparar',
        arquivos: {
          [FACETAS]: [
            'export const MEIOS_AMPLOS: Record<string, string> = {',
            '};',
            'export const INSTRUMENTOS_EXATOS: Record<string, string> = {',
            "  Piano: 'Piano',",
            '};',
            'export function separarPorNivel() { return [] }',
          ].join('\n'),
        },
      },
    ],
    limpos: [
      { como: 'dois niveis distintos e a funcao presente', arquivos: { [FACETAS]: facetasSadias() } },
      {
        como: 'muitos instrumentos exatos, nenhum coincidindo com familia',
        arquivos: {
          [FACETAS]: facetasSadias().replace(
            "  Voice: 'Voz',",
            "  Voice: 'Voz',\n  Cello: 'Violoncelo',\n  Flute: 'Flauta',\n  Guitar: 'Violao',"
          ),
        },
      },
      {
        /** Rotulo repetido nao e chave repetida: Teclado rotula piano e cravo. */
        como: 'rotulo igual em niveis diferentes, com chaves distintas',
        arquivos: {
          [FACETAS]: facetasSadias().replace(
            "  Piano: 'Piano',",
            "  Piano: 'Teclado',\n  Harpsichord: 'Teclado',"
          ),
        },
      },
    ],
    limites: [
      'confere as chaves declaradas: nao confere se o dado gravado usa os dois niveis',
      'nao verifica se FAMILIA_DO_INSTRUMENTO cobre todo instrumento exato',
      'le os mapas por regex de chave, e nao entende valor computado',
    ],
  },

  {
    nome: 'checkFiltroOferecidoEAplicado',
    rodar: instituicao.checkFiltroOferecidoEAplicado,
    variantes: [
      {
        /**
         * O defeito real: a faceta e oferecida, com contagem, e a listagem
         * nunca a aplica. Quem clica ve o rotulo mudar e o resultado ficar
         * igual, e conclui que o catalogo esta quebrado \u2014 o que esta.
         */
        como: 'faceta montada e nunca aplicada num filter',
        arquivos: {
          ...filtroSadio(),
          [SERVICO_DO_ACERVO]: servicoSadio().replace(
            '.filter((o) => !filtro.key || o.key === filtro.key)',
            ''
          ),
        },
      },
      {
        /**
         * A tela tinha o sistema de facetas disponivel e montava seletor de
         * lista fixa. Sem contagem, e oferecendo recorte que devolve vazio.
         */
        como: 'a tela monta filtro de lista fixa',
        arquivos: {
          ...filtroSadio(),
          [TELA_DO_ACERVO]: telaSadia() + '\nconst eras = DEFAULT_ERAS.map((e) => e.id);',
        },
      },
      {
        como: 'a tela nao pede as facetas ao servico',
        arquivos: { ...filtroSadio(), [TELA_DO_ACERVO]: 'const eras = [];' },
      },
      {
        como: 'quase nenhuma faceta montada, o que deixaria a verificacao vazia',
        arquivos: {
          ...filtroSadio(),
          [SERVICO_DO_ACERVO]: "montarFaceta('eraId', 'Era', 'a', c); filtro.eraId;",
        },
      },
    ],
    limpos: [
      { como: 'quatro facetas, todas aplicadas, tela pedindo ao servico', arquivos: filtroSadio() },
      {
        /**
         * Comentario que EXPLICA a remocao das listas fixas nao e uso delas.
         * A primeira versao acusou o proprio comentario da correcao.
         */
        como: 'a tela CITA a lista fixa dentro de um comentario',
        arquivos: {
          ...filtroSadio(),
          [TELA_DO_ACERVO]:
            '/* A versao anterior montava de DEFAULT_ERAS e DEFAULT_REGIONS. */\n' + telaSadia(),
        },
      },
      {
        como: 'mais facetas do que o minimo, todas aplicadas',
        arquivos: {
          ...filtroSadio(),
          [SERVICO_DO_ACERVO]:
            servicoSadio() +
            "\nmontarFaceta('meio', 'Meio', 'ajuda', c);" +
            '\n.filter((o) => !filtro.meio || o.instrumentation.includes(filtro.meio))',
        },
      },
    ],
    limites: [
      'confere que o nome do campo aparece num filter: nao confere que o filter esteja correto',
      'le o servico inteiro, e nao o metodo que de fato lista',
      'a tela e checada por presenca de chamada, e nao por render',
    ],
  },

  {
    nome: 'checkEixoUniversalAlcancaOAcervo',
    rodar: instituicao.checkEixoUniversalAlcancaOAcervo,
    variantes: [
      {
        /**
         * O defeito real, com outro campo: a regiao alcancava 17 obras de
         * 26.288 e era oferecida como um filtro qualquer.
         */
        como: 'era preenchida em menos de 90% das obras',
        arquivos: { ...universalSadio(), [OBRAS_JSON]: obrasJson(100, 50) },
      },
      {
        como: 'compositor preenchido em menos de 90% das obras',
        arquivos: { ...universalSadio(), [OBRAS_JSON]: obrasJson(100, 100, 40) },
      },
      {
        /**
         * A regiao da obra e herdada do compositor, e a do compositor sai da
         * cidadania. Se ela cair, a regiao de 25 mil obras cai junto, calada.
         */
        como: 'cidadania abaixo do piso no seed de compositores',
        arquivos: { ...universalSadio(), [SEED_EXTERNO]: seedExterno(50, 10) },
      },
      {
        como: 'acervo servido vazio, o que deixaria a verificacao sem o que medir',
        arquivos: { ...universalSadio(), [OBRAS_JSON]: '[]' },
      },
      {
        como: 'o arquivo servido ficou ilegivel',
        arquivos: { ...universalSadio(), [OBRAS_JSON]: '{ nao e json' },
      },
    ],
    limpos: [
      { como: 'era, compositor e cidadania acima do piso', arquivos: universalSadio() },
      {
        /** Noventa e cinco por cento passa: o piso e noventa, e nao cem. */
        como: 'cobertura em 95%, acima do piso e abaixo de cem',
        arquivos: { ...universalSadio(), [OBRAS_JSON]: obrasJson(100, 95, 95) },
      },
      {
        como: 'acervo grande, tudo preenchido',
        arquivos: { ...universalSadio(), [OBRAS_JSON]: obrasJson(500) },
      },
    ],
    limites: [
      'mede era e compositor no arquivo servido: a regiao e derivada, e se mede pela cidadania',
      'conta cidadania por regex no seed, e nao entende lista construida em tempo de execucao',
      'nao cobra eixo SELETIVO \u2014 exigir 90% de movimento estetico levaria a inventar filiacao',
    ],
  },

  {
    nome: 'checkFonteNaoCriaEntidade',
    rodar: instituicao.checkFonteNaoCriaEntidade,
    variantes: [
      {
        /**
         * O defeito real, na linha exata: `porId.set(p.id, ...)` escreve no
         * mapa de OBRAS usando o id da PARTITURA. Foi assim que 1.331 obras
         * falsas entraram no catalogo.
         */
        como: 'a ligacao escreve uma OBRA com o id da PARTITURA',
        arquivos: {
          ...fonteSadia(),
          [UNIFICADO_ACERVO]: ligacaoSadia().replace(
            "pendentes.push({ recurso: 'PARTITURA', recursoId: p.id });",
            'porId.set(p.id, { id: p.id });'
          ),
        },
      },
      {
        /** Nao criar e nao enfileirar e descartar em silencio. */
        como: 'a ligacao nao enfileira o que nao casou',
        arquivos: {
          ...fonteSadia(),
          [UNIFICADO_ACERVO]: ligacaoSadia().replace(
            "      pendentes.push({ recurso: 'PARTITURA', recursoId: p.id });\n",
            ''
          ),
        },
      },
      {
        como: 'a fila sumiu do dominio',
        arquivos: { ...fonteSadia(), [RECURSO_DO_CATALOGO]: 'export const nada = 1;' },
      },
      {
        como: 'o servico nao serve a fila',
        arquivos: { ...fonteSadia(), [SERVICO_DO_ACERVO]: "secao === 'OBRAS'" },
      },
      {
        /** Sem o numero no resumo, a tela nao teria de onde declarar nada. */
        como: 'o resumo do servico nao conta a fila',
        arquivos: { ...fonteSadia(), [SERVICO_DO_ACERVO]: "secao === 'PENDENTES'" },
      },
    ],
    limpos: [
      { como: 'enfileira o que nao casou, e a fila aparece na tela', arquivos: fonteSadia() },
      {
        /** Escrever no mapa com o id da OBRA e o caminho correto. */
        como: 'escreve no mapa usando o id da obra encontrada',
        arquivos: {
          ...fonteSadia(),
          [UNIFICADO_ACERVO]: ligacaoSadia().replace(
            'porId.set(alvo, { ...obra });',
            'porId.set(alvo, { ...obra, scoreRefs: [ref] });'
          ),
        },
      },
      {
        /**
         * Comentario que EXPLICA a duplicata corrigida nao e a duplicata.
         * A tela e o unificado citam o defeito para que ele nao volte.
         */
        como: 'o codigo CITA o defeito antigo num comentario',
        arquivos: {
          ...fonteSadia(),
          [UNIFICADO_ACERVO]:
            '/* Aqui havia porId.set(p.id, {...}), que criou 1.331 obras falsas. */\n' +
            ligacaoSadia(),
        },
      },
    ],
    limites: [
      'le o corpo de ligarPartituras ate o primeiro fecho em coluna zero',
      'confere presenca de `pendentes.push`: nao confere se o motivo esta certo',
      'confere que o servico CONTA a fila: nao confere que o numero esteja certo',
      'nao olha mais a tela \u2014 a fila deixou de ser assunto de quem estuda, e virou assunto de quem cataloga',
    ],
  },

  {
    nome: 'checkPapelEEixoProprio',
    rodar: instituicao.checkPapelEEixoProprio,
    variantes: [
      {
        /**
         * O defeito real: papel como atributo. Sem `atuacoes`, um cantor volta
         * a ser "um compositor que tem uma voz", e um violinista que nunca
         * compos nao tem onde existir.
         */
        como: 'Pessoa perdeu as atuacoes',
        arquivos: { ...papelSadio(), [PESSOA_DO_CATALOGO]: 'export interface Pessoa { nome: string }' },
      },
      {
        como: 'a resolucao de instrumento sumiu, e o vocabulario volta a crescer sozinho',
        arquivos: {
          ...papelSadio(),
          [VOCABULARIO]: vocabularioSadio().replace(
            'export function resolverInstrumento(g) { return undefined; }',
            ''
          ),
        },
      },
      {
        /** Nao-vacuidade: tres instrumentos passariam em tudo e nao catalogam nada. */
        como: 'vocabulario com pouquissimos instrumentos',
        arquivos: { ...papelSadio(), [VOCABULARIO]: vocabularioSadio(3) },
      },
      {
        como: 'faltam tessituras',
        arquivos: { ...papelSadio(), [VOCABULARIO]: vocabularioSadio(20, 2) },
      },
      {
        /**
         * O vocabulario existe e esta VAZIO — que e o estado em que uma
         * migracao malfeita o deixa. Passaria em "os nomes existem" e nao
         * catalogaria nada.
         */
        como: 'vocabulario declarado e sem nenhum instrumento nem voz',
        arquivos: { ...papelSadio(), [VOCABULARIO]: vocabularioSadio(0, 0) },
      },
    ],
    limpos: [
      { como: 'vocabulario completo e Pessoa com atuacoes', arquivos: papelSadio() },
      {
        como: 'vocabulario maior que o minimo',
        arquivos: { ...papelSadio(), [VOCABULARIO]: vocabularioSadio(40) },
      },
      {
        como: 'Pessoa com atuacoes e outros campos ao redor',
        arquivos: {
          ...papelSadio(),
          [PESSOA_DO_CATALOGO]:
            'export interface Pessoa {\n  nomeCanonico: string;\n  atuacoes: AtuacaoMusical[];\n  periodIds: string[];\n}',
        },
      },
    ],
    limites: [
      'conta entradas por regex: nao confere se o instrumento existe de verdade',
      'exige `atuacoes` na Pessoa e nao verifica se alguem a preenche',
      'nao confere se o vocabulario cobre o que as fontes usam',
    ],
  },

  {
    nome: 'checkAtlasEAcervoMesmaVerdade',
    rodar: instituicao.checkAtlasEAcervoMesmaVerdade,
    variantes: [
      {
        /**
         * O defeito real: a tela do mapa contava por `DEFAULT_WORKS`, projecao
         * do repertorio proprio, enquanto a biblioteca lia o catalogo canonico.
         * 17 obras contra 24.957, e as duas telas "certas".
         */
        como: 'a tela do mapa volta a contar por DEFAULT_WORKS',
        arquivos: {
          ...mapaSadio(),
          [TELA_DO_MAPA]: ['atlasService.vista({ eraId });', 'const n = DEFAULT_WORKS.length;'].join(NL),
        },
      },
      {
        como: 'a tela do mapa nao usa o servico',
        arquivos: { ...mapaSadio(), [TELA_DO_MAPA]: 'const n = 0;' },
      },
      {
        como: 'o servico deixa de ler o catalogo canonico',
        arquivos: { ...mapaSadio(), [SERVICO_DO_MAPA]: 'export function rotaDoMarcador() {}' },
      },
      {
        /** Sem foco, o mapa volta a emitir 9.245 pontos no Romantismo. */
        como: 'o mapa perde a regra de foco e volta a emitir toda obra',
        arquivos: { ...mapaSadio(), [MAPA_DO_ATLAS]: 'const obras = acervo.obras.filter(() => true);' },
      },
      {
        como: 'o marcador deixa de apontar para a ficha',
        arquivos: {
          ...mapaSadio(),
          [SERVICO_DO_MAPA]: "import { todasAsObras, todosOsCompositores } from '../../data/acervo-unificado';",
        },
      },
    ],
    limpos: [
      { como: 'servico le o canonico, tela usa o servico, mapa tem foco', arquivos: mapaSadio() },
      {
        /** Comentario que EXPLICA o defeito antigo nao e o defeito. */
        como: 'a tela CITA DEFAULT_WORKS num comentario',
        arquivos: {
          ...mapaSadio(),
          [TELA_DO_MAPA]: ['/* Antes contava por DEFAULT_WORKS e countWorks. */', 'atlasService.vista({ eraId });'].join(NL),
        },
      },
      {
        como: 'servico com mais funcoes ao redor',
        arquivos: {
          ...mapaSadio(),
          [SERVICO_DO_MAPA]:
            [mapaSadio()[SERVICO_DO_MAPA], 'export function cobertura() { return todasAsObras(); }'].join(NL),
        },
      },
    ],
    limites: [
      'confere que a tela chama o servico: nao confere que o numero exibido venha dele',
      'a igualdade real entre mapa e biblioteca e medida por teste, e nao por leitura de fonte',
      'le a tela sem comentarios, e nao entende importacao indireta',
    ],
  },

];

describe('cada sinal de arquivo fixo e coberto em todas as formas conhecidas', () => {
  for (const sinal of SINAIS_DE_ARQUIVO_FIXO) {
    describe(sinal.nome, () => {
      for (const variante of sinal.variantes) {
        it(`acusa: ${variante.como}`, () => {
          for (const [caminho, conteudo] of Object.entries(variante.arquivos)) {
            injectFile(caminho, conteudo);
          }
          expect(
            sinal.rodar().length,
            `nao viu "${variante.como}"`
          ).toBeGreaterThan(0);
        });
      }

      for (const limpo of sinal.limpos) {
        it(`nao acusa: ${limpo.como}`, () => {
          /**
           * Exigencia mais forte que na outra tabela: o conteudo injetado
           * substitui TUDO o que este verificador enxerga, entao codigo certo
           * tem de produzir ZERO achados, e nao apenas zero num arquivo.
           */
          const caminhos = Object.keys(limpo.arquivos);
          for (const [caminho, conteudo] of Object.entries(limpo.arquivos)) {
            injectFile(caminho, conteudo);
          }

          /**
           * Cobra o mundo INJETADO, e nao a arvore inteira.
           *
           * Alguns destes sinais sao hibridos: leem o arquivo fixo E varrem o
           * repositorio. `checkValueOutsideTable` compara a tabela do
           * documento com todo valor de XP do codigo, entao exigir zero
           * achados obrigaria o repositorio de verdade a caber numa tabela de
           * uma linha — e o teste passaria a falhar por algo que nao esta
           * provando.
           *
           * O que este caso prova e mais preciso: codigo correto, no mundo que
           * este caso monta, nao produz acusacao sobre esse mundo.
           */
          expect(
            sinal.rodar().filter((f) => caminhos.includes(f.file)),
            `acusou codigo correto: "${limpo.como}"`
          ).toEqual([]);
        });
      }

      it('declara o que nao alcanca', () => {
        expect(sinal.limites.length, 'nenhum limite declarado').toBeGreaterThan(0);
        for (const limite of sinal.limites) {
          expect(limite.length).toBeGreaterThan(20);
        }
      });
    });
  }
});

describe('a costura de arquivo fixo funciona', () => {
  it('sem injecao, o verificador le o repositorio de verdade', () => {
    /**
     * Se `readSource` estivesse quebrado e devolvesse sempre vazio, todos os
     * casos acima passariam sem medir nada — e a varredura de producao ficaria
     * cega. Esta e a prova de que a costura some quando ninguem a usa.
     */
    expect(seguranca.checkGuardCoversEveryAudience()).toEqual([]);
    expect(seguranca.checkSessionTeardown()).toEqual([]);
  });

  it('a injecao de fato troca o que o verificador le', () => {
    expect(seguranca.checkSessionTeardown()).toEqual([]);
    injectFile(AUTH, `export class A { public async logout(): Promise<void> {\n    return;\n  } }`);
    expect(seguranca.checkSessionTeardown().length).toBeGreaterThan(0);
  });

  it('todo sinal de arquivo fixo tem variantes e limpos', () => {
    for (const s of SINAIS_DE_ARQUIVO_FIXO) {
      expect(s.variantes.length, s.nome).toBeGreaterThanOrEqual(3);
      expect(s.limpos.length, s.nome).toBeGreaterThanOrEqual(3);
    }
  });
});


// ---------------------------------------------------------------------------
// checkText: cinco grupos, e nao uma lista de achados
// ---------------------------------------------------------------------------

/**
 * `checkText` nao devolve achados: devolve cinco grupos nomeados — ortografia,
 * pontuacao, mojibake, inacabado e ingles — porque o pente fino os apresenta
 * como cinco linhas separadas no relatorio.
 *
 * Nao cabe em nenhuma das duas tabelas acima, e fingir que cabe seria pior que
 * deixar de fora: o `rodar()` teria de achatar os grupos, e o teste passaria a
 * provar que ALGUMA coisa foi vista, sem saber qual. Aqui cada grupo e cobrado
 * pelo nome.
 */
const GRUPOS_DE_TEXTO: {
  grupo: 'ortografia' | 'pontuacao' | 'mojibake' | 'inacabado' | 'ingles';
  variantes: { como: string; file: string; content: string }[];
  limpos: { como: string; file: string; content: string }[];
}[] = [
  {
    grupo: 'ortografia',
    variantes: [
      {
        como: 'voce sem acento',
        file: 'src/ui/components/tx/Tx1.tsx',
        content: `export const A = () => <p>Bem-vinda, voce voltou</p>;`,
      },
      {
        como: 'licao sem acento',
        file: 'src/ui/components/tx/Tx2.tsx',
        content: `const titulo = 'Primeira licao do modulo';`,
      },
      {
        como: 'disponivel sem acento',
        file: 'src/ui/components/tx/Tx3.tsx',
        content: `const aviso = 'Nenhum horario disponivel para esta semana';`,
      },
    ],
    limpos: [
      {
        como: 'as mesmas palavras acentuadas',
        file: 'src/ui/components/ty/Ty1.tsx',
        content: `export const B = () => <p>Bem-vinda, você voltou à lição</p>;`,
      },
      {
        /**
         * `nivelamento` contem `nivel` e esta certo. Sem a exigencia de borda,
         * o verificador mandaria acentuar o que nao se acentua.
         */
        como: 'palavra maior que contem a sequencia sem acento',
        file: 'src/ui/components/ty/Ty2.tsx',
        content: `const titulo = 'Prova de nivelamento';`,
      },
      {
        como: 'texto curto sem nenhuma das palavras da lista',
        file: 'src/ui/components/ty/Ty3.tsx',
        content: `const titulo = 'Atlas';`,
      },
    ],
  },
  {
    grupo: 'ingles',
    variantes: [
      {
        como: 'Loading no meio de uma frase da interface',
        file: 'src/ui/components/tz/Tz1.tsx',
        content: `export const A = () => <p>Loading, aguarde um instante</p>;`,
      },
      {
        como: 'Save changes no rotulo de um botao',
        file: 'src/ui/components/tz/Tz2.tsx',
        content: `const rotulo = 'Save changes, e depois volte ao curso';`,
      },
      {
        como: 'Welcome back numa saudacao',
        file: 'src/ui/components/tz/Tz3.tsx',
        content: `const saudacao = 'Welcome back, que bom te ver';`,
      },
    ],
    limpos: [
      {
        como: 'o mesmo texto em portugues',
        file: 'src/ui/components/ua/Ua1.tsx',
        content: `export const B = () => <p>Carregando</p>;`,
      },
      {
        como: 'rotulo em portugues',
        file: 'src/ui/components/ua/Ua2.tsx',
        content: `const rotulo = 'Salvar alteracoes';`,
      },
      {
        como: 'texto que nao contem frase inglesa da lista',
        file: 'src/ui/components/ua/Ua3.tsx',
        content: `const saudacao = 'Que bom te ver de novo';`,
      },
    ],
  },
  {
    grupo: 'inacabado',
    variantes: [
      {
        como: 'marca de pendencia no texto da tela',
        file: 'src/ui/components/ub/Ub1.tsx',
        content: `const aviso = 'TODO: escrever a descricao';`,
      },
      {
        como: 'outra marca de pendencia',
        file: 'src/ui/components/ub/Ub2.tsx',
        content: `const aviso = 'FIXME rever este texto';`,
      },
      {
        /**
          * A lista de frases inacabadas e FECHADA: lorem ipsum, coming soon,
          * preencher aqui, texto de exemplo. "Termina no meio" nao esta nela, e
          * nao ha como estar — nenhuma regra separa uma frase interrompida de
          * uma frase curta legitima.
          */
        como: 'texto de exemplo esquecido na tela',
        file: 'src/ui/components/ub/Ub3.tsx',
        content: `const aviso = 'Texto de exemplo para esta secao do curso';`,
      },
    ],
    limpos: [
      {
        como: 'frase inteira, com ponto final',
        file: 'src/ui/components/uc/Uc1.tsx',
        content: `const aviso = 'Este curso aborda os fundamentos da harmonia.';`,
      },
      {
        como: 'frase curta sem marca de pendencia',
        file: 'src/ui/components/uc/Uc2.tsx',
        content: `const aviso = 'Comece por aqui';`,
      },
      {
        como: 'reticencias, que sao pontuacao e nao abandono',
        file: 'src/ui/components/uc/Uc3.tsx',
        content: `const aviso = 'Carregando o acervo...';`,
      },
    ],
  },
];

describe('checkText cobre cada um dos cinco grupos', () => {
  for (const { grupo, variantes, limpos } of GRUPOS_DE_TEXTO) {
    describe(grupo, () => {
      for (const variante of variantes) {
        it(`acusa: ${variante.como}`, () => {
          injectSources([variante]);
          const achados = texto.checkText()[grupo];

          expect(
            achados.some((f: { file: string }) => f.file === variante.file),
            `o grupo "${grupo}" nao viu "${variante.como}"`
          ).toBe(true);
        });
      }

      for (const limpo of limpos) {
        it(`nao acusa: ${limpo.como}`, () => {
          injectSources([limpo]);
          const achados = texto.checkText()[grupo];

          expect(
            achados.filter((f: { file: string }) => f.file === limpo.file),
            `o grupo "${grupo}" acusou texto correto: "${limpo.como}"`
          ).toEqual([]);
        });
      }
    });
  }
});

// ---------------------------------------------------------------------------
// A trava: a cobertura nao encolhe, e o que falta esta escrito
// ---------------------------------------------------------------------------

/**
 * Tres verificadores nao entram em nenhuma das tabelas, e o motivo esta aqui
 * porque lista de excecao sem motivo vira lista de esquecimento.
 *
 * Os dois primeiros verificam a PROPRIA suite: se o inventario fosse injetado,
 * o teste estaria provando um inventario de mentira. Eles sao cobrados em
 * `checkers-fire.test.ts`, contra o repositorio de verdade, que e o unico
 * lugar onde a resposta deles significa alguma coisa.
 *
 * O terceiro agrega as dez perguntas de prontidao sobre sete areas e dezenas
 * de arquivos; ele tem teste proprio, e o relatorio que ele produz e checado
 * por `report-curation.test.ts`.
 */
const FORA_DAS_TABELAS: Record<string, string> = {
  checkEveryCheckerIsWired:
    'verifica a propria suite: injetar o inventario seria provar um inventario de mentira',
  checkEveryCheckerHasProof:
    'verifica a propria suite, pelo mesmo motivo',
  checkReadiness:
    'agrega as dez perguntas sobre sete areas; tem teste proprio e relatorio curado',
};

/**
 * O que `checkText` NAO alcanca, escrito.
 *
 * `uiStrings` decide o que e frase e o que e identificador antes de qualquer
 * verificacao de texto, e duas decisoes dele limitam os cinco grupos:
 *
 *   1. **Texto com menos de oito caracteres nao e examinado.** "Loading"
 *      sozinho passa; "Loading, aguarde" nao.
 *
 *   2. **String ASCII de ate tres palavras, sem acento, e tratada como
 *      identificador.** E o que impede classe utilitaria, nome de variante e
 *      chave de icone de virarem achado. O preco e que "Nenhum horario
 *      disponivel" — tres palavras, sem acento — fica invisivel.
 *
 * Havia uma terceira, pior, ja corrigida: QUALQUER string de letras e espacos
 * sem acento era classificada como caminho. O grupo que existe para achar
 * falta de acento era cego a texto sem acento nenhum. Consertar isso descobriu
 * nove erros de acentuacao e dezesseis de pontuacao em texto que o aluno le.
 */
const LIMITES_DE_TEXTO = [
  'texto com menos de oito caracteres nao chega a nenhum dos cinco grupos',
  'string ASCII de ate tres palavras sem acento e tratada como identificador, e nao como frase',
  'a lista de frases inacabadas e fechada: interrupcao fora dela nao e reconhecida',
];

describe('checkText declara o que nao alcanca', () => {
  it('os limites estao escritos', () => {
    expect(LIMITES_DE_TEXTO.length).toBeGreaterThanOrEqual(3);
    for (const limite of LIMITES_DE_TEXTO) {
      expect(limite.length).toBeGreaterThan(30);
    }
  });
});

describe('a cobertura de sinais nao encolhe', () => {
  it('todo verificador esta coberto aqui ou declarado fora, com motivo', () => {
    const cobertos = new Set([
      ...SINAIS.map((s) => s.nome),
      ...SINAIS_DE_ARQUIVO_FIXO.map((s) => s.nome),
      'checkText',
      ...Object.keys(FORA_DAS_TABELAS),
    ]);

    const descobertos = checkerInventory()
      .map((c) => c.nome)
      .filter((n) => !/^checker/.test(n) && !cobertos.has(n));

    expect(
      descobertos,
      'verificador sem cobertura de ponta a ponta e sem motivo declarado'
    ).toEqual([]);
  });

  it('a lista de excecoes nao cresce sem que alguem repare', () => {
    // Tres. Cada uma com o porque escrito acima, e nenhuma delas por preguica.
    expect(Object.keys(FORA_DAS_TABELAS).length).toBe(3);
    for (const motivo of Object.values(FORA_DAS_TABELAS)) {
      expect(motivo.length, 'motivo curto demais para ser motivo').toBeGreaterThan(30);
    }
  });
});


// ---------------------------------------------------------------------------
// Nao-vacuidade contra o repositorio DE VERDADE
// ---------------------------------------------------------------------------

/**
 * A lacuna que as tabelas acima nao fecham.
 *
 * Uma tabela de cobertura prova que o verificador enxerga o FIXTURE. Nao prova
 * que o fixture se pareca com o codigo real — e quando os dois divergem, o
 * verificador passa verde nos testes e cego no repositorio.
 *
 * Aconteceu. `checkPublicDomainRepertoire` procurava registros na forma
 * `{ id: '...' }`; o acervo e construido por chamadas a `faixa(...)`. Os
 * fixtures usavam a forma errada tambem, entao a cobertura estava verde. O
 * verificador varria trinta e tres faixas e enxergava ZERO — e o relatorio
 * afirmava que o repertorio estava conferido.
 *
 * Todo verificador que le uma estrutura tem um leitor por tras: as regras de
 * audiencia, os pares rota-tela, as chaves de armazenamento, as linhas da
 * tabela de contagem, as rotas servidas. Se qualquer um deles devolver vazio,
 * os verificadores que dependem dele passam sem medir nada.
 *
 * Aqui os leitores sao cobrados contra o repositorio de verdade. Nao se cobra
 * um numero exato — isso quebraria a cada rota nova — mas o piso, que so cai
 * se o leitor parar de entender o formato.
 */
describe('os leitores enxergam o repositorio de verdade', () => {
  it('as regras de audiencia sao lidas', () => {
    /** Se vier vazio, tudo que decide protecao por audiencia passa sem medir. */
    expect(seguranca.audienceRules().length).toBeGreaterThan(10);
  });

  it('os pares rota-tela sao lidos do outlet', () => {
    expect(seguranca.routeToScreen().length).toBeGreaterThan(30);
  });

  it('as chaves de armazenamento sao lidas dos repositorios', () => {
    expect(seguranca.chavesDeArmazenamento().size).toBeGreaterThan(10);
  });

  it('as linhas da tabela de contagem sao lidas do documento', () => {
    expect(economia.countingRows().length).toBeGreaterThan(5);
  });

  it('as rotas servidas sao lidas do outlet', () => {
    expect(fluxo.servedRoutes().length).toBeGreaterThan(30);
  });

  it('o acervo do player e enxergado pelo verificador de dominio publico', () => {
    /**
     * A prova direta do defeito que motivou esta secao: injeta um autor fora
     * do rol NA FORMA REAL do arquivo, e exige a acusacao. Se o verificador
     * voltar a nao entender o formato, isto falha.
     */
    const real = readFileSync('src/data/seed-player-repertoire.ts', 'utf-8');
    expect(fluxo.checkPublicDomainRepertoire()).toEqual([]);

    injectFile(
      'src/data/seed-player-repertoire.ts',
      real.replace(
        "faixa('ref-diapasao'",
        "faixa('intruso', 'Tema', 'Autor Que Nao Esta No Rol', 'Barroco', 'Do', '4/4', 60, 'C4:1');\n  faixa('ref-diapasao'"
      )
    );
    expect(fluxo.checkPublicDomainRepertoire().length).toBeGreaterThan(0);
  });

  it('o acervo do player tem faixas, e nao so a estrutura para te-las', () => {
    const real = readFileSync('src/data/seed-player-repertoire.ts', 'utf-8');
    const faixas = [...real.matchAll(/faixa\(\s*'/g)].length;
    expect(faixas, 'o repertorio ficou sem faixa nenhuma').toBeGreaterThan(20);
  });
});
