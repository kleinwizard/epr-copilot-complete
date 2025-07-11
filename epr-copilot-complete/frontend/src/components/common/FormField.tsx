import React from 'react';
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';

export interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  className?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  placeholder,
  description,
  required = false,
  className,
  error,
  value,
  onChange,
  disabled = false
}) => {
  return (
    <FormItem className={className}>
      <FormLabel className={cn(required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
        {label}
      </FormLabel>
      <FormControl>
        <Input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className={cn(error && "border-red-500")}
        />
      </FormControl>
      {description && (
        <FormDescription>
          {description}
        </FormDescription>
      )}
      {error && (
        <FormMessage>
          {error}
        </FormMessage>
      )}
    </FormItem>
  );
};
