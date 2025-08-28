import React, { createContext, useState } from 'react';
import { createTheme } from '@mui/material/styles';

export const ThemeContext = createContext();

export const CustomThemeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(true); // Start with dark mode as default

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

    const toggleTheme = () => {
        setDarkMode(!darkMode);
    };

    const currentTheme = darkMode ? darkTheme : lightTheme;

    return (
        <ThemeContext.Provider value={{
            darkMode,
            toggleTheme,
            theme: currentTheme
        }}>
            {children}
        </ThemeContext.Provider>
    );
};