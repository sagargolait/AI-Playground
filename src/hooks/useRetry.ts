import { useState, useCallback } from "react";
import { logger } from "@/utils/logger";

interface RetryConfig {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
}

export function useRetry(config: RetryConfig = {}) {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
  } = config;

  const [attempts, setAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const calculateDelay = useCallback(
    (attempt: number) => {
      const delay = initialDelay * Math.pow(backoffFactor, attempt);
      return Math.min(delay, maxDelay);
    },
    [initialDelay, maxDelay, backoffFactor]
  );

  const retry = useCallback(
    async <T>(operation: () => Promise<T>, context: string): Promise<T> => {
      setIsRetrying(true);
      let lastError: Error = new Error("Unknown error");

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          setAttempts(attempt + 1);
          const result = await operation();

          // Log successful retry if it wasn't the first attempt
          if (attempt > 0) {
            logger.info("Operation succeeded after retry", {
              context,
              attempt: attempt + 1,
              totalAttempts: maxAttempts,
            });
          }

          setIsRetrying(false);
          setAttempts(0);
          return result;
        } catch (error) {
          lastError = error as Error;

          logger.warn("Operation failed, attempting retry", {
            context,
            error: lastError.message,
            attempt: attempt + 1,
            totalAttempts: maxAttempts,
          });

          if (attempt < maxAttempts - 1) {
            const delay = calculateDelay(attempt);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }

      setIsRetrying(false);
      logger.error("Operation failed after all retry attempts", {
        context,
        error: lastError.message,
        attempts: maxAttempts,
      });

      throw lastError;
    },
    [maxAttempts, calculateDelay]
  );

  return {
    retry,
    attempts,
    isRetrying,
    hasAttempts: attempts < maxAttempts,
  };
}
