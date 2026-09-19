// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VisitorInvitation } from '../../src/ui/components/visitor/VisitorInvitation';

/**
 * O convite ao visitante.
 *
 * Ele substitui o trilho que dizia, a quem nunca entrou, *"Seu progresso —
 * você ainda não se matriculou"*. Para quem chega de fora aquilo não era uma
 * seção vazia: era uma seção **sem sujeito**.
 *
 * O que estes casos guardam é que o convite continue sendo um convite —
 * informa antes de pedir, não inventa número, e diz a ressalva institucional
 * na apresentação em vez de escondê-la.
 */

const montar = (props: Partial<Parameters<typeof VisitorInvitation>[0]> = {}) => {
  const onPrimary = vi.fn();
  const onSecondary = vi.fn();
  const r = render(
    <VisitorInvitation
      space="Academia"
      summary="A estrutura curricular do Conservatório."
      highlights={[
        { value: '5', label: 'cursos' },
        { value: '126', label: 'disciplinas' },
      ]}
      steps={[
        { title: 'Escolha um curso', description: 'O catálogo é aberto.' },
        { title: 'Matricule-se', description: 'Com a conta Google.' },
      ]}
      primaryLabel="Entrar e me matricular"
      onPrimary={onPrimary}
      secondaryLabel="Ver o catálogo antes"
      onSecondary={onSecondary}
      disclaimer="Cursos livres, com certificação própria. Não têm reconhecimento do MEC."
      {...props}
    />
  );
  return { onPrimary, onSecondary, container: r.container };
};

describe('responde na ordem em que a dúvida aparece', () => {
  it('diz o que é o espaço antes de pedir qualquer coisa', () => {
    /**
     * Começar pela chamada à ação seria pedir decisão antes de dar
     * informação — e é o que a maioria das telas de captura faz.
     */
    const { container } = montar();
    const texto = container.textContent ?? '';
    expect(texto.indexOf('estrutura curricular')).toBeLessThan(
      texto.indexOf('Entrar e me matricular')
    );
  });

  it('mostra o que a pessoa leva, em números', () => {
    montar();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('cursos')).toBeInTheDocument();
  });

  it('mostra como se começa, em passos numerados', () => {
    montar();
    expect(screen.getByText('Escolha um curso')).toBeInTheDocument();
    expect(screen.getByText('Matricule-se')).toBeInTheDocument();
  });
});

describe('não conta nada por conta própria', () => {
  it('sem números recebidos, não inventa nenhum', () => {
    /**
     * Contar aqui exigiria buscar dados que a tela já tem, e duas contagens
     * divergem. Número inventado num convite é pior que em qualquer outro
     * lugar: é a primeira coisa que a pessoa lê.
     */
    const { container } = render(
      <VisitorInvitation
        space="Atlas"
        summary="O mapa das eras."
        primaryLabel="Entrar"
        onPrimary={vi.fn()}
      />
    );
    expect(container.querySelectorAll('dl')).toHaveLength(0);
  });

  it('sem passos, não desenha a lista vazia', () => {
    const { container } = render(
      <VisitorInvitation
        space="Atlas"
        summary="O mapa das eras."
        primaryLabel="Entrar"
        onPrimary={vi.fn()}
      />
    );
    expect(container.querySelectorAll('ol')).toHaveLength(0);
  });
});

describe('a ressalva fica na apresentação', () => {
  it('curso livre se declara aqui, e não num rodapé de termo', () => {
    montar();
    expect(screen.getByText(/não têm reconhecimento do MEC/i)).toBeInTheDocument();
  });

  it('espaço sem ressalva não ganha uma', () => {
    montar({ disclaimer: undefined });
    expect(screen.queryByText(/MEC/i)).not.toBeInTheDocument();
  });
});

describe('as duas saídas funcionam', () => {
  it('a principal leva ao acesso', async () => {
    const user = userEvent.setup();
    const { onPrimary } = montar();
    await user.click(screen.getByRole('button', { name: /entrar e me matricular/i }));
    expect(onPrimary).toHaveBeenCalled();
  });

  it('a secundária deixa olhar antes de decidir', async () => {
    // Quem não quer criar conta agora precisa de um caminho que não seja sair.
    const user = userEvent.setup();
    const { onSecondary } = montar();
    await user.click(screen.getByRole('button', { name: /ver o catálogo antes/i }));
    expect(onSecondary).toHaveBeenCalled();
  });

  it('sem saída secundária, só a principal aparece', () => {
    montar({ secondaryLabel: undefined, onSecondary: undefined });
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });
});

describe('o que ele NÃO diz', () => {
  it('não fala de progresso, matrícula ou histórico de quem não tem', () => {
    const { container } = montar();
    expect(container.textContent).not.toMatch(/seu progresso|você ainda não|nenhum resultado/i);
  });
});
