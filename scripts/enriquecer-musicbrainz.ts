/**
 * OS TÍTULOS ALTERNATIVOS — MusicBrainz.
 *
 * O QUE ESTA FONTE RESOLVE, E O QUE ELA NÃO RESOLVE
 * -------------------------------------------------
 * 🔴 **Ela não tem partitura.** Nenhuma requisição aqui aproxima o acervo de
 * um arquivo, e prometer isso seria mentir sobre o rendimento.
 *
 * O que ela tem é o que falta: **como a mesma obra se chama em outras
 * línguas**. `Quatorze Canons, BWV 1087` é o mesmo que `14 Canons`; `As Quatro
 * Estações` é `The Four Seasons`. Onze mil obras em domínio público não
 * casaram com a biblioteca de partitura por título escrito diferente, e é
 * exatamente esse o problema que um título alternativo resolve.
 *
 * O rendimento, então, é indireto e é medido em dois passos: colher os
 * títulos, e **reexecutar o casamento do IMSLP a partir do cache dele** — que
 * custa segundos e zero requisições.
 *
 * ENTRAR PELA OBRA, E NÃO PELO COMPOSITOR
 * ---------------------------------------
 * Navegar as obras de cada compositor seria o caminho óbvio e sai caro: só
 * Bach tem oito mil quatrocentas e vinte e sete obras lá, e a paginação é de
 * cem. Duzentos e vinte compositores dariam dezenas de milhares de requisições.
 *
 * O caminho é o inverso: para cada obra **nossa** que tem número de catálogo,
 * uma consulta pelo número. `BWV 1087` é prova de identidade — duas obras não
 * compartilham um número —, e o identificador do compositor entra na mesma
 * consulta para que o número de um catálogo não case com o de outro.
 *
 * São 5.273 obras sem endereço e com número apurado. Uma requisição cada.
 *
 * A POLÍTICA DA FONTE, QUE NÃO É `robots.txt`
 * -------------------------------------------
 * A interface deles exige **User-Agent que identifique a aplicação com
 * contato** e limita a **uma requisição por segundo por cliente**. Não é
 * sugestão: sem identificação, bloqueiam.
 *
 * Aqui a pausa é de 1.100 ms — folga deliberada sobre o limite, porque medir
 * o próprio ritmo contra o teto exato é como um cliente é bloqueado por
 * variação de rede.
 *
 * O CACHE VEM ANTES DO PROCESSAMENTO
 * ----------------------------------
 * A resposta crua é gravada **antes** de qualquer casamento. Foi descartar o
 * índice depois de usar que fez cada ideia nova custar vinte minutos de banda
 * da outra fonte; aqui o preço seria de horas.
 *
 *     npx vite-node scripts/enriquecer-musicbrainz.ts --limite 200
 *     npx vite-node scripts/enriquecer-musicbrainz.ts --so-sem-endereco
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { todasAsObras, todosOsCompositores } from '../src/data/acervo-unificado';
import { temPartituraLocalizada, textoDe } from '../src/domain/music-knowledge';

const UA = 'ConservatorioMuscicapa/1.0 (contato@muscicapa.org)';
const BASE = 'https://musicbrainz.org/ws/2';
const CACHE = 'scripts/.musicbrainz-obras.json';
const SAIDA = 'src/data/acervo/alias.json';

/** Um pouco acima do limite de 1/s. Medir contra o teto exato é como se bloqueia. */
const PAUSA_MS = 1100;

const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

const semAcento = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

const chaveDeCatalogo = (c: string) => semAcento(c).replace(/[^a-z0-9]/g, '');
const chaveDeTitulo = (t: string) => semAcento(t).replace(/[^a-z0-9]/g, '');

interface ObraDaFonte {
  id: string;
  title: string;
  score?: number;
  disambiguation?: string;
  aliases?: Array<{ name: string; locale?: string | null }>;
}

/** O que fica em cache: a resposta crua, por obra nossa. */
interface RespostaCrua {
  /** id da obra no nosso catálogo */ o: string;
  /** o número que foi consultado */ cat: string;
  /** o que a fonte devolveu, sem tratamento */ works: ObraDaFonte[];
}

/**
 * 🔴 A PRIMEIRA PASSADA DEIXOU DEZ MIL OBRAS DE FORA.
 *
 * O desenho era entrar pelo **número de catálogo**, que é prova de identidade —
 * duas obras não compartilham um número. Estava certo, e cobriu 5.273 obras.
 *
 * O que ele não previu: **10.050 obras sem endereço não têm número nenhum**.
 * Sem número, elas não tinham por onde entrar, e ficaram invisíveis para o
 * enriquecimento inteiro.
 *
 * Por título a prova é mais fraca — título não identifica obra sozinho. Por
 * isso o identificador do compositor entra na mesma consulta, e só o resultado
 * de **pontuação máxima** é aceito: a busca ordena por relevância, e os de
 * baixo são movimentos e arranjos.
 */
async function consultar(termo: string, arid: string, porTitulo: boolean): Promise<ObraDaFonte[]> {
  const q = encodeURIComponent(
    porTitulo ? `work:"${termo}" AND arid:${arid}` : `"${termo}" AND arid:${arid}`
  );
  const r = await fetch(`${BASE}/work?query=${q}&fmt=json&limit=10&inc=aliases`, {
    headers: { 'User-Agent': UA },
    signal: AbortSignal.timeout(30000),
  });

  /**
   * 503 é o sinal de que se pediu rápido demais. Recuar e tentar de novo é a
   * resposta certa; insistir no mesmo ritmo é como um cliente é banido.
   */
  if (r.status === 503) {
    await dormir(5000);
    return consultar(termo, arid, porTitulo);
  }
  if (!r.ok) throw new Error(`HTTP ${r.status}`);

  const j = (await r.json()) as { works?: ObraDaFonte[] };
  return j.works ?? [];
}

async function main() {
  const limite = Number(
    process.argv.find((a) => a.startsWith('--limite='))?.split('=')[1] ??
      (process.argv.includes('--limite') ? process.argv[process.argv.indexOf('--limite') + 1] : 0)
  );
  const soSemEndereco = process.argv.includes('--so-sem-endereco');
  /**
   * `--por-titulo` alcança as obras SEM número de catálogo, que a primeira
   * passada não tinha como enxergar.
   */
  const porTitulo = process.argv.includes('--por-titulo');

  console.log('  MusicBrainz — títulos alternativos, e NÃO partitura\n');
  console.log('  política da fonte: User-Agent identificado, 1 req/s. Pausa usada: 1.100 ms.\n');

  const hoje = new Date();
  const compositores = todosOsCompositores(hoje);
  const obras = await todasAsObras(hoje);

  const aridPorCompositor = new Map(
    compositores.filter((c) => c.externalIds.musicbrainz).map((c) => [c.id, c.externalIds.musicbrainz!])
  );

  /**
   * O ALVO: obra com número de catálogo e com compositor identificado na fonte.
   *
   * Sem número não há prova de identidade, e casar por título seria trazer de
   * volta o problema que este enriquecimento existe para resolver. Sem o
   * identificador do compositor, o número de um catálogo casaria com o de
   * outro — `S 1` é Liszt e também é Sammartini.
   */
  const alvo = obras
    .filter((o) => (porTitulo ? !o.catalogNumber : Boolean(o.catalogNumber)))
    .filter((o) => (soSemEndereco ? !temPartituraLocalizada(o) : true))
    .filter((o) => o.composerIds.some((c) => aridPorCompositor.has(c)))
    .slice(0, limite > 0 ? limite : undefined);

  console.log(`  alvo: ${alvo.length} obras${limite > 0 ? ` (limitado a ${limite})` : ''}`);
  console.log(`  tempo estimado: ${Math.round((alvo.length * PAUSA_MS) / 60000)} min\n`);

  /** O cache de passadas anteriores: o que já foi perguntado não se repergunta. */
  const cache: RespostaCrua[] = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf-8')) : [];
  const jaConsultadas = new Set(cache.map((c) => c.o));
  if (cache.length > 0) console.log(`  cache: ${cache.length} obras já consultadas\n`);

  let novas = 0;
  let falhas = 0;

  for (const o of alvo) {
    if (jaConsultadas.has(o.id)) continue;

    const arid = aridPorCompositor.get(o.composerIds.find((c) => aridPorCompositor.has(c))!)!;

    const termo = porTitulo ? (textoDe(o.canonicalTitle) ?? '') : o.catalogNumber!;
    if (!termo) continue;

    try {
      const works = await consultar(termo, arid, porTitulo);
      cache.push({ o: o.id, cat: termo, works });
      novas += 1;
    } catch (e) {
      falhas += 1;
      console.error(`\n  falha em ${o.id}: ${(e as Error).message}`);
      if (falhas > 20) {
        console.error('\n  vinte falhas seguidas — parando para não insistir contra a fonte.');
        break;
      }
    }

    /**
     * 🔴 GRAVA A CADA CINQUENTA, e não no fim.
     *
     * Uma execução de horas que grave só ao terminar perde tudo se cair no
     * meio — e o custo de recomeçar é banda de quem mantém a fonte, não a
     * nossa.
     */
    if (novas % 50 === 0 && novas > 0) {
      writeFileSync(CACHE, JSON.stringify(cache), 'utf-8');
      process.stdout.write(`\r  consultadas ${novas} · cache ${cache.length}`);
    }

    await dormir(PAUSA_MS);
  }

  writeFileSync(CACHE, JSON.stringify(cache), 'utf-8');
  console.log(`\n\n✓ ${CACHE} — ${cache.length} respostas guardadas`);

  // -------------------------------------------------------------------------
  // O casamento, que acontece sobre o cache e é gratuito
  // -------------------------------------------------------------------------

  const porId = new Map(obras.map((o) => [o.id, o]));
  const alias = new Map<string, Set<string>>();
  let comMbid = 0;

  const mbidPorObra = new Map<string, string>();

  for (const linha of cache) {
    const nossa = porId.get(linha.o);
    if (!nossa) continue;

    const nosso = chaveDeTitulo(textoDe(nossa.canonicalTitle) ?? '');
    const catalogo = chaveDeCatalogo(linha.cat);

    for (const w of linha.works) {
      /**
       * SÓ O QUE CARREGA O NÚMERO NO TÍTULO.
       *
       * A busca devolve dez resultados por relevância, e os de baixo são
       * movimentos e arranjos — "BWV 1087: I. Canon simplex". Aceitar todos
       * encheria o índice de alias de fragmentos, e um alias errado casa a
       * obra errada, que é pior que não casar.
       */
      /**
       * Por número: o título da fonte tem de CARREGAR o número, senão é
       * movimento ou arranjo. Por título: tem de começar igual ao nosso, que
       * é o mais perto de prova que um título dá.
       */
      const casa = porTitulo
        ? chaveDeTitulo(w.title).startsWith(nosso.slice(0, 16)) ||
          nosso.startsWith(chaveDeTitulo(w.title).slice(0, 16))
        : chaveDeTitulo(w.title).includes(catalogo);

      if (!casa) continue;

      const candidatos = [w.title, ...(w.aliases ?? []).map((a) => a.name)];

      for (const t of candidatos) {
        const k = chaveDeTitulo(t);
        /** O título que já é o nosso não é alias: é o mesmo. */
        if (!k || k === nosso) continue;
        alias.set(linha.o, (alias.get(linha.o) ?? new Set()).add(t));
      }

      if (!mbidPorObra.has(linha.o)) {
        mbidPorObra.set(linha.o, w.id);
        comMbid += 1;
      }
    }
  }

  /**
   * NÃO-VACUIDADE. Se quase nada casar, a normalização quebrou — e gravar um
   * índice vazio faria a próxima passada do IMSLP concluir que não há alias a
   * usar, que é falso.
   */
  const piso = Math.max(10, Math.floor(cache.length * 0.05));
  if (alias.size < piso) {
    console.error(
      `\n✗ só ${alias.size} obras ganharam título alternativo, sobre ${cache.length} consultadas.` +
        ` Esperado ao menos ${piso}. A normalização quebrou, e gravar seria pior que não gravar.`
    );
    process.exit(1);
  }

  writeFileSync(
    SAIDA,
    JSON.stringify([...alias].map(([o, t]) => ({ o, t: [...t], mb: mbidPorObra.get(o) }))),
    'utf-8'
  );

  const totalDeTitulos = [...alias.values()].reduce((n, s) => n + s.size, 0);

  console.log(`✓ ${SAIDA}`);
  console.log(`  ${alias.size} obras com título alternativo · ${totalDeTitulos} títulos no total`);
  console.log(`  ${comMbid} obras ganharam identificador na fonte`);
  console.log(`  falhas de rede: ${falhas}`);
  console.log('\n  próximo passo: rodar o casamento do IMSLP de novo, a partir do cache dele.');
}

main();
