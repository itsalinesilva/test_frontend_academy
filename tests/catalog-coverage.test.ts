import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  REGIAO_DO_ESTADO,
  estadosNaoMapeados,
  regioesDasCidadanias,
} from '../src/domain/wikidata-regions';
import {
  abaixoDoPiso,
  contar,
  contarLista,
  descreverCobertura,
  fracaoCoberta,
  montarFaceta,
  separarPorNivel,
} from '../src/domain/catalog-facets';
import { DEFAULT_REGIONS } from '../src/data/seed-atlas';
import { COMPOSITORES_EXTERNOS } from '../src/data/seed-acervo-externo';
import { todosOsCompositores } from '../src/data/acervo-unificado';

/**
 * A DIGNIDADE DO FILTRO — o que um eixo precisa cumprir para ser oferecido.
 *
 * Um filtro só é filtro se o campo que ele recorta estiver preenchido. A região
 * alcançava **dezessete obras de vinte e seis mil** e era oferecida como um
 * recorte qualquer: quem clicava em "Europa Ocidental (14)" concluía que eram
 * essas as que existiam, quando eram essas as que tinham o campo escrito.
 *
 * A diferença entre "não há" e "não apuramos" é invisível no resultado de um
 * filtro. Estes casos guardam as duas garantias que a tornam visível: o eixo
 * universal **alcança** o acervo, e todo eixo **declara** quanto alcança.
 */

describe('o mapa de Estado para região', () => {
  it('toda região de chegada existe no Atlas', () => {
    /**
     * Sem isto, um compositor cairia numa região que a tela não sabe rotular —
     * e apareceria no filtro como `reg_alguma_coisa`, cru, ao lado dos nomes.
     */
    const conhecidas = new Set(DEFAULT_REGIONS.map((r) => r.id));
    const usadas = new Set(Object.values(REGIAO_DO_ESTADO));

    expect(usadas.size, 'o mapa ficou sem regiões — o teste não olharia nada').toBeGreaterThan(5);
    for (const r of usadas) {
      expect(conhecidas.has(r), `a região "${r}" não existe em DEFAULT_REGIONS`).toBe(true);
    }
  });

  it('o Estado histórico cai na mesma região do Estado de hoje', () => {
    /**
     * Bach é cidadão do Sacro Império; Mozart, do Arcebispado de Salzburgo;
     * Chopin, do Congresso da Polônia. Nenhum desses Estados existe, e mapear
     * só os de hoje deixaria de fora justamente os compositores mais antigos.
     */
    expect(REGIAO_DO_ESTADO.Q12548).toBe(REGIAO_DO_ESTADO.Q183); // Sacro Império ≡ Alemanha
    expect(REGIAO_DO_ESTADO.Q701614).toBe(REGIAO_DO_ESTADO.Q40); // Salzburgo ≡ Áustria
    expect(REGIAO_DO_ESTADO.Q221457).toBe(REGIAO_DO_ESTADO.Q36); // Congresso ≡ Polônia
    expect(REGIAO_DO_ESTADO.Q34266).toBe(REGIAO_DO_ESTADO.Q159); // Império Russo ≡ Rússia
  });

  it('quem foi cidadão de dois Estados aparece nas duas regiões', () => {
    /**
     * Stravinsky é russo **e** americano. Recortá-lo só como russo apagaria
     * metade da obra dele do lado americano do catálogo.
     */
    const duas = regioesDasCidadanias(['Q34266', 'Q30']);
    expect(duas).toEqual(['reg_europa_oriental', 'reg_america_do_norte']);
  });

  it('cidadanias da mesma região não se repetem', () => {
    /** Império Austríaco e Áustria são a mesma região, e contam uma vez. */
    expect(regioesDasCidadanias(['Q131964', 'Q40', 'Q28513'])).toEqual(['reg_europa_ocidental']);
  });

  it('Estado desconhecido NÃO vira gaveta de "outros"', () => {
    /**
     * Inventar uma categoria para o que não se sabe encheria o filtro de um
     * rótulo que não significa lugar nenhum. Quem não tem região simplesmente
     * não participa deste recorte, e aparece em todos os demais.
     */
    expect(regioesDasCidadanias(['Q999999999'])).toEqual([]);
    expect(estadosNaoMapeados(['Q999999999', 'Q183'])).toEqual(['Q999999999']);
  });

  it('🔴 o mapa devolve ID de região, e não slug', () => {
    /**
     * Saindo com slug, a mesma região aparecia DUAS vezes na faceta —
     * "europa-ocidental (145)" do acervo externo e "Europa Ocidental (11)" do
     * repertório próprio, que já usava id. Uma ficava sem rótulo.
     */
    for (const r of Object.values(REGIAO_DO_ESTADO)) {
      expect(r.startsWith('reg_'), `"${r}" não é id de região`).toBe(true);
    }
  });
});

describe('a região chega ao acervo de verdade', () => {
  it('o seed traz cidadania para a quase totalidade dos compositores', () => {
    /**
     * NÃO-VACUIDADE. O mapa pode continuar correto e o seed vir sem nenhuma
     * cidadania: as funções passariam, e a região das vinte e cinco mil obras
     * seria vazia em silêncio.
     */
    const total = COMPOSITORES_EXTERNOS.length;
    const com = COMPOSITORES_EXTERNOS.filter((c) => c.cidadanias.length > 0).length;

    expect(total, 'o seed externo ficou vazio').toBeGreaterThan(200);
    expect(com / total, 'a cidadania despencou no seed').toBeGreaterThan(0.9);
  });

  it('o compositor recebe região, e ela alcança o piso', () => {
    const todos = todosOsCompositores();
    const com = todos.filter((c) => c.regionIds.length > 0).length;

    expect(todos.length).toBeGreaterThan(200);
    expect(com / todos.length, 'região é eixo universal e caiu abaixo do piso').toBeGreaterThan(0.9);
  });

  it('o BRASIL deixou de ser uma região vazia', () => {
    /**
     * O Brasil aparecia com zero em todas as eras — não porque não haja
     * repertório, mas porque ninguém apurava a região. São quatro compositores
     * do acervo externo, e é o piso a partir do qual a Música Brasilis entra.
     */
    const brasileiros = todosOsCompositores().filter((c) => c.regionIds.includes('reg_brasil'));
    expect(brasileiros.length).toBeGreaterThan(0);
  });

  it('🔴 o local de nascimento é DECLARADO por fonte, e não fingido no todo', () => {
    /**
     * ESTE CASO EXIGIA 90% DO ACERVO INTEIRO, E DEIXOU DE PODER EXIGIR.
     *
     * Enquanto o catálogo tinha 225 compositores, todos vindos de Open Opus
     * cruzado com Wikidata, o campo chegava a 96%. Com os 783 compositores de
     * Música Brasilis o acervo quadruplicou, e a fonte brasileira **não
     * publica local de nascimento** — nem na listagem, nem na página de cada
     * compositor, que traz biografia e mais nada. A cobertura caiu para 22%.
     *
     * Há duas saídas erradas e uma certa. Errado seria baixar o piso e seguir
     * como se nada tivesse mudado; errado também seria preencher com o que
     * "deve ser" — a fonte cataloga música brasileira, e supor que todo
     * catalogado nasceu no Brasil inventaria a biografia de italianos que
     * compuseram aqui.
     *
     * O certo é o que a regra da dignidade do filtro já diz: **eixo universal
     * cobra piso, eixo seletivo declara cobertura**. `birthPlace` nunca foi
     * filtro — é texto de ficha, "nasceu em Eisenach" — e quem é filtro aqui é
     * `regionIds`, que continua acima de 90% porque a cidadania brasileira é
     * declarada para todos os 783.
     *
     * Então o que se cobra é o que se pode cobrar: que o campo **não regrida
     * onde a fonte o tem**, e que ele fique vazio onde a fonte não o tem, em
     * vez de ser preenchido por suposição.
     */
    const todos = todosOsCompositores();
    const com = todos.filter((c) => c.birthPlace);

    /** Não-vacuidade: o campo não pode simplesmente ter sumido. */
    expect(com.length, 'o local de nascimento desapareceu do acervo').toBeGreaterThan(200);

    /**
     * Onde a Wikidata cobre — o recorte ocidental —, a cobertura continua
     * quase total. É a medida que o piso original queria proteger.
     */
    /**
     * O recorte é pelo MÉTODO DE RESOLUÇÃO, e não pelo identificador.
     *
     * Classificar por `externalIds.musicaBrasilis` punha do lado ocidental os
     * 28 brasileiros que só aparecem assinando partitura e não têm página
     * própria na fonte — eles saem com identificadores vazios. O método de
     * resolução diz qual catalogação trouxe cada registro, que é a pergunta.
     */
    const ocidentais = todos.filter((c) => c.resolution.method !== 'MUSICA_BRASILIS');
    const comOcidental = ocidentais.filter((c) => c.birthPlace).length;

    expect(ocidentais.length, 'o recorte ocidental sumiu').toBeGreaterThan(200);
    expect(
      comOcidental / ocidentais.length,
      'o local de nascimento regrediu onde a fonte o publica'
    ).toBeGreaterThan(0.9);

    /**
     * E onde a fonte não publica, fica vazio — e não preenchido por dedução a
     * partir da região.
     */
    const brasileiros = todos.filter((c) => c.resolution.method === 'MUSICA_BRASILIS');
    const inventados = brasileiros.filter(
      (c) => c.birthPlace && !c.provenance.some((p) => p.field === 'birthPlace')
    );

    expect(brasileiros.length, 'o corpus brasileiro sumiu').toBeGreaterThan(700);
    expect(
      inventados.map((c) => c.canonicalName),
      'apareceu local de nascimento sem fonte que o declare'
    ).toEqual([]);
  });
});

describe('a faceta declara quanto do acervo alcança', () => {
  const itens = [
    { a: 'x', lista: ['p', 'q'] },
    { a: 'y', lista: ['p'] },
    { a: undefined, lista: [] },
    { a: 'x', lista: [] },
  ];

  it('conta quantos TÊM o campo, e não quantos valores há', () => {
    const c = contar(itens, (i) => i.a);
    expect(c.comCampo).toBe(3);
    expect(c.total).toBe(4);
    expect(c.porValor.get('x')).toBe(2);
  });

  it('num campo de lista, o item com dois valores conta UMA vez na cobertura', () => {
    /**
     * A soma das opções é 3 — `p` duas vezes e `q` uma —, e os itens com
     * instrumentação são 2. Somar daria 75% de cobertura sobre um acervo em
     * que metade não tem o campo.
     */
    const c = contarLista(itens, (i) => i.lista);
    expect(c.porValor.get('p')).toBe(2);
    expect(c.comCampo).toBe(2);
    expect(c.total).toBe(4);
  });

  it('a fração é a dos itens com campo, e a frase diz o número', () => {
    const f = montarFaceta('a', 'Eixo', 'ajuda', contar(itens, (i) => i.a));
    expect(fracaoCoberta(f)).toBeCloseTo(0.75);
    expect(descreverCobertura(f, 'obras')).toContain('75%');
    expect(descreverCobertura(f, 'obras')).toContain('obras');
  });

  it('eixo que alcança tudo NÃO escreve frase nenhuma', () => {
    /**
     * "100% das obras têm este dado" é ruído, e ruído repetido ensina a não
     * ler os avisos que importam.
     */
    const cheio = [{ a: 'x' }, { a: 'y' }];
    const f = montarFaceta('a', 'Eixo', 'ajuda', contar(cheio, (i) => i.a));
    expect(descreverCobertura(f)).toBeNull();
  });

  it('universal e seletivo dizem coisas DIFERENTES sobre a mesma fração', () => {
    /**
     * Cobertura baixa num eixo universal é lacuna de apuração; num eixo
     * seletivo é a realidade do acervo. Dizer a mesma frase nos dois casos
     * faria o aluno cobrar dado que não existe, ou aceitar buraco que existe.
     */
    const universal = montarFaceta('a', 'E', 'aj', contar(itens, (i) => i.a), undefined, undefined, true);
    const seletivo = montarFaceta('a', 'E', 'aj', contar(itens, (i) => i.a));

    expect(descreverCobertura(universal)).toContain('apuração');
    expect(descreverCobertura(seletivo)).not.toContain('apuração');
  });

  it('só o eixo UNIVERSAL cai abaixo do piso', () => {
    const universal = montarFaceta('a', 'E', 'aj', contar(itens, (i) => i.a), undefined, undefined, true);
    const seletivo = montarFaceta('a', 'E', 'aj', contar(itens, (i) => i.a));

    expect(abaixoDoPiso(universal)).toBe(true);
    /** Exigir 90% de "movimento estético" levaria a inventar filiação. */
    expect(abaixoDoPiso(seletivo)).toBe(false);
  });

  it('separar os níveis de meio NÃO herda a cobertura do conjunto', () => {
    /**
     * Copiar `comCampo` para os dois lados faria o nível exato declarar que
     * alcança o acervo todo, quando ele alcança só o que tem edição.
     */
    const obras = [
      { i: ['teclado'] },
      { i: ['teclado'] },
      { i: ['Piano', 'teclado'] },
      { i: ['vocal'] },
    ];
    const [amplo, exato] = separarPorNivel(contarLista(obras, (o) => o.i));

    expect(amplo.comCampo).toBe(4);
    expect(exato.comCampo).toBe(1);
    expect(exato.total).toBe(4);
  });
});

describe('a matriz de completude, sobre o acervo servido', () => {
  it('era e compositor alcançam o piso nas obras servidas', () => {
    const obras = JSON.parse(readFileSync('src/data/acervo/obras.json', 'utf-8')) as Array<{
      e?: string;
      c?: string;
    }>;

    expect(obras.length, 'o acervo servido ficou vazio').toBeGreaterThan(20000);
    expect(obras.filter((o) => o.e).length / obras.length).toBeGreaterThan(0.9);
    expect(obras.filter((o) => o.c).length / obras.length).toBeGreaterThan(0.9);
  });

  it('nenhum identificador de obra se repete', () => {
    /**
     * Duzentas e cinquenta e cinco obras sumiam em silêncio na geração: o
     * `Map.set` deixava a última entrada vencer, e a contagem do catálogo
     * afirmava um número que o arquivo não tinha.
     */
    const obras = JSON.parse(readFileSync('src/data/acervo/obras.json', 'utf-8')) as Array<{
      id: string;
    }>;
    expect(new Set(obras.map((o) => o.id)).size).toBe(obras.length);
  });
});
