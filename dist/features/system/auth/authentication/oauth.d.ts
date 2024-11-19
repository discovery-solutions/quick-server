import { Context } from '../../../../servers';
export declare class OAuth {
    static authenticate(ctx: Context): any;
    static callback(ctx: Context): Promise<any>;
}
