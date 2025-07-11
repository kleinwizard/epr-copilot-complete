import { APP_CONFIG } from '../config/constants';

class BrowserStorage {
  private isAvailable(): boolean {
    try {
      return typeof window !== 'undefined' && window.localStorage !== undefined;
    } catch {
      return false;
    }
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
}

class AuthService {
  private tokenKey = 'access_token';
  private refreshTokenKey = 'refresh_token';
  private tokenExpiryKey = 'token_expiry';
  private storage = new BrowserStorage();

  getAccessToken(): string | null {
    const token = this.storage.getItem(this.tokenKey);
    const expiry = this.storage.getItem(this.tokenExpiryKey);
    
    if (token && expiry) {
      const expiryTime = parseInt(expiry, 10);
      if (Date.now() > expiryTime) {
        this.refreshToken();
        return null;
      }
    }
    
    if (!token && (import.meta.env.DEV || window.location.hostname === 'localhost')) {
      return 'dev-token-local-testing';
    }
    
    return token;
  }

  async refreshToken(): Promise<boolean> {
    const refreshToken = this.storage.getItem(this.refreshTokenKey);
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${APP_CONFIG.api.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        this.clearTokens();
        return false;
      }

      const data = await response.json();
      this.setTokens(data.access_token, data.refresh_token, data.expires_in);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      return false;
    }
  }

  setTokens(accessToken: string, refreshToken?: string, expiresIn?: number) {
    this.storage.setItem(this.tokenKey, accessToken);
    
    if (refreshToken) {
      this.storage.setItem(this.refreshTokenKey, refreshToken);
    }
    
    if (expiresIn) {
      const expiryTime = Date.now() + (expiresIn * 1000);
      this.storage.setItem(this.tokenExpiryKey, expiryTime.toString());
    }
  }

  clearTokens() {
    this.storage.removeItem(this.tokenKey);
    this.storage.removeItem(this.refreshTokenKey);
    this.storage.removeItem(this.tokenExpiryKey);
  }
}

export const authService = new AuthService();
