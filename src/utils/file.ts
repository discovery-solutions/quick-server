import yaml from 'js-yaml';
import fs from 'fs';

export const loadYaml = (filePath: string) => {
  const raw = fs.readFileSync(filePath, 'utf8');
  return yaml.load(raw);
}

