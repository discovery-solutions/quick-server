import { OAuthStrategy } from '../../../../types';
import { Database } from '../../../databases';
import { Context } from '../../../../servers';
import { fetcher } from '../../../../utils/fetcher';
import * as Utils from './utils';
import { Auth } from '..';

export class OAuth {
  // GET /system/oauth/:client
  static authenticate(ctx: Context) {
    const { basePath } = ctx.getInfo();
    const client = String(ctx.getParams().client);
    const strategy = Auth.getStrategy('oauth', client) as OAuthStrategy;
    
    if (!strategy) return ctx.status(400).error(new Error('Invalid OAuth provider.'));
    
    console.log('REDIRECT URI: ' + `${basePath}/system/oauth/callback/${client}`)
    const redirectUri = encodeURIComponent(`${basePath}/system/oauth/callback/${client}`);
    const location = `${strategy.authUrl}?client_id=${strategy.clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${encodeURIComponent(strategy.scope || 'email profile')}`;

    return ctx.send({ location });
  }


  // GET /system/oauth/callback/:client
  static async callback(ctx: Context) {
    const { basePath, url } = ctx.getInfo();
    const { client, code } = ctx.getParams();
    const database = Database.get(ctx.getInfo().database);
    const strategy = Auth.getStrategy('oauth', String(client)) as OAuthStrategy;

    if (!client || !code) return ctx.status(400).error(new Error('Missing required parameters.'));
    if (!strategy) return ctx.status(400).error(new Error('Invalid OAuth provider.'));

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      redirect_uri: String(basePath) + String(url),
      client_secret: strategy.clientSecret,
      client_id: strategy.clientId,
      code: code as string,
    });

    const provider = await fetcher.post(strategy.tokenUrl, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    if (!provider.access_token) return ctx.status(400).error(new Error('Invalid access token.'));

    const info = await fetcher.get(strategy.userInfoUrl, {
      headers: { Authorization: `Bearer ${provider.access_token}` },
    });

    const mappedUser = Object.keys(strategy.entity.mapper).reduce((obj, key) => {
      obj[strategy.entity.mapper[key]] = info[key];
      return obj;
    }, {});

    const entity = await Utils.ensureUserExists(database, strategy.entity.name, strategy.entity.identifier, mappedUser);
    const payload = { entity: strategy.entity.name, [strategy.entity.name]: entity };

    const tokens = Utils.generateTokens(payload, strategy.clientSecret, strategy.refreshToken?.expiration);
    if (!strategy.refreshToken?.enabled) delete tokens.refreshToken;

    await Utils.saveAuthDetails(database, entity.id, 'oauth', String(client), tokens, strategy.refreshToken?.expiration);

    return ctx.send({ message: 'Entity authenticated', entity, auth: tokens });
  }
}
