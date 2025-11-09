// Environment variables utility
// Uses Vite's import.meta.env for frontend variables
// For SSR/Node.js, use process.env.NODE_ENV directly

export const NODE_ENV = (import.meta as any).env?.MODE || process.env.NODE_ENV || 'development';

// Get ENABLE_DEV_TOOLS from Vite env (VITE_ENABLE_DEV_TOOLS)
export const ENABLE_DEV_TOOLS = (() => {
  const env = (import.meta as any).env || {};
  const value = env.VITE_ENABLE_DEV_TOOLS;
  if (value === '') return false;
  return value === 'true' || value === '1';
})();