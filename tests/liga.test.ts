import { describe, it, expect } from 'vitest';
import {
  FaixaDaLiga,
  FAIXAS_EM_ORDEM,
  InscricaoNaLiga,
  RecorteDaLiga,
  apurarClassificacao,
  fecharSemana,
  faixaAcima,
  faixaAbaixo,
  semanaDe,
  posicaoDe,
  chaveDoRecorte,
} from '../src/domain/liga';

/**
 * A liga existe inteira — sem um único participante.
 *
 * É a distinção que atravessa o projeto: **mecanismo ≠ dado**. Construir a
 * apuração, a subida, a queda e o fechamento da semana é engenharia, e se faz
 * agora. Preencher a tabela com Bach em primeiro lugar é mentira — e já
 * aconteceu aqui, com Clara Schumann em segundo.
 *
 * Estes casos provam que a mecânica está pronta para quando houver gente, e
 * que com zero gente ela devolve zero linhas sem quebrar.
 */

const PLATAFORMA: RecorteDaLiga = { tipo: 'PLATAFORMA' };
const TRIBO_VIOLINO: RecorteDaLiga = { tipo: 'TRIBO', entidadeId: 'tribo_violinistas' };
const SEMANA = '2026-09-14';

const inscrito = (
  userId: string,
  xp: number,
  faixa = FaixaDaLiga.OURO,
  recorte = PLATAFORMA
): InscricaoNaLiga => ({
  userId,
  recorte,
  faixa,
  semana: SEMANA,
  xpDaSemana: xp,
  desde: '2026-09-07T00:00:00.000Z',
});

describe('sem participante, a liga não inventa nenhum', () => {
  it('a classificação vazia devolve lista vazia, e não quebra', () => {
    expect(apurarClassificacao([], PLATAFORMA, FaixaDaLiga.OURO, SEMANA)).toEqual([]);
  });

  it('fechar uma semana sem ninguém não produz inscrição', () => {
    expect(fecharSemana([], SEMANA, '2026-09-21')).toEqual([]);
  });

  it('quem não está inscrito não tem posição — e isso é diferente de ser o último', () => {
    // A tela precisa distinguir "ainda não entrou" de "está por último".
    const classificacao = apurarClassificacao([inscrito('ana', 100)], PLATAFORMA, FaixaDaLiga.OURO, SEMANA);
    expect(posicaoDe(classificacao, 'bruno')).toBeNull();
    expect(posicaoDe(classificacao, 'ana')?.posicao).toBe(1);
  });
});

describe('a classificação ordena por esforço da semana', () => {
  it('quem fez mais XP na semana fica na frente', () => {
    const c = apurarClassificacao(
      [inscrito('ana', 120), inscrito('bruno', 340), inscrito('carla', 80)],
      PLATAFORMA,
      FaixaDaLiga.OURO,
      SEMANA
    );
    expect(c.map((l) => l.userId)).toEqual(['bruno', 'ana', 'carla']);
    expect(c.map((l) => l.posicao)).toEqual([1, 2, 3]);
  });

  it('o empate é desempatado de forma ESTÁVEL', () => {
    /**
     * O critério é arbitrário de propósito; o que não pode é ser instável.
     * Sem desempate fixo, duas apurações da mesma semana devolveriam ordens
     * diferentes, e a pessoa veria a própria posição oscilar sem nada ter
     * acontecido.
     */
    const inscricoes = [inscrito('zeca', 100), inscrito('ana', 100), inscrito('bruno', 100)];
    const uma = apurarClassificacao(inscricoes, PLATAFORMA, FaixaDaLiga.OURO, SEMANA);
    const outra = apurarClassificacao([...inscricoes].reverse(), PLATAFORMA, FaixaDaLiga.OURO, SEMANA);
    expect(uma).toEqual(outra);
  });

  it('a liga só conta o XP DA SEMANA, não o acumulado', () => {
    // Senão quem começou primeiro ficaria no topo para sempre, e a competição
    // deixaria de existir para quem chega depois.
    const c = apurarClassificacao([inscrito('ana', 10), inscrito('bruno', 20)], PLATAFORMA, FaixaDaLiga.OURO, SEMANA);
    expect(c[0].userId).toBe('bruno');
    expect(c[0].xpDaSemana).toBe(20);
  });
});

describe('os recortes não se misturam', () => {
  it('a liga da tribo não traz quem compete só na plataforma', () => {
    const inscricoes = [
      inscrito('ana', 100, FaixaDaLiga.OURO, PLATAFORMA),
      inscrito('bruno', 300, FaixaDaLiga.OURO, TRIBO_VIOLINO),
    ];

    const naTribo = apurarClassificacao(inscricoes, TRIBO_VIOLINO, FaixaDaLiga.OURO, SEMANA);
    expect(naTribo).toHaveLength(1);
    expect(naTribo[0].userId).toBe('bruno');
  });

  it('a mesma pessoa compete em vários recortes ao mesmo tempo', () => {
    const inscricoes = [
      inscrito('ana', 100, FaixaDaLiga.OURO, PLATAFORMA),
      inscrito('ana', 100, FaixaDaLiga.PRATA, TRIBO_VIOLINO),
    ];
    expect(apurarClassificacao(inscricoes, PLATAFORMA, FaixaDaLiga.OURO, SEMANA)).toHaveLength(1);
    expect(apurarClassificacao(inscricoes, TRIBO_VIOLINO, FaixaDaLiga.PRATA, SEMANA)).toHaveLength(1);
  });

  it('faixas diferentes do mesmo recorte não se misturam', () => {
    const inscricoes = [
      inscrito('ana', 500, FaixaDaLiga.DIAMANTE),
      inscrito('bruno', 10, FaixaDaLiga.BRONZE),
    ];
    expect(apurarClassificacao(inscricoes, PLATAFORMA, FaixaDaLiga.BRONZE, SEMANA)).toHaveLength(1);
  });

  it('a chave do recorte distingue plataforma de tribo', () => {
    expect(chaveDoRecorte(PLATAFORMA)).not.toBe(chaveDoRecorte(TRIBO_VIOLINO));
  });
});

describe('subida e queda', () => {
  const dez = Array.from({ length: 10 }, (_, i) => inscrito(`u${i}`, (10 - i) * 10));

  it('o topo sobe e a base cai', () => {
    const c = apurarClassificacao(dez, PLATAFORMA, FaixaDaLiga.OURO, SEMANA);
    expect(c[0].destino).toBe('SOBE');
    expect(c[9].destino).toBe('CAI');
    expect(c[5].destino).toBe('FICA');
  });

  it('quem está sozinho não sobe nem cai', () => {
    /**
     * Com um participante só, "os 20% do topo" e "os 20% da base" seriam a
     * mesma pessoa — e ela subiria e cairia ao mesmo tempo. Competição de um
     * não é competição.
     */
    const c = apurarClassificacao([inscrito('ana', 100)], PLATAFORMA, FaixaDaLiga.OURO, SEMANA);
    expect(c[0].destino).toBe('FICA');
  });

  it('ninguém sobe da faixa mais alta', () => {
    const c = apurarClassificacao(
      dez.map((i) => ({ ...i, faixa: FaixaDaLiga.CONSERVATORIO })),
      PLATAFORMA,
      FaixaDaLiga.CONSERVATORIO,
      SEMANA
    );
    expect(c[0].destino).toBe('FICA');
    expect(c[9].destino).toBe('CAI');
  });

  it('ninguém cai da faixa mais baixa', () => {
    const c = apurarClassificacao(
      dez.map((i) => ({ ...i, faixa: FaixaDaLiga.BRONZE })),
      PLATAFORMA,
      FaixaDaLiga.BRONZE,
      SEMANA
    );
    expect(c[9].destino).toBe('FICA');
    expect(c[0].destino).toBe('SOBE');
  });

  it('as faixas vizinhas estão na ordem declarada', () => {
    expect(faixaAcima(FaixaDaLiga.BRONZE)).toBe(FaixaDaLiga.PRATA);
    expect(faixaAbaixo(FaixaDaLiga.PRATA)).toBe(FaixaDaLiga.BRONZE);
    expect(faixaAcima(FaixaDaLiga.CONSERVATORIO)).toBe(FaixaDaLiga.CONSERVATORIO);
    expect(faixaAbaixo(FaixaDaLiga.BRONZE)).toBe(FaixaDaLiga.BRONZE);
  });
});

describe('fechar a semana', () => {
  const dez = Array.from({ length: 10 }, (_, i) => inscrito(`u${i}`, (10 - i) * 10));

  it('o XP da semana zera', () => {
    // É o que faz a liga medir esforço recente, e não acúmulo histórico.
    for (const i of fecharSemana(dez, SEMANA, '2026-09-21')) {
      expect(i.xpDaSemana, i.userId).toBe(0);
    }
  });

  it('a semana seguinte é a declarada, e todos migram para ela', () => {
    const proxima = fecharSemana(dez, SEMANA, '2026-09-21');
    expect(proxima).toHaveLength(10);
    for (const i of proxima) expect(i.semana).toBe('2026-09-21');
  });

  it('quem subiu começa a semana na faixa de cima', () => {
    const proxima = fecharSemana(dez, SEMANA, '2026-09-21');
    expect(proxima.find((i) => i.userId === 'u0')!.faixa).toBe(FaixaDaLiga.PLATINA);
    expect(proxima.find((i) => i.userId === 'u9')!.faixa).toBe(FaixaDaLiga.PRATA);
    expect(proxima.find((i) => i.userId === 'u5')!.faixa).toBe(FaixaDaLiga.OURO);
  });

  it('quem ficou preserva desde quando está na faixa', () => {
    const proxima = fecharSemana(dez, SEMANA, '2026-09-21');
    expect(proxima.find((i) => i.userId === 'u5')!.desde).toBe('2026-09-07T00:00:00.000Z');
  });

  it('fechar duas vezes a mesma semana dá o mesmo resultado', () => {
    // Fechamento não pode depender de quantas vezes rodou.
    expect(fecharSemana(dez, SEMANA, '2026-09-21').map((i) => i.faixa)).toEqual(
      fecharSemana(dez, SEMANA, '2026-09-21').map((i) => i.faixa)
    );
  });

  it('cada recorte é fechado separadamente', () => {
    const inscricoes = [
      ...dez,
      inscrito('v0', 500, FaixaDaLiga.BRONZE, TRIBO_VIOLINO),
      inscrito('v1', 10, FaixaDaLiga.BRONZE, TRIBO_VIOLINO),
    ];
    const proxima = fecharSemana(inscricoes, SEMANA, '2026-09-21');

    expect(proxima.filter((i) => i.recorte.tipo === 'PLATAFORMA')).toHaveLength(10);
    expect(proxima.filter((i) => i.recorte.tipo === 'TRIBO')).toHaveLength(2);
    // v0 lidera o Bronze da tribo e sobe; v1 está na base e não cai, por ser Bronze
    expect(proxima.find((i) => i.userId === 'v0')!.faixa).toBe(FaixaDaLiga.PRATA);
    expect(proxima.find((i) => i.userId === 'v1')!.faixa).toBe(FaixaDaLiga.BRONZE);
  });
});

describe('a semana vai de segunda a domingo, no fuso do dispositivo', () => {
  /**
   * As datas abaixo são construídas LOCALMENTE, de propósito.
   *
   * A semana da liga segue o mesmo fuso que a ofensiva usa para virar o dia —
   * ter duas noções de "hoje" faria a pessoa fechar a ofensiva num dia e
   * trocar de semana de liga noutro.
   *
   * Um caso anterior escrevia `new Date('2026-09-21T00:01:00Z')` e esperava a
   * semana nova. Em qualquer fuso a oeste de Greenwich, aquele instante ainda
   * é o domingo anterior — e o domingo daqui é que vale. O teste é que estava
   * misturando instante UTC com data local.
   */
  const local = (ano: number, mes: number, dia: number) => new Date(ano, mes - 1, dia, 12, 0, 0);

  it('qualquer dia da semana devolve a mesma segunda-feira', () => {
    const segunda = semanaDe(local(2026, 9, 14));
    for (const dia of [14, 17, 20]) {
      expect(semanaDe(local(2026, 9, dia)), String(dia)).toBe(segunda);
    }
  });

  it('domingo pertence à semana que começou na segunda anterior', () => {
    expect(semanaDe(local(2026, 9, 20))).toBe(semanaDe(local(2026, 9, 14)));
  });

  it('a segunda seguinte abre uma semana nova', () => {
    expect(semanaDe(local(2026, 9, 21))).not.toBe(semanaDe(local(2026, 9, 20)));
  });

  it('a segunda-feira devolvida é, de fato, uma segunda-feira', () => {
    for (const dia of [14, 15, 16, 17, 18, 19, 20]) {
      const s = semanaDe(local(2026, 9, dia));
      expect(new Date(`${s}T12:00:00Z`).getUTCDay(), `dia ${dia}`).toBe(1);
    }
  });
});

describe('as faixas', () => {
  it('vão da mais baixa à mais alta, sem repetição', () => {
    expect(new Set(FAIXAS_EM_ORDEM).size).toBe(FAIXAS_EM_ORDEM.length);
    expect(FAIXAS_EM_ORDEM[0]).toBe(FaixaDaLiga.BRONZE);
    expect(FAIXAS_EM_ORDEM[FAIXAS_EM_ORDEM.length - 1]).toBe(FaixaDaLiga.CONSERVATORIO);
  });
});
