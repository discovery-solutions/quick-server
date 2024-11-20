import { QuickServer } from '../dist/index.js';
import path from 'path';

const server = new QuickServer(path.join(process.cwd(), 'test', 'SERVER.yaml'));

server.start();