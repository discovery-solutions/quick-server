import { Context } from '../../../../servers';
export declare class JWTAuth {
    static login(ctx: Context): Promise<any>;
    static refreshToken(ctx: Context): Promise<any>;
}
