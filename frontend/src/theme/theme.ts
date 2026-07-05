import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2D6A4F', // Keep emerald accent
      light: '#40916C',
      dark: '#1B4332',
    },
    secondary: {
      main: '#EAEAEA',
      light: '#FFFFFF',
      dark: '#A0A0A0',
    },
    background: {
      default: '#0A0A0A',
      paper: '#141414',
    },
    text: {
      primary: '#EAEAEA',
      secondary: '#A0A0A0',
    },
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", sans-serif',
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 500,
      letterSpacing: '0.01em',
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0A0A0A',
          minHeight: '100vh',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: '#141414',
          border: '1px solid #2A2A2A',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          padding: '8px 20px',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: 'none',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 4px 12px rgba(45, 106, 79, 0.3)',
          },
        },
        outlined: {
          borderWidth: '1px',
          borderColor: '#2A2A2A',
          '&:hover': {
            borderWidth: '1px',
            borderColor: '#EAEAEA',
            backgroundColor: 'rgba(255,255,255,0.05)',
          }
        }
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
  },
});
