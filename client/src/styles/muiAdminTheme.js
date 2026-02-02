import { createTheme } from '@mui/material/styles';

const muiAdminTheme = createTheme({
  palette: {
    mode: 'light',
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
      default: '#ffffff',
      paper: '#ffffff'
    },
    text: {
      primary: '#333333',
      secondary: '#666666'
    },
    divider: 'rgba(0,0,0,0.1)'
  },
  typography: {
    fontFamily: ['Parkinsans', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Helvetica', 'Arial', 'sans-serif'].join(','),
    h1: { fontWeight: 800, fontSize: '2.5rem', letterSpacing: '-0.5px' },
    h2: { fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.3px' },
    h3: { fontWeight: 700, fontSize: '1.5rem' },
    h5: { fontWeight: 600, fontSize: '1.1rem' },
    h6: { fontWeight: 600, fontSize: '1.1rem' },
    subtitle2: { fontWeight: 500, fontSize: '0.875rem', color: '#666666' },
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
          boxShadow: '0 4px 12px rgba(147, 83, 211, 0.2)',
          '&:hover': { boxShadow: '0 6px 16px rgba(147, 83, 211, 0.3)' }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
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
          backgroundColor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
          color: '#333333'
        },
        body: {
          borderBottom: '1px solid #f3f4f6',
          padding: '14px 16px',
          color: '#333333'
        }
      }
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#f9fafb'
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
            backgroundColor: '#ffffff',
            '& fieldset': { borderColor: '#e5e7eb' },
            '&:hover fieldset': { borderColor: '#9353D3' },
            '&.Mui-focused fieldset': { borderColor: '#9353D3', boxShadow: '0 0 0 3px rgba(147, 83, 211, 0.1)' }
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600
        }
      }
    }
  }
});

export default muiAdminTheme;
