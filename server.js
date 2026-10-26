/* PractLab server: serves the static site with gzip and ETag revalidation. No dependencies.
   Accounts and progress sync live in Supabase (see supabase/migrations); the browser talks to it directly. */
'use strict';
var http = require('http');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var zlib = require('zlib');

var PORT = +process.env.PORT || 8765;
var ROOT = path.resolve(process.env.SITE_DIR || __dirname);

function send(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(obj));
}

// ---------------------------------------------------------------- static files
var TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8' };
var PUBLIC = ['index.html', 'css/', 'js/'];   // only the site files, never server code
var cache = {};                                // path -> {mtime, etag, raw, gz}

function serveStatic(req, res, urlPath) {
  var rel;
  try { rel = path.posix.normalize('/' + decodeURIComponent(urlPath)).slice(1); } catch (e) { rel = ''; }  // resolves ../ before the allow-list check
  if (!PUBLIC.some(function (p) { return rel === p || (p.slice(-1) === '/' && rel.indexOf(p) === 0); })) rel = 'index.html';
  var file = path.join(ROOT, rel);
  if (file.indexOf(ROOT + path.sep) !== 0) return send(res, 403, { error: 'Forbidden.' });
  fs.stat(file, function (err, st) {
    if (err || !st.isFile()) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
    var c = cache[file];
    if (!c || c.mtime !== st.mtimeMs) {
      var raw = fs.readFileSync(file);
      c = cache[file] = { mtime: st.mtimeMs, raw: raw, gz: zlib.gzipSync(raw), etag: '"' + crypto.createHash('sha1').update(raw).digest('base64url') + '"' };
    }
    // file names never change between deploys, so browsers revalidate every time (cheap 304 via ETag)
    var headers = { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'ETag': c.etag, 'Vary': 'Accept-Encoding' };
    if (req.headers['if-none-match'] === c.etag) { res.writeHead(304, headers); return res.end(); }
    var gz = /\bgzip\b/.test(req.headers['accept-encoding'] || '');
    if (gz) headers['Content-Encoding'] = 'gzip';
    res.writeHead(200, headers);
    res.end(req.method === 'HEAD' ? undefined : gz ? c.gz : c.raw);
  });
}

http.createServer(function (req, res) {
  var urlPath = req.url.split('?')[0];
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error: 'Method not allowed.' });
    serveStatic(req, res, urlPath);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) send(res, 500, { error: 'Server error.' });
  }
}).listen(PORT, function () { console.log('PractLab on http://localhost:' + PORT); });
