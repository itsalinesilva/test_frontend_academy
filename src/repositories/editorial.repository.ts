import { LocalStorageAdapter } from '../infrastructure/storage/local-storage';
import { EditorialEdit } from '../domain/editorial-edit';

/**
 * Camada editorial — as correções feitas por quem edita o Conservatório.
 *
 * POR QUE ESTA CHAVE É SEPARADA
 * -----------------------------
 * `amd_academy_lessons_v1` é **conteúdo publicado**: `conteudoPublicado()` a
 * reescreve inteira sempre que a versão do catálogo sobe. Gravar edição
 * editorial ali significaria perdê-la na próxima publicação — e perdê-la em
 * silêncio, que é o pior modo de perder.
 *
 * `amd_academy_editorial_v1` nunca aparece naquela lista. É do mesmo lado das
 * chaves de progresso do aluno: dado que a instituição produziu, e que
 * publicar conteúdo não pode destruir.
 *
 * O teste que garante isso está em `tests/edicao-editorial.test.ts` e em
 * `scripts/qa/seguranca.mjs`, na verificação "publicar conteúdo não apaga
 * dado do aluno" — que passou a cobrir também esta chave.
 */
export interface EditorialRepository {
  todas(): Promise<EditorialEdit[]>;
  daLicao(lessonId: string): Promise<EditorialEdit[]>;
  salvar(edicao: EditorialEdit): Promise<EditorialEdit>;
  reverter(id: string): Promise<void>;
  /** Histórico completo, do mais recente ao mais antigo. */
  historico(limite?: number): Promise<EditorialEdit[]>;
}

export class PersistentEditorialRepository implements EditorialRepository {
  private storage: LocalStorageAdapter;

  private readonly CHAVE = 'amd_academy_editorial_v1';

  constructor(storage: LocalStorageAdapter = new LocalStorageAdapter()) {
    this.storage = storage;
  }

  private lista(): EditorialEdit[] {
    return this.storage.get<EditorialEdit[]>(this.CHAVE) ?? [];
  }

  public async todas(): Promise<EditorialEdit[]> {
    return this.lista();
  }

  public async daLicao(lessonId: string): Promise<EditorialEdit[]> {
    return this.lista().filter((e) => e.lessonId === lessonId);
  }

  /**
   * Gravar substitui a edição do mesmo alvo.
   *
   * O identificador vem do alvo, não de um sorteio. Corrigir duas vezes o
   * mesmo parágrafo deixa **uma** edição, com o texto atual — e não duas
   * empilhadas, em que a de baixo é a que vale e ninguém sabe disso.
   */
  public async salvar(edicao: EditorialEdit): Promise<EditorialEdit> {
    const atuais = this.lista();
    const i = atuais.findIndex((e) => e.id === edicao.id);
    /**
     * O `anterior` preservado é sempre o do conteúdo PUBLICADO, não o da
     * edição imediatamente anterior. Senão, depois de três correções,
     * "desfazer" devolveria a segunda versão em vez do original — e o botão
     * de reverter deixaria de significar "voltar ao que o Conservatório
     * publicou".
     */
    const anterior = i >= 0 ? atuais[i].anterior : edicao.anterior;
    const gravada = { ...edicao, anterior };

    if (i >= 0) atuais[i] = gravada;
    else atuais.push(gravada);
    this.storage.set(this.CHAVE, atuais);
    return gravada;
  }

  /** Reverter apaga a edição: a lição volta a ser a publicada. */
  public async reverter(id: string): Promise<void> {
    this.storage.set(
      this.CHAVE,
      this.lista().filter((e) => e.id !== id)
    );
  }

  public async historico(limite = 100): Promise<EditorialEdit[]> {
    return this.lista()
      .slice()
      .sort((a, b) => b.editadaEm.localeCompare(a.editadaEm))
      .slice(0, limite);
  }
}

export const editorialRepository: EditorialRepository =
  new PersistentEditorialRepository();
