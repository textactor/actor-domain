export interface ILogger {
  warn(message?: any, ...optionalParams: any[]): void;
  error(message?: any, ...optionalParams: any[]): void;
}

export let logger: ILogger = console;

export function setLogger(newLogger: ILogger) {
  logger = newLogger;
}
