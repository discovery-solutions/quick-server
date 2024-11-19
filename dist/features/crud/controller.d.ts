import type { SocketContext, HTTPContext } from "../../servers";
import { DatabaseInterface } from "../databases";
export declare class ControllerCRUD {
    private model;
    private database;
    private entity;
    constructor(model: any);
    setDatabase: (database: DatabaseInterface) => void;
    list: (ctx: HTTPContext | SocketContext) => Promise<any>;
    create: (ctx: HTTPContext | SocketContext) => Promise<any>;
    get: (ctx: HTTPContext | SocketContext) => Promise<any>;
    update: (ctx: HTTPContext | SocketContext) => Promise<any>;
    delete: (ctx: HTTPContext | SocketContext) => Promise<any>;
    bulkInsert: (ctx: HTTPContext | SocketContext) => Promise<any>;
    bulkUpdate: (ctx: HTTPContext | SocketContext) => Promise<any>;
    bulkDelete: (ctx: HTTPContext | SocketContext) => Promise<any>;
}
