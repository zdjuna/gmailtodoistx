import logger from '../logger';

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  initialDelay: number = 1000
): Promise<T> {
  let retries = 0;
  let delay = initialDelay;
  
  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      retries++;
      
      if (retries >= maxRetries) {
        logger.error(`Max retries (${maxRetries}) reached. Giving up.`, error);
        throw error;
      }
      
      const isRateLimit = 
        error.code === 429 || 
        error.status === 429 || 
        (error.response && error.response.status === 429);
      
      if (isRateLimit) {
        const retryAfter = error.response?.headers?.['retry-after'];
        if (retryAfter) {
          delay = parseInt(retryAfter, 10) * 1000;
        } else {
          delay = delay * 2;
        }
      } else {
        delay = delay * 2;
      }
      
      logger.warn(`Retry ${retries}/${maxRetries} after ${delay}ms: ${error.message}`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
