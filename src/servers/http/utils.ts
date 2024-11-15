import { IncomingMessage, ServerResponse } from 'http';
import { RouteHandler } from './types';

export function jsonParser(request: IncomingMessage, _: ServerResponse, __: () => Promise<any>) {
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

export function formParser(request: IncomingMessage, _: ServerResponse, __: () => Promise<any>) {
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

export async function corsMiddleware(request: IncomingMessage, response: ServerResponse, next: () => Promise<any>) {
  const allowedOrigins = ['*'];
  const origin = request.headers.origin;

  if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
    response.setHeader('Access-Control-Allow-Origin', origin || '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  if (request.method !== 'OPTIONS')
    return next();
    
  response.statusCode = 204;
  response.end();
}

export function findRoute(pathname: string, method: string, routes: any): RouteHandler | undefined {
  for (const route of Object.keys(routes)) {
    const routeParts = route.split('/');
    const pathParts = pathname.split('/');

    if (routeParts.length !== pathParts.length) continue;

    let isMatch = true;
    const params: { [key: string]: string } = {};

    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        params[routeParts[i].slice(1)] = pathParts[i];
      } else if (routeParts[i] !== pathParts[i]) {
        isMatch = false;
        break;
      }
    }

    if (isMatch) {
      routes[route][method].params = params;
      return routes[route][method];
    }
  }

  return undefined;
}