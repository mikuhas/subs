import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ApolloProvider } from '@apollo/client'
import 'remixicon/fonts/remixicon.css'
import './index.css'
import App from './App.tsx'
import { apolloClient } from './lib/apolloClient.ts'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { CommunityProvider } from './contexts/CommunityContext.tsx'
import { MessageProvider } from './contexts/MessageContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <CommunityProvider>
          <MessageProvider>
            <App />
          </MessageProvider>
        </CommunityProvider>
      </AuthProvider>
    </ApolloProvider>
  </StrictMode>,
)
