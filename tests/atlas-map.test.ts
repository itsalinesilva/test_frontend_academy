import { describe, it, expect } from 'vitest';
import {
  AtlasMarker,
  EraDoMapa,
  MusicalMovement,
  RegiaoDoMapa,
  disponibilidadeDoCompositor,
  erasEmOrdem,
  marcadoresDaPosicao,
  navegarNoTempo,
  regioesDaEra,
  resumoDaVista,
} from '../src/domain/atlas-map';
import { CanonicalComposer, CanonicalWork, avaliarDominioPublico } from '../src/domain/music-knowledge';

/**
 * O MAPA QUE ANDA NO TEMPO.
 *
 * O eixo horizontal é cronológico, e andar nele troca a era. A cada passo as
 * regiões **se repovoam**: nem toda região tem presença em toda era, e é a
 * própria região que declara em quais tem.
 *
 * O que estes casos protegem, acima de tudo, é a honestidade do marcador. Um
 * mapa cheio de pontos bonitos em que metade não abre nada é pior que um mapa
 * com menos pontos: ensina a desconfiar de todos.
 */

const ERAS: EraDoMapa[] = [
  { id: 'era_medieval', name: 'Idade Média', order: 2 },
  { id: 'era_barroco', name: 'Barroco', order: 4 },
  { id: 'era_renascimento', name: 'Renascimento', order: 3 },
  { id: 'era_antiguidade', name: 'Antiguidade', order: 1 },
];

const REGIOES: RegiaoDoMapa[] = [
  {
    id: 'reg_europa_ocidental',
    name: 'Europa Ocidental',
    eraIds: ['era_antiguidade', 'era_medieval', 'era_renascimento', 'era_barroco'],
  },
  { id: 'reg_brasil', name: 'Brasil', eraIds: ['era_barroco'] },
];

const EM_2026 = new Date('2026-06-15T12:00:00.000Z');

const compositor = (over: Partial<CanonicalComposer>): CanonicalComposer => ({
  id: 'c',
  canonicalName: 'Nome',
  sortName: 'Nome',
  periodIds: ['era_barroco'],
  movements: [],
  regionIds: ['reg_europa_ocidental'],
  externalIds: {},
  workIds: [],
  provenance: [],
  publicDomain: avaliarDominioPublico({ anoDeMorte: 1750, hoje: EM_2026 }),
  resolution: { method: 'MANUAL_CURATION', resolvedAt: '2026-01-01T00:00:00.000Z', confidence: 1 },
  ...over,
});

const obra = (over: Partial<CanonicalWork>): CanonicalWork => ({
  id: 'w',
  canonicalTitle: { pt: 'Obra' },
  composerIds: ['c'],
  instrumentation: [],
  movements: [],
  scoreRefs: [],
  recordingRefs: [],
  externalIds: {},
  provenance: [],
  publicDomain: avaliarDominioPublico({ anoDeMorte: 1750, hoje: EM_2026 }),
  resolution: { method: 'MANUAL_CURATION', resolvedAt: '2026-01-01T00:00:00.000Z', confidence: 1 },
  periodId: 'era_barroco',
  regionId: 'reg_europa_ocidental',
  ...over,
});

const COM_EDICAO: CanonicalWork['scoreRefs'] = [
  { source: 'MANUAL_CURATION', sourceRef: 'nossa', format: 'musicxml', render: 'NATIVA' },
];

describe('o eixo do tempo', () => {
  it('ordena por posição cronológica, e não pela ordem do arquivo', () => {
    expect(erasEmOrdem(ERAS).map((e) => e.id)).toEqual([
      'era_antiguidade',
      'era_medieval',
      'era_renascimento',
      'era_barroco',
    ]);
  });

  it('andar para frente e para trás percorre a linha', () => {
    expect(navegarNoTempo(ERAS, 'era_medieval', 'DEPOIS')).toBe('era_renascimento');
    expect(navegarNoTempo(ERAS, 'era_medieval', 'ANTES')).toBe('era_antiguidade');
  });

  it('NAS PONTAS DEVOLVE NULO, e não a mesma era', () => {
    /**
     * Devolver a era atual faria a seta parecer funcionar e não levar a lugar
     * nenhum — um botão morto, que é o defeito mais caro da plataforma. `null`
     * permite desabilitar a seta.
     */
    expect(navegarNoTempo(ERAS, 'era_antiguidade', 'ANTES')).toBeNull();
    expect(navegarNoTempo(ERAS, 'era_barroco', 'DEPOIS')).toBeNull();
  });

  it('era desconhecida não navega para lugar nenhum', () => {
    expect(navegarNoTempo(ERAS, 'era_que_nao_existe', 'DEPOIS')).toBeNull();
  });
});

describe('as regiões se repovoam a cada era', () => {
  it('só aparece a região que declara presença naquela era', () => {
    expect(regioesDaEra(REGIOES, 'era_barroco').map((r) => r.id)).toEqual([
      'reg_europa_ocidental',
      'reg_brasil',
    ]);
  });

  it('O BRASIL NÃO APARECE NA ANTIGUIDADE — e isso é o fato, não lacuna', () => {
    /**
     * Mostrar todas as regiões sempre, com as vazias apagadas, sugeriria que
     * falta conteúdo onde não falta. Não há música brasileira da Antiguidade
     * a catalogar.
     */
    expect(regioesDaEra(REGIOES, 'era_antiguidade').map((r) => r.id)).toEqual([
      'reg_europa_ocidental',
    ]);
  });
});

describe('os marcadores da posição', () => {
  const BACH = compositor({ id: 'bach', canonicalName: 'Bach', birthYear: 1685, deathYear: 1750 });
  const MOV: MusicalMovement = {
    id: 'mov_contraponto',
    slug: 'contraponto-tardio',
    name: 'Contraponto tardio',
    description: '',
    eraId: 'era_barroco',
    regionIds: ['reg_europa_ocidental'],
    founderComposerIds: ['bach'],
    generoIds: ['fuga'],
    years: '1700–1750',
  };

  const acervo = (over: Partial<Parameters<typeof marcadoresDaPosicao>[1]> = {}) => ({
    compositores: [BACH],
    obras: [obra({ id: 'w1', composerIds: ['bach'] })],
    movimentos: [MOV],
    ...over,
  });

  it('a era filtra: compositor de outra era não aparece', () => {
    const fora = compositor({ id: 'outro', periodIds: ['era_medieval'] });
    const m = marcadoresDaPosicao(
      { eraId: 'era_barroco' },
      acervo({ compositores: [BACH, fora] })
    );

    expect(m.filter((x) => x.kind === 'COMPOSITOR').map((x) => x.id)).toEqual(['bach']);
  });

  it('a região filtra dentro da era', () => {
    const brasileiro = compositor({ id: 'br', regionIds: ['reg_brasil'] });
    const m = marcadoresDaPosicao(
      { eraId: 'era_barroco', regionId: 'reg_brasil' },
      acervo({ compositores: [BACH, brasileiro], obras: [] })
    );

    expect(m.filter((x) => x.kind === 'COMPOSITOR').map((x) => x.id)).toEqual(['br']);
  });

  it('o marcador de movimento aparece junto dos demais', () => {
    const m = marcadoresDaPosicao({ eraId: 'era_barroco' }, acervo());
    expect(m.find((x) => x.kind === 'MOVIMENTO')?.titulo).toBe('Contraponto tardio');
  });

  it('FILTRAR POR MOVIMENTO MOSTRA OS FUNDADORES, e não todo mundo da era', () => {
    /**
     * A pergunta "quem fez este movimento" é diferente de "quem estava vivo".
     * Listar todos os contemporâneos devolveria o mapa inteiro de novo, e o
     * filtro não teria filtrado nada.
     */
    const contemporaneo = compositor({ id: 'outro_barroco', canonicalName: 'Outro' });
    const m = marcadoresDaPosicao(
      { eraId: 'era_barroco', movimentoId: 'mov_contraponto' },
      acervo({ compositores: [BACH, contemporaneo], obras: [] })
    );

    expect(m.filter((x) => x.kind === 'COMPOSITOR').map((x) => x.id)).toEqual(['bach']);
  });

  it('dentro de um movimento, ele não aparece como marcador de si mesmo', () => {
    // Seria um marcador que leva ao lugar onde a pessoa já está.
    const m = marcadoresDaPosicao(
      { eraId: 'era_barroco', movimentoId: 'mov_contraponto' },
      acervo()
    );

    expect(m.some((x) => x.kind === 'MOVIMENTO')).toBe(false);
  });

  it('o gênero filtra as obras', () => {
    const m = marcadoresDaPosicao(
      { eraId: 'era_barroco', generoId: 'fuga' },
      acervo({
        obras: [
          obra({ id: 'w_fuga', generoId: 'fuga' }),
          obra({ id: 'w_missa', generoId: 'missa' }),
        ],
      })
    );

    expect(m.filter((x) => x.kind === 'OBRA').map((x) => x.id)).toEqual(['w_fuga']);
  });

  it('focar um compositor reduz a vista a ele e às obras dele', () => {
    const outro = compositor({ id: 'outro' });
    const m = marcadoresDaPosicao(
      { eraId: 'era_barroco', composerId: 'bach' },
      acervo({
        compositores: [BACH, outro],
        obras: [obra({ id: 'w1', composerIds: ['bach'] }), obra({ id: 'w2', composerIds: ['outro'] })],
      })
    );

    expect(m.filter((x) => x.kind === 'COMPOSITOR').map((x) => x.id)).toEqual(['bach']);
    expect(m.filter((x) => x.kind === 'OBRA').map((x) => x.id)).toEqual(['w1']);
  });

  it('o marcador de compositor conta o compêndio dele', () => {
    const m = marcadoresDaPosicao(
      { eraId: 'era_barroco' },
      acervo({
        obras: [obra({ id: 'a', composerIds: ['bach'] }), obra({ id: 'b', composerIds: ['bach'] })],
      })
    );

    expect(m.find((x) => x.kind === 'COMPOSITOR')?.contagem).toBe(2);
  });

  it('o marcador de obra não conta nada — devolve nulo, e não zero', () => {
    /**
     * Zero seria afirmar uma contagem que ninguém fez. Uma obra não reúne
     * obras.
     *
     * A posição precisa ter foco para as obras entrarem — ver o caso abaixo.
     */
    const m = marcadoresDaPosicao({ eraId: 'era_barroco', composerId: 'bach' }, acervo());
    expect(m.find((x) => x.kind === 'OBRA')?.contagem).toBeNull();
  });

  it('🔴 SEM FOCO, o mapa mostra compositores e movimentos — e não obras', () => {
    /**
     * O mapa emitia toda obra da era como marcador. No Romantismo isso dá nove
     * mil duzentos e quarenta e cinco pontos, e um mapa com nove mil pontos não
     * é um mapa: é uma lista desenhada sobre uma imagem.
     *
     * Nada se perde — o compêndio de cada compositor vem na contagem do
     * marcador dele.
     */
    const semFoco = marcadoresDaPosicao(
      { eraId: 'era_barroco' },
      acervo({
        obras: [
          obra({ id: 'w1', composerIds: ['bach'] }),
          obra({ id: 'w2', composerIds: ['bach'] }),
        ],
      })
    );

    expect(semFoco.filter((x) => x.kind === 'OBRA')).toEqual([]);
    expect(semFoco.some((x) => x.kind === 'COMPOSITOR')).toBe(true);
    /** A contagem continua dizendo quantas há — nada se perde ao agregar. */
    expect(semFoco.find((x) => x.kind === 'COMPOSITOR')?.contagem).toBe(2);
  });

  it('a REGIÃO sozinha não abre as obras — ela ainda é "onde"', () => {
    const m = marcadoresDaPosicao(
      { eraId: 'era_barroco', regionId: 'reg_europa_ocidental' },
      acervo({ obras: [obra({ id: 'w1' })] })
    );
    expect(m.filter((x) => x.kind === 'OBRA')).toEqual([]);
  });

  it('escolher O QUE olhar abre as obras', () => {
    /** Compositor, movimento ou gênero — os três focos que detalham. */
    for (const foco of [{ composerId: 'bach' }, { generoId: 'fuga' }]) {
      const m = marcadoresDaPosicao(
        { eraId: 'era_barroco', ...foco },
        acervo({ obras: [obra({ id: 'w1', composerIds: ['bach'], generoId: 'fuga' })] })
      );
      expect(m.filter((x) => x.kind === 'OBRA').length, JSON.stringify(foco)).toBe(1);
    }
  });

  it('acervo vazio devolve mapa vazio — sem marcador inventado', () => {
    const m = marcadoresDaPosicao(
      { eraId: 'era_barroco' },
      { compositores: [], obras: [], movimentos: [] }
    );
    expect(m).toEqual([]);
  });
});

describe('cada marcador diz o que se pode fazer com ele', () => {
  it('compositor COM obra tocável: experiência', () => {
    const bach = compositor({ id: 'bach' });
    const d = disponibilidadeDoCompositor(bach, [
      obra({ id: 'w1', composerIds: ['bach'], scoreRefs: COM_EDICAO }),
    ]);

    expect(d.modo).toBe('EXPERIENCIA_COMPLETA');
  });

  it('compositor SEM obra tocável: apenas pontuado, com o motivo', () => {
    const bach = compositor({ id: 'bach' });
    const d = disponibilidadeDoCompositor(bach, [obra({ id: 'w1', composerIds: ['bach'] })]);

    expect(d.modo).toBe('SOMENTE_CATALOGO');
    expect(d.motivo).toContain('nenhuma com edição livre');
  });

  it('compositor sem obra nenhuma diz exatamente isso', () => {
    /**
     * Distinguir "não tem obra catalogada" de "tem e nenhuma toca" importa:
     * a primeira é trabalho nosso a fazer, a segunda pode ser a lei.
     */
    const d = disponibilidadeDoCompositor(compositor({ id: 'x' }), []);

    expect(d.modo).toBe('SOMENTE_CATALOGO');
    expect(d.motivo).toContain('Nenhuma obra');
  });

  it('compositor protegido leva o link oficial junto', () => {
    const vivo = compositor({
      id: 'vivo',
      deathYear: 1990,
      externalIds: { imslp: 'Obra_(Autor)' },
      publicDomain: avaliarDominioPublico({ anoDeMorte: 1990, hoje: EM_2026 }),
    });

    expect(disponibilidadeDoCompositor(vivo, []).linkOficial?.rotulo).toBe('IMSLP');
  });

  it('OBRA PROTEGIDA APARECE NO MAPA — pontuada, e não escondida', () => {
    /**
     * O acervo é acadêmico e registra a existência. O aluno de história
     * precisa ver que a obra existe naquela era e região, mesmo sem poder
     * ouvi-la aqui.
     */
    const m = marcadoresDaPosicao(
      /** Com foco: sem ele o mapa agrega, e a obra vem contada no compositor. */
      { eraId: 'era_barroco', generoId: 'fuga' },
      {
        compositores: [],
        obras: [
          obra({
            id: 'protegida',
            generoId: 'fuga',
            publicDomain: avaliarDominioPublico({ anoDeMorte: 1990, hoje: EM_2026 }),
            externalIds: { imslp: 'X' },
          }),
        ],
        movimentos: [],
      }
    );

    expect(m).toHaveLength(1);
    expect(m[0].disponibilidade.modo).toBe('SOMENTE_CATALOGO');
    expect(m[0].disponibilidade.motivo).toContain('protegida');
    expect(m[0].disponibilidade.linkOficial).toBeDefined();
  });
});

describe('a legenda diz a verdade sobre o mapa', () => {
  const marcador = (modo: 'EXPERIENCIA_COMPLETA' | 'SOMENTE_CATALOGO', comLink = false): AtlasMarker => ({
    id: 'x',
    kind: 'OBRA',
    titulo: 'x',
    eraId: 'era_barroco',
    movimentoIds: [],
    generoIds: [],
    contagem: null,
    disponibilidade: {
      modo,
      motivo: 'motivo escrito para a pessoa',
      linkOficial: comLink ? { rotulo: 'IMSLP', url: 'https://imslp.org/wiki/X' } : undefined,
    },
  });

  it('conta os três estados separadamente', () => {
    const r = resumoDaVista([
      marcador('EXPERIENCIA_COMPLETA'),
      marcador('SOMENTE_CATALOGO', true),
      marcador('SOMENTE_CATALOGO', false),
    ]);

    expect(r).toEqual({ total: 3, comExperiencia: 1, apenasPontuados: 2, comFonteOficial: 1 });
  });

  it('mapa vazio conta zero em tudo, sem dividir por nada', () => {
    expect(resumoDaVista([])).toEqual({
      total: 0,
      comExperiencia: 0,
      apenasPontuados: 0,
      comFonteOficial: 0,
    });
  });
});
