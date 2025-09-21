
import React, { useState, useEffect, useRef } from 'react';
import { useCookiePreferences } from '../../../context/CookiePreferencesContext';
import CookieConsent from '../../cookieconsent/CookieConsent';

const OptOutOverlay: React.FC = () => {
  const { hasOptedOut, hasMadeChoice } = useCookiePreferences();
  const [isVisible, setIsVisible] = useState(false);
  const scrollPositionRef = useRef<number>(0);

  // Function to prevent scrolling
  const preventScroll = () => {
    // Store current scroll position
    scrollPositionRef.current = window.scrollY;
    
    // Prevent scrolling on body
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPositionRef.current}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    
    // Prevent scrolling on html element as well
    document.documentElement.style.overflow = 'hidden';
    
    // Prevent touch scrolling on mobile
    document.body.style.touchAction = 'none';
    document.documentElement.style.touchAction = 'none';
    
    // Prevent wheel events
    const preventWheel = (e: Event) => {
      e.preventDefault();
    };
    
    // Prevent keyboard navigation (arrow keys, space, page up/down)
    const preventKeydown = (e: KeyboardEvent) => {
      const keys = [
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
        'Space', 'PageUp', 'PageDown', 'Home', 'End'
      ];
      if (keys.includes(e.code)) {
        e.preventDefault();
      }
    };
    
    // Add event listeners
    document.addEventListener('wheel', preventWheel, { passive: false });
    document.addEventListener('touchmove', preventWheel, { passive: false });
    document.addEventListener('keydown', preventKeydown);
    
    // Store cleanup function
    return () => {
      document.removeEventListener('wheel', preventWheel);
      document.removeEventListener('touchmove', preventWheel);
      document.removeEventListener('keydown', preventKeydown);
    };
  };

  // Function to restore scrolling
  const restoreScroll = () => {
    // Restore body styles
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    document.body.style.touchAction = '';
    
    // Restore html styles
    document.documentElement.style.overflow = '';
    document.documentElement.style.touchAction = '';
    
    // Restore scroll position
    window.scrollTo(0, scrollPositionRef.current);
  };

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    // Only show overlay if user has opted out AND has made a choice
    // This prevents showing overlay when the main CookieConsent is already visible
    if (hasOptedOut && hasMadeChoice) {
      setIsVisible(true);
      cleanup = preventScroll();
    } else {
      setIsVisible(false);
      restoreScroll();
    }

    return () => {
      // Cleanup on unmount or when dependencies change
      if (cleanup) {
        cleanup();
      }
      restoreScroll();
    };
  }, [hasOptedOut, hasMadeChoice]);

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-[10000] bg-black bg-opacity-90 flex items-center justify-center p-2 sm:p-4"
      style={{ touchAction: 'none' }}
    >
      <CookieConsent />
    </div>
  );
};

export default OptOutOverlay; 