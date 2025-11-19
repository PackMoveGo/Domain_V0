// API Consent Coordinator
// Coordinates between API service and cookie consent system
// Manages retry queue for API calls blocked by consent
// Handles automatic retries after consent is given

import { addConsentStateListener } from '../services/service.apiSW';

interface PendingApiCall {
  endpoint: string;
  apiCall: () => Promise<any>;
  context: string;
  timestamp: number;
  retryCount: number;
}

class ApiConsentCoordinator {
  private static instance: ApiConsentCoordinator;
  private pendingCalls: Map<string, PendingApiCall> = new Map();
  private maxRetries = 3;
  private retryDelay = 500; // 500ms delay between retries
  private isInitialized = false;

  static getInstance(): ApiConsentCoordinator {
    if (!ApiConsentCoordinator.instance) {
      ApiConsentCoordinator.instance = new ApiConsentCoordinator();
    }
    return ApiConsentCoordinator.instance;
  }

  private constructor() {
    // Initialize on first access
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  /**
   * Initialize the coordinator
   */
  private initialize(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Listen for consent state changes
    addConsentStateListener((hasConsent: boolean) => {
      if (hasConsent) {
        this.retryPendingCalls();
      }
    });

    // Listen for window events
    if (typeof window !== 'undefined') {
      window.addEventListener('api-consent-granted', () => {
        this.retryPendingCalls();
      });

      window.addEventListener('cookie-opt-in', () => {
        // Small delay to ensure state is updated
        setTimeout(() => {
          this.retryPendingCalls();
        }, 200);
      });
    }

  }

  /**
   * Check if an error is consent-blocked
   */
  isConsentBlockedError(error: any): boolean {
    if (!error) return false;
    
    return (
      (error as any).isConsentBlocked === true ||
      (error instanceof Error && 
        error.message.includes('cookie consent') && 
        error.message.includes('user must opt in first'))
    );
  }

  /**
   * Check if an error is a real 503 (not consent-blocked)
   */
  isReal503Error(error: any): boolean {
    if (!error) return false;
    
    // If it's consent-blocked, it's NOT a real 503
    if (this.isConsentBlockedError(error)) {
      return false;
    }
    
    return (
      (error as any).is503Error === true ||
      (error instanceof Error && (
        error.message.includes('503') ||
        error.message.includes('Service Unavailable') ||
        error.message.includes('temporarily unavailable')
      ))
    );
  }

  /**
   * Add a pending API call to the retry queue
   */
  addPendingCall(
    endpoint: string,
    apiCall: () => Promise<any>,
    context: string = 'unknown'
  ): void {
    const key = `${endpoint}-${context}-${Date.now()}`;
    
    this.pendingCalls.set(key, {
      endpoint,
      apiCall,
      context,
      timestamp: Date.now(),
      retryCount: 0
    });

  }

  /**
   * Remove a pending call from the queue
   */
  removePendingCall(endpoint: string, context?: string): void {
    const keysToRemove: string[] = [];
    
    this.pendingCalls.forEach((call, key) => {
      if (call.endpoint === endpoint && (!context || call.context === context)) {
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach(key => {
      this.pendingCalls.delete(key);
    });
  }

  /**
   * Retry all pending API calls
   */
  async retryPendingCalls(): Promise<void> {
    if (this.pendingCalls.size === 0) {
      return;
    }

    // Clear global block before retrying
    // Import APIsw dynamically to avoid circular dependencies
    try {
      const { APIsw } = await import('../services/service.apiSW');
      const apiService = APIsw.getInstance();
      if (apiService && typeof (apiService as any).clearGlobalBlock === 'function') {
        (apiService as any).clearGlobalBlock();
        console.log('🔄 [COORDINATOR] Cleared global block before retrying API calls');
      }
    } catch (error) {
      console.warn('⚠️ [COORDINATOR] Could not clear global block:', error);
    }


    const callsToRetry = Array.from(this.pendingCalls.values());
    
    // Clear the queue first to prevent duplicates
    this.pendingCalls.clear();

    // Retry each call with a delay
    for (let i = 0; i < callsToRetry.length; i++) {
      const call = callsToRetry[i];
      
      // Stagger retries to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, i * this.retryDelay));

      try {
        await call.apiCall();
        console.log(`✅ [COORDINATOR] Successfully retried: ${call.endpoint}`);
      } catch (error) {
        call.retryCount++;
        
        if (this.isConsentBlockedError(error)) {
          // Still consent-blocked, add back to queue
          if (call.retryCount < this.maxRetries) {
            const key = `${call.endpoint}-${call.context}-${Date.now()}`;
            this.pendingCalls.set(key, call);
          } else {
            console.warn(`⚠️ [COORDINATOR] Max retries reached for: ${call.endpoint}`);
          }
        } else {
          // Different error, don't retry
          console.error(`❌ [COORDINATOR] Retry failed for ${call.endpoint}:`, error);
        }
      }
    }
  }

  /**
   * Clear all pending calls
   */
  clearPendingCalls(): void {
    const count = this.pendingCalls.size;
    this.pendingCalls.clear();
  }

  /**
   * Get pending calls count
   */
  getPendingCallsCount(): number {
    return this.pendingCalls.size;
  }

  /**
   * Get pending calls info
   */
  getPendingCallsInfo(): Array<{ endpoint: string; context: string; timestamp: number }> {
    return Array.from(this.pendingCalls.values()).map(call => ({
      endpoint: call.endpoint,
      context: call.context,
      timestamp: call.timestamp
    }));
  }
}

// Create singleton instance
const coordinator = ApiConsentCoordinator.getInstance();

// Export functions
export const isConsentBlockedError = (error: any) => coordinator.isConsentBlockedError(error);
export const isReal503Error = (error: any) => coordinator.isReal503Error(error);
export const addPendingApiCall = (endpoint: string, apiCall: () => Promise<any>, context?: string) => 
  coordinator.addPendingCall(endpoint, apiCall, context);
export const removePendingApiCall = (endpoint: string, context?: string) => 
  coordinator.removePendingCall(endpoint, context);
export const retryPendingApiCalls = () => coordinator.retryPendingCalls();
export const clearPendingApiCalls = () => coordinator.clearPendingCalls();
export const getPendingApiCallsCount = () => coordinator.getPendingCallsCount();
export const getPendingApiCallsInfo = () => coordinator.getPendingCallsInfo();

// Export default instance
export default coordinator;

