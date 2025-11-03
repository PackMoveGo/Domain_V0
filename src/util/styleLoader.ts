/**
 * Asynchronous style loader for non-critical CSS
 * Loads component styles after the initial page render
 */

class StyleLoader {
  private loaded = false;
  private loading = false;

  /**
   * Load component styles asynchronously
   */
  async loadComponentStyles(): Promise<void> {
    if (this.loaded || this.loading) {
      return;
    }

    this.loading = true;

    try {
      // Wait for the page to be fully loaded
      if (document.readyState !== 'complete') {
        await new Promise(resolve => {
          window.addEventListener('load', resolve, { once: true });
        });
      }

      // Add a small delay to ensure critical content is rendered first
      await new Promise(resolve => setTimeout(resolve, 100));

      // Load component styles
      await this.loadStyles('/src/styles/components.css');
      
      this.loaded = true;
      console.log('Component styles loaded successfully');
    } catch (error) {
      console.warn('Failed to load component styles:', error);
    } finally {
      this.loading = false;
    }
  }

  /**
   * Load CSS file dynamically
   */
  private loadStyles(href: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`));
      document.head.appendChild(link);
    });
  }

  /**
   * Check if styles are loaded
   */
  isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * Check if styles are currently loading
   */
  isLoading(): boolean {
    return this.loading;
  }
}

// Create singleton instance
const styleLoader = new StyleLoader();

export default styleLoader; 