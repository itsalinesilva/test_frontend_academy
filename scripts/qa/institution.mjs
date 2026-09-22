/**
 * INSTITUIÇÃO — Cadeira, Grêmio e Casa dizem a mesma coisa que o documento.
 *
 * A hierarquia vive em `docs/harness/80_INSTITUTIONAL_ARCHITECTURE.md`, e ela
 * já provou ser o tipo de regra que se perde sem vigia: "um Grêmio por curso"
 * sobreviveu meses no domínio enquanto o documento dizia que o Grêmio agrupa
 * uma área de estudo. Cinco cursos, três deles de história, davam cinco
 * Grêmios — e os historiadores ficavam partidos em três.
 *
 * Ninguém percebeu porque nada verificava. Estes verificadores existem para
 * que o próximo curso não reintroduza o problema em silêncio.
 */
import { readSource, sourceExists, sources, stripComments } from './core.mjs';

const CHAIR = 'src/domain/chair.ts';
const SEED_HOUSES = 'src/data/seed-houses.ts';

/** Os ids de curso semeados, lidos dos próprios arquivos de curso. */
function cursosSemeados() {
  const arquivos = [
    'src/data/seed-theory-course.ts',
    'src/data/seed-ocidental-course.ts',
    'src/data/seed-brasil-course.ts',
    'src/data/seed-popular-course.ts',
    'src/data/seed-violino-course.ts',
  ];
  const ids = [];
  for (const a of arquivos) {
    if (!sourceExists(a)) continue;
    const m = readSource(a).match(/id:\s*'(crs_[a-z0-9_]+)'/);
    if (m) ids.push({ arquivo: a, id: m[1] });
  }
  return ids;
}

/** O mapa curso → cadeira, como está escrito. */
function mapaDeCadeiras() {
  if (!sourceExists(CHAIR)) return new Map();
  const bloco = readSource(CHAIR).split('CHAIR_OF_COURSE')[1] ?? '';
  const corpo = bloco.split('};')[0];
  return new Map(
    [...corpo.matchAll(/(crs_[a-z0-9_]+):\s*ChairId\.(\w+)/g)].map((m) => [m[1], m[2]])
  );
}

/**
 * Todo curso pertence a uma cadeira.
 *
 * Curso sem cadeira é curso sem Grêmio: quem se matricula nele não pertence a
 * lugar nenhum. E como o mapa é explícito de propósito — derivar a cadeira do
 * nome do curso quebraria no primeiro nome fora do padrão —, acrescentar um
 * curso e esquecer o mapa é o erro fácil de cometer.
 */
export function checkCourseHasChair() {
  const mapa = mapaDeCadeiras();
  if (mapa.size === 0) {
    return [{ file: CHAIR, detail: 'CHAIR_OF_COURSE não foi lido — a verificação ficaria vazia' }];
  }

  const findings = [];
  for (const { arquivo, id } of cursosSemeados()) {
    if (!mapa.has(id)) {
      findings.push({
        file: arquivo,
        detail: `o curso "${id}" não está em CHAIR_OF_COURSE — quem se matricular nele não terá Grêmio`,
      });
    }
  }
  return findings;
}

/**
 * Nenhuma cadeira declarada fica sem curso.
 *
 * Cadeira vazia é um Grêmio que ninguém pode integrar: aparece na estrutura e
 * não corresponde a nada. É a mesma doença das telas que anunciam o que não
 * existe, um andar acima.
 */
export function checkChairHasCourse() {
  if (!sourceExists(CHAIR)) return [];
  const src = readSource(CHAIR);

  const declaradas = [...src.matchAll(/^\s*(\w+)\s*=\s*'cad_[a-z_]+',/gm)].map((m) => m[1]);
  if (declaradas.length === 0) {
    return [{ file: CHAIR, detail: 'nenhuma cadeira declarada — a verificação ficaria vazia' }];
  }

  const usadas = new Set(mapaDeCadeiras().values());
  return declaradas
    .filter((c) => !usadas.has(c))
    .map((c) => ({
      file: CHAIR,
      detail: `a cadeira ${c} não tem curso nenhum — seria um Grêmio que ninguém pode integrar`,
    }));
}

/**
 * O status de uma Casa bate com o corpus que ela tem.
 *
 * `IN_PREPARATION` significa, pela definição do próprio tipo, **corpus
 * presente, progressão em construção**. Duas Casas estavam marcadas assim com
 * zero obras: a lista dizia "em preparo" sobre um preparo que não havia
 * começado.
 *
 * Não é detalhe de rótulo. `ANNOUNCED` é a promessa honesta — "o lugar está
 * marcado, não há conteúdo ainda" — e usar `IN_PREPARATION` no lugar dela é
 * exatamente a mesma mentira das telas que anunciavam número que ninguém
 * contou, só que sobre um caminho de estudo.
 */
export function checkHouseStatusMatchesCorpus() {
  if (!sourceExists(SEED_HOUSES)) return [];
  const src = readSource(SEED_HOUSES);

  const nomes = [...src.matchAll(/name:\s*'([^']+)'/g)].map((m) => m[1]);
  const status = [...src.matchAll(/status:\s*HouseStatus\.(\w+)/g)].map((m) => m[1]);
  const obras = [...src.matchAll(/corpus:\s*\{\s*obras:\s*(\d+)/g)].map((m) => Number(m[1]));

  if (nomes.length === 0 || nomes.length !== status.length || nomes.length !== obras.length) {
    return [
      {
        file: SEED_HOUSES,
        detail: `não consegui parear nome, status e corpus (${nomes.length}/${status.length}/${obras.length}) — a verificação ficaria vazia`,
      },
    ];
  }

  const findings = [];
  for (const [i, nome] of nomes.entries()) {
    const anunciada = status[i] === 'ANNOUNCED';
    if (anunciada && obras[i] > 0) {
      findings.push({
        file: SEED_HOUSES,
        detail: `"${nome}" está ANNOUNCED com ${obras[i]} obras — tem corpus, logo está em preparo`,
      });
    }
    if (!anunciada && obras[i] === 0) {
      findings.push({
        file: SEED_HOUSES,
        detail: `"${nome}" está ${status[i]} com zero obras — sem corpus, o honesto é ANNOUNCED`,
      });
    }
  }
  return findings;
}

const ATLAS_REPO = 'src/repositories/atlas.repository.ts';

/**
 * Todo campo de `AtlasFilter` e aplicado em `listarObras`.
 *
 * `genreId` viveu declarado no filtro sem campo correspondente na obra e sem
 * linha de filtro nenhuma. Quem filtrasse por genero recebia a lista inteira —
 * e nao havia nenhum sinal de que o recorte tinha sido ignorado. Filtro que
 * nao filtra e pior que filtro ausente: a tela mostra um resultado errado com
 * cara de resultado.
 */
export function checkAtlasFilterIsApplied() {
  if (!sourceExists(ATLAS_REPO)) return [];
  const src = readSource(ATLAS_REPO);

  const bloco = src.split('export interface AtlasFilter')[1]?.split('}')[0] ?? '';
  const campos = [...bloco.matchAll(/^\s*(\w+)\??:/gm)].map((m) => m[1]);
  if (campos.length === 0) {
    return [{ file: ATLAS_REPO, detail: 'AtlasFilter nao foi lido — a verificacao ficaria vazia' }];
  }

  /**
   * A IMPLEMENTACAO, e nao a declaracao.
   *
   * `listarObras` aparece primeiro na interface, onde nao ha corpo nenhum.
   * Cortar pela primeira ocorrencia pegava a assinatura e acusava TODOS os
   * campos como nao aplicados — cinco falsos positivos de uma vez.
   */
  const corpo = src.split('public async listarObras')[1]?.split('\n  }')[0] ?? '';
  if (!corpo) {
    return [{ file: ATLAS_REPO, detail: 'listarObras nao foi lido — a verificacao ficaria vazia' }];
  }

  return campos
    .filter((c) => !new RegExp('filtro\\.' + c + '\\b').test(corpo))
    .map((c) => ({
      file: ATLAS_REPO,
      detail: `AtlasFilter declara "${c}" e listarObras nao o aplica — quem filtrar por ele recebe a lista inteira`,
    }));
}

const ACERVO_REPO = 'src/repositories/music-knowledge.repository.ts';
const CONHECIMENTO = 'src/domain/music-knowledge.ts';

/**
 * O acervo cataloga TUDO.
 *
 * O Conservatório é instituição acadêmica, e o acervo existe em função disso.
 * Catalogar e oferecer são eixos diferentes: a legislação limita o que pode
 * ser REPRODUZIDO, e não o que pode ser REGISTRADO.
 *
 * Houve uma versão em que `podeListarFicha()` devolvia `false` para obra
 * protegida — o acervo escondia o que não podia tocar. Um catálogo assim fica
 * mutilado, sem quase nada do século XX, e o aluno de história nem fica
 * sabendo que a obra existe.
 *
 * Este verificador recusa que a listagem do acervo volte a filtrar por
 * situação de direito autoral.
 */
export function checkAcervoCatalogaTudo() {
  if (!sourceExists(ACERVO_REPO)) return [];
  const src = readSource(ACERVO_REPO);

  const corpo = src.split('public async listarObras')[1]?.split('\n  }')[0] ?? '';
  if (!corpo) {
    return [{ file: ACERVO_REPO, detail: 'listarObras não foi lido — a verificação ficaria vazia' }];
  }

  const findings = [];
  for (const proibido of ['publicDomain', 'PROTECTED', 'podeExibirObra', 'UNDETERMINED']) {
    if (corpo.includes(proibido)) {
      findings.push({
        file: ACERVO_REPO,
        detail: `listarObras menciona "${proibido}" — o acervo cataloga TUDO, e a situação de direito autoral decide a EXPERIÊNCIA, não o registro`,
      });
    }
  }
  return findings;
}

/**
 * A ficha sempre diz POR QUE algo não está disponível.
 *
 * "Indisponível" sozinho deixa o aluno sem saber se o problema é a lei, a
 * falta de edição ou algo provisório. E `DisponibilidadeNoConservatorio`
 * declara `motivo` como obrigatório justamente para que não haja como omitir.
 */
export function checkDisponibilidadeTemMotivo() {
  if (!sourceExists(CONHECIMENTO)) return [];
  const src = readSource(CONHECIMENTO);

  const bloco = src.split('interface DisponibilidadeNoConservatorio')[1]?.split('}')[0] ?? '';
  if (!bloco) {
    return [
      { file: CONHECIMENTO, detail: 'DisponibilidadeNoConservatorio não foi lida — a verificação ficaria vazia' },
    ];
  }

  const findings = [];
  if (/motivo\?:/.test(bloco)) {
    findings.push({
      file: CONHECIMENTO,
      detail: '`motivo` virou opcional — ficha sem motivo é "indisponível" sem explicação',
    });
  }

  const corpo = src.split('export function avaliarDisponibilidade')[1] ?? '';
  const retornos = [...corpo.matchAll(/modo:\s*'(\w+)'/g)].length;
  /**
   * `motivo:` E o atalho de objeto `motivo,`.
   *
   * A primeira versao so casava `motivo:` e acusava uma saida que estava
   * correta — ela usa `{ modo, motivo, linkOficial }`, com atalho. Falso
   * positivo ensina a ignorar o verificador. O atalho tambem aparece no FIM
   * do objeto — `{ modo, motivo }` —, e por isso `}` entra na classe.
   */
  const motivos = [...corpo.matchAll(/\bmotivo\s*[:,}]/g)].length;
  if (retornos > 0 && motivos < retornos) {
    findings.push({
      file: CONHECIMENTO,
      detail: `avaliarDisponibilidade tem ${retornos} saídas e ${motivos} motivos — alguma saída não explica`,
    });
  }
  return findings;
}


/**
 * O CRÉDITO DE QUEM TRANSCREVEU NÃO PODE SUMIR DA FICHA.
 *
 * POR QUE ISTO É VERIFICADO, E NÃO CONFIADO
 * ----------------------------------------
 * Seiscentas e vinte e uma das mil trezentas e quarenta e nove partituras
 * estão sob licença Creative Commons com cláusula de atribuição. A cláusula
 * é **condição de uso**: um arquivo CC-BY exibido sem o nome de quem o
 * produziu está sendo redistribuído sem licença nenhuma.
 *
 * O acervo passou uma extração inteira sem esse campo — as partituras
 * entraram, os links entraram, a licença entrou, e o nome não. Ninguém
 * percebeu porque a ficha não tinha onde mostrar a falta.
 *
 * Três coisas precisam continuar verdadeiras, e cada uma quebra sozinha:
 * o dado existe no arquivo servido, o catálogo o carrega para a referência,
 * e a tela o desenha.
 */
const PARTITURAS_JSON = 'src/data/acervo/partituras.json';
const UNIFICADO = 'src/data/acervo-unificado.ts';
const TELA_DA_OBRA = 'src/ui/screens/acervo/ObraScreen.tsx';

export function checkAtribuicaoDaPartitura() {
  const findings = [];

  if (sourceExists(PARTITURAS_JSON)) {
    let partituras = null;
    try {
      partituras = JSON.parse(readSource(PARTITURAS_JSON));
    } catch {
      findings.push({ file: PARTITURAS_JSON, detail: 'arquivo ilegivel — a verificacao ficaria vazia' });
    }

    if (Array.isArray(partituras)) {
      const exigem = partituras.filter((p) => /attribution/i.test(p.lic ?? ''));
      /**
       * Se nenhuma exigisse, a verificacao passaria sem olhar nada — e foi
       * exatamente assim que dois verificadores deste projeto nasceram vazios.
       */
      if (exigem.length === 0) {
        findings.push({
          file: PARTITURAS_JSON,
          detail: 'nenhuma partitura sob licenca com atribuicao — ou a extracao perdeu a licenca, ou a verificacao esta cega',
        });
      }

      const semCredito = exigem.filter((p) => !p.ed);
      if (semCredito.length > 0) {
        findings.push({
          file: PARTITURAS_JSON,
          detail: `${semCredito.length} partituras exigem atribuicao e nao tem quem transcreveu (ex.: ${semCredito[0].id}) — exibi-las e redistribuir sem licenca`,
        });
      }
    }
  }

  if (sourceExists(UNIFICADO) && !/editors:\s*p\.ed/.test(readSource(UNIFICADO))) {
    findings.push({
      file: UNIFICADO,
      detail: 'a referencia de partitura nao carrega `editors` — o dado existe no arquivo e nao chega ao catalogo',
    });
  }

  if (sourceExists(TELA_DA_OBRA) && !/r\.editors/.test(readSource(TELA_DA_OBRA))) {
    findings.push({
      file: TELA_DA_OBRA,
      detail: 'a ficha da obra nao desenha `editors` — credito que nao aparece nao cumpre a licenca',
    });
  }

  return findings;
}

/**
 * MEIO GROSSO E INSTRUMENTO EXATO NÃO SE MISTURAM NUMA FACETA SÓ.
 *
 * A catalogação de origem sabe dizer "teclado" para vinte e cinco mil obras e
 * não sabe dizer "cravo". A partitura sabe dizer "Piano". São dois níveis, e
 * oferecer "Teclado (5.951)" ao lado de "Piano (685)" como se fossem irmãos
 * ensina que o catálogo não sabe o que está contando — um contém o outro.
 *
 * É a mesma confusão que o campo de gênero carregou por vinte e cinco mil
 * registros, e por isso ela merece vigia em vez de boa intenção.
 */
const FACETAS = 'src/domain/catalog-facets.ts';

export function checkNiveisDeMeioSeparados() {
  if (!sourceExists(FACETAS)) return [];
  const src = readSource(FACETAS);

  const findings = [];
  for (const exigido of ['MEIOS_AMPLOS', 'INSTRUMENTOS_EXATOS', 'separarPorNivel']) {
    if (!src.includes(exigido)) {
      findings.push({ file: FACETAS, detail: `${exigido} sumiu — os dois niveis de meio voltaram a ser um so` });
    }
  }

  /** Um instrumento exato que tambem seja meio amplo tornaria a separacao mentira. */
  const amplos = (src.split('MEIOS_AMPLOS')[1] ?? '').split('};')[0];
  const exatos = (src.split('INSTRUMENTOS_EXATOS')[1] ?? '').split('};')[0];
  const chaves = (b) => [...b.matchAll(/^\s*(\w+):/gm)].map((m) => m[1]);
  const listaAmpla = chaves(amplos);
  const listaExata = chaves(exatos);

  if (listaAmpla.length === 0 || listaExata.length === 0) {
    findings.push({ file: FACETAS, detail: 'um dos niveis ficou vazio — a verificacao ficaria sem o que comparar' });
  }
  for (const k of listaExata) {
    if (listaAmpla.includes(k)) {
      findings.push({ file: FACETAS, detail: `"${k}" esta nos dois niveis — a separacao deixa de significar algo` });
    }
  }
  return findings;
}


/**
 * TODO EIXO OFERECIDO PRECISA SER APLICADO.
 *
 * O DEFEITO QUE ORIGINOU ESTE VERIFICADOR
 * ---------------------------------------
 * O sistema de facetas vivia no serviço desde o início — contagem por opção,
 * opção vazia não oferecida, tudo testado — e a tela **não o chamava**. Ela
 * montava os seletores de listas fixas, sem contagem, oferecendo recortes que
 * devolviam vazio.
 *
 * Um filtro que a tela mostra e a listagem ignora é pior que filtro nenhum:
 * quem clica vê a contagem mudar no rótulo e o resultado ficar igual, e conclui
 * que o catálogo está quebrado — o que está.
 *
 * A regra é de mão dupla:
 *   o campo de toda faceta montada aparece num `.filter` do mesmo serviço;
 *   a tela desenha as facetas do serviço, e não listas escritas nela.
 */
const SERVICO_DO_ACERVO = 'src/services/application/acervo.service.ts';
const TELA_DO_ACERVO = 'src/ui/screens/acervo/AcervoScreen.tsx';

export function checkFiltroOferecidoEAplicado() {
  const findings = [];
  if (!sourceExists(SERVICO_DO_ACERVO)) return findings;

  const src = readSource(SERVICO_DO_ACERVO);
  const campos = [...src.matchAll(/montarFaceta\(\s*'([a-zA-Z]+)'/g)].map((m) => m[1]);

  /** Sem faceta nenhuma, a verificacao passaria sem olhar nada. */
  if (campos.length < 4) {
    findings.push({
      file: SERVICO_DO_ACERVO,
      detail: `so ${campos.length} facetas montadas \u2014 ou o catalogo perdeu eixos, ou a verificacao esta cega`,
    });
    return findings;
  }

  for (const campo of new Set(campos)) {
    const aplicado = new RegExp(`filtro\\.${campo}\\b`).test(src);
    if (!aplicado) {
      findings.push({
        file: SERVICO_DO_ACERVO,
        detail: `a faceta "${campo}" e oferecida e nunca aplicada \u2014 clicar nela muda a contagem e nao muda o resultado`,
      });
    }
  }

  if (sourceExists(TELA_DO_ACERVO)) {
    /**
     * COMENTARIO NAO E CODIGO.
     *
     * A primeira versao acusou o proprio comentario que EXPLICA a remocao das
     * listas fixas. Falso positivo ensina a ignorar o verificador, e este
     * projeto ja aprendeu isso uma vez com `checkRetiredVocabulary`.
     */
    const tela = stripComments(readSource(TELA_DO_ACERVO));
    if (!/acervoService\.facetas\(/.test(tela)) {
      findings.push({
        file: TELA_DO_ACERVO,
        detail: 'a tela nao pede as facetas ao servico \u2014 ela voltou a montar filtro de lista fixa, sem contagem',
      });
    }
    /**
     * Lista fixa de era, regiao ou genero na tela significa seletor sem
     * contagem, e com opcao que devolve vazio. Foi assim durante meses.
     */
    for (const fixa of ['DEFAULT_ERAS', 'DEFAULT_REGIONS', 'DEFAULT_GENRES']) {
      if (tela.includes(fixa)) {
        findings.push({
          file: TELA_DO_ACERVO,
          detail: `a tela monta filtro de ${fixa} \u2014 lista fixa nao sabe quantos itens cada opcao devolve, e oferece as que devolvem zero`,
        });
      }
    }
  }

  return findings;
}

/**
 * O EIXO UNIVERSAL PRECISA ALCANÇAR O ACERVO.
 *
 * Há dois tipos de campo, e tratá-los igual produz as duas falhas opostas.
 *
 * **Universal** — era, região, compositor: toda obra tem uma. Cobertura baixa
 * aqui é lacuna de apuração, e o filtro passa a devolver o subconjunto que foi
 * apurado, que quem consulta lê como o subconjunto que existe. A região passou
 * meses assim: **dezessete obras de vinte e seis mil**, oferecida como um
 * filtro qualquer.
 *
 * **Seletivo** — movimento estético, partitura, número de catálogo: a maioria
 * não tem, e isso é a realidade. Cobrar noventa por cento aqui levaria a
 * inventar dado.
 *
 * Este verificador cobra só os universais, e cobra sobre o arquivo servido —
 * não sobre amostra, e não sobre o que o código promete.
 */
const OBRAS_JSON = 'src/data/acervo/obras.json';
const SEED_EXTERNO = 'src/data/seed-acervo-externo.ts';
const PISO = 0.9;

export function checkEixoUniversalAlcancaOAcervo() {
  const findings = [];

  if (sourceExists(OBRAS_JSON)) {
    let obras = null;
    try {
      obras = JSON.parse(readSource(OBRAS_JSON));
    } catch {
      findings.push({ file: OBRAS_JSON, detail: 'arquivo ilegivel \u2014 a verificacao ficaria vazia' });
    }

    if (Array.isArray(obras) && obras.length > 0) {
      const comEra = obras.filter((o) => o.e).length;
      if (comEra / obras.length < PISO) {
        findings.push({
          file: OBRAS_JSON,
          detail: `era preenchida em ${Math.round((comEra / obras.length) * 100)}% das obras \u2014 eixo universal abaixo do piso de ${PISO * 100}%`,
        });
      }
      const comCompositor = obras.filter((o) => o.c).length;
      if (comCompositor / obras.length < PISO) {
        findings.push({
          file: OBRAS_JSON,
          detail: `compositor preenchido em ${Math.round((comCompositor / obras.length) * 100)}% das obras \u2014 eixo universal abaixo do piso`,
        });
      }
    } else if (Array.isArray(obras)) {
      findings.push({ file: OBRAS_JSON, detail: 'acervo servido vazio \u2014 a verificacao ficaria sem o que medir' });
    }
  }

  /**
   * A REGIAO DA OBRA E HERDADA DO COMPOSITOR, e a do compositor sai da
   * cidadania. Medir a cidadania no seed e medir a origem: se ela cair, a
   * regiao das vinte e cinco mil obras cai junto, em silencio.
   */
  if (sourceExists(SEED_EXTERNO)) {
    const seed = readSource(SEED_EXTERNO);
    const registros = [...seed.matchAll(/\n    id: '/g)].length;
    const comCidadania = [...seed.matchAll(/cidadanias: \['/g)].length;

    if (registros === 0) {
      findings.push({ file: SEED_EXTERNO, detail: 'nenhum compositor no seed \u2014 a verificacao ficaria vazia' });
    } else if (comCidadania / registros < PISO) {
      findings.push({
        file: SEED_EXTERNO,
        detail:
          `cidadania em ${Math.round((comCidadania / registros) * 100)}% dos compositores ` +
          `\u2014 e dela que sai a regiao de 25 mil obras, e ela cai junto`,
      });
    }
  }

  return findings;
}


/**
 * 🔴 FONTE EXTERNA ENRIQUECE. NÃO CRIA.
 *
 * O DEFEITO QUE ESTE VERIFICADOR EXISTE PARA IMPEDIR
 * --------------------------------------------------
 * A ligação de partituras criava uma obra para cada arquivo que não casava.
 * **Mil trezentas e trinta e uma obras falsas** entraram no catálogo assim — e
 * não por decisão de ninguém: `Partitura` não existia como entidade, e a única
 * forma de um arquivo entrar no acervo era sendo uma obra.
 *
 * A ausência da entidade força a duplicata. Com a entidade criada, a regra
 * passa a ser enunciável: **criar entidade canônica é ato de curadoria**, e
 * fonte externa que não achou dono **enfileira**, em vez de inventar.
 *
 * São três garantias, e cada uma quebra sozinha:
 *   a fila existe e é exposta;
 *   a ligação de partituras não escreve obra nova;
 *   a tela mostra a fila, porque pendência invisível é descarte disfarçado.
 */
const UNIFICADO_ACERVO = 'src/data/acervo-unificado.ts';
const RECURSO_DO_CATALOGO = 'src/domain/catalog-resource.ts';
const SERVICO_ACERVO = 'src/services/application/acervo.service.ts';
const TELA_ACERVO = 'src/ui/screens/acervo/AcervoScreen.tsx';

export function checkFonteNaoCriaEntidade() {
  const findings = [];

  if (sourceExists(RECURSO_DO_CATALOGO)) {
    const dominio = readSource(RECURSO_DO_CATALOGO);
    for (const exigido of ['RegistroPendente', 'podeCriarEntidadeCanonica', 'MotivoDaPendencia']) {
      if (!dominio.includes(exigido)) {
        findings.push({
          file: RECURSO_DO_CATALOGO,
          detail: `${exigido} sumiu \u2014 sem a fila, recurso sem dono volta a virar obra`,
        });
      }
    }
  } else {
    findings.push({
      file: RECURSO_DO_CATALOGO,
      detail: 'o dominio de recursos nao existe \u2014 a verificacao ficaria vazia',
    });
  }

  if (sourceExists(UNIFICADO_ACERVO)) {
    const codigo = stripComments(readSource(UNIFICADO_ACERVO));
    const ligacao = codigo.split('async function ligarPartituras')[1] ?? '';

    if (!ligacao) {
      findings.push({
        file: UNIFICADO_ACERVO,
        detail: 'ligarPartituras nao foi lida \u2014 a verificacao ficaria vazia',
      });
    } else {
      const corpo = ligacao.split('\n}')[0];

      /**
       * `porId.set(p.id` escreve no mapa de OBRAS usando o id da PARTITURA.
       * E exatamente a linha que criou as 1.331 duplicatas.
       */
      if (/porId\.set\(\s*p\.id/.test(corpo)) {
        findings.push({
          file: UNIFICADO_ACERVO,
          detail: 'ligarPartituras escreve uma OBRA com o id da PARTITURA \u2014 e a duplicata que a fila existe para impedir',
        });
      }
      if (!/pendentes\.push/.test(corpo)) {
        findings.push({
          file: UNIFICADO_ACERVO,
          detail: 'ligarPartituras nao enfileira o que nao casou \u2014 ou descarta em silencio, ou cria obra',
        });
      }
    }
  }

  if (sourceExists(SERVICO_ACERVO) && !readSource(SERVICO_ACERVO).includes('PENDENTES')) {
    findings.push({
      file: SERVICO_ACERVO,
      detail: 'o servico nao serve a fila \u2014 o recurso existe no acervo e ninguem consegue ve-lo',
    });
  }

  /**
   * A FILA E CONTADA NO CODIGO, E NAO EXIBIDA NA TELA.
   *
   * Esta regra ja exigiu duas coisas erradas. Primeiro, que a tela oferecesse
   * `PENDENTES` como recorte navegavel — e esse recorte repetia quase inteira
   * a lista de partituras, vendendo como catalogo o que e materia bruta.
   * Depois, que a tela ao menos contasse quantas eram — e um numero que quem
   * le nao pode endereçar nao informa, atrapalha.
   *
   * O que a regra protege de verdade nunca foi a tela: e que a pendencia nao
   * seja **descartada em silencio**. Uma edicao que a plataforma leu e nao
   * soube onde por tem de continuar contada em algum lugar, para que o
   * trabalho de catalogacao saiba o tamanho do que falta.
   *
   * Esse lugar e o resumo do acervo. Quem cataloga le dali; quem estuda nao
   * precisa ler.
   */
  if (sourceExists(SERVICO_ACERVO) && !readSource(SERVICO_ACERVO).includes('naFilaDeResolucao')) {
    findings.push({
      file: SERVICO_ACERVO,
      detail: 'o resumo nao conta a fila \u2014 pendencia sem contagem e descarte disfarcado',
    });
  }

  return findings;
}

/**
 * PAPEL, INSTRUMENTO E VOZ SÃO EIXOS, E NÃO ATRIBUTOS DE COMPOSITOR.
 *
 * O catálogo guardava `instrumentosPraticados?: string[]` **dentro do
 * compositor**. Três erros num campo só: o instrumento virava detalhe de quem
 * compõe, um violinista que nunca escreveu nada não tinha onde existir, e o
 * valor era a grafia da fonte — mudou o rótulo, quebrou o filtro.
 *
 * O vocabulário controlado (`catalog-vocabulary.ts`) e a `AtuacaoMusical`
 * (`catalog-person.ts`) resolvem os três. Este verificador garante que eles
 * continuem existindo, e que o vocabulário não volte a crescer sozinho.
 */
const VOCABULARIO = 'src/domain/catalog-vocabulary.ts';
const PESSOA_DO_CATALOGO = 'src/domain/catalog-person.ts';

export function checkPapelEEixoProprio() {
  const findings = [];

  if (!sourceExists(VOCABULARIO) || !sourceExists(PESSOA_DO_CATALOGO)) {
    findings.push({
      file: VOCABULARIO,
      detail: 'o vocabulario ou a entidade Pessoa nao existem \u2014 a verificacao ficaria vazia',
    });
    return findings;
  }

  const vocab = readSource(VOCABULARIO);
  for (const exigido of ['PAPEIS', 'INSTRUMENTOS', 'VOZES', 'resolverInstrumento', 'resolverVoz']) {
    if (!vocab.includes(exigido)) {
      findings.push({ file: VOCABULARIO, detail: `${exigido} sumiu do vocabulario controlado` });
    }
  }

  /**
   * Nao-vacuidade: um vocabulario com tres instrumentos passaria em tudo acima
   * e nao serviria para catalogar nada.
   */
  const instrumentos = [...vocab.matchAll(/id: 'inst_/g)].length;
  const vozes = [...vocab.matchAll(/id: '(SOPRANO|TENOR|BARITONO|BAIXO|CONTRALTO)'/g)].length;
  if (instrumentos < 15) {
    findings.push({
      file: VOCABULARIO,
      detail: `so ${instrumentos} instrumentos no vocabulario \u2014 o catalogo tem mais famílias que isso`,
    });
  }
  if (vozes < 5) {
    findings.push({ file: VOCABULARIO, detail: `so ${vozes} tessituras \u2014 faltam registros vocais` });
  }

  const pessoa = readSource(PESSOA_DO_CATALOGO);
  if (!/atuacoes: AtuacaoMusical\[\]/.test(pessoa)) {
    findings.push({
      file: PESSOA_DO_CATALOGO,
      detail: 'Pessoa perdeu `atuacoes` \u2014 papel voltou a ser atributo, e um cantor volta a ser "compositor com voz"',
    });
  }

  return findings;
}


/**
 * 🔴 O MAPA E A BIBLIOTECA LEEM O MESMO CATÁLOGO.
 *
 * O DEFEITO QUE ESTE VERIFICADOR EXISTE PARA IMPEDIR
 * --------------------------------------------------
 * O Atlas contava **dezessete obras**; o Acervo contava **vinte e quatro mil
 * novecentas e cinquenta e sete**. Não era defasagem de cache: eram duas
 * fontes. A tela do mapa lia `DEFAULT_WORKS` — projeção do repositório
 * próprio — e a biblioteca lia o catálogo canônico.
 *
 * Duas verdades sobre o mesmo acervo é pior que uma verdade incompleta: as
 * duas telas estariam "certas", e nenhuma denunciaria a outra. Quem visse o
 * mapa concluiria que o Conservatório tem dezessete obras.
 *
 * Três garantias, e cada uma quebra sozinha:
 *   o serviço do mapa lê o catálogo canônico;
 *   a tela do mapa usa o serviço, e não a projeção antiga;
 *   o marcador leva à ficha da biblioteca pelo mesmo identificador.
 */
const SERVICO_DO_MAPA = 'src/services/application/atlas.service.ts';
const TELA_DO_MAPA = 'src/ui/screens/worlds/WorldsAtlasScreen.tsx';
const MAPA_DO_ATLAS = 'src/domain/atlas-map.ts';

export function checkAtlasEAcervoMesmaVerdade() {
  const findings = [];

  if (!sourceExists(SERVICO_DO_MAPA)) {
    findings.push({
      file: SERVICO_DO_MAPA,
      detail: 'o servico do mapa nao existe \u2014 a tela volta a ler um acervo paralelo',
    });
    return findings;
  }

  const servico = readSource(SERVICO_DO_MAPA);
  for (const exigido of ['todasAsObras', 'todosOsCompositores', 'rotaDoMarcador']) {
    if (!servico.includes(exigido)) {
      findings.push({
        file: SERVICO_DO_MAPA,
        detail: `${exigido} sumiu \u2014 o mapa deixa de ler o catalogo canonico ou de apontar para a ficha`,
      });
    }
  }

  if (sourceExists(TELA_DO_MAPA)) {
    const tela = stripComments(readSource(TELA_DO_MAPA));

    if (!/atlasService\./.test(tela)) {
      findings.push({
        file: TELA_DO_MAPA,
        detail: 'a tela do mapa nao usa o servico \u2014 e assim que ela passou a contar 17 de 24.957',
      });
    }
    /**
     * `DEFAULT_WORKS` e a projecao do repertorio proprio. Ela continua valida
     * como dado; o que nao vale e a TELA do mapa contar por ela.
     */
    for (const antiga of ['DEFAULT_WORKS', 'countWorks', 'listarObras']) {
      if (tela.includes(antiga)) {
        findings.push({
          file: TELA_DO_MAPA,
          detail: `a tela do mapa voltou a contar por ${antiga} \u2014 acervo paralelo ao da biblioteca`,
        });
      }
    }
  }

  /**
   * O MAPA AGREGA ANTES DE DETALHAR.
   *
   * Emitir toda obra como marcador dava 9.245 pontos no Romantismo. Um mapa
   * com nove mil pontos e uma lista desenhada sobre uma imagem.
   */
  if (sourceExists(MAPA_DO_ATLAS)) {
    const dominio = stripComments(readSource(MAPA_DO_ATLAS));
    if (!/const temFoco\s*=/.test(dominio)) {
      findings.push({
        file: MAPA_DO_ATLAS,
        detail: 'o mapa perdeu a regra de foco \u2014 ele volta a emitir milhares de obras como marcadores',
      });
    }
  }

  return findings;
}

/**
 * O PRAZO DE PROTEÇÃO TEM UM LUGAR SÓ, E ELE DECLARA O REGIME.
 *
 * 🔴 A pergunta "conta da morte ou da publicação?" apareceu três vezes nesta
 * sessão, e a resposta é **as duas**, conforme a natureza da obra:
 *
 *   autor conhecido      → morte + 70    (Lei 9.610/98, art. 41)
 *   anônima ou pseudônima → publicação + 70 (art. 43)
 *   audiovisual          → divulgação + 70  (art. 44)
 *
 * Tratar como regra única produz os dois erros possíveis, e só um deles tem
 * consequência jurídica: contar sempre da publicação faz a plataforma
 * **declarar liberado o que está protegido**.
 *
 * Este verificador impede que a conta volte a ser espalhada — e impede que
 * alguém invente uma data para fazer o cálculo fechar, que foi o que a
 * Antiguidade fazia com `anoDeMorte: 500` sobre um epitáfio anônimo.
 */
const PRAZO = 'src/domain/copyright-term.ts';

export function checkPrazoDeProtecao() {
  const findings = [];

  if (!sourceExists(PRAZO)) {
    findings.push({
      file: PRAZO,
      detail: 'o dominio do prazo nao existe — a verificacao ficaria vazia',
    });
    return findings;
  }

  const codigo = readSource(PRAZO);

  /** Os regimes que a lei distingue, e os artigos que os sustentam. */
  for (const exigido of ['AUTOR_CONHECIDO', 'ANONIMA_OU_PSEUDONIMA', 'art. 41', 'art. 43']) {
    if (!codigo.includes(exigido)) {
      findings.push({
        file: PRAZO,
        detail: `${exigido} sumiu — sem o regime declarado, o prazo volta a ser contado por palpite`,
      });
    }
  }

  /**
   * O `+ 1` do 1o de janeiro seguinte. Sem ele a obra e liberada um ano antes
   * da hora, e um ano e tempo de alguem publicar o que nao podia.
   */
  if (!/PRAZO_EM_ANOS \+ 1/.test(stripComments(codigo))) {
    findings.push({
      file: PRAZO,
      detail:
        'a conta perdeu o 1o de janeiro seguinte — a obra entra em dominio publico um ano antes da hora',
    });
  }

  return findings;
}

/**
 * 🔴 DATA DE MORTE INVENTADA PARA FAZER A CONTA FECHAR.
 *
 * `anoDeMorte: 500` sobre um fragmento anonimo do seculo II dava o resultado
 * certo pelo metodo errado: a ficha declarava dominio publico "por morte do
 * autor em 500" de alguem que ninguem sabe quem foi.
 *
 * Quando a liberdade e constatacao, o regime e `ANTERIOR_A_QUALQUER_PRAZO`, e
 * nao ha o que contar. Quando e calculo, a data tem de vir do registro da
 * pessoa — nunca de um literal escolhido para dar certo.
 *
 * Verificador separado do `checkPrazoDeProtecao` de proposito: aquele le um
 * arquivo conhecido, este VARRE a arvore. Sao dois mecanismos, e a tabela de
 * provas cobre cada um do seu jeito — misturar os dois deixaria metade sem
 * prova.
 */
export function checkDataDeMorteCravada() {
  const findings = [];

  for (const { file, code } of sources()) {
    if (file.includes('.test.')) continue;
    if (!file.startsWith('src/domain/')) continue;

    for (const m of stripComments(code).matchAll(/anoDeMorte:\s*(\d{1,4})[,\s}]/g)) {
      findings.push({
        file,
        line: code.slice(0, m.index).split('\n').length,
        detail: `data de morte cravada (${m[1]}) — se e constatacao, o regime e ANTERIOR_A_QUALQUER_PRAZO; se e calculo, a data vem do registro`,
      });
    }
  }

  return findings;
}
