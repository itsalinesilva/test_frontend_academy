import { apiClient } from '../../infrastructure/api/api-client';
import { Aviso, TipoDeAviso, notificacoesRepository } from '../../repositories/notificacoes.repository';

/**
 * A central de avisos (AUD-10): os PESSOAIS (certificado, nível — nascem no
 * app e vão para o Drive com a conta) e os das SALAS (o servidor calcula o
 * que aconteceu nas salas da pessoa).
 *
 * Servidor fora do ar não apaga os avisos pessoais: a central mostra o que
 * tem e diz que os das salas não chegaram.
 */
export interface AvisoNaTela {
  id: string;
  tipo: TipoDeAviso;
  titulo: string;
  texto: string;
  link: string;
  em: string;
  lido: boolean;
}

export interface Central {
  avisos: AvisoNaTela[];
  naoLidos: number;
  /** Motivo, quando os avisos das salas não vieram. */
  salasIndisponiveis?: string;
}

export async function lerCentral(userId: string): Promise<Central> {
  const lidasAte = notificacoesRepository.lidasAte(userId);
  const pessoais: Array<Omit<Aviso, 'userId'>> = notificacoesRepository.listar(userId);
  let dasSalas: Array<Omit<Aviso, 'userId'>> = [];
  let salasIndisponiveis: string | undefined;
  try {
    dasSalas = await apiClient.get<Array<Omit<Aviso, 'userId'>>>('/salas-novidades');
  } catch (e) {
    const m = e instanceof Error ? e.message : '';
    /** Salas não ligadas neste servidor não é falha: é ausência — sem aviso de erro. */
    if (!/não estão ligadas/.test(m)) salasIndisponiveis = 'Os avisos das salas não chegaram agora.';
  }
  const avisos = [...pessoais, ...dasSalas]
    .sort((a, b) => b.em.localeCompare(a.em))
    .map((a) => ({ ...a, lido: !!lidasAte && a.em <= lidasAte }));
  return { avisos, naoLidos: avisos.filter((a) => !a.lido).length, salasIndisponiveis };
}

export function marcarTodasComoLidas(userId: string): void {
  notificacoesRepository.marcarTodasComoLidas(userId);
}
