import { describe, it, expect, vi } from 'vitest';
import { WikidataAdapter, anoDe, qIdDe } from '../src/adapters/knowledge/wikidata.adapter';
import { KnowledgeSourceError } from '../src/adapters/knowledge/knowledge-source.interface';

/**
 * OS ADAPTADORES DE FONTE, PROVADOS SEM REDE.
 *
 * POR QUE `fetch` É INJETADO
 * --------------------------
 * Um adaptador que só pode ser testado com internet é um adaptador que
 * ninguém testa: a suíte fica lenta, quebra quando a rede oscila, e alguém
 * acaba marcando o arquivo para pular. Aí ele vira mais um verde por cegueira.
 *
 * Com `fetch` injetado, o que se prova é o que importa e é nosso: como a
 * resposta é lida, o que acontece quando ela vem torta, e o que o adaptador
 * devolve quando a fonte responde vazio.
 *
 * O QUE ESTES TESTES **NÃO** PROVAM
 * ---------------------------------
 * Que a consulta SPARQL está correta contra o Wikidata de verdade. Isso
 * depende do serviço, e a especificação `21.1 §4.2` registra a verificação
 * empírica com retorno real. **Não foi possível reconferir do ambiente onde
 * este código foi escrito** — sem rede —, e por isso fica dito aqui em vez de
 * suposto.
 */

const resposta = (corpo: unknown, status = 200): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => corpo,
  }) as Response;

const bindings = (linhas: Record<string, string>[]) => ({
  results: {
    bindings: linhas.map((l) =>
      Object.fromEntries(Object.entries(l).map(([k, v]) => [k, { value: v, type: 'literal' }]))
    ),
  },
});

describe('leitura dos formatos do Wikidata', () => {
  it('extrai o Q-id da URI', () => {
    expect(qIdDe('http://www.wikidata.org/entity/Q1339')).toBe('Q1339');
  });

  it('não confunde URI de outra coisa com Q-id', () => {
    expect(qIdDe('http://www.wikidata.org/prop/direct/P86')).toBeUndefined();
  });

  it('extrai o ano de uma data completa', () => {
    expect(anoDe('1750-07-28T00:00:00Z')).toBe(1750);
  });

  it('entende ano anterior à era comum, que vem negativo', () => {
    // Música da Antiguidade é capítulo do curso: a data negativa não é exótica.
    expect(anoDe('-0350-01-01T00:00:00Z')).toBe(-350);
  });

  it('data ausente devolve indefinido, e não zero', () => {
    /**
     * Zero seria um ano, e um ano falso vira cálculo de domínio público
     * falso. Ausência precisa continuar representável até o fim.
     */
    expect(anoDe(undefined)).toBeUndefined();
    expect(anoDe('sem data')).toBeUndefined();
  });
});

describe('busca de compositores', () => {
  it('lê nome, datas e identificadores cruzados', async () => {
    const buscar = vi.fn(async () =>
      resposta(
        bindings([
          {
            p: 'http://www.wikidata.org/entity/Q1339',
            pLabel: 'Johann Sebastian Bach',
            nasc: '1685-03-31T00:00:00Z',
            morte: '1750-07-28T00:00:00Z',
            imslp: 'Category:Bach,_Johann_Sebastian',
            mb: '24f1766e-9635-4d58-a4d4-9413f9f98a4c',
          },
        ])
      )
    );

    const [c] = await new WikidataAdapter(buscar).buscarCompositores('bach');

    expect(c.name).toBe('Johann Sebastian Bach');
    expect(c.deathYear).toBe(1750);
    expect(c.externalIds.wikidata).toBe('Q1339');
    expect(c.externalIds.imslp).toBe('Category:Bach,_Johann_Sebastian');
    expect(c.externalIds.musicbrainz).toBe('24f1766e-9635-4d58-a4d4-9413f9f98a4c');
  });

  it('monta o nome de ordenação — "Bach, Johann Sebastian"', () => {
    // Ordenar por primeiro nome espalharia os Bach pela letra J.
    return new WikidataAdapter(
      vi.fn(async () =>
        resposta(bindings([{ p: 'http://www.wikidata.org/entity/Q1339', pLabel: 'Johann Sebastian Bach' }]))
      )
    )
      .buscarCompositores('bach')
      .then(([c]) => expect(c.sortName).toBe('Bach, Johann Sebastian'));
  });

  it('a confiança cresce com o que a fonte devolveu', async () => {
    /**
     * Registro com data de morte é identidade resolvida; com só o nome é
     * palpite. Tratar os dois como iguais faria a reconciliação rodar sobre
     * ruído.
     */
    const ad = (linha: Record<string, string>) =>
      new WikidataAdapter(vi.fn(async () => resposta(bindings([linha])))).buscarCompositores('x');

    const [comMorte] = await ad({ p: '.../Q1', pLabel: 'A', morte: '1750-01-01T00:00:00Z' });
    const [comNasc] = await ad({ p: '.../Q2', pLabel: 'B', nasc: '1685-01-01T00:00:00Z' });
    const [soNome] = await ad({ p: '.../Q3', pLabel: 'C' });

    expect(comMorte.confidence).toBeGreaterThan(comNasc.confidence);
    expect(comNasc.confidence).toBeGreaterThan(soNome.confidence);
  });

  it('duas linhas do mesmo Q-id são a MESMA pessoa', async () => {
    /**
     * SPARQL devolve uma linha por combinação de rótulo. Sem a deduplicação,
     * o acervo ganharia três Bach diferentes com o mesmo identificador.
     */
    const buscar = vi.fn(async () =>
      resposta(
        bindings([
          { p: 'http://www.wikidata.org/entity/Q1339', pLabel: 'Johann Sebastian Bach' },
          {
            p: 'http://www.wikidata.org/entity/Q1339',
            pLabel: 'J. S. Bach',
            morte: '1750-07-28T00:00:00Z',
          },
        ])
      )
    );

    const achados = await new WikidataAdapter(buscar).buscarCompositores('bach');

    expect(achados).toHaveLength(1);
    // fica o mais completo, e nao o primeiro que chegou
    expect(achados[0].deathYear).toBe(1750);
  });

  it('termo vazio não vira consulta — a fonte não é perguntada à toa', async () => {
    const buscar = vi.fn();
    expect(await new WikidataAdapter(buscar).buscarCompositores('   ')).toEqual([]);
    expect(buscar).not.toHaveBeenCalled();
  });

  it('nenhum resultado é resposta legítima, e não erro', async () => {
    const buscar = vi.fn(async () => resposta(bindings([])));
    expect(await new WikidataAdapter(buscar).buscarCompositores('xyz')).toEqual([]);
  });
});

describe('falha de fonte não é acervo vazio', () => {
  it('serviço fora do ar levanta erro de FONTE', async () => {
    /**
     * Devolver `[]` aqui faria o acervo "perder" obras a cada oscilação de
     * rede, e o relatório diria que não há obras quando o que não houve foi
     * resposta.
     */
    const buscar = vi.fn(async () => {
      throw new Error('ECONNREFUSED');
    });

    await expect(new WikidataAdapter(buscar).buscarCompositores('bach')).rejects.toBeInstanceOf(
      KnowledgeSourceError
    );
  });

  it('resposta 500 levanta erro, com o código dentro da mensagem', async () => {
    const buscar = vi.fn(async () => resposta({}, 500));
    await expect(new WikidataAdapter(buscar).buscarCompositores('bach')).rejects.toThrow(/500/);
  });

  it('resposta que não é JSON de SPARQL levanta erro', async () => {
    const buscar = vi.fn(
      async () =>
        ({
          ok: true,
          status: 200,
          json: async () => {
            throw new Error('não é JSON');
          },
        }) as unknown as Response
    );

    await expect(new WikidataAdapter(buscar).buscarCompositores('bach')).rejects.toBeInstanceOf(
      KnowledgeSourceError
    );
  });

  it('`disponivel` devolve falso em vez de explodir', async () => {
    const buscar = vi.fn(async () => {
      throw new Error('sem rede');
    });
    expect(await new WikidataAdapter(buscar).disponivel()).toBe(false);
  });
});

describe('obras de um compositor', () => {
  it('exige identificador do Wikidata, e recusa qualquer string', async () => {
    /**
     * Sem esta recusa, um id de outra fonte entraria na consulta e voltaria
     * vazio — e "vazio" seria lido como "este compositor não tem obra".
     */
    const buscar = vi.fn();
    await expect(
      new WikidataAdapter(buscar).buscarObrasDoCompositor('bwv-1001')
    ).rejects.toBeInstanceOf(KnowledgeSourceError);
    expect(buscar).not.toHaveBeenCalled();
  });

  it('lê título, IMSLP e MusicBrainz da obra', async () => {
    const buscar = vi.fn(async () =>
      resposta(
        bindings([
          {
            w: 'http://www.wikidata.org/entity/Q1266435',
            wLabel: 'Sonatas e Partitas para violino solo',
            imslp: '6_Violin_Sonatas_and_Partitas,_BWV_1001-1006_(Bach,_Johann_Sebastian)',
            mb: '4a8c18a0-efe2-4b56-a127-9958dec08ad3',
          },
        ])
      )
    );

    const [o] = await new WikidataAdapter(buscar).buscarObrasDoCompositor('Q1339');

    expect(o.titlePt).toBe('Sonatas e Partitas para violino solo');
    expect(o.externalIds.imslp).toContain('BWV_1001');
    expect(o.confidence).toBe(1);
  });
});
