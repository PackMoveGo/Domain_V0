// Ultra-fast loading optimizations and app initialization
import './src/main.tsx';

(function() {
  'use strict';

  // CSS Loading Optimization
  function optimizeCSSLoading() {
    // Preload critical CSS
    const criticalCSS = document.querySelector('link[rel="preload"][as="style"]');
    if (criticalCSS) {
      criticalCSS.onload = function() {
        this.onload = null;
        this.rel = 'stylesheet';
      };
    }

    // Optimize CSS delivery
    const styleSheets = document.styleSheets;
    if (styleSheets.length > 0) {
      // Mark CSS as loaded for progress tracking
      window.dispatchEvent(new CustomEvent('css-loaded'));
    }
  }

  // Disable service worker immediately to prevent issues
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.unregister();
        console.log('Service Worker disabled to prevent issues');
      });
    });
  }
  
  // Prevent service worker from registering
  const originalRegister = navigator.serviceWorker.register;
  navigator.serviceWorker.register = function() {
    console.log('Service Worker registration blocked');
    return Promise.resolve();
  };
  
  // Ultra-fast loading optimizations
  let loadingTimeout;
  let appLoaded = false;
  let progressInterval;
  let currentProgress = 0;
  
  // Performance optimization: Use requestAnimationFrame for smooth animations
  const raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
  
  // Show ghost structure immediately
  function showGhostStructure() {
    const ghostStructure = document.getElementById('ghost-structure');
    if (ghostStructure) {
      ghostStructure.style.display = 'block';
    }
  }
  
  // Hide ghost structure when app is ready
  function hideGhostStructure() {
    const ghostStructure = document.getElementById('ghost-structure');
    if (ghostStructure) {
      ghostStructure.classList.add('hidden');
    }
  }
  
  // Improved app load detection - wait for full React app to be ready
  function checkFastLoad() {
    const root = document.getElementById('root');
    if (root && root.children.length > 0) {
      const reactRoot = root.querySelector('.App, [data-reactroot], [data-reactid]');
      if (reactRoot) {
        const hasContent = reactRoot.children.length > 0 || reactRoot.textContent.trim().length > 0;
        
        // Check if React app has meaningful content (not just loading spinners)
        const hasRealContent = reactRoot.querySelector('nav, header, main, .navbar, .hero, .content') || 
                             reactRoot.textContent.trim().length > 50;
        
        if (hasContent && hasRealContent) {
          performance.mark('app-loaded');
          performance.measure('app-load-time', 'html-start', 'app-loaded');
          
          // Hide ghost structure and show real app
          hideGhostStructure();
          
          // Hide immediately for faster loading
          const loadingScreen = document.getElementById('loading-screen');
          if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
              loadingScreen.style.display = 'none';
              loadingScreen.classList.remove('fast-load');
            }, 200);
          }
          if (root) {
            root.classList.add('loaded');
          }
          appLoaded = true;
          return true;
        }
      }
    }
    return false;
  }
  
  // Simple and reliable timeout handling
  const connectionSpeed = navigator.connection?.effectiveType || 'unknown';
  const isSlowConnection = connectionSpeed === 'slow-2g' || connectionSpeed === '2g' || connectionSpeed === '3g';
  
  // Clear any existing timeouts
  if (window.loadingTimeout) {
    clearTimeout(window.loadingTimeout);
  }
  
  // Simple fallback timeout - much more patient
  window.loadingTimeout = setTimeout(() => {
    if (!appLoaded) {
      updateProgress(95, 'Finalizing...');
      
      // Dispatch custom event for React app to handle
      window.dispatchEvent(new CustomEvent('app-loading-timeout', {
        detail: { timestamp: Date.now() }
      }));
      
      setTimeout(hideLoadingScreen, 200);
    }
  }, isSlowConnection ? 15000 : 10000); // Much more patient timeouts
  
  // Store the timeout reference
  loadingTimeout = window.loadingTimeout;
  
  // Optimized progress update function
  function updateProgress(progress, text) {
    raf(() => {
      const progressBar = document.getElementById('progress-bar');
      const progressText = document.getElementById('progress-text');
      
      if (progressBar) {
        progressBar.style.width = progress + '%';
      }
      
      if (progressText) {
        progressText.textContent = text;
      }
    });
  }
  
  // Optimized hide loading screen function
  function hideLoadingScreen() {
    appLoaded = true;
    clearTimeout(loadingTimeout);
    clearInterval(progressInterval);
    
    const loadingScreen = document.getElementById('loading-screen');
    const root = document.getElementById('root');
    
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 300);
    }
    
    if (root) {
      root.classList.add('loaded');
    }
  }
  
  // Real website loading progress tracking
  let loadingStages = {
    htmlLoaded: false,
    cssLoaded: false,
    jsLoaded: false,
    reactLoaded: false,
    apiLoaded: false
  };
  
  let currentStage = 0;
  const totalStages = 5;
  
  function updateLoadingStage(stage, text) {
    loadingStages[stage] = true;
    currentStage++;
    const progress = Math.round((currentStage / totalStages) * 100);
    updateProgress(progress, text);
  }
  
  function startProgressAnimation() {
    // This function is replaced by real loading tracking
    // Real progress is handled by updateAppLoadingProgress
  }
  
  // Track actual app loading stages
  let appLoadingProgress = 0;
  
  function updateAppLoadingProgress(stage, text) {
    const stageProgress = {
      'domReady': 15,
      'stylesLoaded': 25,
      'scriptLoaded': 40,
      'reactMounted': 60,
      'componentsLoaded': 75,
      'contentReady': 85,
      'appReady': 100
    };
    
    if (stageProgress[stage] && stageProgress[stage] > appLoadingProgress) {
      appLoadingProgress = stageProgress[stage];
      updateProgress(appLoadingProgress, text);
    }
  }
  
  // Real app loading detection
  document.addEventListener('DOMContentLoaded', () => {
    performance.mark('html-start');
    updateAppLoadingProgress('domReady', 'DOM ready...');
    
    // Optimize CSS loading immediately
    optimizeCSSLoading();
    
    // Show ghost structure immediately
    showGhostStructure();
    
    // Completely disable service worker to prevent fetch errors
    if ('serviceWorker' in navigator) {
      // Unregister all existing service workers
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.unregister().then(() => {
            console.log('✅ Service worker unregistered');
          }).catch(err => {
            console.warn('⚠️ Failed to unregister service worker:', err);
          });
        });
      });
      
      // Prevent new service worker registration
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SKIP_WAITING') {
          event.ports[0].postMessage({ type: 'SKIP_WAITING' });
        }
      });
    }
    
    // Check CSS loading
    const cssSheets = document.styleSheets;
    if (cssSheets.length > 0) {
      updateAppLoadingProgress('stylesLoaded', 'Styles loaded...');
    } else {
      // Wait for CSS to load
      setTimeout(() => {
        updateAppLoadingProgress('stylesLoaded', 'Styles loaded...');
      }, 200);
    }
    
    // Track actual script loading
    const scriptElements = document.querySelectorAll('script[src]');
    let loadedScripts = 0;
    const totalScripts = scriptElements.length;
    
    scriptElements.forEach(script => {
      if (script.complete || script.readyState === 'complete') {
        loadedScripts++;
      } else {
        script.addEventListener('load', () => {
          loadedScripts++;
          if (loadedScripts === totalScripts) {
            updateAppLoadingProgress('scriptLoaded', 'Scripts loaded...');
          }
        });
      }
    });
    
    // Check if all scripts are already loaded
    if (loadedScripts === totalScripts) {
      updateAppLoadingProgress('scriptLoaded', 'Scripts loaded...');
    }
    
    // Track API calls for content loading
    let apiCallCount = 0;
    let pendingApiCalls = 0;
    let completedApiCalls = 0;
    const originalFetch = window.fetch;
    
    // Track fetch calls for API loading stage
    window.fetch = function(...args) {
      const url = args[0];
      if (typeof url === 'string' && (url.includes('/api/') || url.includes('localhost:3000'))) {
        apiCallCount++;
        pendingApiCalls++;
        
        const originalPromise = originalFetch.apply(this, args);
        originalPromise.then(() => {
          completedApiCalls++;
          pendingApiCalls--;
          
          // Update progress based on API completion
          if (completedApiCalls === apiCallCount && apiCallCount > 0) {
            updateAppLoadingProgress('contentReady', 'Content loaded...');
          } else if (apiCallCount > 0) {
            const apiProgress = Math.round((completedApiCalls / apiCallCount) * 20) + 70;
            updateProgress(apiProgress, `Loading content... (${completedApiCalls}/${apiCallCount})`);
          }
        }).catch(() => {
          pendingApiCalls--;
        });
        
        return originalPromise;
      }
      return originalFetch.apply(this, args);
    };
    
    // Check for React app loading with better content detection
    const checkForAppLoad = () => {
      if (checkFastLoad()) {
        return;
      }
      
      const root = document.getElementById('root');
      if (root && root.children.length > 0 && !appLoaded) {
        const reactRoot = root.querySelector('.App, [data-reactroot], [data-reactid]');
        if (reactRoot) {
          const hasContent = reactRoot.children.length > 0 || reactRoot.textContent.trim().length > 0;
          
          // React app is mounting
          if (hasContent) {
            updateAppLoadingProgress('reactMounted', 'React app mounting...');
          }
          
          // Check for actual website content, not just loading states
          const hasRealContent = reactRoot.querySelector('nav, header, main, .navbar, .hero, .content, .footer') || 
                               reactRoot.textContent.trim().length > 100;
          
          // Also check if there are no loading spinners visible
          const hasNoLoadingSpinners = !reactRoot.querySelector('.loading, .spinner, [class*="loading"], [class*="spinner"]');
          
          if (hasContent && hasRealContent && hasNoLoadingSpinners) {
            // React app is fully loaded - update to final stage
            updateAppLoadingProgress('appReady', 'App ready!');
            setTimeout(() => {
              hideLoadingScreen();
              const loadingScreen = document.getElementById('loading-screen');
              if (loadingScreen) {
                loadingScreen.style.display = 'none';
                loadingScreen.style.visibility = 'hidden';
                loadingScreen.style.opacity = '0';
                loadingScreen.classList.remove('fast-load');
                loadingScreen.classList.add('hidden');
              }
            }, 500);
            return;
          } else if (hasContent) {
            // App is loading but not ready yet
            updateAppLoadingProgress('componentsLoaded', 'Loading components...');
          }
        }
      }
      
      // Continue checking if not loaded yet
      if (!appLoaded) {
        setTimeout(checkForAppLoad, 100); // Slightly slower checking to reduce CPU usage
      }
    };
    
    // Start checking for React app
    setTimeout(checkForAppLoad, 100);
    
    // Simple fallback timeout - much more patient
    setTimeout(() => {
      if (!appLoaded) {
        updateProgress(95, 'Finalizing...');
        
        // Dispatch custom event for React app to handle
        window.dispatchEvent(new CustomEvent('app-loading-timeout', {
          detail: { timestamp: Date.now() }
        }));
        
        setTimeout(hideLoadingScreen, 200);
      }
    }, isSlowConnection ? 15000 : 10000); // Much more patient timeouts
  });
})();
