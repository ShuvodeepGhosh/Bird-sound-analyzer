import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1B4332',
    },
    secondary: {
      main: '#40916C',
    },
    background: {
      default: '#081C15',
      paper: 'rgba(27, 67, 50, 0.6)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#95D5B2',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(27, 67, 50, 0.4)',
          border: '1px solid rgba(149, 213, 178, 0.2)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});
