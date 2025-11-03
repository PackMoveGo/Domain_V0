// Temporarily disabled for Next.js build
export const logger = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(...args);
    }
  },
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(...args);
    }
  },
  group: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.group(...args);
    }
  },
  groupEnd: () => {
    if (process.env.NODE_ENV === 'development') {
      console.groupEnd();
    }
  },
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(...args);
    }
  },
  info: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(...args);
    }
  },
  getEnvironment: () => {
    return process.env.NODE_ENV || 'development';
  }
};