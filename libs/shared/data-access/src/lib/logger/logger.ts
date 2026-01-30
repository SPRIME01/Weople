/**
 * Simple logger module for data-access library
 * Environment-aware logging with support for different log levels
 */

export interface LogContext {
  [key: string]: unknown;
}

export interface Logger {
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
  debug(message: string, context?: LogContext): void;
}

/**
 * Detect current environment
 */
const detectEnvironment = (): 'development' | 'production' | 'test' => {
  if (process.env['NODE_ENV'] === 'test') return 'test';
  if (
    process.env['NODE_ENV'] === 'production' ||
    process.env['VITE_ENV'] === 'production'
  )
    return 'production';
  return 'development';
};

/**
 * Format log message with optional context
 */
const formatMessage = (message: string, context?: LogContext): string => {
  if (!context || Object.keys(context).length === 0) {
    return message;
  }
  const contextStr = Object.entries(context)
    .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
    .join(' ');
  return `${message} ${contextStr}`;
};

/**
 * Default logger implementation
 */
class DefaultLogger implements Logger {
  private environment: 'development' | 'production' | 'test';

  constructor() {
    this.environment = detectEnvironment();
  }

  private shouldLog(level: string): boolean {
    if (this.environment === 'test') return false;
    if (this.environment === 'production') {
      // In production, only log warnings and errors
      return level === 'warn' || level === 'error';
    }
    return true;
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      console.log(formatMessage(message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      console.warn(formatMessage(message, context));
    }
  }

  error(message: string, context?: LogContext): void {
    if (this.shouldLog('error')) {
      console.error(formatMessage(message, context));
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      console.debug(formatMessage(message, context));
    }
  }
}

/**
 * Global logger instance
 */
let loggerInstance: Logger | undefined;

/**
 * Get or create the logger instance
 */
export const getLogger = (): Logger => {
  if (!loggerInstance) {
    loggerInstance = new DefaultLogger();
  }
  return loggerInstance;
};

/**
 * Set a custom logger implementation
 */
export const setLogger = (logger: Logger): void => {
  loggerInstance = logger;
};

/**
 * Convenience exports for direct usage
 */
export const logger = getLogger();

export const info = (message: string, context?: LogContext): void =>
  logger.info(message, context);

export const warn = (message: string, context?: LogContext): void =>
  logger.warn(message, context);

export const error = (message: string, context?: LogContext): void =>
  logger.error(message, context);

export const debug = (message: string, context?: LogContext): void =>
  logger.debug(message, context);
