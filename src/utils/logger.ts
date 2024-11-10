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

  constructor(origin?: string) {
    this.origin = origin || 'QuickServer';
  }

  public setOrigin(origin: string) {
    this.origin = origin;
  }

  private parse(data: any) {
    return JSON.stringify(data, null, config?.formatted ? 2 : 0);
  }

  private write(level: string, message: any, meta: Record<string, any>) {
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

  static setConfig({ formatted, verbose }: LoggerConfig) {
    config.formatted = formatted;
    config.verbose = verbose;
  }
}

const uuid = () => {
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(1000 + Math.random() * 9000);
  return timestamp + random;
}