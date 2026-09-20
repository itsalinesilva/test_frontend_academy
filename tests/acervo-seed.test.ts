import { describe, it, expect } from 'vitest';
import { compositoresDoRepertorio, obrasDoRepertorio } from '../src/data/seed-acervo';
import { REPERTORIO_DO_PLAYER } from '../src/data/seed-player-repertoire';
import { avaliarDisponibilidade, temEdicaoNativa } from '../src/domain/music-knowledge';
import { marcadoresDaPosicao, resumoDaVista } from '../src/domain/atlas-map';

/**
 * O ATLAS DEIXA DE SER UMA MOLDURA VAZIA.
 *
 * `DEFAULT_WORKS` era `never[] = []` enquanto o repertório do player já trazia
 * trinta e três melodias de domínio público, com autor e período declarados.
 * As duas coisas nunca tinham sido ligadas.
 *
 * Isto não é ingestão de fonte externa: é reconhecer o que a plataforma já
 * tem. Por isso funciona sem rede, e por isso o mapa passa a ter marcador de
 * verdade em vez de esperar por uma API.
 */

const EM_2026 = new Date('2026-06-15T12:00:00.000Z');

describe('o acervo sai do repertório que já existe', () => {
  it('há compositores, e não uma lista vazia', () => {
    expect(compositoresDoRepertorio(EM_2026).length).toBeGreaterThan(10);
  });

  it('há obras, e não uma lista vazia', () => {
    expect(obrasDoRepertorio(EM_2026).length).toBeGreaterThan(10);
  });

  it('toda obra aponta para um compositor que existe no acervo', () => {
    /**
     * Obra órfã apareceria no mapa sem ficha de autor — e a ficha do autor é
     * metade do que um marcador de compositor promete.
     */
    const ids = new Set(compositoresDoRepertorio(EM_2026).map((c) => c.id));
    for (const o of obrasDoRepertorio(EM_2026)) {
      expect(ids.has(o.composerIds[0]), `${o.id} aponta para ${o.composerIds[0]}`).toBe(true);
    }
  });

  it('todo compositor tem ao menos uma obra', () => {
    const obras = obrasDoRepertorio(EM_2026);
    for (const c of compositoresDoRepertorio(EM_2026)) {
      expect(
        obras.some((o) => o.composerIds.includes(c.id)),
        `${c.sortName} entrou no acervo sem obra nenhuma`
      ).toBe(true);
    }
  });
});

describe('o que NÃO vira obra do mapa', () => {
  it('escala, cadência e diapasão ficam de fora — não têm era', () => {
    /**
     * Atribuir uma era à escala maior seria fabricar historiografia para o
     * mapa não parecer vazio. Elas continuam no player, que é onde fazem
     * sentido.
     */
    const titulos = obrasDoRepertorio(EM_2026).map((o) => o.canonicalTitle.pt);

    expect(titulos.some((t) => t?.includes('Diapasão'))).toBe(false);
    expect(titulos.some((t) => t?.includes('Escala'))).toBe(false);
  });

  it('melodia tradicional sem autor conhecido também fica de fora', () => {
    const ids = new Set(compositoresDoRepertorio(EM_2026).map((c) => c.canonicalName));
    expect(ids.has('Melodia tradicional')).toBe(false);
    expect(ids.has('Conservatório Muscicapa')).toBe(false);
  });

  it('e o player continua com TUDO — nada foi removido de lá', () => {
    // O recorte é do mapa histórico, e não do repertório.
    expect(REPERTORIO_DO_PLAYER.length).toBeGreaterThan(30);
  });
});

describe('a situação de direito autoral de cada um', () => {
  it('todos estão em domínio público — é o critério de entrada do repertório', () => {
    for (const c of compositoresDoRepertorio(EM_2026)) {
      expect(c.publicDomain.status, c.sortName).toBe('PUBLIC_DOMAIN');
    }
  });

  it('o mais recente é Grieg, morto em 1907 — livre desde 1978', () => {
    const maisRecente = compositoresDoRepertorio(EM_2026).reduce((a, b) =>
      (a.deathYear ?? 0) > (b.deathYear ?? 0) ? a : b
    );

    expect(maisRecente.canonicalName).toBe('Edvard Grieg');
    expect(maisRecente.publicDomain.note).toContain('1978');
  });

  it('TODA OBRA É EXPERIÊNCIA COMPLETA — a edição é nossa', () => {
    /**
     * A transcrição foi escrita aqui para o sintetizador da plataforma. É
     * edição própria, nativa por construção, sem depender de permissão de
     * ninguém — o nível 3 da hierarquia de fontes de partitura.
     */
    for (const o of obrasDoRepertorio(EM_2026)) {
      expect(temEdicaoNativa(o), o.id).toBe(true);
      expect(avaliarDisponibilidade(o).modo, o.id).toBe('EXPERIENCIA_COMPLETA');
    }
  });

  it('a licença do ARQUIVO é declarada, e é distinta do domínio da obra', () => {
    const [o] = obrasDoRepertorio(EM_2026);

    expect(o.scoreRefs[0].fileLicense).toContain('Conservatório');
    expect(o.scoreRefs[0].editors).toContain('Conservatório Muscicapa');
    expect(o.publicDomain.basis).toBe('AUTHOR_DEATH_PLUS_TERM');
  });
});

describe('o mapa, com o acervo de verdade', () => {
  const acervo = () => ({
    compositores: compositoresDoRepertorio(EM_2026),
    obras: obrasDoRepertorio(EM_2026),
    movimentos: [],
  });

  it('o Barroco tem marcadores', () => {
    const m = marcadoresDaPosicao({ eraId: 'era_barroco' }, acervo());
    expect(m.length).toBeGreaterThan(0);
  });

  it('as três eras do repertório estão povoadas', () => {
    for (const era of ['era_barroco', 'era_classicismo', 'era_romantismo']) {
      expect(marcadoresDaPosicao({ eraId: era }, acervo()).length, era).toBeGreaterThan(0);
    }
  });

  it('a Antiguidade fica vazia — e isso é verdade, não defeito', () => {
    /**
     * O repertório não tem obra da Antiguidade, e o mapa não deve inventar
     * uma. Marcador fabricado para a era não parecer vazia seria o defeito
     * que este projeto inteiro existe para não ter.
     */
    expect(marcadoresDaPosicao({ eraId: 'era_antiguidade' }, acervo())).toEqual([]);
  });

  it('AS REGIÕES SE REPOVOAM AO TROCAR DE ERA', () => {
    const noBarroco = marcadoresDaPosicao(
      { eraId: 'era_barroco', regionId: 'reg_europa_ocidental' },
      acervo()
    );
    const noRomantismo = marcadoresDaPosicao(
      { eraId: 'era_romantismo', regionId: 'reg_europa_oriental' },
      acervo()
    );

    expect(noBarroco.length).toBeGreaterThan(0);
    expect(noRomantismo.length).toBeGreaterThan(0);
    expect(noBarroco.map((x) => x.id)).not.toEqual(noRomantismo.map((x) => x.id));
  });

  it('a Escandinávia só aparece no Romantismo — é onde Grieg está', () => {
    expect(
      marcadoresDaPosicao({ eraId: 'era_barroco', regionId: 'reg_escandinavia' }, acervo())
    ).toEqual([]);
    expect(
      marcadoresDaPosicao({ eraId: 'era_romantismo', regionId: 'reg_escandinavia' }, acervo()).length
    ).toBeGreaterThan(0);
  });

  it('a legenda conta certo, e tudo aqui é tocável', () => {
    const r = resumoDaVista(marcadoresDaPosicao({ eraId: 'era_barroco' }, acervo()));

    expect(r.total).toBe(r.comExperiencia);
    expect(r.apenasPontuados).toBe(0);
  });

  it('focar um compositor traz o compêndio dele', () => {
    const bach = compositoresDoRepertorio(EM_2026).find((c) => c.canonicalName.includes('Bach'))!;
    const m = marcadoresDaPosicao(
      { eraId: 'era_barroco', composerId: bach.id },
      acervo()
    );

    const dele = m.filter((x) => x.kind === 'OBRA');
    expect(dele.length).toBeGreaterThan(0);
    expect(m.find((x) => x.kind === 'COMPOSITOR')?.contagem).toBe(dele.length);
  });
});

describe('a projeção não descarta o que a fonte declara', () => {
  /**
   * O DEFEITO QUE ISTO IMPEDE DE VOLTAR.
   *
   * A faixa do repertório sempre trouxe `tonalidade`, `compasso` e `bpm`, e a
   * projeção para `CanonicalWork` **jogava os três fora**. Tonalidade é campo
   * padrão em todo catálogo musical — entra no título por convenção e é o que
   * distingue homônimos —, e a ficha ficava mais pobre que o dado que já
   * existia no repositório.
   *
   * Perder informação numa projeção não quebra nada e não aparece em lugar
   * nenhum: o tipo aceita o campo ausente, a tela não mostra, e ninguém sente
   * falta do que nunca viu.
   */
  it('TODA FAIXA LEVA TONALIDADE, COMPASSO E ANDAMENTO PARA O CATÁLOGO', () => {
    const obras = obrasDoRepertorio(EM_2026);
    const porRef = new Map(
      obras.map((o) => [o.scoreRefs[0]?.sourceRef, o] as const)
    );

    let conferidas = 0;
    for (const faixa of REPERTORIO_DO_PLAYER) {
      const obra = porRef.get(faixa.id);
      if (!obra) continue; // escala e referência não entram no catálogo histórico

      expect(obra.key, `${faixa.id} perdeu a tonalidade`).toBe(faixa.tonalidade);
      expect(obra.tempoBpm, `${faixa.id} perdeu o andamento`).toBe(faixa.bpm);
      if (faixa.compasso !== '—') {
        expect(obra.meter, `${faixa.id} perdeu o compasso`).toBe(faixa.compasso);
      }
      conferidas += 1;
    }

    // Sem esta linha o `for` poderia não rodar nenhuma vez e o teste passaria
    // medindo nada — foi assim que um teste da ponte nasceu vazio nesta suíte.
    expect(conferidas, 'nenhuma obra foi conferida').toBeGreaterThan(10);
  });

  it('os campos que dependem de rede nascem vazios, e não inventados', () => {
    /**
     * Número de catálogo e identificadores cruzados exigem resolução de
     * identidade — Wikidata e MusicBrainz. Deduzir "BWV 846" do título e da
     * tonalidade seria palpite com cara de catalogação, e catálogo que
     * adivinha é pior que catálogo incompleto: ninguém sabe quais linhas
     * conferir.
     */
    for (const o of obrasDoRepertorio(EM_2026)) {
      expect(o.catalogNumber, `${o.id} tem número de catálogo sem apuração`).toBeUndefined();
      expect(Object.keys(o.externalIds)).toHaveLength(0);
    }
  });
});
