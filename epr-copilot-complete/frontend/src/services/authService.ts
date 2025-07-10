import { APP_CONFIG } from '../config/constants';

class AuthService {
  private tokenKey = 'access_token';
  private refreshTokenKey = 'refresh_token';
  private tokenExpiryKey = 'token_expiry';

  getAccessToken(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    const expiry = localStorage.getItem(this.tokenExpiryKey);
    
    if (token && expiry) {
      const expiryTime = parseInt(expiry, 10);
      if (Date.now() > expiryTime) {
        this.refreshToken();
        return null;
      }
    }
    
    return token;
  }

  async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem(this.refreshTokenKey);
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${APP_CONFIG.api.baseUrl}/api/auth/refresh`, {
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
    localStorage.setItem(this.tokenKey, accessToken);
    
    if (refreshToken) {
      localStorage.setItem(this.refreshTokenKey, refreshToken);
    }
    
    if (expiresIn) {
      const expiryTime = Date.now() + (expiresIn * 1000);
      localStorage.setItem(this.tokenExpiryKey, expiryTime.toString());
    }
  }

  clearTokens() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.tokenExpiryKey);
  }
}

export const authService = new AuthService();
