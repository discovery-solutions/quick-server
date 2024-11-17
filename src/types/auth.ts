import { EntityPermission } from "./entity";

export interface OAuthStrategy {
  clientId: string;
  clientSecret: string;
  authUrl: string;
  tokenUrl: string;
  entity: {
    name: string;
    identifier: string;
    mapper: Record<string, string>;
  }
  refreshToken?: {
    enabled: boolean;
    expiration: string;
  };
}

export interface AuthStrategies {
  jwt?: {
    secret: string;
    expiresIn: string;
    entity: {
      name: string;
      identifiers: string[];
    }
  };
  oauth?: {
    google?: OAuthStrategy;
    facebook?: OAuthStrategy;
  };
}

export interface AuthConfigParams {
  strategies: AuthStrategies;
  permissions: {
    default: EntityPermission;
    entities: {
      [entity: string]: {
        [role: string]: EntityPermission;
      };
    };
  };
}

export class AuthConfig implements AuthConfigParams {
  strategies: AuthConfigParams['strategies'];
  permissions: AuthConfigParams['permissions'];

  constructor(parameters: Partial<AuthConfigParams> = {}) {
    this.strategies = parameters.strategies;

    this.permissions = {
      entities: parameters.permissions?.entities || {},
      default: {
        get: true,
        list: true,
        insert: true,
        update: true,
        delete: true,
        ...(parameters.permissions?.default || {}),
      },
    }
  }
}
