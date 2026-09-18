import { EntityId, ISOTimestamp } from './types';

/**
 * Livreto de exercícios de um curso.
 *
 * O QUE É
 * -------
 * O caderno de exercícios que acompanha cada curso, capítulo por capítulo —
 * e que a fundadora edita inteiro pelo console: acrescentar questão, remover,
 * reescrever enunciado, trocar alternativa, mudar de lugar.
 *
 * POR QUE É UMA ENTIDADE PRÓPRIA, E NÃO CAMPOS SOLTOS NA LIÇÃO
 * ------------------------------------------------------------
 * Porque o livreto tem vida independente da lição: a mesma questão aparece
 * DUAS vezes — intercalada no capítulo, como fixação, e de novo no simulado
 * final, junto das outras, na ordem. Se a questão morasse dentro da lição,
 * manter as duas cópias em sincronia seria trabalho manual, e a primeira
 * edição que alguém fizesse numa delas quebraria a outra.
 *
 * Com o livreto como fonte única, corrigir um enunciado corrige nos dois
 * lugares — que é o comportamento que quem revisa espera.
 */

// ---------------------------------------------------------------------------
// Questão
// ---------------------------------------------------------------------------

export type TipoQuestao =
  /** Uma alternativa correta entre quatro. */
  | 'MULTIPLA_ESCOLHA'
  /** Afirmação para julgar. */
  | 'VERDADEIRO_FALSO'
  /** Resposta curta digitada, conferida por normalização. */
  | 'RESPOSTA_CURTA'
  /** Identificar um elemento numa pauta, teclado ou diagrama. */
  | 'IDENTIFICACAO';

export type DificuldadeQuestao = 'basica' | 'intermediaria' | 'avancada';

export interface Alternativa {
  id: string;
  texto: string;
  /** Por que esta alternativa está errada — ou certa. */
  comentario?: string;
}

export interface Questao {
  id: EntityId;
  enunciado: string;
  tipo: TipoQuestao;
  /** Vazio em resposta curta. */
  alternativas: Alternativa[];
  /** Id da alternativa correta, ou o texto aceito em resposta curta. */
  resposta: string;
  /**
   * Por que a resposta é essa.
   *
   * Obrigatória. Uma questão sem explicação ensina a acertar, não o assunto —
   * e é o tipo de questão que um gerador automático produz aos milhares.
   */
  explicacao: string;
  dificuldade: DificuldadeQuestao;
  /** Conceitos que a questão verifica. Serve para montar prova equivalente. */
  competencias: string[];
  /** Página do material de estudo de onde o conceito vem. Uso interno. */
  referenciaInterna?: string;
}

// ---------------------------------------------------------------------------
// Capítulo
// ---------------------------------------------------------------------------

export interface CapituloLivreto {
  id: EntityId;
  numero: number;
  titulo: string;
  /** Lição a que este capítulo corresponde, quando há. */
  licaoId?: EntityId;
  /**
   * Questões de fixação, mostradas ao fim da leitura do capítulo.
   *
   * São as MESMAS que reaparecem no simulado final. Ver a nota do módulo.
   */
  questoes: Questao[];
  /** Nota do revisor sobre o capítulo. Não aparece para o aluno. */
  notaDeRevisao?: string;
}

export interface Livreto {
  id: EntityId;
  cursoId: EntityId;
  titulo: string;
  descricao: string;
  capitulos: CapituloLivreto[];
  /** Quem editou por último, para a trilha de revisão. */
  atualizadoPor?: string;
  criadoEm: ISOTimestamp;
  atualizadoEm: ISOTimestamp;
}

// ---------------------------------------------------------------------------
// Avaliações derivadas
// ---------------------------------------------------------------------------

export type TipoAvaliacao =
  /** As MESMAS questões do livreto, todas juntas, na ordem dos capítulos. */
  | 'SIMULADO'
  /** Questões diferentes, de mesmo nível e mesma cobertura. */
  | 'PROVA';

export interface Avaliacao {
  id: EntityId;
  cursoId: EntityId;
  livretoId: EntityId;
  tipo: TipoAvaliacao;
  titulo: string;
  /**
   * No simulado, são referências às questões do livreto — não cópias.
   * Corrigir o livreto corrige o simulado.
   */
  questaoIds: EntityId[];
  /** Na prova, as questões são próprias. */
  questoesProprias: Questao[];
  /** Acerto mínimo, em porcentagem. */
  notaDeCorte: number;
  /** Minutos; zero significa sem limite. */
  tempoLimiteMinutos: number;
  criadoEm: ISOTimestamp;
  atualizadoEm: ISOTimestamp;
}

/** Questões efetivas de uma avaliação, resolvendo as referências. */
export function questoesDaAvaliacao(avaliacao: Avaliacao, livreto: Livreto): Questao[] {
  if (avaliacao.tipo === 'PROVA') return avaliacao.questoesProprias;

  const porId = new Map<string, Questao>();
  for (const c of livreto.capitulos) {
    for (const q of c.questoes) porId.set(q.id, q);
  }
  // A ordem é a dos capítulos, não a do array de ids: o simulado percorre o
  // curso na ordem em que ele foi estudado.
  return avaliacao.questaoIds
    .map((id) => porId.get(id))
    .filter((q): q is Questao => Boolean(q));
}

/**
 * Monta o simulado a partir do livreto.
 *
 * Todas as questões, na ordem dos capítulos. Não sorteia nem recorta: o
 * simulado é a revisão do curso inteiro, e a previsibilidade é a função dele
 * — o aluno chega à prova sabendo o que estudou.
 */
export function montarSimulado(livreto: Livreto, notaDeCorte = 70): Avaliacao {
  const agora = new Date().toISOString();
  const ids = livreto.capitulos
    .slice()
    .sort((a, b) => a.numero - b.numero)
    .flatMap((c) => c.questoes.map((q) => q.id));

  return {
    id: `aval_sim_${livreto.cursoId}`,
    cursoId: livreto.cursoId,
    livretoId: livreto.id,
    tipo: 'SIMULADO',
    titulo: `Simulado — ${livreto.titulo}`,
    questaoIds: ids,
    questoesProprias: [],
    notaDeCorte,
    tempoLimiteMinutos: 0,
    criadoEm: agora,
    atualizadoEm: agora,
  };
}

// ---------------------------------------------------------------------------
// Equivalência entre prova e livreto
// ---------------------------------------------------------------------------

export interface CoberturaDeCompetencia {
  competencia: string;
  noLivreto: number;
  naProva: number;
}

export interface RelatorioDeEquivalencia {
  equivalente: boolean;
  cobertura: CoberturaDeCompetencia[];
  /** Competências cobradas no livreto e ausentes da prova. */
  faltando: string[];
  /** Competências na prova que o curso não ensinou. */
  excedentes: string[];
  /** Distribuição de dificuldade, para comparação. */
  dificuldadeLivreto: Record<DificuldadeQuestao, number>;
  dificuldadeProva: Record<DificuldadeQuestao, number>;
}

function contarDificuldade(questoes: Questao[]): Record<DificuldadeQuestao, number> {
  const c: Record<DificuldadeQuestao, number> = { basica: 0, intermediaria: 0, avancada: 0 };
  for (const q of questoes) c[q.dificuldade] += 1;
  return c;
}

/**
 * Confere se uma prova cobre o mesmo que o curso ensinou.
 *
 * Existe porque "questões parecidas, de mesmo nível e mesma cobertura" é
 * fácil de dizer e fácil de errar: basta esquecer um capítulo para a prova
 * cobrar algo que ninguém estudou, ou deixar de cobrar o que era o centro do
 * curso. A conferência é mecânica e roda antes de publicar.
 */
export function conferirEquivalencia(
  livreto: Livreto,
  prova: Avaliacao
): RelatorioDeEquivalencia {
  const doLivreto = livreto.capitulos.flatMap((c) => c.questoes);
  const daProva = prova.questoesProprias;

  const contar = (questoes: Questao[]) => {
    const m = new Map<string, number>();
    for (const q of questoes) {
      for (const comp of q.competencias) m.set(comp, (m.get(comp) ?? 0) + 1);
    }
    return m;
  };

  const noLivreto = contar(doLivreto);
  const naProva = contar(daProva);
  const todas = new Set([...noLivreto.keys(), ...naProva.keys()]);

  const cobertura: CoberturaDeCompetencia[] = [...todas]
    .map((competencia) => ({
      competencia,
      noLivreto: noLivreto.get(competencia) ?? 0,
      naProva: naProva.get(competencia) ?? 0,
    }))
    .sort((a, b) => b.noLivreto - a.noLivreto);

  const faltando = cobertura.filter((c) => c.noLivreto > 0 && c.naProva === 0).map((c) => c.competencia);
  const excedentes = cobertura.filter((c) => c.noLivreto === 0 && c.naProva > 0).map((c) => c.competencia);

  return {
    equivalente: faltando.length === 0 && excedentes.length === 0,
    cobertura,
    faltando,
    excedentes,
    dificuldadeLivreto: contarDificuldade(doLivreto),
    dificuldadeProva: contarDificuldade(daProva),
  };
}

// ---------------------------------------------------------------------------
// Validação editorial
// ---------------------------------------------------------------------------

export interface ProblemaDeQuestao {
  questaoId: EntityId;
  gravidade: 'erro' | 'aviso';
  mensagem: string;
}

/**
 * Confere uma questão antes de ela ir ao ar.
 *
 * As regras aqui existem porque cada uma delas corresponde a um defeito que
 * o aluno encontra na prática — alternativa duplicada, resposta que não está
 * entre as opções, enunciado vazio. São baratas de verificar e caras de
 * descobrir depois.
 */
export function validarQuestao(q: Questao): ProblemaDeQuestao[] {
  const p: ProblemaDeQuestao[] = [];
  const erro = (mensagem: string) => p.push({ questaoId: q.id, gravidade: 'erro', mensagem });
  const aviso = (mensagem: string) => p.push({ questaoId: q.id, gravidade: 'aviso', mensagem });

  if (q.enunciado.trim().length < 10) erro('O enunciado está vazio ou curto demais.');
  if (q.explicacao.trim().length < 10) {
    erro('Falta a explicação. Sem ela, a questão ensina a acertar, não o assunto.');
  }
  if (q.competencias.length === 0) {
    aviso('Sem competência declarada, esta questão não entra na conferência de equivalência.');
  }

  if (q.tipo === 'MULTIPLA_ESCOLHA' || q.tipo === 'IDENTIFICACAO') {
    if (q.alternativas.length < 3) erro('Multipla escolha precisa de ao menos três alternativas.');
    if (!q.alternativas.some((a) => a.id === q.resposta)) {
      erro('A resposta indicada não corresponde a nenhuma alternativa.');
    }
    const textos = q.alternativas.map((a) => a.texto.trim().toLowerCase());
    if (new Set(textos).size !== textos.length) erro('Há alternativas repetidas.');
    if (textos.some((t) => t.length === 0)) erro('Há alternativa em branco.');
  }

  if (q.tipo === 'VERDADEIRO_FALSO' && q.alternativas.length !== 2) {
    erro('Verdadeiro ou falso precisa de exatamente duas alternativas.');
  }

  if (q.tipo === 'RESPOSTA_CURTA' && q.resposta.trim().length === 0) {
    erro('Resposta curta precisa da resposta aceita.');
  }

  return p;
}

export interface ProblemaDeLivreto {
  gravidade: 'erro' | 'aviso';
  mensagem: string;
  capituloId?: EntityId;
  questaoId?: EntityId;
}

/**
 * Confere o livreto inteiro, incluindo o equilíbrio entre capítulos.
 *
 * O equilíbrio importa: um capítulo com dezoito questões seguido de outro com
 * duas não é rigor, é descuido — e o aluno sente como se o curso perdesse o
 * fôlego no meio.
 */
export function validarLivreto(livreto: Livreto): ProblemaDeLivreto[] {
  const problemas: ProblemaDeLivreto[] = [];

  if (livreto.capitulos.length === 0) {
    problemas.push({ gravidade: 'erro', mensagem: 'O livreto não tem capítulos.' });
    return problemas;
  }

  const ids = new Set<string>();
  for (const capitulo of livreto.capitulos) {
    if (capitulo.questoes.length === 0) {
      problemas.push({
        gravidade: 'aviso',
        capituloId: capitulo.id,
        mensagem: `O capítulo ${capitulo.numero} — ${capitulo.titulo} — está sem questões.`,
      });
    }
    for (const q of capitulo.questoes) {
      if (ids.has(q.id)) {
        problemas.push({
          gravidade: 'erro',
          capituloId: capitulo.id,
          questaoId: q.id,
          mensagem: `Identificador de questão repetido: ${q.id}.`,
        });
      }
      ids.add(q.id);
      for (const pq of validarQuestao(q)) {
        problemas.push({
          gravidade: pq.gravidade,
          capituloId: capitulo.id,
          questaoId: q.id,
          mensagem: pq.mensagem,
        });
      }
    }
  }

  const contagens = livreto.capitulos.map((c) => c.questoes.length).filter((n) => n > 0);
  if (contagens.length >= 2) {
    const menor = Math.min(...contagens);
    const maior = Math.max(...contagens);
    if (maior > menor * 3) {
      problemas.push({
        gravidade: 'aviso',
        mensagem: `Capítulos desequilibrados: de ${menor} a ${maior} questões. Um capítulo com o triplo do outro faz o curso parecer perder o fôlego.`,
      });
    }
  }

  return problemas;
}

export function livretoValido(livreto: Livreto): boolean {
  return validarLivreto(livreto).every((p) => p.gravidade !== 'erro');
}

/** Contagem total de questões, para a interface. */
export function totalDeQuestoes(livreto: Livreto): number {
  return livreto.capitulos.reduce((a, c) => a + c.questoes.length, 0);
}

// ---------------------------------------------------------------------------
// Prova final
// ---------------------------------------------------------------------------

export interface PlanoDaProva {
  /** Quantas questões a prova terá ao todo. */
  totalDeQuestoes: number;
  notaDeCorte: number;
  tempoLimiteMinutos: number;
  /** Semente do sorteio. Mesma semente, mesma prova. */
  semente: number;
}

export const PLANO_PADRAO: PlanoDaProva = {
  totalDeQuestoes: 30,
  notaDeCorte: 70,
  tempoLimiteMinutos: 90,
  semente: 1,
};

/**
 * Sorteio determinístico.
 *
 * Gerador congruente linear simples. Não serve para criptografia e não
 * pretende: serve para que a mesma semente produza sempre a mesma prova, o
 * que torna a montagem testável e auditável. Uma prova que muda a cada
 * chamada não pode ser conferida por ninguém.
 */
function sorteioDeterministico(semente: number): () => number {
  let estado = semente >>> 0 || 1;
  return () => {
    estado = (estado * 1664525 + 1013904223) >>> 0;
    return estado / 0x100000000;
  };
}

function embaralhar<T>(itens: T[], proximo: () => number): T[] {
  const copia = [...itens];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(proximo() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/**
 * Monta a prova final a partir do livreto, cobrindo todas as competências.
 *
 * COMO ELA DIFERE DO SIMULADO
 * ---------------------------
 * O simulado é o livreto inteiro, na ordem estudada: previsível de propósito,
 * porque a função dele é revisar. A prova **sorteia** um subconjunto e o
 * embaralha — se ela fosse o livreto na mesma ordem, decorar a posição da
 * resposta substituiria estudar.
 *
 * A COBERTURA VEM ANTES DA QUANTIDADE
 * -----------------------------------
 * Primeiro garante-se **uma questão de cada competência** que o curso ensina.
 * Só depois o resto das vagas é preenchido. Uma prova de trinta questões que
 * sorteou vinte e oito de intervalos e duas de tudo o mais não mede o curso,
 * mede um capítulo.
 *
 * As questões da prova são **próprias** — cópias congeladas, não referências.
 * Editar o livreto depois não pode mudar uma prova que alguém já fez.
 */
export function montarProvaFinal(
  livreto: Livreto,
  plano: Partial<PlanoDaProva> = {}
): Avaliacao {
  const cfg = { ...PLANO_PADRAO, ...plano };
  const proximo = sorteioDeterministico(cfg.semente);
  const agora = new Date().toISOString();

  const todas = livreto.capitulos
    .slice()
    .sort((a, b) => a.numero - b.numero)
    .flatMap((c) => c.questoes);

  // 1. uma de cada competência, para garantir que nada fique de fora
  const porCompetencia = new Map<string, Questao[]>();
  for (const q of todas) {
    for (const comp of q.competencias) {
      const lista = porCompetencia.get(comp) ?? [];
      lista.push(q);
      porCompetencia.set(comp, lista);
    }
  }

  const escolhidas: Questao[] = [];
  const jaEscolhida = new Set<string>();

  for (const comp of [...porCompetencia.keys()].sort()) {
    const candidatas = embaralhar(porCompetencia.get(comp) ?? [], proximo);
    const escolha = candidatas.find((q) => !jaEscolhida.has(q.id));
    if (escolha) {
      escolhidas.push(escolha);
      jaEscolhida.add(escolha.id);
    }
  }

  // 2. o resto das vagas, sorteado entre o que sobrou
  const restantes = embaralhar(
    todas.filter((q) => !jaEscolhida.has(q.id)),
    proximo
  );
  for (const q of restantes) {
    if (escolhidas.length >= cfg.totalDeQuestoes) break;
    escolhidas.push(q);
    jaEscolhida.add(q.id);
  }

  // 3. embaralha a ordem final e congela as cópias
  const finais = embaralhar(escolhidas, proximo).map((q) => ({
    ...q,
    id: `pf_${q.id}`,
    alternativas: q.alternativas.map((a) => ({ ...a })),
    competencias: [...q.competencias],
  }));

  return {
    id: `aval_prova_${livreto.cursoId}`,
    cursoId: livreto.cursoId,
    livretoId: livreto.id,
    tipo: 'PROVA',
    titulo: `Prova final — ${livreto.titulo.replace(/^Caderno de Exercícios — /, '')}`,
    questaoIds: [],
    questoesProprias: finais,
    notaDeCorte: cfg.notaDeCorte,
    tempoLimiteMinutos: cfg.tempoLimiteMinutos,
    criadoEm: agora,
    atualizadoEm: agora,
  };
}

/** Competências que a prova deixou de cobrir, se alguma. */
export function competenciasNaoCobertas(prova: Avaliacao, livreto: Livreto): string[] {
  const doLivreto = new Set(
    livreto.capitulos.flatMap((c) => c.questoes.flatMap((q) => q.competencias))
  );
  const naProva = new Set(prova.questoesProprias.flatMap((q) => q.competencias));
  return [...doLivreto].filter((c) => !naProva.has(c)).sort();
}
