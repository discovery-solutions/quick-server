import { AuthConfig, OAuthStrategy } from "../../types";
import { SocketServer } from "../../servers/socket";
import { HTTPServer } from "../../servers/http";
import { Authentication } from "./authentication";

export class Auth {
  private static instance: Auth | null = null;
  private config: AuthConfig;

  private constructor() {}

  public static initialize(config: AuthConfig) {
    if (Auth.instance) return ;
      
    Auth.instance = new Auth();
    Auth.instance.config = config;
  }

  public static getStrategies() {
    return Auth.instance.config.strategies;
  }

  public static getStrategy<K extends keyof AuthConfig['strategies']>(key: K, client?: string): AuthConfig['strategies'][K] | OAuthStrategy {
    if (!Auth.instance)
      throw new Error(`AuthConfig not initialized. Call Auth.initialize(entities) first.`);

    if (key === 'oauth' && client) {
      const oauthStrategies = Auth.instance.config.strategies[key] as Record<string, AuthConfig['strategies']>;
      
      if (oauthStrategies && oauthStrategies[client])
        return oauthStrategies[client] as OAuthStrategy;

      throw new Error(`OAuth strategy for client ${client} not found.`);
    }

    return Auth.instance.config.strategies[key];
  }

  public static getPermission(key: string) {
    if (!Auth.instance)
      throw new Error(`AuthConfig not initialized. Call Auth.initialize(entities) first.`);

    const { permissions } = Auth.instance.config;
    return permissions[key] || permissions.entities[key];
  }

  public static middleware(server: HTTPServer | SocketServer) {
    Authentication.middleware(server);
  }
}

export const AuthMiddlewareHTTP = () => {

}

export const AuthMiddlewareSocket = () => {

}