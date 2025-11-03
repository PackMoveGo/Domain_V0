import React, { useState, useCallback, useMemo } from 'react';
import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchResult } from '../../util/search';
import { useSearch, highlightMatch } from './search';
import { navigationStyles } from '../../styles/navigation';

// Custom debounce implementation to avoid lodash dependency
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { cancel: () => void } => {
  let timeout: NodeJS.Timeout;
  
  const debounced = ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T & { cancel: () => void };
  
  debounced.cancel = () => {
    clearTimeout(timeout);
  };
  
  return debounced;
};

interface SearchBarProps {
  onSearch?: (query: string) => SearchResult[] | Promise<SearchResult[]>;
  onSearchComplete?: (results: SearchResult[]) => void;
  onSearchClear?: () => void;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch,
  onSearchComplete,
  onSearchClear,
  className = '' 
}) => {
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const {
    results,
    isOpen,
    setIsOpen,
    handleSearch,
    handleQueryChange,
    clearSearch
  } = useSearch({
    onSearchComplete,
    onSearchClear
  });

  // Debounced search handler
  const debouncedSearch = useMemo(
    () => debounce((searchQuery: string) => {
      if (onSearch) {
        const mockEvent = { target: { value: searchQuery } } as React.ChangeEvent<HTMLInputElement>;
        handleSearch(mockEvent);
      }
    }, 300),
    [onSearch, handleSearch]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      debouncedSearch.cancel(); // Cleanup debounced function
    };
  }, [setIsOpen, debouncedSearch]);

  const handleResultClick = useCallback((result: SearchResult) => {
    navigate(result.path);
    clearSearch();
  }, [navigate, clearSearch]);

  const handleSearchSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSearch) return;

    try {
      const results = await Promise.resolve(onSearch(query));
      if (onSearchComplete) {
        onSearchComplete(results);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  }, [query, onSearch, onSearchComplete]);

  const handleSignIn = useCallback(() => {
    navigate('/signin');
  }, [navigate]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    handleQueryChange(e);
    debouncedSearch(newQuery);
  }, [handleQueryChange, debouncedSearch]);

  return (
    <div ref={searchRef} className={`${navigationStyles.search.wrapper} ${className}`}>
      <div className={navigationStyles.search.container}>
        <div className={navigationStyles.search.content}>
          <form onSubmit={handleSearchSubmit} className={navigationStyles.search.form}>
            <input
              type="text"
              id="searchQuery"
              placeholder="Search services, locations, or resources..."
              className={navigationStyles.search.input}
              value={query}
              onChange={handleInputChange}
              onFocus={() => setIsOpen(true)}
            />
            <div className={navigationStyles.search.iconWrapper}>
              <svg
                className={navigationStyles.search.icon}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            {query && (
              <button
                type="button"
                className={navigationStyles.search.clearButton}
                onClick={clearSearch}
                aria-label="Clear search"
              >
                <svg
                  className={navigationStyles.search.clearIcon}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </form>

          <button
            onClick={handleSignIn}
            className={navigationStyles.search.signInButton}
            aria-label="Sign in"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Sign In
          </button>
        </div>

        {/* Search Results Dropdown */}
        {isOpen && results.length > 0 && (
          <div className={navigationStyles.search.results.wrapper}>
            <div className={navigationStyles.search.results.container}>
              {results.map((result, index) => (
                <button
                  key={index}
                  className={navigationStyles.search.results.item}
                  onClick={() => handleResultClick(result)}
                >
                  <div 
                    className={navigationStyles.search.results.title}
                    dangerouslySetInnerHTML={{ 
                      __html: highlightMatch(result.title, query) 
                    }}
                  />
                  <div 
                    className={navigationStyles.search.results.description}
                    dangerouslySetInnerHTML={{ 
                      __html: highlightMatch(result.description, query) 
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Add displayName for React DevTools
SearchBar.displayName = 'SearchBar';

const MemoizedSearchBar = React.memo(SearchBar);
MemoizedSearchBar.displayName = 'MemoizedSearchBar';

export default MemoizedSearchBar; 