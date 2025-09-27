import './styles/index.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import * as ReactDOMClient from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

// Create the app component
const AppComponent = (
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);

// Check if we're in SSR mode (server-rendered content exists)
const isSSR = rootElement.innerHTML.trim().length > 0;

if (isSSR && 'hydrateRoot' in ReactDOMClient) {
  // Hydrate existing server-rendered content (Production with SSR)
  try {
    console.log('🔄 Hydrating SSR content...');
    (ReactDOMClient as any).hydrateRoot(rootElement, AppComponent);
    console.log('✅ SSR hydration successful');
  } catch (error) {
    console.error('❌ Hydration failed, falling back to CSR:', error);
    // Clear the server-rendered content and fall back to client-side rendering
    rootElement.innerHTML = '';
    const root = createRoot(rootElement);
    root.render(AppComponent);
  }
} else {
  // Client-side only rendering (Development with CSR)
  console.log('🔄 Client-side rendering...');
  const root = createRoot(rootElement);
  root.render(AppComponent);
}