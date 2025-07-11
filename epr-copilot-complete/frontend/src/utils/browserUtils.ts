/**
 * Browser utility functions that safely handle browser APIs
 * Works in both browser and Node.js test environments
 */

class BrowserUtils {
  /**
   * Check if code is running in a browser environment
   */
  isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.document !== 'undefined';
  }

  /**
   * Get the current hostname safely
   */
  getHostname(): string {
    if (this.isBrowser() && window.location) {
      return window.location.hostname;
    }
    return 'localhost'; // Default for test environment
  }

  /**
   * Check if running in development mode
   */
  isDevelopment(): boolean {
    const hostname = this.getHostname();
    return hostname === 'localhost' || 
           hostname === '127.0.0.1' ||
           hostname.includes('devinapps.com');
  }

  /**
   * Get the full URL safely
   */
  getUrl(): string {
    if (this.isBrowser() && window.location) {
      return window.location.href;
    }
    return 'http://localhost:3000'; // Default for test environment
  }

  /**
   * Safe redirect
   */
  redirect(url: string): void {
    if (this.isBrowser() && window.location) {
      window.location.href = url;
    }
  }
}

export const browserUtils = new BrowserUtils();
