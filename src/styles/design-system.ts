/**
 * 🎨 DESIGN SYSTEM - Libertinelover
 * Cores, tipografia e componentes reutilizáveis
 */

export const colors = {
  // Primary - Roxo sensual
  primary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },
  
  // Accent - Rosa/Magenta
  accent: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f8b4d8',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
  },

  // Neutral
  slate: {
    0: '#ffffff',
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },

  // Status
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
}

export const typography = {
  // Headings
  h1: {
    size: '3.5rem', // 56px
    weight: 800,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  h2: {
    size: '2.5rem', // 40px
    weight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.01em',
  },
  h3: {
    size: '1.875rem', // 30px
    weight: 700,
    lineHeight: 1.3,
  },
  h4: {
    size: '1.5rem', // 24px
    weight: 600,
    lineHeight: 1.4,
  },

  // Body
  body: {
    lg: {
      size: '1.125rem', // 18px
      weight: 400,
      lineHeight: 1.6,
    },
    base: {
      size: '1rem', // 16px
      weight: 400,
      lineHeight: 1.6,
    },
    sm: {
      size: '0.875rem', // 14px
      weight: 400,
      lineHeight: 1.5,
    },
  },

  // Special
  cta: {
    size: '1.125rem',
    weight: 600,
    letterSpacing: '0.025em',
  },
}

export const spacing = {
  xs: '0.25rem',  // 4px
  sm: '0.5rem',   // 8px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
  '3xl': '4rem',  // 64px
}

export const borderRadius = {
  none: '0',
  sm: '0.25rem',
  base: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  '2xl': '2rem',
  full: '9999px',
}

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  glow: '0 0 20px rgba(168, 85, 247, 0.4)',
}

export const transitions = {
  fast: '150ms ease-in-out',
  base: '200ms ease-in-out',
  slow: '300ms ease-in-out',
}
