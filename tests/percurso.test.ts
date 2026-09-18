import { describe, it, expect } from 'vitest';
import {
  dimensaoAtual,
  estadoDoNo,
  motivoDoBloqueio,
  nosDoPercurso,
  progressoDaUnidade,
  unidadeAtual,
  unidadesDoPercurso,
} from '../src/domain/percurso';
import { DIMENSOES, Dimensao } from '../src/domain/gramatica-musical';
import { CAPITULOS_TEORIA } from '../src/data/theory/capitulos';

/**
 * O percurso.
 *
 * O que estes casos protegem é que ele continue **derivado** da gramática, e
 * não vire uma segunda lista escrita à mão. Duas fontes para a mesma ordem
 * divergem em silêncio: uma ofereceria cadência a quem ainda não viu função
 * harmônica, e ninguém saberia qual das duas está certa.
 */

const TUDO = Object.values(Dimensao);

describe('o percurso sai da gramática, e não de uma lista paralela', () => {
  it('todo nó é uma dimensão, e toda dimensão é um nó', () => {
    const nos = nosDoPercurso().map((n) => n.dimensao);
    expect(new Set(nos).size).toBe(nos.length);
    expect(nos.sort()).toEqual([...TUDO].sort());
  });

  it('o nó carrega a pergunta e os capítulos que a gramática declara', () => {
    for (const no of nosDoPercurso()) {
      const d = DIMENSOES[no.dimensao];
      expect(no.titulo).toBe(d.nome);
      expect(no.pergunta).toBe(d.pergunta);
      expect(no.capitulos).toEqual(d.capitulos);
    }
  });

  it('todo nó aponta para capítulo que existe no curso de Teoria', () => {
    // Sem isto o percurso viraria uma trilha sem lastro no que se ensina.
    const existentes = new Set(CAPITULOS_TEORIA.map((c) => c.numero));
    for (const no of nosDoPercurso()) {
      for (const cap of no.capitulos) {
        expect(existentes.has(cap), `${no.titulo} → capítulo ${cap}`).toBe(true);
      }
    }
  });
});

describe('nenhum nó aparece antes do que ele exige', () => {
  it('cada pré-requisito vem em unidade anterior', () => {
    /**
     * É a propriedade inteira do mapa. Se falhar, existe nó alcançável cujo
     * pré-requisito ainda nem apareceu — e a pessoa fica travada sem saber
     * onde procurar o que falta.
     */
    const unidadeDe = new Map<Dimensao, number>();
    for (const u of unidadesDoPercurso()) {
      for (const no of u.nos) unidadeDe.set(no.dimensao, u.numero);
    }

    for (const [dim, d] of Object.entries(DIMENSOES)) {
      for (const requisito of d.requer) {
        expect(
          unidadeDe.get(requisito)!,
          `${requisito} precisa vir antes de ${dim}`
        ).toBeLessThan(unidadeDe.get(dim as Dimensao)!);
      }
    }
  });

  it('a primeira unidade não depende de nada', () => {
    for (const no of unidadesDoPercurso()[0].nos) {
      expect(no.requer, no.titulo).toEqual([]);
    }
  });

  it('as unidades são numeradas em sequência, a partir de 1', () => {
    const numeros = unidadesDoPercurso().map((u) => u.numero);
    expect(numeros).toEqual(numeros.map((_, i) => i + 1));
  });

  it('o título da unidade nomeia o que ela cobre', () => {
    // Derivado: acrescentar uma dimensão reposiciona o mapa sozinho.
    for (const u of unidadesDoPercurso()) {
      for (const no of u.nos) {
        expect(u.titulo, `unidade ${u.numero}`).toContain(no.titulo);
      }
    }
  });
});

describe('há um só nó atual', () => {
  it('sem nada concluído, o atual é o primeiro do percurso', () => {
    expect(dimensaoAtual([])).toBe(nosDoPercurso()[0].dimensao);
  });

  it('exatamente um nó está em ATUAL a qualquer momento', () => {
    /**
     * Vários destaques é a mesma coisa que nenhum: a pessoa abre o mapa para
     * saber por onde continuar, não para escolher.
     */
    for (const concluidas of [[], [Dimensao.NOTA], [Dimensao.NOTA, Dimensao.VALOR]]) {
      const atuais = TUDO.filter((d) => estadoDoNo(d, concluidas) === 'ATUAL');
      expect(atuais, `com ${concluidas.length} concluídas`).toHaveLength(1);
    }
  });

  it('com tudo concluído não há nó atual', () => {
    expect(dimensaoAtual(TUDO)).toBeNull();
    expect(TUDO.filter((d) => estadoDoNo(d, TUDO) === 'ATUAL')).toHaveLength(0);
  });

  it('o atual é sempre alcançável', () => {
    const concluidas = [Dimensao.NOTA, Dimensao.VALOR];
    const atual = dimensaoAtual(concluidas)!;
    expect(DIMENSOES[atual].requer.every((r) => concluidas.includes(r))).toBe(true);
  });
});

describe('os quatro estados', () => {
  it('o que foi feito fica concluído', () => {
    expect(estadoDoNo(Dimensao.NOTA, [Dimensao.NOTA])).toBe('CONCLUIDO');
  });

  it('o que depende do que falta fica bloqueado', () => {
    expect(estadoDoNo(Dimensao.CADENCIA, [])).toBe('BLOQUEADO');
  });

  it('o alcançável que não é o atual fica disponível', () => {
    // Nada impede fazer fora de ordem entre os que já abriram.
    const disponiveis = TUDO.filter((d) => estadoDoNo(d, []) === 'DISPONIVEL');
    expect(disponiveis.length).toBeGreaterThan(0);
    for (const d of disponiveis) {
      expect(DIMENSOES[d].requer).toEqual([]);
    }
  });

  it('concluir abre o que dependia daquilo', () => {
    expect(estadoDoNo(Dimensao.CLAVE, [])).toBe('BLOQUEADO');
    expect(estadoDoNo(Dimensao.CLAVE, [Dimensao.NOTA])).not.toBe('BLOQUEADO');
  });
});

describe('o cadeado diz o motivo', () => {
  it('nó aberto não tem motivo de bloqueio', () => {
    expect(motivoDoBloqueio(Dimensao.NOTA, [])).toBeNull();
  });

  it('o motivo nomeia o que falta', () => {
    /**
     * Cadeado sem explicação é lido como "isto é pago" ou "isto quebrou". O
     * que falta aqui é alcançável, e saber disso é a diferença entre um
     * obstáculo e uma porta.
     */
    const motivo = motivoDoBloqueio(Dimensao.CLAVE, [])!;
    expect(motivo).toContain(DIMENSOES[Dimensao.NOTA].nome);
  });

  it('o motivo não cita pré-requisito já cumprido', () => {
    // Listar o que já foi feito obriga a pessoa a fazer a subtração.
    const requisitos = DIMENSOES[Dimensao.INTERVALO].requer;
    expect(requisitos.length).toBeGreaterThan(1);

    const motivo = motivoDoBloqueio(Dimensao.INTERVALO, [requisitos[0]])!;
    expect(motivo).not.toContain(DIMENSOES[requisitos[0]].nome);
    expect(motivo).toContain(DIMENSOES[requisitos[1]].nome);
  });

  it('todo nó bloqueado tem motivo legível', () => {
    for (const d of TUDO) {
      if (estadoDoNo(d, []) !== 'BLOQUEADO') continue;
      const motivo = motivoDoBloqueio(d, [])!;
      expect(motivo.length, d).toBeGreaterThan(20);
      expect(motivo).toMatch(/^Abre quando/);
    }
  });
});

describe('progresso', () => {
  it('unidade intocada está em zero', () => {
    expect(progressoDaUnidade(unidadesDoPercurso()[0], [])).toBe(0);
  });

  it('unidade inteira concluída chega a um', () => {
    const u = unidadesDoPercurso()[0];
    expect(progressoDaUnidade(u, u.nos.map((n) => n.dimensao))).toBe(1);
  });

  it('a unidade atual é a que contém o nó atual', () => {
    const atual = unidadeAtual([])!;
    expect(atual.nos.some((n) => n.dimensao === dimensaoAtual([]))).toBe(true);
  });

  it('com tudo concluído, a unidade atual é a última — é onde se chegou', () => {
    const unidades = unidadesDoPercurso();
    // Por valor: o percurso é derivado e cada chamada monta objetos novos.
    expect(unidadeAtual(TUDO)).toEqual(unidades[unidades.length - 1]);
  });
});
