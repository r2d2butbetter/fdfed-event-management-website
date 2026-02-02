import { createTheme } from '@mui/material/styles';

// Shared typography and shape settings
const sharedTypography = {
    fontFamily: ['Parkinsans', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Helvetica', 'Arial', 'sans-serif'].join(','),
    h1: { fontWeight: 800, fontSize: '2.5rem', letterSpacing: '-0.5px' },
    h2: { fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.3px' },
    h3: { fontWeight: 700, fontSize: '1.5rem' },
    h4: { fontWeight: 600, fontSize: '1.25rem' },
    h5: { fontWeight: 600, fontSize: '1.1rem' },
    h6: { fontWeight: 600, fontSize: '1rem' },
    subtitle1: { fontWeight: 500, fontSize: '1rem' },
    subtitle2: { fontWeight: 500, fontSize: '0.875rem' },
    body1: { fontSize: '1rem' },
    body2: { fontSize: '0.875rem' },
    button: { fontWeight: 600, textTransform: 'none' },
};

const sharedShape = { borderRadius: 12 };

// Dark theme palette - Bluish tones
const darkPalette = {
    mode: 'dark',
    primary: {
        main: '#3b82f6',
        light: '#60a5fa',
        dark: '#2563eb',
        contrastText: '#fff',
    },
    secondary: {
        main: '#0ea5e9',
        light: '#38bdf8',
        dark: '#0284c7',
        contrastText: '#fff',
    },
    success: { main: '#10b981', light: '#34d399', dark: '#059669' },
    warning: { main: '#f59e0b', light: '#fbbf24', dark: '#d97706' },
    error: { main: '#ef4444', light: '#f87171', dark: '#dc2626' },
    info: { main: '#06b6d4', light: '#22d3ee', dark: '#0891b2' },
    background: {
        default: '#0f172a',
        paper: '#1e293b',
    },
    text: {
        primary: '#f1f5f9',
        secondary: '#94a3b8',
    },
    divider: 'rgba(148, 163, 184, 0.12)',
};

// Light theme palette - Bluish tones
const lightPalette = {
    mode: 'light',
    primary: {
        main: '#2563eb',
        light: '#3b82f6',
        dark: '#1d4ed8',
        contrastText: '#fff',
    },
    secondary: {
        main: '#0284c7',
        light: '#0ea5e9',
        dark: '#0369a1',
        contrastText: '#fff',
    },
    success: { main: '#10b981', light: '#34d399', dark: '#059669' },
    warning: { main: '#f59e0b', light: '#fbbf24', dark: '#d97706' },
    error: { main: '#ef4444', light: '#f87171', dark: '#dc2626' },
    info: { main: '#0891b2', light: '#22d3ee', dark: '#0e7490' },
    background: {
        default: '#f8fafc',
        paper: '#ffffff',
    },
    text: {
        primary: '#1e293b',
        secondary: '#64748b',
    },
    divider: 'rgba(0, 0, 0, 0.08)',
};

// Dark theme component overrides - Minimal gradients
const darkComponents = {
    MuiCssBaseline: {
        styleOverrides: {
            body: {
                background: '#0f172a',
                minHeight: '100vh',
            },
        },
    },
    MuiButton: {
        styleOverrides: {
            root: {
                borderRadius: 8,
                textTransform: 'none',
                fontWeight: 600,
                padding: '10px 18px',
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'translateY(-1px)' },
            },
            contained: {
                backgroundColor: '#3b82f6',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
                '&:hover': {
                    backgroundColor: '#2563eb',
                    boxShadow: '0 6px 16px rgba(59, 130, 246, 0.35)'
                },
            },
            outlined: {
                borderColor: 'rgba(59, 130, 246, 0.5)',
                '&:hover': {
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                },
            },
        },
    },
    MuiPaper: {
        styleOverrides: {
            root: {
                backgroundColor: '#1e293b',
                border: '1px solid rgba(59, 130, 246, 0.1)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
                transition: 'all 0.2s ease',
            },
        },
    },
    MuiCard: {
        styleOverrides: {
            root: {
                backgroundColor: '#1e293b',
                border: '1px solid rgba(59, 130, 246, 0.1)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.2s ease',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(59, 130, 246, 0.15)',
                },
            },
        },
    },
    MuiAppBar: {
        styleOverrides: {
            root: {
                backgroundColor: '#1e293b',
                borderBottom: '1px solid rgba(59, 130, 246, 0.1)',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
            },
        },
    },
    MuiTabs: {
        styleOverrides: {
            root: {
                minHeight: 48,
            },
            indicator: {
                backgroundColor: '#3b82f6',
                height: 3,
                borderRadius: '3px 3px 0 0',
            },
        },
    },
    MuiTab: {
        styleOverrides: {
            root: {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.95rem',
                minHeight: 48,
                color: '#94a3b8',
                '&.Mui-selected': {
                    color: '#f1f5f9',
                },
                '&:hover': {
                    color: '#f1f5f9',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                },
            },
        },
    },
    MuiChip: {
        styleOverrides: {
            root: {
                fontWeight: 500,
                borderRadius: 8,
            },
            colorSuccess: {
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.3)',
            },
            colorWarning: {
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: '#fbbf24',
                border: '1px solid rgba(245, 158, 11, 0.3)',
            },
            colorError: {
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.3)',
            },
            colorInfo: {
                backgroundColor: 'rgba(6, 182, 212, 0.15)',
                color: '#22d3ee',
                border: '1px solid rgba(6, 182, 212, 0.3)',
            },
        },
    },
    MuiTableContainer: {
        styleOverrides: {
            root: {
                background: 'transparent',
                '& .MuiTable-root': {
                    borderCollapse: 'separate',
                    borderSpacing: '0',
                },
            },
        },
    },
    MuiTableCell: {
        styleOverrides: {
            head: {
                fontWeight: 700,
                backgroundColor: 'rgba(59, 130, 246, 0.08)',
                borderBottom: '2px solid rgba(59, 130, 246, 0.15)',
                color: '#f1f5f9',
            },
            body: {
                borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                padding: '14px 16px',
            },
        },
    },
    MuiTableRow: {
        styleOverrides: {
            root: {
                '&:hover': {
                    backgroundColor: 'rgba(59, 130, 246, 0.06)',
                },
            },
        },
    },
    MuiTextField: {
        styleOverrides: {
            root: {
                '& .MuiOutlinedInput-root': {
                    borderRadius: 8,
                    '& fieldset': { borderColor: 'rgba(59, 130, 246, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(59, 130, 246, 0.4)' },
                    '&.Mui-focused fieldset': {
                        borderColor: '#3b82f6',
                        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                    },
                },
            },
        },
    },
    MuiDialog: {
        styleOverrides: {
            paper: {
                backgroundColor: '#1e293b',
                border: '1px solid rgba(59, 130, 246, 0.15)',
                boxShadow: '0 24px 48px rgba(0, 0, 0, 0.4)',
            },
        },
    },
    MuiSwitch: {
        styleOverrides: {
            root: {
                '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#3b82f6',
                    '& + .MuiSwitch-track': {
                        backgroundColor: '#3b82f6',
                    },
                },
            },
        },
    },
    MuiIconButton: {
        styleOverrides: {
            root: {
                transition: 'all 0.2s ease',
                '&:hover': {
                    transform: 'scale(1.05)',
                    backgroundColor: 'rgba(59, 130, 246, 0.12)',
                },
            },
        },
    },
    MuiLinearProgress: {
        styleOverrides: {
            root: {
                borderRadius: 4,
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
            },
            bar: {
                backgroundColor: '#3b82f6',
            },
        },
    },
    MuiSkeleton: {
        styleOverrides: {
            root: {
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
            },
        },
    },
    MuiAlert: {
        styleOverrides: {
            root: {
                borderRadius: 8,
            },
            standardSuccess: {
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.3)',
            },
            standardError: {
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.3)',
            },
            standardWarning: {
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: '#fbbf24',
                border: '1px solid rgba(245, 158, 11, 0.3)',
            },
            standardInfo: {
                backgroundColor: 'rgba(6, 182, 212, 0.15)',
                color: '#22d3ee',
                border: '1px solid rgba(6, 182, 212, 0.3)',
            },
        },
    },
};

// Light theme component overrides - Minimal gradients
const lightComponents = {
    MuiCssBaseline: {
        styleOverrides: {
            body: {
                background: '#f8fafc',
                minHeight: '100vh',
            },
        },
    },
    MuiButton: {
        styleOverrides: {
            root: {
                borderRadius: 8,
                textTransform: 'none',
                fontWeight: 600,
                padding: '10px 18px',
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'translateY(-1px)' },
            },
            contained: {
                backgroundColor: '#2563eb',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)',
                '&:hover': {
                    backgroundColor: '#1d4ed8',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                },
            },
            outlined: {
                borderColor: 'rgba(37, 99, 235, 0.5)',
                '&:hover': {
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.05)',
                },
            },
        },
    },
    MuiPaper: {
        styleOverrides: {
            root: {
                backgroundColor: '#ffffff',
                border: '1px solid rgba(37, 99, 235, 0.08)',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
                transition: 'all 0.2s ease',
            },
        },
    },
    MuiCard: {
        styleOverrides: {
            root: {
                backgroundColor: '#ffffff',
                border: '1px solid rgba(37, 99, 235, 0.08)',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
                transition: 'all 0.2s ease',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(37, 99, 235, 0.12)',
                },
            },
        },
    },
    MuiAppBar: {
        styleOverrides: {
            root: {
                backgroundColor: '#ffffff',
                borderBottom: '1px solid rgba(37, 99, 235, 0.08)',
                boxShadow: '0 1px 8px rgba(0, 0, 0, 0.04)',
                color: '#1e293b',
            },
        },
    },
    MuiTabs: {
        styleOverrides: {
            root: {
                minHeight: 48,
            },
            indicator: {
                backgroundColor: '#2563eb',
                height: 3,
                borderRadius: '3px 3px 0 0',
            },
        },
    },
    MuiTab: {
        styleOverrides: {
            root: {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.95rem',
                minHeight: 48,
                color: '#64748b',
                '&.Mui-selected': {
                    color: '#2563eb',
                },
                '&:hover': {
                    color: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.05)',
                },
            },
        },
    },
    MuiChip: {
        styleOverrides: {
            root: {
                fontWeight: 500,
                borderRadius: 8,
            },
            colorSuccess: {
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: '#059669',
                border: '1px solid rgba(16, 185, 129, 0.3)',
            },
            colorWarning: {
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                color: '#d97706',
                border: '1px solid rgba(245, 158, 11, 0.3)',
            },
            colorError: {
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#dc2626',
                border: '1px solid rgba(239, 68, 68, 0.3)',
            },
            colorInfo: {
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                color: '#0891b2',
                border: '1px solid rgba(6, 182, 212, 0.3)',
            },
        },
    },
    MuiTableContainer: {
        styleOverrides: {
            root: {
                background: 'transparent',
                '& .MuiTable-root': {
                    borderCollapse: 'separate',
                    borderSpacing: '0',
                },
            },
        },
    },
    MuiTableCell: {
        styleOverrides: {
            head: {
                fontWeight: 700,
                backgroundColor: 'rgba(37, 99, 235, 0.04)',
                borderBottom: '2px solid rgba(37, 99, 235, 0.1)',
                color: '#1e293b',
            },
            body: {
                borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                padding: '14px 16px',
            },
        },
    },
    MuiTableRow: {
        styleOverrides: {
            root: {
                '&:hover': {
                    backgroundColor: 'rgba(37, 99, 235, 0.03)',
                },
            },
        },
    },
    MuiTextField: {
        styleOverrides: {
            root: {
                '& .MuiOutlinedInput-root': {
                    borderRadius: 8,
                    '& fieldset': { borderColor: 'rgba(37, 99, 235, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(37, 99, 235, 0.4)' },
                    '&.Mui-focused fieldset': {
                        borderColor: '#2563eb',
                        boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)',
                    },
                },
            },
        },
    },
    MuiDialog: {
        styleOverrides: {
            paper: {
                backgroundColor: '#ffffff',
                border: '1px solid rgba(37, 99, 235, 0.08)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
            },
        },
    },
    MuiSwitch: {
        styleOverrides: {
            root: {
                '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#2563eb',
                    '& + .MuiSwitch-track': {
                        backgroundColor: '#2563eb',
                    },
                },
            },
        },
    },
    MuiIconButton: {
        styleOverrides: {
            root: {
                transition: 'all 0.2s ease',
                '&:hover': {
                    transform: 'scale(1.05)',
                    backgroundColor: 'rgba(37, 99, 235, 0.08)',
                },
            },
        },
    },
    MuiLinearProgress: {
        styleOverrides: {
            root: {
                borderRadius: 4,
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
            },
            bar: {
                backgroundColor: '#2563eb',
            },
        },
    },
    MuiSkeleton: {
        styleOverrides: {
            root: {
                backgroundColor: 'rgba(37, 99, 235, 0.06)',
            },
        },
    },
    MuiAlert: {
        styleOverrides: {
            root: {
                borderRadius: 8,
            },
            standardSuccess: {
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: '#059669',
                border: '1px solid rgba(16, 185, 129, 0.3)',
            },
            standardError: {
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#dc2626',
                border: '1px solid rgba(239, 68, 68, 0.3)',
            },
            standardWarning: {
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                color: '#d97706',
                border: '1px solid rgba(245, 158, 11, 0.3)',
            },
            standardInfo: {
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                color: '#0891b2',
                border: '1px solid rgba(6, 182, 212, 0.3)',
            },
        },
    },
};

/**
 * Get user theme based on mode
 * @param {'light' | 'dark'} mode - Theme mode
 * @returns {Theme} MUI Theme object
 */
export const getUserTheme = (mode) => {
    const isDark = mode === 'dark';

    return createTheme({
        palette: isDark ? darkPalette : lightPalette,
        typography: {
            ...sharedTypography,
            ...(isDark ? { subtitle2: { ...sharedTypography.subtitle2, color: '#a8adc5' } } : { subtitle2: { ...sharedTypography.subtitle2, color: '#64748b' } }),
        },
        shape: sharedShape,
        components: isDark ? darkComponents : lightComponents,
    });
};

// Export pre-built themes for convenience
export const darkTheme = getUserTheme('dark');
export const lightTheme = getUserTheme('light');

export default getUserTheme;
