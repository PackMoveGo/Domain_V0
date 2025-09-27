'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const TermsPage = dynamic(() => import('../../src/pages/page.terms'), {
  ssr: true,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600 text-sm">Loading...</p>
      </div>
    </div>
  ),
});

export default function Terms() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    }>
      <TermsPage />
    </Suspense>
  );
}
