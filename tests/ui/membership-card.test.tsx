// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MembershipCardPanel } from '../../src/ui/components/passport/MembershipCardPanel';
import { EMPTY_MEMBERSHIP_CARD, MembershipCard } from '../../src/domain/membership';

/**
 * A carteira de pertencimento.
 *
 * O caso que carrega este arquivo é o do vazio. Em toda a plataforma dado
 * inventado é proibido; aqui seria pior, porque pertencimento falso é
 * afirmação sobre a vida da pessoa — dizer que ela é de uma Casa que nunca
 * escolheu.
 */

const CHEIA: MembershipCard = {
  enrolledCourses: [{ id: 'c_violino', title: 'Violino' }],
  guilds: [{ id: 'guild_violin', name: 'Grêmio de Violino' }],
  labs: [{ id: 'lab_violin', name: 'Laboratório de Violino' }],
  houses: [{ id: 'house_violinists', name: 'Casa do Violino' }],
  clubs: [{ id: 'club_barroco', name: 'Clube de Violino Barroco', guildId: 'guild_violin' }],
};

const montar = (card: MembershipCard) => {
  const onEnroll = vi.fn();
  const onPractice = vi.fn();
  const onExploreClubs = vi.fn();
  render(
    <MembershipCardPanel
      card={card}
      onEnroll={onEnroll}
      onPractice={onPractice}
      onExploreClubs={onExploreClubs}
    />
  );
  return { onEnroll, onPractice, onExploreClubs };
};

describe('as seis perguntas aparecem sempre', () => {
  it('os cinco termos estão na carteira, cheia ou vazia', () => {
    montar(EMPTY_MEMBERSHIP_CARD);
    for (const termo of ['Academia', 'Grêmio', 'Laboratório', 'Casa', 'Clube']) {
      expect(screen.getByText(termo)).toBeInTheDocument();
    }
  });

  it('a carteira cheia mostra o que a pessoa tem', () => {
    montar(CHEIA);
    expect(screen.getByText('Grêmio de Violino')).toBeInTheDocument();
    expect(screen.getByText('Casa do Violino')).toBeInTheDocument();
    expect(screen.getByText('Clube de Violino Barroco')).toBeInTheDocument();
  });
});

describe('vazio é vazio', () => {
  it('não sugere Grêmio, Casa nem Clube nenhum', () => {
    /**
     * Um passaporte que começa parecendo usado tira o sentido de usá-lo — e
     * aqui inventaria pertencimento que a pessoa não escolheu.
     */
    const { container } = render(
      <MembershipCardPanel
        card={EMPTY_MEMBERSHIP_CARD}
        onEnroll={vi.fn()}
        onPractice={vi.fn()}
        onExploreClubs={vi.fn()}
      />
    );
    expect(container.textContent).not.toMatch(/sugerid|recomendad|exemplo|Casa do Violino/i);
  });

  it('a linha vazia diz COMO se entra, em vez de só faltar', () => {
    // Ausência explicada é orientação; ausência escondida é buraco.
    montar(EMPTY_MEMBERSHIP_CARD);
    expect(screen.getByText(/vem junto com a matrícula/i)).toBeInTheDocument();
    expect(screen.getByText(/abre com prática recorrente/i)).toBeInTheDocument();
    expect(screen.getByText(/criados pela Comunidade, dentro de um Grêmio/i)).toBeInTheDocument();
  });

  it('o que se pode fazer agora vira botão', () => {
    const user = userEvent.setup();
    const { onEnroll } = montar(EMPTY_MEMBERSHIP_CARD);
    expect(screen.getByRole('button', { name: /ver cursos/i })).toBeInTheDocument();
    return user.click(screen.getByRole('button', { name: /ver cursos/i })).then(() => {
      expect(onEnroll).toHaveBeenCalled();
    });
  });

  it('Grêmio e Casa não ganham botão — não se pede para entrar', () => {
    /**
     * Os dois são consequência: o Grêmio da matrícula, a Casa da prática.
     * Um botão ali prometeria uma ação que não existe.
     */
    montar(EMPTY_MEMBERSHIP_CARD);
    expect(screen.queryByRole('button', { name: /entrar no grêmio/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /entrar na casa/i })).not.toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('linha preenchida não mostra mais o convite', () => {
    montar(CHEIA);
    expect(screen.queryByRole('button', { name: /ver cursos/i })).not.toBeInTheDocument();
  });
});

describe('o texto de cabeçalho explica a estrutura', () => {
  it('diz de onde vem cada pertencimento', () => {
    montar(EMPTY_MEMBERSHIP_CARD);
    expect(
      screen.getByText(/Grêmio vem do curso, a Casa vem da prática, o Clube vem de você/i)
    ).toBeInTheDocument();
  });
});
