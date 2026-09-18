import { LocalStorageAdapter } from '../infrastructure/storage/local-storage';
import { Dimensao } from '../domain/gramatica-musical';
import { MetaDeOfensiva } from '../domain/encerramento-da-licao';

/**
 * O que o percurso de cada pessoa guarda.
 *
 * DADO DO ALUNO — nunca republicável
 * ----------------------------------
 * Esta chave fica do lado do progresso, e não do conteúdo. Nada que publique
 * catálogo pode toca-la: os nós que alguém concluiu são história dela, e
 * republicar o Practice não pode apaga-la. Ver `72_PENTE_FINO_QUALIDADE.md`,
 * na regra das três categorias de armazenamento.
 *
 * TUDO É POR USUÁRIO
 * ------------------
 * Toda leitura filtra por `userId`, e não é formalidade: já houve aqui um
 * `listMasteriesByUser(_userId)` que ignorava o identificador e devolvia a
 * maestria de todo mundo. Uma leitura sem filtro é vazamento entre alunos, e
 * `scripts/qa/seguranca.mjs` falha se ela aparecer.
 */

export interface RegistroDoPercurso {
  userId: string;
  /** Nós já concluídos, na ordem em que foram. */
  concluidas: Dimensao[];
  /** `null` enquanto a pessoa não escolheu — e não se inventa uma para ela. */
  metaDeOfensiva: MetaDeOfensiva | null;
  atualizadoEm: string;
}

/**
 * O que a pessoa achou de um exercício.
 *
 * Existe porque a tela oferece `muito fácil` / `muito difícil` / reportar — e
 * um botão que coleta opinião sem registrá-la em lugar nenhum é pior que não
 * perguntar: cria a impressão de que alguém está ouvindo.
 */
export interface VeredictoDoExercicio {
  userId: string;
  exercicioId: string;
  veredito: 'FACIL' | 'DIFICIL' | 'REPORTADO';
  em: string;
}

export interface PercursoRepository {
  doUsuario(userId: string): Promise<RegistroDoPercurso>;
  concluirNo(userId: string, dimensao: Dimensao): Promise<RegistroDoPercurso>;
  definirMeta(userId: string, meta: MetaDeOfensiva): Promise<RegistroDoPercurso>;
  registrarVeredito(v: VeredictoDoExercicio): Promise<void>;
  vereditosDoUsuario(userId: string): Promise<VeredictoDoExercicio[]>;
}

export class PersistentPercursoRepository implements PercursoRepository {
  private readonly CHAVE = 'amd_practice_percurso_v1';
  private readonly CHAVE_VEREDITOS = 'amd_practice_vereditos_v1';

  constructor(private storage: LocalStorageAdapter = new LocalStorageAdapter()) {}

  private registros(): RegistroDoPercurso[] {
    return this.storage.get<RegistroDoPercurso[]>(this.CHAVE) ?? [];
  }

  /**
   * O percurso de quem ainda não tem um.
   *
   * Registro novo nasce **vazio**: nenhum nó concluído e nenhuma meta. Dar um
   * nó de graça para a tela não parecer vazia seria creditar estudo que não
   * houve.
   */
  public async doUsuario(userId: string): Promise<RegistroDoPercurso> {
    const achado = this.registros().find((r) => r.userId === userId);
    if (achado) return achado;

    return {
      userId,
      concluidas: [],
      metaDeOfensiva: null,
      atualizadoEm: new Date().toISOString(),
    };
  }

  private async gravar(registro: RegistroDoPercurso): Promise<RegistroDoPercurso> {
    const atualizado = { ...registro, atualizadoEm: new Date().toISOString() };
    const outros = this.registros().filter((r) => r.userId !== registro.userId);
    this.storage.set(this.CHAVE, [...outros, atualizado]);
    return atualizado;
  }

  /** Concluir duas vezes o mesmo nó não o duplica. */
  public async concluirNo(userId: string, dimensao: Dimensao): Promise<RegistroDoPercurso> {
    const registro = await this.doUsuario(userId);
    if (registro.concluidas.includes(dimensao)) return registro;

    return this.gravar({ ...registro, concluidas: [...registro.concluidas, dimensao] });
  }

  public async definirMeta(
    userId: string,
    meta: MetaDeOfensiva
  ): Promise<RegistroDoPercurso> {
    const registro = await this.doUsuario(userId);
    return this.gravar({ ...registro, metaDeOfensiva: meta });
  }

  private vereditos(): VeredictoDoExercicio[] {
    return this.storage.get<VeredictoDoExercicio[]>(this.CHAVE_VEREDITOS) ?? [];
  }

  /**
   * Um veredito por pessoa e por exercício.
   *
   * Trocar de ideia substitui; não empilha. Duas opiniões da mesma pessoa
   * sobre o mesmo exercício fariam a contagem pesar quem clicou duas vezes.
   */
  public async registrarVeredito(v: VeredictoDoExercicio): Promise<void> {
    const outros = this.vereditos().filter(
      (a) => !(a.userId === v.userId && a.exercicioId === v.exercicioId)
    );
    this.storage.set(this.CHAVE_VEREDITOS, [...outros, v]);
  }

  public async vereditosDoUsuario(userId: string): Promise<VeredictoDoExercicio[]> {
    return this.vereditos().filter((v) => v.userId === userId);
  }
}

export const percursoRepository: PercursoRepository = new PersistentPercursoRepository();
