// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { RouterProvider } from '../../src/ui/navigation/router';
import { AppRouterOutlet } from '../../src/ui/screens/AppRouterOutlet';
import { PILARES } from '../../src/ui/navigation/pilares';

/**
 * 🔴 AS SUB-ROTAS DA BARRA ESCAPAVAM DE TODA VERIFICAÇÃO.
 *
 * "Meta do dia" apontava para `/practice/daily`, e o outlet atende
 * `/practice/daily-goal`. O link estava morto na barra principal — que é o
 * primeiro lugar em que alguém clica.
 *
 * O verificador de destino de navegação não pegou, e não é defeito dele: ele
 * lê chamadas `navigate('...')` literais no código, e a sub-rota de um pilar é
 * **dado**, não chamada. Dado que vira caminho precisa da mesma prova que
 * código que vira caminho.
 *
 * Este caso monta o roteador de verdade e abre cada uma. Nenhum substituto.
 */

const todas = PILARES.flatMap((p) => [
  { label: p.label, path: p.path },
  ...p.subRotas.map((s) => ({ label: `${p.label} › ${s.label}`, path: s.path })),
]);

describe('toda entrada da barra leva a uma tela de verdade', () => {
  it('a lista não está vazia — o caso passaria à toa', () => {
    expect(todas.length).toBeGreaterThan(5);
  });

  it.each(todas.map((r) => [r.label, r.path] as const))('%s → %s', async (label, path) => {
    window.location.hash = `#${path}`;

    const { container } = render(
      <RouterProvider>
        <AppRouterOutlet />
      </RouterProvider>
    );

    /**
     * O que se cobra é a tela CHEGAR A ALGUM CONTEÚDO. Rota não atendida cai
     * no destino padrão ou fica vazia, e as duas coisas aparecem aqui como
     * ausência de texto — que é o sintoma que o link morto produz.
     */
    await waitFor(
      () => {
        expect(
          (container.textContent ?? '').trim().length,
          `"${label}" (${path}) não renderizou conteúdo`
        ).toBeGreaterThan(80);
      },
      { timeout: 40000 }
    );

    /** E não pode cair num "não encontrado". */
    expect(
      screen.queryByText(/não encontrad|página inexistente/i),
      `"${label}" (${path}) caiu em tela de não encontrado`
    ).toBeNull();
  });
});
