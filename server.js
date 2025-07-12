// .envファイルを読み込み
require('dotenv').config();

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;

// MIMEタイプのマッピング
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

// 環境変数をJavaScriptとして提供するエンドポイント
function getEnvScript() {
  const envVars = {
    ETHEREUM_RPC_URL: process.env.ETHEREUM_RPC_URL || 'https://sepolia.infura.io/v3/',
    POLYGON_RPC_URL: process.env.POLYGON_RPC_URL || 'https://amoy.infura.io/v3/',
    DEFAULT_NETWORK: process.env.DEFAULT_NETWORK || 'sepolia',
    PRIVATE_KEY: process.env.PRIVATE_KEY || ''
  };

  console.log('Providing environment variables to browser:', {
    ...envVars,
    PRIVATE_KEY: envVars.PRIVATE_KEY ? '[SET]' : '[NOT SET]'
  });

  return `
window.__ENV__ = ${JSON.stringify(envVars)};
console.log('Environment variables loaded in browser:', {
  ...window.__ENV__,
  PRIVATE_KEY: window.__ENV__.PRIVATE_KEY ? '[SET]' : '[NOT SET]'
});
`;
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;

  // 環境変数エンドポイント
  if (pathname === '/env.js') {
    res.writeHead(200, { 'Content-Type': 'text/javascript' });
    res.end(getEnvScript());
    return;
  }

  // ルートパスの場合はindex.htmlを返す
  if (pathname === '/') {
    pathname = '/index.html';
  }

  // distディレクトリからファイルを提供
  const filePath = path.join(__dirname, 'dist', pathname);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 Not Found</h1>');
      return;
    }

    const extname = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
      if (error) {
        res.writeHead(500);
        res.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`Web3ウォレットシステムサーバー起動: http://localhost:${PORT}`);
  console.log('環境変数:');
  console.log('- PRIVATE_KEY:', process.env.PRIVATE_KEY ? '設定済み' : '未設定');
  console.log('- ETHEREUM_RPC_URL:', process.env.ETHEREUM_RPC_URL || '未設定');
  console.log('- POLYGON_RPC_URL:', process.env.POLYGON_RPC_URL || '未設定');
});