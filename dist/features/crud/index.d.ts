import { HTTPServer, SocketServer } from "../../servers";
export declare class CRUD {
    static middleware(server: HTTPServer | SocketServer): Promise<void>;
}
export declare const http: (server: HTTPServer) => Promise<void>;
export declare const socket: (server: SocketServer) => Promise<void>;
