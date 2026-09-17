import { describe, it, expect } from 'vitest';
import { TOKENS, calculateInnerRadius } from '../src/ui/design-system/tokens';

describe('Design System Tokens & Mathematical Foundations', () => {
  it('respeita estritamente o princípio semântico da cor vermelha para ação/sinal', () => {
    // Red signal #991b1b must be defined for primary and accent
    expect(TOKENS.colors.primary.default).toBe('#991b1b');
    expect(TOKENS.colors.primary.hover).toBe('#7f1d1d');
    expect(TOKENS.colors.accent.default).toBe('#991b1b');

    // Neutral base palette
    expect(TOKENS.colors.background.default).toBe('#fafaf9');
    expect(TOKENS.colors.foreground.default).toBe('#1c1917');
    expect(TOKENS.colors.surface.default).toBe('#ffffff');
    expect(TOKENS.colors.surface.studio).toBe('#18181b');
  });

  it('calcula o raio interno aninhado matematicamente: Inner Radius = Outer Radius - Padding', () => {
    // Test case 1: outer 16px, padding 4px -> inner 12px
    expect(calculateInnerRadius(16, 4)).toBe(12);

    // Test case 2: outer 8px, padding 2px -> inner 6px
    expect(calculateInnerRadius(8, 2)).toBe(6);

    // Test case 3: outer 4px, padding 8px -> inner 0px (never negative)
    expect(calculateInnerRadius(4, 8)).toBe(0);

    // Test case 4: outer 12px, padding 12px -> inner 0px
    expect(calculateInnerRadius(12, 12)).toBe(0);
  });

  it('garante conformidade de acessibilidade para o Modo Criança (Kids Mode)', () => {
    // Touch targets must be at least 48px
    expect(TOKENS.kids.minTouchTarget).toBe('48px');
    expect(parseInt(TOKENS.kids.minTouchTarget, 10)).toBeGreaterThanOrEqual(44);
    expect(TOKENS.kids.fontSizeScale).toBeGreaterThanOrEqual(1.1);
  });

  it('valida fontes tipográficas institucionais, acadêmicas e de notação', () => {
    expect(TOKENS.typography.fontFamilies.serif).toContain('Cinzel');
    expect(TOKENS.typography.fontFamilies.mono).toContain('monospace');
    expect(TOKENS.typography.fontFamilies.notation).toContain('Bravura');
  });

  it('define estados de elevação e sombras com coerência óptica', () => {
    expect(TOKENS.elevation.none).toBe('none');
    expect(TOKENS.elevation.xs).toBeDefined();
    expect(TOKENS.elevation.sm).toBeDefined();
    expect(TOKENS.elevation.md).toBeDefined();
    expect(TOKENS.elevation.lg).toBeDefined();
    expect(TOKENS.elevation.dialog).toBeDefined();
  });
});
