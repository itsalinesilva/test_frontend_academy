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
export function useCurrentUser() {
  const [userId, setUserId] = useState<string | null>(null);
  const [nome, setNome] = useState<string | null>(null);
  const [ehAdmin, setEhAdmin] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    authService
      .getActiveSession()
      .then((sessao) => {
        if (!ativo) return;
        setUserId(sessao?.user.id ?? null);
        setNome(sessao?.user.name ?? null);
        /**
         * `isAdmin` vem da SESSÃO, que o servidor assinou a partir da
         * allowlist em variável de ambiente. Nunca de `user.primaryRole`,
         * nunca de comparação de e-mail no cliente — foi assim que a
         * auditoria S-02 encontrou a plataforma, e é a conclusão que não
         * pode voltar: quem edita o localStorage viraria administrador.
         */
        setEhAdmin(sessao?.isAdmin === true);
      })
      .catch(() => {
        if (!ativo) return;
        setUserId(null);
        setNome(null);
        setEhAdmin(false);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  /**
   * `nome` sai junto porque o que o aluno cria leva o nome dele.
   *
   * Uma sala de aula, uma avaliação de curso e um item de portfólio precisam
   * registrar a autoria no momento em que nascem. Sem isso, cada tela voltaria
   * a buscar a sessão por conta própria — que é exatamente o padrão que fez
   * dezessete telas gravarem tudo no perfil errado.
   */
  return { userId, nome, ehAdmin, carregando, autenticado: userId !== null };
}
