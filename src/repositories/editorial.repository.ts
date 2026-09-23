import { LocalStorageAdapter } from '../infrastructure/storage/local-storage';
import { EditorialEdit, EditorialLesson } from '../domain/editorial-edit';
import { EdicaoDeArtigo } from '../domain/editorial-artigo';
import { SecaoEditadaDoLivro } from '../domain/book';
import {
  RemocaoEditorial,
  TipoRemovivel,
  aplicarRemocoes,
  chaveDaRemocao,
  fundirArtigos,
  fundirEdicoes,
  fundirLicoesCriadas,
  fundirRemocoes,
  fundirSecoesDeLivro,
} from '../domain/pacote-editorial';
import { camadaPublicada } from './camada-publicada';

/**
 * As remoções que valem agora: as publicadas e as deste navegador, a mais
 * nova vence (EE-21f).
 *
 * Exportada porque TRÊS repositórios leem a camada — este, o da Academia
 * (lições e edições no caminho do aluno) e o de livretos. Uma regra de
 * remoção escrita em cada um seria três regras para manter em dia.
 */
export const CHAVE_DAS_REMOCOES = 'amd_editorial_removidos_v1';

export function remocoesVigentes(storage: LocalStorageAdapter = new LocalStorageAdapter()): RemocaoEditorial[] {
  return fundirRemocoes(
    camadaPublicada().removidos,
    storage.get<RemocaoEditorial[]>(CHAVE_DAS_REMOCOES) ?? []
  ).resultado;
}

/** Registra, NESTE navegador, que um item publicado foi tirado. Vai no próximo pacote. */
export function registrarRemocao(
  storage: LocalStorageAdapter,
  tipo: TipoRemovivel,
  id: string,
  removidoPor?: string
): void {
  const atuais = storage.get<RemocaoEditorial[]>(CHAVE_DAS_REMOCOES) ?? [];
  const r: RemocaoEditorial = { tipo, id, removidoEm: new Date().toISOString(), removidoPor };
  storage.set(CHAVE_DAS_REMOCOES, [...atuais.filter((x) => chaveDaRemocao(x) !== chaveDaRemocao(r)), r]);
}

/** Salvar de novo um item desfaz a remoção local dele — senão ela contaria como pendência à toa. */
function esquecerRemocao(storage: LocalStorageAdapter, tipo: TipoRemovivel, id: string): void {
  const atuais = storage.get<RemocaoEditorial[]>(CHAVE_DAS_REMOCOES) ?? [];
  const resto = atuais.filter((x) => chaveDaRemocao(x) !== chaveDaRemocao({ tipo, id }));
  if (resto.length !== atuais.length) storage.set(CHAVE_DAS_REMOCOES, resto);
}

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

  /** O que foi tirado do que estava publicado — publicado e local (EE-21f). */
  removidos(): Promise<RemocaoEditorial[]>;

  /** Troca a camada inteira de uma vez — é o que a importação de pacote faz. */
  substituirTudo(entrada: {
    edicoes: EditorialEdit[];
    licoesCriadas: EditorialLesson[];
    artigos: EdicaoDeArtigo[];
    secoesDeLivro: SecaoEditadaDoLivro[];
    removidos: RemocaoEditorial[];
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
    return aplicarRemocoes(
      fundirEdicoes(camadaPublicada().edicoes, this.lista()).resultado,
      remocoesVigentes(this.storage),
      'EDICAO',
      (e) => e.id,
      (e) => e.editadaEm
    );
  }

  /** O item está na camada publicada? Então tirá-lo daqui não basta: é preciso registrar a remoção. */
  private publicado(tipo: TipoRemovivel, id: string): boolean {
    const p = camadaPublicada();
    return {
      EDICAO: () => p.edicoes.some((e) => e.id === id),
      LICAO_CRIADA: () => p.licoesCriadas.some((l) => l.id === id),
      ARTIGO: () => p.artigos.some((a) => a.artigoId === id),
      SECAO_DE_LIVRO: () => p.secoesDeLivro.some((e) => e.id === id),
      LIVRETO: () => p.livretos.some((l) => l.id === id),
    }[tipo]();
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
    esquecerRemocao(this.storage, 'EDICAO', edicao.id);
    return gravada;
  }

  /**
   * Reverter apaga a edição: a lição volta ao conteúdo de fábrica.
   *
   * 🔴 Se a correção JÁ ESTAVA PUBLICADA, apagar a cópia local não bastava: a
   * camada publicada a trazia de volta na leitura seguinte. Agora fica
   * registrada a remoção, que viaja no próximo pacote (EE-21f).
   */
  public async reverter(id: string): Promise<void> {
    this.storage.set(
      this.CHAVE,
      this.lista().filter((e) => e.id !== id)
    );
    if (this.publicado('EDICAO', id)) registrarRemocao(this.storage, 'EDICAO', id);
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
    return aplicarRemocoes(
      fundirLicoesCriadas(camadaPublicada().licoesCriadas, this.licoesLocais()).resultado,
      remocoesVigentes(this.storage),
      'LICAO_CRIADA',
      (l) => l.id,
      (l) => l.criadaEm
    );
  }

  public async salvarLicaoCriada(licao: EditorialLesson): Promise<EditorialLesson> {
    const atuais = this.licoesLocais();
    const i = atuais.findIndex((l) => l.id === licao.id);

    if (i >= 0) atuais[i] = licao;
    else atuais.push(licao);

    this.storage.set(this.CHAVE_LICOES, atuais);
    esquecerRemocao(this.storage, 'LICAO_CRIADA', licao.id);
    return licao;
  }

  public async removerLicaoCriada(id: string): Promise<void> {
    const atuais = this.licoesLocais();
    this.storage.set(
      this.CHAVE_LICOES,
      atuais.filter((l) => l.id !== id)
    );
    if (this.publicado('LICAO_CRIADA', id)) registrarRemocao(this.storage, 'LICAO_CRIADA', id);
  }

  private artigosLocais(): EdicaoDeArtigo[] {
    return this.storage.get<EdicaoDeArtigo[]>(this.CHAVE_ARTIGOS) ?? [];
  }

  public async artigos(): Promise<EdicaoDeArtigo[]> {
    return aplicarRemocoes(
      fundirArtigos(camadaPublicada().artigos, this.artigosLocais()).resultado,
      remocoesVigentes(this.storage),
      'ARTIGO',
      (a) => a.artigoId,
      (a) => a.editadaEm
    );
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
    esquecerRemocao(this.storage, 'ARTIGO', edicao.artigoId);
    return gravada;
  }

  public async removerArtigo(artigoId: string): Promise<void> {
    const atuais = this.artigosLocais();
    this.storage.set(
      this.CHAVE_ARTIGOS,
      atuais.filter((e) => e.artigoId !== artigoId)
    );
    if (this.publicado('ARTIGO', artigoId)) registrarRemocao(this.storage, 'ARTIGO', artigoId);
  }

  private secoesLocais(): SecaoEditadaDoLivro[] {
    return this.storage.get<SecaoEditadaDoLivro[]>(this.CHAVE_LIVROS) ?? [];
  }

  public async secoesDeLivro(): Promise<SecaoEditadaDoLivro[]> {
    return aplicarRemocoes(
      fundirSecoesDeLivro(camadaPublicada().secoesDeLivro, this.secoesLocais()).resultado,
      remocoesVigentes(this.storage),
      'SECAO_DE_LIVRO',
      (e) => e.id,
      (e) => e.editadaEm
    );
  }

  public async salvarSecaoDeLivro(edicao: SecaoEditadaDoLivro): Promise<SecaoEditadaDoLivro> {
    const atuais = this.secoesLocais();
    const i = atuais.findIndex((e) => e.id === edicao.id);

    if (i >= 0) atuais[i] = edicao;
    else atuais.push(edicao);

    this.storage.set(this.CHAVE_LIVROS, atuais);
    esquecerRemocao(this.storage, 'SECAO_DE_LIVRO', edicao.id);
    return edicao;
  }

  /** Reverter apaga a edição: a seção volta ao texto de partida do livro. */
  public async reverterSecaoDeLivro(id: string): Promise<void> {
    const atuais = this.secoesLocais();
    this.storage.set(
      this.CHAVE_LIVROS,
      atuais.filter((e) => e.id !== id)
    );
    if (this.publicado('SECAO_DE_LIVRO', id)) registrarRemocao(this.storage, 'SECAO_DE_LIVRO', id);
  }

  public async removidos(): Promise<RemocaoEditorial[]> {
    return remocoesVigentes(this.storage);
  }

  public async substituirTudo(entrada: {
    edicoes: EditorialEdit[];
    licoesCriadas: EditorialLesson[];
    artigos: EdicaoDeArtigo[];
    secoesDeLivro: SecaoEditadaDoLivro[];
    removidos: RemocaoEditorial[];
  }): Promise<void> {
    this.storage.set(this.CHAVE, entrada.edicoes);
    this.storage.set(this.CHAVE_LICOES, entrada.licoesCriadas);
    this.storage.set(this.CHAVE_ARTIGOS, entrada.artigos);
    this.storage.set(this.CHAVE_LIVROS, entrada.secoesDeLivro);
    this.storage.set(CHAVE_DAS_REMOCOES, entrada.removidos);
  }
}

export const editorialRepository: EditorialRepository =
  new PersistentEditorialRepository();
