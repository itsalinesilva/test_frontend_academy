import { describe, it, expect } from 'vitest';
import { SEED_ARTICLES } from '../src/data/seed-articles';
import { COLETANEAS_BRASILEIRAS } from '../src/data/seed-collections';
import { estadoDaColetanea, pecasCasadas } from '../src/domain/collection';
import { todasAsObras, todosOsCompositores } from '../src/data/acervo-unificado';
import { temPartituraLocalizada } from '../src/domain/music-knowledge';

/**
 * 🔴 NÚMERO ESCRITO NUM ARTIGO ENVELHECE CALADO.
 *
 * O texto de um artigo diz "1.245 recomendadas, das quais 606 com partitura".
 * O segundo número muda a cada rodada de enriquecimento — e quando muda, o
 * artigo passa a afirmar uma medida que o acervo já não tem, **sem que nada
 * acuse**. É a forma mais discreta de a plataforma mentir: o texto foi
 * verdadeiro quando escrito.
 *
 * O pente fino já proíbe medida cravada na TELA. O artigo escapava porque é
 * conteúdo, e conteúdo tem números legítimos — datas, opus, anos de vida.
 *
 * A saída não é proibir número em artigo: é **conferir os que são medida do
 * acervo** contra o acervo. Os que descrevem o mundo — 1842, op. 2, 1887–1959
 * — não são medida nossa e não entram aqui.
 */

/** O número como o texto o escreve: `16.626` vira 16626. */
const lerNumero = (s: string) => Number(s.replace(/\./g, ''));

const textoDoArtigo = (a: (typeof SEED_ARTICLES)[number]) =>
  [a.titulo, a.subtitulo, a.resumo, ...a.secoes.map((s) => s.markdown)].join('\n');

describe('🔴 os números que os artigos afirmam são os do acervo', () => {
  it('o total de obras e de compositores', async () => {
    const obras = (await todasAsObras()).length;
    const compositores = todosOsCompositores().length;

    /** Não-vacuidade: se o acervo vier vazio, a conferência não mede nada. */
    expect(obras, 'o acervo veio vazio').toBeGreaterThan(1000);

    for (const a of SEED_ARTICLES) {
      const texto = textoDoArtigo(a);

      /**
       * Procura a forma exata com que o artigo escreve o total — `31.952
       * obras`. Se o artigo não cita, não há o que conferir; se cita, tem de
       * bater.
       */
      for (const m of texto.matchAll(/(\d{1,3}(?:\.\d{3})+) obras\b/g)) {
        const dito = lerNumero(m[1]);
        /** Só confere quando o número está na ordem de grandeza do total. */
        if (dito < obras * 0.5) continue;
        expect(dito, `"${a.titulo}" afirma ${m[1]} obras e o acervo tem ${obras}`).toBe(obras);
      }

      for (const m of texto.matchAll(/(\d{1,3}(?:\.\d{3})+) compositores\b/g)) {
        const dito = lerNumero(m[1]);
        if (dito < compositores * 0.5) continue;
        expect(
          dito,
          `"${a.titulo}" afirma ${m[1]} compositores e o acervo tem ${compositores}`
        ).toBe(compositores);
      }
    }
  });

  it('a tabela de curadoria da auditoria bate com os marcadores da fonte', async () => {
    /**
     * A tabela diz, por linha: quantas obras a fonte marcou, e quantas dessas
     * têm partitura localizada. A segunda coluna é a que muda a cada
     * enriquecimento.
     */
    const obras = await todasAsObras();

    const medido = {
      recomendadas: obras.filter((o) => (o.selecoesDaFonte ?? []).includes('RECOMENDADA')),
      populares: obras.filter((o) => (o.selecoesDaFonte ?? []).includes('POPULAR')),
    };

    expect(medido.recomendadas.length, 'nenhuma obra recomendada — o caso não mede nada').toBeGreaterThan(
      100
    );

    const auditoria = SEED_ARTICLES.find((a) => a.tipo === 'AUDITORIA');
    if (!auditoria) return;

    const texto = textoDoArtigo(auditoria);

    for (const [rotulo, lista] of Object.entries(medido)) {
      const linha = new RegExp(`\\| ${rotulo} \\| ([\\d.]+) \\| ([\\d.]+) \\|`);
      const m = texto.match(linha);
      if (!m) continue;

      expect(lerNumero(m[1]), `a auditoria afirma ${m[1]} ${rotulo}`).toBe(lista.length);
      expect(
        lerNumero(m[2]),
        `a auditoria afirma ${m[2]} ${rotulo} com partitura`
      ).toBe(lista.filter(temPartituraLocalizada).length);
    }
  });

  it('o que o artigo diz das coletâneas bate com o seed', () => {
    const inteiras = COLETANEAS_BRASILEIRAS.filter((c) => estadoDaColetanea(c) === 'INTEIRA');
    const soFicha = COLETANEAS_BRASILEIRAS.filter((c) => estadoDaColetanea(c) === 'SO_FICHA');
    const pecas = COLETANEAS_BRASILEIRAS.reduce((n, c) => n + pecasCasadas(c), 0);

    const artigo = SEED_ARTICLES.find((a) => a.coletaneas.length > 0);
    if (!artigo) return;

    const texto = textoDoArtigo(artigo);

    /**
     * O texto escreve o número ora em algarismo, ora por extenso — "20
     * coletâneas" numa seção, "quarenta e uma peças" noutra. As duas formas
     * são legítimas em prosa, e cobrar uma delas seria impor estilo.
     *
     * O que se cobra é que **a apuração apareça**, de alguma das duas formas:
     * se ela mudar, o texto tem de mudar junto.
     */
    const POR_EXTENSO: Record<number, string> = {
      3: 'três',
      5: 'cinco',
      15: 'quinze',
      20: 'vinte',
      41: 'quarenta e uma',
    };

    const afirma = (n: number) =>
      texto.includes(String(n)) || (POR_EXTENSO[n] ? texto.includes(POR_EXTENSO[n]) : false);

    expect(
      afirma(COLETANEAS_BRASILEIRAS.length),
      `o artigo não afirma as ${COLETANEAS_BRASILEIRAS.length} coletâneas`
    ).toBe(true);
    expect(afirma(inteiras.length), `o artigo não afirma as ${inteiras.length} abertas`).toBe(true);
    expect(afirma(soFicha.length), `o artigo não afirma as ${soFicha.length} só na ficha`).toBe(
      true
    );
    expect(afirma(pecas), `o artigo não afirma as ${pecas} peças casadas`).toBe(true);
  });

  it('🔴 a conferência não é vazia — há número de acervo em pelo menos um artigo', () => {
    /**
     * Sem esta linha, um conjunto de artigos sem número nenhum passaria em
     * tudo acima medindo nada. Já aconteceu nesta suíte, com um teste de
     * ponte que nasceu vazio.
     */
    const comNumero = SEED_ARTICLES.filter((a) =>
      /(\d{1,3}(?:\.\d{3})+) (obras|compositores)\b/.test(textoDoArtigo(a))
    );
    expect(comNumero.length, 'nenhum artigo afirma medida do acervo').toBeGreaterThan(0);
  });
});
