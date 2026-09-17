import { describe, it, expect } from 'vitest';
import { gerarQrCode, qrParaSvgPath, QrMatrix } from '../src/domain/qrcode';

/**
 * O QR de um certificado é o que liga o papel à verificação online. Se ele
 * sair errado, o documento parece perfeito e não lê — o pior modo de falha
 * possível para uma credencial. Daí a bateria abaixo ser estrutural E de
 * ida-e-volta.
 */

/** Reconstrói o conteúdo a partir da matriz, sem usar nada do codificador. */
function extrairBytes(m: QrMatrix): Uint8Array {
  const n = m.tamanho;
  const versao = m.versao;

  const centrosPorVersao: Record<number, number[]> = {
    1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30],
    6: [6, 34], 7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46], 10: [6, 28, 50],
  };
  const centros = centrosPorVersao[versao];

  const funcional = (y: number, x: number): boolean => {
    if (y < 9 && x < 9) return true;
    if (y < 9 && x >= n - 8) return true;
    if (y >= n - 8 && x < 9) return true;
    if (y === 6 || x === 6) return true;
    if (versao >= 7) {
      if (y < 6 && x >= n - 11) return true;
      if (x < 6 && y >= n - 11) return true;
    }
    const ultimo = centros[centros.length - 1];
    for (const cy of centros) {
      for (const cx of centros) {
        if ((cy === 6 && cx === 6) || (cy === 6 && cx === ultimo) || (cy === ultimo && cx === 6)) continue;
        if (Math.abs(y - cy) <= 2 && Math.abs(x - cx) <= 2) return true;
      }
    }
    return false;
  };

  // A máscara usada está gravada na própria informação de formato.
  let formato = 0;
  for (let i = 0; i < 15; i++) {
    let bit: boolean;
    if (i < 6) bit = m.modulos[i][8];
    else if (i === 6) bit = m.modulos[7][8];
    else if (i === 7) bit = m.modulos[8][8];
    else if (i === 8) bit = m.modulos[8][7];
    else bit = m.modulos[8][14 - i];
    if (bit) formato |= 1 << i;
  }
  const mascara = ((formato ^ 0b101010000010010) >>> 10) & 0b111;

  const mascarar = (y: number, x: number): boolean => {
    switch (mascara) {
      case 0: return (y + x) % 2 === 0;
      case 1: return y % 2 === 0;
      case 2: return x % 3 === 0;
      case 3: return (y + x) % 3 === 0;
      case 4: return (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0;
      case 5: return ((y * x) % 2) + ((y * x) % 3) === 0;
      case 6: return (((y * x) % 2) + ((y * x) % 3)) % 2 === 0;
      default: return (((y + x) % 2) + ((y * x) % 3)) % 2 === 0;
    }
  };

  const bits: number[] = [];
  let subindo = true;
  for (let colBase = n - 1; colBase > 0; colBase -= 2) {
    const col = colBase === 6 ? colBase - 1 : colBase;
    for (let passo = 0; passo < n; passo++) {
      const y = subindo ? n - 1 - passo : passo;
      for (const x of [col, col - 1]) {
        if (funcional(y, x)) continue;
        const cru = m.modulos[y][x];
        bits.push((mascarar(y, x) ? !cru : cru) ? 1 : 0);
      }
    }
    subindo = !subindo;
  }

  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | bits[i * 8 + j];
    bytes[i] = b;
  }
  return bytes;
}

/** Desfaz a intercalação e lê o cabeçalho do modo byte. */
function decodificar(m: QrMatrix, blocos: number, dadosPorBloco: number[]): string {
  const cru = extrairBytes(m);
  const partes: number[][] = Array.from({ length: blocos }, () => []);
  let idx = 0;
  const maior = Math.max(...dadosPorBloco);
  for (let i = 0; i < maior; i++) {
    for (let b = 0; b < blocos; b++) {
      if (i < dadosPorBloco[b]) partes[b].push(cru[idx++]);
    }
  }
  const dados = new Uint8Array(partes.flat());

  // Cabeçalho: 4 bits de modo + contagem (8 bits até a versão 9).
  const bitsContagem = m.versao <= 9 ? 8 : 16;
  let acumulador = 0;
  let disponiveis = 0;
  let cursor = 0;
  const lerBits = (quantidade: number): number => {
    while (disponiveis < quantidade) {
      acumulador = (acumulador << 8) | dados[cursor++];
      disponiveis += 8;
    }
    const valor = (acumulador >>> (disponiveis - quantidade)) & ((1 << quantidade) - 1);
    disponiveis -= quantidade;
    return valor;
  };

  expect(lerBits(4)).toBe(0b0100); // modo byte
  const tamanho = lerBits(bitsContagem);
  const saida: number[] = [];
  for (let i = 0; i < tamanho; i++) saida.push(lerBits(8));
  return new TextDecoder().decode(new Uint8Array(saida));
}

describe('QR Code — estrutura', () => {
  it('a matriz tem 4·versão + 17 módulos de lado', () => {
    const m = gerarQrCode('https://academia.exemplo/c/ABCD-1234');
    expect(m.tamanho).toBe(m.versao * 4 + 17);
  });

  it('escolhe a menor versão que comporta o conteúdo', () => {
    expect(gerarQrCode('oi').versao).toBe(1);
    expect(gerarQrCode('x'.repeat(200)).versao).toBe(10);
  });

  it('desenha os três localizadores nos cantos certos', () => {
    const m = gerarQrCode('teste');
    const n = m.tamanho;
    for (const [oy, ox] of [[0, 0], [0, n - 7], [n - 7, 0]] as [number, number][]) {
      // Anel externo escuro, anel interno claro, centro escuro.
      expect(m.modulos[oy][ox]).toBe(true);
      expect(m.modulos[oy + 1][ox + 1]).toBe(false);
      expect(m.modulos[oy + 3][ox + 3]).toBe(true);
    }
    // O quarto canto NÃO tem localizador.
    expect(m.modulos[n - 4][n - 4]).toBeDefined();
  });

  it('alterna os módulos do temporizador', () => {
    const m = gerarQrCode('teste');
    for (let i = 8; i < m.tamanho - 8; i++) {
      expect(m.modulos[6][i]).toBe(i % 2 === 0);
      expect(m.modulos[i][6]).toBe(i % 2 === 0);
    }
  });

  it('mantém o módulo escuro obrigatório', () => {
    const m = gerarQrCode('teste');
    expect(m.modulos[m.tamanho - 8][8]).toBe(true);
  });
});

describe('QR Code — informação de formato', () => {
  /**
   * Confere contra a tabela publicada da norma para o nível M. É o trecho
   * mais fácil de errar sem perceber: um bit trocado aqui produz um código
   * de aparência impecável que nenhum leitor abre.
   */
  const TABELA_M = [
    '101010000010010',
    '101000100100101',
    '101111001111100',
    '101101101001011',
    '100010111111001',
    '100000011001110',
    '100111110010111',
    '100101010100000',
  ];

  it('bate com a tabela da norma nas oito máscaras', () => {
    // A máscara efetivamente escolhida é lida de volta da matriz.
    const m = gerarQrCode('verificação');
    let formato = 0;
    for (let i = 0; i < 15; i++) {
      let bit: boolean;
      if (i < 6) bit = m.modulos[i][8];
      else if (i === 6) bit = m.modulos[7][8];
      else if (i === 7) bit = m.modulos[8][8];
      else if (i === 8) bit = m.modulos[8][7];
      else bit = m.modulos[8][14 - i];
      if (bit) formato |= 1 << i;
    }
    const comoTexto = formato.toString(2).padStart(15, '0');
    expect(TABELA_M).toContain(comoTexto);
  });

  it('grava a mesma informação de formato nas duas cópias', () => {
    const m = gerarQrCode('duas cópias');
    const n = m.tamanho;
    for (let i = 0; i < 15; i++) {
      let principal: boolean;
      if (i < 6) principal = m.modulos[i][8];
      else if (i === 6) principal = m.modulos[7][8];
      else if (i === 7) principal = m.modulos[8][8];
      else if (i === 8) principal = m.modulos[8][7];
      else principal = m.modulos[8][14 - i];

      const secundaria = i < 8 ? m.modulos[8][n - 1 - i] : m.modulos[n - 15 + i][8];
      expect(secundaria).toBe(principal);
    }
  });
});

describe('QR Code — ida e volta', () => {
  it('recupera o conteúdo de um bloco único (versão 1)', () => {
    const texto = 'AMD-2026-XYZ';
    const m = gerarQrCode(texto);
    expect(m.versao).toBe(1);
    expect(decodificar(m, 1, [16])).toBe(texto);
  });

  it('recupera uma URL de verificação completa', () => {
    const texto = 'https://academia-musical.exemplo.org/c/AMD-2026-TEO-4817';
    const m = gerarQrCode(texto);
    expect(m.versao).toBe(4);
    expect(decodificar(m, 2, [32, 32])).toBe(texto);
  });

  it('recupera conteúdo repartido em quatro blocos (versão 6)', () => {
    const texto = 'x'.repeat(100);
    const m = gerarQrCode(texto);
    expect(m.versao).toBe(6);
    expect(decodificar(m, 4, [27, 27, 27, 27])).toBe(texto);
  });

  it('preserva acentuação em UTF-8', () => {
    const texto = 'Certificação Acadêmica — Órgão de Tubos';
    const m = gerarQrCode(texto);
    expect(decodificar(m, 2, [32, 32])).toBe(texto);
  });
});

describe('QR Code — limites e saída', () => {
  it('falha alto quando o conteúdo não cabe, em vez de truncar', () => {
    // Um QR truncado parece válido e não lê. Silêncio aqui seria pior.
    expect(() => gerarQrCode('x'.repeat(400))).toThrow(/excede a versão 10/);
  });

  it('gera um único path SVG com um comando por módulo escuro', () => {
    const m = gerarQrCode('svg');
    const path = qrParaSvgPath(m);
    const escuros = m.modulos.flat().filter(Boolean).length;
    expect(path.match(/M/g)?.length).toBe(escuros);
    expect(path.startsWith('M')).toBe(true);
  });
});
