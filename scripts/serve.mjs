import {createServer} from 'node:http';
import {createReadStream,statSync} from 'node:fs';
import {extname,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {dirname} from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)),'..','dist');
const port = Number(process.env.PORT ?? 4173);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8'};
createServer((request,response) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url,'http://localhost').pathname); }
  catch { response.writeHead(400).end(); return; }
  const file = resolve(root,'.'+(pathname.endsWith('/') ? pathname+'index.html':pathname));
  if (file !== root && !file.startsWith(root+sep)) { response.writeHead(403).end(); return; }
  try {
    const stat=statSync(file);
    if (!stat.isFile()) throw new Error('not file');
    response.writeHead(200,{'content-type':mime[extname(file)] ?? 'application/octet-stream','cache-control':'no-store'});
    createReadStream(file).pipe(response);
  } catch { response.writeHead(404).end('Not found'); }
}).listen(port,'127.0.0.1',() => console.log(`Staging portal: http://127.0.0.1:${port}/`));
