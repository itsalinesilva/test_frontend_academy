import { PacoteEditorial, VERSAO_DO_PACOTE, lerPacote } from '../domain/pacote-editorial';

/**
 * A CAMADA PUBLICADA — o pacote editorial que entrou no repositório.
 *
 * 🔴 A PONTA QUE FALTAVA (EE-21)
 * ------------------------------
 * O desenho sempre foi:
 *
 * ```
 *   admin edita ──▶ localStorage ──▶ exportar ──▶ .json ──▶ commit ──▶ aluno
 * ```
 *
 * e a última seta não existia. Nenhum código lia o `.json` commitado: a
 * correção saía do navegador de quem editou, entrava no repositório, e o
 * aluno continuava lendo o texto antigo. Era o quinto caso de "projetado,
 * não ligado" — e o que dava sentido aos outros quatro.
 *
 * ONDE ELE MORA, E POR QUE ALI
 * ----------------------------
 * `public/editorial/pacote.json`, servido como arquivo estático e buscado uma
 * vez ao abrir a plataforma. Não entra no bundle: os livretos viajam inteiros,
 * e embuti-los faria todo visitante baixar 378 questões para abrir a capa.
 *
 * COMO AS CAMADAS SE EMPILHAM
 * ---------------------------
 * ```
 *   seed compilado  ◀── camada publicada (este arquivo) ◀── edição local
 * ```
 * Publicada e local se fundem pela mesma regra do pacote: **a mais nova vence,
 * por identificador**. Quem editou depois do último commit vê o próprio
 * trabalho; quem não editou vê o publicado.
 *
 * 🔴 O ARQUIVO AUSENTE NÃO É ERRO, O RECUSADO É
 * ---------------------------------------------
 * Sem pacote, a plataforma lê o seed — é o estado de uma instalação nova. Mas
 * um pacote commitado que não se lê (versão antiga, lista faltando) significa
 * que as correções publicadas **não estão valendo**, e isso precisa aparecer
 * para quem administra, e não num console que ninguém abre.
 */

export const CAMINHO_DA_CAMADA = '/editorial/pacote.json';

export type EstadoDaCamada =
  | { tipo: 'ausente' }
  | { tipo: 'carregada'; pacote: PacoteEditorial }
  | { tipo: 'recusada'; motivo: string };

const VAZIA: PacoteEditorial = {
  versao: VERSAO_DO_PACOTE,
  exportadoEm: '1970-01-01T00:00:00.000Z',
  edicoes: [],
  licoesCriadas: [],
  artigos: [],
  livretos: [],
  secoesDeLivro: [],
  removidos: [],
};

let estado: EstadoDaCamada = { tipo: 'ausente' };

/** O pacote publicado, ou um pacote vazio quando não há (ou foi recusado). */
export function camadaPublicada(): PacoteEditorial {
  return estado.tipo === 'carregada' ? estado.pacote : VAZIA;
}

export function estadoDaCamada(): EstadoDaCamada {
  return estado;
}

/** Para testes e para a importação local: define a camada sem rede. */
export function definirCamadaPublicada(texto: string | null): EstadoDaCamada {
  estado = interpretar(texto);
  return estado;
}

function interpretar(texto: string | null): EstadoDaCamada {
  if (texto === null) return { tipo: 'ausente' };

  /**
   * Um SPA devolve `index.html` para qualquer caminho que não existe — com
   * status 200. Sem esta conferência, a ausência do arquivo apareceria como
   * "pacote recusado: não é JSON", e o aviso vermelho mentiria.
   */
  if (texto.trimStart().startsWith('<')) return { tipo: 'ausente' };

  const leitura = lerPacote(texto);
  return leitura.ok
    ? { tipo: 'carregada', pacote: leitura.pacote }
    : { tipo: 'recusada', motivo: leitura.motivo };
}

/**
 * Busca a camada. Chamado uma vez, antes da primeira tela.
 *
 * Tem prazo: um arquivo estático que não responde em cinco segundos não pode
 * segurar a plataforma inteira em branco. Sem resposta, abre com o seed.
 */
export async function carregarCamadaPublicada(
  buscar: typeof fetch = fetch,
  prazoMs = 5000
): Promise<EstadoDaCamada> {
  const controle = new AbortController();
  const relogio = setTimeout(() => controle.abort(), prazoMs);

  try {
    const r = await buscar(CAMINHO_DA_CAMADA, { cache: 'no-cache', signal: controle.signal });
    estado = interpretar(r.ok ? await r.text() : null);
  } catch {
    estado = { tipo: 'ausente' };
  } finally {
    clearTimeout(relogio);
  }

  if (estado.tipo === 'recusada') {
    console.error(`[editorial] O pacote publicado foi recusado: ${estado.motivo}`);
  }
  return estado;
}
