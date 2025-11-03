import React, { ReactNode } from 'react';

interface UseLoadingGuardProps<T> {
  isLoading: boolean;
  error: string | null;
  data: T[] | null;
  LoadingComponent?: React.ComponentType;
  ErrorComponent?: React.ComponentType<{ error: string }>;
  EmptyComponent?: React.ComponentType;
}

const DefaultLoading = () => (
  <div className="flex justify-center items-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

const DefaultError = ({ error }: { error: string }) => (
  <div className="text-red-600 p-4 text-center">
    {error}
  </div>
);

const DefaultEmpty = () => (
  <div className="text-gray-500 p-4 text-center">
    No data available
  </div>
);

export function useLoadingGuard<T>({
  isLoading,
  error,
  data,
  LoadingComponent = DefaultLoading,
  ErrorComponent = DefaultError,
  EmptyComponent = DefaultEmpty,
}: UseLoadingGuardProps<T>) {
  const renderContent = (children: ReactNode) => {
    if (isLoading) {
      return <LoadingComponent />;
    }

    if (error) {
      return <ErrorComponent error={error} />;
    }

    if (!data || data.length === 0) {
      return <EmptyComponent />;
    }

    return <>{children}</>;
  };

  return { renderContent };
} 