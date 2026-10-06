'use strict';
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');

const PORT = +process.env.PORT || 3000;
const CID = process.env.GOOGLE_CLIENT_ID || '';
const DIR = process.env.DATA_DIR || '/data';
const ALLOW = (process.env.ALLOWED_EMAILS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

fs.mkdirSync(DIR, { recursive: true });
const DBF = path.join(DIR, 'db.json'), SF = path.join(DIR, 'secret');

// Session signing key: from env, else generated once and kept in the data volume.
let SECRET = process.env.SESSION_SECRET;
if (!SECRET) {
  try { SECRET = fs.readFileSync(SF, 'utf8'); }
  catch (e) { SECRET = crypto.randomBytes(32).toString('hex'); fs.writeFileSync(SF, SECRET, { mode: 0o600 }); }
}

// Data store: one JSON file, written atomically, one record per Google account.
let db = { users: {} };
try { db = JSON.parse(fs.readFileSync(DBF, 'utf8')); } catch (e) { /* first run */ }
let writing = Promise.resolve();
const persist = () => {
  writing = writing.then(async () => {
    const tmp = DBF + '.tmp';
    await fs.promises.writeFile(tmp, JSON.stringify(db));
    await fs.promises.rename(tmp, DBF);
  }).catch(e => console.error('persist failed:', e.message));
  return writing;
};

const oc = new OAuth2Client(CID);
const b64 = s => Buffer.from(s).toString('base64url');
const sign = s => crypto.createHmac('sha256', SECRET).update(s).digest('base64url');
const mint = sub => { const p = b64(JSON.stringify({ sub, exp: Date.now() + 30 * 864e5 })); return p + '.' + sign(p); };
function who(req) {
  const m = (req.headers.cookie || '').match(/(?:^|;\s*)sid=([^;]+)/);
  if (!m) return null;
  const [p, s] = m[1].split('.');
  if (!p || !s) return null;
  const a = Buffer.from(s), b = Buffer.from(sign(p));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const d = JSON.parse(Buffer.from(p, 'base64url').toString());
    return d.exp > Date.now() && db.users[d.sub] ? d.sub : null;
  } catch (e) { return null; }
}

const send = (res, code, obj, headers = {}) => {
  res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers });
  res.end(JSON.stringify(obj));
};
const readBody = req => new Promise((ok, no) => {
  let n = 0; const chunks = [];
  req.on('data', d => { n += d.length; if (n > 1e6) { no(new Error('big')); req.destroy(); } else chunks.push(d); });
  req.on('end', () => { try { const s = Buffer.concat(chunks).toString(); ok(s ? JSON.parse(s) : null); } catch (e) { no(e); } });
  req.on('error', no);
});

const legal = require('./legal');
const page = fs.readFileSync(path.join(__dirname, 'index.html'));

http.createServer(async (req, res) => {
  try {
    const url = req.url.split('?')[0];
    const secure = req.socket.encrypted || req.headers['x-forwarded-proto'] === 'https';
    const cookie = (v, age) => `sid=${v}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}${secure ? '; Secure' : ''}`;

    if (req.method === 'GET' && (url === '/' || url === '/index.html')) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(page);
    }
    if (req.method === 'GET' && (url === '/privacy' || url === '/terms')) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(legal[url.slice(1)]);
    }
    if (url === '/healthz') return send(res, 200, { ok: true });
    if (url === '/api/config') return send(res, 200, { clientId: CID });

    const sub = who(req);
    if (url === '/api/me') {
      return send(res, 200, { user: sub ? { name: db.users[sub].name, email: db.users[sub].email } : null });
    }
    if (url === '/api/login' && req.method === 'POST') {
      if (!CID) return send(res, 503, { error: 'Google sign-in is not configured' });
      const b = await readBody(req);
      const ticket = await oc.verifyIdToken({ idToken: String(b && b.credential), audience: CID });
      const p = ticket.getPayload(), email = (p.email || '').toLowerCase();
      if (!p.email_verified || (ALLOW.length && !ALLOW.includes(email))) return send(res, 403, { error: 'This account is not allowed' });
      const rec = db.users[p.sub] || (db.users[p.sub] = { history: [], game: null });
      rec.name = p.name || email; rec.email = email;
      await persist();
      return send(res, 200, { user: { name: rec.name, email: rec.email } }, { 'Set-Cookie': cookie(mint(p.sub), 30 * 86400) });
    }
    if (url === '/api/logout' && req.method === 'POST') return send(res, 200, { ok: true }, { 'Set-Cookie': cookie('', 0) });

    if (url === '/api/data') {
      if (!sub) return send(res, 401, { error: 'Sign in first' });
      const rec = db.users[sub];
      if (req.method === 'GET') return send(res, 200, { history: rec.history, game: rec.game });
      if (req.method === 'PUT') {
        if (!(req.headers['content-type'] || '').startsWith('application/json')) return send(res, 415, { error: 'JSON only' });
        const b = await readBody(req);
        if (!b || !Array.isArray(b.history) || (b.game !== null && typeof b.game !== 'object')) return send(res, 400, { error: 'Bad data' });
        rec.history = b.history.filter(g => g && typeof g.id === 'number').slice(-5000);
        rec.game = b.game || null;
        await persist();
        return send(res, 200, { ok: true });
      }
    }
    send(res, 404, { error: 'Not found' });
  } catch (e) {
    console.error(e.message);
    send(res, e.message === 'big' ? 413 : 400, { error: 'Request failed' });
  }
}).listen(PORT, () => console.log(`Blob scorer on :${PORT}` + (CID ? '' : ' (Google sign-in off: GOOGLE_CLIENT_ID not set)')));
