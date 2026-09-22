import { AcademyLesson, LessonBlock, AudienceVariant } from '../../domain/academy';
import {
  EditTarget,
  EditorialEdit,
  EditorialLesson,
  applyEdits,
  applyEditsToMany,
  createdLessonIsValid,
  editId,
  isEditableBlock,
  problemasDoBloco,
} from '../../domain/editorial-edit';
import { ArtigoDoConservatorio } from '../../domain/article';
import {
  EdicaoDeArtigo,
  aplicarEdicoesDeArtigos,
  idDaEdicaoDeArtigo,
  problemasDoArtigo,
} from '../../domain/editorial-artigo';
import {
  PacoteEditorial,
  ResumoDoPacote,
  fundirArtigos,
  fundirEdicoes,
  fundirLivretos,
  fundirLicoesCriadas,
  lerPacote,
  montarPacote,
  nomeDoArquivo,
  resumirPacote,
} from '../../domain/pacote-editorial';
import { EditorialRepository, editorialRepository } from '../../repositories/editorial.repository';
import {
  BookletRepository,
  PersistentBookletRepository,
} from '../../repositories/booklet.repository';

/**
 * A ENGINE EDITORIAL — criar, corrigir, remover e publicar conteúdo.
 *
 * 🔴 ONDE A EDIÇÃO VIVE, E POR QUE ISSO IMPORTA
 * ---------------------------------------------
 * A plataforma publica do git, pelo Cloudflare Pages, e não tem banco. Por
 * isso a edição grava em `localStorage` e é **mesclada sobre o conteúdo
 * publicado na leitura**: quem edita vê o efeito na hora, no próprio
 * navegador.
 *
 * Isso é metade do caminho, e a metade que falta é a que importa: a edição
 * **não chega ao aluno** enquanto não virar commit. O `exportarPacote` é a
 * ponte, e a tela precisa dizer isso com todas as letras. Uma engine que
 * parece publicar e não publica é pior que uma que não publica — porque quem
 * corrigiu vai embora achando que corrigiu.
 *
 * 🔴 A AUTORIZAÇÃO NÃO MORA AQUI
 * ------------------------------
 * Este serviço **não** decide quem é administrador, e não recebe e-mail nem
 * papel para comparar. A outorga vem da sessão assinada pelo servidor, e a
 * `GuardaDeAudiencia` é quem barra a rota.
 *
 * O motivo de não repetir a verificação aqui é justamente segurança: uma
 * segunda regra, escrita em outro lugar, é uma segunda regra para manter em
 * dia — e a que ficar para trás vira a brecha. O que este serviço faz é
 * **registrar quem** editou, e isso ele exige.
 */
export class EditorialService {
  private repo: EditorialRepository;
  /**
   * 🔴 OS LIVRETOS ENTRAM AQUI, e não numa engine à parte.
   *
   * O editor de livretos já existia, completo e gravando — e o trabalho ficava
   * preso no navegador, porque o pacote não o levava. Um segundo pacote, com
   * regra própria de fusão, seria uma segunda coisa para manter em dia.
   */
  private livretos: BookletRepository;

  constructor(
    repo: EditorialRepository = editorialRepository,
    livretos: BookletRepository = new PersistentBookletRepository()
  ) {
    this.repo = repo;
    this.livretos = livretos;
  }

  // -------------------------------------------------------------------------
  // Leitura
  // -------------------------------------------------------------------------

  public async edicoes(): Promise<EditorialEdit[]> {
    return this.repo.todas();
  }

  public async edicoesDaLicao(lessonId: string): Promise<EditorialEdit[]> {
    return this.repo.daLicao(lessonId);
  }

  public async historico(limite = 100): Promise<EditorialEdit[]> {
    return this.repo.historico(limite);
  }

  public async licoesCriadas(): Promise<EditorialLesson[]> {
    return this.repo.licoesCriadas();
  }

  /** A lição como ela deve ser lida: a publicada, com a camada por cima. */
  public async licaoComEdicoes(licao: AcademyLesson): Promise<AcademyLesson> {
    return applyEdits(licao, await this.repo.todas());
  }

  public async licoesComEdicoes(licoes: AcademyLesson[]): Promise<AcademyLesson[]> {
    return applyEditsToMany(licoes, await this.repo.todas());
  }

  // -------------------------------------------------------------------------
  // Escrita
  // -------------------------------------------------------------------------

  /**
   * Grava a correção de um bloco.
   *
   * 🔴 VALIDA ANTES DE GRAVAR. Uma pauta com nota que o renderizador não
   * entende produz pentagrama vazio na lição — e quem gravou já saiu da tela
   * quando o aluno encontra. A recusa aqui é imediata e nomeia o problema.
   */
  public async salvarBloco(entrada: {
    lessonId: string;
    variante: AudienceVariant;
    secaoId: string;
    bloco: LessonBlock;
    /** O bloco como o Conservatório publicou, para o botão de reverter. */
    publicado: LessonBlock;
    editadaPor: string;
    motivo?: string;
  }): Promise<EditorialEdit> {
    if (!entrada.editadaPor.trim()) {
      throw new Error('Toda edição precisa de autoria: a trilha de revisão depende dela.');
    }

    if (!isEditableBlock(entrada.bloco)) {
      throw new Error(
        `Blocos do tipo ${entrada.bloco.kind} não são editáveis por aqui.`
      );
    }

    const problemas = problemasDoBloco(entrada.bloco);
    if (problemas.length > 0) {
      throw new Error(problemas.join(' '));
    }

    const alvo: EditTarget = {
      tipo: 'BLOCO',
      variante: entrada.variante,
      secaoId: entrada.secaoId,
      blocoId: entrada.bloco.id,
    };

    return this.repo.salvar({
      id: editId(entrada.lessonId, alvo),
      lessonId: entrada.lessonId,
      alvo,
      conteudo: entrada.bloco,
      anterior: entrada.publicado,
      editadaPor: entrada.editadaPor,
      editadaEm: new Date().toISOString(),
      motivo: entrada.motivo,
    });
  }

  /**
   * Grava a lista inteira de blocos de uma seção.
   *
   * É o que permite **acrescentar**, **remover** e **reordenar** — três coisas
   * que a camada não sabia fazer, e por isso um pentagrama faltando só podia
   * ser resolvido mudando o código.
   */
  public async salvarBlocosDaSecao(entrada: {
    lessonId: string;
    variante: AudienceVariant;
    secaoId: string;
    blocos: LessonBlock[];
    publicados: LessonBlock[];
    editadaPor: string;
    motivo?: string;
  }): Promise<EditorialEdit> {
    if (!entrada.editadaPor.trim()) {
      throw new Error('Toda edição precisa de autoria: a trilha de revisão depende dela.');
    }

    /**
     * Todo bloco é conferido, e não só os novos. Reordenar não deveria poder
     * salvar um bloco quebrado que já estava lá — mas se ele está quebrado,
     * este é o momento em que alguém pode consertar.
     */
    const problemas = entrada.blocos.flatMap((b) =>
      problemasDoBloco(b).map((p) => `${b.kind}: ${p}`)
    );
    if (problemas.length > 0) throw new Error(problemas.join(' '));

    const ids = entrada.blocos.map((b) => b.id);
    if (new Set(ids).size !== ids.length) {
      /**
       * Identificador repetido faz a edição de um bloco pousar nos dois, e a
       * correção de um parágrafo aparecer em outro lugar da lição.
       */
      throw new Error('Há blocos com o mesmo identificador nesta seção.');
    }

    const alvo: EditTarget = {
      tipo: 'BLOCOS_DA_SECAO',
      variante: entrada.variante,
      secaoId: entrada.secaoId,
    };

    return this.repo.salvar({
      id: editId(entrada.lessonId, alvo),
      lessonId: entrada.lessonId,
      alvo,
      conteudo: entrada.blocos,
      anterior: entrada.publicados,
      editadaPor: entrada.editadaPor,
      editadaEm: new Date().toISOString(),
      motivo: entrada.motivo,
    });
  }

  public async salvarTituloDaSecao(entrada: {
    lessonId: string;
    variante: AudienceVariant;
    secaoId: string;
    titulo: string;
    anterior: string;
    editadaPor: string;
    motivo?: string;
  }): Promise<EditorialEdit> {
    if (!entrada.titulo.trim()) throw new Error('O título da seção não pode ficar vazio.');

    const alvo: EditTarget = {
      tipo: 'TITULO_DA_SECAO',
      variante: entrada.variante,
      secaoId: entrada.secaoId,
    };

    return this.repo.salvar({
      id: editId(entrada.lessonId, alvo),
      lessonId: entrada.lessonId,
      alvo,
      conteudo: entrada.titulo,
      anterior: entrada.anterior,
      editadaPor: entrada.editadaPor,
      editadaEm: new Date().toISOString(),
      motivo: entrada.motivo,
    });
  }

  /** Reverter apaga a edição: a lição volta ao que o Conservatório publicou. */
  public async reverter(id: string): Promise<void> {
    return this.repo.reverter(id);
  }

  // -------------------------------------------------------------------------
  // Lições criadas
  // -------------------------------------------------------------------------

  /**
   * Cria ou atualiza uma lição da curadoria.
   *
   * `createdLessonIsValid` é a mesma porta que o resto da camada usa: uma
   * lição sem título, sem módulo ou sem bloco nenhum entraria na árvore como
   * gaveta vazia, e quem a abrisse encontraria uma tela em branco.
   */
  public async salvarLicaoCriada(licao: EditorialLesson): Promise<EditorialLesson> {
    if (!licao.criadaPor.trim()) {
      throw new Error('Toda lição criada precisa de autoria.');
    }

    if (!createdLessonIsValid(licao)) {
      throw new Error('A lição está incompleta: precisa de título, módulo, curso e ao menos um bloco.');
    }

    const problemas = licao.blocks.flatMap((b) =>
      problemasDoBloco(b).map((p) => `${b.kind}: ${p}`)
    );
    if (problemas.length > 0) throw new Error(problemas.join(' '));

    return this.repo.salvarLicaoCriada(licao);
  }

  public async removerLicaoCriada(id: string): Promise<void> {
    return this.repo.removerLicaoCriada(id);
  }

  // -------------------------------------------------------------------------
  // O pacote — como a edição sai daqui
  // -------------------------------------------------------------------------

  public async exportarPacote(exportadoPor?: string): Promise<{
    pacote: PacoteEditorial;
    json: string;
    nomeDoArquivo: string;
    resumo: ResumoDoPacote;
  }> {
    const pacote = montarPacote({
      edicoes: await this.repo.todas(),
      licoesCriadas: await this.repo.licoesCriadas(),
      artigos: await this.repo.artigos(),
      livretos: await this.livretos.listarLivretos(),
      exportadoPor,
    });

    return {
      pacote,
      /** Indentado: o destino é um commit, e diff de JSON numa linha é ilegível. */
      json: JSON.stringify(pacote, null, 2),
      nomeDoArquivo: nomeDoArquivo(pacote),
      resumo: resumirPacote(pacote),
    };
  }

  /**
   * Importa um pacote, fundindo com o que já está gravado.
   *
   * 🔴 FUNDE, e não substitui. Trocar a camada inteira pelo pacote apagaria o
   * trabalho local de quem importou — inclusive correções mais recentes que as
   * do arquivo. A regra é a mais nova vence, por data, por identificador.
   *
   * Devolve o que aconteceu, item a item. "Importado com sucesso" sem números
   * esconde o caso em que nada entrou porque tudo era mais antigo.
   */
  public async importarPacote(texto: string): Promise<{
    ok: boolean;
    motivo?: string;
    edicoes?: { adicionadas: number; substituidas: number; mantidas: number };
    licoes?: { adicionadas: number; substituidas: number; mantidas: number };
    artigos?: { adicionadas: number; substituidas: number; mantidas: number };
    livretos?: { adicionadas: number; substituidas: number; mantidas: number };
  }> {
    const leitura = lerPacote(texto);
    if (!leitura.ok) return { ok: false, motivo: leitura.motivo };

    const edicoes = fundirEdicoes(await this.repo.todas(), leitura.pacote.edicoes);
    const licoes = fundirLicoesCriadas(
      await this.repo.licoesCriadas(),
      leitura.pacote.licoesCriadas
    );
    const artigos = fundirArtigos(await this.repo.artigos(), leitura.pacote.artigos);
    const livretos = fundirLivretos(
      await this.livretos.listarLivretos(),
      leitura.pacote.livretos
    );

    /**
     * O livreto é gravado um a um: o repositório dele guarda por curso, e não
     * tem troca em bloco. Gravar tudo de uma vez exigiria um caminho novo lá,
     * e ele não existe para nada mais.
     */
    for (const l of livretos.resultado) await this.livretos.salvarLivreto(l);

    await this.repo.substituirTudo({
      edicoes: edicoes.resultado,
      licoesCriadas: licoes.resultado,
      artigos: artigos.resultado,
    });

    return {
      ok: true,
      edicoes: {
        adicionadas: edicoes.adicionadas,
        substituidas: edicoes.substituidas,
        mantidas: edicoes.mantidas,
      },
      licoes: {
        adicionadas: licoes.adicionadas,
        substituidas: licoes.substituidas,
        mantidas: licoes.mantidas,
      },
      artigos: {
        adicionadas: artigos.adicionadas,
        substituidas: artigos.substituidas,
        mantidas: artigos.mantidas,
      },
      livretos: {
        adicionadas: livretos.adicionadas,
        substituidas: livretos.substituidas,
        mantidas: livretos.mantidas,
      },
    };
  }

  /** Quantas mudanças existem à espera de virar commit. */
  public async pendentes(): Promise<number> {
    const edicoes = await this.repo.todas();
    const licoes = await this.repo.licoesCriadas();
    const artigos = await this.repo.artigos();
    return edicoes.length + licoes.length + artigos.length;
  }

  // -------------------------------------------------------------------------
  // Artigos
  // -------------------------------------------------------------------------

  public async edicoesDeArtigos(): Promise<EdicaoDeArtigo[]> {
    return this.repo.artigos();
  }

  /** Os artigos como devem ser lidos: os publicados, com a camada por cima. */
  public async artigosComEdicoes(
    publicados: readonly ArtigoDoConservatorio[]
  ): Promise<ArtigoDoConservatorio[]> {
    return aplicarEdicoesDeArtigos(publicados, await this.repo.artigos());
  }

  /**
   * Grava um artigo — corrigido ou escrito do zero.
   *
   * 🔴 VALIDA ANTES DE GRAVAR, e a exigência aqui é mais dura que a das lições:
   * o artigo sai **assinado e datado**. Um resumo vazio ou uma citação sem
   * motivo entra na biblioteca com o nome de alguém embaixo.
   *
   * `idsDoAcervo` é opcional porque nem todo chamador tem o acervo carregado.
   * Quando vem, a conferência inclui "esta obra existe?" — artigo que aponta
   * para obra inexistente é um percurso que não se pode percorrer.
   */
  public async salvarArtigo(entrada: {
    artigo: ArtigoDoConservatorio;
    /** O artigo como o Conservatório publicou. `null` quando é novo. */
    publicado: ArtigoDoConservatorio | null;
    editadaPor: string;
    motivo?: string;
    idsDoAcervo?: Set<string>;
  }): Promise<EdicaoDeArtigo> {
    if (!entrada.editadaPor.trim()) {
      throw new Error('Toda edição precisa de autoria: a trilha de revisão depende dela.');
    }

    const problemas = problemasDoArtigo(entrada.artigo, entrada.idsDoAcervo);
    if (problemas.length > 0) throw new Error(problemas.join(' '));

    const agora = new Date().toISOString();

    return this.repo.salvarArtigo({
      id: idDaEdicaoDeArtigo(entrada.artigo.id),
      artigoId: entrada.artigo.id,
      /** `atualizadoEm` é gravado aqui, e não pela tela: é registro, não campo. */
      conteudo: { ...entrada.artigo, atualizadoEm: agora },
      anterior: entrada.publicado,
      criado: entrada.publicado === null,
      editadaPor: entrada.editadaPor,
      editadaEm: agora,
      motivo: entrada.motivo,
    });
  }

  /**
   * Remove a edição de um artigo.
   *
   * Para artigo publicado, isso é **reverter**: ele volta ao que o acervo
   * publicou. Para artigo escrito pela curadoria, é apagar — ele não existe em
   * lugar nenhum além da camada. A tela precisa dizer qual dos dois é.
   */
  public async removerArtigo(artigoId: string): Promise<void> {
    return this.repo.removerArtigo(artigoId);
  }
}

export const editorialService = new EditorialService();
