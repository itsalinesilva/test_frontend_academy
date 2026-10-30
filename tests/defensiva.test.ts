import { describe, it, expect } from 'vitest';
import {
  DIAS_POR_CICLO,
  aoFecharUmCiclo,
  aoPraticarHoje,
  aoQuebrarASequencia,
  ciclosNaSequenciaAtual,
  estadoDaDefensiva,
  frasesDaDefensiva,
  nivelDaDefensiva,
} from '../src/domain/defensiva';

/**
 * A DEFENSIVA E O NÍVEL.
 *
 * Sete dias fechados valem um nível; catorze, dois; vinte e um, três. Quebrar
 * a sequência **não tira nível** — só para de subir.
 *
 * 🔴 A segunda parte é a que mais tenta ser "melhorada" com penalidade, e é a
 * que mais importa: punir a interrupção transforma a defensiva em dívida, e a
 * resposta racional a uma dívida é abandonar.
 */

describe('o nível é a semana fechada', () => {
  it('sete dias valem um nível, e a conta é por divisão inteira', () => {
    expect(nivelDaDefensiva(7)).toBe(1);
    expect(nivelDaDefensiva(14)).toBe(2);
    expect(nivelDaDefensiva(21)).toBe(3);
    expect(nivelDaDefensiva(70)).toBe(10);
  });

  it('dias soltos não valem nível, e a semana incompleta também não', () => {
    expect(nivelDaDefensiva(0)).toBe(0);
    expect(nivelDaDefensiva(1)).toBe(0);
    expect(nivelDaDefensiva(6)).toBe(0);
  });

  it('o oitavo dia ainda é nível 1 — o nível muda no fechamento, e não no meio', () => {
    expect(nivelDaDefensiva(8)).toBe(1);
    expect(nivelDaDefensiva(13)).toBe(1);
    expect(nivelDaDefensiva(14)).toBe(2);
  });

  it('número negativo não produz nível negativo', () => {
    expect(nivelDaDefensiva(-3)).toBe(0);
    expect(estadoDaDefensiva(-3).diasSeguidos).toBe(0);
  });
});

describe('o estado diz o que falta, e não o que não há', () => {
  it('conta os dias do ciclo corrente e o que falta para o próximo', () => {
    const e = estadoDaDefensiva(10);
    expect(e.nivel).toBe(1);
    expect(e.diasNoCicloAtual).toBe(3);
    expect(e.diasParaOProximoNivel).toBe(4);
  });

  it('no dia exato do fechamento, não falta nada', () => {
    const e = estadoDaDefensiva(14);
    expect(e.diasParaOProximoNivel).toBe(0);
    expect(e.diasNoCicloAtual).toBe(0);
  });

  it('🔴 o ciclo fechado e não resgatado fica marcado', () => {
    /**
     * Fechar a semana libera o resgate do XP do período. O resgate é
     * **registro**, e não efeito de abrir a tela: sem contar o que já foi
     * retirado, a mesma semana renderia todas as vezes que alguém olhasse.
     */
    expect(estadoDaDefensiva(7, 0).temCicloParaResgatar).toBe(true);
    expect(estadoDaDefensiva(7, 1).temCicloParaResgatar).toBe(false);
    expect(estadoDaDefensiva(21, 2).temCicloParaResgatar).toBe(true);
  });
});

describe('🔴 o nível ACUMULA, e quebrar reinicia só a contagem', () => {
  it('cada defensiva completa vale um nível a mais, para sempre', () => {
    expect(aoFecharUmCiclo(0)).toBe(1);
    expect(aoFecharUmCiclo(2)).toBe(3);
  });

  it('🔴 quebrar mantém o nível e zera os dias', () => {
    /**
     * Este é o ponto exato da regra. A primeira implementação derivava o nível
     * da sequência corrente — e com isso, quebrar fazia o nível **sumir**,
     * porque a sequência voltava a zero e o nível vinha dela.
     *
     * Quem fechou três semanas e faltou um dia continua no nível 3. O que
     * recomeça do dia 1 é a contagem, e não a conquista.
     */
    const depois = aoQuebrarASequencia(3);

    expect(depois.diasSeguidos, 'a contagem não voltou ao dia 1').toBe(0);
    expect(depois.nivel, 'o nível conquistado foi retirado').toBe(3);
    expect(depois.ciclosCompletados).toBe(3);
  });

  it('o estado lido depois da quebra ainda mostra o nível', () => {
    /** Zero dias, três ciclos completados: nível 3, e a semana recomeça. */
    const e = estadoDaDefensiva(0, 3, 3);

    expect(e.diasSeguidos).toBe(0);
    expect(e.nivel).toBe(3);
    expect(e.diasParaOProximoNivel).toBe(7);
  });

  it('a sequência atual nunca REBAIXA um nível registrado', () => {
    /**
     * Dois dias seguidos com cinco ciclos guardados continua nível 5. Deixar a
     * sequência mandar faria o nível oscilar toda semana.
     */
    expect(nivelDaDefensiva(2, 5)).toBe(5);
    expect(nivelDaDefensiva(0, 5)).toBe(5);
  });

  it('sem registro guardado, a sequência atual dá o mínimo garantido', () => {
    /** É o caso da primeira leitura de quem nunca teve o campo. */
    expect(nivelDaDefensiva(14)).toBe(2);
    expect(ciclosNaSequenciaAtual(14)).toBe(2);
  });
});

describe('as frases nunca dizem "nível 0"', () => {
  it('sem defensiva, convida em vez de constatar ausência', () => {
    const f = frasesDaDefensiva(estadoDaDefensiva(0));
    expect(f.titulo).not.toMatch(/n[íi]vel 0/i);
    expect(f.detalhe).toContain(String(DIAS_POR_CICLO));
  });

  it('na primeira semana, diz quanto falta para o nível 1', () => {
    const f = frasesDaDefensiva(estadoDaDefensiva(3));
    expect(f.titulo).toContain('3 dias');
    expect(f.detalhe).toMatch(/n[íi]vel 1/i);
    expect(f.detalhe).toContain('4');
  });

  it('com nível, nomeia o nível e o que falta para o seguinte', () => {
    const f = frasesDaDefensiva(estadoDaDefensiva(10));
    expect(f.titulo).toMatch(/N[íi]vel 1/);
    expect(f.detalhe).toMatch(/n[íi]vel 2/i);
  });

  it('na semana recém-fechada, anuncia o XP disponível', () => {
    const f = frasesDaDefensiva(estadoDaDefensiva(7));
    expect(f.detalhe).toMatch(/XP do ciclo/i);
  });
});

describe('🔴 praticar hoje: continuar, quebrar e fechar ciclo', () => {
  /**
   * O serviço somava um dia sempre que a data mudasse, sem olhar QUAL data
   * era. Quem praticasse em janeiro e voltasse em julho encontrava a defensiva
   * intacta, com um dia a mais — a "sequência de 40 dias" podia ser 40 dias
   * espalhados por dois anos.
   *
   * Um contador que nunca quebra não mede constância: mede visitas.
   */

  it('praticar no dia seguinte CONTINUA a sequência', () => {
    const r = aoPraticarHoje({
      ultimaData: '2026-09-19',
      hoje: '2026-09-20',
      diasSeguidos: 3,
      ciclosCompletados: 0,
    });

    expect(r.diasSeguidos).toBe(4);
    expect(r.quebrou).toBe(false);
    expect(r.fechouCiclo).toBe(false);
  });

  it('🔴 praticar depois de um buraco RECOMEÇA do dia 1, e guarda o nível', () => {
    const r = aoPraticarHoje({
      ultimaData: '2026-07-01',
      hoje: '2026-09-20',
      diasSeguidos: 40,
      ciclosCompletados: 5,
    });

    expect(r.diasSeguidos, 'a sequência sobreviveu a dois meses de ausência').toBe(1);
    expect(r.ciclosCompletados, 'a quebra levou o nível junto').toBe(5);
    expect(r.quebrou).toBe(true);
  });

  it('faltar UM dia já quebra — não há recuperação do dia perdido', () => {
    const r = aoPraticarHoje({
      ultimaData: '2026-09-18',
      hoje: '2026-09-20',
      diasSeguidos: 13,
      ciclosCompletados: 1,
    });

    expect(r.diasSeguidos).toBe(1);
    expect(r.ciclosCompletados).toBe(1);
    expect(r.quebrou).toBe(true);
  });

  it('o sétimo dia FECHA um ciclo, e o nível sobe', () => {
    const r = aoPraticarHoje({
      ultimaData: '2026-09-19',
      hoje: '2026-09-20',
      diasSeguidos: 6,
      ciclosCompletados: 0,
    });

    expect(r.diasSeguidos).toBe(7);
    expect(r.fechouCiclo).toBe(true);
    expect(r.ciclosCompletados).toBe(1);
  });

  it('🔴 praticar duas vezes no MESMO dia não conta dobrado', () => {
    /**
     * Se contasse, dez exercícios numa tarde valeriam dez dias — e a defensiva
     * deixaria de medir dias.
     */
    const r = aoPraticarHoje({
      ultimaData: '2026-09-20',
      hoje: '2026-09-20',
      diasSeguidos: 6,
      ciclosCompletados: 0,
    });

    expect(r.diasSeguidos).toBe(6);
    expect(r.fechouCiclo, 'o segundo exercício do dia fechou um ciclo').toBe(false);
    expect(r.quebrou).toBe(false);
  });

  it('quem nunca praticou começa no dia 1, e isso não é quebra', () => {
    const r = aoPraticarHoje({
      ultimaData: '',
      hoje: '2026-09-20',
      diasSeguidos: 0,
      ciclosCompletados: 0,
    });

    expect(r.diasSeguidos).toBe(1);
    expect(r.quebrou, 'a primeira prática da vida foi anunciada como quebra').toBe(false);
  });

  it('a virada do mês e do ano continuam sendo dias consecutivos', () => {
    /** Aritmética de data, e não subtração de milissegundos sobre o relógio local. */
    expect(
      aoPraticarHoje({
        ultimaData: '2026-08-31',
        hoje: '2026-09-01',
        diasSeguidos: 2,
        ciclosCompletados: 0,
      }).diasSeguidos
    ).toBe(3);

    expect(
      aoPraticarHoje({
        ultimaData: '2026-12-31',
        hoje: '2027-01-01',
        diasSeguidos: 9,
        ciclosCompletados: 1,
      }).quebrou
    ).toBe(false);
  });

  it('catorze dias seguidos valem dois ciclos, um de cada vez', () => {
    let dias = 0;
    let ciclos = 0;
    let fechados = 0;

    for (let i = 1; i <= 14; i++) {
      const hoje = new Date(Date.UTC(2026, 0, i)).toISOString().slice(0, 10);
      const ontem = i === 1 ? '' : new Date(Date.UTC(2026, 0, i - 1)).toISOString().slice(0, 10);

      const r = aoPraticarHoje({
        ultimaData: ontem,
        hoje,
        diasSeguidos: dias,
        ciclosCompletados: ciclos,
      });

      dias = r.diasSeguidos;
      ciclos = r.ciclosCompletados;
      if (r.fechouCiclo) fechados++;
    }

    expect(dias).toBe(14);
    expect(ciclos).toBe(2);
    expect(fechados, 'o ciclo fechou mais de uma vez por semana').toBe(2);
  });
});
