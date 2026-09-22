import { describe, it, expect } from 'vitest';
import { acervoService } from '../src/services/application/acervo.service';
import { todasAsObras, todosOsCompositores } from '../src/data/acervo-unificado';
import {
  avaliarDisponibilidade,
  temPartituraLocalizada,
  linkOficial,
  textoDe,
} from '../src/domain/music-knowledge';

/**
 * DUAS COISAS QUE A LISTAGEM DEVE AO LEITOR: ordem, e endereço.
 *
 * 🔴 O QUE ACONTECIA
 * ------------------
 * A listagem saía na ordem em que o arquivo foi lido — a ordem da extração,
 * que é nenhuma. Trinta e uma mil obras numa sequência sem critério fazem a
 * página dois não ter relação com a página um.
 *
 * E a ficha dizia "ainda não há edição catalogada" sobre sete mil obras cuja
 * edição a plataforma sabe exatamente onde fica. Havia dois estados onde
 * existem três: toca aqui, partitura achada, ainda procurando.
 */

describe('as listas saem em ordem alfabética', () => {
  const emOrdem = (titulos: string[]) => {
    const copia = [...titulos].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    return titulos.every((t, i) => t === copia[i]);
  };

  it('as obras', async () => {
    const itens = await acervoService.listar('OBRAS');
    expect(itens.length, 'a listagem veio vazia — o caso passaria à toa').toBeGreaterThan(1000);
    expect(emOrdem(itens.map((i) => i.titulo)), 'as obras saíram fora de ordem').toBe(true);
  });

  it('os compositores', async () => {
    const itens = await acervoService.listar('COMPOSITORES');
    expect(itens.length).toBeGreaterThan(200);
    expect(emOrdem(itens.map((i) => i.titulo)), 'os compositores saíram fora de ordem').toBe(true);
  });

  it('o compêndio da ficha, que é a lista mais longa que alguém lê', async () => {
    /** Bach tem centenas de obras: sem ordem, procurar uma exige ler todas. */
    const compositores = todosOsCompositores();
    const obras = await todasAsObras();

    const maior = compositores
      .map((c) => ({ c, n: obras.filter((o) => o.composerIds.includes(c.id)).length }))
      .sort((a, b) => b.n - a.n)[0];

    expect(maior.n, 'ninguém tem obra — o caso passaria à toa').toBeGreaterThan(100);

    const ficha = await acervoService.fichaDoCompositor(maior.c.id);
    const titulos = ficha!.obras.map((o) => textoDe(o.canonicalTitle) ?? '');

    expect(emOrdem(titulos), `o compêndio de ${maior.c.canonicalName} saiu fora de ordem`).toBe(
      true
    );
  });

  it('🔴 o acento entra no lugar certo, e não depois do Z', async () => {
    /**
     * Sem `localeCompare` com `pt-BR` a comparação é por código de caractere, e
     * "Ária" cai depois de "Zumbi". Num catálogo em português isso põe uma
     * parte das obras num fim de lista que ninguém alcança.
     */
    const itens = await acervoService.listar('OBRAS');
    const comAcento = itens.findIndex((i) => /^[ÁÀÂÃÉÊÍÓÔÕÚÇ]/.test(i.titulo));

    if (comAcento === -1) return;
    expect(comAcento / itens.length, 'título acentuado foi parar no fim da lista').toBeLessThan(0.5);
  });
});

describe('🔴 obra com partitura localizada NÃO diz que não tem', () => {
  it('quem tem endereço diz onde está, e quem não tem diz que procura', async () => {
    const obras = await todasAsObras();
    const comEndereco = obras.filter(temPartituraLocalizada);

    expect(comEndereco.length, 'nenhuma obra tem endereço de partitura').toBeGreaterThan(5000);

    for (const o of comEndereco.slice(0, 200)) {
      const d = avaliarDisponibilidade(o);
      expect(
        d.motivo,
        `"${textoDe(o.canonicalTitle)}" tem partitura e a ficha diz que não localizamos`
      ).not.toMatch(/ainda não localizamos edição/i);
    }

    const sem = obras.filter((o) => !temPartituraLocalizada(o));
    for (const o of sem.slice(0, 50)) {
      const d = avaliarDisponibilidade(o);
      /** Quem não tem precisa dizer o motivo, e não ficar em silêncio. */
      expect(d.motivo.length, 'obra sem edição ficou sem motivo escrito').toBeGreaterThan(30);
    }
  });

  it('toda obra com edição EXTERNA oferece um link que abre', async () => {
    /**
     * O repertório próprio fica de fora, e não por conveniência: a edição dele
     * é nossa, toca aqui dentro, e não existe fonte externa para onde mandar
     * ninguém. Um link ali apontaria para lugar nenhum.
     *
     * O que se cobra é das outras: se a obra tem edição de terceiro
     * catalogada, a ficha precisa dizer onde ela está.
     */
    const obras = await todasAsObras();
    const comEndereco = obras.filter(
      (o) => temPartituraLocalizada(o) && !o.scoreRefs.some((r) => r.render === 'NATIVA')
    );

    expect(comEndereco.length, 'nenhuma edição externa — o caso passaria à toa').toBeGreaterThan(
      5000
    );

    const semLink = comEndereco.filter((o) => !linkOficial(o.externalIds));

    expect(
      semLink.slice(0, 5).map((o) => textoDe(o.canonicalTitle)),
      'obra com partitura localizada e sem link para ela'
    ).toEqual([]);
  });

  it('a referência de PÁGINA não se disfarça de arquivo', async () => {
    /**
     * Página da obra reúne várias edições, cada uma com editor e licença
     * próprios. Tratá-la como arquivo fazia a ficha declarar "transcrição sem
     * autoria declarada" sobre uma página onde a autoria está declarada.
     */
    const obras = await todasAsObras();
    const paginas = obras.flatMap((o) => o.scoreRefs.filter((r) => r.aponta === 'PAGINA'));

    expect(paginas.length, 'nenhuma referência de página — o caso passaria à toa').toBeGreaterThan(
      5000
    );

    const mentirosas = paginas.filter((r) => r.editors || r.fileLicense);
    expect(
      mentirosas.length,
      'uma página declarou editor ou licença como se fosse um arquivo só'
    ).toBe(0);
  });
});

describe('🔴 o enriquecimento de partitura NAO cria obra', () => {
  it('toda referência de edição pertence a uma obra que já existia', async () => {
    /**
     * O índice do IMSLP tem mais de duzentas mil entradas — sete vezes o nosso
     * catálogo. Se o casamento pudesse criar entidade, uma linha que não
     * achasse obra viraria obra nova com nome de página da fonte, e o acervo
     * seria inundado por um enriquecimento.
     *
     * É a regra que as 1.331 partituras do Mutopia ensinaram quando viraram
     * obras falsas. Aqui ela é verificada sobre o resultado: nenhuma obra do
     * catálogo tem identificador de índice externo, e toda edição está presa a
     * uma obra com autoria resolvida.
     */
    const obras = await todasAsObras();
    const compositores = todosOsCompositores();
    const ids = new Set(compositores.map((c) => c.id));

    /**
     * 🔴 ANÔNIMO DE FATO É DIFERENTE DE AUTORIA NÃO RESOLVIDA.
     *
     * Este caso acusava as oito obras da Antiguidade, e estava errado: a
     * música antiga que sobreviveu é quase toda anônima, e inventar um autor
     * para preencher o campo seria o pior tipo de dado fabricado.
     *
     * A regra que importa é outra, e é mais estreita: **identificador de autor
     * que não resolve**. Uma obra apontando para um compositor que não existe
     * é sinal de entidade criada por enriquecimento, ou de fusão que deixou
     * órfão — e as duas já aconteceram aqui.
     *
     * Obra sem nenhum identificador é permitida, e só onde a ausência de autor
     * é a verdade: a era da Antiguidade.
     */
    const apontamParaNinguem = obras.filter(
      (o) => o.composerIds.length > 0 && !o.composerIds.some((c) => ids.has(c))
    );
    expect(
      apontamParaNinguem.slice(0, 5).map((o) => o.id),
      'obra aponta para compositor que não existe'
    ).toEqual([]);

    const anonimas = obras.filter((o) => o.composerIds.length === 0);
    expect(
      anonimas.filter((o) => o.periodId !== 'era_antiguidade').map((o) => o.id),
      'obra sem autoria fora da Antiguidade — ali a ausência precisa ser justificada'
    ).toEqual([]);

    /**
     * E o total não pode ter crescido pelo enriquecimento: o catálogo vem das
     * duas catalogações de origem, e de mais nada.
     */
    const comImslp = obras.filter((o) => o.scoreRefs.some((r) => r.source === 'IMSLP'));
    for (const o of comImslp.slice(0, 100)) {
      expect(o.composerIds.length, `${o.id} recebeu edição e está sem autor`).toBeGreaterThan(0);
      expect(o.id.startsWith('imslp'), `${o.id} nasceu do índice em vez de casar`).toBe(false);
    }
  });
});
