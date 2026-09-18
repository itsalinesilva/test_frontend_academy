/**
 * Frequência de estudo.
 *
 * Registra **em que dias** o aluno estudou, para que ele possa acompanhar o
 * mês no calendário. É o widget lateral da tela de curso.
 *
 * DUAS REGRAS QUE NÃO SE NEGOCIAM
 * -------------------------------
 * 1. Um dia só é marcado quando houve atividade **registrada** — lição aberta,
 *    exercício respondido, prática medida. Abrir a plataforma e não fazer nada
 *    não conta.
 *
 * 2. Dia sem registro é **ausência de dado**, não zero. Um calendário que
 *    pinta de cinza todos os dias futuros do mês estaria afirmando que o aluno
 *    faltou num dia que ainda não chegou.
 */

/** Data no formato `AAAA-MM-DD`, no fuso local do aluno. */
export type DiaISO = string;

export interface RegistroDeEstudo {
  dia: DiaISO;
  minutos: number;
  /** Quantos eventos de estudo aconteceram nesse dia. */
  eventos: number;
}

export interface FrequenciaDoAluno {
  userId: string;
  registros: RegistroDeEstudo[];
}

/** `AAAA-MM-DD` a partir de um Date, sem passar por UTC. */
export function diaDe(data: Date): DiaISO {
  const m = String(data.getMonth() + 1).padStart(2, '0');
  const d = String(data.getDate()).padStart(2, '0');
  return `${data.getFullYear()}-${m}-${d}`;
}

export interface CelulaDoCalendario {
  /** `null` nas casas que apenas alinham a primeira semana. */
  dia: DiaISO | null;
  numero: number | null;
  estudou: boolean;
  minutos: number;
  ehHoje: boolean;
  /** Dia posterior a hoje: não é falta, ainda não aconteceu. */
  futuro: boolean;
}

export interface MesDeEstudo {
  ano: number;
  /** 1 a 12. */
  mes: number;
  celulas: CelulaDoCalendario[];
  diasEstudados: number;
  diasNoMes: number;
  minutosTotais: number;
  /** Maior sequência de dias consecutivos estudados dentro do mês. */
  maiorSequencia: number;
}

const DIAS_NO_MES = (ano: number, mes: number) => new Date(ano, mes, 0).getDate();

/**
 * Monta a grade do mês, começando no domingo.
 *
 * `hoje` é injetado em vez de lido do relógio para que o resultado seja
 * determinístico — o mesmo mês produz sempre a mesma grade.
 */
export function montarMes(
  registros: RegistroDeEstudo[],
  ano: number,
  mes: number,
  hoje: Date
): MesDeEstudo {
  const porDia = new Map(registros.map((r) => [r.dia, r]));
  const total = DIAS_NO_MES(ano, mes);
  const primeiroDiaDaSemana = new Date(ano, mes - 1, 1).getDay();
  const chaveDeHoje = diaDe(hoje);

  const celulas: CelulaDoCalendario[] = [];

  for (let i = 0; i < primeiroDiaDaSemana; i++) {
    celulas.push({ dia: null, numero: null, estudou: false, minutos: 0, ehHoje: false, futuro: false });
  }

  for (let d = 1; d <= total; d++) {
    const dia = `${ano}-${String(mes).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const r = porDia.get(dia);
    celulas.push({
      dia,
      numero: d,
      estudou: Boolean(r && r.eventos > 0),
      minutos: r?.minutos ?? 0,
      ehHoje: dia === chaveDeHoje,
      futuro: dia > chaveDeHoje,
    });
  }

  // Completa a última semana. Sem isso, a última linha da tabela teria menos
  // células que as outras — grade desalinhada e marcação de tabela inválida.
  while (celulas.length % 7 !== 0) {
    celulas.push({ dia: null, numero: null, estudou: false, minutos: 0, ehHoje: false, futuro: false });
  }

  const doMes = celulas.filter((c) => c.dia !== null);
  const diasEstudados = doMes.filter((c) => c.estudou).length;
  const minutosTotais = doMes.reduce((a, c) => a + c.minutos, 0);

  let maiorSequencia = 0;
  let corrente = 0;
  for (const c of doMes) {
    if (c.estudou) {
      corrente += 1;
      if (corrente > maiorSequencia) maiorSequencia = corrente;
    } else {
      corrente = 0;
    }
  }

  return { ano, mes, celulas, diasEstudados, diasNoMes: total, minutosTotais, maiorSequencia };
}

/**
 * Sequência de dias consecutivos que termina hoje ou ontem.
 *
 * Termina em ontem porque o dia de hoje ainda pode ser estudado — quebrar a
 * sequência à meia-noite puniria quem ainda vai estudar à noite.
 */
export function sequenciaAtual(registros: RegistroDeEstudo[], hoje: Date): number {
  const estudados = new Set(registros.filter((r) => r.eventos > 0).map((r) => r.dia));
  if (estudados.size === 0) return 0;

  const cursor = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  if (!estudados.has(diaDe(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!estudados.has(diaDe(cursor))) return 0;
  }

  let n = 0;
  while (estudados.has(diaDe(cursor))) {
    n += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return n;
}

/** Acrescenta minutos ao dia, somando se já houver registro. */
export function registrarEstudo(
  registros: RegistroDeEstudo[],
  dia: DiaISO,
  minutos: number
): RegistroDeEstudo[] {
  const existente = registros.find((r) => r.dia === dia);
  if (existente) {
    return registros.map((r) =>
      r.dia === dia ? { ...r, minutos: r.minutos + minutos, eventos: r.eventos + 1 } : r
    );
  }
  return [...registros, { dia, minutos, eventos: 1 }].sort((a, b) => a.dia.localeCompare(b.dia));
}

export const NOMES_DOS_MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

export const INICIAIS_DA_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

// ---------------------------------------------------------------------------
// Clubes de ofensiva
// ---------------------------------------------------------------------------

/**
 * Clube — o reconhecimento de constância sustentada.
 *
 * Os requisitos são os de `76_ECONOMIA_DE_PROGRESSO.md` §3, e a razão de
 * existirem em degraus tão distantes é que constância se mede em meses, não
 * em sessões. Um clube a cada três dias transformaria a ofensiva numa
 * máquina de notificação.
 */
export interface ClubeDeOfensiva {
  id: string;
  nome: string;
  diasExigidos: number;
}

export const CLUBES_DE_OFENSIVA: readonly ClubeDeOfensiva[] = [
  { id: 'aprendiz_constante', nome: 'Aprendiz Constante', diasExigidos: 7 },
  { id: 'estudante_de_rotina', nome: 'Estudante de Rotina', diasExigidos: 30 },
  { id: 'disciplina_do_conservatorio', nome: 'Disciplina do Conservatório', diasExigidos: 100 },
  { id: 'ano_de_estudo', nome: 'Ano de Estudo', diasExigidos: 365 },
] as const;

/**
 * O clube que vem a seguir, e quanto falta.
 *
 * `null` quando todos foram alcançados — e aí a tela não deve inventar um
 * quinto degrau para ter o que mostrar.
 */
export function proximoClube(
  diasSeguidos: number
): { clube: ClubeDeOfensiva; faltam: number } | null {
  const proximo = CLUBES_DE_OFENSIVA.find((c) => c.diasExigidos > diasSeguidos);
  if (!proximo) return null;
  return { clube: proximo, faltam: proximo.diasExigidos - diasSeguidos };
}

/** Os clubes já alcançados, do mais recente ao mais antigo. */
export function clubesAlcancados(diasSeguidos: number): ClubeDeOfensiva[] {
  return CLUBES_DE_OFENSIVA.filter((c) => c.diasExigidos <= diasSeguidos).reverse();
}
