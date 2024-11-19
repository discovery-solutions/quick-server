import { QuickServer } from ".";
import path from 'path';

const server = new QuickServer(path.join(process.cwd(), 'EXAMPLE.yaml'));

// server.use((ctx) => {
//   console.log('opaaaaa');
//   return ctx.status(500).error(new Error('testano'))
// });

server.start();