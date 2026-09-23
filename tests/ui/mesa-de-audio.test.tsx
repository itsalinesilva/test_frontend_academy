// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider } from '../../src/ui/navigation/router';
import { AppRouterOutlet } from '../../src/ui/screens/AppRouterOutlet';
import {
  PistaDaMesa,
  codificarWav,
  ganhoDoVolume,
  mixar,
  picosDasAmostras,
  pistasAudiveis,
  relogio,
} from '../../src/domain/mesa-de-audio';
import { GravacoesEmMemoria, MesaRepository } from '../../src/repositories/mesa.repository';

/**
 * E-9 — A MESA DE ÁUDIO GRAVA, TOCA, MIXA E GUARDA.
 */

const motor = vi.hoisted(() => ({
  disponivel: vi.fn(() => true),
  gravar: vi.fn(),
  decodificar: vi.fn(),
  tocar: vi.fn(),
}));
vi.mock('../../src/infrastructure/audio/motor-da-mesa', () => ({ motorDoNavegador: motor }));

let sessao: { userId: string | null; nome: string | null } = { userId: 'u1', nome: 'Aline' };
vi.mock('../../src/ui/hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({ ...sessao, ehAdmin: false, carregando: false, autenticado: sessao.userId !== null }),
}));

const pista = (over: Partial<PistaDaMesa>): PistaDaMesa => ({
  id: 'p',
  nome: 'P',
  volume: 80,
  mudo: false,
  solo: false,
  gravacaoId: 'g',
  ...over,
});

describe('as regras', () => {
  it('sem solo, soam as não mudas com gravação', () => {
    const ps = [pista({ id: 'a' }), pista({ id: 'b', mudo: true }), pista({ id: 'c', gravacaoId: undefined })];
    expect(pistasAudiveis(ps).map((p) => p.id)).toEqual(['a']);
  });

  it('com solo, só as em solo — e mudo vence solo', () => {
    const ps = [pista({ id: 'a', solo: true }), pista({ id: 'b' }), pista({ id: 'c', solo: true, mudo: true })];
    expect(pistasAudiveis(ps).map((p) => p.id)).toEqual(['a']);
  });

  it('volume 0 é silêncio, 100 é ganho unitário', () => {
    expect(ganhoDoVolume(0)).toBe(0);
    expect(ganhoDoVolume(100)).toBe(1);
    expect(ganhoDoVolume(50)).toBeCloseTo(0.25);
  });

  it('🔴 a forma de onda sai das amostras: silêncio sai reto, som sai alto', () => {
    const amostras = new Float32Array(1000);
    for (let i = 500; i < 1000; i++) amostras[i] = Math.sin(i) * 0.5;
    const p = picosDasAmostras(amostras, 10);
    expect(p.slice(0, 5)).toEqual([0, 0, 0, 0, 0]);
    expect(Math.max(...p.slice(5))).toBe(1);
  });

  it('mixar soma com ganho e corta o que passa de ±1', () => {
    const m = mixar([
      { amostras: new Float32Array([0.5, 0.8]), ganho: 1 },
      { amostras: new Float32Array([0.5, 0.8, 0.2]), ganho: 1 },
    ]);
    expect([...m]).toEqual([1, 1, expect.closeTo(0.2)]);
  });

  it('🔴 o WAV tem cabeçalho RIFF, taxa, e as amostras em 16 bits', () => {
    const wav = codificarWav(new Float32Array([0, 1, -1]), 44100);
    const texto = (i: number) => String.fromCharCode(...wav.slice(i, i + 4));
    expect(texto(0)).toBe('RIFF');
    expect(texto(8)).toBe('WAVE');
    expect(texto(36)).toBe('data');
    const v = new DataView(wav.buffer);
    expect(v.getUint32(24, true)).toBe(44100);
    expect([v.getInt16(44, true), v.getInt16(46, true), v.getInt16(48, true)]).toEqual([0, 32767, -32768]);
  });

  it('o relógio anda em décimos', () => {
    expect(relogio(84.3)).toBe('01:24.3');
  });
});

describe('o repositório', () => {
  it('excluir o projeto apaga as gravações dele — áudio órfão ocuparia espaço para sempre', async () => {
    localStorage.clear();
    const gravacoes = new GravacoesEmMemoria();
    const repo = new MesaRepository(gravacoes);
    await gravacoes.guardar('g1', new Blob(['x']));
    await repo.salvar({ id: 'm1', autorId: 'u1', titulo: 'T', pistas: [pista({ gravacaoId: 'g1' })], criadoEm: '', atualizadoEm: '' });
    expect(await repo.listar('u1')).toHaveLength(1);
    await repo.excluir('m1');
    expect(await repo.listar('u1')).toEqual([]);
    expect(await gravacoes.ler('g1')).toBeNull();
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
  const onda = (n: number) => {
    const a = new Float32Array(8000);
    for (let i = 0; i < a.length; i++) a[i] = Math.sin(i / n) * 0.5;
    return a;
  };

  beforeEach(() => {
    localStorage.clear();
    sessao = { userId: 'u1', nome: 'Aline' };
    motor.disponivel.mockReturnValue(true);
    motor.gravar.mockResolvedValue({ parar: async () => new Blob(['audio'], { type: 'audio/webm' }) });
    let n = 3;
    motor.decodificar.mockImplementation(async () => ({ amostras: onda(n++), taxa: 8000 }));
    motor.tocar.mockReset();
    motor.tocar.mockReturnValue({ parar: vi.fn() });
    irPara('/');
  });

  async function gravarNa(user: ReturnType<typeof userEvent.setup>, indice: number) {
    const botoes = screen.getAllByRole('button', { name: /^Gravar$|Regravar/ });
    await user.click(botoes[indice]);
    await user.click(await screen.findByRole('button', { name: /Parar gravação/ }));
    await screen.findAllByRole('img', { name: /Forma de onda/ });
  }

  it('gravar duas pistas, calar uma, tocar só a outra, exportar WAV, e achar no hub', async () => {
    const user = userEvent.setup();
    irPara('/studio/project/novo');
    montar();

    await user.type(await screen.findByLabelText('Título do projeto', {}, { timeout: 20000 }), 'Coro');
    await gravarNa(user, 0);
    await user.click(screen.getByRole('button', { name: /Acrescentar pista/ }));
    await gravarNa(user, 1);
    expect(screen.getAllByRole('img', { name: /Forma de onda/ })).toHaveLength(2);

    /** Ao gravar a segunda, a primeira tocou como guia. */
    expect(motor.tocar).toHaveBeenCalledTimes(1);
    expect(motor.tocar.mock.calls[0][0]).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: 'Mudo em Pista 1' }));
    await user.click(screen.getByRole('button', { name: 'Tocar' }));
    const tocadas = motor.tocar.mock.calls.at(-1)![0] as Array<{ ganho: number }>;
    expect(tocadas, 'a pista muda soou').toHaveLength(1);
    expect(tocadas[0].ganho).toBeCloseTo(ganhoDoVolume(80));

    const tipos: string[] = [];
    URL.createObjectURL = vi.fn((b: Blob) => (tipos.push(b.type), 'blob:x')) as typeof URL.createObjectURL;
    URL.revokeObjectURL = vi.fn();
    await user.click(screen.getByRole('button', { name: /Exportar mixagem/ }));
    await vi.waitFor(() => expect(tipos).toEqual(['audio/wav']));

    irPara('/studio');
    const hub = await screen.findByRole('region', { name: /Seus projetos de áudio/ }, { timeout: 20000 });
    expect(within(hub).getByText('Coro')).toBeInTheDocument();
    expect(within(hub).getByText(/2 pistas · 2 gravadas/)).toBeInTheDocument();
  });

  it('microfone negado vira aviso, e nada é gravado', async () => {
    motor.gravar.mockRejectedValue(new Error('NotAllowedError'));
    const user = userEvent.setup();
    irPara('/studio/project/novo');
    montar();
    await user.click(await screen.findByRole('button', { name: /^Gravar$/ }, { timeout: 20000 }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/microfone não foi liberado/);
    expect(screen.queryByRole('img', { name: /Forma de onda/ })).toBeNull();
  });

  it('navegador sem gravação diz isso, e o botão de gravar não se oferece', async () => {
    motor.disponivel.mockReturnValue(false);
    irPara('/studio/project/novo');
    montar();
    expect(await screen.findByText(/não oferece gravação/, {}, { timeout: 20000 })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Gravar$/ })).toBeDisabled();
  });

  it('não há mais relógio parado nem pistas "SATB" escritas no código', async () => {
    irPara('/studio/project/novo');
    montar();
    await screen.findByLabelText('Título do projeto', {}, { timeout: 20000 });
    expect(document.body.textContent).not.toMatch(/00:01:24|Soprano \(SATB\)|SMPTE/);
    expect(screen.getByLabelText('Tempo decorrido')).toHaveTextContent('00:00.0');
  });
});
