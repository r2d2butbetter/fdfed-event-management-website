import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { CustomThemeProvider } from './context/ThemeContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import AppWithTheme from './components/AppWithTheme.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CustomThemeProvider>
          <AppWithTheme />
        </CustomThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
