/**
 * Núcleo do pente fino.
 *
 * Um "checador" é uma função que recebe o repositório lido e devolve
 * **achados**. Achado tem arquivo, linha e o que está errado — sem isso não é
 * achado, é opinião.
 *
 * REGRA DESTE ARCABOUÇO
 * ---------------------
 * Nenhum checador afirma qualidade. Cada um verifica **uma propriedade
 * mecanicamente verificável** e diz o que verificou. O que não dá para
 * verificar por máquina está listado em `docs/harness/72_QUALITY_SWEEP.md` na seção
 * do que NÃO é coberto — e continua não coberto até alguém cobrir.
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

export const SEVERITY = {
  BLOCKS: 'bloqueia',
  FIX: 'corrigir',
  WATCH: 'observar',
};

export function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const nome of readdirSync(dir)) {
    if (nome === 'node_modules' || nome === '.git' || nome === 'dist') continue;
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) walk(caminho, acc);
    else acc.push(caminho);
  }
  return acc;
}

export const norm = (p) => relative('.', p).split('\\').join('/');

/**
 * Remove comentários preservando a numeração das linhas.
 *
 * Isto não é detalhe: sem remover, o pente fino acusa o comentário que
 * EXPLICA por que a ressalva de curso livre existe como se fosse a promessa
 * indevida que ele previne. Errar assim faz o relatório perder a confiança de
 * quem o lê, e um relatório em que ninguém confia não protege nada.
 */
export function stripComments(code) {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, (b) => b.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:\w])\/\/[^\n]*/g, (m, p) => p + ' '.repeat(m.length - p.length));
}

/** Fontes da aplicação. `codigo` é o conteúdo sem comentários. */
/**
 * Arquivos-fonte injetados, para provar que um verificador acusa.
 *
 * POR QUE ESTA COSTURA EXISTE
 * ---------------------------
 * "Passou" só significa alguma coisa se o verificador **consegue** falhar. Eu
 * vinha provando isso à mão — reintroduzia o defeito, via a acusação, desfazia
 * — e não deixava prova nenhuma. Quarenta e um dos quarenta e três
 * verificadores estavam nesse estado: verdes, e sem ninguém nunca ter visto
 * um deles acusar.
 *
 * Com esta costura, `tests/checkers-fire.test.ts` injeta um arquivo com o
 * defeito e exige que o verificador o encontre. A prova passa a ser parte da
 * suíte, e não lembrança de quem escreveu.
 */
let arquivosInjetados = [];

export function injectSources(arquivos) {
  arquivosInjetados = arquivos.map(({ file, content }) => ({
    file,
    content,
    code: stripComments(content),
  }));
}

export function clearInjectedSources() {
  arquivosInjetados = [];
  arquivosFixosInjetados = new Map(); // limpa as DUAS costuras: um afterEach só
}
/**
 * A segunda costura: arquivo FIXO.
 *
 * `injectSources` cobre os verificadores que varrem a árvore. Vinte e um
 * outros não varrem nada — leem um caminho conhecido e só: a tabela da
 * economia, o outlet, `audiencia.ts`, a guarda, o repositório do Academy, o
 * serviço de autenticação. Nenhum deles podia ser provado, porque não havia
 * como pôr um defeito na frente deles sem escrever no repositório de verdade.
 *
 * Eram justamente os verificadores de segurança mais pesados: quem cobre
 * herança de audiência, cobertura da guarda e permanência do dado do aluno
 * depois de publicar. Verificação que ninguém nunca viu acusar, no lugar em
 * que acusar mais importa.
 *
 * `readSource` é a mesma leitura, passando por um mapa que o teste pode
 * preencher. Em produção o mapa está vazio e a função é `readFileSync`.
 */
let arquivosFixosInjetados = new Map();

/** Põe um conteúdo no lugar do arquivo daquele caminho, só para esta leitura. */
export function injectFile(caminho, conteudo) {
  arquivosFixosInjetados.set(caminho, conteudo);
}

/** Lê o caminho, preferindo o que foi injetado. */
export function readSource(caminho) {
  if (arquivosFixosInjetados.has(caminho)) return arquivosFixosInjetados.get(caminho);
  return readFileSync(caminho, 'utf-8');
}

/** Existe de verdade, ou foi injetado para esta leitura. */
export function sourceExists(caminho) {
  return arquivosFixosInjetados.has(caminho) || existsSync(caminho);
}


/**
 * A árvore de `src`, lida UMA vez por processo.
 *
 * POR QUE O CACHE, E POR QUE ELE É SEGURO
 * ---------------------------------------
 * Cada verificador chama `sources()`. O pente fino chama quarenta e dois
 * verificadores; a tabela de cobertura chama um por teste, trezentas vezes. Sem
 * cache, isso era **trezentas varreduras completas** de oitenta e quatro
 * arquivos, com leitura de disco e remoção de comentários em cada uma — e a
 * suíte de testes da própria suíte custava cento e seis segundos.
 *
 * O cache é seguro porque estes processos são de vida curta e não escrevem em
 * `src`: o pente fino lê e relata, o teste lê e injeta. A injeção **não**
 * invalida o cache, e não precisa — ela acrescenta arquivos ao resultado sem
 * tocar nos reais.
 *
 * Se algum dia um verificador passar a escrever em `src`, este cache passa a
 * mentir. É por isso que `limparCacheDeFontes` existe e está exportada.
 */
let cacheDeFontes = null;

/** Descarta a árvore lida, para quem precisar reler o disco. */
export function limparCacheDeFontes() {
  cacheDeFontes = null;
}

export function sources() {
  if (cacheDeFontes === null) {
    cacheDeFontes = walk('src')
      .filter((f) => ['.ts', '.tsx'].includes(extname(f)))
      .map((f) => {
        const content = readFileSync(f, 'utf-8');
        return { file: norm(f), content, code: stripComments(content) };
      });
  }

  return arquivosInjetados.length ? [...cacheDeFontes, ...arquivosInjetados] : cacheDeFontes;
}

export function screens() {
  return sources().filter((f) => /Screen\.tsx$/.test(f.file));
}

/** Componentes e telas: tudo o que desenha interface. */
export function uiFiles() {
  return sources().filter((f) => f.file.endsWith('.tsx'));
}

/**
 * Texto que chega ao usuário.
 *
 * Extrai literais de string e de template, descartando comentários, imports,
 * nomes de classe do Tailwind, ids, chaves e caminhos. O que sobra é, com boa
 * aproximação, o que a pessoa lê na tela.
 */
export function uiStrings(file, content) {
  const findings = [];
  const lines = stripComments(content).split('\n');

  /**
   * Não é texto lido por ninguém: classe do Tailwind, caminho, MIME, CSS
   * embutido, identificador. Acusar isso é gastar a atenção de quem lê o
   * relatório com ruído.
   */
  const ehTecnico = (t) =>
    /^[a-z0-9_\-./#@]+$/i.test(t) ||
    /^[/?#]|\?\w+=|^<!--/.test(t) || // caminho de rota, consulta, marcador de máquina
    (/[/{@#]|:\s*$/.test(t) && /^[a-z0-9_\-./#@$:{} ]+$/i.test(t)) || // caminho com interpolação
    // ^ a exigência de um caractere DE CAMINHO é o conserto de um cegueira:
    //   sem ela, `Primeira licao do modulo` — letras e espaços, sem acento —
    //   era classificada como caminho e nunca chegava à verificação de
    //   acentuação. O grupo que existe para achar falta de acento era cego a
    //   texto sem acento nenhum.
    /^[\w+.-]+\/[\w+.-]+/.test(t) || // MIME
    /[{};]\s*$|^\s*[.#@][\w-]+\s*\{|font-family:|url\(/.test(t) || // CSS
    /^(\s*(?:[a-z]+:)?(?:-?[a-z]+-)*[a-z]+(?:-[\w[\]().,%/]+)*\s+)+$/i.test(t) || // classes utilitárias
    (/^[\w\s-]+$/.test(t) && !/[À-ÿ]/.test(t) && t.trim().split(/\s+/).length <= 3);

  lines.forEach((line, i) => {
    if (/^\s*import\s/.test(line)) return;

    const semTecnico = line
      .replace(/className\s*=\s*(\{[^}]*\}|"[^"]*"|'[^']*'|\{`[^`]*`\})/g, '')
      .replace(
        /\b(id|key|slug|path|to|href|src|name|type|kind|variant|icon|data-[\w-]+)\s*=\s*("[^"]*"|'[^']*'|\{[^}]*\})/g,
        ''
      );

    /**
     * `${...}` sai fora antes de qualquer análise.
     *
     * Dentro de uma interpolação mora código — `c.numero`, `leitura.nivel` —,
     * e código não segue ortografia do português. Sem tirar, o pente fino
     * mandava acentuar nome de propriedade.
     */
    const semInterpolacao = (t) => t.replace(/\$\{[^}]*\}/g, '•').trim();

    for (const m of semTecnico.matchAll(/(['"`])((?:\\.|(?!\1)[^\\])*)\1/g)) {
      // julgar antes E depois de tirar a interpolação: `/curso/${id}/anotacoes`
      // é caminho antes, e vira frase com espaços depois
      if (ehTecnico(m[2])) continue;
      const texto = semInterpolacao(m[2]);
      if (texto.length < 8 || ehTecnico(texto)) continue;
      findings.push({ file, line: i + 1, texto });
    }

    // texto solto em JSX: >Alguma coisa<
    for (const m of semTecnico.matchAll(/>([^<>{}\n]{8,})</g)) {
      const texto = semInterpolacao(m[1]);
      if (texto.length < 8 || ehTecnico(texto)) continue;
      findings.push({ file, line: i + 1, texto });
    }
  });

  return findings;
}

export function report(nome, findings, severity = SEVERITY.FIX) {
  return { nome, severity, findings };
}

export function printReport(results) {
  const lines = [];
  let blockers = 0;
  let fixables = 0;

  for (const r of results) {
    const n = r.findings.length;
    const mark = n === 0 ? '  ok  ' : r.severity === SEVERITY.BLOCKS ? ' FALHA' : ' AVISO';
    lines.push(`${mark}  ${r.nome.padEnd(52)} ${n === 0 ? '' : n}`);
    if (n > 0) {
      if (r.severity === SEVERITY.BLOCKS) blockers += n;
      else if (r.severity === SEVERITY.FIX) fixables += n;
      for (const a of r.findings.slice(0, 12)) {
        const where = a.line ? `${a.file}:${a.line}` : a.file;
        lines.push(`         ${where}  ${a.detail ?? a.texto ?? ''}`);
      }
      if (n > 12) lines.push(`         … e mais ${n - 12}`);
    }
  }

  lines.push('');
  lines.push(`bloqueios: ${blockers} · a corrigir: ${fixables}`);
  return { texto: lines.join('\n'), blockers, fixables };
}

// ---------------------------------------------------------------------------
// A suíte vigia a si mesma
// ---------------------------------------------------------------------------

/**
 * Verificador que existe e ninguém roda, ou que ninguém provou.
 *
 * O DEFEITO QUE ISTO FECHA
 * ------------------------
 * `checkReadiness` chegou a provar que uma lição era editável procurando a
 * **string** `'LICAO'` num arquivo. Bastaria escrevê-la num comentário para o
 * verificador ficar verde. Era teatro: verificava o nome, não o conteúdo.
 *
 * A regra geral, que vale para todo verificador: **procurar o símbolo que faz
 * a coisa, e não a palavra que a descreve**. E a regra de processo, que é esta
 * função: todo verificador precisa estar ligado ao pente fino **e** ter um
 * teste que o viu acusar.
 *
 * Sem o segundo, um verificador pode nascer vazio e passar anos verde. Já
 * aconteceu aqui três vezes — `checkDevToolInProduction` nasceu sem pegar o
 * caso que o motivou, e duas regex viraram backspace e nunca casaram com nada.
 */
export function checkerInventory() {
  const arquivos = walk('scripts/qa').filter((f) => f.endsWith('.mjs'));
  const orquestrador = readFileSync('scripts/qa.mjs', 'utf-8');
  /**
   * ARQUIVO DE DECLARAÇÃO NÃO É TESTE.
   *
   * `qa-modules.d.ts` declara o TIPO de cada verificador para o TypeScript.
   * Ele cita todos os nomes — e citar não é provar: um verificador recém-escrito
   * passava a contar como "visto acusando" no instante em que alguém declarava
   * o tipo dele, sem uma linha de teste.
   *
   * Aconteceu com dois verificadores desta mesma sessão, e a vigilância ficou
   * verde sobre cobertura que não existia — que é exatamente o que ela existe
   * para impedir.
   */
  const testes = walk('tests')
    .filter((f) => (f.endsWith('.ts') || f.endsWith('.tsx')) && !f.endsWith('.d.ts'))
    .map((f) => readFileSync(f, 'utf-8'))
    .join('\n');

  const inventario = [];
  for (const arquivo of arquivos) {
    const src = readFileSync(arquivo, 'utf-8');
    /**
     * `check[A-Z]` e nao `check\w+`: `checkerInventory` e auxiliar desta
     * propria vigilancia, e acusa-la por "nao estar ligada ao pente fino"
     * seria o verificador reclamando de si mesmo.
     */
    for (const m of src.matchAll(/export function (check[A-Z]\w*)/g)) {
      const nome = m[1];
      inventario.push({
        nome,
        arquivo: norm(arquivo),
        ligado: orquestrador.includes(nome),
        provado: testes.includes(nome),
      });
    }
  }
  return inventario;
}

/** Verificador escrito e nunca chamado pelo pente fino. */
export function checkEveryCheckerIsWired() {
  return checkerInventory()
    .filter((c) => !c.ligado)
    .map((c) => ({
      file: c.arquivo,
      detail: `\`${c.nome}\` existe e o pente fino não o chama — verificação que ninguém roda`,
    }));
}

/**
 * Verificador sem teste que o tenha visto acusar.
 *
 * "Passou" só significa alguma coisa se o verificador **consegue** falhar.
 * O teste que o nomeia é a prova de que alguém reintroduziu o defeito e viu
 * a acusação aparecer.
 */
export function checkEveryCheckerHasProof() {
  return checkerInventory()
    .filter((c) => !c.provado)
    .map((c) => ({
      file: c.arquivo,
      detail: `\`${c.nome}\` não é citado por nenhum teste — ninguém provou que ele acusa`,
    }));
}
