/**
 * Pente fino de texto.
 *
 * O que ESTE arquivo verifica é o que dá para verificar por máquina sem
 * inventar competência que não existe:
 *
 *   - ortografia de palavras acentuadas escritas sem acento (lista fechada,
 *     só palavras em que a forma sem acento NÃO é outra palavra válida);
 *   - pontuação e espaçamento;
 *   - mojibake — texto salvo com codificação errada;
 *   - marcador de trabalho inacabado que escapou para a tela;
 *   - inglês vazando em interface em português;
 *   - markdown quebrado no meio do conteúdo do aluno.
 *
 * O que ele NÃO verifica, e ninguém deve fingir que verifica: concordância,
 * regência, coesão, e se a frase faz sentido no lugar em que está. Isso é
 * revisão humana, está declarado em `docs/harness/QUALIDADE.md` como não
 * coberto e está aberto em `CLAUDE_TODO.md`.
 */
import { fontes, interfaces, textosDeInterface } from './nucleo.mjs';

/**
 * Palavras cuja forma sem acento não é outra palavra do português.
 *
 * "esta/está" e "e/é" ficam de fora de propósito: as duas formas existem e
 * decidir qual cabe exige ler a frase. Acusar as duas encheria o relatório de
 * ruído e ensinaria a ignorar o relatório.
 *
 * Pelo mesmo motivo saíram "pratica", "publica", "pratico" e "publico": são
 * formas verbais corretas sem acento. "O docente **publica** as tarefas" e
 * "Você **pratica** e é medido" estavam certas, e o pente fino mandava
 * acentuar as duas. Uma lista que acusa texto correto perde a autoridade de
 * acusar o incorreto.
 */
const SEM_ACENTO = [
  ['voce', 'você'], ['nao', 'não'], ['sao', 'são'], ['entao', 'então'],
  ['tambem', 'também'], ['atraves', 'através'], ['proprio', 'próprio'],
  ['propria', 'própria'], ['musica', 'música'], ['musicas', 'músicas'],
  ['exercicio', 'exercício'], ['exercicios', 'exercícios'],
  ['licao', 'lição'], ['licoes', 'lições'], ['modulo', 'módulo'],
  ['modulos', 'módulos'], ['periodo', 'período'], ['historia', 'história'],
  ['possivel', 'possível'], ['disponivel', 'disponível'], ['nivel', 'nível'],
  ['inicio', 'início'], ['ultimo', 'último'], ['ultima', 'última'],
  ['proximo', 'próximo'], ['proxima', 'próxima'], ['minimo', 'mínimo'],
  ['maximo', 'máximo'], ['numero', 'número'], ['codigo', 'código'],
  ['relatorio', 'relatório'], ['repertorio', 'repertório'],
  ['conservatorio', 'conservatório'], ['area', 'área'], ['areas', 'áreas'],
  ['pagina', 'página'], ['paginas', 'páginas'], ['sera', 'será'],
  ['estao', 'estão'], ['tera', 'terá'], ['apos', 'após'],
  ['alem', 'além'], ['porem', 'porém'], ['ninguem', 'ninguém'],
  ['alguem', 'alguém'], ['ingles', 'inglês'], ['portugues', 'português'],
  ['tres', 'três'], ['memoria', 'memória'],
  ['obrigatorio', 'obrigatório'], ['secao', 'seção'], ['secoes', 'seções'],
  ['versao', 'versão'], ['versoes', 'versões'], ['opcao', 'opção'],
  ['opcoes', 'opções'], ['avaliacao', 'avaliação'], ['avaliacoes', 'avaliações'],
  ['certificacao', 'certificação'], ['duracao', 'duração'],
  ['informacao', 'informação'], ['informacoes', 'informações'],
  ['configuracao', 'configuração'], ['anotacao', 'anotação'],
  ['anotacoes', 'anotações'], ['gravacao', 'gravação'], ['gravacoes', 'gravações'],
  ['formacao', 'formação'], ['descricao', 'descrição'], ['posicao', 'posição'],
  ['conclusao', 'conclusão'], ['revisao', 'revisão'], ['progressao', 'progressão'],
  ['extensao', 'extensão'], ['dificil', 'difícil'], ['facil', 'fácil'],
  ['rapido', 'rápido'], ['unico', 'único'], ['unica', 'única'],
  ['basico', 'básico'], ['basica', 'básica'], ['teorico', 'teórico'],
  ['harmonico', 'harmônico'], ['ritmico', 'rítmico'],
  ['tonica', 'tônica'], ['cromatico', 'cromático'],
  ['diatonico', 'diatônico'],
];

/** Palavras inglesas que não devem aparecer numa interface em português. */
const INGLES = [
  'Loading', 'Submit', 'Cancel', 'Delete', 'Search results', 'No results',
  'Coming soon', 'Not found', 'Try again', 'Sign in', 'Sign up', 'Log out',
  'Settings', 'Dashboard', 'Overview', 'Welcome back', 'Get started',
  'Continue learning', 'My courses', 'Your progress', 'Save changes',
];

/**
 * Marca de trabalho inacabado.
 *
 * São duas expressões, e a separação importa. Os marcadores de código são
 * MAIÚSCULOS e conferidos com diferenciação de caixa, porque com `/i` a frase
 * "Pesquise em **todo** o catálogo" casava com `TODO` — e o pente fino
 * acusava como pendência uma frase perfeitamente escrita. Ensinar a ignorar o
 * relatório é pior do que não tê-lo.
 */
const MARCADOR_DE_CODIGO = /\b(TODO|FIXME|XXX|HACK|TBD)\b/;
const FRASE_INACABADA = /\b(lorem ipsum|coming soon|preencher aqui|texto de exemplo)\b/i;
const INACABADO = {
  test: (t) => MARCADOR_DE_CODIGO.test(t) || FRASE_INACABADA.test(t),
};

/**
 * Mojibake: UTF-8 lido como latin-1.
 *
 * Construído por código de caractere para não depender de este arquivo estar
 * salvo na codificação certa — que é justamente o que se quer detectar.
 */
const MOJIBAKE = new RegExp(
  [
    '\\u00C3[\\u0080-\\u00BF]',
    '\\u00E2\\u0080[\\u0099\\u009C\\u009D\\u0093]',
    '\\u00C2[\\u00A0-\\u00BF]',
    '\\uFFFD',
  ].join('|')
);

export function checarTexto() {
  const ortografia = [];
  const pontuacao = [];
  const mojibake = [];
  const inacabado = [];
  const ingles = [];

  for (const { arquivo, conteudo } of interfaces()) {
    for (const { texto, linha } of textosDeInterface(arquivo, conteudo)) {
      if (MOJIBAKE.test(texto)) {
        mojibake.push({ arquivo, linha, detalhe: `codificação corrompida: ${texto.slice(0, 60)}` });
      }

      for (const [errado, certo] of SEM_ACENTO) {
        const re = new RegExp(`(^|[^\\wÀ-ÿ])${errado}(?=$|[^\\wÀ-ÿ])`, 'i');
        if (re.test(texto)) {
          ortografia.push({
            arquivo,
            linha,
            detalhe: `"${errado}" -> "${certo}"  em: ${texto.slice(0, 55)}`,
          });
        }
      }

      if (/\S {2,}\S/.test(texto)) {
        pontuacao.push({ arquivo, linha, detalhe: `espaço duplo: ${texto.slice(0, 55)}` });
      }
      if (/\S +[,.;:!?](\s|$)/.test(texto)) {
        pontuacao.push({ arquivo, linha, detalhe: `espaço antes de pontuação: ${texto.slice(0, 55)}` });
      }
      if (/[,;](?=[A-Za-zÀ-ÿ])/.test(texto)) {
        pontuacao.push({ arquivo, linha, detalhe: `falta espaço após pontuação: ${texto.slice(0, 55)}` });
      }
      if (/\.\.\./.test(texto)) {
        pontuacao.push({ arquivo, linha, detalhe: `use reticências tipográficas: ${texto.slice(0, 55)}` });
      }

      if (INACABADO.test(texto)) {
        inacabado.push({ arquivo, linha, detalhe: `marca de inacabado: ${texto.slice(0, 55)}` });
      }

      for (const p of INGLES) {
        if (new RegExp(`(^|[^\\w])${p}([^\\w]|$)`).test(texto)) {
          ingles.push({
            arquivo,
            linha,
            detalhe: `"${p}" em interface em português: ${texto.slice(0, 45)}`,
          });
        }
      }
    }
  }

  return { ortografia, pontuacao, mojibake, inacabado, ingles };
}

/**
 * Markdown do conteúdo do aluno.
 *
 * Negrito sem fechar, link sem destino e cabeçalho colado no parágrafo
 * anterior aparecem como lixo na tela do aluno, não como erro de compilação:
 * nenhuma ferramenta do projeto acusaria isso antes desta.
 */
export function checarMarkdownDoConteudo() {
  const quebrado = [];
  for (const { arquivo, conteudo } of fontes()) {
    if (!arquivo.startsWith('src/data/')) continue;

    for (const m of conteudo.matchAll(/markdown:\s*`([\s\S]*?)`\s*[,}]/g)) {
      const md = m[1];
      const linha = conteudo.slice(0, m.index).split('\n').length;

      if ((md.match(/\*\*/g) ?? []).length % 2 !== 0) {
        quebrado.push({ arquivo, linha, detalhe: 'negrito ** sem fechar' });
      }
      for (const link of md.matchAll(/\[[^\]]*\]\(\s*\)/g)) {
        quebrado.push({ arquivo, linha, detalhe: `link sem destino: ${link[0].slice(0, 40)}` });
      }
      if (/\S\n#{1,6}\s/.test(md)) {
        quebrado.push({ arquivo, linha, detalhe: 'cabeçalho colado no parágrafo anterior' });
      }
      if (MOJIBAKE.test(md)) {
        quebrado.push({ arquivo, linha, detalhe: 'codificação corrompida no conteúdo' });
      }
      const inacabado = md.match(MARCADOR_DE_CODIGO) ?? md.match(FRASE_INACABADA);
      if (inacabado) {
        quebrado.push({ arquivo, linha, detalhe: `conteúdo inacabado: "${inacabado[0]}"` });
      }
    }
  }
  return quebrado;
}
