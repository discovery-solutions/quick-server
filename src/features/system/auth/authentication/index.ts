import { HTTPServer, SocketServer } from "../../../../servers";
import { OAuthStrategy } from "../../../../types";
import { Database } from '../../../databases';
import { fetcher } from '../../../../utils/fetcher';
import { Context } from '../../../../servers';
import { JWTAuth } from "./jwt";
import { Logger } from '../../../../utils/logger';
import { OAuth } from "./oauth";
import { Auth } from "..";
import jwt from 'jsonwebtoken';

export class Authentication {
  static routes(server: HTTPServer | SocketServer) {
    if (server instanceof HTTPServer) return http(server);
    return socket(server);
  }

  public static async middleware(ctx: Context) {
    const database = Database.get(ctx.getInfo().database);
    const token = (ctx.getHeader('authorization') as string)?.split(' ')[1];
    const logger = new Logger('Auth');

    if (!token) return logger.error('Token ignored');

    const strategies = Auth.getStrategies();
    const secrets = Object.keys(strategies)
      .map((key) => strategies[key]?.secret || Object.values(strategies[key] || {}).map((item: any) => item?.clientSecret))
      .flat();

    let decoded: any;
    let validSecret: string | undefined;

    for (const secret of secrets) {
      try {
        decoded = jwt.verify(token, secret, { ignoreExpiration: true });
        validSecret = secret;
        break;
      } catch (error) {
        continue;
      }
    }

    if (!decoded || !validSecret)
      return logger.error("Invalid or expired token");

    const [authRecord] = await database.get('auth', { accessToken: token }) as any;

    if (!authRecord)
      return logger.error("Invalid token");

    const isExpired = decoded.exp * 1000 < Date.now();

    if (!isExpired) {
      ctx.session.token = token;
      ctx.session.entity = decoded.entity;
      ctx.session[decoded.entity] = decoded[decoded.entity];
      return;
    }

    if (!authRecord.refresh_token)
      return logger.error("No refresh token available");

    const strategyKey = Object.keys(strategies).find((key) => strategies[key]?.entity?.identifier === decoded?.identifier);
    const strategy = Auth.getStrategy('oauth', strategyKey) as OAuthStrategy;

    if (!strategy)
      return logger.error("No matching strategy for token");

    const params = new URLSearchParams({
      refresh_token: authRecord.refresh_token,
      client_secret: strategy.clientSecret,
      grant_type: 'refresh_token',
      client_id: strategy.clientId,
    });

    try {
      const { access_token: accessToken, refresh_token: refreshToken } = await fetcher.post(`${strategy.tokenUrl}?${params}`, {}, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      await database.update('auth', { accessToken: token }, { accessToken, refreshToken });

      ctx.session.token = accessToken;
      ctx.session.token = accessToken;
      ctx.session.user = decoded;
    } catch (error) {
      return logger.error("Failed to refresh token");
    }
  }
}

function http(server: HTTPServer) {
  const config = Auth.getStrategies();

  if (config.oauth) {
    server.group('/system/oauth', () => {
      server.get('/:client', OAuth.authenticate);
      server.get('/callback/:client', OAuth.callback);
    });
  }

  if (config.jwt) {
    server.group('/system/auth', () => {
      server.post('/refresh', JWTAuth.refreshToken);
      server.post('/', JWTAuth.login);
    });
  }
}

function socket(server: SocketServer) {
  const config = Auth.getStrategies();

  if (config.oauth) {
    server.on('system_oauth_authenticate', OAuth.authenticate);
    server.on('system_oauth_callback', OAuth.callback);
  }

  if (config.jwt) {
    server.on('system_auth_jwt', JWTAuth.login);
    server.on('system_auth_jwt_refresh', JWTAuth.refreshToken);
  }
}
