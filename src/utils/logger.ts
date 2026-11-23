// Minimal console logger with level and timestamp prefixes.
const timestamp = (): string => new Date().toISOString();

export const logger = {
  info: (message: string, ...meta: unknown[]): void => {
    console.log(`[INFO] ${timestamp()} - ${message}`, ...meta);
  },
  warn: (message: string, ...meta: unknown[]): void => {
    console.warn(`[WARN] ${timestamp()} - ${message}`, ...meta);
  },
  error: (message: string, ...meta: unknown[]): void => {
    console.error(`[ERROR] ${timestamp()} - ${message}`, ...meta);
  },
};
