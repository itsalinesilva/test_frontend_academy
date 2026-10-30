// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  MusicKnowledgeService,
  idLegivel,
} from '../src/services/application/music-knowledge.service';
import {
  PersistentMusicKnowledgeRepository,
  PRAZO_DO_CACHE_MS,
} from '../src/repositories/music-knowledge.repository';
import { LocalStorageAdapter } from '../src/infrastructure/storage/local-storage';
import {
  ComposerCandidate,
  KnowledgeAdapter,
  KnowledgeSourceError,
  WorkCandidate,
} from '../src/adapters/knowledge/knowledge-source.interface';

/**
 * A RECONCILIAÇÃO, QUE É ONDE O ERRO TEM CONSEQUÊNCIA JURÍDICA.
 *
 * A data de morte decide o domínio público, que decide o que pode ser
 * reproduzido. Reconciliar mal aqui não produz uma tela feia: produz obra
 * protegida tocando numa plataforma pública.
 *
 * Por isso os casos abaixo insistem em duas coisas que parecem paranoia e não
 * são: que a discordância entre fontes seja **registrada** em vez de resolvida
 * no escuro, e que a confiança **caia** quando há disputa. Um registro
 * disputado que se apresenta com confiança total é pior que registro ausente
 * — ele convida a publicar sobre o que ninguém conferiu.
 */

const fonte = (
  nome: string,
  compositores: ComposerCandidate[],
  obras: WorkCandidate[] = []
): KnowledgeAdapter => ({
  source: nome as KnowledgeAdapter['source'],
  disponivel: async () => true,
  buscarCompositores: async () => compositores,
  buscarObrasDoCompositor: async () => obras,
});

const fonteQuebrada = (nome: string): KnowledgeAdapter => ({
  source: nome as KnowledgeAdapter['source'],
  disponivel: async () => false,
  buscarCompositores: async () => {
    throw new KnowledgeSourceError(nome as KnowledgeAdapter['source'], 'fora do ar');
  },
  buscarObrasDoCompositor: async () => {
    throw new KnowledgeSourceError(nome as KnowledgeAdapter['source'], 'fora do ar');
  },
});

const BACH: ComposerCandidate = {
  name: 'Johann Sebastian Bach',
  sortName: 'Bach, Johann Sebastian',
  birthYear: 1685,
  deathYear: 1750,
  externalIds: { wikidata: 'Q1339', imslp: 'Category:Bach' },
  confidence: 1,
};

/**
 * Repositorio SEM semente.
 *
 * O repositorio de producao semeia o acervo proprio ao nascer — senão o
 * catálogo abriria vazio esperando uma ingestão que ninguém disparou. Aqui a
 * prova é sobre a INGESTÃO, e semente entrando no meio confundiria "o serviço
 * criou" com "já estava lá".
 */
const repoLimpo = () => {
  localStorage.clear();
  return new PersistentMusicKnowledgeRepository(new LocalStorageAdapter(), undefined, false);
};

describe('identificador legível e estável', () => {
  it('tira acento e normaliza', () => {
    expect(idLegivel('Bach, Johann Sebastian')).toBe('bach-johann-sebastian');
    expect(idLegivel('Antônio Carlos Gomes')).toBe('antonio-carlos-gomes');
  });

  it('o mesmo nome dá sempre o mesmo id', () => {
    // Id instável duplicaria o compositor a cada ingestão.
    expect(idLegivel('Chopin, Frédéric')).toBe(idLegivel('Chopin, Frédéric'));
  });
});

describe('reconciliação entre fontes', () => {
  const svc = (ads: KnowledgeAdapter[]) => new MusicKnowledgeService(ads, repoLimpo());

  it('sem candidato, devolve nulo — e não um compositor em branco', () => {
    expect(svc([]).reconciliarCompositor([])).toBeNull();
  });

  it('a fonte de maior confiança lidera', () => {
    const fraca = { ...BACH, name: 'J. S. Bach', deathYear: undefined, confidence: 0.4 };
    const c = svc([]).reconciliarCompositor([fraca, BACH]);

    expect(c?.canonicalName).toBe('Johann Sebastian Bach');
    expect(c?.deathYear).toBe(1750);
  });

  it('campo ausente é preenchido por quem o tiver', () => {
    /**
     * O Wikidata pode não ter o local de nascimento e outra fonte ter. Deixar
     * o campo vazio porque a fonte líder não o trouxe seria desperdiçar
     * informação verdadeira.
     */
    const semNascimento = { ...BACH, birthYear: undefined };
    const outra: ComposerCandidate = {
      name: 'Bach',
      birthYear: 1685,
      externalIds: { musicbrainz: 'mb-1' },
      confidence: 0.6,
    };

    const c = svc([]).reconciliarCompositor([semNascimento, outra]);

    expect(c?.birthYear).toBe(1685);
    expect(c?.externalIds.musicbrainz).toBe('mb-1');
    expect(c?.externalIds.wikidata).toBe('Q1339');
  });

  it('DATAS DE MORTE DIFERENTES VIRAM CONFLITO REGISTRADO', () => {
    /**
     * O caso mais perigoso do acervo inteiro. Escolher em silêncio entre 1750
     * e 1751 mudaria o ano de entrada em domínio público — e ninguém saberia
     * que houve escolha.
     */
    const divergente = { ...BACH, deathYear: 1751, confidence: 0.9 };
    const c = svc([]).reconciliarCompositor([BACH, divergente]);

    expect(c?.resolution.conflicts).toBeDefined();
    expect(c?.resolution.conflicts?.[0]).toContain('1750');
    expect(c?.resolution.conflicts?.[0]).toContain('1751');
  });

  it('a confiança CAI quando há conflito', () => {
    const divergente = { ...BACH, deathYear: 1751, confidence: 0.9 };
    const c = svc([]).reconciliarCompositor([BACH, divergente]);

    expect(c?.resolution.confidence).toBeLessThanOrEqual(0.5);
  });

  it('sem conflito, a confiança da fonte líder é preservada', () => {
    expect(svc([]).reconciliarCompositor([BACH])?.resolution.confidence).toBe(1);
  });

  it('o domínio público sai da data de morte reconciliada', () => {
    const c = svc([]).reconciliarCompositor([BACH]);

    expect(c?.publicDomain.status).toBe('PUBLIC_DOMAIN');
    expect(c?.publicDomain.authorDeathYear).toBe(1750);
  });

  it('compositor sem data de morte NÃO nasce liberado', () => {
    const semMorte = { ...BACH, deathYear: undefined, birthYear: undefined };
    expect(svc([]).reconciliarCompositor([semMorte])?.publicDomain.status).toBe('UNDETERMINED');
  });

  it('a proveniência é registrada por campo', () => {
    const c = svc([]).reconciliarCompositor([BACH]);
    expect(c?.provenance.map((p) => p.field)).toContain('deathYear');
  });
});

describe('a obra herda o domínio público DO COMPOSITOR', () => {
  it('obra antiga de compositor recente continua protegida', async () => {
    /**
     * É o compositor que morre, e é da morte dele que o prazo corre. Uma obra
     * de 1890 de alguém que morreu em 1960 continua protegida; avaliar pela
     * data da obra a liberaria por engano.
     */
    const s = new MusicKnowledgeService([], repoLimpo());
    const recente = s.reconciliarCompositor([
      { ...BACH, name: 'Alguém', sortName: 'Alguém', deathYear: 1990 },
    ])!;

    const obra = s.reconciliarObra(
      { titlePt: 'Peça de 1890', date: '1890', externalIds: {}, confidence: 1 },
      recente
    );

    expect(obra.publicDomain.status).toBe('PROTECTED');
  });

  it('obra de compositor antigo é exibível', async () => {
    const s = new MusicKnowledgeService([], repoLimpo());
    const bach = s.reconciliarCompositor([BACH])!;
    const obra = s.reconciliarObra(
      { titlePt: 'Sonata', externalIds: { wikidata: 'Q2' }, confidence: 1 },
      bach
    );

    expect(obra.publicDomain.status).toBe('PUBLIC_DOMAIN');
    expect(obra.composerIds).toEqual([bach.id]);
  });

  it('a obra nasce SEM partitura — a edição vem das fontes que autorizam', () => {
    const s = new MusicKnowledgeService([], repoLimpo());
    const bach = s.reconciliarCompositor([BACH])!;
    const obra = s.reconciliarObra({ titlePt: 'Sonata', externalIds: {}, confidence: 1 }, bach);

    expect(obra.scoreRefs).toEqual([]);
  });
});

describe('ingestão de ponta a ponta', () => {
  let repo: PersistentMusicKnowledgeRepository;
  beforeEach(() => {
    repo = repoLimpo();
  });

  it('grava compositor e obras, e relata o que fez', async () => {
    const svc = new MusicKnowledgeService(
      [fonte('WIKIDATA', [BACH], [{ titlePt: 'Sonata', externalIds: { wikidata: 'Q2' }, confidence: 1 }])],
      repo
    );

    const r = await svc.ingerirCompositor('bach');

    expect(r.compositoresCriados).toBe(1);
    expect(r.obrasCriadas).toBe(1);
    expect((await repo.listarCompositores())[0].canonicalName).toBe('Johann Sebastian Bach');
    expect(await repo.listarObras()).toHaveLength(1);
  });

  it('o compositor guarda os ids das obras que vieram com ele', async () => {
    const svc = new MusicKnowledgeService(
      [fonte('WIKIDATA', [BACH], [{ titlePt: 'Sonata', externalIds: {}, confidence: 1 }])],
      repo
    );
    await svc.ingerirCompositor('bach');

    expect((await repo.listarCompositores())[0].workIds).toHaveLength(1);
  });

  it('INGERIR DUAS VEZES NÃO DUPLICA', async () => {
    /**
     * O mesmo Bach chega pelo Wikidata numa consulta e por outra fonte
     * depois. Sem a busca por identificador externo, cada ingestão criaria um
     * Bach novo — e o Atlas teria três, cada um com um pedaço das obras.
     */
    const svc = new MusicKnowledgeService([fonte('WIKIDATA', [BACH])], repo);

    await svc.ingerirCompositor('bach');
    const segunda = await svc.ingerirCompositor('bach');

    expect(segunda.compositoresAtualizados).toBe(1);
    expect(segunda.compositoresCriados).toBe(0);
    expect(await repo.listarCompositores()).toHaveLength(1);
  });

  it('FONTE FORA DO AR NÃO DERRUBA A INGESTÃO', async () => {
    /**
     * A rede oscila. Perder o trabalho das outras fontes por causa de uma
     * seria transformar instabilidade em perda de acervo.
     */
    const svc = new MusicKnowledgeService(
      [fonteQuebrada('MUSICBRAINZ'), fonte('WIKIDATA', [BACH])],
      repo
    );

    const r = await svc.ingerirCompositor('bach');

    expect(r.compositoresCriados).toBe(1);

    /**
     * DOIS erros, e nao um: a fonte quebrada falha na busca de compositor E na
     * de obras. Cobrar um so esconderia que a segunda chamada tambem falhou —
     * e e essa a que deixaria o compositor sem obra nenhuma.
     */
    expect(r.erros).toHaveLength(2);
    expect(r.erros.every((e) => e.includes('MUSICBRAINZ'))).toBe(true);
  });

  it('todas as fontes fora do ar: nada criado, e o erro dito', async () => {
    const svc = new MusicKnowledgeService([fonteQuebrada('WIKIDATA')], repo);
    const r = await svc.ingerirCompositor('bach');

    expect(r.compositoresCriados).toBe(0);
    expect(r.erros).toHaveLength(1);
    expect(await repo.listarCompositores()).toEqual([]);
  });

  it('o relatório lista o que fica SÓ EM CATÁLOGO, com o motivo — e grava a obra', async () => {
    const protegido = { ...BACH, name: 'Vivo', sortName: 'Vivo', deathYear: 1990 };
    const svc = new MusicKnowledgeService(
      [fonte('WIKIDATA', [protegido], [{ titlePt: 'Peça', externalIds: {}, confidence: 1 }])],
      repo
    );

    const r = await svc.ingerirCompositor('vivo');

    expect(r.somenteCatalogo).toHaveLength(1);
    expect(r.somenteCatalogo[0].motivo).toContain('2060');

    // E a obra FOI gravada: catalogar e oferecer sao eixos diferentes.
    expect(await repo.listarObras()).toHaveLength(1);
  });

  it('conflito entre fontes entra na contagem do relatório', async () => {
    const svc = new MusicKnowledgeService(
      [fonte('WIKIDATA', [BACH]), fonte('MUSICBRAINZ', [{ ...BACH, deathYear: 1751, confidence: 0.9 }])],
      repo
    );

    expect((await svc.ingerirCompositor('bach')).comConflito).toBe(1);
  });
});

describe('cache de fonte externa', () => {
  it('o que foi gravado é lido', async () => {
    const repo = repoLimpo();
    await repo.gravarCache('wikidata:bach', { x: 1 });
    expect(await repo.lerCache('wikidata:bach')).toEqual({ x: 1 });
  });

  it('chave nunca gravada devolve nulo', async () => {
    expect(await repoLimpo().lerCache('nada')).toBeNull();
  });

  it('VENCIDO DEVOLVE NULO, e não o dado velho', async () => {
    /**
     * "Velho porém disponível" obrigaria cada chamador a decidir se aceita, e
     * algum deles esqueceria. `null` é instrução, e não opinião.
     */
    localStorage.clear();
    const curto = new PersistentMusicKnowledgeRepository(new LocalStorageAdapter(), -1);
    await curto.gravarCache('k', { x: 1 });

    expect(await curto.lerCache('k')).toBeNull();
  });

  it('o prazo padrão é longo — data de morte não muda', () => {
    expect(PRAZO_DO_CACHE_MS).toBeGreaterThan(7 * 24 * 60 * 60 * 1000);
  });
});

describe('o filtro do acervo aplica TODOS os campos declarados', () => {
  it('cada recorte devolve só o que bate', async () => {
    /**
     * `AtlasFilter` já teve um campo declarado e nunca aplicado: quem
     * filtrasse por gênero recebia a lista inteira, sem sinal nenhum.
     */
    const repo = repoLimpo();
    const svc = new MusicKnowledgeService([], repo);
    const bach = svc.reconciliarCompositor([BACH])!;

    await repo.salvarObra({
      ...svc.reconciliarObra({ titlePt: 'Missa', genre: 'Missa', externalIds: {}, confidence: 1 }, bach),
      periodId: 'era_barroco',
      regionId: 'reg_europa_ocidental',
    });
    await repo.salvarObra(
      svc.reconciliarObra({ titlePt: 'Fuga', genre: 'Fuga', externalIds: {}, confidence: 1 }, bach)
    );

    expect(await repo.listarObras({ generoId: 'missa' })).toHaveLength(1);
    expect(await repo.listarObras({ periodId: 'era_barroco' })).toHaveLength(1);
    expect(await repo.listarObras({ regionId: 'reg_europa_ocidental' })).toHaveLength(1);
    expect(await repo.listarObras({ composerId: bach.id })).toHaveLength(2);
    expect(await repo.listarObras()).toHaveLength(2);
  });

  it('só com edição nativa: sem partitura, não entra', async () => {
    const repo = repoLimpo();
    const svc = new MusicKnowledgeService([], repo);
    const bach = svc.reconciliarCompositor([BACH])!;

    await repo.salvarObra(
      svc.reconciliarObra({ titlePt: 'Sem edição', externalIds: {}, confidence: 1 }, bach)
    );
    await repo.salvarObra({
      ...svc.reconciliarObra({ titlePt: 'Com edição', externalIds: {}, confidence: 1 }, bach),
      scoreRefs: [{ source: 'MUTOPIA', sourceRef: 'x', format: 'lilypond', render: 'NATIVA' }],
    });

    const comEdicao = await repo.listarObras({ comEdicaoNativa: true });
    expect(comEdicao).toHaveLength(1);
    expect(comEdicao[0].canonicalTitle.pt).toBe('Com edição');
  });
});
