import { log, success, error } from './consoleManager';

export interface OptimizationMetrics {
  bundleSize: number;
  imageCount: number;
  unoptimizedImages: number;
  cssRules: number;
  memoryUsage: number;
  loadTime: number;
  firstPaint: number;
  networkType: string;
  securityScore: number;
}

export interface OptimizationRecommendation {
  type: 'performance' | 'security' | 'bundle' | 'image' | 'network';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  action: string;
}

export class OptimizationAnalyzer {
  private metrics: OptimizationMetrics | null = null;
  private recommendations: OptimizationRecommendation[] = [];

  async analyzePerformance(): Promise<OptimizationMetrics> {
    const startTime = performance.now();
    
    try {
      // Bundle analysis
      const scripts = document.querySelectorAll('script[src]');
      const styles = document.querySelectorAll('link[rel="stylesheet"]');
      const bundleSize = scripts.length + styles.length;

      // Image analysis
      const images = document.querySelectorAll('img');
      const unoptimizedImages = Array.from(images).filter(img => {
        const src = img.src || img.getAttribute('src');
        return src && !src.includes('webp') && !src.includes('optimized');
      });

      // CSS analysis
      const styleSheets = Array.from(document.styleSheets);
      let cssRules = 0;
      styleSheets.forEach(sheet => {
        try {
          const rules = sheet.cssRules || sheet.rules;
          if (rules) {
            cssRules += rules.length;
          }
        } catch (e) {
          // Cross-origin stylesheets will throw
        }
      });

      // Memory analysis
      let memoryUsage = 0;
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        memoryUsage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
      }

      // Performance timing
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      const loadTime = navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0;
      const firstPaint = paint.find(p => p.name === 'first-paint')?.startTime || 0;

      // Network analysis
      const connection = (navigator as any).connection;
      const networkType = connection?.effectiveType || 'unknown';

      // Security score calculation
      const securityScore = this.calculateSecurityScore();

      this.metrics = {
        bundleSize,
        imageCount: images.length,
        unoptimizedImages: unoptimizedImages.length,
        cssRules,
        memoryUsage,
        loadTime,
        firstPaint,
        networkType,
        securityScore
      };

      const analysisTime = performance.now() - startTime;
      log('📊 Performance analysis completed in', `${analysisTime.toFixed(2)}ms`);

      return this.metrics;
    } catch (err) {
      error('Performance analysis failed:', err);
      throw err;
    }
  }

  generateRecommendations(): OptimizationRecommendation[] {
    if (!this.metrics) {
      return [];
    }

    this.recommendations = [];

    // Bundle optimization recommendations
    if (this.metrics.bundleSize > 20) {
      this.recommendations.push({
        type: 'bundle',
        priority: 'high',
        title: 'Large Bundle Size',
        description: `Bundle contains ${this.metrics.bundleSize} resources`,
        impact: 'High impact on load time',
        action: 'Consider code splitting and tree shaking'
      });
    }

    // Image optimization recommendations
    if (this.metrics.unoptimizedImages > 0) {
      this.recommendations.push({
        type: 'image',
        priority: 'medium',
        title: 'Unoptimized Images',
        description: `${this.metrics.unoptimizedImages} images need optimization`,
        impact: 'Medium impact on load time and bandwidth',
        action: 'Convert to WebP format and enable lazy loading'
      });
    }

    // Memory optimization recommendations
    if (this.metrics.memoryUsage > 80) {
      this.recommendations.push({
        type: 'performance',
        priority: 'high',
        title: 'High Memory Usage',
        description: `Memory usage is ${this.metrics.memoryUsage.toFixed(1)}%`,
        impact: 'High impact on performance and stability',
        action: 'Optimize memory usage and implement cleanup'
      });
    }

    // CSS optimization recommendations
    if (this.metrics.cssRules > 1000) {
      this.recommendations.push({
        type: 'bundle',
        priority: 'medium',
        title: 'Large CSS Bundle',
        description: `${this.metrics.cssRules} CSS rules detected`,
        impact: 'Medium impact on parsing time',
        action: 'Remove unused CSS and minify stylesheets'
      });
    }

    // Network optimization recommendations
    if (this.metrics.networkType === 'slow-2g' || this.metrics.networkType === '2g') {
      this.recommendations.push({
        type: 'network',
        priority: 'high',
        title: 'Slow Network Connection',
        description: `Network type: ${this.metrics.networkType}`,
        impact: 'High impact on user experience',
        action: 'Enable aggressive optimization and caching'
      });
    }

    // Security recommendations
    if (this.metrics.securityScore < 80) {
      this.recommendations.push({
        type: 'security',
        priority: 'high',
        title: 'Security Vulnerabilities',
        description: `Security score: ${this.metrics.securityScore}/100`,
        impact: 'High impact on security',
        action: 'Implement security headers and fix vulnerabilities'
      });
    }

    return this.recommendations;
  }

  private calculateSecurityScore(): number {
    let score = 100;
    const issues: string[] = [];

    // Check for HTTPS
    if (window.location.protocol !== 'https:') {
      score -= 20;
      issues.push('Not using HTTPS');
    }

    // Check for CSP
    const cspHeader = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!cspHeader) {
      score -= 15;
      issues.push('No Content Security Policy');
    }

    // Check for mixed content
    const mixedContent = document.querySelectorAll('img, script, link').length > 0;
    if (mixedContent && window.location.protocol === 'https:') {
      score -= 10;
      issues.push('Mixed content detected');
    }

    // Check for inline scripts
    const inlineScripts = document.querySelectorAll('script:not([src])');
    if (inlineScripts.length > 0) {
      score -= 10;
      issues.push('Inline scripts detected');
    }

    // Check for secure cookies
    const cookies = document.cookie.split(';');
    const insecureCookies = cookies.filter(cookie => 
      cookie.includes('=') && !cookie.includes('Secure')
    );
    if (insecureCookies.length > 0) {
      score -= 5;
      issues.push('Insecure cookies detected');
    }

    return Math.max(0, score);
  }

  async optimizeImages(): Promise<{ optimized: number; total: number }> {
    const images = document.querySelectorAll('img');
    let optimized = 0;
    const total = images.length;

    for (const img of Array.from(images)) {
      const src = img.src || img.getAttribute('src');
      if (src && !src.includes('webp')) {
        // Suggest WebP conversion
        optimized++;
        
        // Add loading="lazy" if not present
        if (!img.loading) {
          img.setAttribute('loading', 'lazy');
        }
      }
    }

    return { optimized, total };
  }

  async optimizeBundle(): Promise<{ duplicates: number; total: number }> {
    const scripts = document.querySelectorAll('script[src]');
    const styles = document.querySelectorAll('link[rel="stylesheet"]');
    
    const scriptUrls = Array.from(scripts).map(s => s.getAttribute('src'));
    const styleUrls = Array.from(styles).map(s => s.getAttribute('href'));
    
    const allUrls = [...scriptUrls, ...styleUrls];
    const duplicates = allUrls.filter((url, index, arr) => 
      arr.indexOf(url) !== index
    );

    return { duplicates: duplicates.length, total: allUrls.length };
  }

  enableAggressiveOptimization(): void {
    // Service worker registration disabled to prevent conflicts
    log('Service worker registration disabled');

    // Add resource hints
    this.addResourceHints();

    // Enable compression suggestions
    log('🗜️ Enable Gzip/Brotli compression on server');
    
    success('Aggressive optimization enabled');
  }

  private addResourceHints(): void {
    const head = document.head;
    
    // Add preload for critical resources
    const criticalResources = [
      '/src/styles/index.css',
      '/src/main.tsx'
    ];

    criticalResources.forEach(resource => {
      if (!document.querySelector(`link[href="${resource}"]`)) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = resource.endsWith('.css') ? 'style' : 'script';
        head.appendChild(link);
      }
    });
  }

  getMetrics(): OptimizationMetrics | null {
    return this.metrics;
  }

  getRecommendations(): OptimizationRecommendation[] {
    return this.recommendations;
  }
}

export const optimizationAnalyzer = new OptimizationAnalyzer(); 