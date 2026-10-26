/* PractLab server: serves the static site and a tiny account API so students can keep
   their lesson and practice progress across devices. No dependencies; data is JSON files in DATA_DIR.

   POST /api/signup   {username, password}  -> {user}     (also logs in)
   POST /api/login    {username, password}  -> {user}
   POST /api/logout                          -> {ok}
   GET  /api/me                              -> {user|null}
   GET  /api/progress                        -> {data|null, updated}
   PUT  /api/progress {data, base}           -> {ok, updated}  or 409 {data, updated} if base is stale
*/
'use strict';
var http = require('http');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var zlib = require('zlib');

var PORT = +process.env.PORT || 8765;
var ROOT = path.resolve(process.env.SITE_DIR || __dirname);
var DATA = path.resolve(process.env.DATA_DIR || path.join(__dirname, 'data'));
var MAX_BODY = 4 * 1024 * 1024;          // saved code + files can add up
var SESSION_DAYS = 60;

fs.mkdirSync(path.join(DATA, 'progress'), { recursive: true });

// ---------------------------------------------------------------- storage
function readJson(f, dflt) { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return dflt; } }
function writeJson(f, v) { var tmp = f + '.' + process.pid + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(v)); fs.renameSync(tmp, f); }

var USERS_FILE = path.join(DATA, 'users.json');
var users = readJson(USERS_FILE, {});      // lower-case username -> {id, name, salt, hash, created}
var secretFile = path.join(DATA, 'secret');
var SECRET = readJson(secretFile, null);
if (!SECRET) { SECRET = crypto.randomBytes(32).toString('hex'); writeJson(secretFile, SECRET); }
function progressFile(id) { return path.join(DATA, 'progress', id + '.json'); }

// ---------------------------------------------------------------- auth helpers
function hashPw(pw, salt) { return crypto.scryptSync(pw, salt, 64).toString('hex'); }
function sign(s) { return crypto.createHmac('sha256', SECRET).update(s).digest('base64url'); }
function makeToken(id) { var body = id + '.' + (Date.now() + SESSION_DAYS * 864e5); return body + '.' + sign(body); }
function checkToken(t) {
  var p = String(t || '').split('.');
  if (p.length !== 3) return null;
  var body = p[0] + '.' + p[1], want = sign(body);
  if (p[2].length !== want.length || !crypto.timingSafeEqual(Buffer.from(p[2]), Buffer.from(want))) return null;
  if (+p[1] < Date.now()) return null;
  return p[0];
}
function cookies(req) {
  var out = {};
  String(req.headers.cookie || '').split(';').forEach(function (c) { var i = c.indexOf('='); if (i > 0) out[c.slice(0, i).trim()] = decodeURIComponent(c.slice(i + 1).trim()); });
  return out;
}
function userById(id) { for (var k in users) if (users[k].id === id) return users[k]; return null; }
function currentUser(req) { var id = checkToken(cookies(req).clab_session); return id ? userById(id) : null; }
function sessionCookie(req, value, maxAge) {
  var secure = req.headers['x-forwarded-proto'] === 'https' || req.socket.encrypted;
  return 'clab_session=' + value + '; Path=/; HttpOnly; SameSite=Lax; Max-Age=' + maxAge + (secure ? '; Secure' : '');
}
function publicUser(u) { return { name: u.name, created: u.created }; }

// slow down password guessing: at most 10 failed logins per IP per 15 minutes
var fails = {};
function tooManyFails(ip) { var f = fails[ip]; return f && f.n >= 10 && Date.now() - f.t < 15 * 6e4; }
function noteFail(ip) { var f = fails[ip]; if (!f || Date.now() - f.t > 15 * 6e4) f = fails[ip] = { n: 0, t: Date.now() }; f.n++; }

// ---------------------------------------------------------------- api
function send(res, code, obj, headers) {
  var body = JSON.stringify(obj);
  res.writeHead(code, Object.assign({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, headers || {}));
  res.end(body);
}
function readBody(req, cb) {
  var chunks = [], size = 0, done = false;
  req.on('data', function (c) {
    size += c.length;
    if (size > MAX_BODY && !done) { done = true; cb(new Error('too large')); req.destroy(); return; }
    chunks.push(c);
  });
  req.on('end', function () {
    if (done) return; done = true;
    try { cb(null, chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); } catch (e) { cb(e); }
  });
}

function api(req, res, route) {
  var ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  var me = currentUser(req);
  if (route === 'me' && req.method === 'GET') return send(res, 200, { user: me ? publicUser(me) : null });
  if (route === 'logout' && req.method === 'POST') return send(res, 200, { ok: true }, { 'Set-Cookie': sessionCookie(req, '', 0) });

  if ((route === 'signup' || route === 'login') && req.method === 'POST') {
    return readBody(req, function (err, b) {
      if (err) return send(res, 400, { error: 'Bad request.' });
      var name = String(b.username || '').trim(), pw = String(b.password || ''), key = name.toLowerCase();
      if (route === 'signup') {
        if (!/^[A-Za-z0-9_.-]{3,30}$/.test(name)) return send(res, 400, { error: 'Username: 3–30 letters, digits, _ . or -' });
        if (pw.length < 6 || pw.length > 200) return send(res, 400, { error: 'Password must be at least 6 characters.' });
        if (users[key]) return send(res, 409, { error: 'That username is taken.' });
        var salt = crypto.randomBytes(16).toString('hex');
        var u = users[key] = { id: crypto.randomBytes(9).toString('base64url'), name: name, salt: salt, hash: hashPw(pw, salt), created: Date.now() };
        writeJson(USERS_FILE, users);
        return send(res, 200, { user: publicUser(u) }, { 'Set-Cookie': sessionCookie(req, makeToken(u.id), SESSION_DAYS * 86400) });
      }
      if (tooManyFails(ip)) return send(res, 429, { error: 'Too many attempts. Try again in a few minutes.' });
      var found = users[key];
      var ok = found && crypto.timingSafeEqual(Buffer.from(hashPw(pw, found.salt), 'hex'), Buffer.from(found.hash, 'hex'));
      if (!ok) { noteFail(ip); return send(res, 401, { error: 'Wrong username or password.' }); }
      return send(res, 200, { user: publicUser(found) }, { 'Set-Cookie': sessionCookie(req, makeToken(found.id), SESSION_DAYS * 86400) });
    });
  }

  if (route === 'progress') {
    if (!me) return send(res, 401, { error: 'Not logged in.' });
    if (req.method === 'GET') {
      var p = readJson(progressFile(me.id), null);
      return send(res, 200, { data: p ? p.data : null, updated: p ? p.updated : 0 });
    }
    if (req.method === 'PUT') {
      return readBody(req, function (err, b) {
        if (err) return send(res, err.message === 'too large' ? 413 : 400, { error: err.message === 'too large' ? 'Progress is too large to save.' : 'Bad request.' });
        if (!b || typeof b.data !== 'object' || !b.data) return send(res, 400, { error: 'Bad request.' });
        // another device saved since this one last synced: hand back the newer copy to merge
        var cur = readJson(progressFile(me.id), null);
        if (cur && b.base != null && b.base !== cur.updated) return send(res, 409, { error: 'Progress changed on another device.', data: cur.data, updated: cur.updated });
        var updated = Math.max(Date.now(), cur ? cur.updated + 1 : 0);
        writeJson(progressFile(me.id), { data: b.data, updated: updated });
        send(res, 200, { ok: true, updated: updated });
      });
    }
  }
  send(res, 404, { error: 'Not found.' });
}

// ---------------------------------------------------------------- static files
var TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8' };
var PUBLIC = ['index.html', 'css/', 'js/'];   // only the site files, never data/ or server code
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
  var m = urlPath.match(/^\/api\/([a-z]+)\/?$/);
  try {
    if (m) return api(req, res, m[1]);
    if (urlPath.indexOf('/api/') === 0) return send(res, 404, { error: 'Not found.' });
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error: 'Method not allowed.' });
    serveStatic(req, res, urlPath);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) send(res, 500, { error: 'Server error.' });
  }
}).listen(PORT, function () { console.log('PractLab on http://localhost:' + PORT + '  (data: ' + DATA + ')'); });
