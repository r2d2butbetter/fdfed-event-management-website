import React, { useState } from 'react';
import { createTheme } from '@mui/material/styles';
import { ThemeContext } from './theme-context.js';

// Simple theme provider component
export const CustomThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
    };

    // Create proper Material-UI theme objects
    const lightTheme = createTheme({
        palette: {
            mode: 'light',
        },
    });

    const darkTheme = createTheme({
        palette: {
            mode: 'dark',
        },
    });

    const themeValue = {
        isDarkMode,
        toggleTheme,
        theme: isDarkMode ? darkTheme : lightTheme
    };

    return (
        <ThemeContext.Provider value={themeValue}>
            {children}
        </ThemeContext.Provider>
    );
};