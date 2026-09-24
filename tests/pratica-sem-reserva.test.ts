// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { practiceService } from '../src/services/application/practice.service';
import { practiceRepository } from '../src/repositories/practice.repository';
import { PracticeModality } from '../src/domain/practice';

/**
 * AUD-21 — ERRAR TUDO NÃO RENDE 70%.
 *
 * `a.accuracyScore || 70`: zero é falso em JavaScript, então quem errava
 * todas as tentativas saía com 70% de acurácia, 750 de nota, 80 de afinação
 * (numa sessão de teoria!) e 50 de XP. O domínio subia, e o perfil mostrava.
 */
beforeEach(() => localStorage.clear());

describe('as médias da sessão são do que aconteceu', () => {
  it('🔴 errar tudo: 0 acertos, nota 0, sem XP, e afinação "não medida" — não 70%/750/80/50', async () => {
    const exercicios = await practiceRepository.listExercises();
    const ex = exercicios.find((e) => (e.expectedNotes?.length ?? 0) > 0 || e.targetPitch);
    expect(ex, 'o catálogo precisa de um exercício com resposta esperada').toBeTruthy();

    const s = await practiceService.startSession('u_erra', ex!.modality ?? PracticeModality.THEORY, ex!.id, ex!.skillId);
    for (let i = 0; i < 3; i++) {
      await practiceService.evaluateAttempt({
        userId: 'u_erra',
        sessionId: s.id,
        exerciseId: ex!.id,
        givenResponse: 'resposta-certamente-errada',
      } as never);
    }
    const r = await practiceService.finishSession(s.id, 'u_erra');

    expect(r.notesCorrect).toBe(0);
    /**
     * Tentativa errada e MEDIDA rende XP de esforço (25%, regra de
     * `evaluateAttempt`); a sessão soma exatamente isso — sem os 50 de reserva.
     */
    const esforco = Math.max(5, Math.round(ex!.xpAwarded * 0.25)) * 3;
    expect(r.xpGained).toBe(esforco);
    expect(r.xpGained).toBeLessThan(ex!.xpAwarded * 3);
    expect(r.summaryScore).toBeLessThan(700);
    const dominio = await practiceRepository.getMastery('u_erra', r.skillId);
    expect(dominio?.scorePercentage).not.toBe(70);
  });

  it('nenhum número de reserva volta às médias', () => {
    const fonte = readFileSync('src/services/application/practice.service.ts', 'utf8');
    expect(fonte).not.toMatch(/\|\| 70\)|\|\| 750\)|\|\| 80\)|\|\| 85\)|, 0\) \|\| 50/);
  });
});
