import React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ValidationMessageProps {
  type: 'error' | 'success' | 'warning' | 'info';
  message: string;
  className?: string;
}

export const ValidationMessage: React.FC<ValidationMessageProps> = ({
  type,
  message,
  className
}) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'success':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'warning':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'info':
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className={cn(
      'flex items-center gap-2 p-3 rounded-md border text-sm',
      getStyles(),
      className
    )}>
      {getIcon()}
      <span>{message}</span>
    </div>
  );
};
