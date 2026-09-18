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
 * verificar por máquina está listado em `docs/harness/72_PENTE_FINO_QUALIDADE.md` na seção
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
export function sources() {
  return walk('src')
    .filter((f) => ['.ts', '.tsx'].includes(extname(f)))
    .map((f) => {
      const content = readFileSync(f, 'utf-8');
      return { file: norm(f), content, code: stripComments(content) };
    });
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
    /^[a-z0-9_\-./#@$:{} ]+$/i.test(t) || // caminho com interpolação
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
