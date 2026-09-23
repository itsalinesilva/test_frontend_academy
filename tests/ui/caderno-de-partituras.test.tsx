// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider } from '../../src/ui/navigation/router';
import { AppRouterOutlet } from '../../src/ui/screens/AppRouterOutlet';
import {
  PartituraDoCaderno,
  compassosDoCaderno,
  compassosQueTransbordam,
  nomeDeArquivo,
  paraMIDI,
  paraMusicXML,
  problemasDaPartitura,
  roteiroDeSom,
} from '../../src/domain/caderno';
import { webAudioSynth } from '../../src/infrastructure/audio/synth';

/**
 * M-10 — O ESTÚDIO DEIXA DE SER FACHADA: o caderno de partituras.
 */

vi.mock('../../src/infrastructure/audio/synth', () => ({
  webAudioSynth: { playTone: vi.fn(), playChord: vi.fn(), playSequence: vi.fn() },
}));

let sessao: { userId: string | null; nome: string | null } = { userId: 'u1', nome: 'Aline' };
vi.mock('../../src/ui/hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({ ...sessao, ehAdmin: false, carregando: false, autenticado: sessao.userId !== null }),
}));

const peca = (over: Partial<PartituraDoCaderno> = {}): PartituraDoCaderno => ({
  id: 'p1',
  autorId: 'u1',
  titulo: 'Minha peça nº 1',
  clave: 'treble',
  formula: '2/4',
  andamento: 60,
  notas: [
    { nota: 'C4', figura: 'quarter' },
    { nota: 'F#4', figura: 'quarter' },
    { nota: null, figura: 'half' },
    { nota: 'Bb4', figura: 'eighth' },
  ],
  criadaEm: '2026-09-22T00:00:00.000Z',
  atualizadaEm: '2026-09-22T00:00:00.000Z',
  ...over,
});

describe('o domínio', () => {
  it('compassos pela duração: semínima + semínima | mínima | colcheia', () => {
    expect(compassosDoCaderno(peca().notas, '2/4').map((c) => c.length)).toEqual([2, 1, 1]);
    expect(compassosQueTransbordam([{ nota: 'C4', figura: 'whole' }], '2/4')).toEqual([1]);
  });

  it('o som respeita a figura e o andamento', () => {
    const r = roteiroDeSom(peca());
    expect(r.map((x) => x.segundos)).toEqual([1, 1, 2, 0.5]);
    expect(r[2].hz, 'pausa não soa').toBe(0);
  });

  it('recusa partitura sem título, vazia ou com andamento impossível — e diz o porquê', () => {
    expect(problemasDaPartitura(peca({ titulo: ' ' }))[0]).toMatch(/título/);
    expect(problemasDaPartitura(peca({ notas: [] }))[0]).toMatch(/vazia/);
    expect(problemasDaPartitura(peca({ andamento: 10 }))[0]).toMatch(/andamento/);
  });

  it('🔴 o MusicXML é XML de verdade, com compasso, alteração e pausa', () => {
    const doc = new DOMParser().parseFromString(paraMusicXML(peca()), 'application/xml');
    expect(doc.querySelector('parsererror'), 'XML malformado').toBeNull();
    expect(doc.querySelectorAll('measure')).toHaveLength(3);
    expect(doc.querySelector('work-title')!.textContent).toBe('Minha peça nº 1');
    expect(doc.querySelector('beats')!.textContent).toBe('2');
    const notas = [...doc.querySelectorAll('note')];
    expect(notas[1].querySelector('alter')!.textContent).toBe('1');
    expect(notas[2].querySelector('rest')).not.toBeNull();
    expect(notas[3].querySelector('alter')!.textContent).toBe('-1');
    expect(notas[3].querySelector('type')!.textContent).toBe('eighth');
  });

  it('🔴 o MIDI tem cabeçalho, andamento e o dó central em 60', () => {
    const m = paraMIDI(peca());
    const texto = (i: number) => String.fromCharCode(...m.slice(i, i + 4));
    expect(texto(0)).toBe('MThd');
    expect(texto(14)).toBe('MTrk');
    /** 60 BPM = 1.000.000 µs por semínima = 0x0F4240. */
    const i = m.findIndex((b, k) => b === 0xff && m[k + 1] === 0x51);
    expect([...m.slice(i + 3, i + 6)]).toEqual([0x0f, 0x42, 0x40]);
    const ligadas = [...m].map((b, k) => (b === 0x90 ? m[k + 1] : null)).filter((x) => x !== null);
    expect(ligadas).toEqual([60, 66, 70]);
  });

  it('nome de arquivo sem acento nem espaço', () => {
    expect(nomeDeArquivo('Minha peça nº 1')).toBe('minha-peca-n-1');
  });
});

describe('🔴 na tela', () => {
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
    sessao = { userId: 'u1', nome: 'Aline' };
    vi.mocked(webAudioSynth.playTone).mockClear();
    irPara('/');
  });

  it('escrever, tocar, guardar, achar no hub e reabrir', async () => {
    const user = userEvent.setup();
    irPara('/studio/score');
    const { unmount } = montar();

    await user.type(await screen.findByLabelText('Título', {}, { timeout: 20000 }), 'Estudo em dó');
    await user.click(screen.getByRole('button', { name: 'Escrever dó' }));
    await user.click(screen.getByRole('button', { name: 'Escrever mi' }));
    await user.selectOptions(screen.getByLabelText('Figura'), 'half');
    await user.click(screen.getByRole('button', { name: 'Escrever sol' }));

    /** A pauta mostra o que foi escrito — na altura certa, e não o exemplo fixo de antes. */
    const pauta = document.getElementById('caderno-pauta')!;
    expect([...pauta.querySelectorAll('[data-nota]')].map((g) => g.getAttribute('data-nota'))).toEqual([
      'C4',
      'E4',
      'G4',
    ]);
    expect(screen.queryByText(/Estudo Contrapontístico/)).toBeNull();

    vi.useFakeTimers({ shouldAdvanceTime: true });
    await user.click(screen.getByRole('button', { name: 'Tocar' }));
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    vi.useRealTimers();
    expect(vi.mocked(webAudioSynth.playTone).mock.calls.map((c) => Math.round(c[0]))).toEqual([262, 330, 392]);

    await user.click(screen.getByRole('button', { name: /Guardar no caderno/ }));
    expect(await screen.findByText('Guardada no seu caderno.')).toBeInTheDocument();

    unmount();
    irPara('/studio');
    montar();
    const item = await screen.findByRole('button', { name: /^Estudo em dó/ }, { timeout: 20000 });
    await user.click(item);
    expect(await screen.findByDisplayValue('Estudo em dó', {}, { timeout: 20000 })).toBeInTheDocument();
    expect(document.getElementById('caderno-pauta')!.querySelectorAll('[data-nota]')).toHaveLength(3);
  });

  it('guardar sem título é recusado, e o motivo aparece', async () => {
    const user = userEvent.setup();
    irPara('/studio/score');
    montar();
    await user.click(await screen.findByRole('button', { name: 'Escrever dó' }, { timeout: 20000 }));
    await user.click(screen.getByRole('button', { name: /Guardar no caderno/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/título/);
  });

  it('baixar gera MusicXML e MIDI de verdade', async () => {
    const user = userEvent.setup();
    const tipos: string[] = [];
    URL.createObjectURL = vi.fn((b: Blob) => {
      tipos.push(b.type);
      return 'blob:x';
    }) as typeof URL.createObjectURL;
    URL.revokeObjectURL = vi.fn();
    irPara('/studio/score');
    montar();
    await user.click(await screen.findByRole('button', { name: 'Escrever ré' }, { timeout: 20000 }));
    await user.click(screen.getByRole('button', { name: /Baixar MusicXML/ }));
    await user.click(screen.getByRole('button', { name: /Baixar MIDI/ }));
    expect(tipos).toEqual(['application/vnd.recordare.musicxml+xml', 'audio/midi']);
  });

  it('visitante escreve, toca e baixa — mas guardar exige conta', async () => {
    sessao = { userId: null, nome: null };
    irPara('/studio/score');
    montar();
    await screen.findByRole('button', { name: 'Escrever dó' }, { timeout: 20000 });
    expect(screen.getByRole('button', { name: /Guardar no caderno/ })).toBeDisabled();
  });

  it('o hub não aponta mais para projeto inventado', async () => {
    irPara('/studio');
    montar();
    await screen.findByText(/Seu caderno de partituras/, {}, { timeout: 20000 });
    expect(document.body.innerHTML).not.toMatch(/arranjo-satb-coral/);
    const lista = screen.getByRole('region', { name: /Seu caderno/ });
    expect(within(lista).getByText(/Ainda vazio/)).toBeInTheDocument();
  });
});
