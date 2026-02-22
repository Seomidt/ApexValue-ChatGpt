import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { calculateValuation } from './valuation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');
const port = process.env.PORT || 3000;

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

const server = createServer(async (req, res) => {
  try {
    if (req.method === 'POST' && req.url === '/api/valuate') {
      let data = '';
      req.on('data', (chunk) => {
        data += chunk;
      });

      req.on('end', () => {
        try {
          const payload = JSON.parse(data || '{}');
          const result = calculateValuation(payload);
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify(result));
        } catch {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: 'Ugyldig JSON payload.' }));
        }
      });
      return;
    }

    const requestPath = req.url === '/' ? '/index.html' : req.url;
    const safePath = path.normalize(requestPath).replace(/^\.+/, '');
    const filePath = path.join(publicDir, safePath);

    const file = await readFile(filePath);
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain; charset=utf-8' });
    res.end(file);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Ikke fundet');
  }
});

server.listen(port, () => {
  console.log(`ApexValue app kører på http://localhost:${port}`);
});
