import { LocalStorageAdapter } from '../infrastructure/storage/local-storage';
import { LeagueEntry, LeagueScope, LeagueTier, leagueScopeKey, weekOf } from '../domain/league';
import { DailyActivity, EMPTY_ACTIVITY } from '../domain/missions';

/**
 * A ROTINA DO LABORATÓRIO — liga, missões e o que aconteceu hoje.
 *
 * O BURACO QUE ISTO PREENCHE
 * --------------------------
 * A liga tinha domínio (`computeStandings`, faixas, recortes) e tinha
 * interface (`LeagueBoard`, testada). **Não tinha meio.** Nada gravava uma
 * inscrição, e por isso a tela chamava:
 *
 *     computeStandings([], recorte, LeagueTier.BRONZE, weekOf(new Date()))
 *
 * Um array vazio literal, com um comentário logo acima dizendo que a apuração
 * "roda sobre as inscrições da semana". A tabela ficava vazia **para sempre**,
 * mesmo com o aluno praticando todo dia — não por falta de dado, mas porque
 * nenhum dado tinha por onde chegar ali.
 *
 * As missões estavam no mesmo estado, com `EMPTY_ACTIVITY` cravado no lugar do
 * que a pessoa fez.
 *
 * É o defeito mais caro que existe, porque não parece defeito: o código está
 * escrito, os testes do componente passam, a tela monta. Só que ela é
 * estruturalmente incapaz de mostrar qualquer coisa.
 *
 * É AQUI QUE A ACADEMIA E O LABORATÓRIO SE ENCONTRAM
 * --------------------------------------------------
 * `DailyActivity` sempre teve o campo `lessonsCompleted`, e nada nunca o
 * preencheu. Concluir uma lição na Academia é atividade do dia tanto quanto
 * terminar uma sessão de prática — e é por este repositório que uma coisa
 * chega à outra. A ponte não é um link de navegação entre as duas áreas: é o
 * mesmo registro de rotina, escrito pelas duas.
 *
 * O QUE NÃO ENTRA AQUI
 * --------------------
 * Nada nasce semeado. Sem prática e sem lição, a atividade do dia é
 * `EMPTY_ACTIVITY` e a semana não tem inscrição — que é a verdade sobre quem
 * acabou de chegar, e não um estado a maquiar.
 */

/** O dia em ISO curto, que é como a atividade é endereçada. */
export function dayKey(data: Date = new Date()): string {
  return data.toISOString().slice(0, 10);
}

interface ActivityRecord {
  userId: string;
  dia: string;
  atividade: DailyActivity;
}

export interface RoutineRepository {
  /** Soma ao que já aconteceu hoje. Chamar duas vezes soma duas vezes. */
  somarAtividade(
    userId: string,
    delta: Partial<DailyActivity>,
    dia?: string
  ): Promise<DailyActivity>;

  /** O que a pessoa fez num dia. `EMPTY_ACTIVITY` quando não fez nada. */
  atividadeDoDia(userId: string, dia?: string): Promise<DailyActivity>;

  /**
   * Credita XP da semana na liga, criando a inscrição se ainda não houver.
   *
   * A inscrição nasce da prática, e não de um botão: quem pratica está na
   * liga da semana. Pedir para entrar seria oferecer a alguém a opção de não
   * participar do lugar onde ela já está.
   */
  creditarXpDaSemana(
    userId: string,
    recorte: LeagueScope,
    faixa: LeagueTier,
    xp: number,
    semana?: string
  ): Promise<LeagueEntry>;

  /**
   * As inscrições de uma semana.
   *
   * Devolve as de **todos** de propósito: é uma tabela de classificação, e
   * uma classificação com uma linha só não classifica nada. O que ela expõe é
   * o que a liga existe para expor — identificador e XP da semana — e nada do
   * registro pessoal de ninguém.
   */
  inscricoesDaSemana(semana?: string): Promise<LeagueEntry[]>;

  /** A inscrição de uma pessoa naquele recorte, se houver. */
  inscricaoDe(
    userId: string,
    recorte: LeagueScope,
    semana?: string
  ): Promise<LeagueEntry | null>;
}

export class PersistentRoutineRepository implements RoutineRepository {
  private readonly CHAVE_ATIVIDADE = 'amd_routine_activity_v1';
  private readonly CHAVE_LIGA = 'amd_routine_league_v1';

  constructor(private storage: LocalStorageAdapter = new LocalStorageAdapter()) {}

  private atividades(): ActivityRecord[] {
    return this.storage.get<ActivityRecord[]>(this.CHAVE_ATIVIDADE) ?? [];
  }

  private inscricoes(): LeagueEntry[] {
    return this.storage.get<LeagueEntry[]>(this.CHAVE_LIGA) ?? [];
  }

  public async atividadeDoDia(
    userId: string,
    dia: string = dayKey()
  ): Promise<DailyActivity> {
    const r = this.atividades().find((a) => a.userId === userId && a.dia === dia);
    return r ? r.atividade : EMPTY_ACTIVITY;
  }

  public async somarAtividade(
    userId: string,
    delta: Partial<DailyActivity>,
    dia: string = dayKey()
  ): Promise<DailyActivity> {
    const atual = await this.atividadeDoDia(userId, dia);

    /**
     * Soma campo a campo, e não `{...atual, ...delta}`.
     *
     * Espalhar SUBSTITUIRIA: somar 10 de XP duas vezes deixaria 10, e não 20.
     * O nome do método promete soma, e é soma que ele faz.
     */
    const somada: DailyActivity = {
      xpToday: atual.xpToday + (delta.xpToday ?? 0),
      earTrainingCorrect: atual.earTrainingCorrect + (delta.earTrainingCorrect ?? 0),
      flawlessRounds: atual.flawlessRounds + (delta.flawlessRounds ?? 0),
      newWorksOpened: atual.newWorksOpened + (delta.newWorksOpened ?? 0),
      lessonsCompleted: atual.lessonsCompleted + (delta.lessonsCompleted ?? 0),
      /**
       * Períodos do dia NÃO se somam: são distintos por natureza — manhã,
       * tarde, noite. Praticar três vezes de manhã é um período, e não três.
       * Quem chama informa quantos períodos distintos houve até agora, e o
       * maior vale.
       */
      periodsPracticed: Math.max(atual.periodsPracticed, delta.periodsPracticed ?? 0),
    };

    const outros = this.atividades().filter((a) => !(a.userId === userId && a.dia === dia));
    this.storage.set(this.CHAVE_ATIVIDADE, [...outros, { userId, dia, atividade: somada }]);
    return somada;
  }

  public async creditarXpDaSemana(
    userId: string,
    recorte: LeagueScope,
    faixa: LeagueTier,
    xp: number,
    semana: string = weekOf(new Date())
  ): Promise<LeagueEntry> {
    const chave = leagueScopeKey(recorte);
    const todas = this.inscricoes();
    const atual = todas.find(
      (i) => i.userId === userId && leagueScopeKey(i.recorte) === chave && i.semana === semana
    );

    const atualizada: LeagueEntry = atual
      ? { ...atual, weeklyXp: atual.weeklyXp + xp }
      : {
          userId,
          recorte,
          faixa,
          semana,
          weeklyXp: xp,
          desde: new Date().toISOString(),
        };

    const outras = todas.filter(
      (i) => !(i.userId === userId && leagueScopeKey(i.recorte) === chave && i.semana === semana)
    );
    this.storage.set(this.CHAVE_LIGA, [...outras, atualizada]);
    return atualizada;
  }

  public async inscricoesDaSemana(semana: string = weekOf(new Date())): Promise<LeagueEntry[]> {
    return this.inscricoes().filter((i) => i.semana === semana);
  }

  public async inscricaoDe(
    userId: string,
    recorte: LeagueScope,
    semana: string = weekOf(new Date())
  ): Promise<LeagueEntry | null> {
    const chave = leagueScopeKey(recorte);
    return (
      this.inscricoes().find(
        (i) => i.userId === userId && leagueScopeKey(i.recorte) === chave && i.semana === semana
      ) ?? null
    );
  }
}

export const routineRepository: RoutineRepository = new PersistentRoutineRepository();
