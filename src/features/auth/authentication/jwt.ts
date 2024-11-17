import { AuthStrategies } from "../../../types";
import { EntityManager } from "../../entity";
import { Database } from "../../databases";
import { Context } from "../../../servers";
import { Auth } from "../";
import jwt from 'jsonwebtoken';

export class JWTAuth {
  // POST /system/auth
  static async login(ctx: Context) {
    const { secret, expiresIn, entity: { name, identifiers }} = Auth.getStrategy('jwt') as AuthStrategies['jwt'];
    const database = Database.get(ctx.getInfo().database);
    const entity = EntityManager.get(name);
    const body = identifiers.reduce((obj, key) => {
      obj[key] = ctx.getBody()[key];
      return obj;
    }, {});

    const [user] = await database.get(name, body) as any;

    if (!user)
      return ctx.status(401).error(new Error('Invalid credentials'));

    const token = jwt.sign(entity.secure(user), secret, { expiresIn });

    return ctx.send({ message: 'Login successful', token });
  }

  // POST /system/auth/refresh
  static async refreshToken(ctx: Context) {
    const { secret, expiresIn, entity: { name }} = Auth.getStrategy("jwt") as AuthStrategies["jwt"];
    const database = Database.get(ctx.getInfo().database);
    const oldToken = (ctx.getHeader("Authorization") as string)?.split(" ")[1];
    const entity = EntityManager.get(name);

    if (!oldToken)
      return ctx.status(401).error(new Error("Token is missing"));

    try {
      const decoded = jwt.verify(oldToken, secret, { ignoreExpiration: true }) as any;
      const [user] = await database.get(decoded.name, { id: decoded.id });

      if (!user)
        return ctx.status(401).error(new Error("Invalid user"));

      const newToken = jwt.sign(entity.secure(user), secret, { expiresIn });

      return ctx.send({
        message: "Token refreshed successfully",
        token: newToken,
      });
    } catch (error) {
      return ctx.status(401).error(new Error("Invalid token"));
    }
  }

  // Internal middleware
  static async middleware(ctx: Context) {
    const { secret, expiresIn, entity: { name, identifiers }} = Auth.getStrategy('jwt') as AuthStrategies['jwt'];
    const database = Database.get(ctx.getInfo().database);
    const token = (ctx.getHeader('Authorization') as string)?.split(' ')[1];

    if (!token)
      return ctx.status(401).error(new Error('Token is missing'));

    try {
      const decoded = jwt.verify(token, secret);
      const [user] = await database.get(name, { id: decoded.id });

      return ctx.send({ message: 'User authenticated', user });
    } catch (error) {
      return ctx.status(401).error(error);
    }
  }
}
