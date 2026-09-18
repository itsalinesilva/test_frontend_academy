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
 * verificar por máquina está listado em `docs/harness/QUALIDADE.md` na seção
 * do que NÃO é coberto — e continua não coberto até alguém cobrir.
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

export const GRAVIDADE = {
  BLOQUEIA: 'bloqueia',
  CORRIGIR: 'corrigir',
  OBSERVAR: 'observar',
};

export function percorrer(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const nome of readdirSync(dir)) {
    if (nome === 'node_modules' || nome === '.git' || nome === 'dist') continue;
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) percorrer(caminho, acc);
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
export function semComentarios(codigo) {
  return codigo
    .replace(/\/\*[\s\S]*?\*\//g, (b) => b.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:\w])\/\/[^\n]*/g, (m, p) => p + ' '.repeat(m.length - p.length));
}

/** Fontes da aplicação. `codigo` é o conteúdo sem comentários. */
export function fontes() {
  return percorrer('src')
    .filter((f) => ['.ts', '.tsx'].includes(extname(f)))
    .map((f) => {
      const conteudo = readFileSync(f, 'utf-8');
      return { arquivo: norm(f), conteudo, codigo: semComentarios(conteudo) };
    });
}

export function telas() {
  return fontes().filter((f) => /Screen\.tsx$/.test(f.arquivo));
}

/** Componentes e telas: tudo o que desenha interface. */
export function interfaces() {
  return fontes().filter((f) => f.arquivo.endsWith('.tsx'));
}

/**
 * Texto que chega ao usuário.
 *
 * Extrai literais de string e de template, descartando comentários, imports,
 * nomes de classe do Tailwind, ids, chaves e caminhos. O que sobra é, com boa
 * aproximação, o que a pessoa lê na tela.
 */
export function textosDeInterface(arquivo, conteudo) {
  const achados = [];
  const linhas = semComentarios(conteudo).split('\n');

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

  linhas.forEach((linha, i) => {
    if (/^\s*import\s/.test(linha)) return;

    const semTecnico = linha
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
      achados.push({ arquivo, linha: i + 1, texto });
    }

    // texto solto em JSX: >Alguma coisa<
    for (const m of semTecnico.matchAll(/>([^<>{}\n]{8,})</g)) {
      const texto = semInterpolacao(m[1]);
      if (texto.length < 8 || ehTecnico(texto)) continue;
      achados.push({ arquivo, linha: i + 1, texto });
    }
  });

  return achados;
}

export function relatar(nome, achados, gravidade = GRAVIDADE.CORRIGIR) {
  return { nome, gravidade, achados };
}

export function imprimir(resultados) {
  const linhas = [];
  let bloqueios = 0;
  let correcoes = 0;

  for (const r of resultados) {
    const n = r.achados.length;
    const marca = n === 0 ? '  ok  ' : r.gravidade === GRAVIDADE.BLOQUEIA ? ' FALHA' : ' AVISO';
    linhas.push(`${marca}  ${r.nome.padEnd(52)} ${n === 0 ? '' : n}`);
    if (n > 0) {
      if (r.gravidade === GRAVIDADE.BLOQUEIA) bloqueios += n;
      else if (r.gravidade === GRAVIDADE.CORRIGIR) correcoes += n;
      for (const a of r.achados.slice(0, 12)) {
        const onde = a.linha ? `${a.arquivo}:${a.linha}` : a.arquivo;
        linhas.push(`         ${onde}  ${a.detalhe ?? a.texto ?? ''}`);
      }
      if (n > 12) linhas.push(`         … e mais ${n - 12}`);
    }
  }

  linhas.push('');
  linhas.push(`bloqueios: ${bloqueios} · a corrigir: ${correcoes}`);
  return { texto: linhas.join('\n'), bloqueios, correcoes };
}
