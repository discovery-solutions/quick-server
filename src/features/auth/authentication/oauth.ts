import { OAuthStrategy } from '../../../types';
import { Database } from '../../databases';
import { Context } from '../../../servers';
import { fetcher } from '../../../utils/fetcher';
import * as Utils from './utils';
import { Auth } from '..';

export class OAuth {
  // GET /system/oauth/:client
  static authenticate(ctx: Context) {
    const { basePath } = ctx.getInfo();
    const client = String(ctx.getParams().client);
    const strategy = Auth.getStrategy('oauth', client) as OAuthStrategy;

    console.log('REDIRECT URI: ' + `${basePath}/system/oauth/callback/${client}`)
    const redirectUri = encodeURIComponent(`${basePath}/system/oauth/callback/${client}`);
    const location = `${strategy.authUrl}?client_id=${strategy.clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email profile`;

    return ctx.send({ location });
  }

  // GET /system/oauth/callback/:client
  static async callback(ctx: Context) {
    const { basePath, url } = ctx.getInfo();
    const { client, code } = ctx.getParams();
    const database = Database.get(ctx.getInfo().database);
    const strategy = Auth.getStrategy('oauth', String(client)) as OAuthStrategy;

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      redirect_uri: String(basePath) + String(url),
      client_secret: strategy.clientSecret,
      client_id: strategy.clientId,
      code: code as string,
    });

    if (!client || !code) return ctx.status(400).error(new Error('Missing required parameters.'));

    const provider = await fetcher.post(`${strategy.tokenUrl}?${params}`, {}, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const info = await fetcher.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${provider.access_token}` },
    });

    const { clientSecret, refreshToken: { expiration }, entity: { identifier, mapper, name }} = strategy;
    const mappedUser = Object.keys(mapper).reduce((obj, key) => {
      obj[mapper[key]] = info[key];
      return obj;
    }, {});

    const entity = await Utils.ensureUserExists(database, name, identifier, mappedUser);
    const payload = { entity: name, [name]: entity };

    const tokens = Utils.generateTokens(payload, clientSecret, expiration);
    await Utils.saveAuthDetails(database, entity.id, 'oauth', String(client), tokens, expiration);

    return ctx.send({ message: 'Entity authenticated', entity, auth: tokens });
  }
}
