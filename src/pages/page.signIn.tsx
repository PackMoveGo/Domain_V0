import React, { FC, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logger } from '../util/debug';
import { useOfflineStatus } from '../hook/useOfflineStatus';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/service.apiSW';

const SignInPage: FC = () => {
  const { isOnline } = useOfflineStatus();
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [is503Error, setIs503Error] = useState(false);

  // Check API health on mount
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        await api.checkHealth();
        setIs503Error(false);
      } catch (err) {
        if (err instanceof Error && (err.message.includes('503') || err.message.includes('Service Unavailable'))) {
          setIs503Error(true);
        }
      }
    };
    
    checkApiHealth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    
    // Prevent login if API is unavailable
    if (is503Error || !isOnline) {
      setLocalError('Service temporarily unavailable. Please try again later.');
      return;
    }
    
    try {
    logger.info('Sign in attempt:', { email });
      await login(email, password);
      logger.info('Sign in successful');
      // Redirect to home page after successful login
      navigate('/');
    } catch (err) {
      // Check if it's a 503 error
      if (err instanceof Error && (err.message.includes('503') || err.message.includes('Service Unavailable'))) {
        setIs503Error(true);
        setLocalError('Service temporarily unavailable. Please try again later.');
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
        setLocalError(errorMessage);
      }
      logger.error('Sign in failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                create a new account
              </Link>
            </p>
          </div>
          {(!isOnline || is503Error) ? (
            <div className="text-center py-12">
              <div className="text-6xl font-bold text-red-600 mb-4">503</div>
              <p className="text-lg text-gray-600 mb-4">Service temporarily unavailable. Please try again later.</p>
              <p className="text-sm text-gray-500">The authentication service is currently offline. Please check back in a few minutes.</p>
            </div>
          ) : (
            <>
              {(error || localError) && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error || localError}
                </div>
              )}
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="email-address" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                    Forgot your password?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>
            </>
          )}
        </div>
      </div>
  );
};

export default SignInPage; 