import { describe, it, expect } from 'vitest';
import {
  ARTIGO_DO_REGIME,
  MARCO_DO_REGIME,
  anoDeEntrada,
  avaliarPrazo,
  regimeDaObra,
} from '../src/domain/copyright-term';

/**
 * O PRAZO — morte ou publicação, e quando cada um vale.
 *
 * 🔴 A pergunta apareceu três vezes, e a resposta é **as duas**, conforme a
 * natureza da obra. Tratar como regra única produz os dois erros possíveis, e
 * só um deles tem consequência jurídica: contar sempre da publicação faz a
 * plataforma **declarar liberado o que está protegido**.
 */

const EM = (ano: number) => new Date(`${ano}-06-15T12:00:00.000Z`);

describe('o marco depende do regime, e não da vontade de quem calcula', () => {
  it('autor conhecido e coautoria contam da MORTE', () => {
    expect(MARCO_DO_REGIME.AUTOR_CONHECIDO).toBe('MORTE');
    expect(MARCO_DO_REGIME.COAUTORIA_INDIVISIVEL).toBe('MORTE');
  });

  it('anônima e audiovisual contam da PUBLICAÇÃO', () => {
    expect(MARCO_DO_REGIME.ANONIMA_OU_PSEUDONIMA).toBe('PUBLICACAO');
    expect(MARCO_DO_REGIME.AUDIOVISUAL_OU_FOTOGRAFICA).toBe('PUBLICACAO');
  });

  it('todo regime cita o artigo que o sustenta', () => {
    for (const [regime, artigo] of Object.entries(ARTIGO_DO_REGIME)) {
      expect(artigo.length, `${regime} sem artigo`).toBeGreaterThan(10);
    }
    expect(ARTIGO_DO_REGIME.AUTOR_CONHECIDO).toContain('art. 41');
    expect(ARTIGO_DO_REGIME.ANONIMA_OU_PSEUDONIMA).toContain('art. 43');
  });
});

describe('🔴 o prazo começa em 1º de janeiro do ano SEGUINTE', () => {
  it('morte em 1955 entra em domínio público em 2026, e não em 2025', () => {
    /**
     * O `+ 71` não é arredondamento: é o dia 1º de janeiro seguinte. Errar
     * isto libera a obra um ano antes da hora — e um ano é tempo de alguém
     * publicar o que não podia.
     */
    expect(anoDeEntrada(1955)).toBe(2026);

    const em2025 = avaliarPrazo({
      regime: 'AUTOR_CONHECIDO',
      anoDeMorte: 1955,
      hoje: EM(2025),
    });
    expect(em2025.status).toBe('PROTECTED');

    const em2026 = avaliarPrazo({
      regime: 'AUTOR_CONHECIDO',
      anoDeMorte: 1955,
      hoje: EM(2026),
    });
    expect(em2026.status).toBe('PUBLIC_DOMAIN');
  });
});

describe('🔴 o caso que motivou tudo isto', () => {
  it('autor morto em 1998 está protegido até 2069, mesmo publicando nos anos 1940', () => {
    /**
     * É o ponto exato da divergência: a obra foi **composta e publicada** nos
     * anos 1940, e o autor morreu em 1998. Contar da publicação daria livre
     * desde 2011; contar da morte, que é o que o art. 41 manda, dá 2069.
     */
    const r = avaliarPrazo({
      regime: 'AUTOR_CONHECIDO',
      anoDeMorte: 1998,
      anoDePublicacao: 1940,
      hoje: EM(2026),
    });

    expect(r.status).toBe('PROTECTED');
    expect(r.entraEm).toBe(2069);
    expect(r.nota).toContain('art. 41');
    expect(r.nota, 'a nota deve dizer que contou da morte').toContain('morte do autor');
  });

  it('a mesma data de publicação, sendo a obra ANÔNIMA, dá livre', () => {
    /**
     * E é isto que faz a regra ser por regime, e não por preferência: a mesma
     * obra publicada em 1940, sem autor nomeado, entra em domínio público em
     * 2011 — por outro artigo.
     */
    const r = avaliarPrazo({
      regime: 'ANONIMA_OU_PSEUDONIMA',
      anoDePublicacao: 1940,
      hoje: EM(2026),
    });

    expect(r.status).toBe('PUBLIC_DOMAIN');
    expect(r.entraEm).toBe(2011);
    expect(r.nota).toContain('art. 43');
    expect(r.nota).toContain('primeira publicação');
  });
});

describe('falta de dado é dita por NOME, e não como "indeterminado"', () => {
  it('sem data de morte, num regime que conta da morte', () => {
    const r = avaliarPrazo({ regime: 'AUTOR_CONHECIDO', hoje: EM(2026) });
    expect(r.status).toBe('UNDETERMINED');
    expect(r.nota, 'não diz QUAL dado falta').toContain('data de morte');
  });

  it('sem data de publicação, num regime que conta da publicação', () => {
    const r = avaliarPrazo({ regime: 'ANONIMA_OU_PSEUDONIMA', hoje: EM(2026) });
    expect(r.status).toBe('UNDETERMINED');
    expect(r.nota, 'não diz QUAL dado falta').toContain('primeira publicação');
  });

  it('🔴 ter a data ERRADA não salva: data de publicação não conta prazo de autor conhecido', () => {
    /**
     * Uma obra de autor conhecido com data de publicação e sem data de morte
     * fica indeterminada — e não livre. Aceitar a publicação como substituto
     * seria o erro caro, embrulhado em aparência de apuração.
     */
    const r = avaliarPrazo({
      regime: 'AUTOR_CONHECIDO',
      anoDePublicacao: 1890,
      hoje: EM(2026),
    });
    expect(r.status).toBe('UNDETERMINED');
  });
});

describe('os regimes sem conta', () => {
  it('anterior a qualquer prazo é livre por constatação, e não por cálculo', () => {
    const r = avaliarPrazo({ regime: 'ANTERIOR_A_QUALQUER_PRAZO', hoje: EM(2026) });
    expect(r.status).toBe('PUBLIC_DOMAIN');
    expect(r.entraEm).toBeUndefined();
  });

  it('autor desconhecido é livre, com a ressalva do conhecimento tradicional', () => {
    const r = avaliarPrazo({ regime: 'AUTOR_DESCONHECIDO', hoje: EM(2026) });
    expect(r.status).toBe('PUBLIC_DOMAIN');
    expect(r.nota).toMatch(/tradicional/i);
  });
});

describe('🔴 a escolha do regime erra para o lado que PROTEGE', () => {
  it('autor nomeado vence, porque é o regime mais restritivo', () => {
    expect(regimeDaObra({ temAutorNomeado: true })).toBe('AUTOR_CONHECIDO');
    expect(regimeDaObra({ temAutorNomeado: true, coautoriaIndivisivel: true })).toBe(
      'COAUTORIA_INDIVISIVEL'
    );
  });

  it('sem autor nomeado e sem declaração de anonimato, vale autor desconhecido', () => {
    expect(regimeDaObra({ temAutorNomeado: false })).toBe('AUTOR_DESCONHECIDO');
    expect(regimeDaObra({ temAutorNomeado: false, anonimaDeclarada: true })).toBe(
      'ANONIMA_OU_PSEUDONIMA'
    );
  });

  it('a Antiguidade não passa por cálculo nenhum', () => {
    expect(regimeDaObra({ temAutorNomeado: false, anteriorANotacao: true })).toBe(
      'ANTERIOR_A_QUALQUER_PRAZO'
    );
    /** Nem quando tem autor nomeado: Mesomedes tem nome, e o século II decide. */
    expect(regimeDaObra({ temAutorNomeado: true, anteriorANotacao: true })).toBe(
      'ANTERIOR_A_QUALQUER_PRAZO'
    );
  });
});
