import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getUserTheme } from '../styles/muiUserTheme';

const THEME_STORAGE_KEY = 'user-dashboard-theme-mode';

const ThemeContext = createContext({
    mode: 'light',
    toggleTheme: () => { },
    setMode: () => { },
    isDark: false,
});

/**
 * Custom hook to access theme context
 * @returns {{ mode: 'light' | 'dark', toggleTheme: () => void, setMode: (mode: 'light' | 'dark') => void, isDark: boolean }}
 */
export const useThemeMode = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeMode must be used within a ThemeContextProvider');
    }
    return context;
};

/**
 * Theme Context Provider Component
 * Manages theme mode state and provides MUI ThemeProvider
 */
export const ThemeContextProvider = ({ children, defaultMode = 'light' }) => {
    // Initialize mode from localStorage or use default
    const [mode, setModeState] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedMode = localStorage.getItem(THEME_STORAGE_KEY);
            if (savedMode === 'light' || savedMode === 'dark') {
                return savedMode;
            }
        }
        return defaultMode;
    });

    // Persist mode to localStorage
    useEffect(() => {
        localStorage.setItem(THEME_STORAGE_KEY, mode);
    }, [mode]);

    // Create memoized theme based on current mode
    const theme = useMemo(() => getUserTheme(mode), [mode]);

    // Toggle between light and dark
    const toggleTheme = () => {
        setModeState((prevMode) => (prevMode === 'dark' ? 'light' : 'dark'));
    };

    // Set specific mode
    const setMode = (newMode) => {
        if (newMode === 'light' || newMode === 'dark') {
            setModeState(newMode);
        }
    };

    const contextValue = useMemo(
        () => ({
            mode,
            toggleTheme,
            setMode,
            isDark: mode === 'dark',
        }),
        [mode]
    );

    return (
        <ThemeContext.Provider value={contextValue}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};

export default ThemeContext;
