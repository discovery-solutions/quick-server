import { EntityPermission } from "./entity";

export interface OAuthStrategy {
  clientId: string;
  clientSecret: string;
  authUrl: string;
  tokenUrl: string;
}

export interface AuthStrategies {
  jwt?: {
    secret: string;
    expiresIn: string;
  };
  oauth?: {
    google?: OAuthStrategy;
    facebook?: OAuthStrategy;
  };
  refreshToken?: {
    enabled: boolean;
    expiration: string;
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
    const defaultConfig: AuthConfigParams = {
      strategies: {
        jwt: {
          secret: "super_secret_key",
          expiresIn: "1h",
        },
        refreshToken: {
          enabled: true,
          expiration: "7d",
        },
      },
      permissions: {
        entities: {},
        default: {
          get: true,
          list: true,
          insert: true,
          update: true,
          delete: true,
        },
      },
    };

    this.strategies = {
      ...defaultConfig.strategies,
      ...(parameters.strategies || {}),
    };

    this.permissions = {
      default: {
        ...defaultConfig.permissions.default,
        ...(parameters.permissions?.default || {}),
      },
      entities: {
        ...defaultConfig.permissions.entities,
        ...(parameters.permissions?.entities || {}),
      },
    };
  }
}
