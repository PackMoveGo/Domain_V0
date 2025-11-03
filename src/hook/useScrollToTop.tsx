import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // This provides a smooth scrolling animation
    });
  }, [pathname]); // This effect runs whenever the pathname changes
}; 