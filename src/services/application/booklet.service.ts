import {
  PersistentBookletRepository,
  BookletRepository,
} from '../../repositories/booklet.repository';
import {
  Livreto,
  CapituloLivreto,
  Questao,
  Avaliacao,
  TipoAvaliacao,
  montarSimulado,
  questoesDaAvaliacao,
  conferirEquivalencia,
  RelatorioDeEquivalencia,
  validarLivreto,
  validarQuestao,
  ProblemaDeLivreto,
  livretoValido,
} from '../../domain/booklet';
import {
  Anotacao,
  TipoAnotacao,
  CorDeMarcacao,
  AncoraDeTrecho,
  montarCaderno,
  resumirCaderno,
  EntradaDoCaderno,
  ResumoDoCaderno,
} from '../../domain/annotations';

function agora(): string {
  return new Date().toISOString();
}

function novoId(prefixo: string): string {
  return `${prefixo}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Livretos de exercício, avaliações e anotações.
 */
export class BookletService {
  constructor(private repo: BookletRepository = new PersistentBookletRepository()) {}

  // ------------------------------------------------------------- livretos

  public listarLivretos(): Promise<Livreto[]> {
    return this.repo.listarLivretos();
  }

  public buscarLivreto(id: string): Promise<Livreto | null> {
    return this.repo.buscarLivreto(id);
  }

  public buscarLivretoDoCurso(cursoId: string): Promise<Livreto | null> {
    return this.repo.buscarLivretoDoCurso(cursoId);
  }

  public validar(livreto: Livreto): ProblemaDeLivreto[] {
    return validarLivreto(livreto);
  }

  /**
   * Salva o livreto. Recusa com erro estrutural, aceita com aviso.
   *
   * A distinção importa para quem edita: um capítulo ainda sem questões é
   * trabalho em andamento e não deve travar o salvamento; uma resposta que
   * não está entre as alternativas é defeito, e deixar salvar significa
   * publicar uma questão impossível de acertar.
   */
  public async salvarLivreto(livreto: Livreto): Promise<Livreto> {
    const erros = validarLivreto(livreto).filter((p) => p.gravidade === 'erro');
    if (erros.length > 0) {
      throw new Error(`Livreto com erro: ${erros.map((e) => e.mensagem).join(' ')}`);
    }
    return this.repo.salvarLivreto(livreto);
  }

  public criarLivreto(cursoId: string, titulo: string): Livreto {
    return {
      id: novoId('liv'),
      cursoId,
      titulo,
      descricao: '',
      capitulos: [],
      criadoEm: agora(),
      atualizadoEm: agora(),
    };
  }

  public criarCapitulo(numero: number, titulo: string): CapituloLivreto {
    return { id: novoId('cap'), numero, titulo, questoes: [] };
  }

  /**
   * Questão nova, já com a estrutura mínima válida.
   *
   * Nasce com quatro alternativas vazias e a primeira marcada como resposta:
   * assim o editor preenche texto em vez de montar estrutura, e a questão
   * nunca passa por um estado em que a resposta aponta para o nada.
   */
  public criarQuestao(): Questao {
    return {
      id: novoId('q'),
      enunciado: '',
      tipo: 'MULTIPLA_ESCOLHA',
      alternativas: [
        { id: 'a', texto: '' },
        { id: 'b', texto: '' },
        { id: 'c', texto: '' },
        { id: 'd', texto: '' },
      ],
      resposta: 'a',
      explicacao: '',
      dificuldade: 'basica',
      competencias: [],
    };
  }

  public validarQuestao(q: Questao) {
    return validarQuestao(q);
  }

  // ----------------------------------------------------------- avaliações

  public listarAvaliacoes(cursoId?: string): Promise<Avaliacao[]> {
    return this.repo.listarAvaliacoes(cursoId);
  }

  public buscarAvaliacao(id: string): Promise<Avaliacao | null> {
    return this.repo.buscarAvaliacao(id);
  }

  /**
   * (Re)gera o simulado do curso a partir do livreto.
   *
   * Regerar é seguro e idempotente — o id é derivado do curso — porque o
   * simulado é, por definição, o livreto inteiro. Não há estado a preservar
   * nele; o que se preserva é o livreto.
   */
  public async regerarSimulado(cursoId: string, notaDeCorte = 70): Promise<Avaliacao> {
    const livreto = await this.repo.buscarLivretoDoCurso(cursoId);
    if (!livreto) throw new Error(`O curso ${cursoId} não tem livreto.`);
    if (!livretoValido(livreto)) {
      throw new Error('O livreto tem erros estruturais; corrija antes de gerar o simulado.');
    }
    const existente = await this.repo.buscarAvaliacao(`aval_sim_${cursoId}`);
    const simulado = montarSimulado(livreto, existente?.notaDeCorte ?? notaDeCorte);
    return this.repo.salvarAvaliacao({ ...simulado, criadoEm: existente?.criadoEm ?? agora() });
  }

  /** Questões efetivas de uma avaliação, resolvendo referências ao livreto. */
  public async questoesDe(avaliacao: Avaliacao): Promise<Questao[]> {
    if (avaliacao.tipo === 'PROVA') return avaliacao.questoesProprias;
    const livreto = await this.repo.buscarLivreto(avaliacao.livretoId);
    return livreto ? questoesDaAvaliacao(avaliacao, livreto) : [];
  }

  public criarAvaliacao(cursoId: string, livretoId: string, tipo: TipoAvaliacao, titulo: string): Avaliacao {
    return {
      id: novoId('aval'),
      cursoId,
      livretoId,
      tipo,
      titulo,
      questaoIds: [],
      questoesProprias: [],
      notaDeCorte: 70,
      tempoLimiteMinutos: tipo === 'PROVA' ? 60 : 0,
      criadoEm: agora(),
      atualizadoEm: agora(),
    };
  }

  public salvarAvaliacao(a: Avaliacao): Promise<Avaliacao> {
    return this.repo.salvarAvaliacao(a);
  }

  public excluirAvaliacao(id: string): Promise<boolean> {
    return this.repo.excluirAvaliacao(id);
  }

  /**
   * Confere se a prova cobre o mesmo que o curso ensinou.
   *
   * "Questões parecidas, de mesmo nível e mesma cobertura" é fácil de dizer e
   * fácil de errar — basta esquecer um capítulo. A conferência é mecânica.
   */
  public async conferirProva(prova: Avaliacao): Promise<RelatorioDeEquivalencia> {
    const livreto = await this.repo.buscarLivreto(prova.livretoId);
    if (!livreto) throw new Error('Livreto não encontrado para esta prova.');
    return conferirEquivalencia(livreto, prova);
  }

  // ------------------------------------------------------------ anotações

  public listarAnotacoes(userId: string, cursoId?: string): Promise<Anotacao[]> {
    return this.repo.listarAnotacoes(userId, cursoId);
  }

  public async anotar(entrada: {
    userId: string;
    cursoId: string;
    licaoId: string;
    blocoId?: string;
    tipo: TipoAnotacao;
    ancora?: AncoraDeTrecho;
    cor?: CorDeMarcacao;
    comentario?: string;
  }): Promise<Anotacao> {
    if (entrada.tipo === 'COMENTARIO' && !entrada.comentario?.trim()) {
      throw new Error('Um comentário sem texto não é um comentário.');
    }
    return this.repo.salvarAnotacao({
      id: novoId('anot'),
      ...entrada,
      criadaEm: agora(),
      atualizadaEm: agora(),
    });
  }

  public async editarAnotacao(
    anotacao: Anotacao,
    mudancas: Partial<Pick<Anotacao, 'comentario' | 'cor'>>
  ): Promise<Anotacao> {
    return this.repo.salvarAnotacao({ ...anotacao, ...mudancas });
  }

  public excluirAnotacao(id: string): Promise<boolean> {
    return this.repo.excluirAnotacao(id);
  }

  /** Caderno do curso: tudo que o aluno marcou, na ordem em que leu. */
  public async caderno(
    userId: string,
    cursoId: string,
    conteudoPorLicao: Record<string, string>
  ): Promise<{ entradas: EntradaDoCaderno[]; resumo: ResumoDoCaderno }> {
    const anotacoes = await this.repo.listarAnotacoes(userId, cursoId);
    const entradas = montarCaderno(anotacoes, conteudoPorLicao);
    return { entradas, resumo: resumirCaderno(entradas) };
  }
}

export const bookletService = new BookletService();
