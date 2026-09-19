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
      { routes, screens, orphans: orphans.map((t) => t.nome), leaking: leaking.map((t) => t.nome) },
      null,
      2
    )
  );
} else {
  console.log(output);
}

problemas.push(...orphans, ...leaking);
process.exitCode = 0;
