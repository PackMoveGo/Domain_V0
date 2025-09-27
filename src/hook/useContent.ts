import { useState, useEffect } from 'react';

interface ContentState {
  content: any;
  loading: boolean;
  error: string | null;
}

export const useContent = (contentType: string) => {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Temporarily disabled for Next.js build
    setContent({});
    setLoading(false);
    setError(null);
  }, [contentType]);

  return { content, loading, error };
};