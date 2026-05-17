// Servidor estatico minimo para previsualizar `npm run build`.
// Cualquier ruta desconocida devuelve index.html para que React Router funcione.
const http = require('http');
const fs = require('fs');
const path = require('path');

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '127.0.0.1';
const root = path.resolve(__dirname, '..', 'build');

const contentTypes = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain',
};

const sendFile = (res, filePath) => {
  // Lee archivos del build y asigna Content-Type segun extension.
  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(500);
      res.end('Server error');
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream',
    });
    res.end(content);
  });
};

http
  .createServer((req, res) => {
    const cleanUrl = decodeURIComponent(req.url.split('?')[0]);
    let filePath = path.join(root, cleanUrl === '/' ? 'index.html' : cleanUrl);

    // Evita que una URL con ../ salga de la carpeta build.
    if (!filePath.startsWith(root)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    fs.stat(filePath, (error, stat) => {
      if (error || !stat.isFile()) {
        filePath = path.join(root, 'index.html');
      }
      sendFile(res, filePath);
    });
  })
  .listen(port, host, () => {
    console.log(`Preview listo en http://${host}:${port}`);
  });
