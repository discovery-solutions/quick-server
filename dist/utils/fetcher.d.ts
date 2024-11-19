declare const fetcher: {
    (url: any, options?: {}): Promise<any>;
    get(url: any, config?: {}): Promise<any>;
    put(url: any, data: any, config?: {}): Promise<any>;
    post(url: any, data: any, config?: {}): Promise<any>;
    patch(url: any, data: any, config?: {}): Promise<any>;
    delete(url: any, data: any, config?: {}): Promise<any>;
};
export { fetcher };
