import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1e293b', // Slate 800
      dark: '#0f172a', // Slate 900
      light: '#334155', // Slate 700
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#475569', // Slate 600
      dark: '#334155',
      light: '#64748b',
    },
    success: {
      main: '#10b981', // Emerald 500
      dark: '#059669',
      light: '#34d399',
    },
    error: {
      main: '#ef4444', // Red 500
      dark: '#dc2626',
      light: '#f87171',
    },
    info: {
      main: '#3b82f6', // Blue 500
      dark: '#2563eb',
      light: '#60a5fa',
    },
    background: {
      default: '#f8fafc', // Slate 50
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a', // Slate 900
      secondary: '#64748b', // Slate 500
    },
    divider: '#e2e8f0', // Slate 200
  },
  typography: {
    fontFamily: '"Inter", "IBM Plex Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 900, letterSpacing: '-0.02em' },
    h2: { fontWeight: 800, letterSpacing: '-0.01em' },
    h3: { fontWeight: 800, letterSpacing: '-0.01em' },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' },
  },
  shape: {
    borderRadius: 6, // Softened corners
  },
  shadows: [
    'none',
    '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    ...Array(20).fill('none')
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          },
        },
        contained: {
          border: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          borderRadius: 6,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          fontWeight: 700,
        }
      }
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontSize: '0.75rem',
          fontWeight: 800,
          letterSpacing: '0.05em',
        }
      }
    }
  },
});
