import { describe, it, expect } from 'vitest';
import {
  PontoDePartida,
  RitmoDoPercurso,
  FaixaDeMaterial,
  FAIXAS_POR_PARTIDA,
  NOME_DO_PONTO_DE_PARTIDA,
  EXPLICACAO_DO_PONTO_DE_PARTIDA,
  alcanca,
  exigeSondagem,
  acompanhaOCurso,
  criarMatricula,
} from '../src/domain/matricula-no-practice';

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
  pontoDePartida: PontoDePartida,
  cursoVinculadoId?: string,
  ritmo = RitmoDoPercurso.PASSO_A_PASSO
) =>
  criarMatricula({
    userId: 'usr_ana',
    percursoId: 'prc_historia',
    pontoDePartida,
    ritmo,
    cursoVinculadoId,
  });

describe('praticar não exige ter cursado', () => {
  it('a matrícula é válida sem curso vinculado', () => {
    const m = matricula(PontoDePartida.LEIGO);
    expect(m.cursoVinculadoId).toBeUndefined();
    expect(m.percursoId).toBe('prc_historia');
  });

  it('quem nunca estudou o assunto alcança o vocabulário', () => {
    const m = matricula(PontoDePartida.LEIGO);
    expect(alcanca(m, 'VOCABULARIO')).toBe(true);
    expect(alcanca(m, 'FUNDAMENTO')).toBe(true);
  });

  it('quem nunca estudou NÃO recebe material avançado', () => {
    // Não é restrição: é não cobrar o que ainda não foi ensinado.
    const m = matricula(PontoDePartida.LEIGO);
    expect(alcanca(m, 'AVANCADO')).toBe(false);
  });

  it('quem concluiu o curso não recebe vocabulário de novo', () => {
    const m = matricula(PontoDePartida.CURSADO, 'crs_ocidental');
    expect(alcanca(m, 'VOCABULARIO')).toBe(false);
    expect(alcanca(m, 'AVANCADO')).toBe(true);
  });

  it('cada ponto de partida abre uma faixa diferente', () => {
    const assinaturas = Object.values(PontoDePartida).map((p) =>
      FAIXAS_POR_PARTIDA[p].join('+')
    );
    // Se duas opções abrissem exatamente o mesmo, uma das duas seria inútil.
    expect(new Set(assinaturas).size).toBe(assinaturas.length);
  });

  it('toda faixa declarada é uma faixa conhecida', () => {
    const conhecidas: FaixaDeMaterial[] = [
      'VOCABULARIO',
      'FUNDAMENTO',
      'APLICACAO',
      'AVANCADO',
    ];
    for (const p of Object.values(PontoDePartida)) {
      for (const f of FAIXAS_POR_PARTIDA[p]) {
        expect(conhecidas, `${p} declara ${f}`).toContain(f);
      }
    }
  });

  it('nenhum ponto de partida fica sem material', () => {
    for (const p of Object.values(PontoDePartida)) {
      expect(FAIXAS_POR_PARTIDA[p].length, p).toBeGreaterThan(0);
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
    expect(exigeSondagem(matricula(PontoDePartida.AUTODIDATA))).toBe(true);
    expect(exigeSondagem(matricula(PontoDePartida.FORMADO_FORA))).toBe(true);
  });

  it('quem cursa ou cursou aqui não é sondado', () => {
    // O currículo é conhecido: sondar seria perguntar o que já se sabe.
    expect(exigeSondagem(matricula(PontoDePartida.CURSANDO, 'crs_x'))).toBe(false);
    expect(exigeSondagem(matricula(PontoDePartida.CURSADO, 'crs_x'))).toBe(false);
  });

  it('quem nunca estudou não é sondado', () => {
    // Não há o que sondar, e a sondagem só serviria para constranger.
    expect(exigeSondagem(matricula(PontoDePartida.LEIGO))).toBe(false);
  });
});

describe('quem está cursando não se adianta ao curso', () => {
  it('o percurso acompanha o curso quando há vínculo', () => {
    // Exercitar o capítulo 12 enquanto se lê o 5 não é desafio: é cobrar o
    // que ainda não foi ensinado.
    expect(acompanhaOCurso(matricula(PontoDePartida.CURSANDO, 'crs_ocidental'))).toBe(true);
  });

  it('sem vínculo, não há curso a acompanhar', () => {
    expect(acompanhaOCurso(matricula(PontoDePartida.CURSANDO))).toBe(false);
  });

  it('quem já concluiu não fica preso ao ritmo do curso', () => {
    expect(acompanhaOCurso(matricula(PontoDePartida.CURSADO, 'crs_ocidental'))).toBe(false);
  });
});

describe('ritmo é pergunta diferente de ponto de partida', () => {
  it('o ritmo é escolhido à parte, e não decorre da partida', () => {
    /**
     * Uma é "de onde parto"; a outra, "como avanço". Quem nunca estudou pode
     * querer tudo aberto, e quem cursou pode querer passo a passo.
     */
    const leigoLivre = matricula(PontoDePartida.LEIGO, undefined, RitmoDoPercurso.LIVRE);
    const cursadoTravado = matricula(
      PontoDePartida.CURSADO,
      'crs_x',
      RitmoDoPercurso.PASSO_A_PASSO
    );
    expect(leigoLivre.ritmo).toBe(RitmoDoPercurso.LIVRE);
    expect(cursadoTravado.ritmo).toBe(RitmoDoPercurso.PASSO_A_PASSO);
  });
});

describe('o formulário se explica sozinho', () => {
  it('toda opção tem nome e explicação com conteúdo', () => {
    // A pessoa escolhe sem adivinhar o que cada uma significa.
    for (const p of Object.values(PontoDePartida)) {
      expect(NOME_DO_PONTO_DE_PARTIDA[p].length, p).toBeGreaterThan(10);
      expect(EXPLICACAO_DO_PONTO_DE_PARTIDA[p].length, p).toBeGreaterThan(40);
    }
  });

  it('a explicação diz o que MUDA, não o que a pessoa é', () => {
    // "O percurso começa pelo vocabulário" orienta; "você é iniciante" rotula.
    for (const p of Object.values(PontoDePartida)) {
      expect(EXPLICACAO_DO_PONTO_DE_PARTIDA[p], p).toMatch(/percurso|exercício|material/i);
    }
  });
});

describe('identidade da matrícula', () => {
  it('matricular-se duas vezes no mesmo percurso dá a mesma matrícula', () => {
    // O identificador vem do par pessoa+percurso, não de sorteio — senão a
    // segunda matrícula empilharia sobre a primeira e a de baixo é que valeria.
    expect(matricula(PontoDePartida.LEIGO).id).toBe(
      matricula(PontoDePartida.CURSADO, 'crs_x').id
    );
  });
});
