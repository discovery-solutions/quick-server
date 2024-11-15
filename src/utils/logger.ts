import { uuid } from ".";

interface LoggerConfig {
  formatted?: boolean;
  verbose?: boolean;
}

export const config: LoggerConfig = {
  formatted: false,
  verbose: true,
}

export class Logger {
  private origin: string;
  private active: boolean;

  constructor(origin?: string, active: boolean = true) {
    this.origin = origin || 'QuickServer';
    this.active = active;
  }

  public setOrigin(origin: string) {
    this.origin = origin;
  }

  private parse(data: any) {
    return JSON.stringify(data, null, config?.formatted ? 2 : 0);
  }

  private write(level: string, message: any, meta: Record<string, any>) {
    if (!this.active) return null;
    
    const id = uuid();
    const prefix = `[${this.origin}] #${id}`;
    const data = (() => {
      if (config.verbose === false) return { message, ...meta };

      return {
        timestamp: new Date().toISOString(),
        message: message,
        level: level,
        logId: id,
        pid: process.pid,
        ...meta,
      }
    })();

    if (typeof message === 'string')
      delete data.message;

    if (Object.keys(data).length === 0)
      return console.log(`${prefix}: ${message}`);

    const breakLine = config?.formatted ? '\n' : ' ';
    console.log(`${prefix}: ${[message, breakLine, this.parse(data)].join('')}`);
  }

  log(message: any, meta = {}) {
    this.write('log', message, meta);
  }

  info(message: any, meta = {}) {
    this.write('info', message, meta);
  }

  warn(message: any, meta = {}) {
    this.write('warn', message, meta);
  }

  error(message: any, meta = {}) {
    this.write('error', message, meta);
  }

  debug(message: any, meta = {}) {
    this.write('debug', message, meta);
  }

  static middleware(req, next) {
    const logger = new Logger();
    logger.log('Incoming Request', req.getInfo());
    return next();
  }

  static setConfig({ formatted, verbose }: LoggerConfig) {
    config.formatted = formatted;
    config.verbose = verbose;
  }
}