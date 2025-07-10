export function useOptimisticUpdate<T>(
  updateFn: (data: T) => Promise<T>,
  onSuccess?: (data: T) => void,
  onError?: (error: Error, rollbackData: T) => void
) {
  return async (optimisticData: T, rollbackData: T) => {
    onSuccess?.(optimisticData);
    
    try {
      const result = await updateFn(optimisticData);
      onSuccess?.(result);
      return result;
    } catch (error) {
      onError?.(error as Error, rollbackData);
      throw error;
    }
  };
}
