/**
 * A DEFENSIVA, E O NÍVEL QUE ELA PRODUZ.
 *
 * O QUE A DEFENSIVA É
 * -------------------
 * A sequência de dias praticados sem interrupção. Ela não é enfeite nem
 * contador: é **o que faz o nível subir**.
 *
 * 🔴 A REGRA, E POR QUE ELA É POR SEMANA
 * --------------------------------------
 * **Cada defensiva completa de sete dias vale um nível a mais.** O nível é a
 * soma dos ciclos já fechados ao longo do tempo — e não uma conta sobre a
 * sequência corrente.
 *
 *     1ª defensiva fechada  → nível 1
 *     2ª defensiva fechada  → nível 2
 *     3ª defensiva fechada  → nível 3
 *
 * A semana é a unidade porque é o ciclo em que a vida de quem estuda se
 * organiza: praticar de segunda a domingo é uma decisão que se toma uma vez,
 * e não sete.
 *
 * 🔴 CORTAR A DEFENSIVA NÃO PUNE — SÓ PARA DE SUBIR
 * -------------------------------------------------
 * Quem interrompe **não perde nível**. Cada defensiva completa vale um nível a
 * mais, **para sempre**: quem fechou três semanas e faltou um dia continua no
 * nível 3.
 *
 * O que recomeça é a **contagem de dias**, do dia 1, e só na próxima
 * defensiva. Não há recuperação do dia perdido.
 *
 * A distinção importa mais do que parece. Punir a interrupção transformaria a
 * defensiva em dívida: quem falta um dia por doença ou viagem voltaria devendo,
 * e a resposta racional a uma dívida é abandonar. Deixar de subir é
 * consequência; tirar o que já foi conquistado é castigo — e castigo por não
 * praticar é o oposto do que um conservatório faz.
 *
 * O XP DOS SETE DIAS
 * ------------------
 * Fechar uma semana libera o resgate do XP acumulado no período. É o que dá
 * sentido a "sete dias": não é uma contagem que só enfeita, é um ciclo que
 * fecha e rende.
 */

/** Dias que fecham um ciclo. Sete, porque a semana é como a vida se organiza. */
export const DIAS_POR_CICLO = 7;

export interface EstadoDaDefensiva {
  /** Dias seguidos praticados, sem interrupção. */
  diasSeguidos: number;
  /** O nível que a sequência atual sustenta. Zero até fechar a primeira semana. */
  nivel: number;
  /** Quantos dias faltam para o próximo nível. Zero quando acabou de fechar. */
  diasParaOProximoNivel: number;
  /** Quantos dias do ciclo corrente já foram cumpridos, de 0 a 6. */
  diasNoCicloAtual: number;
  /** Há um ciclo fechado e ainda não resgatado? */
  temCicloParaResgatar: boolean;
}

/**
 * 🔴 O NÍVEL ACUMULA, e NÃO se deriva da sequência atual.
 *
 * A primeira versão calculava `floor(diasSeguidos / 7)` — e isso fazia o nível
 * **desaparecer** quando a sequência quebrava, porque a sequência voltava a
 * zero e o nível vinha dela.
 *
 * Está errado, e o erro é o oposto da regra: cada defensiva completa vale **um
 * nível a mais**, para sempre. Quem fecha três semanas e falta um dia continua
 * no nível 3 — o que recomeça do dia 1 é a **contagem**, e não a conquista.
 *
 * Por isso o nível é um número **guardado**, e não derivado: derivar de um
 * contador que zera é garantir que ele zere junto.
 *
 * Esta função existe para o caso em que não há histórico guardado — a primeira
 * leitura de quem nunca teve o campo. Ela diz o mínimo que a sequência atual
 * garante, e nunca é usada para **rebaixar** um nível já registrado.
 */
export function ciclosNaSequenciaAtual(diasSeguidos: number): number {
  if (diasSeguidos <= 0) return 0;
  return Math.floor(diasSeguidos / DIAS_POR_CICLO);
}

/**
 * O nível, que é a soma dos ciclos completos ao longo do tempo.
 *
 * `ciclosCompletados` é o registro; a sequência atual só entra quando o
 * registro ainda não existe ou ficou atrás dele — nunca para diminuir.
 */
export function nivelDaDefensiva(diasSeguidos: number, ciclosCompletados?: number): number {
  const daSequencia = ciclosNaSequenciaAtual(diasSeguidos);
  if (typeof ciclosCompletados !== 'number') return daSequencia;
  return Math.max(ciclosCompletados, daSequencia);
}

/**
 * O estado inteiro, para a tela não precisar recalcular nada.
 *
 * `ciclosResgatados` é o que a pessoa já retirou. A diferença entre os ciclos
 * fechados e os resgatados é o que ainda há para retirar — e é por isso que o
 * resgate é registro, e não efeito colateral de abrir a tela.
 */
export function estadoDaDefensiva(
  diasSeguidos: number,
  ciclosResgatados = 0,
  ciclosCompletados?: number
): EstadoDaDefensiva {
  const dias = Math.max(0, diasSeguidos);
  const nivel = nivelDaDefensiva(dias, ciclosCompletados);
  const diasNoCicloAtual = dias % DIAS_POR_CICLO;

  return {
    diasSeguidos: dias,
    nivel,
    diasParaOProximoNivel: diasNoCicloAtual === 0 && dias > 0 ? 0 : DIAS_POR_CICLO - diasNoCicloAtual,
    diasNoCicloAtual,
    temCicloParaResgatar: nivel > ciclosResgatados,
  };
}

/**
 * O que a ficha diz sobre a defensiva, escrito para quem lê.
 *
 * Nunca "nível 0": quem ainda não fechou uma semana não está num nível ruim,
 * está a caminho do primeiro. A frase diz o que falta, e não o que não há.
 */
export function frasesDaDefensiva(estado: EstadoDaDefensiva): {
  titulo: string;
  detalhe: string;
} {
  if (estado.diasSeguidos === 0) {
    return {
      titulo: 'Sem defensiva ativa',
      detalhe: `Praticar hoje começa uma sequência. ${DIAS_POR_CICLO} dias fechados valem um nível.`,
    };
  }

  if (estado.nivel === 0) {
    return {
      titulo: `${estado.diasSeguidos} ${estado.diasSeguidos === 1 ? 'dia' : 'dias'} seguidos`,
      detalhe: `Faltam ${estado.diasParaOProximoNivel} para fechar a primeira semana e chegar ao nível 1.`,
    };
  }

  return {
    titulo: `Nível ${estado.nivel} de defensiva`,
    detalhe:
      estado.diasParaOProximoNivel === 0
        ? `${estado.diasSeguidos} dias seguidos — semana fechada. O XP do ciclo está disponível.`
        : `${estado.diasSeguidos} dias seguidos. Faltam ${estado.diasParaOProximoNivel} para o nível ${estado.nivel + 1}.`,
  };
}

/**
 * 🔴 O QUE ACONTECE QUANDO A SEQUÊNCIA QUEBRA.
 *
 * Existe como função, e não como comentário, porque é a regra que mais tenta
 * ser "melhorada" com penalidade.
 *
 * O nível **permanece**: ele é a soma das defensivas já completadas, e o que
 * está feito está feito. O que volta ao dia 1 é a contagem, e só na próxima
 * defensiva.
 */
export function aoQuebrarASequencia(ciclosCompletados: number): {
  diasSeguidos: number;
  nivel: number;
  ciclosCompletados: number;
} {
  return {
    /**
     * A contagem recomeça do dia 1 — e só na próxima defensiva. Não há
     * recuperação do dia perdido, e não há congelamento automático: a
     * sequência é a sequência.
     */
    diasSeguidos: 0,
    /** 🔴 O NÍVEL PERMANECE. É a soma dos ciclos já completados. */
    nivel: ciclosCompletados,
    ciclosCompletados,
  };
}

/**
 * O que acontece quando um ciclo FECHA: mais um nível, para sempre.
 *
 * Separado de `estadoDaDefensiva` de propósito. O estado é leitura, e leitura
 * não deve produzir efeito — se o nível subisse ao abrir a tela, abrir duas
 * vezes subiria dois.
 */
export function aoFecharUmCiclo(ciclosCompletados: number): number {
  return ciclosCompletados + 1;
}

/**
 * 🔴 O QUE PRATICAR HOJE FAZ COM A DEFENSIVA.
 *
 * Existe como função de domínio, e não como bloco dentro do serviço, porque é
 * a transição inteira num lugar só: continuar, quebrar e fechar ciclo são a
 * mesma decisão, tomada a partir da mesma comparação de datas.
 *
 * O SERVIÇO FAZIA ISTO ERRADO, E DE DOIS JEITOS
 * ---------------------------------------------
 * Ele somava um dia sempre que a data mudasse, sem olhar **qual** data era.
 * Quem praticasse em janeiro e voltasse em julho encontrava a defensiva
 * intacta, com um dia a mais: a "sequência de 40 dias" podia ser 40 dias
 * espalhados por dois anos. Um contador que nunca quebra não mede constância,
 * mede visitas.
 *
 * E não fechava ciclo nenhum — o nível era recalculado na tela a partir da
 * sequência, que é justamente a conta que faz o nível sumir na quebra.
 *
 * `hoje` e `ultimaData` são `YYYY-MM-DD`. A comparação é de data de
 * calendário, e não de instante: praticar às 23h e de novo à 1h é um dia e
 * outro, e quem estuda de madrugada não está quebrando sequência nenhuma.
 */
export function aoPraticarHoje(entrada: {
  /** A última data praticada, `YYYY-MM-DD`. Vazia em quem nunca praticou. */
  ultimaData: string;
  /** Hoje, `YYYY-MM-DD`. */
  hoje: string;
  diasSeguidos: number;
  ciclosCompletados: number;
}): {
  diasSeguidos: number;
  ciclosCompletados: number;
  /** A prática de hoje FECHOU um ciclo? É o que libera o resgate do XP. */
  fechouCiclo: boolean;
  /** A sequência anterior tinha quebrado? A tela pode dizer que recomeçou. */
  quebrou: boolean;
} {
  const { ultimaData, hoje, diasSeguidos, ciclosCompletados } = entrada;

  /** Já praticou hoje: nada muda. O segundo exercício do dia não conta dobrado. */
  if (ultimaData === hoje) {
    return { diasSeguidos, ciclosCompletados, fechouCiclo: false, quebrou: false };
  }

  const ontem = new Date(`${hoje}T00:00:00Z`);
  ontem.setUTCDate(ontem.getUTCDate() - 1);
  const continuou = ultimaData === ontem.toISOString().slice(0, 10);

  if (!continuou) {
    /**
     * 🔴 QUEBROU: a contagem recomeça do dia 1 — e hoje já é o dia 1, porque a
     * pessoa praticou hoje. O nível conquistado **permanece**.
     */
    return {
      diasSeguidos: 1,
      ciclosCompletados: aoQuebrarASequencia(ciclosCompletados).ciclosCompletados,
      fechouCiclo: false,
      quebrou: diasSeguidos > 0,
    };
  }

  const dias = diasSeguidos + 1;
  const fechouCiclo = dias % DIAS_POR_CICLO === 0;

  return {
    diasSeguidos: dias,
    ciclosCompletados: fechouCiclo ? aoFecharUmCiclo(ciclosCompletados) : ciclosCompletados,
    fechouCiclo,
    quebrou: false,
  };
}
