import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { todasAsObras } from '../src/data/acervo-unificado';

/**
 * AUD-19 — A MINERAÇÃO NO MUSICBRAINZ CHEGA À OBRA.
 *
 * 11.447 consultas acharam 2.330 obras; o id delas ficava em `alias.json` e só
 * o script de casamento o lia. A ficha não sabia que a obra estava
 * identificada.
 */
describe('os ids do MusicBrainz entram nas obras', () => {
  const alias = JSON.parse(readFileSync('src/data/acervo/alias.json', 'utf8')) as Array<{ o: string; mb?: string }>;

  it('🔴 toda obra que a mineração achou sai com o id — e nenhuma obra nasce disso', async () => {
    const obras = await todasAsObras();
    const porId = new Map(obras.map((o) => [o.id, o]));
    const achadas = alias.filter((a) => a.mb && porId.has(a.o));

    /** Não-vacuidade: o arquivo tem que casar com o catálogo em milhares de obras. */
    expect(achadas.length).toBeGreaterThan(2000);
    for (const a of achadas) expect(porId.get(a.o)!.externalIds.musicbrainz, a.o).toBe(a.mb);

    const comMb = obras.filter((o) => o.externalIds.musicbrainz);
    expect(comMb.length).toBe(achadas.length);
  }, 60000);

  it('o id tem a forma de um id do MusicBrainz — um link quebrado na ficha seria pior que nenhum', () => {
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
    for (const a of alias.filter((x) => x.mb)) expect(a.mb, a.o).toMatch(uuid);
  });
});
