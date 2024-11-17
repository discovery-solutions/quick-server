import { ControllerCRUD } from "./controller";
import { SocketServer } from "../../servers/socket";
import { HTTPServer } from "../../servers/http";
import { EntityManager } from "../entity";

export class CRUD {
  static middleware(server: HTTPServer | SocketServer) {
    if (server instanceof HTTPServer) return http(server);
    return socket(server);
  }
}

export const http = async (server: HTTPServer) => {
  for (const key of EntityManager.list()) {
    const crud = new ControllerCRUD(key);

    crud.setDatabase(server.database);
    
    server.group(`/${key}`, () => {
      server.get('/', crud.list);
      server.post('/', crud.create);
      server.get('/:id', crud.get);
      server.put('/:id', crud.update);
      server.delete('/:id', crud.delete);

      // Bulk operations
      server.post('/bulk-insert', crud.bulkInsert);
      server.put('/bulk-update', crud.bulkUpdate);
      server.delete('/bulk-delete', crud.bulkDelete);
    });
  }
};

export const socket = async (server: SocketServer) => {
  for (const key of EntityManager.list()) {
    const crud = new ControllerCRUD(key);

    crud.setDatabase(server.database);
    
    server.on(`get_${key}`, crud.get);
    server.on(`list_${key}`, crud.list);
    server.on(`create_${key}`, crud.create);
    server.on(`update_${key}`, crud.update);
    server.on(`delete_${key}`, crud.delete);

    // Bulk operations
    server.on(`bulk_insert_${key}`, crud.bulkInsert);
    server.on(`bulk_update_${key}`, crud.bulkUpdate);
    server.on(`bulk_delete_${key}`, crud.bulkDelete);
  }
};
