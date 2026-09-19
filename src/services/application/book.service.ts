import {
  LivroDoConservatorio,
  SecaoDoLivro,
  TipoDeLivro,
  AUTORIA_PADRAO,
  INSTITUICAO,
  RESSALVA_EDITORIAL,
  fundirPreservandoEdicoes,
  validarLivro,
  ProblemaDoLivro,
} from '../../domain/book';
import { AcademyCourse, AcademyModule, AcademyLesson, LessonBlock } from '../../domain/academy';
import { Livreto } from '../../domain/booklet';
import { SinteseDeCurso } from '../../domain/synthesis';

/**
 * Monta os livros do Conservatório a partir do curso.
 *
 * Dois livros por curso, e a divisão não é editorial — é de natureza:
 *
 *  - **Livro de leitura**: o texto, os conceitos, as ilustrações. Lê-se numa
 *    poltrona.
 *  - **Livro de imersão**: as práticas. Cada laboratório vira um exercício
 *    descrito para ser EXECUTADO com o instrumento na mão, e não lido.
 *
 * Separá-los importa porque são usados em momentos diferentes. Um livro que
 * mistura "a escala maior tem este padrão" com "toque a escala vinte vezes
 * com metrônomo" não serve bem a nenhum dos dois momentos.
 */

const ANO = 2026;

// ---------------------------------------------------------------------------
// Conversão de blocos para prosa de livro
// ---------------------------------------------------------------------------

/**
 * Transforma um bloco interativo em texto de livro.
 *
 * O laboratório não existe no papel — mas o que ele pede existe. Em vez de
 * omitir (o que deixaria buracos na argumentação) ou de descrever a interface
 * (inútil em papel), o livro traz a INSTRUÇÃO de estudo equivalente.
 */
function blocoParaLeitura(bloco: LessonBlock): string | null {
  switch (bloco.kind) {
    case 'MARKDOWN':
      return bloco.markdown;

    case 'CALLOUT':
      return `> **${bloco.title}**\n>\n> ${bloco.text.replace(/\n/g, '\n> ')}`;

    case 'AUDIO_EXAMPLE':
      return (
        `**Exemplo sonoro — ${bloco.title}.** ` +
        `${bloco.description ?? ''} Notas: ${bloco.notes.join(' · ')}` +
        (bloco.bpm ? ` (${bloco.bpm} bpm).` : '.')
      );

    case 'INTERVAL_LAB':
      return `**Ao instrumento.** Toque ${bloco.lowerNote} e ${bloco.upperNote}, primeiro em sequência e depois juntas. ${bloco.prompt ?? ''}`.trim();

    case 'CHORD_LAB':
      return `**Ao instrumento.** Monte ${bloco.notes.join(' – ')}. ${bloco.prompt ?? ''}`.trim();

    case 'SCALE_LAB':
      return `**Ao instrumento.** Toque a escala de ${bloco.tonic}, modo ${bloco.mode.toLowerCase().replace(/_/g, ' ')}, subindo e descendo.`;

    case 'KEYBOARD':
      return bloco.highlightNotes?.length
        ? `**Ao teclado.** Localize: ${bloco.highlightNotes.join(', ')}.`
        : null;

    case 'STAFF':
      return `**Na pauta** (${bloco.clef === 'treble' ? 'clave de sol' : bloco.clef === 'bass' ? 'clave de fá' : 'clave de dó'}): ${bloco.notes.join(' · ')}.${bloco.caption ? ` ${bloco.caption}` : ''}`;

    case 'CHECKPOINT':
      return (
        `**Verificação.** ${bloco.question}\n\n` +
        bloco.options.map((o, i) => `${'abcd'[i]}) ${o}`).join('\n') +
        `\n\n*Resposta: ${'abcd'[bloco.correctIndex]}. ${bloco.explanation}*`
      );

    case 'DIAGRAM':
      return `*[Diagrama: ${bloco.title}]*`;

    // Estes não têm equivalente em papel e são omitidos em silêncio — em vez
    // de imprimir uma caixa vazia dizendo que havia um vídeo.
    case 'VIDEO_PLACEHOLDER':
    case 'SLIDES':
      return null;

    default:
      return null;
  }
}

/** Só o que se executa — para o livro de imersão. */
function blocoParaImersao(bloco: LessonBlock): string | null {
  switch (bloco.kind) {
    case 'INTERVAL_LAB':
    case 'CHORD_LAB':
    case 'SCALE_LAB':
    case 'KEYBOARD':
    case 'STAFF':
    case 'AUDIO_EXAMPLE':
      return blocoParaLeitura(bloco);
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Montagem
// ---------------------------------------------------------------------------

export interface EntradaDeGeracao {
  curso: AcademyCourse;
  modulos: AcademyModule[];
  licoes: AcademyLesson[];
  livreto?: Livreto | null;
  sintese?: SinteseDeCurso | null;
  anterior?: LivroDoConservatorio | null;
}

export class BookService {
  /**
   * Gera os dois livros de um curso.
   *
   * As seções editáveis nascem com um texto de partida — não vazias. Página
   * em branco paralisa; texto que já está lá se corrige em dois minutos.
   */
  public gerar(entrada: EntradaDeGeracao): {
    leitura: LivroDoConservatorio;
    imersao: LivroDoConservatorio;
  } {
    return {
      leitura: this.montar(entrada, 'LEITURA'),
      imersao: this.montar(entrada, 'IMERSAO'),
    };
  }

  private montar(entrada: EntradaDeGeracao, tipo: TipoDeLivro): LivroDoConservatorio {
    const { curso, modulos, licoes, livreto } = entrada;
    const ehLeitura = tipo === 'LEITURA';

    const titulo = ehLeitura ? curso.title : `${curso.title} — Caderno de Prática`;
    const subtitulo = ehLeitura
      ? curso.subtitle
      : 'Laboratórios, execuções e exercícios para fazer com o instrumento na mão.';

    const secoes: SecaoDoLivro[] = [];
    let ordem = 0;

    // --- capa (editável) ----------------------------------------------------
    secoes.push({
      id: 'capa',
      papel: 'CAPA',
      origem: 'EDITAVEL',
      titulo: 'Capa',
      ordem: ordem++,
      conteudo:
        `# ${titulo}\n\n` +
        `## ${subtitulo}\n\n` +
        `**${AUTORIA_PADRAO}**\n\n` +
        `${INSTITUICAO}\n\n` +
        `<!-- O brasão entra aqui: public/brasao-muscicapa.png -->\n` +
        `<!-- Esta seção é EDITÁVEL. Regenerar o livro não a sobrescreve. -->`,
    });

    secoes.push({
      id: 'folha-de-rosto',
      papel: 'FOLHA_DE_ROSTO',
      origem: 'EDITAVEL',
      titulo: 'Folha de rosto',
      ordem: ordem++,
      conteudo:
        `# ${titulo}\n\n${subtitulo}\n\n---\n\n` +
        `**${AUTORIA_PADRAO}**\n\nFundadora do ${INSTITUICAO}\n\n---\n\n` +
        `${edicaoPorExtenso(1)} · ${ANO}`,
    });

    secoes.push({
      id: 'ficha',
      papel: 'FICHA_CATALOGRAFICA',
      origem: 'EDITAVEL',
      titulo: 'Ficha catalográfica',
      ordem: ordem++,
      conteudo:
        `${INSTITUICAO}\n\n` +
        `**${titulo}** / ${AUTORIA_PADRAO}. — ${edicaoPorExtenso(1)} — ${ANO}.\n\n` +
        `${licoes.length} capítulos. Carga horária: ${curso.workloadHours} horas.\n\n` +
        `Competências: ${curso.competencies.join('; ')}.\n\n` +
        `---\n\n${RESSALVA_EDITORIAL}\n\n` +
        `<!-- ISBN, depósito legal e demais dados entram aqui quando houver. -->`,
    });

    secoes.push({
      id: 'prefacio',
      papel: 'PREFACIO',
      origem: 'EDITAVEL',
      titulo: 'Prefácio',
      ordem: ordem++,
      conteudo:
        `<!-- EDITÁVEL: escreva aqui. O texto abaixo é um ponto de partida. -->\n\n` +
        (ehLeitura
          ? `Este livro acompanha o curso de mesmo nome. Os capítulos seguem a ordem em que os conceitos se sustentam uns nos outros — não a ordem em que são mais fáceis, mas aquela em que cada um prepara o seguinte.\n\n` +
            `Ao fim de cada capítulo há exercícios. Eles não são decoração: quem os pula lê o livro inteiro e descobre, no capítulo nove, que o quatro não ficou.\n\n` +
            `As passagens marcadas **ao instrumento** pedem que você pare de ler e toque. São o ponto do livro em que a teoria vira som, e nenhuma delas leva mais de dois minutos.`
          : `Este caderno reúne as práticas do curso. Ele não se lê: faz-se.\n\n` +
            `Cada exercício supõe o capítulo correspondente do livro de leitura já estudado. A ordem é a mesma, e a correspondência é direta.\n\n` +
            `Trabalhe com o instrumento afinado e, quando o exercício pedir, com metrônomo. Um exercício de tempo feito sem metrônomo treina a fazer errado com segurança.`),
    });

    // --- sumário (gerado) ---------------------------------------------------
    const ordenados = [...modulos].sort((a, b) => a.order - b.order);
    secoes.push({
      id: 'sumario',
      papel: 'SUMARIO',
      origem: 'GERADA',
      titulo: 'Sumário',
      ordem: ordem++,
      conteudo: ordenados
        .map((m, i) => {
          const licao = licoes.find((l) => l.moduleId === m.id);
          return `${i + 1}. **${licao?.variants.TRADITIONAL.title ?? m.title}** — ${m.description}`;
        })
        .join('\n\n'),
    });

    // --- capítulos (gerados) ------------------------------------------------
    for (const [i, modulo] of ordenados.entries()) {
      const licao = licoes.find((l) => l.moduleId === modulo.id);
      if (!licao) continue;

      const conteudoLicao = licao.variants.TRADITIONAL;
      const blocos = conteudoLicao.sections.flatMap((s) => s.blocks ?? []);
      const converter = ehLeitura ? blocoParaLeitura : blocoParaImersao;
      const corpo = blocos.map(converter).filter((t): t is string => Boolean(t));

      if (!ehLeitura && corpo.length === 0) continue;

      const objetivos = licao.objectives.map((o) => `- ${o}`).join('\n');
      const exercicios =
        ehLeitura && livreto
          ? textoDosExercicios(livreto, modulo.id, licao.id)
          : '';

      secoes.push({
        id: `cap-${i + 1}`,
        papel: 'CAPITULO',
        origem: 'GERADA',
        titulo: conteudoLicao.title,
        ordem: ordem++,
        abrePaginaImpar: true,
        conteudo:
          `# Capítulo ${i + 1} — ${conteudoLicao.title}\n\n` +
          `*${conteudoLicao.summary}*\n\n` +
          `**Ao final deste capítulo, você deve ser capaz de:**\n\n${objetivos}\n\n---\n\n` +
          corpo.join('\n\n') +
          exercicios,
      });
    }

    // --- caderno de exercícios e gabarito (gerados) -------------------------
    if (ehLeitura && livreto) {
      secoes.push({
        id: 'caderno',
        papel: 'CADERNO_DE_EXERCICIOS',
        origem: 'GERADA',
        titulo: 'Caderno de exercícios — todas as questões',
        ordem: ordem++,
        abrePaginaImpar: true,
        conteudo:
          `# Caderno de exercícios\n\n` +
          `As mesmas questões dos capítulos, reunidas na ordem em que foram estudadas. ` +
          `Serve de revisão geral antes da avaliação.\n\n` +
          livreto.capitulos
            .slice()
            .sort((a, b) => a.numero - b.numero)
            .map(
              (c) =>
                `## ${c.numero}. ${c.titulo}\n\n` +
                c.questoes
                  .map(
                    (q, k) =>
                      `**${k + 1}.** ${q.prompt}\n\n` +
                      q.choices.map((a) => `${a.id}) ${a.texto}`).join('\n')
                  )
                  .join('\n\n')
            )
            .join('\n\n'),
      });

      secoes.push({
        id: 'gabarito',
        papel: 'GABARITO',
        origem: 'GERADA',
        titulo: 'Gabarito comentado',
        ordem: ordem++,
        abrePaginaImpar: true,
        conteudo:
          `# Gabarito comentado\n\n` +
          `Cada resposta vem com a explicação. Ler o comentário de uma questão que você acertou ` +
          `custa dez segundos e às vezes revela que o acerto foi por outro motivo.\n\n` +
          livreto.capitulos
            .slice()
            .sort((a, b) => a.numero - b.numero)
            .map(
              (c) =>
                `## ${c.numero}. ${c.titulo}\n\n` +
                c.questoes
                  .map((q, k) => `**${k + 1}.** ${q.resposta}) — ${q.explanation}`)
                  .join('\n\n')
            )
            .join('\n\n'),
      });
    }

    secoes.push({
      id: 'colofao',
      papel: 'COLOFAO',
      origem: 'EDITAVEL',
      titulo: 'Colofão',
      ordem: ordem++,
      conteudo:
        `<!-- EDITÁVEL -->\n\n` +
        `Composto e publicado pelo ${INSTITUICAO}.\n\n` +
        `Texto de ${AUTORIA_PADRAO}.\n\n` +
        `${edicaoPorExtenso(1)}, ${ANO}.\n\n` +
        `---\n\n${RESSALVA_EDITORIAL}`,
    });

    const livro: LivroDoConservatorio = {
      id: `livro_${curso.slug}_${tipo.toLowerCase()}`,
      cursoId: curso.id,
      tipo,
      titulo,
      subtitulo,
      autoria: AUTORIA_PADRAO,
      instituicao: INSTITUICAO,
      edicao: edicaoPorExtenso(1),
      ano: ANO,
      secoes,
      geradoEm: new Date().toISOString(),
    };

    return fundirPreservandoEdicoes(livro, entrada.anterior ?? null);
  }

  public validar(livro: LivroDoConservatorio): ProblemaDoLivro[] {
    return validarLivro(livro);
  }
}

function edicaoPorExtenso(n: number): string {
  const nomes = ['', 'Primeira', 'Segunda', 'Terceira', 'Quarta'];
  return `${nomes[n] ?? `${n}ª`} edição`;
}

function textoDosExercicios(livreto: Livreto, moduloId: string, lessonId: string): string {
  const capitulo =
    livreto.capitulos.find((c) => c.lessonId === lessonId) ??
    livreto.capitulos.find((c) => c.id === moduloId);
  if (!capitulo || capitulo.questoes.length === 0) return '';

  return (
    `\n\n---\n\n## Exercícios\n\n` +
    capitulo.questoes
      .map(
        (q, i) =>
          `**${i + 1}.** ${q.prompt}\n\n` +
          q.choices.map((a) => `${a.id}) ${a.texto}`).join('\n')
      )
      .join('\n\n') +
    `\n\n*Respostas comentadas no gabarito, ao fim do livro.*`
  );
}

export const bookService = new BookService();
