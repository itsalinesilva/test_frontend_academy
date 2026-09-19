/**
 * Codificador de QR Code — modelo 2, modo byte, correção nível M.
 *
 * POR QUE ESCRITO AQUI, E NÃO UMA DEPENDÊNCIA
 * -------------------------------------------
 * A arquitetura da plataforma não tem backend nem banco: o certificado é
 * gerado, desenhado e baixado no próprio navegador. O QR precisa nascer
 * junto, no cliente, e ir para dentro do SVG do documento — não pode ser uma
 * imagem buscada num serviço externo, porque isso (a) sairia da plataforma,
 * (b) entregaria a um terceiro a lista de quem emite credencial e (c)
 * quebraria o download offline do arquivo.
 *
 * LIMITE DELIBERADO
 * -----------------
 * Versões 1 a 10, nível M — de 14 a 213 bytes de conteúdo. Uma URL de
 * verificação cabe com folga. Acima disso a função falha alto, em vez de
 * truncar em silêncio: um QR truncado parece válido e não é.
 *
 * Referência: ISO/IEC 18004.
 */

// ---------------------------------------------------------------------------
// Aritmética em GF(256), polinômio primitivo 0x11D
// ---------------------------------------------------------------------------

const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);

(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
})();

function mul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return EXP[LOG[a] + LOG[b]];
}

/** Polinômio gerador de grau `grau`, para Reed-Solomon. */
function polinomioGerador(grau: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < grau; i++) {
    const proximo = new Uint8Array(poly.length + 1);
    for (let j = 0; j < poly.length; j++) {
      proximo[j] ^= poly[j];
      proximo[j + 1] ^= mul(poly[j], EXP[i]);
    }
    poly = proximo;
  }
  return poly;
}

/** Códigos de correção de erro para um bloco de dados. */
function codigosCorrecao(dados: Uint8Array, quantidade: number): Uint8Array {
  const gerador = polinomioGerador(quantidade);
  const resto = new Uint8Array(dados.length + quantidade);
  resto.set(dados);

  for (let i = 0; i < dados.length; i++) {
    const coef = resto[i];
    if (coef === 0) continue;
    for (let j = 0; j < gerador.length; j++) {
      resto[i + j] ^= mul(gerador[j], coef);
    }
  }
  return resto.slice(dados.length);
}

// ---------------------------------------------------------------------------
// Tabelas de versão (nível M)
// ---------------------------------------------------------------------------

interface Versao {
  /** Códigos de correção por bloco. */
  ecPorBloco: number;
  /** [quantidade de blocos, códigos de dados por bloco] do grupo 1. */
  grupo1: [number, number];
  /** Idem para o grupo 2, quando existe. */
  grupo2?: [number, number];
  /** Coordenadas centrais dos padrões de alinhamento. */
  alinhamento: number[];
}

const VERSOES: Record<number, Versao> = {
  1: { ecPorBloco: 10, grupo1: [1, 16], alinhamento: [] },
  2: { ecPorBloco: 16, grupo1: [1, 28], alinhamento: [6, 18] },
  3: { ecPorBloco: 26, grupo1: [1, 44], alinhamento: [6, 22] },
  4: { ecPorBloco: 18, grupo1: [2, 32], alinhamento: [6, 26] },
  5: { ecPorBloco: 24, grupo1: [2, 43], alinhamento: [6, 30] },
  6: { ecPorBloco: 16, grupo1: [4, 27], alinhamento: [6, 34] },
  7: { ecPorBloco: 18, grupo1: [4, 31], alinhamento: [6, 22, 38] },
  8: { ecPorBloco: 22, grupo1: [2, 38], grupo2: [2, 39], alinhamento: [6, 24, 42] },
  9: { ecPorBloco: 22, grupo1: [3, 36], grupo2: [2, 37], alinhamento: [6, 26, 46] },
  10: { ecPorBloco: 26, grupo1: [4, 43], grupo2: [1, 44], alinhamento: [6, 28, 50] },
};

function totalCodigosDados(v: Versao): number {
  return v.grupo1[0] * v.grupo1[1] + (v.grupo2 ? v.grupo2[0] * v.grupo2[1] : 0);
}

// ---------------------------------------------------------------------------
// Fluxo de bits
// ---------------------------------------------------------------------------

class FluxoBits {
  private bits: number[] = [];

  push(valor: number, quantidade: number): void {
    for (let i = quantidade - 1; i >= 0; i--) {
      this.bits.push((valor >>> i) & 1);
    }
  }

  get tamanho(): number {
    return this.bits.length;
  }

  paraBytes(): Uint8Array {
    const bytes = new Uint8Array(Math.ceil(this.bits.length / 8));
    this.bits.forEach((bit, i) => {
      if (bit) bytes[i >>> 3] |= 0x80 >>> (i & 7);
    });
    return bytes;
  }
}

// ---------------------------------------------------------------------------
// Matriz
// ---------------------------------------------------------------------------

export interface QrMatrix {
  readonly versao: number;
  readonly tamanho: number;
  /** `modulos[linha][coluna]` — true é módulo escuro. */
  readonly modulos: boolean[][];
}

type Grade = (boolean | null)[][];

function criarGrade(tamanho: number): Grade {
  return Array.from({ length: tamanho }, () => new Array<boolean | null>(tamanho).fill(null));
}

function desenharLocalizador(g: Grade, linha: number, coluna: number): void {
  for (let dy = -1; dy <= 7; dy++) {
    for (let dx = -1; dx <= 7; dx++) {
      const y = linha + dy;
      const x = coluna + dx;
      if (y < 0 || y >= g.length || x < 0 || x >= g.length) continue;
      const borda = dy === -1 || dy === 7 || dx === -1 || dx === 7;
      const anel = dy === 0 || dy === 6 || dx === 0 || dx === 6;
      const centro = dy >= 2 && dy <= 4 && dx >= 2 && dx <= 4;
      g[y][x] = !borda && (anel || centro);
    }
  }
}

function desenharAlinhamento(g: Grade, centroY: number, centroX: number): void {
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const escuro = Math.max(Math.abs(dy), Math.abs(dx)) !== 1;
      g[centroY + dy][centroX + dx] = escuro;
    }
  }
}

/** BCH(15,5) para a informação de formato. */
function bitsFormato(mascara: number): number {
  // Nível M são os bits 00; ficam à esquerda do número da máscara.
  const dados = (0b00 << 3) | mascara;
  let resto = dados << 10;
  for (let i = 14; i >= 10; i--) {
    if ((resto >>> i) & 1) resto ^= 0b10100110111 << (i - 10);
  }
  return ((dados << 10) | resto) ^ 0b101010000010010;
}

/** BCH(18,6) para a informação de versão (usada a partir da versão 7). */
function bitsVersao(versao: number): number {
  let resto = versao << 12;
  for (let i = 17; i >= 12; i--) {
    if ((resto >>> i) & 1) resto ^= 0b1111100100 << (i - 12);
  }
  return (versao << 12) | resto;
}

function areaFuncional(versao: number, tamanho: number, linha: number, coluna: number): boolean {
  // Localizadores e separadores
  if (linha < 9 && coluna < 9) return true;
  if (linha < 9 && coluna >= tamanho - 8) return true;
  if (linha >= tamanho - 8 && coluna < 9) return true;
  // Temporizadores
  if (linha === 6 || coluna === 6) return true;
  // Informação de versão
  if (versao >= 7) {
    if (linha < 6 && coluna >= tamanho - 11) return true;
    if (coluna < 6 && linha >= tamanho - 11) return true;
  }
  // Alinhamento
  const centros = VERSOES[versao].alinhamento;
  for (const cy of centros) {
    for (const cx of centros) {
      const cantoSuperiorEsquerdo = cy === 6 && cx === 6;
      const cantoSuperiorDireito = cy === 6 && cx === centros[centros.length - 1];
      const cantoInferiorEsquerdo = cy === centros[centros.length - 1] && cx === 6;
      if (cantoSuperiorEsquerdo || cantoSuperiorDireito || cantoInferiorEsquerdo) continue;
      if (Math.abs(linha - cy) <= 2 && Math.abs(coluna - cx) <= 2) return true;
    }
  }
  return false;
}

function aplicarMascara(mascara: number, linha: number, coluna: number): boolean {
  switch (mascara) {
    case 0: return (linha + coluna) % 2 === 0;
    case 1: return linha % 2 === 0;
    case 2: return coluna % 3 === 0;
    case 3: return (linha + coluna) % 3 === 0;
    case 4: return (Math.floor(linha / 2) + Math.floor(coluna / 3)) % 2 === 0;
    case 5: return ((linha * coluna) % 2) + ((linha * coluna) % 3) === 0;
    case 6: return (((linha * coluna) % 2) + ((linha * coluna) % 3)) % 2 === 0;
    default: return (((linha + coluna) % 2) + ((linha * coluna) % 3)) % 2 === 0;
  }
}

/** Penalidade das quatro regras da norma — quanto menor, melhor a máscara. */
function penalidade(m: boolean[][]): number {
  const n = m.length;
  let total = 0;

  // Regra 1: sequências de 5 ou mais módulos iguais.
  for (let i = 0; i < n; i++) {
    for (const horizontal of [true, false]) {
      let corrida = 1;
      for (let j = 1; j < n; j++) {
        const atual = horizontal ? m[i][j] : m[j][i];
        const anterior = horizontal ? m[i][j - 1] : m[j - 1][i];
        if (atual === anterior) {
          corrida++;
        } else {
          if (corrida >= 5) total += corrida - 2;
          corrida = 1;
        }
      }
      if (corrida >= 5) total += corrida - 2;
    }
  }

  // Regra 2: blocos 2x2 de cor uniforme.
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1; j++) {
      const c = m[i][j];
      if (c === m[i][j + 1] && c === m[i + 1][j] && c === m[i + 1][j + 1]) total += 3;
    }
  }

  // Regra 3: padrão que imita o localizador.
  const alvoA = [true, false, true, true, true, false, true, false, false, false, false];
  const alvoB = [false, false, false, false, true, false, true, true, true, false, true];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= n - 11; j++) {
      for (const alvo of [alvoA, alvoB]) {
        let bateH = true;
        let bateV = true;
        for (let k = 0; k < 11; k++) {
          if (m[i][j + k] !== alvo[k]) bateH = false;
          if (m[j + k][i] !== alvo[k]) bateV = false;
        }
        if (bateH) total += 40;
        if (bateV) total += 40;
      }
    }
  }

  // Regra 4: desequilíbrio entre claros e escuros.
  let escuros = 0;
  for (const linha of m) for (const c of linha) if (c) escuros++;
  const proporcao = (escuros * 100) / (n * n);
  total += Math.floor(Math.abs(proporcao - 50) / 5) * 10;

  return total;
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

/**
 * Gera a matriz de um QR Code para o texto dado.
 *
 * Lança quando o conteúdo não cabe na versão 10 — melhor falhar alto do que
 * devolver um código truncado que parece válido e não lê.
 */
export function gerarQrCode(texto: string): QrMatrix {
  const conteudo = new TextEncoder().encode(texto);

  let versao = 0;
  for (let v = 1; v <= 10; v++) {
    const bitsContagem = v <= 9 ? 8 : 16;
    const capacidade = totalCodigosDados(VERSOES[v]) * 8 - 4 - bitsContagem;
    if (conteudo.length * 8 <= capacidade) {
      versao = v;
      break;
    }
  }
  if (versao === 0) {
    throw new Error(
      `Conteúdo de ${conteudo.length} bytes excede a versão 10 do QR (máximo 213 bytes).`
    );
  }

  const spec = VERSOES[versao];
  const capacidadeBytes = totalCodigosDados(spec);

  // --- fluxo de bits ---
  const fluxo = new FluxoBits();
  fluxo.push(0b0100, 4); // modo byte
  fluxo.push(conteudo.length, versao <= 9 ? 8 : 16);
  for (const b of conteudo) fluxo.push(b, 8);

  const limite = capacidadeBytes * 8;
  fluxo.push(0, Math.min(4, limite - fluxo.tamanho)); // terminador
  if (fluxo.tamanho % 8 !== 0) fluxo.push(0, 8 - (fluxo.tamanho % 8));

  const dados = new Uint8Array(capacidadeBytes);
  dados.set(fluxo.paraBytes());
  for (let i = fluxo.paraBytes().length, alterna = true; i < capacidadeBytes; i++, alterna = !alterna) {
    dados[i] = alterna ? 0xec : 0x11;
  }

  // --- blocos e correção ---
  const blocosDados: Uint8Array[] = [];
  const blocosEc: Uint8Array[] = [];
  let offset = 0;
  for (const [qtd, tam] of [spec.grupo1, spec.grupo2].filter(Boolean) as [number, number][]) {
    for (let i = 0; i < qtd; i++) {
      const bloco = dados.slice(offset, offset + tam);
      offset += tam;
      blocosDados.push(bloco);
      blocosEc.push(codigosCorrecao(bloco, spec.ecPorBloco));
    }
  }

  // --- intercalação ---
  const sequencia: number[] = [];
  const maiorDados = Math.max(...blocosDados.map((b) => b.length));
  for (let i = 0; i < maiorDados; i++) {
    for (const bloco of blocosDados) if (i < bloco.length) sequencia.push(bloco[i]);
  }
  for (let i = 0; i < spec.ecPorBloco; i++) {
    for (const bloco of blocosEc) sequencia.push(bloco[i]);
  }

  // --- estrutura fixa ---
  const tamanho = versao * 4 + 17;
  const grade = criarGrade(tamanho);

  desenharLocalizador(grade, 0, 0);
  desenharLocalizador(grade, 0, tamanho - 7);
  desenharLocalizador(grade, tamanho - 7, 0);

  for (const cy of spec.alinhamento) {
    for (const cx of spec.alinhamento) {
      const ultimo = spec.alinhamento[spec.alinhamento.length - 1];
      if ((cy === 6 && cx === 6) || (cy === 6 && cx === ultimo) || (cy === ultimo && cx === 6)) {
        continue;
      }
      desenharAlinhamento(grade, cy, cx);
    }
  }

  for (let i = 8; i < tamanho - 8; i++) {
    const escuro = i % 2 === 0;
    grade[6][i] = escuro;
    grade[i][6] = escuro;
  }
  grade[tamanho - 8][8] = true; // módulo escuro obrigatório

  if (versao >= 7) {
    const info = bitsVersao(versao);
    for (let i = 0; i < 18; i++) {
      const bit = ((info >>> i) & 1) === 1;
      grade[Math.floor(i / 3)][tamanho - 11 + (i % 3)] = bit;
      grade[tamanho - 11 + (i % 3)][Math.floor(i / 3)] = bit;
    }
  }

  // --- dados em ziguezague ---
  let indiceBit = 0;
  let subindo = true;
  for (let colunaBase = tamanho - 1; colunaBase > 0; colunaBase -= 2) {
    const coluna = colunaBase === 6 ? colunaBase - 1 : colunaBase; // salta o temporizador
    for (let passo = 0; passo < tamanho; passo++) {
      const linha = subindo ? tamanho - 1 - passo : passo;
      for (const c of [coluna, coluna - 1]) {
        if (areaFuncional(versao, tamanho, linha, c)) continue;
        const byte = sequencia[indiceBit >>> 3];
        const bit = byte === undefined ? false : ((byte >>> (7 - (indiceBit & 7))) & 1) === 1;
        grade[linha][c] = bit;
        indiceBit++;
      }
    }
    subindo = !subindo;
  }

  // --- máscara com menor penalidade ---
  let melhor: boolean[][] | null = null;
  let melhorMascara = 0;
  let melhorNota = Infinity;

  for (let mascara = 0; mascara < 8; mascara++) {
    const candidata: boolean[][] = grade.map((linha, y) =>
      linha.map((valor, x) => {
        const base = valor === true;
        if (areaFuncional(versao, tamanho, y, x)) return base;
        return aplicarMascara(mascara, y, x) ? !base : base;
      })
    );
    aplicarFormato(candidata, tamanho, mascara);
    const nota = penalidade(candidata);
    if (nota < melhorNota) {
      melhorNota = nota;
      melhor = candidata;
      melhorMascara = mascara;
    }
  }

  void melhorMascara;
  return { versao, tamanho, modulos: melhor! };
}

function aplicarFormato(m: boolean[][], tamanho: number, mascara: number): void {
  const bits = bitsFormato(mascara);
  for (let i = 0; i < 15; i++) {
    const bit = ((bits >>> i) & 1) === 1;

    // Cópia junto ao localizador superior esquerdo
    if (i < 6) m[i][8] = bit;
    else if (i === 6) m[7][8] = bit;
    else if (i === 7) m[8][8] = bit;
    else if (i === 8) m[8][7] = bit;
    else m[8][14 - i] = bit;

    // Cópia dividida entre os outros dois localizadores
    if (i < 8) m[8][tamanho - 1 - i] = bit;
    else m[tamanho - 15 + i][8] = bit;
  }
}

/**
 * Converte a matriz num único `path` SVG.
 *
 * Um caminho só, em vez de um `<rect>` por módulo: um QR versão 10 tem 2.809
 * módulos e o mesmo desenho sai com um elemento em lugar de centenas.
 */
export function qrParaSvgPath(matriz: QrMatrix): string {
  const partes: string[] = [];
  for (let y = 0; y < matriz.tamanho; y++) {
    for (let x = 0; x < matriz.tamanho; x++) {
      if (matriz.modulos[y][x]) partes.push(`M${x} ${y}h1v1h-1z`);
    }
  }
  return partes.join('');
}
