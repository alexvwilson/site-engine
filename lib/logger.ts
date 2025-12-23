/**
 * Environment-Aware Logger Utility
 *
 * Provides centralized logging with automatic environment detection.
 * - Development: All logs visible (debug, info, warn, error)
 * - Production: Logs suppressed or limited to errors/warnings
 *
 * Usage:
 *   import { logger } from "@/lib/logger";
 *   logger.debug("Debug message");
 *   logger.info("Info message");
 *   logger.warn("Warning message");
 *   logger.error("Error message");
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LoggerConfig {
  enabled: boolean;
  minLevel: LogLevel;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Get logger configuration based on environment
 */
function getConfig(): LoggerConfig {
  const isDevelopment = process.env.NODE_ENV === "development";

  return {
    enabled: isDevelopment,
    // In development: show all logs (debug level = 0)
    // In production: suppress all logs (or only show errors if needed)
    minLevel: isDevelopment ? "debug" : "error",
  };
}

/**
 * Check if a log level should be output based on configuration
 */
function shouldLog(level: LogLevel): boolean {
  const config = getConfig();

  // If logging is completely disabled (production), suppress all logs
  if (!config.enabled) {
    return false;
  }

  // Check if the log level meets the minimum threshold
  return LOG_LEVELS[level] >= LOG_LEVELS[config.minLevel];
}

/**
 * Environment-aware logger
 * Automatically suppresses logs in production while preserving them in development
 */
export const logger = {
  /**
   * Debug-level logging - verbose internal details
   * Only visible in development mode
   */
  debug(...args: unknown[]): void {
    if (shouldLog("debug")) {
      console.log(...args);
    }
  },

  /**
   * Info-level logging - general information
   * Only visible in development mode
   */
  info(...args: unknown[]): void {
    if (shouldLog("info")) {
      console.info(...args);
    }
  },

  /**
   * Warning-level logging - potential issues
   * Visible in development, optionally in production
   */
  warn(...args: unknown[]): void {
    if (shouldLog("warn")) {
      console.warn(...args);
    }
  },

  /**
   * Error-level logging - critical issues
   * Visible in development, optionally in production
   */
  error(...args: unknown[]): void {
    if (shouldLog("error")) {
      console.error(...args);
    }
  },
};

/**
 * Type definition for logger (useful for dependency injection or mocking)
 */
export type Logger = typeof logger;
