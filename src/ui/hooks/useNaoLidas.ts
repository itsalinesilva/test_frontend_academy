import { useEffect, useState } from 'react';
import { lerCentral } from '../../services/application/notificacoes.service';

/**
 * Quantos avisos a pessoa ainda não viu (AUD-10). Relido a cada troca de
 * tela: é quando a pessoa olha para o cabeçalho, e não custa ficar consultando
 * o servidor em segundo plano.
 */
export function useNaoLidas(userId: string | null | undefined, gatilho: string): number {
  const [n, setN] = useState(0);
  useEffect(() => {
    let vivo = true;
    if (!userId) {
      setN(0);
      return;
    }
    lerCentral(userId)
      .then((c) => vivo && setN(c.naoLidos))
      .catch(() => undefined);
    return () => {
      vivo = false;
    };
  }, [userId, gatilho]);
  return n;
}
