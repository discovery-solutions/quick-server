import { AuthConfig, OAuthStrategy } from '../../../types';
export declare class Auth {
    private static instance;
    private config;
    private constructor();
    static initialize(config: AuthConfig): void;
    static getStrategies(): import("../../../types").AuthStrategies;
    static getStrategy<K extends keyof AuthConfig['strategies']>(key: K, client?: string): AuthConfig['strategies'][K] | OAuthStrategy;
    static getPermission(key: string): any;
    static getWhitelist(): string[];
}
