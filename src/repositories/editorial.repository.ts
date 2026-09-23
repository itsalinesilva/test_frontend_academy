import { LocalStorageAdapter } from '../infrastructure/storage/local-storage';
import { EditorialEdit, EditorialLesson } from '../domain/editorial-edit';
import { EdicaoDeArtigo } from '../domain/editorial-artigo';
import { SecaoEditadaDoLivro } from '../domain/book';
import {
  fundirArtigos,
  fundirEdicoes,
  fundirLicoesCriadas,
  fundirSecoesDeLivro,
} from '../domain/pacote-editorial';
import { camadaPublicada } from './camada-publicada';

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
 *
 * 🔴 LER É PUBLICADO + LOCAL; GRAVAR É SÓ LOCAL (EE-21)
 * -----------------------------------------------------
 * Toda leitura funde a camada publicada (o pacote commitado) com o que está
 * neste navegador, e a mais nova vence. Toda gravação vai só para o local.
 *
 * É isso que faz o pacote exportado ser CUMULATIVO: ele sai com o que já
 * estava publicado mais o que se editou desde então. Um pacote só com as
 * novidades, commitado por cima do anterior, apagaria as correções que já
 * tinham chegado ao aluno.
 */
export interface EditorialRepository {
  todas(): Promise<EditorialEdit[]>;
  daLicao(lessonId: string): Promise<EditorialEdit[]>;
  salvar(edicao: EditorialEdit): Promise<EditorialEdit>;
  reverter(id: string): Promise<void>;
  /** Histórico completo, do mais recente ao mais antigo. */
  historico(limite?: number): Promise<EditorialEdit[]>;

  /**
   * 🔴 AS LIÇÕES CRIADAS DO ZERO.
   *
   * `EditorialLesson` e `mergeCreatedLessons` existiam no domínio desde o
   * começo — e **nada os chamava**. Criar lição era uma função pura sem
   * armazenamento e sem tela: a capacidade estava projetada e desligada, o que
   * na prática é o mesmo que não existir, com a diferença de parecer que
   * existe.
   */
  licoesCriadas(): Promise<EditorialLesson[]>;
  salvarLicaoCriada(licao: EditorialLesson): Promise<EditorialLesson>;
  removerLicaoCriada(id: string): Promise<void>;
  /**
   * 🔴 OS ARTIGOS, guardados à parte.
   *
   * Chave própria pela mesma razão das lições criadas: artigo é peça assinada
   * com cabeçalho e citações, e lição é sequência de blocos. Guardá-los juntos
   * obrigaria todo leitor a filtrar por forma, e um filtro esquecido misturaria
   * as duas.
   */
  artigos(): Promise<EdicaoDeArtigo[]>;
  salvarArtigo(edicao: EdicaoDeArtigo): Promise<EdicaoDeArtigo>;
  removerArtigo(artigoId: string): Promise<void>;

  /**
   * 🔴 AS SEÇÕES ESCRITAS DOS LIVROS — prefácio, dedicatória, colofão.
   *
   * O livro é gerado do curso a cada leitura. Sem esta chave, o que se
   * escrevesse numa seção editável não tinha onde ficar, e sumia na leitura
   * seguinte (EE-19).
   */
  secoesDeLivro(): Promise<SecaoEditadaDoLivro[]>;
  salvarSecaoDeLivro(edicao: SecaoEditadaDoLivro): Promise<SecaoEditadaDoLivro>;
  reverterSecaoDeLivro(id: string): Promise<void>;

  /** Troca a camada inteira de uma vez — é o que a importação de pacote faz. */
  substituirTudo(entrada: {
    edicoes: EditorialEdit[];
    licoesCriadas: EditorialLesson[];
    artigos: EdicaoDeArtigo[];
    secoesDeLivro: SecaoEditadaDoLivro[];
  }): Promise<void>;
}

export class PersistentEditorialRepository implements EditorialRepository {
  private storage: LocalStorageAdapter;

  private readonly CHAVE = 'amd_academy_editorial_v1';
  /**
   * Chave separada da das edições, de propósito.
   *
   * Edição corrige o que o Conservatório publicou; lição criada é conteúdo
   * novo. Guardá-las juntas obrigaria todo leitor a filtrar por tipo, e um
   * filtro esquecido misturaria as duas.
   */
  private readonly CHAVE_LICOES = 'amd_academy_licoes_criadas_v1';
  private readonly CHAVE_ARTIGOS = 'amd_acervo_artigos_editoriais_v1';
  private readonly CHAVE_LIVROS = 'amd_biblioteca_secoes_editadas_v1';

  constructor(storage: LocalStorageAdapter = new LocalStorageAdapter()) {
    this.storage = storage;
  }

  private lista(): EditorialEdit[] {
    return this.storage.get<EditorialEdit[]>(this.CHAVE) ?? [];
  }

  /** O que vale: o publicado, com o local por cima quando é mais novo. */
  private vigentes(): EditorialEdit[] {
    return fundirEdicoes(camadaPublicada().edicoes, this.lista()).resultado;
  }

  public async todas(): Promise<EditorialEdit[]> {
    return this.vigentes();
  }

  public async daLicao(lessonId: string): Promise<EditorialEdit[]> {
    return this.vigentes().filter((e) => e.lessonId === lessonId);
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
    const publicada = camadaPublicada().edicoes.find((e) => e.id === edicao.id);
    /**
     * O `anterior` preservado é sempre o do conteúdo PUBLICADO, não o da
     * edição imediatamente anterior. Senão, depois de três correções,
     * "desfazer" devolveria a segunda versão em vez do original — e o botão
     * de reverter deixaria de significar "voltar ao que o Conservatório
     * publicou".
     */
    const anterior = i >= 0 ? atuais[i].anterior : publicada ? publicada.anterior : edicao.anterior;
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
    return this.vigentes()
      .slice()
      .sort((a, b) => b.editadaEm.localeCompare(a.editadaEm))
      .slice(0, limite);
  }

  private licoesLocais(): EditorialLesson[] {
    return this.storage.get<EditorialLesson[]>(this.CHAVE_LICOES) ?? [];
  }

  public async licoesCriadas(): Promise<EditorialLesson[]> {
    return fundirLicoesCriadas(camadaPublicada().licoesCriadas, this.licoesLocais()).resultado;
  }

  public async salvarLicaoCriada(licao: EditorialLesson): Promise<EditorialLesson> {
    const atuais = this.licoesLocais();
    const i = atuais.findIndex((l) => l.id === licao.id);

    if (i >= 0) atuais[i] = licao;
    else atuais.push(licao);

    this.storage.set(this.CHAVE_LICOES, atuais);
    return licao;
  }

  public async removerLicaoCriada(id: string): Promise<void> {
    const atuais = this.licoesLocais();
    this.storage.set(
      this.CHAVE_LICOES,
      atuais.filter((l) => l.id !== id)
    );
  }

  private artigosLocais(): EdicaoDeArtigo[] {
    return this.storage.get<EdicaoDeArtigo[]>(this.CHAVE_ARTIGOS) ?? [];
  }

  public async artigos(): Promise<EdicaoDeArtigo[]> {
    return fundirArtigos(camadaPublicada().artigos, this.artigosLocais()).resultado;
  }

  public async salvarArtigo(edicao: EdicaoDeArtigo): Promise<EdicaoDeArtigo> {
    const atuais = this.artigosLocais();
    const i = atuais.findIndex((e) => e.id === edicao.id);
    const publicada = camadaPublicada().artigos.find((e) => e.id === edicao.id);

    /**
     * O `anterior` preservado é o do artigo PUBLICADO, e não o da edição
     * imediatamente anterior — mesma regra das lições. Senão, depois de três
     * correções, reverter devolveria a segunda versão em vez do original.
     */
    const anterior = i >= 0 ? atuais[i].anterior : publicada ? publicada.anterior : edicao.anterior;
    const gravada = { ...edicao, anterior, criado: publicada ? publicada.criado : edicao.criado };

    if (i >= 0) atuais[i] = gravada;
    else atuais.push(gravada);

    this.storage.set(this.CHAVE_ARTIGOS, atuais);
    return gravada;
  }

  public async removerArtigo(artigoId: string): Promise<void> {
    const atuais = this.artigosLocais();
    this.storage.set(
      this.CHAVE_ARTIGOS,
      atuais.filter((e) => e.artigoId !== artigoId)
    );
  }

  private secoesLocais(): SecaoEditadaDoLivro[] {
    return this.storage.get<SecaoEditadaDoLivro[]>(this.CHAVE_LIVROS) ?? [];
  }

  public async secoesDeLivro(): Promise<SecaoEditadaDoLivro[]> {
    return fundirSecoesDeLivro(camadaPublicada().secoesDeLivro, this.secoesLocais()).resultado;
  }

  public async salvarSecaoDeLivro(edicao: SecaoEditadaDoLivro): Promise<SecaoEditadaDoLivro> {
    const atuais = this.secoesLocais();
    const i = atuais.findIndex((e) => e.id === edicao.id);

    if (i >= 0) atuais[i] = edicao;
    else atuais.push(edicao);

    this.storage.set(this.CHAVE_LIVROS, atuais);
    return edicao;
  }

  /** Reverter apaga a edição: a seção volta ao texto de partida do livro. */
  public async reverterSecaoDeLivro(id: string): Promise<void> {
    const atuais = this.secoesLocais();
    this.storage.set(
      this.CHAVE_LIVROS,
      atuais.filter((e) => e.id !== id)
    );
  }

  public async substituirTudo(entrada: {
    edicoes: EditorialEdit[];
    licoesCriadas: EditorialLesson[];
    artigos: EdicaoDeArtigo[];
    secoesDeLivro: SecaoEditadaDoLivro[];
  }): Promise<void> {
    this.storage.set(this.CHAVE, entrada.edicoes);
    this.storage.set(this.CHAVE_LICOES, entrada.licoesCriadas);
    this.storage.set(this.CHAVE_ARTIGOS, entrada.artigos);
    this.storage.set(this.CHAVE_LIVROS, entrada.secoesDeLivro);
  }
}

export const editorialRepository: EditorialRepository =
  new PersistentEditorialRepository();
