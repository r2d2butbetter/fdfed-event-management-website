import React from 'react';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import { DarkMode, LightMode } from '@mui/icons-material';
import { useThemeMode } from '../../context/ThemeContext';

/**
 * ThemeToggle - Dark/Light mode toggle button
 */
const ThemeToggle = ({ size = 'medium' }) => {
    const { mode, toggleTheme, isDark } = useThemeMode();
    const theme = useTheme();

    return (
        <Tooltip title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <IconButton
                onClick={toggleTheme}
                size={size}
                sx={{
                    color: 'text.primary',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        bgcolor: isDark ? 'rgba(147, 83, 211, 0.15)' : 'rgba(124, 58, 237, 0.1)',
                        transform: 'rotate(180deg)',
                    },
                }}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
                {isDark ? (
                    <LightMode sx={{ color: 'warning.light' }} />
                ) : (
                    <DarkMode sx={{ color: 'primary.main' }} />
                )}
            </IconButton>
        </Tooltip>
    );
};

export default ThemeToggle;
