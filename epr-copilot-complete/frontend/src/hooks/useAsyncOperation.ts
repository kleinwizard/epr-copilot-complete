
import { useState, useCallback } from 'react';
import { handleAsyncError } from '@/utils/errorHandling';

export function useAsyncOperation<T>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async (operation: () => Promise<T>) => {
    setLoading(true);
    setError(null);
    
    const result = await handleAsyncError(operation);
    
    if (result) {
      setData(result);
    } else {
      setError('Operation failed');
    }
    
    setLoading(false);
    return result;
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return { loading, error, data, execute, reset };
}
