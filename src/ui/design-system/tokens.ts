/**
 * Design System Tokens - Conservatório Muscicapa
 * Compliant with:
 * - 00_MASTER_ONBOARDING.md
 * - 17_DESIGN_SYSTEM.md (Visual Contract)
 * - 47_ACCESSIBILITY.md (WCAG 2.2 AA)
 * - 48_ERROR_EMPTY_LOADING_STATES.md
 * 
 * Visual Identity:
 * - Sober, serious, musical, academic, technological and sophisticated.
 * - Palette: white, black, neutral stone tones, institutional red (#991b1b) strictly for semantic action/signal.
 * - Red is NEVER a permanent background wash; it carries semantic weight (primary CTA, active playhead, critical alert).
 */

export interface TokenColorGroup {
  bg: string;
  fg: string;
  border: string;
  hover?: string;
  active?: string;
  subtle?: string;
}

export const TOKENS = {
  // 1. Core Semantic Colors
  colors: {
    // Canvas & global backgrounds
    background: {
      default: '#fafaf9', // warm off-white / stone-50
      subtle: '#f5f5f4',  // stone-100
      canvas: '#ffffff',  // pure white for paper / scores
      dark: '#1c1917',    // stone-900 for dark panels / studio
    },

    // Foreground / typography
    foreground: {
      default: '#1c1917',  // stone-900 (WCAG AAA on white)
      secondary: '#44403c', // stone-700
      muted: '#78716c',    // stone-500
      inverse: '#fafaf9',  // stone-50
      brand: '#991b1b',    // deep institutional red
    },

    // Surfaces & cards
    surface: {
      default: '#ffffff',
      elevated: '#ffffff',
      sunken: '#f5f5f4',
      card: '#ffffff',
      overlay: 'rgba(28, 25, 23, 0.6)',
      sidebar: '#1c1917',
      studio: '#18181b', // zinc-900 for audio workstation
    },

    // Borders & dividers
    border: {
      default: '#e7e5e4', // stone-200
      subtle: '#f5f5f4',  // stone-100
      strong: '#a8a29e',  // stone-400
      active: '#1c1917',  // stone-900
      brand: '#991b1b',   // institutional red
    },

    // Muted / neutral states
    muted: {
      bg: '#f5f5f4',
      fg: '#78716c',
      border: '#e7e5e4',
    },

    // Primary Action (Institutional Red Signal)
    primary: {
      default: '#991b1b', // anil-800
      hover: '#7f1d1d',   // red-900
      active: '#581c1c',  // deep carmine
      fg: '#ffffff',
      subtleBg: '#fef2f2', // red-50
      subtleBorder: '#fecaca', // red-200
    },

    // Accent / Highlight
    accent: {
      default: '#991b1b',
      hover: '#7f1d1d',
      fg: '#ffffff',
      subtleBg: '#fef2f2',
      border: '#fecaca',
      signal: '#dc2626', // red-600 for live indicators & playheads
    },

    // Success (Pedagogical achievement, verified credential, correct pitch)
    success: {
      default: '#15803d', // emerald-700
      bg: '#f0fdf4',      // emerald-50
      fg: '#166534',      // emerald-800
      border: '#bbf7d0',  // emerald-200
    },

    // Warning (Calibration needed, unsaved project, practice advisory)
    warning: {
      default: '#b45309', // amber-700
      bg: '#fffbeb',      // amber-50
      fg: '#92400e',      // amber-800
      border: '#fde68a',  // amber-200
    },

    // Danger / Critical Error (Permission denied, out-of-tune threshold, destructive action)
    danger: {
      default: '#b91c1c', // red-700
      bg: '#fef2f2',      // red-50
      fg: '#991b1b',      // anil-800
      border: '#fecaca',  // red-200
    },

    // Focus ring (High-visibility accessibility focus indicator)
    focus: {
      ring: '#991b1b',
      ringOffset: '#ffffff',
      outline: '2px solid #991b1b',
    },

    // Disabled state
    disabled: {
      bg: '#f5f5f4',
      fg: '#a8a29e',
      border: '#e7e5e4',
      cursor: 'not-allowed',
    },
  },

  // 2. Typography
  typography: {
    fontFamilies: {
      sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      serif: '"Cinzel", "Playfair Display", "Times New Roman", Georgia, serif',
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      notation: '"Bravura", "Leland", "Gonville", sans-serif',
    },
    // Major Second (1.125) and Minor Third (1.20) step ratios for high information density
    fontSizes: {
      xs: '0.75rem',    // 12px - metadata, tempo, measure tags
      sm: '0.875rem',   // 14px - table data, secondary captions
      base: '1rem',      // 16px - body text (never smaller than 16px for readability)
      lg: '1.125rem',   // 18px - card titles, subsection headers
      xl: '1.25rem',    // 20px - section headings
      '2xl': '1.5rem',  // 24px - modal & major panel titles
      '3xl': '1.875rem',// 30px - page titles
      '4xl': '2.25rem', // 36px - institutional headings
    },
    lineHeights: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
    letterSpacing: {
      tighter: '-0.04em',
      tight: '-0.02em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },

  // 3. Rhythmic Spacing (4px grid)
  spacing: {
    0: '0px',
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',      // 16px - standard outer padding min
    5: '1.25rem',  // 20px
    6: '1.5rem',   // 24px
    8: '2rem',     // 32px
    10: '2.5rem',  // 40px
    12: '3rem',    // 48px - touch target minimum
    16: '4rem',    // 64px
    20: '5rem',    // 80px
  },

  // 4. Mathematical Radii (Nested radius rule: inner = outer - padding)
  radius: {
    none: '0px',
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    full: '9999px',
  },

  // 5. Elevation & Architectural Shadows
  elevation: {
    none: 'none',
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.08)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
    dialog: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  },

  // 6. Iconography Sizing
  icons: {
    xs: '12px',
    sm: '16px',
    md: '20px',
    lg: '24px',
    xl: '32px',
  },

  // 7. Kids Adaptation Tokens
  kids: {
    minTouchTarget: '48px',
    fontSizeScale: 1.15,
    simplifiedPalette: {
      primary: '#991b1b',
      surface: '#ffffff',
      background: '#fafaf9',
    },
  },
} as const;

/**
 * Calculates nested border radius to comply with the nested border radius rule:
 * Inside Corner Radius = Outside Corner Radius - Distance Between the Two (Padding)
 */
export function calculateInnerRadius(outerRadiusPx: number, paddingPx: number): number {
  return Math.max(0, outerRadiusPx - paddingPx);
}

// Backward-compatible export
export const DESIGN_TOKENS = TOKENS;
