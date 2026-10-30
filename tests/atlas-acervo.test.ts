import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { atlasService } from '../src/services/application/atlas.service';
import { acervoService } from '../src/services/application/acervo.service';
import { DEFAULT_ERAS } from '../src/data/seed-atlas';
import { todasAsObras, todosOsCompositores } from '../src/data/acervo-unificado';

/**
 * ATLAS E ACERVO SÃO A MESMA VERDADE, EM DUAS EXPERIÊNCIAS.
 *
 * 🔴 O DEFEITO QUE ESTES CASOS GUARDAM
 * ------------------------------------
 * O Atlas contava **dezessete obras**; o Acervo contava **vinte e quatro mil
 * novecentas e cinquenta e sete**. Não era defasagem de cache: eram duas
 * fontes. A tela do mapa lia `DEFAULT_WORKS`, projeção do repertório próprio, e
 * a biblioteca lia o catálogo canônico.
 *
 * Duas verdades sobre o mesmo acervo é pior que uma verdade incompleta, porque
 * as duas telas estariam "certas" e nenhuma denunciaria a outra.
 *
 * O QUE CADA UMA É
 * ----------------
 * **Atlas** é mapa: marcadores, indicadores, métricas, navegação no tempo e no
 * espaço. Agrega quando se está longe, detalha quando se aproxima.
 *
 * **Acervo** é biblioteca: ficha completa, busca, filtro fino.
 *
 * Não são a mesma experiência. São a mesma verdade, e se ligam pelo **mesmo
 * identificador canônico**.
 */

/** O acervo servido não está disponível por rede no teste — lê-se do disco. */
beforeAll(() => {
  const nativo = globalThis.fetch;
  globalThis.fetch = (async (u: string) => ({
    ok: true,
    json: async () => JSON.parse(readFileSync('public' + String(u), 'utf-8')),
  })) as unknown as typeof nativo;
});

describe('as duas telas leem o mesmo catálogo', () => {
  it('🔴 o mapa enxerga o MESMO número de obras que a biblioteca', () => {
    return (async () => {
      const doMapa = await atlasService.cobertura();
      const daBiblioteca = await acervoService.resumo();

      expect(doMapa.obras, 'o mapa voltou a ler um acervo paralelo').toBe(daBiblioteca.obras);
      expect(doMapa.compositores).toBe(daBiblioteca.compositores);

      /** Não-vacuidade: se os dois lessem zero, a igualdade passaria à toa. */
      expect(doMapa.obras, 'o catálogo ficou vazio').toBeGreaterThan(20000);
    })();
  });

  it('o compositor do mapa É o compositor da biblioteca, pelo mesmo id', async () => {
    const vista = await atlasService.vista({ eraId: 'era_barroco' });
    const marcador = vista.marcadores.find((m) => m.kind === 'COMPOSITOR')!;

    expect(marcador, 'nenhum compositor no Barroco — o teste não olharia nada').toBeDefined();

    const ficha = await acervoService.fichaDoCompositor(marcador.id);
    expect(ficha, `o id ${marcador.id} do mapa não abre ficha na biblioteca`).not.toBeNull();
    expect(ficha!.compositor.canonicalName).toBe(marcador.titulo);
  });

  it('a rota do marcador aponta para a ficha canônica', async () => {
    const vista = await atlasService.vista({ eraId: 'era_romantismo' });
    const pessoa = vista.marcadores.find((m) => m.kind === 'COMPOSITOR')!;

    expect(atlasService.rotaDoMarcador(pessoa)).toBe(`/acervo/compositor/${pessoa.id}`);
  });

  it('a contagem do marcador bate com o compêndio da ficha', async () => {
    /**
     * O número no mapa é o que faz um marcador informar sem obrigar a ler.
     * Se ele divergir do compêndio, o mapa passa a mentir sobre o tamanho do
     * acervo — que é exatamente o defeito original, em escala menor.
     */
    const vista = await atlasService.vista({ eraId: 'era_barroco' });
    const pessoa = vista.marcadores.find((m) => m.kind === 'COMPOSITOR' && (m.contagem ?? 0) > 0)!;

    expect(pessoa, 'nenhum compositor com obra no Barroco').toBeDefined();

    const ficha = await acervoService.fichaDoCompositor(pessoa.id);
    expect(ficha!.obras.length).toBe(pessoa.contagem);
  });
});

describe('o mapa se comporta como mapa', () => {
  it('🔴 SEM FOCO o mapa é PLOTÁVEL — nenhuma era passa de duzentos marcadores', async () => {
    /**
     * Emitir toda obra como marcador dava **9.245 pontos** no Romantismo. Um
     * mapa com nove mil pontos é uma lista desenhada sobre uma imagem.
     *
     * Nada se perde ao agregar: o compêndio de cada pessoa vem na contagem.
     */
    let maior = 0;
    for (const e of DEFAULT_ERAS) {
      const v = await atlasService.vista({ eraId: e.id });
      maior = Math.max(maior, v.marcadores.length);
      expect(
        v.marcadores.filter((m) => m.kind === 'OBRA'),
        `${e.name} emitiu obras sem foco`
      ).toEqual([]);
    }

    expect(maior, 'nenhuma era tem marcador — o teste passaria à toa').toBeGreaterThan(10);
    expect(maior, 'uma era voltou a emitir marcadores demais').toBeLessThan(200);
  });

  it('focar uma pessoa abre as obras dela', async () => {
    const vista = await atlasService.vista({ eraId: 'era_barroco' });
    const pessoa = vista.marcadores.find((m) => m.kind === 'COMPOSITOR' && (m.contagem ?? 0) > 3)!;

    const focada = await atlasService.vista({ eraId: 'era_barroco', composerId: pessoa.id });
    const obras = focada.marcadores.filter((m) => m.kind === 'OBRA');

    expect(obras.length).toBeGreaterThan(3);
  });

  it('as regiões REPOVOAM ao andar no tempo', async () => {
    /**
     * É o comportamento que faz o Atlas ser mapa e não lista. A Escandinávia
     * não existe no mapa do Renascimento e aparece depois.
     */
    const renascimento = await atlasService.vista({ eraId: 'era_renascimento' });
    const romantismo = await atlasService.vista({ eraId: 'era_romantismo' });

    const ids = (v: { regioes: Array<{ id: string }> }) => v.regioes.map((r) => r.id);
    expect(ids(renascimento)).not.toEqual(ids(romantismo));
    expect(romantismo.regioes.length).toBeGreaterThan(renascimento.regioes.length);
  });

  it('o eixo do tempo devolve NULO nas pontas, e não a própria era', async () => {
    /** Uma seta que não anda é pior que seta ausente: parece tela travada. */
    const primeira = await atlasService.vista({ eraId: DEFAULT_ERAS[0].id });
    const ultima = await atlasService.vista({ eraId: DEFAULT_ERAS[DEFAULT_ERAS.length - 1].id });

    expect(primeira.eraAnterior).toBeNull();
    expect(ultima.eraSeguinte).toBeNull();
    expect(primeira.eraSeguinte?.id).toBe(DEFAULT_ERAS[1].id);
  });

  it('o mapa abre numa era que TEM algo', async () => {
    const inicial = await atlasService.eraInicial();
    const vista = await atlasService.vista({ eraId: inicial });
    expect(vista.marcadores.length).toBeGreaterThan(0);
  });

  it('os indicadores somam o total da vista', async () => {
    const v = await atlasService.vista({ eraId: 'era_romantismo' });
    expect(v.indicadores.comExperiencia + v.indicadores.apenasPontuados).toBe(
      v.indicadores.total
    );
    expect(v.indicadores.total).toBe(v.marcadores.length);
  });
});

describe('o Brasil aparece no mapa', () => {
  it('há marcador brasileiro, e ele abre ficha', async () => {
    /**
     * O Brasil aparecia com zero em todas as eras — não por falta de
     * repertório, mas porque a região de ninguém tinha sido apurada.
     */
    const v = await atlasService.vista({ eraId: 'era_romantismo', regionId: 'reg_brasil' });
    expect(v.marcadores.length).toBeGreaterThan(0);

    const pessoa = v.marcadores.find((m) => m.kind === 'COMPOSITOR')!;
    expect(pessoa).toBeDefined();
    expect(await acervoService.fichaDoCompositor(pessoa.id)).not.toBeNull();
  });

  it('todo compositor com região aponta para uma região que o mapa oferece', async () => {
    /**
     * Uma região que a pessoa declara e o mapa não oferece deixaria a ficha
     * apontando para um lugar inalcançável — e ninguém veria.
     */
    const pessoas = todosOsCompositores();
    const oferecidas = new Set<string>();
    for (const e of DEFAULT_ERAS) {
      const v = await atlasService.vista({ eraId: e.id });
      for (const r of v.regioes) oferecidas.add(r.id);
    }

    const orfas = new Set<string>();
    for (const p of pessoas) {
      for (const r of p.regionIds) if (!oferecidas.has(r)) orfas.add(r);
    }

    expect(oferecidas.size, 'o mapa não ofereceu região nenhuma').toBeGreaterThan(3);
    expect([...orfas], 'região declarada que o mapa não alcança').toEqual([]);
  });
});

describe('a biblioteca continua sendo biblioteca', () => {
  it('o Acervo lista obra individual, que o mapa agrega', async () => {
    /**
     * A divisão de trabalho: o mapa mostra **quanto** há em cada ponto; a
     * biblioteca mostra **o que** há, uma a uma.
     */
    const obras = await acervoService.listar('OBRAS', { eraId: 'era_romantismo' });
    expect(obras.length).toBeGreaterThan(1000);

    const doMapa = await atlasService.vista({ eraId: 'era_romantismo' });
    expect(doMapa.marcadores.length).toBeLessThan(obras.length);
  });

  it('toda obra do catálogo tem era, e por isso cabe em alguma posição do mapa', async () => {
    const obras = await todasAsObras();
    const eras = new Set(DEFAULT_ERAS.map((e) => e.id));
    const foraDoMapa = obras.filter((o) => o.periodId && !eras.has(o.periodId));

    expect(obras.length).toBeGreaterThan(20000);
    expect(foraDoMapa.map((o) => o.periodId).slice(0, 3)).toEqual([]);
  });
});
