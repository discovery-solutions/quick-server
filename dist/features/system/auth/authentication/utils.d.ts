import { DatabaseInterface } from '../../../databases';
export declare const generateTokens: (payload: object, secret: string, expiresIn?: number | string, refreshExpiresIn?: number | string) => {
    accessToken: any;
    refreshToken: any;
};
export declare const validateToken: (token: string, secret: string) => any;
export declare const saveAuthDetails: (database: DatabaseInterface, userId: string, strategy: string, client: string, tokens: any, expiresIn?: number | string, refreshExpiresIn?: number | string) => Promise<void>;
export declare const ensureUserExists: (database: DatabaseInterface, entityName: string, identifier: string, data: any) => Promise<any>;
