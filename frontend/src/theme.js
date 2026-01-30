import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000', // Solid Black
      dark: '#1a1a1a', 
      light: '#333333',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#666666', // Deep Gray
      dark: '#4d4d4d',
      light: '#999999',
    },
    background: {
      default: '#fcfcfc', // Near White
      paper: '#ffffff',
    },
    text: {
      primary: '#000000', // Black
      secondary: '#424242', // Graphite
    },
    divider: '#e0e0e0',
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
    borderRadius: 0, // Sharp edges
  },
  shadows: [
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: 'none',
          border: '1px solid black',
          '&:hover': {
            boxShadow: 'none',
            backgroundColor: '#000000',
            color: '#ffffff',
          },
        },
        contained: {
          border: 'none',
        },
        outlined: {
          border: '2px solid black',
          '&:hover': {
            border: '2px solid black',
          }
        }
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          border: '1px solid #e0e0e0',
          borderRadius: 0,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: '1px solid #e0e0e0',
          boxShadow: 'none',
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 0,
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
          borderRadius: 0,
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
