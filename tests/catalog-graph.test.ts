import { describe, it, expect } from 'vitest';
import {
  PAPEIS,
  PAPEL_POR_ID,
  INSTRUMENTOS,
  VOZES,
  instrumentosDaFamilia,
  resolverInstrumento,
  resolverVoz,
} from '../src/domain/catalog-vocabulary';
import {
  AtuacaoMusical,
  Pessoa,
  atuacaoIncompleta,
  ehAutora,
  instrumentosDe,
  temPapel,
  vozesDe,
} from '../src/domain/catalog-person';
import { Obra, pessoasDaObra, pessoasNoPapel, tessiturasDaObra, termosDeBuscaDaObra } from '../src/domain/catalog-work';
import {
  Partitura,
  atribuicaoCumprida,
  ehSimbolico,
  podeCriarEntidadeCanonica,
  serveParaPratica,
} from '../src/domain/catalog-resource';
import {
  buscar,
  indexarObra,
  indexarPessoa,
  indexarVocabularios,
  inversaDe,
} from '../src/domain/catalog-graph';

/**
 * O CATÁLOGO COMO GRAFO — e as três regras que ele existe para impor.
 *
 * 1. **Uma pessoa não é o seu papel.** Bach é compositor, organista e cravista;
 *    um barítono é uma pessoa com papel de intérprete vocal, e não "um
 *    compositor que tem voz". O tipo `CanonicalComposer` decidia quem podia
 *    existir: só quem compôs.
 *
 * 2. **Uma partitura não é uma obra.** Da Sonata K. 545 há uma obra e dezenas
 *    de arquivos. Sem `Partitura` como entidade, mil trezentas e trinta e uma
 *    partituras viraram obras — a ausência da entidade força a duplicata.
 *
 * 3. **Fonte externa enriquece, nunca cria.** Criar entidade canônica é ato de
 *    curadoria, e curadoria tem dono e data.
 */

const pessoa = (atuacoes: AtuacaoMusical[]): Pessoa => ({
  id: 'p1',
  nomeCanonico: 'Alguém',
  nomeParaOrdenar: 'Alguém',
  nomesAlternativos: [],
  locaisDeAtuacao: [],
  atuacoes,
  periodIds: [],
  regionIds: [],
  movimentos: [],
  externalIds: {},
  provenance: [],
  publicDomain: { status: 'UNDETERMINED', basis: 'UNKNOWN', jurisdiction: 'BR', assessedAt: '' },
  resolution: { method: 'MANUAL_CURATION', resolvedAt: '', confidence: 1 },
});

const atuar = (papelId: string, extra: Partial<AtuacaoMusical> = {}): AtuacaoMusical => ({
  papelId,
  provenance: [],
  ...extra,
});

describe('uma pessoa tem vários papéis, e nenhum deles é o tipo dela', () => {
  it('Bach é compositor E organista E cravista, ao mesmo tempo', () => {
    const bach = pessoa([
      atuar('papel_compositor'),
      atuar('papel_instrumentista', { instrumentoId: 'inst_orgao' }),
      atuar('papel_instrumentista', { instrumentoId: 'inst_cravo' }),
    ]);

    expect(temPapel(bach, 'papel_compositor')).toBe(true);
    expect(temPapel(bach, 'papel_instrumentista')).toBe(true);
    expect(instrumentosDe(bach)).toEqual(['inst_orgao', 'inst_cravo']);
  });

  it('🔴 um BARÍTONO existe sem ter composto nada', () => {
    /**
     * É o caso que o modelo antigo não comportava. `CanonicalComposer` exigia
     * autoria para entrar no acervo, e a tessitura não tinha onde ser guardada:
     * um cantor virava "um compositor que tem uma voz".
     */
    const cantor = pessoa([atuar('papel_cantor', { voz: 'BARITONO' })]);

    expect(ehAutora(cantor)).toBe(false);
    expect(vozesDe(cantor)).toEqual(['BARITONO']);
    expect(temPapel(cantor, 'papel_compositor')).toBe(false);
  });

  it('quem canta em duas tessituras aparece nas duas', () => {
    const p = pessoa([
      atuar('papel_cantor', { voz: 'TENOR' }),
      atuar('papel_cantor', { voz: 'BARITONO' }),
    ]);
    expect(vozesDe(p)).toEqual(['TENOR', 'BARITONO']);
  });

  it('a ficha sabe dizer o que falta a uma atuação', () => {
    /**
     * Cantor sem tessitura e instrumentista sem instrumento são fichas pela
     * metade — e a metade que falta é justamente a que o aluno usa para
     * procurar. A ficha precisa cobrar, e não silenciar.
     */
    expect(atuacaoIncompleta(atuar('papel_cantor'))).toBe('VOZ');
    expect(atuacaoIncompleta(atuar('papel_instrumentista'))).toBe('INSTRUMENTO');
    expect(atuacaoIncompleta(atuar('papel_cantor', { voz: 'SOPRANO' }))).toBeNull();
    /** Compositor não exige nem um nem outro. */
    expect(atuacaoIncompleta(atuar('papel_compositor'))).toBeNull();
  });

  it('todo papel que EXIGE algo aponta para um vocabulário que existe', () => {
    expect(PAPEIS.length).toBeGreaterThan(10);
    for (const p of PAPEIS) {
      if (p.exige === 'INSTRUMENTO') expect(INSTRUMENTOS.length).toBeGreaterThan(0);
      if (p.exige === 'VOZ') expect(VOZES.length).toBeGreaterThan(0);
      expect(PAPEL_POR_ID.get(p.id)).toBe(p);
    }
  });
});

describe('o vocabulário é controlado, e não cresce sozinho', () => {
  it('as grafias de várias fontes chegam ao MESMO instrumento', () => {
    /**
     * `Violin` do Mutopia, `violino` do Wikidata e `Violine` de uma edição
     * alemã. Sem o índice de sinônimos, cada fonte inventa um instrumento e o
     * filtro de cordas perde dois terços do que deveria achar.
     */
    for (const g of ['Violin', 'violino', 'Violine', 'geige', 'VIOLINO']) {
      expect(resolverInstrumento(g), g).toBe('inst_violino');
    }
    expect(resolverInstrumento('Guitar')).toBe('inst_violao');
    expect(resolverInstrumento('harpsichord')).toBe('inst_cravo');
  });

  it('grafia desconhecida devolve NADA, e não cria termo novo', () => {
    /**
     * Vocabulário que cresce sozinho deixa de ser vocabulário: em um mês há
     * `Violin`, `violin` e `Violino` como três instrumentos distintos.
     */
    expect(resolverInstrumento('teremin de bolso')).toBeUndefined();
  });

  it('a família responde "o que há de cordas"', () => {
    const cordas = instrumentosDaFamilia('CORDAS').map((i) => i.id);
    expect(cordas).toContain('inst_violino');
    expect(cordas).toContain('inst_violoncelo');
    expect(cordas).not.toContain('inst_piano');
    expect(cordas.length).toBeGreaterThan(4);
  });

  it('a tessitura resolve em português e nas línguas das fontes', () => {
    expect(resolverVoz('baritone')).toBe('BARITONO');
    expect(resolverVoz('Barítono')).toBe('BARITONO');
    expect(resolverVoz('bass')).toBe('BAIXO');
    expect(resolverVoz('alto')).toBe('CONTRALTO');
    expect(resolverVoz('vocalista')).toBeUndefined();
  });
});

describe('a obra guarda contribuição por papel, e não uma lista de compositores', () => {
  const opera: Obra = {
    id: 'o1',
    tituloCanonico: { pt: 'A ópera' },
    titulosAlternativos: ['Die Oper'],
    contribuicoes: [
      { pessoaId: 'p_compositor', papelId: 'papel_compositor', provenance: [] },
      { pessoaId: 'p_libretista', papelId: 'papel_libretista', provenance: [] },
    ],
    numeroDeCatalogo: 'BWV 1041',
    movimentosEsteticos: [],
    instrumentacao: [],
    partesVocais: [
      { voz: 'SOPRANO', funcao: 'PRINCIPAL' },
      { voz: 'BARITONO', funcao: 'PRINCIPAL' },
      { voz: 'SOPRANO', funcao: 'CORO' },
    ],
    movimentos: [],
    externalIds: {},
    provenance: [],
    publicDomain: { status: 'PUBLIC_DOMAIN', basis: 'UNKNOWN', jurisdiction: 'BR', assessedAt: '' },
    resolution: { method: 'MANUAL_CURATION', resolvedAt: '', confidence: 1 },
  };

  it('o libretista não é atribuído ao compositor', () => {
    /**
     * `composerIds: EntityId[]` achatava os dois. Uma ópera tem compositor E
     * libretista, e pôr os dois na mesma lista atribui ao compositor o
     * trabalho de outra pessoa.
     */
    expect(pessoasNoPapel(opera, 'papel_compositor')).toEqual(['p_compositor']);
    expect(pessoasNoPapel(opera, 'papel_libretista')).toEqual(['p_libretista']);
    expect(pessoasDaObra(opera)).toHaveLength(2);
  });

  it('a obra responde "o que há para barítono"', () => {
    expect(tessiturasDaObra(opera)).toEqual(['SOPRANO', 'BARITONO']);
  });

  it('o número de catálogo é pesquisável', () => {
    /** Quem digita `BWV 1041` quer a obra, e não quarenta que citam Bach. */
    expect(termosDeBuscaDaObra(opera)).toContain('BWV 1041');
    expect(termosDeBuscaDaObra(opera)).toContain('Die Oper');
  });
});

describe('🔴 uma partitura NÃO é uma obra', () => {
  const partitura = (p: Partial<Partitura> = {}): Partitura => ({
    id: 's1',
    tituloNaFonte: 'Prelude',
    formato: 'LILYPOND',
    capacidade: 'SOMENTE_REFERENCIA',
    url: 'https://exemplo/x.ly',
    transcritores: [],
    instrumentacao: [],
    fonteId: 'MUTOPIA',
    refDaFonte: '1',
    provenance: [],
    ...p,
  });

  it('a partitura existe SEM obra, e isso é um estado legítimo', () => {
    /**
     * É a garantia que impede a duplicata. Sem ela, a única forma de um arquivo
     * entrar no acervo era virando obra — e mil trezentas e trinta e uma
     * viraram.
     */
    const orfa = partitura();
    expect(orfa.obraId).toBeUndefined();
    expect(serveParaPratica(orfa)).toBe(false);
  });

  it('só serve para prática o arquivo simbólico, renderizável E ligado a obra', () => {
    expect(ehSimbolico('MUSICXML')).toBe(true);
    expect(ehSimbolico('PDF')).toBe(false);

    /** Simbólico mas sem leitor: referência, e não prática. */
    expect(serveParaPratica(partitura({ obraId: 'o1' }))).toBe(false);
    /** Renderizável mas PDF: é página, e não notas. */
    expect(serveParaPratica(partitura({ obraId: 'o1', formato: 'PDF', capacidade: 'RENDERIZAVEL' }))).toBe(false);
    /** Renderizável, simbólico e com obra: serve. */
    expect(serveParaPratica(partitura({ obraId: 'o1', formato: 'MUSICXML', capacidade: 'RENDERIZAVEL' }))).toBe(true);
  });

  it('licença com atribuição sem transcritor NÃO está cumprida', () => {
    /** Exibir arquivo CC-BY sem nomear quem o fez é redistribuir sem licença. */
    expect(atribuicaoCumprida(partitura({ licenca: 'Creative Commons Attribution 4.0' }))).toBe(false);
    expect(
      atribuicaoCumprida(partitura({ licenca: 'Creative Commons Attribution 4.0', transcritores: ['Alguém'] }))
    ).toBe(true);
    /** Domínio público não obriga. */
    expect(atribuicaoCumprida(partitura({ licenca: 'Public Domain' }))).toBe(true);
  });

  it('fonte externa NÃO pode criar entidade canônica', () => {
    expect(podeCriarEntidadeCanonica('FONTE_EXTERNA')).toBe(false);
    expect(podeCriarEntidadeCanonica('CURADORIA')).toBe(true);
  });
});

describe('a busca universal entra por qualquer porta', () => {
  const indice = [
    indexarPessoa(
      { ...pessoa([atuar('papel_compositor')]), id: 'p_mozart', nomeCanonico: 'Wolfgang Amadeus Mozart', anoDeNascimento: 1756 },
      600
    ),
    indexarPessoa(
      {
        ...pessoa([atuar('papel_instrumentista', { instrumentoId: 'inst_violino' })]),
        id: 'p_joachim',
        nomeCanonico: 'Joseph Joachim',
      },
      2
    ),
    indexarObra(
      {
        id: 'o_k545',
        tituloCanonico: { pt: 'Sonata em dó maior' },
        titulosAlternativos: [],
        contribuicoes: [],
        numeroDeCatalogo: 'K. 545',
        movimentosEsteticos: [],
        instrumentacao: [],
        partesVocais: [],
        movimentos: [],
        externalIds: {},
        provenance: [],
        publicDomain: { status: 'PUBLIC_DOMAIN', basis: 'UNKNOWN', jurisdiction: 'BR', assessedAt: '' },
        resolution: { method: 'MANUAL_CURATION', resolvedAt: '', confidence: 1 },
      },
      'Mozart'
    ),
    ...indexarVocabularios(),
  ];

  it('"Mozart" devolve a PESSOA, agrupada por tipo', () => {
    const r = buscar(indice, 'Mozart');
    const pessoas = r.find((g) => g.tipo === 'PESSOA');
    expect(pessoas?.itens[0].rotulo).toContain('Mozart');
  });

  it('"violino" devolve o INSTRUMENTO, e não só obras', () => {
    /**
     * O termo mora em mais de um lugar, e quem procura não sabe em qual filtro
     * ele vive — que é exatamente por que os vocabulários entram no índice.
     */
    const r = buscar(indice, 'violino');
    expect(r.map((g) => g.tipo)).toContain('INSTRUMENTO');
  });

  it('"barítono" devolve a VOZ', () => {
    const r = buscar(indice, 'barítono');
    expect(r.find((g) => g.tipo === 'VOZ')?.itens[0].rotulo).toBe('Barítono');
  });

  it('"K. 545" chega direto à OBRA', () => {
    const r = buscar(indice, 'K. 545');
    expect(r[0].tipo).toBe('OBRA');
    expect(r[0].itens[0].id).toBe('o_k545');
  });

  it('o casamento exato vence o parcial', () => {
    const r = buscar(indice, 'piano');
    expect(r.find((g) => g.tipo === 'INSTRUMENTO')?.itens[0].rotulo).toBe('Piano');
  });

  it('termo de uma letra não busca nada', () => {
    /** Sem isto, `a` devolveria o acervo inteiro e a tela travaria. */
    expect(buscar(indice, 'a')).toEqual([]);
  });

  it('a relação inversa é derivada, e não guardada duas vezes', () => {
    /**
     * Guardar `PROFESSOR_DE` e `ALUNO_DE` separadamente faria as duas
     * divergirem na primeira correção: alguém apaga uma e a ficha passa a
     * afirmar uma linhagem que a outra nega.
     */
    expect(inversaDe('PROFESSOR_DE')).toBe('ALUNO_DE');
    expect(inversaDe('ALUNO_DE')).toBe('PROFESSOR_DE');
    expect(inversaDe('INFLUENCIOU')).toBe('INFLUENCIOU');
  });
});
