import { createTheme } from '@mui/material/styles';

const muiAdminTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#9353D3',
      light: '#a86dff',
      dark: '#7a3db3',
      contrastText: '#fff',
    },
    secondary: {
      main: '#643d88',
      light: '#8b5ba8',
      dark: '#4a2c66',
      contrastText: '#fff',
    },
    success: { main: '#10b981', light: '#34d399', dark: '#059669' },
    warning: { main: '#f59e0b', light: '#fbbf24', dark: '#d97706' },
    error: { main: '#ef4444', light: '#f87171', dark: '#dc2626' },
    info: { main: '#06b6d4' },
    background: {
      default: '#0f0f0f',
      paper: 'rgba(20,20,30,0.6)'
    },
    text: {
      primary: '#ffffff',
      secondary: '#a8adc5'
    },
    divider: 'rgba(255,255,255,0.06)'
  },
  typography: {
    fontFamily: ['Parkinsans', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Helvetica', 'Arial', 'sans-serif'].join(','),
    h1: { fontWeight: 800, fontSize: '2.5rem', letterSpacing: '-0.5px' },
    h2: { fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.3px' },
    h3: { fontWeight: 700, fontSize: '1.5rem' },
    h5: { fontWeight: 600, fontSize: '1.1rem' },
    h6: { fontWeight: 600, fontSize: '1.1rem' },
    subtitle2: { fontWeight: 500, fontSize: '0.875rem', color: '#a8adc5' },
    body2: { fontSize: '0.875rem' }
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 18px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': { transform: 'translateY(-2px)' }
        },
        contained: {
          background: 'linear-gradient(135deg, #9353D3 0%, #b06cff 100%)',
          boxShadow: '0 8px 24px rgba(147, 83, 211, 0.3)',
          '&:hover': { boxShadow: '0 12px 32px rgba(147, 83, 211, 0.4)' }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, rgba(20,20,30,0.8) 0%, rgba(20,20,30,0.4) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(147, 83, 211, 0.15)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s ease'
        }
      }
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          '& .MuiTable-root': {
            borderCollapse: 'separate',
            borderSpacing: '0'
          }
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          backgroundColor: 'rgba(147, 83, 211, 0.1)',
          borderBottom: '2px solid rgba(147, 83, 211, 0.2)',
          color: '#ffffff'
        },
        body: {
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          padding: '14px 16px'
        }
      }
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(147, 83, 211, 0.08)'
          }
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease',
          '&:hover': { transform: 'scale(1.1)' }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': { borderColor: 'rgba(147, 83, 211, 0.2)' },
            '&:hover fieldset': { borderColor: 'rgba(147, 83, 211, 0.4)' },
            '&.Mui-focused fieldset': { borderColor: '#9353D3', boxShadow: '0 0 0 3px rgba(147, 83, 211, 0.1)' }
          }
        }
      }
    }
  }
});

export default muiAdminTheme;
