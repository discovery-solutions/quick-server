import { SocketServer } from "../../../servers/socket";
import { HTTPServer } from "../../../servers/http";
import { JWTAuth } from "./jwt";
import { OAuth } from "./oauth";
import { Auth } from "..";

export class Authentication {
  static middleware(server: HTTPServer | SocketServer) {
    if (server instanceof HTTPServer) return http(server);
    return socket(server);
  }
}

function http(server: HTTPServer) {
  const config = Auth.getStrategies();

  if (config.oauth) {
    server.group('/system/oauth', () => {
      server.get('/:client', OAuth.authenticate);
      server.get('/callback/:client', OAuth.callback);
    });
  }

  if (config.jwt) {
    server.group('/system/auth', () => {
      server.post('/refresh', JWTAuth.refreshToken);
      server.post('/', JWTAuth.login);
    });
  }
}

function socket(server: SocketServer) {
  const config = Auth.getStrategies();

  if (config.oauth) {
    server.on('system_oauth_authenticate', OAuth.authenticate);
    server.on('system_oauth_callback', OAuth.callback);
  }

  if (config.jwt) {
    server.on('system_auth_jwt', JWTAuth.login);
    server.on('system_auth_jwt_refresh', JWTAuth.refreshToken);
  }
}
