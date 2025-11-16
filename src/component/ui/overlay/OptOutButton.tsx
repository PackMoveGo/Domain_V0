import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookiePreferences } from '../../../context/CookiePreferencesContext';

interface OptOutButtonProps {
  variant?: 'primary' | 'secondary' | 'text' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
  showText?: boolean;
  children?: React.ReactNode;
}

const OptOutButton: React.FC<OptOutButtonProps> = ({ 
  variant = 'secondary', 
  size = 'md', 
  className = '',
  showIcon = true,
  showText = true,
  children
}) => {
  const navigate = useNavigate();
  const { hasOptedOut, hasMadeChoice, optOut } = useCookiePreferences();

  const handleClick = () => {
    if (hasOptedOut) {
      navigate('/opt-in');
    } else {
      // If user hasn't opted out yet, show a confirmation dialog
      if (window.confirm('Are you sure you want to opt out of cookies? This will limit website functionality.')) {
        optOut();
      }
    }
  };

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 touch-manipulation';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500',
    text: 'text-blue-600 hover:text-blue-800 hover:bg-blue-50 focus:ring-blue-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[40px]',
    md: 'px-4 py-2.5 text-sm min-h-[44px]',
    lg: 'px-6 py-3 text-base min-h-[48px]'
  };

  const iconClasses = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  // Don't show button if user hasn't made a choice yet (banner will handle it)
  if (!hasMadeChoice) {
    return null;
  }

  const buttonText = children || (hasOptedOut ? 'Manage Preferences' : 'Opt Out');

  return (
    <button
      onClick={handleClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      title="Manage cookie preferences"
    >
      {showIcon && (
        <svg 
          className={`${iconClasses[size]} ${showText ? 'mr-2' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
          />
        </svg>
      )}
      {showText && buttonText}
    </button>
  );
};

// Add displayName for React DevTools
OptOutButton.displayName = 'OptOutButton';

export default OptOutButton; 