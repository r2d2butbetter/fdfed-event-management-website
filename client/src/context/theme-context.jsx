import React, { createContext, useMemo, useState } from 'react';

export const ThemeContext = createContext({ isDarkMode: false, toggle: () => {} });

export function ThemeProvider({ children }) {
	const [isDarkMode, setIsDarkMode] = useState(false);
	const value = useMemo(() => ({ isDarkMode, toggle: () => setIsDarkMode((v) => !v) }), [isDarkMode]);
	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
