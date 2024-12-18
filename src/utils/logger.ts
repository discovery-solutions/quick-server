import { Context } from "../servers";
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
    if (Object.keys(data).length === 0) return '';
    return JSON.stringify(data, null, config?.formatted ? 2 : 0);
  }

  private write(level: string, raw: any, meta: Record<string, any>) {
    if (!this.active) return null;
    
    const id = uuid();
    const prefix = `[${this.origin}] #${id}`;
    const { message, ...data } = (() => {
      if (config.verbose === false) {
        if (typeof raw === 'object')
          return raw;

        return { message: raw, ...meta };
      }

      return {
        timestamp: new Date().toISOString(),
        message: raw,
        level: level,
        logId: id,
        pid: process.pid,
        ...meta,
      }
    })();

    const hasData = Object.keys(data).length > 0;
    const breakLine = config?.formatted && hasData ? '\n' : ' ';
    let content = `${prefix}: ${[message, breakLine, this.parse(data)].join('')}`;

    if (raw instanceof Error)
      content = `${content}\n${raw.stack}`;

    console.log(content);
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

  static middleware(ctx: Context) {
    const logger = new Logger();
    logger.log('Incoming Request', ctx.getInfo());
  }

  static setConfig({ formatted, verbose }: LoggerConfig) {
    config.formatted = formatted;
    config.verbose = verbose;
  }
}