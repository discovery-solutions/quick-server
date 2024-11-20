import { IncomingMessage, ServerResponse } from 'http';
import { RouteHandler } from './types';

function jsonParser(request: IncomingMessage, _: ServerResponse, __: () => Promise<any>) {
  return new Promise(resolve => {
    if (request.headers['content-type']?.includes('application/json')) {
      let rawBody = '';
      request.on('data', (chunk) => {
        rawBody += chunk;
      });
      request.on('end', () => {
        try {
          (request as any).body = JSON.parse(rawBody);
        } catch (err) {
          return new Error('Invalid JSON format');
        } finally {
          resolve(request);
        }
      });
    } else {
      return resolve(false);
    }
  });
}

function formParser(request: IncomingMessage, _: ServerResponse, __: () => Promise<any>) {
  return new Promise(resolve => {
    if (request.headers['content-type']?.includes('multipart/form-data')) {
      const boundary = request.headers['content-type']?.split('boundary=')[1];
      if (!boundary) return new Error('No boundary in form data');

      let rawBody = '';
      request.on('data', (chunk) => {
        rawBody += chunk;
      });

      request.on('end', () => {
        const parts = rawBody.split(`--${boundary}`).filter(Boolean);
        const parsedFields: any = {};
        parts.forEach((part: string) => {
          const [headers, body] = part.split('\r\n\r\n');
          const fieldName = headers.match(/Content-Disposition: form-data; name="([^"]+)"/)?.[1];
          if (fieldName) {
            parsedFields[fieldName] = body.trim();
          }
        });
        (request as any).body = parsedFields;
        resolve(request);
      });
    } else {
      resolve(false);
    }
  });
}

async function corsMiddleware(request: IncomingMessage, response: ServerResponse) {
  const allowedOrigins = ['*'];
  const origin = request.headers.origin;

  if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
    response.setHeader('Access-Control-Allow-Origin', origin || '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  if (request.method !== 'OPTIONS') return;
    
  response.statusCode = 204;
  response.end();
}

export const NativeMiddlewares = { jsonParser, formParser, corsMiddleware };

export function findRoute(pathname: string, method: string, routes: any): RouteHandler | undefined {
  for (const raw of Object.keys(routes)) {
    const route = (raw === '*') ? '/*' : raw;
    const routeParts = route.split('/');
    const pathParts = pathname.split('/');

    if (routeParts.length !== pathParts.length && !routeParts.includes('*')) continue;

    let isMatch = true;
    const params: { [key: string]: string } = {};

    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        params[routeParts[i].slice(1)] = pathParts[i];
      } else if (routeParts[i] === '*') {
        params['wildcard'] = pathParts.slice(i).join('/');
        break;
      } else if (routeParts[i] !== pathParts[i]) {
        isMatch = false;
        break;
      }
    }

    if (isMatch || routeParts[routeParts.length - 1] === '*') {
      routes[raw][method].params = params;
      return routes[raw][method];
    }
  }

  return undefined;
}
