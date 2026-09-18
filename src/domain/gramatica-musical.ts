/**
 * GRAMÁTICA MUSICAL — o que dá para perguntar, e de quantas formas.
 *
 * POR QUE UMA GRAMÁTICA, E NÃO UMA LISTA
 * --------------------------------------
 * A referência tem sete formatos fixos de exercício. Sete é pouco para
 * música, e a razão é estrutural: numa língua, "qual o significado de
 * *milk*?" é quase a única pergunta possível sobre uma palavra. Em música,
 * sobre **uma única nota** cabem pelo menos seis perguntas diferentes:
 *
 *   qual é o nome dela?          · onde ela fica na pauta?
 *   em que clave está escrita?   · quanto ela dura?
 *   como ela soa?                · onde ela fica no braço do instrumento?
 *
 * E cada uma pode ser feita **mostrando** de seis jeitos e **respondida** de
 * oito. Enumerar isso à mão daria centenas de casos e nenhum deles
 * reaproveitável.
 *
 * Por isso aqui há uma gramática de três eixos:
 *
 *   DIMENSÃO   o que se pergunta        (intervalo, armadura, cadência…)
 *   ESTÍMULO   como a pergunta chega    (pauta, som, cifra, braço…)
 *   RESPOSTA   como se responde         (escolher, tocar, cantar, escrever…)
 *
 * O produto dos três é o repertório de exercícios. Nem toda combinação faz
 * sentido — `podeCombinar` é quem decide —, e é justamente a matriz de
 * validade que carrega o conhecimento pedagógico.
 *
 * ANCORAGEM
 * ---------
 * Toda dimensão aponta para os capítulos do curso de Teoria que a ensinam.
 * Não há dimensão aqui que o Conservatório não ensine, e é isso que impede
 * este catálogo de virar uma lista de ideias soltas.
 */

// ---------------------------------------------------------------------------
// Eixo 1 — o que se pergunta
// ---------------------------------------------------------------------------

export enum Dimensao {
  /** Nome, altura e posição da nota. Cap. 2, 38, 39 */
  NOTA = 'NOTA',
  /** Sol, fá e dó — a mesma posição vira nota diferente. Cap. 3, 9 */
  CLAVE = 'CLAVE',
  /** Figuras e o que valem. Cap. 4, 6, 7 */
  VALOR = 'VALOR',
  /** Tom, semitom e alterações. Cap. 5, 14 */
  ALTERACAO = 'ALTERACAO',
  /** Número, qualidade, inversão, consonância. Cap. 10–13, 17 */
  INTERVALO = 'INTERVALO',
  /** Maiores, menores, modos, artificiais, exóticas. Cap. 15, 18, 21, 23, 26, 31, 35 */
  ESCALA = 'ESCALA',
  /** Quantos acidentes, e de que tom. Cap. 18, 21, 24 */
  ARMADURA = 'ARMADURA',
  /** Fórmula, acento métrico, subdivisão. Cap. 19, 20, 22, 28 */
  COMPASSO = 'COMPASSO',
  /** Síncope, contratempo, quiálteras. Cap. 22, 32 */
  RITMO = 'RITMO',
  /** Largo a Presto, e o que isso significa em batidas. Cap. 30 */
  ANDAMENTO = 'ANDAMENTO',
  /** De pianíssimo a fortíssimo, e os reguladores. Cap. 33 */
  DINAMICA = 'DINAMICA',
  /** Legato, staccato, tenuto, e os termos de caráter. Cap. 8, 34, 37 */
  EXPRESSAO = 'EXPRESSAO',
  /** Tríades, tétrades, inversões, cifragem. Cap. 40–43, 50–55 */
  ACORDE = 'ACORDE',
  /** Tônica, subdominante, dominante. Cap. 40, 56 */
  FUNCAO_HARMONICA = 'FUNCAO_HARMONICA',
  /** Autêntica, plagal, deceptiva, suspensiva. Cap. 49, 56 */
  CADENCIA = 'CADENCIA',
  /** Movimento das vozes: direto, contrário, oblíquo, paralelo. Cap. 49 */
  CONDUCAO_DE_VOZES = 'CONDUCAO_DE_VOZES',
  /** Apojatura, mordente, grupeto, trinado, arpejo. Cap. 44–48 */
  ORNAMENTO = 'ORNAMENTO',
  /** Tons vizinhos e a passagem entre eles. Cap. 24, 25 */
  MODULACAO = 'MODULACAO',
  /** Transporte e instrumentos transpositores. Cap. 27, 29, 57 */
  TRANSPOSICAO = 'TRANSPOSICAO',
  /** Abreviaturas e notação moderna. Cap. 36, 58 */
  NOTACAO_ESPECIAL = 'NOTACAO_ESPECIAL',
  /** Série harmônica e as propriedades do som. Cap. 1, 16 */
  ACUSTICA = 'ACUSTICA',
}

export interface DescricaoDaDimensao {
  nome: string;
  /** O que se pergunta, em uma linha. */
  pergunta: string;
  /** Capítulos do curso de Teoria que a ensinam. */
  capitulos: number[];
  /** Ordem pedagógica: o que vem antes. */
  requer: Dimensao[];
}

export const DIMENSOES: Record<Dimensao, DescricaoDaDimensao> = {
  [Dimensao.NOTA]: {
    nome: 'Nota',
    pergunta: 'Que nota é, e onde ela fica na pauta?',
    capitulos: [2, 38, 39],
    requer: [],
  },
  [Dimensao.CLAVE]: {
    nome: 'Clave',
    pergunta: 'Em que clave está escrita, e que nota isso torna a mesma posição?',
    capitulos: [3, 9],
    requer: [Dimensao.NOTA],
  },
  [Dimensao.VALOR]: {
    nome: 'Valor',
    pergunta: 'Que figura é, e quanto ela dura?',
    capitulos: [4, 6, 7],
    requer: [],
  },
  [Dimensao.ALTERACAO]: {
    nome: 'Alteração',
    pergunta: 'Sustenido, bemol ou bequadro — e que nota resulta?',
    capitulos: [5, 14],
    requer: [Dimensao.NOTA],
  },
  [Dimensao.INTERVALO]: {
    nome: 'Intervalo',
    pergunta: 'Que distância há entre as duas notas, em número e qualidade?',
    capitulos: [10, 11, 12, 13, 17],
    requer: [Dimensao.NOTA, Dimensao.ALTERACAO],
  },
  [Dimensao.ESCALA]: {
    nome: 'Escala',
    pergunta: 'Que escala é, e qual a fórmula de tons e semitons?',
    capitulos: [15, 18, 21, 23, 26, 31, 35],
    requer: [Dimensao.INTERVALO],
  },
  [Dimensao.ARMADURA]: {
    nome: 'Armadura',
    pergunta: 'Quantos acidentes, e de que tonalidade?',
    capitulos: [18, 21, 24],
    requer: [Dimensao.ESCALA],
  },
  [Dimensao.COMPASSO]: {
    nome: 'Compasso',
    pergunta: 'Que fórmula é, e onde caem os tempos fortes?',
    capitulos: [19, 20, 22, 28],
    requer: [Dimensao.VALOR],
  },
  [Dimensao.RITMO]: {
    nome: 'Ritmo',
    pergunta: 'Que célula é — e é síncope, contratempo ou quiáltera?',
    capitulos: [22, 32],
    requer: [Dimensao.COMPASSO],
  },
  [Dimensao.ANDAMENTO]: {
    nome: 'Andamento',
    pergunta: 'Que andamento é, e a quantas batidas por minuto corresponde?',
    capitulos: [30],
    requer: [Dimensao.COMPASSO],
  },
  [Dimensao.DINAMICA]: {
    nome: 'Dinâmica',
    pergunta: 'Que intensidade está indicada?',
    capitulos: [33],
    requer: [],
  },
  [Dimensao.EXPRESSAO]: {
    nome: 'Expressão',
    pergunta: 'Que articulação ou caráter está indicado?',
    capitulos: [8, 34, 37],
    requer: [],
  },
  [Dimensao.ACORDE]: {
    nome: 'Acorde',
    pergunta: 'Que acorde é, em que estado, e qual a cifra?',
    capitulos: [40, 41, 42, 43, 50, 51, 52, 53, 54, 55],
    requer: [Dimensao.INTERVALO, Dimensao.ESCALA],
  },
  [Dimensao.FUNCAO_HARMONICA]: {
    nome: 'Função harmônica',
    pergunta: 'Que função o acorde exerce no tom?',
    capitulos: [40, 56],
    requer: [Dimensao.ACORDE, Dimensao.ARMADURA],
  },
  [Dimensao.CADENCIA]: {
    nome: 'Cadência',
    pergunta: 'Que cadência encerra o trecho?',
    capitulos: [49, 56],
    requer: [Dimensao.FUNCAO_HARMONICA],
  },
  [Dimensao.CONDUCAO_DE_VOZES]: {
    nome: 'Condução de vozes',
    pergunta: 'Como as vozes se movem entre si?',
    capitulos: [49],
    requer: [Dimensao.INTERVALO, Dimensao.ACORDE],
  },
  [Dimensao.ORNAMENTO]: {
    nome: 'Ornamento',
    pergunta: 'Que ornamento é, e como se executa?',
    capitulos: [44, 45, 46, 47, 48],
    requer: [Dimensao.NOTA, Dimensao.VALOR],
  },
  [Dimensao.MODULACAO]: {
    nome: 'Modulação',
    pergunta: 'Para que tom o trecho modula, e por onde?',
    capitulos: [24, 25],
    requer: [Dimensao.ARMADURA, Dimensao.FUNCAO_HARMONICA],
  },
  [Dimensao.TRANSPOSICAO]: {
    nome: 'Transposição',
    pergunta: 'Como fica o trecho em outro tom, ou para instrumento transpositor?',
    capitulos: [27, 29, 57],
    requer: [Dimensao.INTERVALO, Dimensao.ARMADURA],
  },
  [Dimensao.NOTACAO_ESPECIAL]: {
    nome: 'Notação especial',
    pergunta: 'O que este sinal indica?',
    capitulos: [36, 58],
    requer: [Dimensao.NOTA, Dimensao.VALOR],
  },
  [Dimensao.ACUSTICA]: {
    nome: 'Acústica',
    pergunta: 'Que propriedade do som está em jogo?',
    capitulos: [1, 16],
    requer: [],
  },
};

// ---------------------------------------------------------------------------
// Eixo 2 — como a pergunta chega
// ---------------------------------------------------------------------------

export enum Estimulo {
  /** Desenhada na pauta, com clave e armadura. */
  NOTACAO = 'NOTACAO',
  /** Escrito por extenso: "terça maior", "Allegro". */
  NOME = 'NOME',
  /** Cifra: `Cm7`, `V7`, `6/4`. */
  CIFRA = 'CIFRA',
  /** Soa, e só. É o que exige ouvido. */
  AUDIO = 'AUDIO',
  /** Ciclo de quintas, régua de intervalos, teclado. */
  DIAGRAMA = 'DIAGRAMA',
  /** Posição marcada no braço do instrumento. */
  BRACO = 'BRACO',
}

export const NOME_DO_ESTIMULO: Record<Estimulo, string> = {
  [Estimulo.NOTACAO]: 'Na pauta',
  [Estimulo.NOME]: 'Pelo nome',
  [Estimulo.CIFRA]: 'Pela cifra',
  [Estimulo.AUDIO]: 'De ouvido',
  [Estimulo.DIAGRAMA]: 'No diagrama',
  [Estimulo.BRACO]: 'No braço',
};

// ---------------------------------------------------------------------------
// Eixo 3 — como se responde
// ---------------------------------------------------------------------------

export enum Resposta {
  /** Alternativas. O mais barato, e o que só prova reconhecimento. */
  ESCOLHER = 'ESCOLHER',
  /** Montar com peças de um banco. */
  MONTAR = 'MONTAR',
  /** Colocar a nota na linha certa da pauta. */
  ESCREVER_NA_PAUTA = 'ESCREVER_NA_PAUTA',
  /** Parear duas colunas. */
  PAREAR = 'PAREAR',
  /** Pôr em ordem: do mais grave ao mais agudo, do mais lento ao mais rápido. */
  ORDENAR = 'ORDENAR',
  /** Apontar no diagrama, no teclado ou no braço. */
  APONTAR = 'APONTAR',
  /** Tocar no instrumento. O microfone confere. */
  TOCAR = 'TOCAR',
  /** Cantar. O afinador mede o desvio em cents. */
  CANTAR = 'CANTAR',
  /** Executar a célula no andamento. Mede-se o desvio em milissegundos. */
  EXECUTAR_RITMO = 'EXECUTAR_RITMO',
}

export const NOME_DA_RESPOSTA: Record<Resposta, string> = {
  [Resposta.ESCOLHER]: 'Escolher',
  [Resposta.MONTAR]: 'Montar',
  [Resposta.ESCREVER_NA_PAUTA]: 'Escrever na pauta',
  [Resposta.PAREAR]: 'Parear',
  [Resposta.ORDENAR]: 'Ordenar',
  [Resposta.APONTAR]: 'Apontar',
  [Resposta.TOCAR]: 'Tocar',
  [Resposta.CANTAR]: 'Cantar',
  [Resposta.EXECUTAR_RITMO]: 'Executar o ritmo',
};

/** Respostas que dependem de captura de áudio. */
export const RESPOSTAS_COM_MICROFONE: readonly Resposta[] = [
  Resposta.TOCAR,
  Resposta.CANTAR,
  Resposta.EXECUTAR_RITMO,
] as const;

export function exigeMicrofone(r: Resposta): boolean {
  return RESPOSTAS_COM_MICROFONE.includes(r);
}

// ---------------------------------------------------------------------------
// A matriz de validade — onde mora o conhecimento pedagógico
// ---------------------------------------------------------------------------

/**
 * Estímulos que fazem sentido para cada dimensão.
 *
 * Nem toda combinação é legítima, e a restrição não é técnica — é
 * pedagógica. Uma armadura de clave **não soa**: ela é uma convenção de
 * escrita, e "ouça e diga quantos sustenidos há" é uma pergunta sem
 * resposta. Já um intervalo soa, se escreve, se cifra e se aponta no braço —
 * e pode ser perguntado das quatro formas.
 */
export const ESTIMULOS_VALIDOS: Record<Dimensao, Estimulo[]> = {
  [Dimensao.NOTA]: [Estimulo.NOTACAO, Estimulo.NOME, Estimulo.AUDIO, Estimulo.DIAGRAMA, Estimulo.BRACO],
  [Dimensao.CLAVE]: [Estimulo.NOTACAO, Estimulo.NOME],
  [Dimensao.VALOR]: [Estimulo.NOTACAO, Estimulo.NOME, Estimulo.AUDIO],
  [Dimensao.ALTERACAO]: [Estimulo.NOTACAO, Estimulo.NOME, Estimulo.AUDIO, Estimulo.BRACO],
  [Dimensao.INTERVALO]: [Estimulo.NOTACAO, Estimulo.NOME, Estimulo.AUDIO, Estimulo.DIAGRAMA, Estimulo.BRACO],
  [Dimensao.ESCALA]: [Estimulo.NOTACAO, Estimulo.NOME, Estimulo.AUDIO, Estimulo.DIAGRAMA, Estimulo.BRACO],
  // Armadura é convenção de escrita: não soa.
  [Dimensao.ARMADURA]: [Estimulo.NOTACAO, Estimulo.NOME, Estimulo.DIAGRAMA],
  [Dimensao.COMPASSO]: [Estimulo.NOTACAO, Estimulo.NOME, Estimulo.AUDIO],
  [Dimensao.RITMO]: [Estimulo.NOTACAO, Estimulo.AUDIO],
  [Dimensao.ANDAMENTO]: [Estimulo.NOME, Estimulo.AUDIO],
  [Dimensao.DINAMICA]: [Estimulo.NOTACAO, Estimulo.NOME, Estimulo.AUDIO],
  [Dimensao.EXPRESSAO]: [Estimulo.NOTACAO, Estimulo.NOME, Estimulo.AUDIO],
  [Dimensao.ACORDE]: [Estimulo.NOTACAO, Estimulo.CIFRA, Estimulo.AUDIO, Estimulo.DIAGRAMA, Estimulo.BRACO],
  [Dimensao.FUNCAO_HARMONICA]: [Estimulo.NOTACAO, Estimulo.CIFRA, Estimulo.AUDIO],
  [Dimensao.CADENCIA]: [Estimulo.NOTACAO, Estimulo.CIFRA, Estimulo.AUDIO],
  [Dimensao.CONDUCAO_DE_VOZES]: [Estimulo.NOTACAO, Estimulo.AUDIO],
  [Dimensao.ORNAMENTO]: [Estimulo.NOTACAO, Estimulo.NOME, Estimulo.AUDIO],
  [Dimensao.MODULACAO]: [Estimulo.NOTACAO, Estimulo.CIFRA, Estimulo.AUDIO],
  [Dimensao.TRANSPOSICAO]: [Estimulo.NOTACAO, Estimulo.CIFRA],
  // Notação especial é sinal escrito: perguntá-la de ouvido não faz sentido.
  [Dimensao.NOTACAO_ESPECIAL]: [Estimulo.NOTACAO, Estimulo.NOME],
  [Dimensao.ACUSTICA]: [Estimulo.NOME, Estimulo.AUDIO, Estimulo.DIAGRAMA],
};

/**
 * Respostas que fazem sentido para cada dimensão.
 *
 * Aqui a restrição é de **execução**: dá para cantar um intervalo, e não dá
 * para cantar uma armadura de clave. Dá para tocar um acorde, e não dá para
 * tocar um andamento — andamento se executa batendo, não tocando uma altura.
 */
export const RESPOSTAS_VALIDAS: Record<Dimensao, Resposta[]> = {
  [Dimensao.NOTA]: [
    Resposta.ESCOLHER, Resposta.ESCREVER_NA_PAUTA, Resposta.PAREAR,
    Resposta.APONTAR, Resposta.TOCAR, Resposta.CANTAR, Resposta.ORDENAR,
  ],
  [Dimensao.CLAVE]: [Resposta.ESCOLHER, Resposta.ESCREVER_NA_PAUTA, Resposta.PAREAR],
  [Dimensao.VALOR]: [Resposta.ESCOLHER, Resposta.PAREAR, Resposta.ORDENAR, Resposta.EXECUTAR_RITMO],
  [Dimensao.ALTERACAO]: [
    Resposta.ESCOLHER, Resposta.ESCREVER_NA_PAUTA, Resposta.APONTAR,
    Resposta.TOCAR, Resposta.CANTAR,
  ],
  [Dimensao.INTERVALO]: [
    Resposta.ESCOLHER, Resposta.ESCREVER_NA_PAUTA, Resposta.PAREAR,
    Resposta.ORDENAR, Resposta.APONTAR, Resposta.TOCAR, Resposta.CANTAR,
  ],
  [Dimensao.ESCALA]: [
    Resposta.ESCOLHER, Resposta.MONTAR, Resposta.ESCREVER_NA_PAUTA,
    Resposta.APONTAR, Resposta.TOCAR, Resposta.CANTAR,
  ],
  [Dimensao.ARMADURA]: [Resposta.ESCOLHER, Resposta.ESCREVER_NA_PAUTA, Resposta.PAREAR],
  [Dimensao.COMPASSO]: [Resposta.ESCOLHER, Resposta.PAREAR, Resposta.EXECUTAR_RITMO],
  [Dimensao.RITMO]: [Resposta.ESCOLHER, Resposta.MONTAR, Resposta.EXECUTAR_RITMO],
  // Andamento se executa batendo o pulso, não tocando uma altura.
  [Dimensao.ANDAMENTO]: [Resposta.ESCOLHER, Resposta.ORDENAR, Resposta.PAREAR, Resposta.EXECUTAR_RITMO],
  [Dimensao.DINAMICA]: [Resposta.ESCOLHER, Resposta.ORDENAR, Resposta.PAREAR],
  [Dimensao.EXPRESSAO]: [Resposta.ESCOLHER, Resposta.PAREAR, Resposta.TOCAR],
  [Dimensao.ACORDE]: [
    Resposta.ESCOLHER, Resposta.MONTAR, Resposta.ESCREVER_NA_PAUTA,
    Resposta.PAREAR, Resposta.APONTAR, Resposta.TOCAR,
  ],
  [Dimensao.FUNCAO_HARMONICA]: [Resposta.ESCOLHER, Resposta.PAREAR, Resposta.MONTAR],
  [Dimensao.CADENCIA]: [Resposta.ESCOLHER, Resposta.MONTAR, Resposta.ESCREVER_NA_PAUTA, Resposta.TOCAR],
  [Dimensao.CONDUCAO_DE_VOZES]: [Resposta.ESCOLHER, Resposta.ESCREVER_NA_PAUTA],
  [Dimensao.ORNAMENTO]: [Resposta.ESCOLHER, Resposta.PAREAR, Resposta.TOCAR, Resposta.CANTAR],
  [Dimensao.MODULACAO]: [Resposta.ESCOLHER, Resposta.MONTAR],
  [Dimensao.TRANSPOSICAO]: [Resposta.ESCREVER_NA_PAUTA, Resposta.MONTAR, Resposta.TOCAR],
  [Dimensao.NOTACAO_ESPECIAL]: [Resposta.ESCOLHER, Resposta.PAREAR],
  [Dimensao.ACUSTICA]: [Resposta.ESCOLHER, Resposta.ORDENAR, Resposta.PAREAR],
};

/** Uma forma de exercício: o cruzamento dos três eixos. */
export interface FormaDeExercicio {
  dimensao: Dimensao;
  estimulo: Estimulo;
  resposta: Resposta;
}

export function podeCombinar(f: FormaDeExercicio): boolean {
  return (
    ESTIMULOS_VALIDOS[f.dimensao].includes(f.estimulo) &&
    RESPOSTAS_VALIDAS[f.dimensao].includes(f.resposta)
  );
}

/**
 * Todas as formas legítimas.
 *
 * É o repertório de exercícios da plataforma, derivado — não enumerado à
 * mão. Acrescentar uma dimensão nova traz junto todas as formas em que ela
 * pode ser perguntada, sem que ninguém precise listá-las.
 */
export function todasAsFormas(): FormaDeExercicio[] {
  const formas: FormaDeExercicio[] = [];
  for (const dimensao of Object.values(Dimensao)) {
    for (const estimulo of ESTIMULOS_VALIDOS[dimensao]) {
      for (const resposta of RESPOSTAS_VALIDAS[dimensao]) {
        formas.push({ dimensao, estimulo, resposta });
      }
    }
  }
  return formas;
}

export function formasDaDimensao(dimensao: Dimensao): FormaDeExercicio[] {
  return todasAsFormas().filter((f) => f.dimensao === dimensao);
}

/**
 * O enunciado de uma forma.
 *
 * Gerado da gramática, e não escrito caso a caso — o que garante que a
 * mesma pergunta seja formulada do mesmo jeito em toda a plataforma.
 */
export function enunciadoDe(f: FormaDeExercicio): string {
  const inicio: Record<Estimulo, string> = {
    [Estimulo.NOTACAO]: 'Veja a pauta',
    [Estimulo.NOME]: 'Leia',
    [Estimulo.CIFRA]: 'Veja a cifra',
    [Estimulo.AUDIO]: 'Ouça',
    [Estimulo.DIAGRAMA]: 'Veja o diagrama',
    [Estimulo.BRACO]: 'Veja o braço do instrumento',
  };

  const fim: Record<Resposta, string> = {
    [Resposta.ESCOLHER]: 'e escolha a resposta',
    [Resposta.MONTAR]: 'e monte a resposta',
    [Resposta.ESCREVER_NA_PAUTA]: 'e escreva na pauta',
    [Resposta.PAREAR]: 'e combine os pares',
    [Resposta.ORDENAR]: 'e ponha em ordem',
    [Resposta.APONTAR]: 'e aponte a posição',
    [Resposta.TOCAR]: 'e toque a resposta',
    [Resposta.CANTAR]: 'e cante a resposta',
    [Resposta.EXECUTAR_RITMO]: 'e execute o ritmo',
  };

  return `${inicio[f.estimulo]} ${fim[f.resposta]}`;
}

/**
 * As dimensões que um capítulo do curso de Teoria exercita.
 *
 * É a costura entre Academy e Practice: terminar o capítulo 10 abre os
 * exercícios de intervalo, e não os de acorde — que dependem dele.
 */
export function dimensoesDoCapitulo(capitulo: number): Dimensao[] {
  return (Object.entries(DIMENSOES) as [Dimensao, DescricaoDaDimensao][])
    .filter(([, d]) => d.capitulos.includes(capitulo))
    .map(([dim]) => dim);
}

/**
 * A dimensão está ao alcance de quem domina estas outras?
 *
 * Perguntar cadência a quem não sabe função harmônica não é desafio: é
 * cobrar o que não foi ensinado.
 */
export function estaAoAlcance(dimensao: Dimensao, dominadas: Dimensao[]): boolean {
  return DIMENSOES[dimensao].requer.every((r) => dominadas.includes(r));
}

/**
 * Ordem pedagógica de todas as dimensões.
 *
 * Ordenação topológica sobre `requer`. É o que permite montar um percurso do
 * zero sem que ninguém precise ordenar 21 dimensões à mão — e sem que a
 * ordem se perca quando uma dimensão nova entrar no meio.
 */
export function ordemPedagogica(): Dimensao[] {
  const ordenadas: Dimensao[] = [];
  const restantes = new Set(Object.values(Dimensao));

  while (restantes.size > 0) {
    const prontas = [...restantes].filter((d) =>
      DIMENSOES[d].requer.every((r) => ordenadas.includes(r))
    );
    /**
     * Sem nenhuma pronta, há ciclo em `requer`.
     *
     * Devolver o que falta na ordem declarada evita laço infinito e deixa o
     * defeito visível — um teste o pega, e é melhor do que travar.
     */
    if (prontas.length === 0) return [...ordenadas, ...restantes];
    for (const d of prontas) {
      ordenadas.push(d);
      restantes.delete(d);
    }
  }
  return ordenadas;
}
