
import { browserUtils } from './browserUtils';

class SafeStorage {
  private isAvailable(): boolean {
    return browserUtils.isBrowser() && typeof localStorage !== 'undefined';
  }

  getItem(key: string): string | null {
    return this.isAvailable() ? localStorage.getItem(key) : null;
  }

  setItem(key: string, value: string): void {
    if (this.isAvailable()) {
      localStorage.setItem(key, value);
    }
  }

  removeItem(key: string): void {
    if (this.isAvailable()) {
      localStorage.removeItem(key);
    }
  }

  clear(): void {
    if (this.isAvailable()) {
      localStorage.clear();
    }
  }
}

const safeStorage = new SafeStorage();

export class SecureStorage {
  private static encrypt(data: string): string {
    // Simple encoding - in production, use proper encryption
    return btoa(data);
  }
  
  private static decrypt(data: string): string {
    try {
      return atob(data);
    } catch {
      return '';
    }
  }
  
  static setItem(key: string, value: any): void {
    try {
      const encrypted = this.encrypt(JSON.stringify(value));
      safeStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Failed to store data:', error);
    }
  }
  
  static getItem<T>(key: string): T | null {
    try {
      const encrypted = safeStorage.getItem(key);
      if (!encrypted) return null;
      
      const decrypted = this.decrypt(encrypted);
      return JSON.parse(decrypted) as T;
    } catch (error) {
      console.error('Failed to retrieve data:', error);
      return null;
    }
  }
  
  static removeItem(key: string): void {
    safeStorage.removeItem(key);
  }
  
  static clear(): void {
    safeStorage.clear();
  }
}
