import React, { FC, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logger } from '../util/debug';
import { useOfflineStatus } from '../hook/useOfflineStatus';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/service.apiSW';

const SignInPage: FC = () => {
  const { isOnline } = useOfflineStatus();
  const { requestSmsSignin, verifySmsCode, isLoading, error, verificationStep, pendingPhone } = useAuth();
  const navigate = useNavigate();
  
  // Phone input step
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  
  // Format phone number as (XXX) XXX-XXXX
  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limitedDigits = digits.slice(0, 10);
    
    // Format based on length
    if (limitedDigits.length === 0) {
      return '';
    } else if (limitedDigits.length <= 3) {
      return `(${limitedDigits}`;
    } else if (limitedDigits.length <= 6) {
      return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`;
    } else {
      return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
    }
  };
  
  // Extract raw digits for API
  const getRawPhoneNumber = (formattedPhone: string): string => {
    return formattedPhone.replace(/\D/g, '');
  };
  
  // Handle phone input change with formatting
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };
  
  // Code verification step
  const [verificationCode, setVerificationCode] = useState('');
  
  const [localError, setLocalError] = useState<string | null>(null);
  const [is503Error, setIs503Error] = useState(false);
  const [authMethod, setAuthMethod] = useState<'sms' | 'email'>('sms');
  const [showPassword, setShowPassword] = useState(false);

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

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    
    // Prevent login if API is unavailable
    if (is503Error || !isOnline) {
      setLocalError('Service temporarily unavailable. Please try again later.');
      return;
    }
    
    // Get raw phone number (10 digits only)
    const rawPhone = getRawPhoneNumber(phone);
    
    if (rawPhone.length !== 10) {
      setLocalError('Please enter a valid 10-digit phone number');
      return;
    }
    
    try {
      logger.info('SMS signin request:', { phone: rawPhone });
      await requestSmsSignin(rawPhone, username || undefined);
      logger.info('Verification code sent');
    } catch (err) {
      // Check if it's a 503 error
      if (err instanceof Error && (err.message.includes('503') || err.message.includes('Service Unavailable'))) {
        setIs503Error(true);
        setLocalError('Service temporarily unavailable. Please try again later.');
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send verification code.';
        setLocalError(errorMessage);
      }
      logger.error('SMS signin failed:', err);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    
    if (!pendingPhone) {
      setLocalError('Please start the signin process again.');
      return;
    }
    
    try {
      logger.info('Verifying SMS code');
      await verifySmsCode(pendingPhone, verificationCode);
      logger.info('Sign in successful');
      // Redirect to home page after successful login
      navigate('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid verification code.';
      setLocalError(errorMessage);
      logger.error('Code verification failed:', err);
    }
  };

  const handleResendCode = async () => {
    if (!pendingPhone) return;
    
    try {
      setLocalError(null);
      await requestSmsSignin(pendingPhone, username || undefined);
      logger.info('Verification code resent');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend code.';
      setLocalError(errorMessage);
      logger.error('Resend failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {verificationStep==='phone' ? 'Sign in with SMS' : 'Verify your phone'}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {verificationStep==='phone' ? (
                <>
              Or{' '}
              <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                create a new account
              </Link>
                </>
              ) : (
                `We sent a code to ${pendingPhone}`
              )}
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
              
              {verificationStep==='phone' ? (
                <form className="mt-8 space-y-6" onSubmit={handlePhoneSubmit}>
                  <div className="rounded-md shadow-sm space-y-4">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        required
                        maxLength={14}
                        className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="(555) 555-5555"
                        value={phone}
                        onChange={handlePhoneChange}
                        onKeyPress={(e) => {
                          // Only allow digits
                          if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                  />
                      <p className="mt-1 text-xs text-gray-500">Enter your US phone number (10 digits)</p>
                </div>
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="username"
                          name="username"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Password"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? (
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Required for new users, optional for existing users</p>
                    </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                      {isLoading ? 'Sending code...' : 'Send verification code'}
                    </button>
                  </div>
                </form>
              ) : (
                <form className="mt-8 space-y-6" onSubmit={handleCodeSubmit}>
                  <div className="rounded-md shadow-sm">
                    <div>
                      <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                        Verification Code
                      </label>
                      <input
                        id="code"
                        name="code"
                        type="text"
                        autoComplete="one-time-code"
                        required
                        maxLength={8}
                        className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest sm:text-sm"
                        placeholder="00000000"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g,'').slice(0,8))}
                      />
                      <p className="mt-1 text-xs text-gray-500">Enter the 8-digit code sent to your phone</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="submit"
                      disabled={isLoading || verificationCode.length!==8}
                      className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Verifying...' : 'Verify and sign in'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={isLoading}
                      className="w-full text-center text-sm text-blue-600 hover:text-blue-500 disabled:opacity-50"
                    >
                      Resend code
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setPhone('');
                        setUsername('');
                        setVerificationCode('');
                        setLocalError(null);
                      }}
                      className="w-full text-center text-sm text-gray-600 hover:text-gray-500"
                    >
                      Use a different phone number
                </button>
              </div>
            </form>
              )}
            </>
          )}
        </div>
      </div>
  );
};

export default SignInPage; 