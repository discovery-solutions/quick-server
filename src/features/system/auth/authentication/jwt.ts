import { AuthStrategies } from '../../../../types';
import { Database } from '../../../databases';
import { Context } from '../../../../servers';
import * as Utils from './utils'
import { Auth } from '..';

export class JWTAuth {
  // POST /system/auth
  static async login(ctx: Context) {
    const { secret, refreshToken, entity: { name, identifiers }} = Auth.getStrategy('jwt') as AuthStrategies['jwt'];
    const database = Database.get(ctx.getInfo().database);
    
    const body = identifiers.reduce((obj, key) => {
      obj[key] = ctx.getBody()[key];
      return obj;
    }, {});

    const [entity] = await database.get(name, body) as any;

    if (!entity) return ctx.status(401).error(new Error('Invalid credentials'));
    
    const payload = { entity: name, [name]: entity };
    const tokens = Utils.generateTokens(payload, secret, refreshToken?.expiration);

    if (!refreshToken?.enabled) delete tokens.refreshToken;

    await Utils.saveAuthDetails(database, entity.id, 'jwt', '', tokens, refreshToken?.expiration);

    return ctx.send({ message: 'Login successful', auth: tokens });
  }

  // POST /system/auth/refresh
  static async refreshToken(ctx: Context) {
    const { secret, refreshToken, entity: { name }} = Auth.getStrategy("jwt") as AuthStrategies["jwt"];
    const database = Database.get(ctx.getInfo().database);

    const oldRefreshToken = (ctx.getHeader("Authorization") as string)?.split(" ")[1];
    if (!oldRefreshToken) return ctx.status(401).error(new Error("Token is missing"));

    try {
      const decoded = Utils.validateToken(oldRefreshToken, secret);
      const [user] = await database.get(name, { id: decoded.id }) as any;

      if (!user) return ctx.status(401).error(new Error("Invalid user"));

      const tokens = Utils.generateTokens(user, secret, refreshToken.expiration);
      return ctx.send({ message: "Token refreshed successfully", auth: tokens });
    } catch {
      return ctx.status(401).error(new Error("Invalid refresh token"));
    }
  }
}
