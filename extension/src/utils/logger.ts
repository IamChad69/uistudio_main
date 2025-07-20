import config from '../config/environment';

/**
 * Logger utility for the extension
 *
 * This provides consistent logging functionality with conditional output
 * based on the development environment.
 */
class Logger {
  private prefix: string;

  constructor(prefix = '[UI Scraper]') {
    this.prefix = prefix;
  }

  /**
   * Log an informational message
   */
  info(...args: unknown[]): void {
    if (config.IS_DEVELOPMENT) {
      console.info(this.prefix, '(INFO)', ...args);
    }
  }

  /**
   * Log a warning message
   */
  warn(...args: unknown[]): void {
    if (config.IS_DEVELOPMENT) {
      console.warn(this.prefix, '(WARN)', ...args);
    }
  }

  /**
   * Log an error message
   */
  error(...args: unknown[]): void {
    // Always log errors, even in production
    console.error(this.prefix, '(ERROR)', ...args);
  }

  /**
   * Log a debug message (only in development)
   */
  debug(...args: unknown[]): void {
    if (config.IS_DEVELOPMENT) {
      console.debug(this.prefix, '(DEBUG)', ...args);
    }
  }

  /**
   * Standard log message
   */
  log(...args: unknown[]): void {
    if (config.IS_DEVELOPMENT) {
      console.log(this.prefix, ...args);
    }
  }
}

export const logger = new Logger();
