import { useCallback } from 'react';
import { useToast } from '@/components/ui/toast/use-toast';
import { Logger } from '@/lib/errors/Logger';

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  logToService?: boolean;
}

export const useErrorHandler = (defaultOptions: ErrorHandlerOptions = {
  showToast: true,
  logToConsole: true,
  logToService: false,
}) => {
  const { toast } = useToast();
  
  const handleError = useCallback((error: unknown, options: ErrorHandlerOptions = {}) => {
    const opts = { ...defaultOptions, ...options };
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

    if (opts.showToast) {
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }

    if (opts.logToConsole) {
      console.error('Error:', error);
    }

    if (opts.logToService) {
      const logger = Logger.getInstance();
      const context = error instanceof Error ? {
        name: error.name,
        stack: error.stack,
      } : { error };
      logger.error(errorMessage, context);
    }
  }, []);

  return { handleError };
};
