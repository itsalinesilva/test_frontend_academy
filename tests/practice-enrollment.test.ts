import { describe, it, expect } from 'vitest';
import {
  StartingPoint,
  PathPace,
  MaterialBand,
  BANDS_BY_STARTING_POINT,
  STARTING_POINT_NAME,
  STARTING_POINT_EXPLANATION,
  reaches,
  needsPlacement,
  followsCourse,
  createEnrollment,
} from '../src/domain/practice-enrollment';

/**
 * O Practice não depende do Academy — e essa é a decisão que se prova aqui.
 *
 * As lições do curso são umas; as do Practice, outras. Há vínculo, e ele não é
 * obrigatório: quem nunca fez o curso de história pode praticar história, e só
 * precisa dizer de onde parte.
 *
 * A consequência é que **o mesmo percurso serve material diferente conforme
 * quem entra**. Dar o mesmo a quem nunca viu o assunto e a quem concluiu o
 * curso perde os dois.
 */

const matricula = (
  startingPoint: StartingPoint,
  linkedCourseId?: string,
  ritmo = PathPace.STEP_BY_STEP
) =>
  createEnrollment({
    userId: 'usr_ana',
    pathId: 'prc_historia',
    startingPoint,
    ritmo,
    linkedCourseId,
  });

describe('praticar não exige ter cursado', () => {
  it('a matrícula é válida sem curso vinculado', () => {
    const m = matricula(StartingPoint.NEWCOMER);
    expect(m.linkedCourseId).toBeUndefined();
    expect(m.pathId).toBe('prc_historia');
  });

  it('quem nunca estudou o assunto alcança o vocabulário', () => {
    const m = matricula(StartingPoint.NEWCOMER);
    expect(reaches(m, 'VOCABULARY')).toBe(true);
    expect(reaches(m, 'FOUNDATION')).toBe(true);
  });

  it('quem nunca estudou NÃO recebe material avançado', () => {
    // Não é restrição: é não cobrar o que ainda não foi ensinado.
    const m = matricula(StartingPoint.NEWCOMER);
    expect(reaches(m, 'ADVANCED')).toBe(false);
  });

  it('quem concluiu o curso não recebe vocabulário de novo', () => {
    const m = matricula(StartingPoint.COMPLETED_COURSE, 'crs_ocidental');
    expect(reaches(m, 'VOCABULARY')).toBe(false);
    expect(reaches(m, 'ADVANCED')).toBe(true);
  });

  it('cada ponto de partida abre uma faixa diferente', () => {
    const assinaturas = Object.values(StartingPoint).map((p) =>
      BANDS_BY_STARTING_POINT[p].join('+')
    );
    // Se duas opções abrissem exatamente o mesmo, uma das duas seria inútil.
    expect(new Set(assinaturas).size).toBe(assinaturas.length);
  });

  it('toda faixa declarada é uma faixa conhecida', () => {
    const conhecidas: MaterialBand[] = [
      'VOCABULARY',
      'FOUNDATION',
      'APPLICATION',
      'ADVANCED',
    ];
    for (const p of Object.values(StartingPoint)) {
      for (const f of BANDS_BY_STARTING_POINT[p]) {
        expect(conhecidas, `${p} declara ${f}`).toContain(f);
      }
    }
  });

  it('nenhum ponto de partida fica sem material', () => {
    for (const p of Object.values(StartingPoint)) {
      expect(BANDS_BY_STARTING_POINT[p].length, p).toBeGreaterThan(0);
    }
  });
});

describe('quem veio de fora passa por sondagem', () => {
  it('autodidata e formado fora são sondados', () => {
    /**
     * Chegam com lacunas que ninguém conhece — nem a plataforma, nem, muitas
     * vezes, a própria pessoa. Começar pelo capítulo um perderia quem já
     * sabe; começar pelo fim perderia quem não sabe.
     */
    expect(needsPlacement(matricula(StartingPoint.SELF_TAUGHT))).toBe(true);
    expect(needsPlacement(matricula(StartingPoint.TRAINED_ELSEWHERE))).toBe(true);
  });

  it('quem cursa ou cursou aqui não é sondado', () => {
    // O currículo é conhecido: sondar seria perguntar o que já se sabe.
    expect(needsPlacement(matricula(StartingPoint.ENROLLED, 'crs_x'))).toBe(false);
    expect(needsPlacement(matricula(StartingPoint.COMPLETED_COURSE, 'crs_x'))).toBe(false);
  });

  it('quem nunca estudou não é sondado', () => {
    // Não há o que sondar, e a sondagem só serviria para constranger.
    expect(needsPlacement(matricula(StartingPoint.NEWCOMER))).toBe(false);
  });
});

describe('quem está cursando não se adianta ao curso', () => {
  it('o percurso acompanha o curso quando há vínculo', () => {
    // Exercitar o capítulo 12 enquanto se lê o 5 não é desafio: é cobrar o
    // que ainda não foi ensinado.
    expect(followsCourse(matricula(StartingPoint.ENROLLED, 'crs_ocidental'))).toBe(true);
  });

  it('sem vínculo, não há curso a acompanhar', () => {
    expect(followsCourse(matricula(StartingPoint.ENROLLED))).toBe(false);
  });

  it('quem já concluiu não fica preso ao ritmo do curso', () => {
    expect(followsCourse(matricula(StartingPoint.COMPLETED_COURSE, 'crs_ocidental'))).toBe(false);
  });
});

describe('ritmo é pergunta diferente de ponto de partida', () => {
  it('o ritmo é escolhido à parte, e não decorre da partida', () => {
    /**
     * Uma é "de onde parto"; a outra, "como avanço". Quem nunca estudou pode
     * querer tudo aberto, e quem cursou pode querer passo a passo.
     */
    const leigoLivre = matricula(StartingPoint.NEWCOMER, undefined, PathPace.FREE);
    const cursadoTravado = matricula(
      StartingPoint.COMPLETED_COURSE,
      'crs_x',
      PathPace.STEP_BY_STEP
    );
    expect(leigoLivre.ritmo).toBe(PathPace.FREE);
    expect(cursadoTravado.ritmo).toBe(PathPace.STEP_BY_STEP);
  });
});

describe('o formulário se explica sozinho', () => {
  it('toda opção tem nome e explicação com conteúdo', () => {
    // A pessoa escolhe sem adivinhar o que cada uma significa.
    for (const p of Object.values(StartingPoint)) {
      expect(STARTING_POINT_NAME[p].length, p).toBeGreaterThan(10);
      expect(STARTING_POINT_EXPLANATION[p].length, p).toBeGreaterThan(40);
    }
  });

  it('a explicação diz o que MUDA, não o que a pessoa é', () => {
    // "O percurso começa pelo vocabulário" orienta; "você é iniciante" rotula.
    for (const p of Object.values(StartingPoint)) {
      expect(STARTING_POINT_EXPLANATION[p], p).toMatch(/percurso|exercício|material/i);
    }
  });
});

describe('identidade da matrícula', () => {
  it('matricular-se duas vezes no mesmo percurso dá a mesma matrícula', () => {
    // O identificador vem do par pessoa+percurso, não de sorteio — senão a
    // segunda matrícula empilharia sobre a primeira e a de baixo é que valeria.
    expect(matricula(StartingPoint.NEWCOMER).id).toBe(
      matricula(StartingPoint.COMPLETED_COURSE, 'crs_x').id
    );
  });
});
