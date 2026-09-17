import {
  ScoreEngineAdapter,
  ScoreData,
  ScoreValidationResult,
} from './score-engine.interface';
import { EngineImplementationType, EngineExecutionStatus } from '../../../contracts/tool-contracts';

export class CanonicalScoreEngineAdapter implements ScoreEngineAdapter {
  public readonly engineName = 'CanonicalScoreEngine';
  public readonly implementationType = EngineImplementationType.NODE_AUTHORITY;

  public async getHealth(): Promise<{ status: EngineExecutionStatus; latencyMs: number }> {
    return {
      status: EngineExecutionStatus.READY,
      latencyMs: 1,
    };
  }

  public async validateScore(score: ScoreData): Promise<ScoreValidationResult> {
    const errors: Array<{ measureNumber: number; message: string }> = [];

    if (!score.title || score.title.trim().length === 0) {
      errors.push({ measureNumber: 0, message: 'O título da partitura é obrigatório.' });
    }

    if (score.tempoBpm < 30 || score.tempoBpm > 300) {
      errors.push({ measureNumber: 0, message: 'O andamento (BPM) deve estar entre 30 e 300.' });
    }

    score.measures.forEach((m) => {
      if (m.elements.length === 0) {
        errors.push({ measureNumber: m.number, message: `O compasso ${m.number} está vazio.` });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  public async exportToMusicXml(score: ScoreData): Promise<string> {
    // Generates a well-formed canonical MusicXML skeleton
    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work>
    <work-title>${score.title}</work-title>
  </work>
  <identification>
    <creator type="composer">${score.composer}</creator>
  </identification>
  <part-list>
    <score-part id="P1">
      <part-name>Principal</part-name>
    </score-part>
  </part-list>
  <part id="P1">
    ${score.measures
      .map(
        (m) => `
    <measure number="${m.number}">
      <attributes>
        <divisions>4</divisions>
        <clef><sign>${m.clef === 'BASS' ? 'F' : 'G'}</sign><line>${m.clef === 'BASS' ? '4' : '2'}</line></clef>
      </attributes>
      ${m.elements
        .map((el) =>
          el.type === 'REST'
            ? `<note><rest/><duration>4</duration></note>`
            : `<note><pitch><step>${el.pitch?.[0] || 'C'}</step><octave>${el.pitch?.[1] || '4'}</octave></pitch><duration>4</duration></note>`
        )
        .join('\n      ')}
    </measure>`
      )
      .join('')}
  </part>
</score-partwise>`;
  }
}
