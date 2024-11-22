export interface EntityField {
    type: 'string' | 'number' | 'boolean' | 'file' | 'object' | 'array' | 'entity';
    entity?: string;
    required?: boolean;
    secure?: boolean;
}
export interface EntityPermission {
    search: boolean;
    insert: boolean;
    update: boolean;
    delete: boolean;
    list: boolean;
    get: boolean;
}
export interface EntityConfig {
    name: string;
    alias: string;
    fields: {
        [key: string]: EntityField | string;
    };
    auth?: {
        type: 'jwt' | 'oauth';
        fields: string[];
        permissions: {
            [role: string]: EntityPermission;
        };
    };
}
