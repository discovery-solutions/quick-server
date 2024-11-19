import { HTTPContext, HTTPServer, SocketServer } from "../../servers";
import { QuickServer } from "../..";
import path from 'path';
import fs from 'fs';

export class Docs {
  static generate() {
    const config = QuickServer.instance.config;
    const openAPI = {
      openapi: "3.0.0",
      info: {
        title: "API Documentation",
        version: "1.0.0",
        description: "Generated OpenAPI documentation for QuickServer APIs",
      },
      servers: config.servers.map(server => ({
        url: `http://localhost:${server.port}`,
        description: `${server.name} (${server.type})`,
      })),
      paths: {},
      components: {
        schemas: {} as any,
      }
    };

    config.entities.forEach(entity => {
      const basePath = `/${entity.name}`;
      openAPI.paths[basePath] = {
        get: {
          summary: `List all ${entity.name}`,
          responses: {
            200: {
              description: `A list of ${entity.name}`,
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: `#/components/schemas/${entity.alias}` },
                  },
                },
              },
            },
          },
        },
        post: {
          summary: `Create a new ${entity.name}`,
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: `#/components/schemas/${entity.alias}` },
              },
            },
          },
          responses: {
            201: {
              description: `${entity.name} created successfully`,
            },
          },
        },
      };

      openAPI.paths[`${basePath}/{id}`] = {
        get: {
          summary: `Get a ${entity.name} by ID`,
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: `${entity.name} retrieved successfully`,
              content: {
                "application/json": {
                  schema: { $ref: `#/components/schemas/${entity.alias}` },
                },
              },
            },
          },
        },
        put: {
          summary: `Update a ${entity.name} by ID`,
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: `#/components/schemas/${entity.alias}` },
              },
            },
          },
          responses: {
            200: {
              description: `${entity.name} updated successfully`,
            },
          },
        },
        delete: {
          summary: `Delete a ${entity.name} by ID`,
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            204: {
              description: `${entity.name} deleted successfully`,
            },
          },
        },
      };
    });

    config.entities.forEach(entity => {
      const schema = {
        type: "object",
        properties: {},
        required: [],
      };

      Object.entries(entity.fields).forEach(([fieldName, field]) => {
        const fieldType = typeof field === "string" ? field : field.type;
        schema.properties[fieldName] = { type: fieldType };

        if ((field as any)?.required) schema.required.push(fieldName);
      });

      openAPI.components.schemas[entity.alias] = schema;
    });

    const authPaths = {
      "/system/search": {
        get: {
          summary: "Search API Resources",
          parameters: [
            {
              name: "query",
              in: "query",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "Search results",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { type: "object" },
                  },
                },
              },
            },
          },
        },
      },
    };

    if (config.auth.strategies.jwt) {
      authPaths["/system/auth"] = {
        post: {
          summary: "Login with JWT",
          responses: {
            200: {
              description: "JWT Token received",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      accessToken: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      }

      authPaths["/system/auth/refresh"] = {
        post: {
          summary: "Refresh JWT Token",
          responses: {
            200: {
              description: "Refreshed JWT Token",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      accessToken: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      }
    }

    if (config.auth.strategies.oauth) {
      authPaths["/system/oauth/{client}"] = {
        get: {
          summary: "Authenticate using OAuth",
          parameters: [
            {
              name: "client",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "OAuth authentication started",
            },
          },
        },
      }
      authPaths["/system/oauth/{client}"] = {
        get: {
          summary: "OAuth Callback",
          parameters: [
            {
              name: "client",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "OAuth callback processed",
            },
          },
        },
      }
    }
    
    Object.assign(openAPI.paths, authPaths);

    if (config.auth.strategies.jwt) {
      openAPI.components.schemas.JWTToken = {
        type: "object",
        properties: {
          accessToken: { type: "string" },
        },
      };
    }

    if (config.auth.strategies.oauth) {
      openAPI.components.schemas.OAuthResponse = {
        type: "object",
        properties: {
          accessToken: { type: "string" },
          refreshToken: { type: "string" },
        },
      };
    }

    return JSON.stringify(openAPI, null, 2);
  }

  static routes(server: HTTPServer | SocketServer) {
    if (server instanceof HTTPServer) {
      server.get('/system/docs/api-docs.json', (ctx: HTTPContext) => {
        return ctx.send(Docs.generate());
      });

      server.get('/system/docs/*', (ctx: HTTPContext) => {
        const file = path.join(__dirname, 'www', 'index.html');
        
        ctx.response.setHeader('Content-Type', 'text/html');
        return fs.createReadStream(file).pipe(ctx.response);
      });
    }
  }
}