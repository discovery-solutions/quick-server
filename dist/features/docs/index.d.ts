import { HTTPServer, SocketServer } from "../../servers";
export declare class Docs {
    static generate(): string;
    static routes(server: HTTPServer | SocketServer): void;
}
