import { HTTPServer, SocketServer } from "../../../../servers";
import { Context } from '../../../../servers';
export declare class Authentication {
    static routes(server: HTTPServer | SocketServer): void;
    static middleware(ctx: Context): Promise<void>;
}
