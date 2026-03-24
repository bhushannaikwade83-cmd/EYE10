// ============================================
// EYE10 THEME CONFIGURATION FILE
// ============================================
// Change this file to update the entire website's appearance
// All colors, fonts, spacing, and styles are controlled here

export const theme = {
  // ========== COLORS ==========
  colors: {
    // EYe 10 Optical World — logo palette (black / beige / gray)
    primary: '#000000',
    primaryDark: '#141414',
    primaryLight: '#3a3a3a',

    secondary: '#1a1a1a',
    secondaryDark: '#0d0d0d',

    accent: '#4a4a4a',
    accentDark: '#2a2a2a',

    dark: '#000000',
    darkLight: '#1a1a1a',
    light: '#f7f4ef',
    lightGray: '#ebe6dc',
    gray: '#808080',
    grayDark: '#5a5a5a',
    border: '#cfc7b8',
    
    // Status Colors
    success: '#10b981',            // Green
    error: '#ef4444',              // Red
    warning: '#f59e0b',            // Orange
    info: '#3b82f6',               // Blue
    
    // White & Black
    white: '#ffffff',
    black: '#000000',
  },

  // ========== GRADIENTS ==========
  gradients: {
    primary: 'linear-gradient(135deg, #000000 0%, #2a2a2a 100%)',
    primaryReverse: 'linear-gradient(135deg, #2a2a2a 0%, #000000 100%)',
    secondary: 'linear-gradient(135deg, #2a2a2a 0%, #0d0d0d 100%)',
    hero: 'linear-gradient(145deg, #f7f4ef 0%, #d8d2c2 55%, #ebe6dc 100%)',
    accent: 'linear-gradient(135deg, #4a4a4a 0%, #2a2a2a 100%)',
    background: 'linear-gradient(to bottom, #f7f4ef 0%, #ebe6dc 100%)',
    backgroundReverse: 'linear-gradient(to bottom, #ebe6dc 0%, #d8d2c2 100%)',
  },

  // ========== TYPOGRAPHY ==========
  typography: {
    fontFamily: "'DM Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontFamilyHeading: "'DM Sans', 'Inter', sans-serif",
    
    // Font Sizes
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '42px',
      '6xl': '48px',
      '7xl': '56px',
      '8xl': '72px',
    },
    
    // Font Weights
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    
    // Line Heights
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.6,
      loose: 1.7,
    },
  },

  // ========== SPACING ==========
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '40px',
    '3xl': '48px',
    '4xl': '64px',
    '5xl': '80px',
    '6xl': '100px',
  },

  // ========== BORDER RADIUS ==========
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    full: '9999px',
  },

  // ========== SHADOWS ==========
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },

  // ========== TRANSITIONS ==========
  transitions: {
    fast: '0.15s ease',
    normal: '0.3s ease',
    slow: '0.5s ease',
    smooth: '0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // ========== BREAKPOINTS ==========
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // ========== Z-INDEX ==========
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },

  // ========== COMPONENT SPECIFIC STYLES ==========
  components: {
    navbar: {
      height: '80px',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropBlur: '10px',
      shadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    },
    
    hero: {
      paddingTop: '140px',
      paddingBottom: '100px',
      gradient: 'linear-gradient(145deg, #f7f4ef 0%, #d8d2c2 55%, #ebe6dc 100%)',
    },
    
    card: {
      borderRadius: '20px',
      padding: '32px',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      hoverShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    },
    
    button: {
      borderRadius: '12px',
      padding: '14px 28px',
      fontSize: '16px',
      fontWeight: 600,
    },
    
    input: {
      borderRadius: '12px',
      padding: '12px 16px',
      borderWidth: '2px',
    },
  },
}

// ============================================
// QUICK THEME PRESETS
// ============================================
// Uncomment one of these to quickly change the entire theme

export const themePresets = {
  // Modern Blue Theme (Current)
  blue: {
    primary: '#6366f1',
    primaryDark: '#4f46e5',
    heroGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  
  // Elegant Purple Theme
  purple: {
    primary: '#8b5cf6',
    primaryDark: '#7c3aed',
    heroGradient: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
  },
  
  // Fresh Green Theme
  green: {
    primary: '#10b981',
    primaryDark: '#059669',
    heroGradient: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
  },
  
  // Warm Orange Theme
  orange: {
    primary: '#f59e0b',
    primaryDark: '#d97706',
    heroGradient: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
  },
  
  // Professional Teal Theme
  teal: {
    primary: '#14b8a6',
    primaryDark: '#0d9488',
    heroGradient: 'linear-gradient(135deg, #5eead4 0%, #0d9488 100%)',
  },
  
  // Bold Red Theme
  red: {
    primary: '#ef4444',
    primaryDark: '#dc2626',
    heroGradient: 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)',
  },
}

export default theme
