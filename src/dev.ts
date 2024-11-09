import { QuickServer } from ".";
import path from 'path';

const server = new QuickServer(path.join(process.cwd(), 'SERVER.yaml'));
server.start();