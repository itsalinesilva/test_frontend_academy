import { useEffect, useState } from 'react';
import { authService } from '../../services/application/auth.service';

/**
 * Identidade de quem está usando a plataforma agora.
 *
 * POR QUE ESTE HOOK EXISTE
 * ------------------------
 * Dezessete pontos das telas de Prática cravavam `'usr_founder_1'`. Todo
 * progresso de todo mundo — tentativas, XP, ofensiva, meta diária, domínio —
 * era gravado no perfil da fundadora. Depois que o seed dela foi removido,
 * passaram a gravar num perfil que nem existe.
 *
 * A causa não foi descuido isolado: era repetir a mesma resolução de sessão
 * em cada tela, à mão. Este hook remove a repetição, e com ela a chance de
 * alguém esquecer de fazê-la na próxima tela.
 *
 * `null` significa "ainda carregando ou sem sessão" — e as telas tratam isso
 * como estado, não gravando nada em nome de ninguém.
 */
export function useUsuarioAtual() {
  const [userId, setUserId] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    authService
      .getActiveSession()
      .then((sessao) => {
        if (ativo) setUserId(sessao?.user.id ?? null);
      })
      .catch(() => {
        if (ativo) setUserId(null);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  return { userId, carregando, autenticado: userId !== null };
}
