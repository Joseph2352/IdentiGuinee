import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from 'next-themes'
import { AuthProvider } from './context/AuthContext.tsx'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="light">
      <AuthProvider>
        <Toaster position="top-right" />
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
