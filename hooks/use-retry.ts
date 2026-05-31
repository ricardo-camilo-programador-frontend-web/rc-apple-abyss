'use client';

import { useState, useCallback, useRef } from 'react';

interface UseRetryOptions {
  maxRetries?: number;
  delay?: number;
  backoff?: boolean;
  onRetry?: (attempt: number, error: Error) => void;
  onMaxRetriesReached?: (error: Error) => void;
}

interface UseRetryReturn<T> {
  execute: (...args: any[]) => Promise<T | null>;
  loading: boolean;
  error: Error | null;
  retryCount: number;
  reset: () => void;
  canRetry: boolean;
}

export function useRetry<T>(
  asyncFn: (...args: any[]) => Promise<T>,
  options: UseRetryOptions = {}
): UseRetryReturn<T> {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = true,
    onRetry,
    onMaxRetriesReached,
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await asyncFn(...args);
        setRetryCount(0);
        setLoading(false);
        return result;
      } catch (err) {
        const caughtError = err instanceof Error ? err : new Error(String(err));

        if (retryCount < maxRetries) {
          const currentDelay = backoff ? delay * Math.pow(2, retryCount) : delay;

          setRetryCount((prev) => {
            const newCount = prev + 1;
            onRetry?.(newCount, caughtError);
            return newCount;
          });

          // Use asyncFn directly instead of recursive execute reference
          // to avoid react-hooks/immutability circular reference error
          return new Promise((resolve) => {
            timeoutRef.current = setTimeout(async () => {
              let retryResult: T | null = null;
              let lastError: Error | null = caughtError;
              const remainingRetries = maxRetries - retryCount - 1;

              for (let i = 0; i <= remainingRetries; i++) {
                try {
                  retryResult = await asyncFn(...args);
                  setRetryCount(0);
                  setLoading(false);
                  resolve(retryResult);
                  return;
                } catch (retryErr) {
                  lastError = retryErr instanceof Error ? retryErr : new Error(String(retryErr));
                  onRetry?.(retryCount + i + 2, lastError);

                  if (i < remainingRetries) {
                    const nextDelay = backoff ? delay * Math.pow(2, retryCount + i + 1) : delay;
                    await new Promise<void>((r) => setTimeout(r, nextDelay));
                  }
                }
              }

              setError(lastError);
              setLoading(false);
              onMaxRetriesReached?.(lastError);
              resolve(null);
            }, currentDelay);
          });
        } else {
          setError(caughtError);
          setLoading(false);
          onMaxRetriesReached?.(caughtError);
          return null;
        }
      }
    },
    [asyncFn, retryCount, maxRetries, delay, backoff, onRetry, onMaxRetriesReached]
  );

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setLoading(false);
    setError(null);
    setRetryCount(0);
  }, []);

  return {
    execute,
    loading,
    error,
    retryCount,
    reset,
    canRetry: retryCount < maxRetries,
  };
}

// Utility function for retrying async operations
export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: UseRetryOptions = {}
): Promise<T> {
  const { maxRetries = 3, delay = 1000, backoff = true } = options;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      
      if (attempt < maxRetries) {
        const currentDelay = backoff ? delay * Math.pow(2, attempt) : delay;
        await new Promise((resolve) => setTimeout(resolve, currentDelay));
      }
    }
  }

  throw lastError;
}

// Hook for network requests with retry
export function useNetworkRetry<T>(
  url: string,
  options: RequestInit & UseRetryOptions = {}
) {
  const { maxRetries = 3, delay = 1000, backoff = true, ...fetchOptions } = options;

  const fetchData = useCallback(async () => {
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json() as Promise<T>;
  }, [url, fetchOptions]);

  return useRetry(fetchData, { maxRetries, delay, backoff });
}
