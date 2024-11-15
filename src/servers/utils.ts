import { ServerConfig } from "../types";


export function convertToCSV(data: any): string {
  if (Array.isArray(data)) {
    const keys = Object.keys(data[0]);
    const csvRows = data.map(row => 
      keys.map(key => `"${row[key]}"`).join(',')
    );
    return [keys.join(','), ...csvRows].join('\n');
  }

  if (typeof data === 'object' && data !== null) {
    const keys = Object.keys(data);
    const values = keys.map(key => `"${data[key]}"`);
    return [keys.join(','), values.join(',')].join('\n');
  }

  return data.toString();
}

export function convertToXML(data: any): string {
  const convert = (obj: any): string => {
    if (Array.isArray(obj)) {
      return obj.map(item => convert(item)).join('');
    }
    if (typeof obj === 'object' && obj !== null) {
      return Object.entries(obj)
        .map(([key, value]) => `<${key}>${convert(value)}</${key}>`)
        .join('');
    }
    return obj.toString();
  };
  return `<root>${convert(data)}</root>`;
}

export function convertToHTML(data: any): string {
  if (Array.isArray(data)) {
    const keys = Object.keys(data[0]);
    const rows = data.map(row => 
      `<tr>${keys.map(key => `<td>${row[key]}</td>`).join('')}</tr>`
    );
    return `<table>
      <tr>${keys.map(key => `<th>${key}</th>`).join('')}</tr>
      ${rows.join('')}
    </table>`;
  }
  if (typeof data === 'object' && data !== null) {
    const keys = Object.keys(data);
    const values = keys.map(key => `<td>${data[key]}</td>`);
    return `<table>
      <tr>${keys.map(key => `<th>${key}</th>`).join('')}</tr>
      <tr>${values.join('')}</tr>
    </table>`;
  }
  return `<div>${data.toString()}</div>`;
}

export function convertToYAML(data: any): string {
  const yaml = require('js-yaml');
  return yaml.dump(data);
}

export function parseResponse(format: ServerConfig['format'], data: any) {
  if (typeof data === 'string')
    return data;

  switch (format) {
    case 'csv':
      return convertToCSV(data);
    case 'json':
      return JSON.stringify(data);
    case 'xml':
      return convertToXML(data);
    case 'html':
      return convertToHTML(data);
    case 'yaml':
      return convertToYAML(data);
    default:
      return data;
  }
}
