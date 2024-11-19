import { EntityManager } from '../../../entity';
import { Context } from '../../../../servers';
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
    const { url, method, session } = ctx.getInfo();
    const entities = EntityManager.list();

    const isWhitelisted = WHITELIST.some((path) => url.includes(path));
    if (isWhitelisted) return;

    const entity = Array.from(entities).find((path) => url.includes(path)); 
    if (entity) {
      const defaultPermissions = Auth.getPermission('default');
      const isAuthorized = defaultPermissions?.['*']?.[method.toLowerCase()] || defaultPermissions?.[entity]?.[method.toLowerCase()];
      
      if (isAuthorized) return;

      if (session.entity) {
        const permissions = Auth.getPermission(session.entity);
        const hasPermission = Object.keys(permissions).some((key) => {
          if (url.includes(key) || key === '*')
          return METHODS_TO_ACTIONS[method.toLowerCase()].some((action) => permissions[key][action])
        });
        
        if (hasPermission) return;
      }
    }

    return ctx
      .status(403)
      .error(new Error(`You don't have the right authorization to perform this action`));
  }
}
