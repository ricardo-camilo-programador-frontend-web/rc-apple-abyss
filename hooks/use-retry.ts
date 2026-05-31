'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseRetryOptions {
  maxRetries?: number;
  delay?: number;
  backoff?: boolean;
  onRetry?: (attempt: number, error: Error) => void;
  onMaxRetriesReached?: (error: Error) => void;
}

interface UseRetryReturn<T, A extends unknown[]> {
  execute: (...args: A) => Promise<T | null>;
  loading: boolean;
  error: Error | null;
  retryCount: number;
  reset: () => void;
  canRetry: boolean;
}

export function useRetry<T, A extends unknown[] = unknown[]>(
  asyncFn: (...args: A) => Promise<T>,
  options: UseRetryOptions = {}
): UseRetryReturn<T, A> {
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

  // Refs for mutable values read inside async callbacks to avoid stale closures
  const asyncFnRef = useRef(asyncFn);
  const onRetryRef = useRef(onRetry);
  const onMaxRetriesRef = useRef(onMaxRetriesReached);
  const mountedRef = useRef(true);
  const abortRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync refs outside render (React 19 rule)
  useEffect(() => { asyncFnRef.current = asyncFn; });
  useEffect(() => { onRetryRef.current = onRetry; });
  useEffect(() => { onMaxRetriesRef.current = onMaxRetriesReached; });

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current = true;
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const execute = useCallback(
    async (...args: A): Promise<T | null> => {
      // Guard against concurrent calls
      if (loading) return null;

      setLoading(true);
      setError(null);

      try {
        const result = await asyncFnRef.current(...args);
        if (!mountedRef.current) return null;
        setRetryCount(0);
        setLoading(false);
        return result;
      } catch (err) {
        const caughtError = err instanceof Error ? err : new Error(String(err));

        if (!mountedRef.current) return null;

        let lastError = caughtError;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          if (abortRef.current || !mountedRef.current) return null;

          try {
            const result = await asyncFnRef.current(...args);
            if (!mountedRef.current) return null;
            setRetryCount(0);
            setLoading(false);
            return result;
          } catch (retryErr) {
            lastError = retryErr instanceof Error ? retryErr : new Error(String(retryErr));

            if (attempt < maxRetries && !abortRef.current && mountedRef.current) {
              const newCount = attempt + 1;
              setRetryCount(newCount);
              onRetryRef.current?.(newCount, lastError);

              const currentDelay = backoff
                ? delay * Math.pow(2, attempt)
                : delay;

              await new Promise<void>((resolve) => {
                timeoutRef.current = setTimeout(resolve, currentDelay);
              });
            }
          }
        }

        if (!mountedRef.current) return null;
        setError(lastError);
        setLoading(false);
        onMaxRetriesRef.current?.(lastError);
        return null;
      }
    },
    [loading, maxRetries, delay, backoff]
  );

  const reset = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    abortRef.current = true;
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

// Utility function for retrying async operations (narrowed options)
interface RetryAsyncOptions {
  maxRetries?: number;
  delay?: number;
  backoff?: boolean;
}

export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: RetryAsyncOptions = {}
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
  options: Omit<RequestInit, 'signal'> & UseRetryOptions = {}
) {
  const { maxRetries = 3, delay = 1000, backoff = true, ...fetchOptions } = options;

  // Use ref to avoid re-creating fetchData every render
  const fetchOptionsRef = useRef(fetchOptions);
  const urlRef = useRef(url);

  // Sync refs outside render
  useEffect(() => { fetchOptionsRef.current = fetchOptions; });
  useEffect(() => { urlRef.current = url; });

  const fetchData = useCallback(async () => {
    const response = await fetch(urlRef.current, fetchOptionsRef.current);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json() as Promise<T>;
  }, []);

  return useRetry(fetchData, { maxRetries, delay, backoff });
}
