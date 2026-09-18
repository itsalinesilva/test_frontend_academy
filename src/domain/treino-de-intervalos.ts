import { frequenciaDaNota } from './practice-measurement';

/**
 * Treino de reconhecimento de intervalos.
 *
 * POR QUE ISTO É DOMÍNIO, E NÃO DADO
 * ----------------------------------
 * Um intervalo não é um registro guardado: é uma **relação** entre duas
 * alturas, definida pela distância em semitons. Dada a raiz e a distância, a
 * segunda altura sai por cálculo — e o exercício inteiro se gera.
 *
 * Isso é o oposto de dado fabricado. Três questões escritas à mão num arquivo
 * de tela seriam fabricação: fingiriam um banco de exercícios que não existe,
 * e o aluno esgotaria em trinta segundos. A geração a partir da teoria é o
 * conteúdo de verdade — a mesma terça maior, a partir de seis raízes
 * diferentes, é seis exercícios legítimos, e é assim que se estuda.
 *
 * POR QUE UM SÓ LUGAR
 * -------------------
 * A plataforma tinha DOIS treinadores de intervalo — `/practice/trainer` e o
 * laboratório do Studio —, cada um com a própria lista, a própria explicação
 * e o próprio critério. Dois lugares para corrigir o mesmo erro de teoria é
 * um lugar que fica errado.
 */
export interface Intervalo {
  /** Distância em semitons. É o que define o intervalo. */
  semitons: number;
  nome: string;
  /** Por que é esse, e não outro. O aluno lê depois de responder. */
  explicacao: string;
}

/**
 * Os intervalos do treino inicial.
 *
 * Consonâncias e as duas terças, que é onde a percepção começa. O trítono
 * entra por ser o que mais se confunde com a quinta, e é justamente essa
 * confusão que o treino desfaz.
 */
export const INTERVALOS: readonly Intervalo[] = [
  {
    semitons: 2,
    nome: '2ª maior',
    explicacao: 'Um tom inteiro — dois semitons. É o passo da escala.',
  },
  {
    semitons: 3,
    nome: '3ª menor',
    explicacao: 'Três semitons, um tom e meio. Dá a cor do acorde menor.',
  },
  {
    semitons: 4,
    nome: '3ª maior',
    explicacao: 'Quatro semitons, dois tons inteiros. Dá a cor do acorde maior.',
  },
  {
    semitons: 5,
    nome: '4ª justa',
    explicacao: 'Cinco semitons. É a inversão da quinta justa.',
  },
  {
    semitons: 6,
    nome: 'trítono',
    explicacao: 'Seis semitons, exatamente meia oitava. Instável, pede resolução.',
  },
  {
    semitons: 7,
    nome: '5ª justa',
    explicacao: 'Sete semitons. Base da consonância acústica e do ciclo de quintas.',
  },
  {
    semitons: 12,
    nome: 'oitava',
    explicacao: 'Doze semitons. A mesma nota, com o dobro da frequência.',
  },
] as const;

/**
 * Raízes confortáveis de ouvir, na região central do teclado.
 *
 * Fora dessa faixa o ouvido julga pela altura absoluta em vez da relação, e o
 * treino deixa de treinar o que deveria.
 */
export const RAIZES = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'Bb4'] as const;

export interface QuestaoDeIntervalo {
  id: string;
  raiz: string;
  raizHz: number;
  segundaHz: number;
  intervalo: Intervalo;
  /** As alternativas, já embaralhadas, com a correta entre elas. */
  alternativas: Intervalo[];
}

/**
 * Gerador determinístico — congruente linear.
 *
 * Determinístico de propósito: a mesma semente dá a mesma sequência, e isso
 * é o que torna o treino **testável** e reproduzível. Sem isso, um caso de
 * teste sobre a geração seria um caso sobre sorte.
 */
function geradorDeterministico(semente: number): () => number {
  /**
   * A semente é MISTURADA antes de virar estado, e isso não é preciosismo.
   *
   * Uma rodada avança a semente de um em um. Sem a mistura, sementes vizinhas
   * produzem primeiros valores vizinhos — e o primeiro valor é justamente o
   * que escolhe a raiz. O resultado media dez questões seguidas na mesma
   * altura, que é o vício que este treino existe para evitar: o ouvido decora
   * a altura absoluta em vez de ouvir a relação.
   *
   * A constante é a razão áurea em 32 bits (Knuth). Um teste pegou isto —
   * "a raiz varia" — e está lá para pegar de novo.
   */
  let estado = Math.imul(semente >>> 0 || 1, 2654435761) >>> 0;
  return () => {
    estado = (Math.imul(estado, 1664525) + 1013904223) >>> 0;
    return estado / 0x100000000;
  };
}

function embaralhar<T>(itens: T[], sortear: () => number): T[] {
  const copia = [...itens];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(sortear() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/**
 * Monta uma questão.
 *
 * As alternativas erradas não são quaisquer: são as **vizinhas em semitons**,
 * porque é entre elas que o ouvido se confunde. Oferecer "2ª maior" contra
 * "oitava" não treina nada — a diferença é grande demais para errar.
 */
export function gerarQuestao(semente: number, quantasAlternativas = 4): QuestaoDeIntervalo {
  const sortear = geradorDeterministico(semente);

  const raiz = RAIZES[Math.floor(sortear() * RAIZES.length)];
  const intervalo = INTERVALOS[Math.floor(sortear() * INTERVALOS.length)];
  const raizHz = frequenciaDaNota(raiz) ?? 261.63;
  const segundaHz = raizHz * Math.pow(2, intervalo.semitons / 12);

  const vizinhos = [...INTERVALOS]
    .filter((i) => i.semitons !== intervalo.semitons)
    .sort(
      (a, b) =>
        Math.abs(a.semitons - intervalo.semitons) - Math.abs(b.semitons - intervalo.semitons)
    )
    .slice(0, quantasAlternativas - 1);

  return {
    id: `iv_${semente}`,
    raiz,
    raizHz,
    segundaHz,
    intervalo,
    alternativas: embaralhar([intervalo, ...vizinhos], sortear),
  };
}

/** Uma rodada inteira, com questões que não se repetem em sequência. */
export function gerarRodada(quantidade: number, sementeInicial = Date.now()): QuestaoDeIntervalo[] {
  const questoes: QuestaoDeIntervalo[] = [];
  let semente = sementeInicial;
  let anterior: number | null = null;

  while (questoes.length < quantidade) {
    const q = gerarQuestao(semente);
    semente += 1;
    // duas iguais seguidas dão a impressão de que o treino travou
    if (q.intervalo.semitons === anterior) continue;
    anterior = q.intervalo.semitons;
    questoes.push(q);
  }
  return questoes;
}

/**
 * Acertou?
 *
 * Compara **semitons**, não nome. Nome é rótulo de exibição e pode mudar de
 * redação; a distância é o que o intervalo é.
 */
export function acertou(questao: QuestaoDeIntervalo, escolha: Intervalo): boolean {
  return escolha.semitons === questao.intervalo.semitons;
}
