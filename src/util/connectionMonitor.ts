// Connection Monitor Utility
// Detects slow connections and adjusts loading behavior

interface ConnectionInfo {
  isSlow: boolean;
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

class ConnectionMonitor {
  private static instance: ConnectionMonitor;
  private connectionInfo: ConnectionInfo = {
    isSlow: false,
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
    saveData: false
  };
  private listeners: Array<(info: ConnectionInfo) => void> = [];

  static getInstance(): ConnectionMonitor {
    if (!ConnectionMonitor.instance) {
      ConnectionMonitor.instance = new ConnectionMonitor();
    }
    return ConnectionMonitor.instance;
  }

  constructor() {
    this.initializeConnectionMonitoring();
  }

  private initializeConnectionMonitoring(): void {
    // Check if Network Information API is available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      const updateConnectionInfo = () => {
        this.connectionInfo = {
          isSlow: this.checkIfSlowConnection(connection),
          effectiveType: connection.effectiveType || '4g',
          downlink: connection.downlink || 10,
          rtt: connection.rtt || 50,
          saveData: connection.saveData || false
        };

        console.log('🌐 Connection Info:', this.connectionInfo);
        this.notifyListeners();
      };

      // Listen for connection changes
      connection.addEventListener('change', updateConnectionInfo);
      
      // Initial check
      updateConnectionInfo();
    } else {
      // Fallback for browsers without Network Information API
      this.detectConnectionSpeed();
    }
  }

  private checkIfSlowConnection(connection: any): boolean {
    if (!connection) return false;

    const { effectiveType, downlink, rtt } = connection;
    
    // Consider connection slow if:
    // - Effective type is 2g or slow-2g
    // - Downlink is less than 1 Mbps
    // - RTT is greater than 200ms
    return (
      effectiveType === '2g' ||
      effectiveType === 'slow-2g' ||
      downlink < 1 ||
      rtt > 200
    );
  }

  private async detectConnectionSpeed(): Promise<void> {
    try {
      // Simple speed test using a small image
      const startTime = performance.now();
      await fetch('/images/favicon/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      const isSlow = duration > 1000; // Consider slow if takes more than 1 second
      
      this.connectionInfo = {
        isSlow,
        effectiveType: isSlow ? 'slow' : '4g',
        downlink: isSlow ? 0.5 : 10,
        rtt: duration,
        saveData: false
      };

      console.log('🌐 Connection Speed Test:', this.connectionInfo);
      this.notifyListeners();
    } catch (error) {
      console.warn('Failed to detect connection speed:', error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.connectionInfo));
  }

  // Subscribe to connection changes
  subscribe(listener: (info: ConnectionInfo) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Get current connection info
  getConnectionInfo(): ConnectionInfo {
    return { ...this.connectionInfo };
  }

  // Check if connection is slow
  isSlowConnection(): boolean {
    return this.connectionInfo.isSlow;
  }

  // Get recommended loading strategy
  getLoadingStrategy(): 'skeleton' | 'spinner' | 'minimal' {
    if (this.connectionInfo.isSlow) {
      return 'skeleton'; // Show skeleton for slow connections
    } else if (this.connectionInfo.effectiveType === '3g') {
      return 'spinner'; // Show spinner for 3g
    } else {
      return 'minimal'; // Minimal loading for fast connections
    }
  }

  // Get recommended timeout for API calls
  getApiTimeout(): number {
    if (this.connectionInfo.isSlow) {
      return 30000; // 30 seconds for slow connections
    } else if (this.connectionInfo.effectiveType === '3g') {
      return 15000; // 15 seconds for 3g
    } else {
      return 10000; // 10 seconds for fast connections
    }
  }
}

// Export singleton instance
export const connectionMonitor = ConnectionMonitor.getInstance();

// Export the class for testing
export { ConnectionMonitor }; 