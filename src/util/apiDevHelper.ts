// Temporarily disabled for Next.js build
export const shouldUseDevData = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

export const getDevApiUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
};