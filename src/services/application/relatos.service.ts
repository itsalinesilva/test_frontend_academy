import { apiClient } from '../../infrastructure/api/api-client';

/**
 * O relato de problema num exercício, do lado da tela (L-7a).
 *
 * Devolve o resultado em vez de lançar: a tela precisa DIZER se o relato
 * chegou. "Reportado. Vamos revisar." só aparece com o servidor tendo
 * guardado; se não guardou — sem sessão, sem armazenamento configurado, sem
 * rede —, a pessoa sabe que o relato não foi.
 */
export interface RelatoDoServidor {
  id: string;
  exerciseId: string;
  enunciado: string;
  comentario?: string;
  autorEmail: string;
  em: string;
}

export type ResultadoDoEnvio = { ok: true } | { ok: false; motivo: string };

export const relatosService = {
  async enviar(relato: { exerciseId: string; enunciado: string; comentario?: string }): Promise<ResultadoDoEnvio> {
    try {
      await apiClient.post('/relatos', relato);
      return { ok: true };
    } catch (e) {
      return { ok: false, motivo: e instanceof Error ? e.message : 'Falha ao enviar o relato.' };
    }
  },

  async listar(): Promise<{ ok: true; relatos: RelatoDoServidor[] } | { ok: false; motivo: string }> {
    try {
      const r = await apiClient.get<{ relatos: RelatoDoServidor[] }>('/founder/relatos');
      return { ok: true, relatos: r.relatos };
    } catch (e) {
      return { ok: false, motivo: e instanceof Error ? e.message : 'Falha ao ler os relatos.' };
    }
  },
};
