import { HTTPContext, HTTPServer } from "../http";
import * as fs from 'fs';
import * as path from 'path';
import { ServerConfig } from "../../types";

export class FileServer {
  constructor(config: ServerConfig) {
    const server = new HTTPServer({
      name: config.name,
      port: config.port,
      request: config.request,
      type: config.type,
    });

    server.get('*', (ctx: HTTPContext) => {
      const { pathname: urlPath } = new URL(ctx.request.url, `http://${ctx.request.headers.host}`);
      const requestedFilePath = path.join(process.cwd(), config.path, urlPath);

      if (!fs.existsSync(requestedFilePath))
        return ctx.error(new Error('File not found'));

      const extname = path.extname(requestedFilePath).toLowerCase();
      let contentType = 'application/octet-stream';

      switch (extname) {
        case '.html':
          contentType = 'text/html';
          break;
        case '.css':
          contentType = 'text/css';
          break;
        case '.js':
          contentType = 'application/javascript';
          break;
        case '.json':
          contentType = 'application/json';
          break;
        case '.png':
          contentType = 'image/png';
          break;
        case '.jpg':
        case '.jpeg':
          contentType = 'image/jpeg';
          break;
        case '.gif':
          contentType = 'image/gif';
          break;
      }

      ctx.response.setHeader('Content-Type', contentType);
      return fs.createReadStream(requestedFilePath).pipe(ctx.response);
    });

    return server;
  }
}
