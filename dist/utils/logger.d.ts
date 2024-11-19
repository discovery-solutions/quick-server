import { Context } from "../servers";
interface LoggerConfig {
    formatted?: boolean;
    verbose?: boolean;
}
export declare const config: LoggerConfig;
export declare class Logger {
    private origin;
    private active;
    constructor(origin?: string, active?: boolean);
    setOrigin(origin: string): void;
    private parse;
    private write;
    log(message: any, meta?: {}): void;
    info(message: any, meta?: {}): void;
    warn(message: any, meta?: {}): void;
    error(message: any, meta?: {}): void;
    debug(message: any, meta?: {}): void;
    static middleware(ctx: Context): void;
    static setConfig({ formatted, verbose }: LoggerConfig): void;
}
export {};
