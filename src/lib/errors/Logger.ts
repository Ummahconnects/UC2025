import { AppError } from './AppError';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
}

export class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private readonly maxLogs: number = 1000;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context
    };
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // In development, also log to console
    if (import.meta.env.DEV) {
      const consoleMethod = entry.level === 'error' ? 'error' : 
                           entry.level === 'warn' ? 'warn' : 
                           entry.level === 'debug' ? 'debug' : 'log';
      
      console[consoleMethod](
        `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`,
        entry.context || ''
      );
    }
  }

  public debug(message: string, context?: Record<string, any>): void {
    this.addLog(this.formatMessage('debug', message, context));
  }

  public info(message: string, context?: Record<string, any>): void {
    this.addLog(this.formatMessage('info', message, context));
  }

  public warn(message: string, context?: Record<string, any>): void {
    this.addLog(this.formatMessage('warn', message, context));
  }

  public error(error: Error | AppError | string, context?: Record<string, any>): void {
    const message = error instanceof Error ? error.message : error;
    const errorContext = {
      ...(error instanceof AppError ? error.context : {}),
      ...context,
      stack: error instanceof Error ? error.stack : undefined
    };

    this.addLog(this.formatMessage('error', message, errorContext));
  }

  public getRecentLogs(count: number = 100): LogEntry[] {
    return this.logs.slice(-count);
  }

  public clearLogs(): void {
    this.logs = [];
  }
}

export const logger = Logger.getInstance();
