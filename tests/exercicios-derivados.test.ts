// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { EXERCICIOS_DERIVADOS } from '../src/data/exercicios-derivados';
import { SEED_EXERCISES } from '../src/data/seed-practice-content';
import { REPERTORIO_DO_PLAYER } from '../src/data/seed-player-repertoire';
import { PersistentPracticeRepository } from '../src/repositories/practice.repository';
import { ExerciseType } from '../src/domain/practice';

/**
 * LAB-3 — OS EXERCÍCIOS MEDIDOS SAEM DO QUE JÁ ESTÁ ESCRITO.
 */

const porId = (id: string) => EXERCICIOS_DERIVADOS.find((e) => e.id === id)!;

describe('derivados', () => {
  it('há conteúdo de verdade: mais de quarenta, contra os onze de antes', () => {
    expect(EXERCICIOS_DERIVADOS.length).toBeGreaterThan(40);
  });

  it('toda nota esperada é notação que o afinador e a pauta leem', () => {
    for (const e of EXERCICIOS_DERIVADOS) {
      for (const n of e.expectedNotes ?? []) expect(n, e.id).toMatch(/^[A-G][#b]?\d$/);
    }
  });

  it('🔴 a escala é soletrada POR GRAU: mi maior tem fá, dó, sol e ré sustenidos; fá maior tem si bemol', () => {
    expect(porId('ex_escala_E_maior').expectedNotes).toEqual(['E4', 'F#4', 'G#4', 'A4', 'B4', 'C#5', 'D#5', 'E5']);
    expect(porId('ex_escala_F_maior').expectedNotes).toEqual(['F4', 'G4', 'A4', 'Bb4', 'C5', 'D5', 'E5', 'F5']);
    expect(porId('ex_escala_C_maior').expectedNotes).toEqual(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']);
  });

  it('a frase medida É o começo da transcrição — corrigir a peça corrige o exercício', () => {
    const f = REPERTORIO_DO_PLAYER.find((x) => /Bach/.test(x.autor))!;
    const e = porId(`ex_rep_${f.id}`);
    expect(e.type).toBe(ExerciseType.REPERTOIRE_PHRASE);
    expect(e.expectedNotes).toEqual(f.escrita.filter(([n]) => n !== '_').map(([n]) => n).slice(0, 8));
    expect(e.targetBpm).toBe(f.bpm);
  });

  it('nenhum id colide com os escritos à mão, nem entre si', () => {
    const ids = [...SEED_EXERCISES, ...EXERCICIOS_DERIVADOS].map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('o repositório', () => {
  beforeEach(() => localStorage.clear());

  it('🔴 serve os derivados mesmo a quem já tinha a cópia antiga no navegador', async () => {
    /** A cópia era semeada uma vez e lida para sempre: os onze de antes. */
    localStorage.setItem('amd_amd_practice_exercises_v1', JSON.stringify(SEED_EXERCISES));
    const repo = new PersistentPracticeRepository();
    await new Promise((r) => setTimeout(r, 0));

    const todos = await repo.listExercises();
    expect(todos.length).toBe(SEED_EXERCISES.length + EXERCICIOS_DERIVADOS.length);
    expect(localStorage.getItem('amd_amd_practice_exercises_v1'), 'a cópia antiga ficou').toBeNull();
    expect(await repo.findExerciseById('ex_escala_G_maior')).not.toBeNull();
  });
});
