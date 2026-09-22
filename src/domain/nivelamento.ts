import { ChairId, CHAIRS, Chair, coursesOfChair } from './chair';
import { Livreto, Questao } from './booklet';

/**
 * O NIVELAMENTO — a porta de entrada de quem chega sem nome.
 *
 * O QUE ELE SUBSTITUI, E POR QUÊ
 * ------------------------------
 * A seção do visitante mostrava disciplinas soltas: uma lista de tópicos sem
 * curso, sem módulo e sem ordem, cada um convidando a começar por ali. Quem
 * chega não tem como escolher entre eles — escolher pressupõe saber o que já
 * se sabe, e é exatamente isso que ainda não se sabe.
 *
 * 🔴 AS PERGUNTAS SÃO AS DO LIVRETO, E NÃO AS DO GERADOR
 * ------------------------------------------------------
 * A primeira versão deste arquivo montava o nivelamento sobre
 * `exercise-generator.ts`. Estava errado por dois motivos.
 *
 * O primeiro é que o gerador produz enunciados com a resposta dentro — "Que
 * nota está uma si — qual destas é?" — e explicações que se repetem a si
 * mesmas. Nivelar alguém com pergunta assim não mede nada: mede se a pessoa
 * sabe ler o próprio enunciado.
 *
 * O segundo é que o gerador **só cobre Teoria**, e apenas seis das vinte e uma
 * dimensões. Com ele, "escolher a cadeira" seria uma escolha de mentira: as
 * três levariam ao mesmo lugar.
 *
 * Os livretos têm **378 questões escritas à mão**, em 126 capítulos, com
 * distratores que correspondem a enganos reais — confundir altura com
 * intensidade, ler 6/8 como seis tempos, contar intervalo sem incluir as
 * pontas. Cada capítulo tem três, e cada um aponta a lição a que pertence.
 *
 * 🔴 A ORDEM É A DO CURSO, CAPÍTULO A CAPÍTULO
 * --------------------------------------------
 * O capítulo N pressupõe o N-1. Por isso acertar o capítulo N é evidência de
 * que os anteriores estão de pé, e o primeiro ponto de erro é a fronteira
 * entre o que já se sabe e o que falta.
 *
 * Sem ordem, o erro não localiza nada: numa amostra embaralhada, errar a
 * décima e acertar a terceira não diz por onde começar.
 *
 * 🔴 UM ERRO SÓ NÃO ENCERRA
 * -------------------------
 * Escorregão existe: alternativa clicada errado, enunciado lido pela metade.
 * Encerrar no primeiro erro faria um deslize de um segundo determinar meses de
 * estudo, e a pessoa entraria abaixo do que sabe — o jeito mais rápido de
 * alguém achar o curso infantil e ir embora.
 *
 * O erro abre uma **confirmação**: outra questão do mesmo capítulo. Três por
 * capítulo é o que torna isso possível sem repetir pergunta.
 *
 * O QUE ELE NÃO FAZ
 * -----------------
 * Não emite certificado, não dispensa de nada e não tranca nada. É uma
 * **sugestão de entrada** — e a ordem, aqui como no resto do Laboratório,
 * continua sendo sugestão, e não cadeado.
 */

/** Quantas questões por capítulo, no máximo: a primeira e a confirmação. */
export const TENTATIVAS_POR_CAPITULO = 2;

/**
 * Uma trilha nivelável: um curso, com os capítulos dele em ordem.
 *
 * É o curso, e não a cadeira, porque cadeira pode ter mais de um curso — e os
 * três de História não são sequência um do outro. Nivelar "História" como se
 * fosse um percurso só colocaria quem sabe música brasileira a responder sobre
 * a ocidental, e leria o erro como lacuna.
 */
export interface TrilhaDeNivelamento {
  cursoId: string;
  titulo: string;
  cadeira: ChairId;
  /** Quantos capítulos ela tem. É o comprimento máximo do diagnóstico. */
  capitulos: number;
  /** Quantas questões existem ao todo. Zero significa trilha não nivelável. */
  questoes: number;
}

/** Uma cadeira no seletor, com as trilhas que ela oferece. */
export interface CadeiraNivelavel {
  cadeira: Chair;
  trilhas: TrilhaDeNivelamento[];
}

export interface PassoDoNivelamento {
  /** O número do capítulo no curso. É por ele que se casa o módulo. */
  capitulo: number;
  titulo: string;
  cursoId: string;
  /** A lição do capítulo. Todo capítulo dos livretos tem uma. */
  lessonId?: string;
  /** As questões do capítulo, na ordem em que serão usadas. */
  questoes: Questao[];
}

export interface EstadoDoNivelamento {
  trilha: TrilhaDeNivelamento;
  passos: readonly PassoDoNivelamento[];
  /** Em que capítulo está. */
  indice: number;
  /** 0 = primeira questão; 1 = confirmação depois de um erro. */
  tentativa: number;
  /** Os capítulos que ficaram de pé. */
  dominados: number[];
  /** Onde a pessoa entra. Preenchido só no fim. */
  entrada: PassoDoNivelamento | null;
  encerrado: boolean;
  /**
   * A pessoa encerrou por conta própria, antes de errar?
   *
   * Muda o diagnóstico inteiro: quem parou no capítulo 12 sem errar não tem
   * ponto de entrada medido — tem um piso. Chamar isso de "você entra no 12"
   * seria afirmar o que o teste não apurou.
   */
  interrompido: boolean;
  semente: number;
}

/**
 * As cadeiras que podem ser niveladas, com as trilhas de cada uma.
 *
 * Sai dos livretos, e não de uma lista escrita aqui: curso sem livreto não
 * aparece, e aparece sozinho no dia em que ganhar um. Uma lista paralela
 * ofereceria nivelamento de curso que não tem pergunta nenhuma.
 */
export function cadeirasNivelaveis(livretos: readonly Livreto[]): CadeiraNivelavel[] {
  const porCurso = new Map<string, Livreto>();
  for (const l of livretos) porCurso.set(l.cursoId, l);

  return CHAIRS.map((cadeira) => {
    const trilhas = coursesOfChair(cadeira.id)
      .map((cursoId) => porCurso.get(cursoId))
      .filter((l): l is Livreto => Boolean(l))
      .map((l) => ({
        cursoId: l.cursoId,
        titulo: l.titulo,
        cadeira: cadeira.id,
        capitulos: l.capitulos.length,
        questoes: l.capitulos.reduce((n, c) => n + c.questoes.length, 0),
      }))
      /** Trilha sem questão não é nivelável, e oferecê-la seria um beco. */
      .filter((t) => t.questoes > 0);

    return { cadeira, trilhas };
  }).filter((c) => c.trilhas.length > 0);
}

/**
 * Embaralha as questões de um capítulo de forma reproduzível.
 *
 * A ordem importa: a primeira é a que decide, a segunda confirma. Sortear qual
 * vem primeiro evita que duas pessoas com a mesma bagagem parem no mesmo
 * capítulo por causa de uma questão específica mais difícil que as irmãs.
 */
function ordenarQuestoes(questoes: readonly Questao[], semente: number): Questao[] {
  const saida = [...questoes];
  let s = semente >>> 0;
  for (let i = saida.length - 1; i > 0; i--) {
    /** Mistura de Knuth: sementes consecutivas não produzem ordens vizinhas. */
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [saida[i], saida[j]] = [saida[j], saida[i]];
  }
  return saida;
}

/** Começa um nivelamento numa trilha. A semente torna a sequência reproduzível. */
export function iniciarNivelamento(
  livreto: Livreto,
  cadeira: ChairId,
  semente = 1
): EstadoDoNivelamento {
  const passos: PassoDoNivelamento[] = livreto.capitulos
    .slice()
    /**
     * Ordena pelo número declarado, e não pela ordem do arquivo. Confiar na
     * ordem de chegada funciona até alguém reordenar a origem — e aí a "ordem
     * do curso" vira a ordem do arquivo, sem que nada acuse.
     */
    .sort((a, b) => a.numero - b.numero)
    .filter((c) => c.questoes.length > 0)
    .map((c, i) => ({
      capitulo: c.numero,
      titulo: c.titulo,
      cursoId: livreto.cursoId,
      lessonId: c.lessonId,
      questoes: ordenarQuestoes(c.questoes, semente * 7919 + i),
    }));

  return {
    trilha: {
      cursoId: livreto.cursoId,
      titulo: livreto.titulo,
      cadeira,
      capitulos: passos.length,
      questoes: passos.reduce((n, p) => n + p.questoes.length, 0),
    },
    passos,
    indice: 0,
    tentativa: 0,
    dominados: [],
    entrada: null,
    encerrado: false,
    interrompido: false,
    semente,
  };
}

/**
 * A questão do momento.
 *
 * A confirmação é a **segunda** questão do capítulo, e não a mesma de novo:
 * repetir mediria memória do clique. Todo capítulo dos livretos tem três, o
 * que dá folga para a confirmação sem repetir pergunta.
 */
export function questaoAtual(estado: EstadoDoNivelamento): Questao | null {
  if (estado.encerrado) return null;
  const passo = estado.passos[estado.indice];
  if (!passo) return null;
  return passo.questoes[estado.tentativa] ?? passo.questoes[passo.questoes.length - 1] ?? null;
}

/**
 * Responde, e devolve o estado seguinte.
 *
 * Função pura: o estado entra, o estado sai. Guardar isso dentro de um
 * componente faria a regra do diagnóstico viver na tela, onde nenhum teste de
 * domínio a alcança.
 */
export function responderNivelamento(
  estado: EstadoDoNivelamento,
  acertou: boolean
): EstadoDoNivelamento {
  if (estado.encerrado) return estado;

  const passo = estado.passos[estado.indice];
  if (!passo) return { ...estado, encerrado: true };

  if (acertou) {
    /** Passou: o capítulo fica de pé, mesmo que tenha custado a confirmação. */
    const dominados = [...estado.dominados, passo.capitulo];
    const proximo = estado.indice + 1;

    if (proximo >= estado.passos.length) {
      /**
       * Acertou a trilha inteira. Não é "nível máximo": é o fim do que esta
       * trilha pergunta, e o diagnóstico precisa dizer isso em vez de fingir
       * que mediu um teto.
       */
      return { ...estado, dominados, indice: proximo, entrada: null, encerrado: true };
    }

    return { ...estado, dominados, indice: proximo, tentativa: 0 };
  }

  /** Errou a primeira: a confirmação é outra questão do MESMO capítulo. */
  if (estado.tentativa + 1 < TENTATIVAS_POR_CAPITULO) {
    return { ...estado, tentativa: estado.tentativa + 1 };
  }

  /** Errou as duas. É aqui que ela entra. */
  return { ...estado, entrada: passo, encerrado: true };
}

/**
 * 🔴 ENCERRAR POR CONTA PRÓPRIA — e o diagnóstico muda de natureza.
 *
 * Uma trilha de 58 capítulos é longa para quem sabe muito, e sair no meio é
 * legítimo. O que não é legítimo é tratar a saída como se fosse erro: quem
 * parou no capítulo 12 sem errar **não tem ponto de entrada medido**, tem um
 * piso. Dizer "você entra no 12" afirmaria o que o teste não apurou.
 */
export function interromperNivelamento(estado: EstadoDoNivelamento): EstadoDoNivelamento {
  if (estado.encerrado) return estado;
  return { ...estado, encerrado: true, interrompido: true, entrada: null };
}

export interface DiagnosticoDoNivelamento {
  trilha: TrilhaDeNivelamento;
  /** O capítulo de entrada. `null` quando não houve erro. */
  capitulo: number | null;
  /** O título dele, para a frase. */
  titulo: string | null;
  lessonId?: string;
  /** Quantos capítulos ficaram de pé. */
  dominados: number;
  /** De quantos a trilha tem. */
  total: number;
  /** A pessoa saiu antes de errar? */
  interrompido: boolean;
  frases: {
    titulo: string;
    detalhe: string;
  };
}

/**
 * O diagnóstico, já escrito para quem lê.
 *
 * Três desfechos, e cada um diz uma coisa diferente. Fundi-los num só texto
 * faria a tela afirmar ponto de entrada onde só há piso.
 */
export function diagnosticar(estado: EstadoDoNivelamento): DiagnosticoDoNivelamento {
  const total = estado.passos.length;
  const dominados = estado.dominados.length;
  const base = { trilha: estado.trilha, dominados, total, interrompido: estado.interrompido };

  /** Saiu no meio: há piso, não há ponto de entrada. */
  if (estado.interrompido) {
    return {
      ...base,
      capitulo: null,
      titulo: null,
      frases: {
        titulo:
          dominados === 0
            ? 'Nivelamento encerrado antes da primeira resposta'
            : `Você foi até o capítulo ${dominados} sem errar`,
        detalhe:
          dominados === 0
            ? 'Nada foi medido, e nada ficou registrado. Recomeçar leva ao mesmo ponto de partida.'
            : `O teste parou aí porque você encerrou, e não porque encontrou seu limite. ` +
              `O que ele mostra é um piso: ${dominados} de ${total} capítulos de pé. Retomar continua de onde parou.`,
      },
    };
  }

  /** Acertou tudo: o fim da trilha, e não um teto medido. */
  if (!estado.entrada) {
    return {
      ...base,
      capitulo: null,
      titulo: null,
      frases: {
        titulo: `Os ${total} capítulos de ${estado.trilha.titulo} ficaram de pé`,
        detalhe:
          'O nivelamento acabou sem encontrar onde você para. Ele mede esta trilha inteira, e não mais que ela — ' +
          'as outras cadeiras têm nivelamento próprio.',
      },
    };
  }

  const passo = estado.entrada;

  return {
    ...base,
    capitulo: passo.capitulo,
    titulo: passo.titulo,
    lessonId: passo.lessonId,
    frases: {
      titulo: `Você entra no capítulo ${passo.capitulo} — ${passo.titulo}`,
      detalhe:
        dominados === 0
          ? `É o começo de ${estado.trilha.titulo}. O primeiro capítulo é onde este assunto é apresentado.`
          : `${dominados} ${dominados === 1 ? 'capítulo ficou' : 'capítulos ficaram'} de pé antes deste. ` +
            `É daqui que vale continuar em ${estado.trilha.titulo}.`,
    },
  };
}

/**
 * O módulo para onde o diagnóstico manda.
 *
 * Recebe os módulos em vez de montar o identificador, e a diferença não é
 * estilo: `mod_teoria_07` escrito aqui seria uma segunda convenção de
 * identificador, que continuaria compilando no dia em que a primeira mudasse.
 * Casar pela ordem declarada usa o dado que já existe.
 */
export function moduloDoDiagnostico<M extends { id: string; order: number; courseId: string }>(
  diagnostico: DiagnosticoDoNivelamento,
  modulos: readonly M[]
): M | null {
  if (diagnostico.capitulo === null) return null;
  return (
    modulos.find(
      (m) => m.courseId === diagnostico.trilha.cursoId && m.order === diagnostico.capitulo
    ) ?? null
  );
}

/** Quanto do diagnóstico já foi percorrido, para a barra não mentir. */
export function progressoDoNivelamento(estado: EstadoDoNivelamento): {
  respondidas: number;
  total: number;
  percentual: number;
} {
  const total = estado.passos.length;
  const respondidas = Math.min(estado.indice, total);
  return {
    respondidas,
    total,
    percentual: total === 0 ? 0 : Math.round((respondidas / total) * 100),
  };
}
