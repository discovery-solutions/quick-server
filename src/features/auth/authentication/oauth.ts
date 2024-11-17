import { OAuthStrategy } from "../../../types";
import { Database } from "../../databases";
import { Context } from "../../../servers";
import { fetcher } from "../../../utils/fetcher";
import { Auth } from "..";

export class OAuth {
  // GET /system/oauth/:client
  static authenticate(ctx: Context) {
    const { client } = ctx.getParams();
    const strategy = Auth.getStrategy('oauth');
    const config = strategy[client as string] as OAuthStrategy;

    const redirectUri = encodeURIComponent(config.tokenUrl);
    const location = `${config.authUrl}?client_id=${config.clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email profile`;

    return ctx.send({ location });
  }

  // GET /system/oauth/callback/:client
  static async callback(ctx: Context) {
    const { client, code, basePath, url } = ctx.getParams();
    const database = Database.get(ctx.getInfo().database);
    const strategy = Auth.getStrategy('oauth', String(client)) as OAuthStrategy;
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      redirect_uri: String(basePath) + String(url),
      client_secret: strategy.clientSecret,
      client_id: strategy.clientId,
      code: code as string,
    });

    if (!client || !code)
      return ctx.status(400).error(new Error('Missing required parameters.'));

    const { access_token } = await fetcher.post(`${strategy.tokenUrl}?${params}`, {}, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const info = await fetcher.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const { identifier, mapper, name } = strategy.entity;
    const [exists] = await database.get(name, { [identifier]: info[identifier] });
    const user = Object.keys(mapper).reduce((obj, key) => {
      obj[mapper[key]] = info[key]
      return obj;
    }, {});

    if (!exists) await database.insert(name, user);

    return ctx.send({ message: 'User authenticated', user: user });
  }
}