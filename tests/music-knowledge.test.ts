import { describe, it, expect } from 'vitest';
import {
  anoDeEntradaEmDominioPublico,
  avaliarDominioPublico,
  podeExibirObra,
  avaliarDisponibilidade,
  entraNoAcervo,
  linkOficial,
  temEdicaoNativa,
  textoDe,
  CanonicalWork,
} from '../src/domain/music-knowledge';

/**
 * O CÁLCULO QUE DECIDE O QUE PODE SER PUBLICADO.
 *
 * Errar por um ano aqui não produz uma tela feia: produz uma obra protegida
 * sendo reproduzida numa plataforma pública. É a única regra do projeto cujo
 * defeito tem consequência jurídica, e por isso é a que mais precisa de prova.
 *
 * A regra brasileira é **setenta anos a partir de 1º de janeiro do ano
 * seguinte ao da morte** (Lei 9.610/98, art. 41). A contagem é fácil de errar:
 * `morte + 70` liberaria tudo um ano antes.
 *
 * As datas abaixo são fixadas de propósito. Um teste que use `new Date()` de
 * verdade começa a passar ou falhar sozinho na virada do ano, e aí ninguém
 * mais sabe se ele mede alguma coisa.
 */

const EM = (ano: number) => new Date(`${ano}-06-15T12:00:00.000Z`);

describe('o prazo brasileiro, contado do ano seguinte ao da morte', () => {
  it('Bach, morto em 1750, entra em 1821', () => {
    expect(anoDeEntradaEmDominioPublico(1750)).toBe(1821);
  });

  it('NÃO é morte mais setenta — é mais setenta e um', () => {
    /**
     * Quem morreu em 1955 tem proteção até 31/12/2025. A obra entra em
     * domínio público em 01/01/2026. Contar `+70` daria 2025, e liberaria um
     * ano inteiro antes do devido.
     */
    expect(anoDeEntradaEmDominioPublico(1955)).toBe(2026);
    expect(anoDeEntradaEmDominioPublico(1955)).not.toBe(1955 + 70);
  });

  it('o ano da entrada já é livre; o anterior ainda não', () => {
    const noLimite = { anoDeMorte: 1955 };

    expect(avaliarDominioPublico({ ...noLimite, hoje: EM(2025) }).status).toBe('PROTECTED');
    expect(avaliarDominioPublico({ ...noLimite, hoje: EM(2026) }).status).toBe('PUBLIC_DOMAIN');
  });
});

describe('o veredito por origem da informação', () => {
  it('data de morte antiga: domínio público, com o fundamento escrito', () => {
    const a = avaliarDominioPublico({ anoDeMorte: 1750, hoje: EM(2026) });

    expect(a.status).toBe('PUBLIC_DOMAIN');
    expect(a.basis).toBe('AUTHOR_DEATH_PLUS_TERM');
    expect(a.authorDeathYear).toBe(1750);
    expect(a.jurisdiction).toBe('BR');
  });

  it('morte recente: protegida, e a nota diz até quando', () => {
    const a = avaliarDominioPublico({ anoDeMorte: 1990, hoje: EM(2026) });

    expect(a.status).toBe('PROTECTED');
    expect(a.note).toContain('2060');
  });

  it('sem morte e sem licença: INDETERMINADO, e não "provavelmente livre"', () => {
    /**
     * A ausência de informação não é um argumento a favor. Tratar
     * desconhecido como livre é exatamente o erro que o cálculo existe para
     * impedir.
     */
    const a = avaliarDominioPublico({ hoje: EM(2026) });

    expect(a.status).toBe('UNDETERMINED');
    expect(a.basis).toBe('UNKNOWN');
  });

  it('licença declarada pela fonte vale para o ARQUIVO, e é só provável', () => {
    const a = avaliarDominioPublico({
      licencaDeclarada: 'Creative Commons Attribution-ShareAlike 4.0',
      hoje: EM(2026),
    });

    expect(a.status).toBe('LIKELY_PUBLIC_DOMAIN');
    expect(a.basis).toBe('SOURCE_DECLARED_LICENSE');
    expect(a.note).toContain('arquivo');
  });

  it('nascimento muito antigo sem morte registrada: provável, e a conferir', () => {
    const a = avaliarDominioPublico({ anoDeNascimento: 1550, hoje: EM(2026) });

    expect(a.status).toBe('LIKELY_PUBLIC_DOMAIN');
    expect(a.note).toContain('Confirmar');
  });

  it('nascimento recente sem morte registrada NÃO vira provável', () => {
    // Nascido em 1980 e sem data de morte: a pessoa provavelmente está viva.
    expect(avaliarDominioPublico({ anoDeNascimento: 1980, hoje: EM(2026) }).status).toBe(
      'UNDETERMINED'
    );
  });

  it('a data de morte prevalece sobre a licença declarada', () => {
    /**
     * Uma fonte pode declarar licença livre sobre obra protegida, por erro ou
     * por descuido. O cálculo legal é mais forte que a afirmação de terceiro.
     */
    const a = avaliarDominioPublico({
      anoDeMorte: 1990,
      licencaDeclarada: 'Public Domain',
      hoje: EM(2026),
    });

    expect(a.status).toBe('PROTECTED');
  });
});

describe('catalogar e oferecer são eixos diferentes', () => {
  const em = (status: Parameters<typeof podeExibirObra>[0]['status']) => ({
    status,
    basis: 'UNKNOWN' as const,
    jurisdiction: 'BR' as const,
    assessedAt: '2026-01-01T00:00:00.000Z',
  });

  it('TUDO entra no acervo — inclusive o protegido', () => {
    /**
     * O acervo de uma instituição acadêmica registra a existência das obras.
     * Um conservatório que só catalogasse o que pode tocar teria um catálogo
     * mutilado: sem quase nada do século XX. O aluno de história precisa saber
     * que a obra existe, mesmo que a plataforma não possa reproduzi-la.
     *
     * A primeira versão deste domínio tinha `podeListarFicha`, que devolvia
     * `false` para obra protegida — o acervo ESCONDIA o que não podia tocar, e
     * isso confundia registrar com oferecer.
     */
    expect(entraNoAcervo()).toBe(true);
  });

  it('só domínio público certo vira experiência aqui dentro', () => {
    expect(podeExibirObra(em('PUBLIC_DOMAIN'))).toBe(true);
  });

  it('PROVÁVEL não basta para oferecer a experiência', () => {
    expect(podeExibirObra(em('LIKELY_PUBLIC_DOMAIN'))).toBe(false);
  });

  it('indeterminado e protegido não viram experiência', () => {
    expect(podeExibirObra(em('UNDETERMINED'))).toBe(false);
    expect(podeExibirObra(em('PROTECTED'))).toBe(false);
  });
});

describe('o link oficial de onde o item está disponível', () => {
  it('prefere quem tem a edição: Mutopia antes de IMSLP', () => {
    const l = linkOficial({ mutopia: '42', imslp: 'X', wikidata: 'Q1' });
    expect(l?.rotulo).toBe('Mutopia Project');
  });

  it('IMSLP aponta para a PÁGINA, e não para o arquivo', () => {
    /**
     * Linkar uma página é o que qualquer catálogo faz. O que o `robots.txt` do
     * IMSLP proíbe é rastrear `/images/` e `/imglnks/` — baixar, e não citar.
     */
    const l = linkOficial({ imslp: 'Category:Bach,_Johann_Sebastian' });
    expect(l?.url).toContain('imslp.org/wiki/');
    expect(l?.url).not.toContain('/images/');
    expect(l?.url).not.toContain('/imglnks/');
  });

  it('cai para MusicBrainz, Commons e Wikidata nessa ordem', () => {
    expect(linkOficial({ musicbrainz: 'uuid', wikidata: 'Q1' })?.rotulo).toBe('MusicBrainz');
    expect(linkOficial({ commonsCategory: 'Bach', wikidata: 'Q1' })?.rotulo).toBe('Wikimedia Commons');
    expect(linkOficial({ wikidata: 'Q1339' })?.url).toBe('https://www.wikidata.org/wiki/Q1339');
  });

  it('sem identificador nenhum, não inventa link', () => {
    // Link falso é pior que link ausente: manda a pessoa a lugar nenhum.
    expect(linkOficial({})).toBeUndefined();
  });
});

describe('edição nativa — a diferença entre tocar e redirecionar', () => {
  const obra = (refs: CanonicalWork['scoreRefs']): CanonicalWork => ({
    id: 'w1',
    canonicalTitle: { pt: 'Obra' },
    composerIds: ['c1'],
    instrumentation: [],
    movements: [],
    scoreRefs: refs,
    recordingRefs: [],
    externalIds: {},
    provenance: [],
    publicDomain: avaliarDominioPublico({ anoDeMorte: 1750, hoje: EM(2026) }),
    resolution: { method: 'MANUAL_CURATION', resolvedAt: '2026-01-01T00:00:00.000Z', confidence: 1 },
  });

  it('LilyPond é renderizável: a plataforma desenha a pauta', () => {
    expect(
      temEdicaoNativa(
        obra([{ source: 'MUTOPIA', sourceRef: 'x', format: 'lilypond', render: 'NATIVA' }])
      )
    ).toBe(true);
  });

  it('catalogação NÃO é edição: ficha sem arquivo não toca', () => {
    /**
     * IMSLP e Música Brasilis entram como nível 5 — metadados. O `robots.txt`
     * dos dois proíbe os diretórios onde os arquivos ficam, e obra livre não
     * autoriza rastrear o servidor de ninguém.
     */
    expect(
      temEdicaoNativa(obra([{ source: 'IMSLP', sourceRef: 'x', format: 'pdf', render: 'FICHA' }]))
    ).toBe(false);
  });

  it('obra sem nenhuma referência não tem edição', () => {
    expect(temEdicaoNativa(obra([]))).toBe(false);
  });
});

describe('texto localizado', () => {
  it('prefere o português', () => {
    expect(textoDe({ pt: 'Sonata', en: 'Sonata in G' })).toBe('Sonata');
  });

  it('cai no inglês quando não há português', () => {
    expect(textoDe({ en: 'Sonata in G' })).toBe('Sonata in G');
  });

  it('devolve nulo em vez de string vazia — ausência representável', () => {
    expect(textoDe({})).toBeNull();
    expect(textoDe(undefined)).toBeNull();
  });
});


describe('o que a ficha diz sobre a disponibilidade', () => {
  const obraCom = (over: Partial<CanonicalWork>): CanonicalWork => ({
    id: 'w1',
    canonicalTitle: { pt: 'Obra' },
    composerIds: ['c1'],
    instrumentation: [],
    movements: [],
    scoreRefs: [],
    recordingRefs: [],
    externalIds: {},
    provenance: [],
    publicDomain: avaliarDominioPublico({ anoDeMorte: 1750, hoje: EM(2026) }),
    resolution: { method: 'MANUAL_CURATION', resolvedAt: '2026-01-01T00:00:00.000Z', confidence: 1 },
    ...over,
  });

  it('obra protegida: catalogada, com o motivo E o link oficial', () => {
    /**
     * O ponto inteiro da separação. A obra existe no acervo, a ficha diz por
     * que não toca aqui, e aponta onde ela está disponível legitimamente.
     */
    const d = avaliarDisponibilidade(
      obraCom({
        publicDomain: avaliarDominioPublico({ anoDeMorte: 1990, hoje: EM(2026) }),
        externalIds: { imslp: 'Obra_(Autor)' },
      })
    );

    expect(d.modo).toBe('SOMENTE_CATALOGO');
    expect(d.motivo).toContain('protegida');
    expect(d.linkOficial?.rotulo).toBe('IMSLP');
  });

  it('o motivo NUNCA é vazio', () => {
    /**
     * Uma ficha que diga apenas "indisponível" deixa o aluno sem saber se o
     * problema é legal, técnico ou provisório.
     */
    for (const pd of [
      avaliarDominioPublico({ anoDeMorte: 1990, hoje: EM(2026) }),
      avaliarDominioPublico({ licencaDeclarada: 'CC-BY', hoje: EM(2026) }),
      avaliarDominioPublico({ hoje: EM(2026) }),
      avaliarDominioPublico({ anoDeMorte: 1750, hoje: EM(2026) }),
    ]) {
      expect(avaliarDisponibilidade(obraCom({ publicDomain: pd })).motivo.length).toBeGreaterThan(20);
    }
  });

  it('domínio público SEM edição livre: catalogada, e o motivo é nosso', () => {
    // Aqui o limite não é a lei — é não termos ainda uma edição redistribuível.
    const d = avaliarDisponibilidade(obraCom({ scoreRefs: [] }));

    expect(d.modo).toBe('SOMENTE_CATALOGO');
    expect(d.motivo).toContain('edição redistribuível');
    expect(d.motivo).not.toContain('protegida');
  });

  it('domínio público COM edição livre: experiência completa', () => {
    const d = avaliarDisponibilidade(
      obraCom({
        scoreRefs: [{ source: 'MUTOPIA', sourceRef: '42', format: 'lilypond', render: 'NATIVA' }],
      })
    );

    expect(d.modo).toBe('EXPERIENCIA_COMPLETA');
  });

  it('provável não vira experiência, mas continua catalogada', () => {
    const d = avaliarDisponibilidade(
      obraCom({ publicDomain: avaliarDominioPublico({ licencaDeclarada: 'CC-BY', hoje: EM(2026) }) })
    );

    expect(d.modo).toBe('SOMENTE_CATALOGO');
    expect(d.motivo).toContain('provável');
  });
});
