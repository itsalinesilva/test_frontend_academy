// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { GuardaDeAudiencia } from '../../src/ui/navigation/GuardaDeAudiencia';

/**
 * A guarda, em fluxo real.
 *
 * Os testes de `hierarchy-and-isolation` conferem a **tabela**; estes conferem
 * o que de fato acontece na tela quando cada um dos três públicos abre cada
 * tipo de rota. Tabela certa com guarda errada protege exatamente nada.
 */

const navigate = vi.fn();
let caminho = '/';

vi.mock('../../src/ui/navigation/router', () => ({
  useRouter: () => ({ currentPath: caminho, navigate }),
}));

let sessao: { userId: string | null; ehAdmin: boolean; carregando: boolean } = {
  userId: null,
  ehAdmin: false,
  carregando: false,
};

vi.mock('../../src/ui/hooks/useCurrentUser', () => ({
  useCurrentUser: () => sessao,
}));

const CONTEUDO = 'conteúdo protegido';

const abrir = (rota: string, quem: typeof sessao) => {
  caminho = rota;
  sessao = quem;
  return render(
    <GuardaDeAudiencia>
      <p>{CONTEUDO}</p>
    </GuardaDeAudiencia>
  );
};

const VISITANTE = { userId: null, ehAdmin: false, carregando: false };
const ALUNO = { userId: 'u_ana', ehAdmin: false, carregando: false };
const ADMIN = { userId: 'u_fund', ehAdmin: true, carregando: false };

beforeEach(() => {
  navigate.mockClear();
});

describe('rota pública', () => {
  it('abre para os três', () => {
    for (const quem of [VISITANTE, ALUNO, ADMIN]) {
      const { unmount } = abrir('/academia', quem);
      expect(screen.getByText(CONTEUDO)).toBeInTheDocument();
      unmount();
    }
  });

  it('não espera pela sessão — o catálogo abre na hora', () => {
    /**
     * Se a rota pública esperasse, o visitante veria "Verificando sua
     * sessão…" antes do catálogo. É o pior primeiro contato possível: a
     * plataforma pedindo identidade antes de dizer o que é.
     */
    abrir('/academia', { userId: null, ehAdmin: false, carregando: true });
    expect(screen.getByText(CONTEUDO)).toBeInTheDocument();
    expect(screen.queryByText(/verificando/i)).not.toBeInTheDocument();
  });
});

describe('rota que exige login', () => {
  it('o visitante recebe convite, e não redirecionamento', () => {
    /**
     * Mandar para `/auth/login` apagaria o endereço que a pessoa queria. O
     * convite preserva a rota, e quem entra volta para onde estava.
     */
    abrir('/profile', VISITANTE);
    expect(screen.queryByText(CONTEUDO)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /é da sua conta/i })).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('o aluno entra', () => {
    abrir('/profile', ALUNO);
    expect(screen.getByText(CONTEUDO)).toBeInTheDocument();
  });

  it('o admin também entra — administração não tira a condição de aluno', () => {
    abrir('/profile', ADMIN);
    expect(screen.getByText(CONTEUDO)).toBeInTheDocument();
  });
});

describe('rota que exige administração', () => {
  it('o visitante não passa', () => {
    abrir('/founder', VISITANTE);
    expect(screen.queryByText(CONTEUDO)).not.toBeInTheDocument();
  });

  it('o ALUNO LOGADO não passa', () => {
    /**
     * É a razão de o nível existir. Enquanto a rota se chamava `/admin` e era `exigeLogin`, a
     * tabela dizia que qualquer aluno alcançava o console, e só um segundo
     * sistema — não auditado — impedia.
     */
    abrir('/founder', ALUNO);
    expect(screen.queryByText(CONTEUDO)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /não está disponível/i })).toBeInTheDocument();
  });

  it('o admin passa', () => {
    abrir('/founder', ADMIN);
    expect(screen.getByText(CONTEUDO)).toBeInTheDocument();
  });

  it('a subrota herda a exigência', () => {
    abrir('/founder/users', ALUNO);
    expect(screen.queryByText(CONTEUDO)).not.toBeInTheDocument();
  });

  it('a recusa NÃO descreve o que há do outro lado', () => {
    /**
     * Descrever o console a quem não pode entrar é dar o mapa da casa a quem
     * bateu na porta errada. E não se distingue "não existe" de "não é para
     * você".
     */
    const { container } = abrir('/founder', ALUNO);
    expect(container.textContent).not.toMatch(
      /usuários|motores|moderação|auditoria|credenciais|console/i
    );
  });
});

describe('rota só de visitante', () => {
  it('quem não entrou vê a tela de entrar', () => {
    abrir('/auth/login', VISITANTE);
    expect(screen.getByText(CONTEUDO)).toBeInTheDocument();
  });

  it('quem já entrou é avisado de que não há o que fazer ali', () => {
    abrir('/auth/login', ALUNO);
    expect(screen.queryByText(CONTEUDO)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /já está na sua conta/i })).toBeInTheDocument();
  });
});

describe('enquanto a sessão carrega', () => {
  it('rota protegida não mostra o conteúdo antes de saber quem é', async () => {
    /**
     * Mostrar primeiro e esconder depois é pior que esperar: o conteúdo já
     * apareceu, e num print ou numa gravação de tela ele ficou.
     */
    abrir('/founder', { userId: null, ehAdmin: false, carregando: true });
    await waitFor(() => {
      expect(screen.queryByText(CONTEUDO)).not.toBeInTheDocument();
    });
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
