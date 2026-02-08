export const theme = {
  colors: {
    background: {
      primary: '#1a1d24',
      secondary: '#242831',
      elevated: '#2d3139',
    },
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    text: {
      primary: '#f9fafb',
      secondary: '#d1d5db',
      tertiary: '#9ca3af',
    },
    accent: {
      primary: '#8b5cf6',
      secondary: '#06b6d4',
    },
    border: '#3a3f4b',
  },
  typography: {
    fonts: {
      heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
      body: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace",
    },
    sizes: {
      hero: '48px',
      h1: '32px',
      h2: '24px',
      h3: '18px',
      body: '16px',
      small: '14px',
      caption: '12px',
    },
    lineHeights: {
      hero: '56px',
      h1: '40px',
      h2: '32px',
      h3: '28px',
      body: '24px',
      small: '20px',
      caption: '16px',
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
    xxxl: '48px',
  },
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1440px',
    wide: '1920px',
  },
  shadows: {
    low: '0 1px 3px rgba(0, 0, 0, 0.3)',
    medium: '0 4px 6px rgba(0, 0, 0, 0.3)',
    high: '0 10px 20px rgba(0, 0, 0, 0.4)',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  transitions: {
    fast: '150ms ease-in-out',
    normal: '250ms ease-in-out',
    slow: '400ms ease-in-out',
  },
};

export type Theme = typeof theme;
