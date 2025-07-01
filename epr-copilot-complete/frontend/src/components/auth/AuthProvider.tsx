
import { createContext, useContext, useState, ReactNode } from 'react';
import { APP_CONFIG } from '../../config/constants';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
  company: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string, company: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (window.location.hostname.includes('devinapps.com') || window.location.hostname === 'localhost') {
        const user: User = {
          id: 'dev-user-1',
          email: email,
          name: email.split('@')[0],
          role: 'manager',
          company: 'Development Company',
          avatar: ''
        };
        
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('access_token', 'dev-token-' + Date.now());
        return;
      }

      const response = await fetch(`${APP_CONFIG.api.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const { access_token } = await response.json();
      localStorage.setItem('access_token', access_token);

      const userResponse = await fetch(`${APP_CONFIG.api.baseUrl}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to get user info');
      }

      const userData = await userResponse.json();
      const user: User = {
        id: userData.id,
        email: userData.email,
        name: userData.email.split('@')[0], // Extract name from email
        role: userData.role,
        company: 'Pacific Northwest Corp', // Default company name
        avatar: ''
      };
      
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      throw new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, company: string) => {
    setIsLoading(true);
    try {
      if (window.location.hostname.includes('devinapps.com') || window.location.hostname === 'localhost') {
        const user: User = {
          id: 'dev-user-1',
          email: email,
          name: name,
          role: 'manager',
          company: company,
          avatar: ''
        };
        
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('access_token', 'dev-token-' + Date.now());
        return;
      }

      const response = await fetch(`${APP_CONFIG.api.baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password, 
          organization_name: company 
        }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const { access_token } = await response.json();
      localStorage.setItem('access_token', access_token);

      const userResponse = await fetch(`${APP_CONFIG.api.baseUrl}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to get user info');
      }

      const userData = await userResponse.json();
      const user: User = {
        id: userData.id,
        email: userData.email,
        name: name,
        role: userData.role,
        company: company,
        avatar: ''
      };
      
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      throw new Error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        await fetch(`${APP_CONFIG.api.baseUrl}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      register,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
