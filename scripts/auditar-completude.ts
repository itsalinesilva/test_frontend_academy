/**
 * A MATRIZ DE COMPLETUDE — quanto do banco cada campo cobre.
 *
 * POR QUE ESTE SCRIPT EXISTE
 * --------------------------
 * Um filtro só é filtro se o campo que ele recorta estiver preenchido. Oferecer
 * "Tonalidade" sobre 25% do acervo não é oferecer um recorte: é oferecer uma
 * amostra enviesada com cara de catálogo — quem filtra por Dó maior recebe 667
 * obras e conclui que são essas as que existem, quando são essas as que **têm o
 * campo escrito**.
 *
 * A diferença entre "não há" e "não apuramos" é invisível no resultado de um
 * filtro, e é por isso que ela precisa ser medida aqui, fora da tela.
 *
 * O QUE ELE NÃO FAZ
 * -----------------
 * Não corrige nada. Só conta, e a contagem é sobre o acervo real servido, e não
 * sobre amostra.
 */
import { readFileSync } from 'node:fs';
import { todasAsObras, todosOsCompositores } from '../src/data/acervo-unificado';
import { CanonicalComposer, CanonicalWork } from '../src/domain/music-knowledge';

const nativo = globalThis.fetch;
globalThis.fetch = (async (u: string) => ({
  ok: true,
  json: async () => JSON.parse(readFileSync('public' + String(u), 'utf-8')),
})) as unknown as typeof nativo;

/** Um campo, quantos o têm, e se ele sustenta um filtro. */
interface Linha {
  campo: string;
  preenchidos: number;
  distintos: number;
  filtravel: boolean;
}

/**
 * O PISO DE DIGNIDADE DE UM FILTRO.
 *
 * Abaixo disto, o recorte mente por omissão: devolve o subconjunto que teve o
 * campo apurado, e quem consulta lê isso como o subconjunto que existe.
 */
const PISO = 0.9;

function medir<T>(
  itens: T[],
  campos: Array<[string, (i: T) => unknown]>
): Linha[] {
  return campos.map(([campo, ler]) => {
    const valores = new Set<string>();
    let preenchidos = 0;

    for (const i of itens) {
      const v = ler(i);
      if (v === undefined || v === null || v === '') continue;
      if (Array.isArray(v)) {
        if (v.length === 0) continue;
        for (const x of v) valores.add(String(x));
      } else {
        valores.add(String(v));
      }
      preenchidos += 1;
    }

    return {
      campo,
      preenchidos,
      distintos: valores.size,
      filtravel: preenchidos / itens.length >= PISO,
    };
  });
}

function imprimir(titulo: string, total: number, linhas: Linha[]) {
  console.log(`\n${titulo}  —  ${total.toLocaleString('pt-BR')} registros`);
  console.log('  ' + '-'.repeat(66));
  console.log(
    '  ' +
      'campo'.padEnd(22) +
      'preenchidos'.padStart(12) +
      '%'.padStart(7) +
      'distintos'.padStart(11) +
      '  filtro'
  );
  console.log('  ' + '-'.repeat(66));

  for (const l of [...linhas].sort((a, b) => b.preenchidos - a.preenchidos)) {
    const pct = (l.preenchidos / total) * 100;
    const marca = l.filtravel ? 'ok' : pct >= 50 ? 'parcial' : pct > 0 ? 'FRACO' : 'VAZIO';
    console.log(
      '  ' +
        l.campo.padEnd(22) +
        l.preenchidos.toLocaleString('pt-BR').padStart(12) +
        (pct.toFixed(0) + '%').padStart(7) +
        String(l.distintos).padStart(11) +
        '  ' +
        marca
    );
  }
}

(async () => {
  const compositores = todosOsCompositores();
  const obras = await todasAsObras();

  const camposDoCompositor: Array<[string, (c: CanonicalComposer) => unknown]> = [
    ['canonicalName', (c) => c.canonicalName],
    ['sortName', (c) => c.sortName],
    ['birthYear', (c) => c.birthYear],
    ['deathYear', (c) => c.deathYear],
    ['birthPlace', (c) => c.birthPlace],
    ['deathPlace', (c) => c.deathPlace],
    ['biography', (c) => c.biography?.pt],
    ['periodIds', (c) => c.periodIds],
    ['subPeriodo', (c) => c.subPeriodo],
    ['regionIds', (c) => c.regionIds],
    ['movements', (c) => c.movements],
    ['instrumentosPraticados', (c) => c.instrumentosPraticados],
    ['portraitUrl', (c) => c.portraitUrl],
    ['externalIds.wikidata', (c) => c.externalIds.wikidata],
    ['externalIds.musicbrainz', (c) => c.externalIds.musicbrainz],
    ['externalIds.viaf', (c) => c.externalIds.viaf],
    ['externalIds.imslp', (c) => c.externalIds.imslp],
    ['publicDomain.status', (c) => c.publicDomain.status],
  ];

  const camposDaObra: Array<[string, (o: CanonicalWork) => unknown]> = [
    ['canonicalTitle', (o) => o.canonicalTitle.pt],
    ['composerIds', (o) => o.composerIds],
    ['date', (o) => o.date],
    ['catalogNumber', (o) => o.catalogNumber],
    ['key', (o) => o.key],
    ['meter', (o) => o.meter],
    ['tempoBpm', (o) => o.tempoBpm],
    ['instrumentation', (o) => o.instrumentation],
    ['generoId', (o) => o.generoId],
    ['periodId', (o) => o.periodId],
    ['regionId', (o) => o.regionId],
    ['movements', (o) => o.movements],
    ['scoreRefs', (o) => o.scoreRefs],
    ['recordingRefs', (o) => o.recordingRefs],
    ['publicDomain.status', (o) => o.publicDomain.status],
  ];

  imprimir('COMPOSITORES', compositores.length, medir(compositores, camposDoCompositor));
  imprimir('OBRAS', obras.length, medir(obras, camposDaObra));

  /**
   * A conta que importa para a tela: quantos filtros o acervo SUSTENTA hoje,
   * e quantos ele apenas oferece.
   */
  const dosDois = [
    ...medir(compositores, camposDoCompositor).map((l) => ({ ...l, de: 'compositor' })),
    ...medir(obras, camposDaObra).map((l) => ({ ...l, de: 'obra' })),
  ];
  const dignos = dosDois.filter((l) => l.filtravel).length;

  console.log(`\n  campos que sustentam filtro (>= ${PISO * 100}%): ${dignos} de ${dosDois.length}`);
  console.log(
    '  abaixo do piso: ' +
      dosDois
        .filter((l) => !l.filtravel)
        .map((l) => `${l.de}.${l.campo}`)
        .join(', ')
  );
})();
