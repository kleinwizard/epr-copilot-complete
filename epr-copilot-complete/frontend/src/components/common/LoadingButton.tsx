import React from 'react';
import { Button, ButtonProps } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
  children?: React.ReactNode;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  loadingText = 'Loading...',
  children,
  disabled,
  className,
  ...props
}) => {
  return (
    <Button
      disabled={disabled || loading}
      className={cn(className)}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {loading ? loadingText : children}
    </Button>
  );
};
