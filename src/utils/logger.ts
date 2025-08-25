// Colors for console output (similar to NestJS)
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
};

// Simple structured logger for development debugging (NestJS-style)
export class Logger {
  private static formatMessage(level: string, service: string, method: string, message: string, levelColor: string): string {
    const timestamp = new Date().toISOString().slice(11, 23); // HH:MM:SS.mmm
    const timestampColored = `${colors.gray}[${timestamp}]${colors.reset}`;
    const levelColored = `${levelColor}${level.toUpperCase()}${colors.reset}`;
    const contextColored = `${colors.yellow}${service}.${method}()${colors.reset}`;

    return `${timestampColored} ${levelColored} ${contextColored}: ${message}`;
  }

  static info(service: string, method: string, message: string): void {
    console.log(this.formatMessage('info', service, method, message, colors.blue));
  }

  static warn(service: string, method: string, message: string): void {
    console.warn(this.formatMessage('warn', service, method, message, colors.yellow));
  }

  static error(service: string, method: string, message: string, error?: Error): void {
    console.error(this.formatMessage('error', service, method, message, colors.red));
    if (error) {
      console.error(`${colors.red}ERROR DETAILS${colors.reset} ${error.message}`);
      if (error.stack) {
        console.error(`${colors.dim}STACK TRACE${colors.reset}\n${colors.gray}${error.stack}${colors.reset}`);
      }
    }
  }

  static debug(service: string, method: string, message: string): void {
    console.log(this.formatMessage('debug', service, method, message, colors.magenta));
  }

  static success(service: string, method: string, message: string): void {
    console.log(this.formatMessage('success', service, method, message, colors.green));
  }
}
