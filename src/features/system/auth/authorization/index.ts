import { EntityManager } from '../../../entity';
import { Context, Server } from '../../../../servers';
import { Auth } from '..';

const WHITELIST = ['system', 'auth'];
const METHODS_TO_ACTIONS = {
  get: ['get', 'list'],
  post: ['insert'],
  put: ['update'],
  patch: ['update'],
  delete: ['delete'],
}

export class Authorization {
  static middleware(ctx: Context) {
    const { url, method: methodUpperCase, session, server: serverName } = ctx.getInfo();
    const server = Server.get(serverName);
    const method = methodUpperCase.toLowerCase();
    const entities = EntityManager.list();


    if (server.config.type === 'file' && !server.config.secure) return;

    const isWhitelisted = WHITELIST.some((path) => url.includes(path));
    if (isWhitelisted) return;

    const entity = Array.from(entities).find((path) => url.includes(path)); 
    if (entity) {
      const defaultPermissions = Auth.getPermission('default');
      const isAuthorized = defaultPermissions?.['*']?.[method] || defaultPermissions?.[entity]?.[method];
      
      if (isAuthorized) return;

      if (session.entity) {
        const permissions = Auth.getPermission(session.entity);
        const hasGobalPermission = METHODS_TO_ACTIONS[method].some((action) => permissions?.['*']?.[action] || permissions?.[action]);
        const hasEntityPermission = Object.keys(permissions).some((key) => {
          if (url.includes(key) && key !== '*')
            return METHODS_TO_ACTIONS[method].some((action) => permissions[key][action])

          return false;
        });
        
        if (hasGobalPermission || hasEntityPermission) return;
      }
    }

    return ctx
      .status(403)
      .error(new Error(`You don't have the right authorization to perform this action`));
  }
}
