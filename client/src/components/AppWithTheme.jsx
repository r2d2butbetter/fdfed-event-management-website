import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import App from '../App.jsx'
import { useTheme } from '../hooks/useTheme.js'

const AppWithTheme = () => {
    const { theme } = useTheme();

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
        </ThemeProvider>
    );
};

export default AppWithTheme;