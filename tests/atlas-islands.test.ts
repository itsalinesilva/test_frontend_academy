import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  SEED_INSTRUMENT_ISLANDS,
  availableIslands,
  ingestedSourceCount,
} from '../src/data/seed-atlas-islands';
import { InstrumentIslandStatus } from '../src/domain/gamification';

/**
 * A regra de honestidade do Atlas, verificada por teste.
 *
 * O Atlas anunciava "142 obras do Barroco" sobre 5 registros fixos
 * (CLAUDE_AUDIT.md K-05). Estes testes impedem a reincidência: nenhuma ilha
 * pode se declarar navegável sem corpus real em disco e currículo derivado
 * dele.
 */
describe('Ilhas de instrumento — honestidade estrutural', () => {
  it('toda fonte declarada existe de fato no acervo local', () => {
    for (const island of SEED_INSTRUMENT_ISLANDS) {
      for (const src of island.sources) {
        const path = join('framework_knowledge', src.corpusPath);
        expect(existsSync(path), `fonte declarada e ausente: ${src.corpusPath}`).toBe(true);
      }
    }
  });

  it('ilha sem corpus não pode estar disponível', () => {
    for (const island of SEED_INSTRUMENT_ISLANDS) {
      if (island.sources.length === 0) {
        expect(island.status).toBe(InstrumentIslandStatus.PLANNED);
      }
    }
  });

  it('ilha disponível precisa de currículo — nunca só de corpus', () => {
    for (const island of availableIslands()) {
      expect(island.curriculumPathId, `ilha ${island.slug} sem trilha`).toBeDefined();
      expect(ingestedSourceCount(island)).toBeGreaterThan(0);
    }
  });

  it('o violino traz o corpus completo e aguarda ingestão', () => {
    const violin = SEED_INSTRUMENT_ISLANDS.find((i) => i.slug === 'violin');
    expect(violin).toBeDefined();
    expect(violin!.sources).toHaveLength(15);
    // Ainda não ingerido: o status reflete isso, e não há trilha fabricada.
    expect(violin!.status).toBe(InstrumentIslandStatus.IN_PREPARATION);
    expect(violin!.curriculumPathId).toBeUndefined();
    expect(ingestedSourceCount(violin!)).toBe(0);

    const roles = new Set(violin!.sources.map((s) => s.role));
    // Repertório e estudos técnicos não se substituem: ambos precisam existir.
    expect(roles.has('REPERTOIRE')).toBe(true);
    expect(roles.has('ETUDES')).toBe(true);
  });

  it('o slug da ilha casa com a pasta do acervo', () => {
    // Convenção: `island-knowledge-<slug>`. O prefixo `island-` separa o
    // acervo de ilha do acervo de curso, que vive em pastas próprias —
    // foi por isso que as pastas foram renomeadas.
    for (const island of SEED_INSTRUMENT_ISLANDS) {
      if (island.sources.length === 0) continue;
      for (const src of island.sources) {
        expect(
          src.corpusPath.startsWith(`island-knowledge-${island.slug}/`),
          `${src.corpusPath} não segue island-knowledge-${island.slug}/`
        ).toBe(true);
      }
    }
  });
});
