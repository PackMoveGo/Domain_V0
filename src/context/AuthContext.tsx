import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api } from '../services/service.apiSW';
import { JWT_AUTH } from '../util/jwtAuth';
import { useGeolocation } from '../hook/useGeolocation';

interface User {
  id: string;
  email?: string;
  username?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: string;
  phoneVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  verificationStep: 'phone' | 'code' | 'complete';
  pendingPhone: string | null;
  login: (email: string, password: string) => Promise<void>;
  requestSmsSignin: (phone: string, username?: string) => Promise<void>;
  verifySmsCode: (phone: string, code: string) => Promise<void>;
  signup: (userData: {
    name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verificationStep, setVerificationStep] = useState<'phone' | 'code' | 'complete'>('phone');
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);
  const { latitude, longitude, city, state, country } = useGeolocation();

  // Check authentication status on mount
  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if we have a token
      const hasToken = JWT_AUTH.hasToken();
      const isExpired = JWT_AUTH.isTokenExpired();

      if (!hasToken || isExpired) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Get user info from token
      const userInfo = JWT_AUTH.getUserInfo();
      if (userInfo) {
        setUser({
          id: userInfo.id || '',
          email: userInfo.email || '',
          name: userInfo.name
        });
      }

      // Try to verify with API
      try {
        const authStatus = await api.checkAuthStatus();
        if (authStatus && authStatus.success && authStatus.user) {
          setUser(authStatus.user);
        }
      } catch (apiError) {
        // If API check fails but we have a valid token, use token data
        console.warn('⚠️ Auth status check failed, using token data:', apiError);
      }
    } catch (err) {
      console.error('❌ Auth check failed:', err);
      setError(err instanceof Error ? err.message : 'Authentication check failed');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Include location data in login request
      const locationData={
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        city: city || undefined,
        state: state || undefined,
        country: country || undefined
      };

      const response=await api.login(email, password, locationData);

      if(response && response.success){
        const userData=response.data?.user || response.user || {};
        setUser({
          id: userData._id || userData.id || '',
          email: userData.email || email,
          name: userData.name,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          role: userData.role
        });
      }else{
        throw new Error(response?.message || 'Login failed');
      }
    }catch(err){
      const errorMessage=err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    }finally{
      setIsLoading(false);
    }
  }, [latitude, longitude, city, state, country]);

  // Signup function
  const signup = useCallback(async (userData: {
    name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      // Prepare data for API (handle both name and firstName/lastName)
      const signupData: any={
        email: userData.email,
        password: userData.password
      };

      if(userData.name){
        signupData.name=userData.name;
      }else if(userData.firstName || userData.lastName){
        signupData.firstName=userData.firstName;
        signupData.lastName=userData.lastName;
      }

      if(userData.phone){
        signupData.phone=userData.phone;
      }

      // Include location data in signup request
      signupData.location={
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        city: city || undefined,
        state: state || undefined,
        country: country || undefined
      };

      const response=await api.signup(signupData);

      if(response && response.success){
        const userData=response.data?.user || response.user || {};
        setUser({
          id: userData._id || userData.id || '',
          email: userData.email || signupData.email,
          name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          role: userData.role
        });
      }else{
        throw new Error(response?.message || 'Signup failed');
      }
    }catch(err){
      const errorMessage=err instanceof Error ? err.message : 'Signup failed';
      setError(errorMessage);
      throw err;
    }finally{
      setIsLoading(false);
    }
  }, [latitude, longitude, city, state, country]);

  // SMS Signin - Request verification code
  const requestSmsSignin = useCallback(async (phone: string, username?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response=await api.requestSmsSignin(phone, username);

      if(response && response.success){
        setPendingPhone(phone);
        setVerificationStep('code');
        console.log('✅ Verification code sent to:', phone);
        if(response.data?.devCode){
          console.log('🔧 [DEV] Verification code:', response.data.devCode);
        }
      }else{
        throw new Error(response?.message || 'Failed to send verification code');
      }
    }catch(err){
      const errorMessage=err instanceof Error ? err.message : 'Failed to send verification code';
      setError(errorMessage);
      throw err;
    }finally{
      setIsLoading(false);
    }
  }, []);

  // SMS Signin - Verify code and login
  const verifySmsCode = useCallback(async (phone: string, code: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response=await api.verifySmsCode(phone, code);

      if(response && response.success){
        const userData=response.data?.user || response.user || {};
        setUser({
          id: userData._id || userData.id || '',
          email: userData.email,
          username: userData.username,
          phone: userData.phone || phone,
          name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          phoneVerified: true
        });
        setVerificationStep('complete');
        setPendingPhone(null);
        console.log('✅ SMS verification successful');
      }else{
        throw new Error(response?.message || 'Invalid verification code');
      }
    }catch(err){
      const errorMessage=err instanceof Error ? err.message : 'Verification failed';
      setError(errorMessage);
      throw err;
    }finally{
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await api.logout();
    } catch (err) {
      console.warn('⚠️ Logout API call failed:', err);
    } finally {
      setUser(null);
      setError(null);
      setVerificationStep('phone');
      setPendingPhone(null);
      setIsLoading(false);
    }
  }, []);

  // Refresh auth status
  const refreshAuth = useCallback(async () => {
    await checkAuthStatus();
  }, [checkAuthStatus]);

  // Check auth on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Listen for token changes
  useEffect(() => {
    const handleStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkAuthStatus]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    verificationStep,
    pendingPhone,
    login,
    requestSmsSignin,
    verifySmsCode,
    signup,
    logout,
    refreshAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

