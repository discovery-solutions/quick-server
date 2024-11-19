import { ServerConfig } from "../types";
export declare function convertToCSV(data: any): string;
export declare function convertToXML(data: any): string;
export declare function convertToHTML(data: any): string;
export declare function convertToYAML(data: any): string;
export declare function parseResponse(format: ServerConfig['format'], data: any): any;
