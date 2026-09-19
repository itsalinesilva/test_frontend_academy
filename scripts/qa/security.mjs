/**
 * Pente fino de segurança e de persistência.
 *
 * O medo concreto é um só: **dado de um aluno aparecer para outro**. Num
 * produto sem banco, em que tudo mora no localStorage de um navegador que
 * pode ser compartilhado, esse risco não é teórico — é o modo de falha
 * natural da arquitetura.
 *
 * Daí as verificações:
 *
 *   1. toda leitura de dado de aluno filtra por `userId`;
 *   2. nenhuma chave de armazenamento é usada por dois repositórios;
 *   3. nada do aluno entra na lista de conteúdo reescrito pela publicação;
 *   4. privilégio de administrador nunca é decidido no cliente;
 *   5. nenhum dado pessoal vai parar no console;
 *   6. nenhuma injeção de HTML sem sanitização;
 *   7. o encerramento de sessão apaga de fato a sessão local.
 */
import { readFileSync, existsSync } from 'node:fs';
import { sources, stripComments } from './core.mjs';

const repositorios = () => sources().filter((f) => f.file.startsWith('src/repositories/'));

/**
 * Chaves de armazenamento por repositório.
 *
 * Duas chaves iguais em repositórios diferentes significam que um grava por
 * cima do outro — e ninguém descobre isso até o aluno perder o progresso.
 */
export function chavesDeArmazenamento() {
  const table = new Map();
  for (const { file, code: content } of repositorios()) {
    for (const m of content.matchAll(/^\s*[A-Z_]+:\s*'(amd_[a-z0-9_]+)'/gm)) {
      const lista = table.get(m[1]) ?? [];
      lista.push(file);
      table.set(m[1], lista);
    }
    for (const m of content.matchAll(/=\s*'(amd_[a-z0-9_]+)'/g)) {
      const lista = table.get(m[1]) ?? [];
      if (!lista.includes(file)) lista.push(file);
      table.set(m[1], lista);
    }
  }
  return table;
}

export function checkKeyCollision() {
  const findings = [];
  for (const [chave, arquivos] of chavesDeArmazenamento()) {
    if (arquivos.length > 1) {
      findings.push({
        file: arquivos[0],
        detail: `chave "${chave}" usada por ${arquivos.length} repositórios: ${arquivos.join(', ')}`,
      });
    }
  }
  return findings;
}

/**
 * Leitura de dado de aluno sem filtrar por usuário.
 *
 * Método público que recebe `userId` e lê uma chave de aluno tem de restringir
 * o resultado a esse `userId`. Sem isso, `listarCertificados(userId)` devolve
 * os certificados de todo mundo que já usou aquele navegador.
 */
const CHAVES_DO_ALUNO =
  /PROGRESS|ATTEMPTS|SUBMISSIONS|CERTIFICATES|HISTORY|SESSIONS|RESULTS|MASTERY|STREAK|GOALS|AVALIACOES|FREQUENCIA|NOTAS|LEADERBOARD/;

export function checkPerUserFilter() {
  const findings = [];
  for (const { file, code: content } of repositorios()) {
    // corpo de cada método público que recebe userId
    const metodos = content.matchAll(
      /public\s+async\s+(\w+)\s*\(([^)]*userId[^)]*)\)[^{]*\{([\s\S]*?)\n\s{2}\}/g
    );
    for (const m of metodos) {
      const [, nome, , corpo] = m;
      if (!CHAVES_DO_ALUNO.test(corpo)) continue;
      // grava? então não precisa filtrar a leitura, precisa endereçar o dono
      const ehLeitura = /^(get|list|find|buscar|todas?|do|da)/i.test(nome);
      if (!ehLeitura) continue;

      const filtra =
        /\.userId\s*===\s*userId/.test(corpo) ||
        /\[userId\]/.test(corpo) ||
        /mapa\[userId\]/.test(corpo);
      if (!filtra) {
        findings.push({
          file,
          line: content.slice(0, m.index).split('\n').length,
          detail: `${nome}() lê dado de aluno e não filtra por userId — devolve o de todos`,
        });
      }
    }
  }
  return findings;
}

/**
 * O que a publicação de conteúdo pode reescrever.
 *
 * Já aconteceu de o catálogo antigo grudar no navegador porque só gravava
 * quando a chave faltava. A correção foi versionar e reescrever — e o risco
 * que ela cria é o inverso: reescrever por cima do progresso do aluno.
 */
export function checkPublishKeepsStudentData() {
  const file = 'src/repositories/academy.repository.ts';
  if (!existsSync(file)) return [{ file, detail: 'repositório do Academy não existe' }];
  const src = stripComments(readFileSync(file, 'utf-8'));
  const bloco = src.match(/conteudoPublicado\s*\([^)]*\)[^{]*\{([\s\S]*?)\n\s{2}\}/);
  if (!bloco) return [{ file, detail: 'conteudoPublicado() não encontrado' }];

  const findings = [];
  for (const chave of ['PROGRESS', 'ATTEMPTS', 'SUBMISSIONS', 'CERTIFICATES', 'HISTORY']) {
    if (new RegExp(`STORAGE_KEYS\\.${chave}\\b`).test(bloco[1])) {
      findings.push({
        file,
        detail: `publicar conteúdo apagaria ${chave} — isso é dado do aluno`,
      });
    }
  }
  return findings;
}

/**
 * Privilégio administrativo decidido no cliente.
 *
 * A lista de e-mails administrativos é do servidor. Se alguma tela compara
 * e-mail ou papel local para liberar `/admin`, basta editar o localStorage
 * para virar administrador.
 */
export function checkAdminAuthority() {
  const findings = [];
  for (const { file, code: content } of sources()) {
    if (file.includes('.test.')) continue;

    for (const m of content.matchAll(/['"`][\w.+-]+@(gmail|hotmail|outlook|yahoo)\.[\w.]+['"`]/g)) {
      findings.push({
        file,
        line: content.slice(0, m.index).split('\n').length,
        detail: `e-mail pessoal no código: ${m[0]} — autoridade não mora no cliente`,
      });
    }

    /**
     * O que importa é o privilégio ser CONCEDIDO, não exibido.
     *
     * `<Badge variant={u.role === 'ADMIN' ? …}>` pinta um selo dentro de um
     * console que a sessão já protegeu — ninguém vira administrador por isso.
     * Perigoso é a comparação abrir caminho: dentro de `if`, antes de um `&&`
     * que decide o que renderizar, ou atribuindo `isAdmin`.
     */
    const perigo =
      /if\s*\([^)]*(role|papel)\s*===\s*['"]ADMIN['"]|(role|papel)\s*===\s*['"]ADMIN['"]\s*&&|isAdmin\s*=\s*(true|user\.|profile\.)/g;
    for (const m of content.matchAll(perigo)) {
      // o serviço de autenticação LÊ `session.isAdmin`, que o servidor assinou
      if (file.endsWith('auth.service.ts')) continue;
      findings.push({
        file,
        line: content.slice(0, m.index).split('\n').length,
        detail: `privilégio decidido localmente: ${m[0]}`,
      });
    }
  }
  return findings;
}

/** Dado pessoal no console: vaza em qualquer máquina com o inspetor aberto. */
export function checkConsoleLeak() {
  const findings = [];
  for (const { file, code: content } of sources()) {
    if (file.includes('.test.')) continue;
    for (const m of content.matchAll(/console\.(log|info|debug|warn|error)\(([^)\n]*)\)/g)) {
      /**
       * O que interessa é o ARGUMENTO, não a mensagem.
       *
       * `console.error('Falha ao carregar o perfil', err)` não vaza nada: a
       * palavra "perfil" está no texto fixo. Vaza `console.log(user)`. Tirar
       * os literais antes de testar é o que separa um caso do outro.
       */
      const argumentos = m[2].replace(/(['"`])(?:\\.|(?!\1)[^\\])*\1/g, '');
      if (
        /\b(user|usuario|email|token|session|sessao|profile|perfil|senha|password|idToken|credential)\b/i.test(
          argumentos
        )
      ) {
        findings.push({
          file,
          line: content.slice(0, m.index).split('\n').length,
          detail: `console com dado pessoal: ${m[0].slice(0, 70)}`,
        });
      }
    }
  }
  return findings;
}

/**
 * HTML injetado sem sanitização: conteúdo do aluno vira script.
 *
 * `innerHTML = ''` esvazia um nó e não injeta nada — é como se limpa o
 * contêiner antes de o Google desenhar o próprio botão. Só conta atribuição
 * com conteúdo.
 */
export function checkHtmlInjection() {
  const findings = [];
  for (const { file, code: content } of sources()) {
    for (const m of content.matchAll(
      /dangerouslySetInnerHTML|innerHTML\s*=(?!\s*(''|""|``))|document\.write|\beval\(|new Function\(/g
    )) {
      findings.push({
        file,
        line: content.slice(0, m.index).split('\n').length,
        detail: `injeção sem sanitização: ${m[0]}`,
      });
    }
  }
  return findings;
}

/** Encerrar sessão tem de apagar a sessão local, não só avisar o servidor. */
export function checkSessionTeardown() {
  const file = 'src/services/application/auth.service.ts';
  if (!existsSync(file)) return [{ file, detail: 'serviço de autenticação não existe' }];
  const src = stripComments(readFileSync(file, 'utf-8'));
  const logout = src.match(/public\s+async\s+logout\s*\([^)]*\)[^{]*\{([\s\S]*?)\n\s{2}\}/);
  if (!logout) return [{ file, detail: 'logout() não encontrado' }];
  const findings = [];
  if (!/clearLocalSession|removeItem\(this\.sessionKey/.test(logout[1])) {
    findings.push({ file, detail: 'logout() não apaga a sessão local' });
  }
  if (!/disableGoogleAutoSelect/.test(logout[1])) {
    findings.push({ file, detail: 'logout() não desliga o login automático do Google' });
  }
  return findings;
}

/**
 * Segredo de credencial versionado.
 *
 * Esta arquitetura **não precisa** de chave secreta de cliente: o servidor
 * verifica a assinatura do ID token contra as chaves públicas do Google. Uma
 * `GOCSPX-…` aparecendo no repositório é, portanto, sempre uma das duas
 * coisas — segredo colado por engano, ou fluxo de autenticação errado.
 *
 * As duas merecem parar o build. O Client ID, esse, é público por natureza e
 * vive em `VITE_GOOGLE_OAUTH_CLIENT_ID`; não é acusado aqui.
 */
export function checkCommittedSecret() {
  const PADROES = [
    [/GOCSPX-[\w-]{10,}/, 'chave secreta de cliente do Google'],
    [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'chave privada'],
    [/AIza[\w-]{30,}/, 'chave de API do Google'],
    [/sk-[A-Za-z0-9]{20,}/, 'chave de API'],
  ];

  const findings = [];
  for (const { file, content } of sources()) {
    for (const [re, o_que] of PADROES) {
      const m = content.match(re);
      if (m) {
        findings.push({
          file,
          line: content.slice(0, m.index).split('\n').length,
          detail: `${o_que} no código — isto nunca entra no repositório`,
        });
      }
    }
  }
  return findings;
}

/**
 * Registro pessoal buscado por identificador, sem dono.
 *
 * `checkPerUserFilter` procura LISTAGEM que não filtra por usuário. Não
 * alcançou o defeito que a auditoria de 19/09 encontrou, porque ali se buscava
 * **um** registro:
 *
 * ```
 *   getAssessmentAttempt(submissionId)  →  a prova de qualquer um
 *   getCertificate(certificateId)       →  o certificado de qualquer um
 * ```
 *
 * Buscar um é tão vazável quanto listar todos — pior, até: o identificador
 * único dá a sensação de que já é uma credencial, quando é só um endereço.
 *
 * A regra: método de serviço que devolve UM registro de pessoa precisa receber
 * `userId` e conferir o dono. Listagens ficam com o verificador anterior.
 */
const PERSONAL_RECORD = /(Submission|Attempt|Certificate|Progress|Enrollment|Result|Evidence|Credential)/;

export function checkRecordOwnership() {
  const findings = [];

  for (const { file, code } of sources()) {
    if (!/\/services\//.test(file) || file.includes('.test.')) continue;

    for (const [i, line] of code.split('\n').entries()) {
      // método público que devolve um registro pessoal, ou nulo
      const m = line.match(
        /public\s+async\s+(\w+)\s*\(([^)]*)\)\s*:\s*Promise<\s*(\w+)\s*\|\s*null\s*>/
      );
      if (!m) continue;

      const [, name, params, returned] = m;
      if (!PERSONAL_RECORD.test(returned)) continue;
      // quem já recebe o usuário está conferindo, ou pode conferir
      if (/\buserId\b/.test(params)) continue;

      findings.push({
        file,
        line: i + 1,
        detail: `\`${name}\` devolve ${returned} sem receber userId — registro de alguém, legível por qualquer um`,
      });
    }
  }
  return findings;
}

// ---------------------------------------------------------------------------
// Hierarquia: visitante · aluno · administração
// ---------------------------------------------------------------------------

const AUDIENCE_FILE = 'src/ui/navigation/audiencia.ts';
const GUARD_FILE = 'src/ui/navigation/GuardaDeAudiencia.tsx';
const OUTLET_FILE = 'src/ui/screens/AppRouterOutlet.tsx';

/** As regras declaradas, como pares rota → audiência. */
function audienceRules() {
  const src = readFileSync(AUDIENCE_FILE, 'utf-8');
  return [...src.matchAll(/rota:\s*'([^']+)',\s*\n?\s*audiencia:\s*'(\w+)'/g)].map((m) => ({
    route: m[1],
    audience: m[2],
  }));
}

/** A audiência que vale para uma rota: prefixo mais longo vence. */
function audienceOf(route, rules) {
  let best = null;
  for (const r of rules) {
    const matches = r.route === '/' ? route === '/' : route.startsWith(r.route);
    if (!matches) continue;
    if (!best || r.route.length > best.route.length) best = r;
  }
  return best;
}

/** Rota → tela, lido do outlet por varredura linha a linha. */
function routeToScreen() {
  const lines = stripComments(readFileSync(OUTLET_FILE, 'utf-8')).split('\n');
  const out = [];
  let pending = [];

  for (const line of lines) {
    for (const m of line.matchAll(
      /currentPath\s*(?:===|\.startsWith\(|\.includes\()\s*'([^']+)'/g
    )) {
      pending.push(m[1]);
    }
    const tag = line.match(/<(\w+Screen)/);
    if (tag && pending.length > 0) {
      for (const route of pending) out.push({ route, screen: tag[1] });
      pending = [];
    }
  }
  return out;
}

/**
 * Tela administrativa alcançável por rota que não exige administração.
 *
 * Era o estado da plataforma até 19/09: a tabela declarava `/admin` como
 * `exigeLogin`, e quem barrava o aluno comum era um efeito no outlet chamando
 * `checkRouteAccess`. Funcionava — mas a hierarquia estava partida em dois
 * sistemas, e só um deles era auditado.
 *
 * Uma tela administrativa criada fora do prefixo `/admin` não seria protegida
 * por ninguém, e a tabela continuaria dizendo que estava tudo certo.
 */
export function checkAdminScreensBehindAdminAudience() {
  const rules = audienceRules();
  const findings = [];

  for (const { route, screen } of routeToScreen()) {
    const isAdminScreen = /^Admin|Console/.test(screen) || route.startsWith('/admin');
    if (!isAdminScreen) continue;

    const rule = audienceOf(route, rules);
    if (rule?.audience === 'exigeAdmin') continue;

    findings.push({
      file: AUDIENCE_FILE,
      detail: `${screen} abre em "${route}", declarada "${rule?.audience ?? 'nada — herda pública'}"`,
    });
  }
  return findings;
}

/**
 * A guarda trata todos os níveis que o tipo declara.
 *
 * Acrescentar um nível e esquecer a guarda produz o pior resultado possível:
 * a rota **parece** protegida na tabela e passa direto no runtime. O tipo é a
 * fonte; a guarda precisa acompanhá-lo.
 */
export function checkGuardCoversEveryAudience() {
  const type = readFileSync(AUDIENCE_FILE, 'utf-8').match(
    /export type Audiencia\s*=\s*([^;]+);/
  );
  if (!type) return [{ file: AUDIENCE_FILE, detail: 'tipo Audiencia não encontrado' }];

  const levels = [...type[1].matchAll(/'(\w+)'/g)].map((m) => m[1]);
  const guard = readFileSync(GUARD_FILE, 'utf-8');

  return levels
    .filter((level) => !guard.includes(`'${level}'`))
    .map((level) => ({
      file: GUARD_FILE,
      detail: `o nível "${level}" existe no tipo e a guarda não o trata`,
    }));
}

/**
 * Rota que PARECE pessoal e herda "pública".
 *
 * A primeira versão desta regra acusava toda rota não declarada, e virou
 * ruído: `/practice/trainer` herdar `exigeLogin` de `/practice` é aperto, não
 * afrouxamento — a intenção está certa e escrita na raiz.
 *
 * O perigo é o contrário, e foi exatamente o que aconteceu: `/academy/result/`
 * herdou **pública** de `/academy`. Ninguém decidiu que a prova de alguém era
 * pública; ela simplesmente caiu no padrão do pai.
 *
 * A primeira tentativa de escrever isto acusava toda rota pessoal em audiência
 * pública, e acusava CÓDIGO CERTO: `/progress` e `/academy/profile` são
 * públicas de propósito — a estrutura do curso aparece a qualquer um, e as
 * telas consultam a sessão para decidir o que mais mostrar. Acusá-las ensinaria
 * a ignorar o verificador.
 *
 * O sinal honesto é a **combinação**: rota que parece registro de pessoa, em
 * audiência pública, servida por tela que **não consulta a sessão**. Foi essa
 * a tríade de `/academy/result/<id>`.
 *
 * Limite conhecido: vê o nome do caminho. Rota pessoal com nome neutro passa,
 * e está anotado em `72_QUALITY_SWEEP.md`.
 */
const PERSONAL_ROUTE =
  /(result|certificate|completion|attempt|submission|progress|history|profile|portfolio|meu-|minha-|my-|inbox|settings)/i;

/** `search/results` é lista de busca, e não registro de ninguém. */
const NOT_PERSONAL = /(search|busca)\//i;

/** A tela sabe quem está perguntando? */
function screenReadsSession(screen) {
  const found = sources().find(
    (f) => f.file.endsWith(`/${screen}.tsx`) || f.file.endsWith(`/${screen}.ts`)
  );
  if (!found) return false;
  return /getActiveSession\(|useCurrentUser\(|useSessao\(/.test(found.code);
}

export function checkPersonalRouteInheritingPublic() {
  const rules = audienceRules();
  const declared = new Set(rules.map((r) => r.route));
  const findings = [];
  const seen = new Set();

  for (const { route, screen } of routeToScreen()) {
    if (seen.has(route) || declared.has(route)) continue;
    seen.add(route);
    if (!PERSONAL_ROUTE.test(route) || NOT_PERSONAL.test(route)) continue;

    const inherited = audienceOf(route, rules);
    if (inherited && inherited.audience !== 'publica') continue;

    // Tela que consulta a sessão decide sozinha o que mostrar a cada público.
    if (screenReadsSession(screen)) continue;

    findings.push({
      file: AUDIENCE_FILE,
      detail:
        `"${route}" (${screen}) parece registro de pessoa, vale como pública ` +
        (inherited ? `herdando de "${inherited.route}"` : 'por omissão') +
        ', e a tela não consulta a sessão',
    });
  }
  return findings;
}
