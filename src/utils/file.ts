import yaml from 'js-yaml';
import path from 'path';
import fs from 'fs';
import { Logger } from './logger';

const logger = new Logger();

export const loadYaml = (filePath: string) => {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = yaml.load(raw);
    loadEnv(parsed.developer?.env);

    return injectEnv(parsed);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const injectEnv = (obj: any): any => {
  if (typeof obj === 'string') {
    return obj.replace(/\{(\w+)\}/g, (_, key) => {
      const value = process.env[key];
      
      if (!value)
        throw new Error(`Environment variable ${key} not found`);

      return value;
    });
  }

  if (Array.isArray(obj))
    return obj.map(injectEnv);

  if (typeof obj === 'object' && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, injectEnv(value)])
    );
  }

  return obj;
};

const loadEnv = (filePath = '.env') => {
  try {
    const envPath = path.resolve(process.cwd(), filePath);
    
    if (!fs.existsSync(envPath)) return;

    const raw = fs.readFileSync(envPath, 'utf8');
    const regex = /^\s*([\w.-]+)\s*=\s*(.+)?$/;

    raw.split('\n').forEach(line => {
      const match = line.match(regex);
      if (match) {
        const [, key, value] = match;
        if (key && value && !process.env[key]) {
          process.env[key] = value.trim().replace(/^"|"$/g, '');
        }
      }
    });
  } catch (error) {
    logger.error(error);
  }
};