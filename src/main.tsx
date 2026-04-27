import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { CommunityProvider } from './contexts/CommunityContext.tsx'
import { MessageProvider } from './contexts/MessageContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <CommunityProvider>
        <MessageProvider>
          <App />
        </MessageProvider>
      </CommunityProvider>
    </AuthProvider>
  </StrictMode>,
)
