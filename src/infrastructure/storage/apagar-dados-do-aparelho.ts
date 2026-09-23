import { LocalStorageAdapter } from './storage-adapter';
import { lerPreferencias, salvarPreferencias } from '../../repositories/preferencias.repository';

/**
 * Apagar do aparelho tudo o que a plataforma guardou (AUD-17).
 *
 * Sair da conta apagava só a sessão. Ficavam no navegador a lista de contas
 * que entraram ali (com e-mail), perfis, prática, progresso, caderno,
 * gravações da mesa. Em computador de escola ou de biblioteca, a próxima
 * pessoa lia tudo pelas ferramentas do navegador.
 *
 * Fica só a preferência de acessibilidade: é do aparelho, não da pessoa, e
 * quem precisa de contraste alto precisa dele já na tela de entrada.
 *
 * Os bancos e chaves conhecidos estão listados aqui; um dado novo guardado
 * fora do prefixo `amd_` precisa entrar nesta lista — a guarda de teste
 * procura chaves soltas no código.
 */
export const BANCOS_INDEXEDDB = ['muscicapa-mesa'] as const;
export const CHAVES_SEM_PREFIXO = ['onboarding_draft_state_v2'] as const;

export async function apagarDadosDoAparelho(): Promise<void> {
  const preferencias = lerPreferencias();

  await new LocalStorageAdapter().clear();
  for (const chave of CHAVES_SEM_PREFIXO) {
    try {
      window.localStorage.removeItem(chave);
    } catch {
      // armazenamento bloqueado: nada a apagar
    }
  }
  try {
    window.sessionStorage.clear();
  } catch {
    // idem
  }

  if (typeof indexedDB !== 'undefined') {
    await Promise.all(
      BANCOS_INDEXEDDB.map(
        (nome) =>
          new Promise<void>((ok) => {
            const pedido = indexedDB.deleteDatabase(nome);
            pedido.onsuccess = pedido.onerror = pedido.onblocked = () => ok();
          })
      )
    );
  }

  salvarPreferencias(preferencias);
}
