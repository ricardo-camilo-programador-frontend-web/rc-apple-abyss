'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseRetryOptions {
  maxRetries?: number;
  delay?: number;
  backoff?: boolean;
  onRetry?: (attempt: number, error: Error) => void;
  onMaxRetriesReached?: (error: Error) => void;
}

interface UseRetryReturn<T, A extends Array<unknown>> {
  execute: (...args: A) => Promise<T | null>;
  loading: boolean;
  error: Error | null;
  retryCount: number;
  reset: () => void;
  canRetry: boolean;
}

// Maximum backoff cap to prevent unbounded delays (e.g., 30s)
const MAX_BACKOFF_MS = 30_000;

export function useRetry<T, A extends Array<unknown> = Array<unknown>>(
  asyncFn: (...args: A) => Promise<T>,
  options: UseRetryOptions = {},
): UseRetryReturn<T, A> {
  const {
    maxRetries = 3,
    delay: rawDelay = 1000,
    backoff = true,
    onRetry,
    onMaxRetriesReached,
  } = options;

  // Clamp delay to valid non-negative finite number
  const delay = Number.isFinite(rawDelay) && rawDelay >= 0 ? rawDelay : 1000;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Refs for mutable values read inside async callbacks to avoid stale closures
  const asyncFnRef = useRef(asyncFn);
  const onRetryRef = useRef(onRetry);
  const onMaxRetriesRef = useRef(onMaxRetriesReached);
  const mountedRef = useRef(true);
  const abortRef = useRef(false);
  const loadingRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resolveDelayRef = useRef<(() => void) | null>(null);
  // Generation counter to invalidate old operations after reset()
  const generationRef = useRef(0);

  // Sync refs outside render (React 19 rule)
  useEffect(() => {
    asyncFnRef.current = asyncFn;
  });
  useEffect(() => {
    onRetryRef.current = onRetry;
  });
  useEffect(() => {
    onMaxRetriesRef.current = onMaxRetriesReached;
  });

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    abortRef.current = false;
    loadingRef.current = false;
    return () => {
      mountedRef.current = false;
      abortRef.current = true;
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      // Resolve any pending delay promise to prevent dangling async
      resolveDelayRef.current?.();
      resolveDelayRef.current = null;
    };
  }, []);

  const execute = useCallback(
    async (...args: A): Promise<T | null> => {
      // Guard against concurrent calls using ref (not stale closure state)
      if (loadingRef.current) return null;
      loadingRef.current = true;

      // Reset abort flag and bump generation for fresh start
      abortRef.current = false;
      const currentGeneration = ++generationRef.current;

      setLoading(true);
      setError(null);

      // Helper: check if this operation is still valid
      const isStale = () =>
        !mountedRef.current || abortRef.current || generationRef.current !== currentGeneration;

      // Helper: clean up loading state safely
      // Only clear loadingRef when this operation still owns it (same generation)
      const cleanup = () => {
        if (generationRef.current === currentGeneration) {
          loadingRef.current = false;
        }
        if (!isStale()) {
          setLoading(false);
        }
      };

      try {
        const result = await asyncFnRef.current(...args);
        if (isStale()) return null;
        cleanup();
        setRetryCount(0);
        return result;
      } catch (err) {
        const caughtError = err instanceof Error ? err : new Error(String(err));

        if (isStale()) {
          cleanup();
          return null;
        }

        let lastError = caughtError;

        // Retry loop: maxRetries additional attempts (total = 1 initial + maxRetries)
        for (let attempt = 0; attempt < maxRetries; attempt++) {
          if (isStale()) {
            cleanup();
            return null;
          }

          // Wait with backoff before retrying (skip delay on first retry iteration if desired)
          const currentDelay = backoff
            ? Math.min(delay * Math.pow(2, attempt), MAX_BACKOFF_MS)
            : delay;

          if (currentDelay > 0) {
            await new Promise<void>((resolve) => {
              resolveDelayRef.current = resolve;
              timeoutRef.current = setTimeout(() => {
                resolveDelayRef.current = null;
                resolve();
              }, currentDelay);
            });
          }

          if (isStale()) {
            cleanup();
            return null;
          }

          try {
            const result = await asyncFnRef.current(...args);
            if (isStale()) {
              cleanup();
              return null;
            }
            cleanup();
            setRetryCount(0);
            return result;
          } catch (retryErr) {
            lastError = retryErr instanceof Error ? retryErr : new Error(String(retryErr));

            const newCount = attempt + 1;
            setRetryCount(newCount);
            onRetryRef.current?.(newCount, lastError);
          }
        }

        // All retries exhausted
        if (isStale()) {
          cleanup();
          return null;
        }
        cleanup();
        setError(lastError);
        // Set retryCount to maxRetries so canRetry correctly reports false
        setRetryCount(maxRetries);
        onMaxRetriesRef.current?.(lastError);
        return null;
      }
    },
    [maxRetries, delay, backoff],
  );

  const reset = useCallback(() => {
    // Clear any pending timeout
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    // Resolve any pending delay promise to prevent dangling async
    resolveDelayRef.current?.();
    resolveDelayRef.current = null;
    // Reset abort flag so retries work after reset
    abortRef.current = false;
    // Bump generation to invalidate any in-flight operation
    generationRef.current++;
    loadingRef.current = false;
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
  options: RetryAsyncOptions = {},
): Promise<T> {
  const { maxRetries: rawMaxRetries = 3, delay: rawDelay = 1000, backoff = true } = options;
  const maxRetries = Math.max(0, Math.floor(rawMaxRetries));
  const delay = Number.isFinite(rawDelay) && rawDelay >= 0 ? rawDelay : 1000;
  let lastError: Error = new Error('retryAsync: no attempts made');

  // Total attempts = 1 initial + maxRetries retries
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (attempt < maxRetries) {
        const currentDelay = backoff
          ? Math.min(delay * Math.pow(2, attempt), MAX_BACKOFF_MS)
          : delay;
        await new Promise((resolve) => setTimeout(resolve, currentDelay));
      }
    }
  }

  throw lastError;
}

// Hook for network requests with retry
export function useNetworkRetry<T>(
  url: string,
  options: Omit<RequestInit, 'signal'> & UseRetryOptions = {},
) {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = true,
    onRetry,
    onMaxRetriesReached,
    ...fetchOptions
  } = options;

  // Use ref to avoid re-creating fetchData every render
  const fetchOptionsRef = useRef(fetchOptions);
  const urlRef = useRef(url);

  // Sync refs outside render
  useEffect(() => {
    fetchOptionsRef.current = fetchOptions;
  });
  useEffect(() => {
    urlRef.current = url;
  });

  const fetchData = useCallback(async () => {
    const response = await fetch(urlRef.current, fetchOptionsRef.current);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json() as Promise<T>;
  }, []);

  return useRetry(fetchData, { maxRetries, delay, backoff, onRetry, onMaxRetriesReached });
}
