import type { Context } from '.';

export async function jsonParser(ctx: Context, next: () => Promise<any>) {
  if (ctx.request.headers['content-type']?.includes('application/json')) {
    let rawBody = '';
    ctx.request.on('data', (chunk) => {
      rawBody += chunk;
    });
    ctx.request.on('end', () => {
      try {
        ctx.request.body = JSON.parse(rawBody);
      } catch (err) {
        return ctx.error(new Error('Invalid JSON format'));
      }
      next();
    });
  } else {
    await next();
  }
}

export async function formParser(ctx: Context, next: () => Promise<any>) {
  if (ctx.request.headers['content-type']?.includes('multipart/form-data')) {
    const boundary = ctx.request.headers['content-type']?.split('boundary=')[1];
    if (!boundary) return ctx.error(new Error('No boundary in form data'));

    let rawBody = '';
    ctx.request.on('data', (chunk) => {
      rawBody += chunk;
    });

    ctx.request.on('end', () => {
      const parts = rawBody.split(`--${boundary}`).filter(Boolean);
      const parsedFields: any = {};
      parts.forEach((part: string) => {
        const [headers, body] = part.split('\r\n\r\n');
        const fieldName = headers.match(/Content-Disposition: form-data; name="([^"]+)"/)?.[1];
        if (fieldName) {
          parsedFields[fieldName] = body.trim();
        }
      });
      ctx.request.body = parsedFields;
      next();
    });
  } else {
    await next();
  }
}

export const corsMiddleware = (ctx: Context, next: () => Promise<any>) => {
  const allowedOrigins = ['*'];
  const origin = ctx.request.headers.origin;

  if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
    ctx.response.setHeader('Access-Control-Allow-Origin', origin || '*');
    ctx.response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    ctx.response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  if (ctx.request.method !== 'OPTIONS')
    return next();
    
  ctx.response.statusCode = 204;
  ctx.response.end();
}
