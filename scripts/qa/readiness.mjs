/**
 * Prontidão — as sete perguntas, respondidas por máquina.
 *
 * POR QUE ISTO EXISTE
 * -------------------
 * Toda vez que uma tela ficava pronta, vinham as mesmas sete perguntas:
 *
 *   Está pronto? Está curado? Está persistente? Tem fluxo completo?
 *   Está protegido e isolado? Está integrado? Está sincronizado?
 *
 * E a resposta vinha em prosa, uma vez, na conversa — onde ela morre. No dia
 * seguinte ninguém sabia o que estava respondido, e o que faltava dependia de
 * alguém lembrar de anotar.
 *
 * Um relatório que não vira fila não serve. Pior: mapear tudo e não sanar na
 * ordem certa é trabalho perdido duas vezes — gasta-se para descobrir e
 * gasta-se de novo para redescobrir.
 *
 * Aqui as sete perguntas são verificações, o resultado é uma **fila ordenada
 * por prioridade**, e `npm run qa:todo` escreve essa fila dentro do
 * `CLAUDE_TODO.md`. A pergunta deixa de depender de quem lembra.
 *
 * O QUE ISTO NÃO RESPONDE
 * -----------------------
 * Se a tela está **boa**. Nenhuma das sete é sobre qualidade de desenho, de
 * texto no contexto ou de fluxo que leva ao lugar certo — essas continuam
 * precisando de navegador e de olho humano, e estão declaradas como tal.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { sources, stripComments } from './core.mjs';

const OUTLET = 'src/ui/screens/AppRouterOutlet.tsx';
const AUDIENCE = 'src/ui/navigation/audiencia.ts';

/**
 * As áreas do produto, como `80_INSTITUTIONAL_ARCHITECTURE.md` as define.
 *
 * Uma área é um conjunto de telas que serve ao mesmo propósito. A prontidão é
 * medida por área, e não por tela, porque "pronto" é uma propriedade do
 * percurso — uma tela isolada e perfeita dentro de uma área quebrada não está
 * pronta para ninguém.
 */
export const AREAS = [
  /**
   * "Visitante" NÃO é área: é camada transversal. O convite vive dentro da
   * Academia, do Atlas e da Comunidade, e medi-lo como se fosse uma área
   * própria produzia quatro pendências falsas — "não tem tela", "não grava",
   * "não integra" — sobre um componente que nunca teria nada disso.
   *
   * A prontidão do visitante é medida por `checkPersonalSectionWithoutSession`
   * e pela fase V do `CLAUDE_TODO.md`.
   */
  { id: 'academia', nome: 'Academia', pastas: ['academy'], prefixos: ['/academia'] },
  { id: 'laboratorio', nome: 'Laboratório', pastas: ['practice'], prefixos: ['/practice'] },
  { id: 'atlas', nome: 'Atlas', pastas: ['worlds'], prefixos: ['/worlds'] },
  { id: 'comunidade', nome: 'Comunidade', pastas: ['community'], prefixos: ['/community'] },
  { id: 'perfil', nome: 'Perfil', pastas: ['profile'], prefixos: ['/profile'] },
  { id: 'console', nome: 'Console', pastas: ['admin'], prefixos: ['/founder'] },
  { id: 'estudio', nome: 'Estúdio', pastas: ['studio', 'score', 'violin'], prefixos: ['/studio', '/score', '/violin'] },
];

// ---------------------------------------------------------------------------
// Leituras compartilhadas
// ---------------------------------------------------------------------------

function outletMap() {
  const lines = stripComments(readFileSync(OUTLET, 'utf-8')).split('\n');
  const pares = [];
  let pendentes = [];
  for (const line of lines) {
    for (const m of line.matchAll(
      /currentPath\s*(?:===|\.startsWith\(|\.includes\()\s*'([^']+)'/g
    )) {
      pendentes.push(m[1]);
    }
    const tag = line.match(/<(\w+Screen)/);
    if (tag && pendentes.length) {
      for (const rota of pendentes) pares.push({ rota, tela: tag[1] });
      pendentes = [];
    }
  }
  return pares;
}

function audienceRoutes() {
  const src = readFileSync(AUDIENCE, 'utf-8');
  return [...src.matchAll(/rota:\s*'([^']+)',\s*\n?\s*audiencia:\s*'(\w+)'/g)].map((m) => ({
    rota: m[1],
    audiencia: m[2],
  }));
}

/** Componentes e telas de uma área, com o código já sem comentários. */
function arquivosDaArea(area) {
  return sources().filter(({ file }) => {
    if (file.includes('.test.')) return false;
    return area.pastas.some(
      (p) => file.includes(`/ui/screens/${p}/`) || file.includes(`/ui/components/${p}/`)
    );
  });
}

/** Repositório que existe e nenhuma tela ou serviço importa. */
export function orphanRepositories() {
  const dir = 'src/repositories';
  if (!existsSync(dir)) return [];

  const usados = sources()
    .filter(({ file }) => /\/ui\/|\/services\//.test(file))
    .map((f) => f.code)
    .join('\n');

  return readdirSync(dir)
    .filter((f) => f.endsWith('.repository.ts'))
    .map((f) => f.replace('.ts', ''))
    .filter((base) => !usados.includes(base));
}

// ---------------------------------------------------------------------------
// As sete perguntas
// ---------------------------------------------------------------------------

/**
 * Cada pergunta devolve `{ ok, detalhe }`. `detalhe` nunca é vazio quando
 * `ok` é falso: uma pendência sem descrição é uma pendência que ninguém
 * consegue pegar para resolver.
 */
function perguntas(area) {
  const arquivos = arquivosDaArea(area);
  const telas = arquivos.filter((f) => /\/ui\/screens\//.test(f.file));
  const componentes = arquivos.filter((f) => /\/ui\/components\//.test(f.file));
  const mapa = outletMap();
  const rotas = audienceRoutes();
  const codigo = arquivos.map((f) => f.code).join('\n');

  const nomeDe = (f) => f.file.split('/').pop().replace(/\.tsx?$/, '');
  const roteadas = new Set(mapa.map((p) => p.tela));

  // 1 · PRONTO — existe e é alcançável
  const semRota = [...telas, ...componentes]
    .filter((f) => /Screen|Board|Panel|Map|Form|Meters/.test(nomeDe(f)))
    .map(nomeDe)
    .filter((n) => !roteadas.has(n) && !componentes.some((c) => nomeDe(c) === n && codigoUsa(arquivos, n)));

  // 2 · CURADO — nada inventado dentro da tela
  const inventado = /const\s+(sample|mock|fake|demo|exemplo)\w*/i.test(codigo);

  // 3 · PERSISTENTE — a área grava o que produz
  const grava = /\b(save|salvar|record|registrar|append|set)\w*\s*\(/.test(codigo);

  // 4 · FLUXO COMPLETO — entra, age e sai
  const entra = telas.length > 0;
  const age = /onClick|onSubmit|onChange/.test(codigo);
  const sai = /navigate\(/.test(codigo);

  // 5 · PROTEGIDO — as rotas da área se declaram
  const prefixosDeclarados = area.prefixos.filter((p) =>
    rotas.some((r) => r.rota === p || r.rota.startsWith(p))
  );

  // 6 · INTEGRADO — conversa com o resto
  const integra = /Service\.|service\.|Repository\.|repository\./.test(codigo);

  // 7 · SINCRONIZADO — o que grava é lido de volta
  const orfaos = orphanRepositories().filter((r) =>
    area.pastas.some((p) => r.includes(p) || p.includes(r.split('.')[0]))
  );

  return [
    {
      chave: 'pronto',
      pergunta: 'Está pronto?',
      ok: telas.length > 0 && semRota.length === 0,
      detalhe:
        telas.length === 0
          ? 'a área não tem tela'
          : semRota.length
            ? `${semRota.length} sem rota: ${semRota.slice(0, 4).join(', ')}`
            : '',
      peso: 10,
    },
    {
      chave: 'protegido',
      pergunta: 'Está protegido e isolado?',
      ok: prefixosDeclarados.length === area.prefixos.length,
      detalhe: prefixosDeclarados.length
        ? ''
        : `nenhum prefixo declarado em audiencia.ts: ${area.prefixos.join(', ')}`,
      peso: 9,
    },
    {
      chave: 'curado',
      pergunta: 'Está curado?',
      ok: !inventado,
      detalhe: inventado ? 'há dado de exemplo escrito na própria tela' : '',
      peso: 8,
    },
    {
      chave: 'persistente',
      pergunta: 'Está persistente?',
      ok: grava,
      detalhe: grava ? '' : 'a área não grava nada do que a pessoa faz',
      peso: 7,
    },
    {
      chave: 'sincronizado',
      pergunta: 'Está sincronizado?',
      ok: orfaos.length === 0,
      detalhe: orfaos.length ? `repositório que ninguém chama: ${orfaos.join(', ')}` : '',
      peso: 6,
    },
    {
      chave: 'integrado',
      pergunta: 'Está integrado?',
      ok: integra,
      detalhe: integra ? '' : 'nenhuma chamada a serviço ou repositório',
      peso: 5,
    },
    {
      chave: 'fluxo',
      pergunta: 'Tem fluxo completo?',
      ok: entra && age && sai,
      detalhe:
        entra && age && sai
          ? ''
          : `falta ${[!entra && 'entrada', !age && 'ação', !sai && 'saída'].filter(Boolean).join(', ')}`,
      peso: 4,
    },
  ];
}

function codigoUsa(arquivos, nome) {
  return arquivos.some((f) => new RegExp(`<${nome}\\b`).test(f.code));
}

// ---------------------------------------------------------------------------
// Relatório
// ---------------------------------------------------------------------------

export function readinessReport() {
  return AREAS.map((area) => {
    const qs = perguntas(area);
    const respondidas = qs.filter((q) => q.ok).length;
    return {
      area: area.nome,
      id: area.id,
      respondidas,
      total: qs.length,
      perguntas: qs,
    };
  });
}

/**
 * A fila, ordenada por prioridade.
 *
 * A ordem não é alfabética nem por área: é por **peso da pergunta**. Tela
 * inalcançável vem antes de tela desprotegida, que vem antes de tela com dado
 * inventado — porque consertar na ordem errada significa proteger o que
 * ninguém alcança, e curar o conteúdo de uma tela que ainda não abre.
 */
export function priorityQueue() {
  const fila = [];
  for (const linha of readinessReport()) {
    for (const q of linha.perguntas) {
      if (q.ok) continue;
      fila.push({
        area: linha.area,
        chave: q.chave,
        pergunta: q.pergunta,
        detalhe: q.detalhe,
        peso: q.peso,
      });
    }
  }
  return fila.sort((a, b) => b.peso - a.peso || a.area.localeCompare(b.area));
}

/** Para o pente fino: pendência de prontidão é achado, e não estatística. */
export function checkReadiness() {
  return priorityQueue().map((p) => ({
    file: `área: ${p.area}`,
    detail: `${p.pergunta} não — ${p.detalhe}`,
  }));
}
