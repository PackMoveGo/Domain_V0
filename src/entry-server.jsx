import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import AppSSR from './AppSSR';

export function render(url, context = {}) {
  const helmetContext = {};
  
  // Use SSR-compatible App component
  try {
    const html = ReactDOMServer.renderToString(
      <HelmetProvider context={helmetContext}>
        <AppSSR url={url} />
      </HelmetProvider>
    );
    
    const { helmet } = helmetContext;
    
    return {
      html,
      helmet
    };
  } catch (error) {
    // If SSR fails, fall back to a simple render
    console.warn('SSR renderToString failed, using fallback:', error.message);
    
    const fallbackHtml = ReactDOMServer.renderToString(
      <React.StrictMode>
        <HelmetProvider context={helmetContext}>
          <StaticRouter location={url} context={context}>
            <div className="App">
              <div id="analytics-root"></div>
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h1>PackMoveGo</h1>
                <p>Loading...</p>
              </div>
            </div>
          </StaticRouter>
        </HelmetProvider>
      </React.StrictMode>
    );
    
    const { helmet } = helmetContext;
    
    return {
      html: fallbackHtml,
      helmet
    };
  }
}

export function renderToPipeableStream(url, context = {}) {
  const helmetContext = {};
  
  return ReactDOMServer.renderToPipeableStream(
    <React.StrictMode>
      <HelmetProvider context={helmetContext}>
        <StaticRouter location={url} context={context}>
          <App />
        </StaticRouter>
      </HelmetProvider>
    </React.StrictMode>
  );
}
