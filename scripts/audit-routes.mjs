/**
 * Auditoria de rotas e de audiência.
 *
 * Responde três perguntas que não se respondem lendo tela por tela:
 *
 *   1. Toda tela tem rota? Toda rota tem tela?
 *   2. Cada rota declara a quem serve — visitante, logado, ou os dois?
 *   3. Alguma tela mostra a visitante o que só faz sentido para quem entrou?
 *
 * A terceira é a que pega o defeito real: "Ver meus certificados" numa tela
 * que um visitante abre.
 *
 * Uso:  node scripts/audit-routes.mjs [--json]
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, basename } from 'node:path';

const walk = (d) =>
  !existsSync(d)
    ? []
    : readdirSync(d).flatMap((e) => {
        const f = join(d, e);
        return statSync(f).isDirectory() ? walk(f) : [f];
      });

const norm = (p) => relative('.', p).split('\\').join('/');

const TELAS = walk('src/ui/screens').filter((f) => /Screen\.tsx$/.test(f));
const OUTLET = readFileSync('src/ui/screens/AppRouterOutlet.tsx', 'utf-8');

const AUDIENCIA_PATH = 'src/ui/navigation/audiencia.ts';
const temTabela = existsSync(AUDIENCIA_PATH);
const tabela = temTabela ? readFileSync(AUDIENCIA_PATH, 'utf-8') : '';

// ---------------------------------------------------------------------------
// 1. rotas declaradas no outlet
// ---------------------------------------------------------------------------
/**
 * Rotas de verdade vêm de `===` e de `.startsWith(`. O que vem de
 * `.includes(` é FRAGMENTO — `/curriculum` casa dentro de
 * `/academia/course/X/curriculum`, e a audiência quem decide é o prefixo do
 * caminho inteiro. Misturar os dois fazia a auditoria cobrar declaração de
 * coisa que não é rota.
 */
const routes = [
  ...new Set(
    [...OUTLET.matchAll(/currentPath\s*(?:===|\.startsWith\()\s*'([^']+)'/g)].map((m) => m[1])
  ),
].sort();

const fragmentos = [
  ...new Set(
    [...OUTLET.matchAll(/currentPath\s*\.includes\(\s*'([^']+)'/g)].map((m) => m[1])
  ),
].sort();

// ---------------------------------------------------------------------------
// 2. telas montadas pelo outlet
// ---------------------------------------------------------------------------
const montadas = new Set(
  [...OUTLET.matchAll(/<([A-Z][A-Za-z0-9]*Screen)[\s/>]/g)].map((m) => m[1])
);

/**
 * Frases que só fazem sentido para quem entrou.
 *
 * Um visitante que lê "seus certificados" ou "continuar de onde parou" recebe
 * uma promessa que a tela não pode cumprir — ele não tem progresso nenhum.
 */
const SO_LOGADO = [
  /meus? certificados?/i,
  /seus? certificados?/i,
  /meu aprendizado/i,
  /seu progresso/i,
  /continuar de onde parou/i,
  /minhas? matrículas?/i,
  /seu portfólio/i,
  /suas? conquistas?/i,
  /editar meu/i,
  /minha meta/i,
];

const lines = [];
const problemas = [];

/** A rota está declarada como exigindo login na tabela de audiência? */
const regrasExigemLogin = [
  ...tabela.matchAll(/rota:\s*'([^']+)',[\s\S]{0,80}?audiencia:\s*'exigeLogin'/g),
].map((m) => m[1]);

const prefixoExigeLogin = (rota) =>
  regrasExigemLogin.some((p) => rota.startsWith(p));

/**
 * Que rotas levam a cada tela.
 *
 * O outlet é uma cadeia de `if (currentPath ...) { return <Tela />; }`. Cortar
 * o arquivo em cada `if` dá o bloco de cada rota, e dentro dele está a tela
 * que ela monta. É leitura da estrutura real, não janela de N caracteres para
 * trás — que errava sempre que um bloco era comprido.
 */
const rotasPorTela = new Map();
for (const bloco of OUTLET.split(/\bif\s*\(/).slice(1)) {
  const rotasDoBloco = [...bloco.matchAll(/currentPath\s*(?:===|\.startsWith\(|\.includes\()\s*'([^']+)'/g)].map(
    (m) => m[1]
  );
  if (rotasDoBloco.length === 0) continue;

  // só o que está antes do próximo `return` pertence a este bloco
  const corpo = bloco.slice(0, bloco.indexOf('}') === -1 ? undefined : bloco.indexOf('}') + 1);
  for (const m of corpo.matchAll(/<([A-Z][A-Za-z0-9]*Screen)[\s/>]/g)) {
    const lista = rotasPorTela.get(m[1]) ?? [];
    lista.push(...rotasDoBloco);
    rotasPorTela.set(m[1], lista);
  }
}

const screens = TELAS.map((file) => {
  const nome = basename(file, '.tsx');
  const src = readFileSync(file, 'utf-8');
  // comentários fora: o que importa é o que chega à tela
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

  const roteada = montadas.has(nome);
  const cheсaSessao =
    /getActiveSession|useCurrentUser|useSessao|currentUser/.test(code);

  // frases de logado que aparecem fora de qualquer guarda de sessão
  const vazamentos = SO_LOGADO.filter((re) => re.test(code)).map((re) => String(re));
  // Atrás da guarda de audiência, a tela nunca chega ao visitante — e então
  // a frase de logado não é vazamento. Só vaza o que está em rota pública.
  const rotasDaTela = rotasPorTela.get(nome) ?? [];
  const alcancavelPorVisitante =
    rotasDaTela.length === 0 || rotasDaTela.some((r) => !prefixoExigeLogin(r));
  const vazaParaVisitante = vazamentos.length > 0 && !cheсaSessao && alcancavelPorVisitante;

  return { nome, file: norm(file), roteada, cheсaSessao, vazamentos, vazaParaVisitante };
});

// A tabela declara ROTAS, não nomes de tela. A cobertura se mede por prefixo.
const prefixosDeclarados = [
  ...tabela.matchAll(/rota:\s*'([^']+)'/g),
].map((m) => m[1]);

const rotaCoberta = (r) =>
  prefixosDeclarados.some((p) => (p === '/' ? r === '/' : r.startsWith(p)));

const rotasSemAudiencia = routes.filter((r) => !rotaCoberta(r));

// ---------------------------------------------------------------------------
// 🔴 ROTA QUE EXISTE E NADA APONTA PARA ELA
// ---------------------------------------------------------------------------
/**
 * O ESPELHO DO LINK MORTO, E O DEFEITO QUE PASSOU POR AQUI.
 *
 * `orphans` pergunta "existe rota que monta esta tela?". `/founder/licoes` foi
 * criada com rota no outlet e **nenhum link em lugar nenhum** — e passou, porque
 * a pergunta que se fazia era a outra.
 *
 * São dois defeitos opostos e igualmente fatais:
 *
 *   link → rota inexistente   já pego: "todo destino de navegação existe"
 *   rota ← nenhum link        não era pego: a tela existe e ninguém chega
 *
 * O segundo é mais silencioso: nada quebra, nenhum erro aparece, e a tela
 * simplesmente não é usada por ninguém. Foi assim que três telas do console
 * ficaram construídas e invisíveis.
 *
 * COMO SE MEDE
 * ------------
 * Só rotas **sem parâmetro** entram. Rota com `:id` é alcançada por texto
 * montado — `/academia/lesson/${l.id}` — e procurar por literal ali daria
 * falso positivo em tudo.
 *
 * O link pode ser o caminho literal ou a constante da tabela (`ROUTES.X`): as
 * duas formas são usadas no projeto, e aceitar só uma acusaria a outra.
 *
 * LIMITE DECLARADO: pontos de entrada externos não têm link interno por
 * natureza — a raiz, a tela de entrada, a verificação pública de credencial.
 * Eles estão na lista abaixo, e a lista é curta de propósito: cada item nela é
 * uma rota que o verificador deixa de vigiar.
 */
const ENTRADAS_EXTERNAS = new Set([
  '/',
  '/auth/login',
  '/auth/callback',
  '/credential',
  '/verificar',
]);

/** Onde as rotas são DECLARADAS. Citar a rota aqui não é apontar para ela. */
const DECLARACOES = new Set([
  'src/ui/screens/AppRouterOutlet.tsx',
  'src/ui/navigation/router.tsx',
  'src/ui/navigation/audiencia.ts',
]);

const FONTES = [...walk('src'), ...(existsSync('server') ? walk('server') : [])].filter((f) =>
  /\.(ts|tsx)$/.test(f)
);

/** O texto de tudo que pode conter um link, fora dos arquivos de declaração. */
const TEXTO_DOS_LINKS = FONTES.filter((f) => !DECLARACOES.has(norm(f)) && !/\.test\./.test(f))
  .map((f) => readFileSync(f, 'utf-8'))
  .join('\n');

/** ROUTES.CHAVE: 'caminho' — para aceitar a navegação pela constante. */
const CHAVE_DA_ROTA = new Map(
  [...readFileSync('src/ui/navigation/router.tsx', 'utf-8').matchAll(
    /([A-Z][A-Z0-9_]*)\s*:\s*'([^']+)'/g
  )].map((m) => [m[2], m[1]])
);

/**
 * Rota estática, sem parte variável.
 *
 * Duas formas ficam de fora, e pela mesma razão: o caminho real é montado em
 * tempo de execução, e procurar por literal ali acusaria tudo.
 *
 *   `/academia/lesson/:id`  declara o parâmetro
 *   `/practice/attempt/`    casa por prefixo, e o que vem depois é o parâmetro
 *
 * A segunda é a que o outlet usa com `.startsWith(`, e é por isso que a barra
 * final importa: ela é a assinatura do prefixo dinâmico.
 */
/**
 * Rota estática, sem parte variável.
 *
 * Duas formas ficam de fora, e pela mesma razão: o caminho real é montado em
 * tempo de execução, e procurar por literal ali acusaria tudo.
 *
 *   `/academia/lesson/:id`  declara o parâmetro
 *   `/practice/attempt/`    casa por prefixo, e o que vem depois é o parâmetro
 *
 * A segunda é a que o outlet usa com `.startsWith(`, e é por isso que a barra
 * final importa: ela é a assinatura do prefixo dinâmico.
 */
const semParametro = (r) => !r.includes(':') && !r.endsWith('/');

const temQuemAponte = (rota) => {
  /** Literal, entre aspas simples, duplas ou crase. */
  if (TEXTO_DOS_LINKS.includes(`'${rota}'`)) return true;
  if (TEXTO_DOS_LINKS.includes(`"${rota}"`)) return true;
  if (TEXTO_DOS_LINKS.includes(`\`${rota}\``)) return true;

  /** Ou pela constante da tabela. */
  const chave = CHAVE_DA_ROTA.get(rota);
  return Boolean(chave && TEXTO_DOS_LINKS.includes(`ROUTES.${chave}`));
};

/**
 * 🔴 A PERGUNTA É SOBRE A TELA, E NÃO SOBRE A GRAFIA DA ROTA.
 *
 * A primeira versão media rota a rota, e acusava `/kids` — que divide o mesmo
 * `if` com `/kids/manage`, este sim linkado. A tela abre; só aquele apelido não
 * é usado. Acusar ali seria pedir para alguém escrever um link inútil, e é
 * assim que um verificador perde a confiança de quem o lê.
 *
 * O que importa é: **existe algum caminho até esta tela?** Basta uma das rotas
 * que a montam estar linkada.
 */
const alcancavelPorAlgumCaminho = (rotasDaTela) =>
  rotasDaTela.some(
    (r) =>
      /**
       * Fragmento não é rota: `/curriculum` casa DENTRO de
       * `/academia/course/X/curriculum`, e o caminho de verdade é montado com
       * o identificador do curso. O cabeçalho deste arquivo já separa os dois,
       * e medir fragmento por literal acusaria todos eles.
       */
      fragmentos.includes(r) ||
      /** Prefixo dinâmico: o caminho é montado, e não dá para medir por literal. */
      !semParametro(r) ||
      ENTRADAS_EXTERNAS.has(r) ||
      temQuemAponte(r)
  );

const telasInalcancaveis = screens
  .filter((t) => t.roteada)
  .map((t) => ({ tela: t.nome, rotas: rotasPorTela.get(t.nome) ?? [] }))
  .filter((t) => t.rotas.length > 0 && !alcancavelPorAlgumCaminho(t.rotas));

/** As rotas dessas telas, para o relatório dizer por onde elas deveriam abrir. */
const inalcancaveis = telasInalcancaveis.map((t) => `${t.tela}  (${t.rotas.join(' ')})`);

// ---------------------------------------------------------------------------
// relatório
// ---------------------------------------------------------------------------
const orphans = screens.filter((t) => !t.roteada);
const semSessao = screens.filter((t) => !t.cheсaSessao);
const leaking = screens.filter((t) => t.vazaParaVisitante);


lines.push(`rotas declaradas no outlet          ${routes.length}`);
lines.push(`fragmentos de caminho (.includes)   ${fragmentos.length}  ${fragmentos.join(' ')}`);
lines.push(`telas encontradas                   ${screens.length}`);
lines.push(`telas montadas pelo outlet          ${screens.length - orphans.length}`);
lines.push(`telas órfãs (existem e não abrem)   ${orphans.length}`);
lines.push(`telas que distinguem visitante      ${screens.length - semSessao.length}`);
lines.push(
  `rotas com audiência declarada       ${temTabela ? routes.length - rotasSemAudiencia.length : '— (tabela não existe)'} de ${routes.length}`
);
lines.push(`telas que vazam conteúdo de logado  ${leaking.length}`);
lines.push(`rotas que ninguém alcança           ${inalcancaveis.length}`);

if (inalcancaveis.length) {
  lines.push('\n--- INALCANÇÁVEIS: a rota existe e nada aponta para ela ---');
  for (const r of inalcancaveis) lines.push(`  ${r}`);
}

if (orphans.length) {
  lines.push('\n--- ÓRFÃS: existem no código e nenhuma rota as abre ---');
  for (const t of orphans) lines.push(`  ${t.nome.padEnd(34)} ${t.file}`);
}

if (leaking.length) {
  lines.push('\n--- VAZAM PARA VISITANTE: mostram conteúdo de logado sem checar sessão ---');
  for (const t of leaking) {
    lines.push(`  ${t.nome.padEnd(34)} ${t.vazamentos.join(' ')}`);
  }
}

if (!temTabela) {
  lines.push(
    `\n--- SEM TABELA DE AUDIÊNCIA: nenhuma rota declara a quem serve (${AUDIENCIA_PATH}) ---`
  );
} else if (rotasSemAudiencia.length) {
  lines.push('\n--- ROTAS SEM AUDIÊNCIA DECLARADA ---');
  for (const r of rotasSemAudiencia) lines.push(`  ${r}`);
}

const output = lines.join('\n');

if (process.argv.includes('--json')) {
  console.log(
    JSON.stringify(
      {
        routes,
        screens,
        orphans: orphans.map((t) => t.nome),
        leaking: leaking.map((t) => t.nome),
        inalcancaveis,
      },
      null,
      2
    )
  );
} else {
  console.log(output);
}

problemas.push(...orphans, ...leaking);
process.exitCode = 0;
