
import { ReactNode } from 'react';
import { useAuth } from './AuthProvider';
import { AuthPage } from './AuthPage';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuth();

  const isTestMode = process.env.NODE_ENV === 'development';
  
  if (!user && !isTestMode) {
    return <AuthPage />;
  }

  return <>{children}</>;
}
