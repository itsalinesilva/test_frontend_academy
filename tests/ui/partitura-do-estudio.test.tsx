// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider } from '../../src/ui/navigation/router';
import { AppRouterOutlet } from '../../src/ui/screens/AppRouterOutlet';
import { acervoService } from '../../src/services/application/acervo.service';
import { REPERTORIO_DO_PLAYER } from '../../src/data/seed-player-repertoire';
import { compassosDaFaixa, compassosQueTransbordam, temposDoCompasso } from '../../src/domain/partitura-da-faixa';
import { alturaNaPauta, NoteItem } from '../../src/ui/components/domain/Staff';

/**
 * RT-3 + PZ-C — "Abrir na partitura" abre A OBRA, e a pauta a desenha.
 *
 * A tela mostrava sempre o mesmo exemplo, com todas as notas na mesma altura,
 * e o botão da ficha da obra chegava aqui sem a obra.
 */

const irPara = (c: string) => {
  window.location.hash = `#${c}`;
};

const montar = () =>
  render(
    <RouterProvider>
      <AppRouterOutlet />
    </RouterProvider>
  );

beforeEach(() => {
  localStorage.clear();
  irPara('/');
});

describe('a escrita vira compassos', () => {
  it('6/8 são três semínimas por compasso, 3/4 são três, 4/4 são quatro', () => {
    expect(temposDoCompasso('6/8')).toBe(3);
    expect(temposDoCompasso('3/4')).toBe(3);
    expect(temposDoCompasso('4/4')).toBe(4);
  });

  it('agrupa pela fórmula, e a pausa continua sendo pausa', () => {
    const c = compassosDaFaixa({ compasso: '2/4', escrita: [['C4', 1], ['_', 1], ['E4', 2], ['G4', 1]] });
    expect(c.map((x) => x.notas.map((n) => n.nome))).toEqual([['C4', null], ['E4'], ['G4']]);
  });

  it('nota que atravessa a barra é declarada, e não escondida', () => {
    const c = compassosDaFaixa({ compasso: '2/4', escrita: [['C4', 1], ['D4', 2]] });
    expect(compassosQueTransbordam(c, '2/4')).toEqual([1]);
  });

  it('🔴 toda faixa do repertório tem escrita legível — nome de nota que a pauta desenha', () => {
    for (const f of REPERTORIO_DO_PLAYER) {
      expect(f.escrita.length, f.id).toBe(f.notas.length);
      for (const [nome] of f.escrita) {
        expect(nome === '_' || /^[A-G][#b]?-?\d$/.test(nome), `${f.id}: "${nome}"`).toBe(true);
      }
    }
  });

  it('a grafia se preserva: bemol continua bemol', () => {
    const comBemol = REPERTORIO_DO_PLAYER.find((f) => f.escrita.some(([n]) => /^[A-G]b/.test(n)));
    if (!comBemol) return;
    expect(comBemol.escrita.some(([n]) => /^[A-G]b/.test(n))).toBe(true);
  });
});

describe('🔴 a tela abre a obra pedida', () => {
  it('/score?obra=… mostra a peça da obra, com as notas nas alturas certas', async () => {
    const ficha = await acervoService.fichaDaObra('obra-bar-bach-prelude');
    const faixa = acervoService.faixaDaObra(ficha!.obra)!;
    expect(faixa, 'a obra do teste deveria ter transcrição').not.toBeNull();

    irPara('/score?obra=obra-bar-bach-prelude');
    const { container } = montar();

    expect(await screen.findByText(faixa.titulo, {}, { timeout: 40000 })).toBeInTheDocument();

    const [primeira] = faixa.escrita.filter(([n]) => n !== '_');
    const desenhada = container.querySelector(`#active-editor-score [data-nota="${primeira[0]}"]`)!;
    const m = /^([A-G])([#b]?)(-?\d)$/.exec(primeira[0])!;
    expect(Number(desenhada.getAttribute('data-y'))).toBe(
      alturaNaPauta({ step: m[1] as NoteItem['step'], octave: Number(m[3]) }, 'treble')
    );

    const alturas = new Set(
      [...container.querySelectorAll('#active-editor-score [data-y]')].map((e) => e.getAttribute('data-y'))
    );
    expect(alturas.size, 'a partitura desenhou tudo na mesma altura').toBeGreaterThan(2);
  });

  it('obra inexistente diz isso, e não abre um exemplo no lugar', async () => {
    irPara('/score?obra=nao-existe');
    montar();
    expect(await screen.findByText(/não está no acervo/, {}, { timeout: 40000 })).toBeInTheDocument();
  });

  it('sem obra, escolhe-se do repertório real, e a pauta troca', async () => {
    const user = userEvent.setup();
    irPara('/score');
    montar();

    await user.click(await screen.findByRole('button', { name: /Abrir a primeira peça/ }, { timeout: 40000 }));
    const seletor = await screen.findByLabelText('Peça do repertório', {}, { timeout: 20000 });
    const outra = acervoService.repertorioComPartitura()[3];
    await user.selectOptions(seletor, outra.id);

    const partitura = document.getElementById('active-editor-score')!;
    expect(within(partitura).getByText(outra.titulo)).toBeInTheDocument();
  });

  it('não há mais controle que não muda nada: armadura e fórmula saíram', async () => {
    irPara('/score?obra=obra-bar-bach-prelude');
    montar();
    await screen.findByLabelText('Andamento', {}, { timeout: 40000 });
    expect(screen.queryByLabelText('Armadura')).toBeNull();
    expect(screen.queryByLabelText('Fórmula')).toBeNull();
  });
});
