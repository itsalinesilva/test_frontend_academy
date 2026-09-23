// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { render, screen, cleanup } from '@testing-library/react';
import { RouterProvider } from '../../src/ui/navigation/router';
import { AppRouterOutlet } from '../../src/ui/screens/AppRouterOutlet';

/**
 * AUD-11 / M-9 — `/worlds/work/:id` abria a mesma Sonata BWV 1001 para
 * QUALQUER id, com "Fonte Primária Auditada" e um curso que não existe; o
 * grafo tinha cinco nós fixos, "8 Arestas" contadas por ninguém e um zoom
 * que não fazia nada — e era a ação principal do Atlas.
 */
describe('os Mundos sem fachada', () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
  });

  const abrir = (endereco: string) => {
    window.location.hash = `#${endereco}`;
    return render(
      <RouterProvider>
        <AppRouterOutlet />
      </RouterProvider>
    );
  };

  it('🔴 uma obra dos Mundos abre a ficha de verdade do acervo — a do id pedido', async () => {
    abrir('/worlds/work/obra-bar-bach-prelude');
    expect(await screen.findByText(/Número de catálogo|Compositor/, {}, { timeout: 20000 })).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/BWV 1001|Fonte Primária Auditada|Köthen/);
  });

  it('um id que não existe diz que não existe, em vez de mostrar outra obra', async () => {
    abrir('/worlds/work/nao-existe-mesmo');
    await new Promise((ok) => setTimeout(ok, 1500));
    expect(document.body.textContent).not.toMatch(/BWV 1001|Sonata nº 1/);
  });

  it('o grafo inventado sumiu, e o Atlas não oferece mais o caminho para ele', () => {
    expect(existsSync('src/ui/screens/worlds/MusicGraphScreen.tsx')).toBe(false);
    expect(existsSync('src/ui/screens/worlds/WorkDetailScreen.tsx')).toBe(false);
    const atlas = readFileSync('src/ui/screens/worlds/WorldsAtlasScreen.tsx', 'utf8');
    expect(atlas).not.toMatch(/navigate\('\/worlds\/graph'\)/);
  });
});
