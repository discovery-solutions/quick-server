import { ControllerCRUD } from "./controller";
import { SocketServer } from "../../servers/socket";
import { HTTPServer } from "../../servers/http";
import { EntityManager } from "../entity";

export const CRUDMiddlewareHTTP = async (server: HTTPServer) => {
  for (const key of EntityManager.list()) {
    const crud = new ControllerCRUD(key);

    crud.setDatabase(server.database);
    
    server.group(`/${key}`, () => {
      server.get('/', (ctx) => crud.list(ctx));
      server.post('/', (ctx) => crud.create(ctx));
      server.get('/:id', (ctx) => crud.get(ctx));
      server.put('/:id', (ctx) => crud.update(ctx));
      server.delete('/:id', (ctx) => crud.delete(ctx));

      // Bulk operations
      server.post('/bulk-insert', (ctx) => crud.bulkInsert(ctx));
      server.put('/bulk-update', (ctx) => crud.bulkUpdate(ctx));
      server.delete('/bulk-delete', (ctx) => crud.bulkDelete(ctx));
    });
  }
};

export const CRUDMiddlewareSocket = async (server: SocketServer) => {
  for (const key of EntityManager.list()) {
    const crud = new ControllerCRUD(key);

    crud.setDatabase(server.database);
    
    server.on(`get_${key}`, (ctx) => crud.get(ctx));
    server.on(`list_${key}`, (ctx) => crud.list(ctx));
    server.on(`create_${key}`, (ctx) => crud.create(ctx));
    server.on(`update_${key}`, (ctx) => crud.update(ctx));
    server.on(`delete_${key}`, (ctx) => crud.delete(ctx));

    // Bulk operations
    server.on(`bulk_insert_${key}`, (ctx) => crud.bulkInsert(ctx));
    server.on(`bulk_update_${key}`, (ctx) => crud.bulkUpdate(ctx));
    server.on(`bulk_delete_${key}`, (ctx) => crud.bulkDelete(ctx));
  }
};
