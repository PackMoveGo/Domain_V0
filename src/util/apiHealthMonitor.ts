// API health monitoring utility with detailed status display
import { log, info, warn, error, success } from './consoleManager';

interface HealthResponse {
  success: boolean;
  data: {
    status: string;
    timestamp: string;
    version: string;
    environment: string;
    uptime: string;
    services: Record<string, string>;
    metrics: {
      responseTime: string;
      requestsPerMinute: number;
      errorRate: string;
    };
  };
}

interface BackendStatus {
  isOnline: boolean;
  lastCheck: number;
  responseTime: number;
  statusCode: number;
  endpoint: string;
  environment: string;
  version?: string;
  uptime?: string;
  services?: Record<string, string>;
  metrics?: {
    responseTime: string;
    requestsPerMinute: number;
    errorRate: string;
  };
  error?: string;
}

export class ApiHealthMonitor {
  private isOnline: boolean = true;
  private lastCheck: number = Date.now();
  private checkInterval: number = 30000; // 30 seconds
  private detailedStatus: BackendStatus | null = null;
  private consecutiveFailures: number = 0;
  private maxFailures: number = 3;

  async checkHealth(): Promise<boolean> {
    const startTime = performance.now();
    const endpoint = '/api/health';
    
    try {
      // Use centralized API service with authentication
      const { api } = await import('../services/service.apiSW');
      const result = await api.checkHealth();
      
      const responseTime = performance.now() - startTime;
      this.isOnline = !!result;
      this.lastCheck = Date.now();
      this.consecutiveFailures = 0;
      
      // Store detailed status
      const healthResult = result as HealthResponse;
      this.detailedStatus = {
        isOnline: this.isOnline,
        lastCheck: this.lastCheck,
        responseTime,
        statusCode: 200,
        endpoint,
        environment: import.meta.env.VITE_DEV_MODE || 'development',
        version: healthResult?.data?.version,
        uptime: healthResult?.data?.uptime,
        services: healthResult?.data?.services,
        metrics: healthResult?.data?.metrics
      };
      
      if (!this.isOnline) {
        this.showOfflineMessage();
        this.displayBackendStatus();
      } else {
        this.hideOfflineMessage();
        this.displayBackendStatus();
      }
      
      return this.isOnline;
    } catch (error) {
      const responseTime = performance.now() - startTime;
      this.isOnline = false;
      this.consecutiveFailures++;
      this.lastCheck = Date.now();
      
      // Store error status
      this.detailedStatus = {
        isOnline: false,
        lastCheck: this.lastCheck,
        responseTime,
        statusCode: 0,
        endpoint,
        environment: import.meta.env.VITE_DEV_MODE || 'development',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      this.showOfflineMessage();
      this.displayBackendStatus();
      return false;
    }
  }

  showOfflineMessage(): void {
    // Create or update offline banner
    const banner = document.getElementById('offline-banner') || this.createOfflineBanner();
    banner.style.display = 'block';
  }

  hideOfflineMessage(): void {
    const banner = document.getElementById('offline-banner');
    if (banner) banner.style.display = 'none';
  }

  private createOfflineBanner(): HTMLElement {
    const banner = document.createElement('div');
    banner.id = 'offline-banner';
    banner.innerHTML = `
      <div style="
        position: fixed; top: 0; left: 0; right: 0; 
        background: #ff4444; color: white; padding: 10px; 
        text-align: center; z-index: 9999; font-weight: bold;
      ">
        ⚠️ API is currently unavailable. Some features may not work properly.
      </div>
    `;
    document.body.appendChild(banner);
    return banner;
  }

  startMonitoring(): void {
    log('🔧 Starting API health monitoring...');
    this.checkHealth();
    setInterval(() => this.checkHealth(), this.checkInterval);
  }

  getStatus(): { isOnline: boolean; lastCheck: number } {
    return {
      isOnline: this.isOnline,
      lastCheck: this.lastCheck
    };
  }

  getDetailedStatus(): BackendStatus | null {
    return this.detailedStatus;
  }

  // Enhanced console display for backend status
  displayBackendStatus(): void {
    if (!this.detailedStatus) {
      warn('No backend status available');
      return;
    }

    const status = this.detailedStatus;
    const isDev = import.meta.env.VITE_DEV_MODE === 'development';
    
    if (!isDev) return; // Only show in development

    console.group('🔧 Backend Status Report');
    
    // Status indicator
    if (status.isOnline) {
      success('✅ Backend is ONLINE');
    } else {
      error('❌ Backend is OFFLINE');
    }

    // Basic info
    console.table({
      'Environment': status.environment,
      'Endpoint': status.endpoint,
      'Last Check': new Date(status.lastCheck).toLocaleTimeString(),
      'Response Time': `${status.responseTime.toFixed(2)}ms`,
      'Status Code': status.statusCode,
      'Consecutive Failures': this.consecutiveFailures
    });

    // API URL info
    const apiUrl = import.meta.env.VITE_API_URL;
    info('🌐 API Configuration', {
      'VITE_API_URL': apiUrl,
      'VITE_DEV_MODE': import.meta.env.VITE_DEV_MODE,
      'SKIP_BACKEND_CHECK': import.meta.env.SKIP_BACKEND_CHECK
    });

    // Detailed health info if available
    if (status.version || status.uptime || status.services) {
      console.group('📊 Health Details');
      
      if (status.version) {
        info('Version', status.version);
      }
      
      if (status.uptime) {
        info('Uptime', status.uptime);
      }
      
      if (status.services) {
        console.table(status.services);
      }
      
      if (status.metrics) {
        console.table(status.metrics);
      }
      
      console.groupEnd();
    }

    // Error details if available
    if (status.error) {
      error('Error Details', status.error);
    }

    // Performance indicators
    const performanceIndicator = this.getPerformanceIndicator(status.responseTime);
    console.log(`⚡ Performance: ${performanceIndicator}`);

    // Recommendations
    this.displayRecommendations(status);

    console.groupEnd();
  }

  private getPerformanceIndicator(responseTime: number): string {
    if (responseTime < 100) return '🚀 Excellent (< 100ms)';
    if (responseTime < 500) return '✅ Good (100-500ms)';
    if (responseTime < 1000) return '⚠️ Slow (500ms-1s)';
    return '❌ Very Slow (> 1s)';
  }

  private displayRecommendations(status: BackendStatus): void {
    const recommendations: string[] = [];

    if (status.responseTime > 1000) {
      recommendations.push('Consider optimizing backend response time');
    }

    if (this.consecutiveFailures > 0) {
      recommendations.push(`Backend has failed ${this.consecutiveFailures} consecutive times`);
    }

    if (!status.isOnline && this.consecutiveFailures >= this.maxFailures) {
      recommendations.push('Backend appears to be down - check server status');
    }

    if (recommendations.length > 0) {
      console.group('💡 Recommendations');
      recommendations.forEach(rec => warn(rec));
      console.groupEnd();
    }
  }

  // Method to manually trigger status display
  showStatus(): void {
    this.displayBackendStatus();
  }

  // Method to get status summary for other components
  getStatusSummary(): string {
    if (!this.detailedStatus) return 'Status unknown';
    
    const status = this.detailedStatus;
    const timeSinceLastCheck = Date.now() - status.lastCheck;
    const minutesAgo = Math.floor(timeSinceLastCheck / 60000);
    
    return `${status.isOnline ? '✅ Online' : '❌ Offline'} | Last check: ${minutesAgo}min ago | Response: ${status.responseTime.toFixed(0)}ms`;
  }
}

// Initialize health monitoring
export const apiMonitor = new ApiHealthMonitor();
apiMonitor.startMonitoring();

// Export convenience function for manual status display
export const showBackendStatus = () => apiMonitor.showStatus();

// Make it available globally for console access
if (typeof window !== 'undefined') {
  (window as any).showBackendStatus = showBackendStatus;
  (window as any).getBackendStatus = () => apiMonitor.getDetailedStatus();
  (window as any).getBackendStatusSummary = () => apiMonitor.getStatusSummary();
} 