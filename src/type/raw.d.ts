declare module '*?raw' {
  const rawContent: string;
  export default rawContent;
}

declare module '*.jsx' {
  const jsxContent: any;
  export default jsxContent;
}

// Global environment variables defined in vite.config.js
declare const __APP_NAME__: string;
declare const __APP_VERSION__: string;
declare const __DEV_MODE__: string;
declare const __PORT__: string;
declare const __SKIP_BACKEND_CHECK__: string;
declare const __API_URL__: string;
declare const __MODE__: string;
declare const __IS_SSR__: string;

// Extend Window interface for global variables
declare global {
  interface Window {
    __APP_NAME__?: string;
    __APP_VERSION__?: string;
    __DEV_MODE__?: string;
    __PORT__?: string;
    __SKIP_BACKEND_CHECK__?: string;
    __API_URL__?: string;
    __MODE__?: string;
    __IS_SSR__?: string;
  }
} 