'use strict';
/* Royal Kitchen backend. Zero dependencies. Needs Node 22.5+ (built-in SQLite). Run: node server.js */
const http = require('node:http'), fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const PORT = +process.env.PORT || 3000;
const DATA = process.env.DATA_DIR || path.join(__dirname, 'data');
const SECURE = process.env.COOKIE_SECURE === '1';
const HOLD_MS = (+process.env.HOLD_MINUTES || 15) * 60000;   // unpaid order / table hold timeout
const PUBLIC_URL = (process.env.PUBLIC_URL || '').replace(/\/$/, '');
const GROUPS = ['Pakistani', 'Chinese & Thai', 'BBQ', 'Fast Food', 'Burgers', 'Pizza', 'Pasta', 'Deals', 'Drinks', 'Desserts', 'Sides'];
const TP = { Small: 90, Medium: 120, Large: 250, 'XL 16"': 300 };   // extra topping price by pizza size
const ROLES = ['OWNER', 'MANAGER', 'DEVELOPER'];
fs.mkdirSync(path.join(DATA, 'uploads', 'products'), { recursive: true });
const db = new DatabaseSync(path.join(DATA, 'rk.db'));
db.exec(`PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,username TEXT UNIQUE COLLATE NOCASE,pw TEXT,role TEXT,active INTEGER DEFAULT 1,created_at INTEGER);
CREATE TABLE IF NOT EXISTS sessions(h TEXT PRIMARY KEY,user_id INTEGER,exp INTEGER);
CREATE TABLE IF NOT EXISTS login_fail(k TEXT PRIMARY KEY,n INTEGER,until INTEGER);
CREATE TABLE IF NOT EXISTS settings(k TEXT PRIMARY KEY,v TEXT);
CREATE TABLE IF NOT EXISTS products(id INTEGER PRIMARY KEY,name TEXT,grp TEXT,sub TEXT,descr TEXT,opts TEXT,eligible INTEGER,topping INTEGER,badge TEXT,image TEXT,active INTEGER DEFAULT 1,sort INTEGER,created_at INTEGER);
CREATE TABLE IF NOT EXISTS tbl(id INTEGER PRIMARY KEY,hall TEXT,num INTEGER,status TEXT DEFAULT 'available',hold_order TEXT,UNIQUE(hall,num));
CREATE TABLE IF NOT EXISTS orders(id TEXT PRIMARY KEY,tok TEXT,name TEXT,phone TEXT,type TEXT,address TEXT,km REAL,table_id INTEGER,items TEXT,subtotal INTEGER,service INTEGER,delivery INTEGER,total INTEGER,pay TEXT,status TEXT,expires_at INTEGER,notes TEXT,fp TEXT,created_at INTEGER);
CREATE TABLE IF NOT EXISTS payments(id INTEGER PRIMARY KEY,order_id TEXT,status TEXT,file TEXT,sha TEXT,flags TEXT,ai_risk TEXT,amount INTEGER,reference TEXT,reason TEXT,reviewed_by TEXT,reviewed_at INTEGER,created_at INTEGER);
CREATE UNIQUE INDEX IF NOT EXISTS ux_ref ON payments(reference) WHERE reference IS NOT NULL AND status='Payment Approved';
CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY,user_id INTEGER,username TEXT,action TEXT,detail TEXT,at INTEGER);`);

/* ---------- helpers ---------- */
class HttpErr extends Error { constructor(s, m) { super(m); this.s = s; } }
const now = () => Date.now(), rnd = n => crypto.randomBytes(n).toString('hex');
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const q1 = (sql, ...a) => db.prepare(sql).get(...a), qa = (sql, ...a) => db.prepare(sql).all(...a), run = (sql, ...a) => db.prepare(sql).run(...a);
const tx = fn => { db.exec('BEGIN IMMEDIATE'); try { const r = fn(); db.exec('COMMIT'); return r; } catch (e) { db.exec('ROLLBACK'); throw e; } };
const getSet = (k, d) => { const r = q1('SELECT v FROM settings WHERE k=?', k); return r ? r.v : d; };
const putSet = (k, v) => run('INSERT INTO settings(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v', k, String(v));
const audit = (u, action, detail) => run('INSERT INTO audit(user_id,username,action,detail,at) VALUES(?,?,?,?,?)', u ? u.id : null, u ? u.username : 'customer', action, JSON.stringify(detail || {}), now());
const hashPw = p => { const s = crypto.randomBytes(16); return s.toString('hex') + ':' + crypto.scryptSync(p, s, 64).toString('hex'); };
const checkPw = (p, st) => { const [s, h] = st.split(':'); return crypto.timingSafeEqual(crypto.scryptSync(p, Buffer.from(s, 'hex'), 64), Buffer.from(h, 'hex')); };
const DUMMY = hashPw('x');
const pkHour = () => +new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: 'Asia/Karachi' }).format(new Date());
const pkTime = t => new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Karachi' }).format(new Date(t));
const isOpen = () => { if (getSet('hours_enforced', '1') !== '1') return true; const h = pkHour(), o = +getSet('open_hour', 10), c = +getSet('close_hour', 2); return o > c ? (h >= o || h < c) : (h >= o && h < c); };
const sign = (id, exp) => crypto.createHmac('sha256', getSet('sign_secret', '')).update(id + '.' + exp).digest('hex').slice(0, 32);
const rl = new Map();
const limited = (k, max, win) => { const t = now(), a = (rl.get(k) || []).filter(x => t - x < win); a.push(t); rl.set(k, a); return a.length > max; };

/* ---------- first-run seed ---------- */
if (!getSet('sign_secret')) putSet('sign_secret', rnd(32));
for (const [k, v] of Object.entries({ manager_products: '0', manager_prices: '0', hours_enforced: '1', open_hour: '10', close_hour: '2', wa_number: '923012449111', event_number: '923252449111', bank_name: 'Faisal Bank', bank_account: '3271301000003794' })) if (getSet(k) === undefined) putSet(k, v);
if (!q1('SELECT 1 FROM tbl')) for (const h of ['Gents', 'Family']) for (let n = 1; n <= 25; n++) run('INSERT INTO tbl(hall,num) VALUES(?,?)', h, n);
if (!q1('SELECT 1 FROM products') && fs.existsSync(path.join(__dirname, 'menu.json')))
  for (const m of JSON.parse(fs.readFileSync(path.join(__dirname, 'menu.json'), 'utf8')))
    run('INSERT INTO products(name,grp,sub,descr,opts,eligible,topping,sort,created_at) VALUES(?,?,?,?,?,?,?,?,?)', m.name, m.group, m.sub, m.desc || '', JSON.stringify(m.opts), m.eligible, m.topping, m.sort, now());
if (!q1('SELECT 1 FROM users')) {
  const user = process.env.ADMIN_USER || 'owner', pw = process.env.ADMIN_PASSWORD || rnd(9);
  run('INSERT INTO users(username,pw,role,created_at) VALUES(?,?,?,?)', user, hashPw(pw), 'OWNER', now());
  console.log(`\n=== FIRST RUN: Owner account created. Username: ${user}  Password: ${pw}  (change it after login; this is shown once) ===\n`);
}

/* ---------- business logic ---------- */
function releaseExpired() {
  const t = now();
  for (const o of qa("SELECT id FROM orders WHERE status IN ('AWAITING_PAYMENT','PAYMENT_REJECTED') AND expires_at IS NOT NULL AND expires_at<?", t))
    tx(() => { run("UPDATE orders SET status='CANCELLED',notes=COALESCE(notes,'')||' [hold expired]' WHERE id=?", o.id); run("UPDATE tbl SET status='available',hold_order=NULL WHERE hold_order=? AND status='waiting'", o.id); });
}
setInterval(() => { try { releaseExpired(); } catch (e) { console.error(e); } }, 15000).unref();

function priceItems(list) {
  if (!Array.isArray(list) || !list.length || list.length > 60) throw new HttpErr(400, 'Invalid items');
  return list.map(it => {
    const p = q1('SELECT * FROM products WHERE id=? AND active=1', +it.id); if (!p) throw new HttpErr(400, 'A product is no longer available');
    const o = JSON.parse(p.opts)[+it.opt || 0]; if (!o || !(o[1] > 0)) throw new HttpErr(400, 'Price not available for ' + p.name);
    const qty = +it.qty; if (!Number.isInteger(qty) || qty < 1 || qty > 50) throw new HttpErr(400, 'Invalid quantity');
    let unit = o[1], extra = ''; if (it.extra) { if (!p.topping) throw new HttpErr(400, 'Extra topping not available'); unit += TP[o[0]] || 0; extra = 'Extra topping'; }
    return { id: p.id, name: p.name, variant: o[0], extra, unit, qty, eligible: p.eligible ? 1 : 0 };
  });
}
function createOrder(b, ip) {
  if (!isOpen()) throw new HttpErr(403, 'Restaurant is closed. Orders open daily 10 AM to 2 AM.');
  if (limited('ord' + ip, 30, 3600000)) throw new HttpErr(429, 'Too many orders, try later');
  const name = String(b.name || '').trim(), phone = String(b.phone || '').trim(), type = b.type, pay = b.pay === 'cod' ? 'cod' : 'advance';
  if (name.length < 2 || name.length > 80 || !/^[0-9+\-\s]{10,16}$/.test(phone)) throw new HttpErr(400, 'Valid name and phone required');
  if (!['delivery', 'pickup', 'dine'].includes(type)) throw new HttpErr(400, 'Invalid order type');
  if (pay === 'cod' && type !== 'delivery') throw new HttpErr(400, 'Cash on delivery is only for delivery orders');
  const km = +b.km || 0, address = String(b.address || '').trim().slice(0, 300);
  if (type === 'delivery' && (!address || !(km > 0) || km > 200)) throw new HttpErr(400, 'Address and valid distance required');
  const lines = priceItems(b.items);
  const subtotal = lines.reduce((a, l) => a + l.unit * l.qty, 0), el = lines.filter(l => l.eligible).reduce((a, l) => a + l.unit * l.qty, 0);
  const service = type === 'dine' ? Math.round(el * 0.03) : 0, delivery = type === 'delivery' ? Math.ceil(km / 3) * 30 : 0, total = subtotal + service + delivery;
  const tid = type === 'dine' ? +b.table_id : null; if (type === 'dine' && !tid) throw new HttpErr(400, 'Select a table');
  const fp = sha(JSON.stringify([phone, type, tid, lines.map(l => [l.id, l.variant, l.extra, l.qty])]));
  const dup = q1("SELECT * FROM orders WHERE fp=? AND status IN ('AWAITING_PAYMENT','PAYMENT_REJECTED') AND created_at>?", fp, now() - 300000);
  if (dup) { const tok = rnd(24); run('UPDATE orders SET tok=? WHERE id=?', sha(tok), dup.id); return { id: dup.id, token: tok, total: dup.total, subtotal: dup.subtotal, service: dup.service, delivery: dup.delivery, status: dup.status, duplicate: true }; }
  const id = 'RK' + rnd(3).toUpperCase(), tok = rnd(24), exp = pay === 'advance' ? now() + HOLD_MS : null;
  releaseExpired();
  return tx(() => {
    if (tid) { const r = run("UPDATE tbl SET status='waiting',hold_order=? WHERE id=? AND status='available'", id, tid); if (r.changes !== 1) throw new HttpErr(409, 'This table is not available'); }
    const status = pay === 'cod' ? 'CONFIRMED' : 'AWAITING_PAYMENT';
    run('INSERT INTO orders(id,tok,name,phone,type,address,km,table_id,items,subtotal,service,delivery,total,pay,status,expires_at,notes,fp,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', id, sha(tok), name, phone, type, address, km, tid, JSON.stringify(lines), subtotal, service, delivery, total, pay, status, exp, String(b.notes || '').slice(0, 300), fp, now());
    audit(null, 'order_created', { id, total, type });
    return { id, token: tok, total, subtotal, service, delivery, status, expires_at: exp };
  });
}
const orderAuth = (id, tok) => { const o = q1('SELECT * FROM orders WHERE id=?', id); if (!o || !tok || !crypto.timingSafeEqual(Buffer.from(sha(String(tok))), Buffer.from(o.tok))) throw new HttpErr(404, 'Order not found'); return o; };
function analyseImage(buf) {
  const t = buf.subarray(0, 12), ok = (t[0] === 0xFF && t[1] === 0xD8 && t[2] === 0xFF) ? 'jpg' : (t[0] === 0x89 && t.subarray(1, 4).toString() === 'PNG') ? 'png' : (t.subarray(0, 4).toString() === 'RIFF' && t.subarray(8, 12).toString() === 'WEBP') ? 'webp' : null;
  if (!ok) throw new HttpErr(400, 'Only JPG, PNG or WEBP images are accepted');
  const flags = [], txt = buf.toString('latin1');
  for (const k of ['Photoshop', 'Canva', 'GIMP', 'Snapseed', 'Lightroom', 'PicsArt', 'Pixlr', 'Paint.NET', 'Midjourney', 'Stable Diffusion', 'DALL']) if (txt.includes(k)) flags.push('Editing/AI software marker in file metadata: ' + k);
  return { ext: ok, flags, hasMeta: txt.includes('Exif') || txt.includes('tEXt') };
}
function addScreenshot(o, image) {
  if (!['AWAITING_PAYMENT', 'PAYMENT_REJECTED'].includes(o.status) || o.pay !== 'advance') throw new HttpErr(409, 'Payment cannot be submitted for this order');
  const m = /^data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=]+)$/.exec(String(image || '')); if (!m) throw new HttpErr(400, 'Invalid image');
  const buf = Buffer.from(m[2], 'base64'); if (buf.length < 100 || buf.length > 5 * 1024 * 1024) throw new HttpErr(400, 'Image must be under 5 MB');
  const a = analyseImage(buf), h = sha(buf), flags = [...a.flags];
  const other = q1('SELECT order_id FROM payments WHERE sha=? AND order_id!=?', h, o.id); if (other) flags.push('Identical screenshot already submitted for order ' + other.order_id);
  if (q1('SELECT 1 FROM payments WHERE sha=? AND order_id=?', h, o.id)) flags.push('Same screenshot re-submitted for this order');
  const risk = other ? 'HIGH RISK' : flags.length ? 'SUSPICIOUS' : 'MANUAL VERIFICATION REQUIRED';
  const file = rnd(16) + '.' + a.ext; fs.writeFileSync(path.join(DATA, 'uploads', file), buf);
  tx(() => {
    run('INSERT INTO payments(order_id,status,file,sha,flags,ai_risk,amount,created_at) VALUES(?,?,?,?,?,?,?,?)', o.id, flags.length ? 'AI Review Required' : 'Pending Verification', file, h, JSON.stringify(flags), risk, o.total, now());
    run("UPDATE orders SET status='PENDING_PAYMENT_VERIFICATION',expires_at=NULL WHERE id=?", o.id);   // no expiry while staff review
    audit(null, 'screenshot_uploaded', { order: o.id, sha: h, risk });
  });
  return { status: 'PENDING_PAYMENT_VERIFICATION', message: 'Payment submitted for verification. Your order is not confirmed yet.' };
}
function whatsappFor(o) {
  const items = JSON.parse(o.items), t = o.table_id ? q1('SELECT * FROM tbl WHERE id=?', o.table_id) : null, p = q1("SELECT * FROM payments WHERE order_id=? AND status='Payment Approved'", o.id) || q1('SELECT * FROM payments WHERE order_id=? ORDER BY id DESC', o.id), approved = !!(p && p.status === 'Payment Approved');
  const L = ['*ROYAL KITCHEN ORDER ' + o.id + '*' + (o.pay === 'advance' && !approved ? ' (PAYMENT PENDING VERIFICATION - NOT CONFIRMED)' : ''), 'Name: ' + o.name, 'Phone: ' + o.phone, 'Date: ' + pkTime(o.created_at), 'Type: ' + o.type.toUpperCase()];
  if (t) L.push('Hall: ' + t.hall + ' Hall', 'Table: ' + t.hall + ' ' + t.num); if (o.type === 'delivery') L.push('Address: ' + o.address + ' (' + o.km + ' km)');
  L.push('', ...items.map(i => `${i.qty} x ${i.name} (${i.variant}${i.extra ? ' + ' + i.extra : ''}) = Rs. ${i.unit * i.qty}`), '', 'Subtotal: Rs. ' + o.subtotal);
  if (o.service) L.push('Service charge 3%: Rs. ' + o.service); if (o.delivery) L.push('Delivery: Rs. ' + o.delivery);
  L.push('*Total: Rs. ' + o.total + '*');
  if (o.pay === 'cod') L.push('Payment: CASH ON DELIVERY');
  else { L.push((approved ? 'Advance paid: Rs. ' : 'Advance to verify: Rs. ') + o.total, 'Payment: ' + getSet('bank_name') + ' bank transfer', 'Payment verification: ' + (approved ? 'APPROVED' : 'PENDING VERIFICATION')); if (p && PUBLIC_URL) { const exp = now() + 7 * 864e5; L.push('Screenshot: ' + PUBLIC_URL + `/s/${p.id}/${exp}/${sign(p.id, exp)}`); } }
  const text = L.join('\n'); return { text, url: 'https://wa.me/' + getSet('wa_number') + '?text=' + encodeURIComponent(text), note: 'wa.me links cannot attach images; the screenshot is shared as a secure link.' };
}

/* ---------- http plumbing ---------- */
const send = (res, s, obj, h = {}) => { res.writeHead(s, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...h }); res.end(JSON.stringify(obj)); };
const readBody = (req, max) => new Promise((ok, no) => { let n = 0; const c = []; req.on('data', d => { n += d.length; if (n > max) { no(new HttpErr(413, 'Request too large')); req.destroy(); } else c.push(d); }); req.on('end', () => ok(Buffer.concat(c))); req.on('error', no); });
const cookie = req => Object.fromEntries((req.headers.cookie || '').split(';').map(s => s.trim().split('=')).filter(a => a[0]).map(a => [a[0], a[1]]));
const sessionUser = req => { const sid = cookie(req).rk_sid; if (!sid) return null; const s = q1('SELECT * FROM sessions WHERE h=? AND exp>?', sha(sid), now()); if (!s) return null; const u = q1('SELECT id,username,role,active FROM users WHERE id=?', s.user_id); return u && u.active ? u : null; };
const need = (u, roles) => { if (!u) throw new HttpErr(401, 'Login required'); if (roles && !roles.includes(u.role)) throw new HttpErr(403, 'Not allowed for your role'); return u; };
const canEditProducts = u => u.role !== 'MANAGER' || getSet('manager_products') === '1';
const canEditPrices = u => u.role !== 'MANAGER' || getSet('manager_prices') === '1';
const pubProduct = p => ({ id: p.id, name: p.name, group: p.grp, sub: p.sub, desc: p.descr, opts: JSON.parse(p.opts), eligible: !!p.eligible, topping: !!p.topping, badge: p.badge, image: p.image ? '/img/' + p.image : null, active: !!p.active });
function validProduct(b, cur) {
  const o = {}; const name = String(b.name ?? cur?.name ?? '').trim(); if (name.length < 2 || name.length > 100) throw new HttpErr(400, 'Product name required');
  const grp = b.group ?? cur?.grp; if (!GROUPS.includes(grp)) throw new HttpErr(400, 'Valid category required');
  const opts = b.opts ?? (cur && JSON.parse(cur.opts)); if (!Array.isArray(opts) || opts.some(x => !Array.isArray(x) || typeof x[0] !== 'string' || !x[0] || !Number.isInteger(x[1]) || x[1] <= 0 || x[1] > 1e6)) throw new HttpErr(400, 'Prices must be positive whole numbers');
  return { name, grp, opts, sub: String(b.sub ?? cur?.sub ?? grp).slice(0, 60), descr: String(b.desc ?? cur?.descr ?? '').slice(0, 500), eligible: +!!(b.eligible ?? cur?.eligible), topping: +!!(b.topping ?? cur?.topping), badge: b.badge ?? cur?.badge ?? null, active: +!!(b.active ?? cur?.active ?? 1) };
}

const routes = [];
const R = (m, p, f, o = {}) => routes.push({ m, re: new RegExp('^' + p.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$'), f, ...o });

/* public */
R('GET', '/api/health', () => ({ ok: true }));
R('GET', '/api/config', () => ({ open: isOpen(), wa: getSet('wa_number'), event: getSet('event_number'), bank: { name: getSet('bank_name'), account: getSet('bank_account') }, hours: [+getSet('open_hour'), +getSet('close_hour')] }));
R('GET', '/api/menu', () => qa('SELECT * FROM products WHERE active=1 ORDER BY sort,id').map(pubProduct));
R('GET', '/api/tables', () => { releaseExpired(); return qa('SELECT id,hall,num,status FROM tbl ORDER BY hall,num'); });
R('POST', '/api/orders', c => createOrder(c.body, c.ip));
R('POST', '/api/orders/:id/screenshot', c => addScreenshot(orderAuth(c.p.id, c.url.searchParams.get('token')), c.body.image), { max: 8e6 });
R('GET', '/api/orders/:id', c => { const o = orderAuth(c.p.id, c.url.searchParams.get('token')); const p = q1('SELECT status,reason FROM payments WHERE order_id=? ORDER BY id DESC', o.id); return { id: o.id, status: o.status, total: o.total, payment: p ? p.status : (o.pay === 'cod' ? 'Cash on delivery' : 'Awaiting Payment'), rejection_reason: p && p.status === 'Payment Rejected' ? p.reason : null }; });
R('GET', '/api/orders/:id/whatsapp', c => { const o = orderAuth(c.p.id, c.url.searchParams.get('token')); if (!['PENDING_PAYMENT_VERIFICATION', 'CONFIRMED', 'PREPARING', 'COMPLETED'].includes(o.status)) throw new HttpErr(403, 'Order is not confirmed yet'); return whatsappFor(o); });

/* auth */
R('POST', '/api/login', c => {
  const uname = String(c.body.username || '').toLowerCase().slice(0, 60), k = uname + '|' + c.ip, f = q1('SELECT * FROM login_fail WHERE k=?', k);
  if (f && f.until > now()) throw new HttpErr(429, 'Too many failed attempts. Try again in a few minutes.');
  const u = q1('SELECT * FROM users WHERE username=? AND active=1', uname), good = checkPw(String(c.body.password || ''), u ? u.pw : DUMMY) && u;
  if (!good) { const n = (f ? f.n : 0) + 1; run('INSERT INTO login_fail(k,n,until) VALUES(?,?,?) ON CONFLICT(k) DO UPDATE SET n=?,until=?', k, n, n >= 5 ? now() + 900000 : 0, n >= 5 ? 0 : n, n >= 5 ? now() + 900000 : 0); audit(null, 'login_failed', { username: uname }); throw new HttpErr(401, 'Wrong username or password'); }
  run('DELETE FROM login_fail WHERE k=?', k); const sid = rnd(32); run('INSERT INTO sessions(h,user_id,exp) VALUES(?,?,?)', sha(sid), u.id, now() + 12 * 3600000); audit(u, 'login', {});
  return { __h: { 'Set-Cookie': `rk_sid=${sid}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200${SECURE ? '; Secure' : ''}` }, body: { username: u.username, role: u.role } };
});
R('POST', '/api/logout', c => { const sid = cookie(c.req).rk_sid; if (sid) run('DELETE FROM sessions WHERE h=?', sha(sid)); return { __h: { 'Set-Cookie': 'rk_sid=; HttpOnly; Path=/; Max-Age=0' }, body: { ok: true } }; });
R('GET', '/api/me', c => ({ ...need(c.u), manager_products: getSet('manager_products') === '1', manager_prices: getSet('manager_prices') === '1' }));

/* admin: dashboard, orders, payments */
R('GET', '/api/admin/stats', c => {
  need(c.u); releaseExpired(); const from = +c.url.searchParams.get('from') || 0, to = +c.url.searchParams.get('to') || now() + 1;
  const n = (sql, ...a) => q1(sql, ...a).n, W = ' AND created_at>=? AND created_at<?';
  return { orders: n('SELECT COUNT(*) n FROM orders WHERE 1=1' + W, from, to), pending_orders: n("SELECT COUNT(*) n FROM orders WHERE status IN ('AWAITING_PAYMENT','PENDING_PAYMENT_VERIFICATION','PAYMENT_REJECTED')" + W, from, to), confirmed: n("SELECT COUNT(*) n FROM orders WHERE status IN ('CONFIRMED','PREPARING')" + W, from, to), completed: n("SELECT COUNT(*) n FROM orders WHERE status='COMPLETED'" + W, from, to), pending_verifications: n("SELECT COUNT(*) n FROM payments WHERE status IN ('Pending Verification','AI Review Required','Under Manual Review')"), approved_payments: n("SELECT COUNT(*) n FROM payments WHERE status='Payment Approved'" + W, from, to), rejected_payments: n("SELECT COUNT(*) n FROM payments WHERE status='Payment Rejected'" + W, from, to), sales: q1("SELECT COALESCE(SUM(total),0) n FROM orders WHERE status IN ('CONFIRMED','PREPARING','COMPLETED')" + W, from, to).n, tables: Object.fromEntries(qa('SELECT status,COUNT(*) n FROM tbl GROUP BY status').map(r => [r.status, r.n])), active_products: n('SELECT COUNT(*) n FROM products WHERE active=1') };
});
R('GET', '/api/admin/orders', c => { need(c.u, ['OWNER', 'MANAGER']); const st = c.url.searchParams.get('status'); return qa('SELECT o.*,(SELECT status FROM payments p WHERE p.order_id=o.id ORDER BY id DESC LIMIT 1) pay_status FROM orders o ' + (st ? 'WHERE status=? ' : '') + 'ORDER BY created_at DESC LIMIT 200', ...(st ? [st] : [])).map(o => ({ ...o, tok: undefined, fp: undefined, items: JSON.parse(o.items) })); });
R('GET', '/api/admin/orders/:id', c => { need(c.u, ['OWNER', 'MANAGER']); const o = q1('SELECT * FROM orders WHERE id=?', c.p.id); if (!o) throw new HttpErr(404, 'Not found'); return { ...o, tok: undefined, fp: undefined, items: JSON.parse(o.items), table: o.table_id ? q1('SELECT hall,num,status FROM tbl WHERE id=?', o.table_id) : null, payments: qa('SELECT id,status,flags,ai_risk,amount,reference,reason,reviewed_by,reviewed_at,created_at FROM payments WHERE order_id=? ORDER BY id', o.id).map(p => ({ ...p, flags: JSON.parse(p.flags || '[]') })) }; });
R('GET', '/api/admin/payments/:id/image', c => { need(c.u, ['OWNER', 'MANAGER']); const p = q1('SELECT file FROM payments WHERE id=?', c.p.id); if (!p) throw new HttpErr(404, 'Not found'); return { __file: path.join(DATA, 'uploads', p.file) }; });
R('POST', '/api/admin/payments/:id/approve', c => {
  const u = need(c.u, ['OWNER', 'MANAGER']), p = q1('SELECT * FROM payments WHERE id=?', c.p.id); if (!p) throw new HttpErr(404, 'Not found');
  if (!['Pending Verification', 'AI Review Required', 'Under Manual Review'].includes(p.status)) throw new HttpErr(409, 'Payment is not awaiting review');
  const o = q1('SELECT * FROM orders WHERE id=?', p.order_id), ref = String(c.body.reference || '').trim();
  if (+c.body.received_amount !== o.total) throw new HttpErr(400, `Received amount must equal the bill total (Rs. ${o.total}). Verify the bank record.`);
  if (ref.length < 4) throw new HttpErr(400, 'Bank transaction reference is required');
  try { tx(() => { run("UPDATE payments SET status='Payment Approved',reference=?,reviewed_by=?,reviewed_at=? WHERE id=?", ref, u.username, now(), p.id); run("UPDATE orders SET status='CONFIRMED',expires_at=NULL WHERE id=?", o.id); if (o.table_id) run("UPDATE tbl SET status='reserved' WHERE id=?", o.table_id); audit(u, 'payment_approved', { order: o.id, payment: p.id, amount: o.total, reference: ref }); }); }
  catch (e) { if (/UNIQUE/.test(e.message)) throw new HttpErr(409, 'This bank reference was already used for another approved payment'); throw e; }
  return { status: 'CONFIRMED', whatsapp: whatsappFor(q1('SELECT * FROM orders WHERE id=?', o.id)) };
});
R('POST', '/api/admin/payments/:id/reject', c => {
  const u = need(c.u, ['OWNER', 'MANAGER']), p = q1('SELECT * FROM payments WHERE id=?', c.p.id), reason = String(c.body.reason || '').trim(); if (!p) throw new HttpErr(404, 'Not found'); if (reason.length < 3) throw new HttpErr(400, 'Rejection reason required');
  if (!['Pending Verification', 'AI Review Required', 'Under Manual Review'].includes(p.status)) throw new HttpErr(409, 'Payment is not awaiting review');
  tx(() => { run("UPDATE payments SET status='Payment Rejected',reason=?,reviewed_by=?,reviewed_at=? WHERE id=?", reason, u.username, now(), p.id); run("UPDATE orders SET status='PAYMENT_REJECTED',expires_at=? WHERE id=?", now() + HOLD_MS, p.order_id); audit(u, 'payment_rejected', { order: p.order_id, payment: p.id, reason }); });
  return { status: 'PAYMENT_REJECTED' };
});
R('POST', '/api/admin/payments/:id/refund', c => {
  const u = need(c.u, ['OWNER', 'MANAGER']), p = q1('SELECT * FROM payments WHERE id=?', c.p.id); if (!p) throw new HttpErr(404, 'Not found');
  const next = { 'Refund Required': 'Refunded' }[p.status]; if (!next) throw new HttpErr(409, 'No refund pending'); run('UPDATE payments SET status=? WHERE id=?', next, p.id); audit(u, 'payment_refunded', { payment: p.id }); return { status: next };
});
R('POST', '/api/admin/orders/:id/status', c => {
  const u = need(c.u, ['OWNER', 'MANAGER']), o = q1('SELECT * FROM orders WHERE id=?', c.p.id), s = c.body.status; if (!o) throw new HttpErr(404, 'Not found');
  const ok = { PREPARING: ['CONFIRMED'], COMPLETED: ['CONFIRMED', 'PREPARING'], CANCELLED: ['AWAITING_PAYMENT', 'PENDING_PAYMENT_VERIFICATION', 'PAYMENT_REJECTED', 'CONFIRMED', 'PREPARING'] };
  if (!ok[s] || !ok[s].includes(o.status)) throw new HttpErr(409, 'Invalid status change');
  tx(() => { run('UPDATE orders SET status=?,expires_at=NULL WHERE id=?', s, o.id); if (o.table_id) run('UPDATE tbl SET status=?,hold_order=NULL WHERE id=?', s === 'COMPLETED' ? 'cleaning' : s === 'CANCELLED' ? 'available' : 'occupied', o.table_id);
    if (s === 'CANCELLED') run("UPDATE payments SET status='Refund Required' WHERE order_id=? AND status='Payment Approved'", o.id); audit(u, 'order_' + s.toLowerCase(), { order: o.id }); });
  return { status: s };
});
R('POST', '/api/admin/tables/:id/status', c => { const u = need(c.u, ['OWNER', 'MANAGER']); if (!['available', 'reserved', 'occupied', 'cleaning'].includes(c.body.status)) throw new HttpErr(400, 'Invalid status'); const r = run('UPDATE tbl SET status=?,hold_order=CASE WHEN ?=\'available\' THEN NULL ELSE hold_order END WHERE id=?', c.body.status, c.body.status, c.p.id); if (!r.changes) throw new HttpErr(404, 'Not found'); audit(u, 'table_status', { table: +c.p.id, status: c.body.status }); return { ok: true }; });

/* admin: products */
R('GET', '/api/admin/products', c => { need(c.u, ['OWNER', 'MANAGER', 'DEVELOPER']); return qa('SELECT * FROM products ORDER BY sort,id').map(pubProduct); });
R('POST', '/api/admin/products', c => {
  const u = need(c.u, ['OWNER', 'MANAGER', 'DEVELOPER']); if (!canEditProducts(u)) throw new HttpErr(403, 'Owner has not allowed managers to add products');
  const v = validProduct(c.body); if (q1('SELECT 1 FROM products WHERE name=? AND grp=?', v.name, v.grp)) throw new HttpErr(409, 'A product with this name already exists in this category');
  const r = run('INSERT INTO products(name,grp,sub,descr,opts,eligible,topping,badge,active,sort,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)', v.name, v.grp, v.sub, v.descr, JSON.stringify(v.opts), v.eligible, v.topping, v.badge, v.active, 9999, now());
  audit(u, 'product_added', { id: +r.lastInsertRowid, name: v.name, opts: v.opts }); return { id: +r.lastInsertRowid };
});
R('PUT', '/api/admin/products/:id', c => {
  const u = need(c.u, ['OWNER', 'MANAGER', 'DEVELOPER']), cur = q1('SELECT * FROM products WHERE id=?', c.p.id); if (!cur) throw new HttpErr(404, 'Not found'); if (!canEditProducts(u)) throw new HttpErr(403, 'Owner has not allowed managers to edit products');
  const v = validProduct(c.body, cur), changed = JSON.stringify(v.opts) !== cur.opts; if (changed && !canEditPrices(u)) throw new HttpErr(403, 'Owner has not allowed managers to change prices');
  run('UPDATE products SET name=?,grp=?,sub=?,descr=?,opts=?,eligible=?,topping=?,badge=?,active=? WHERE id=?', v.name, v.grp, v.sub, v.descr, JSON.stringify(v.opts), v.eligible, v.topping, v.badge, v.active, cur.id);
  audit(u, changed ? 'product_price_changed' : 'product_edited', { id: cur.id, name: v.name, old: JSON.parse(cur.opts), new: v.opts }); return { ok: true };
});
R('DELETE', '/api/admin/products/:id', c => { const u = need(c.u, ['OWNER', 'MANAGER', 'DEVELOPER']); if (!canEditProducts(u)) throw new HttpErr(403, 'Not allowed'); const p = q1('SELECT name FROM products WHERE id=?', c.p.id); if (!p) throw new HttpErr(404, 'Not found'); run('DELETE FROM products WHERE id=?', c.p.id); audit(u, 'product_deleted', { id: +c.p.id, name: p.name }); return { ok: true }; });
R('POST', '/api/admin/products/:id/image', c => {
  const u = need(c.u, ['OWNER', 'MANAGER', 'DEVELOPER']); if (!canEditProducts(u)) throw new HttpErr(403, 'Not allowed');
  const m = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/.exec(String(c.body.image || '')); if (!m) throw new HttpErr(400, 'Invalid image'); const buf = Buffer.from(m[2], 'base64'); if (buf.length > 3e6) throw new HttpErr(400, 'Image must be under 3 MB');
  const a = analyseImage(buf), name = c.p.id + '-' + rnd(4) + '.' + a.ext; fs.writeFileSync(path.join(DATA, 'uploads', 'products', name), buf); run('UPDATE products SET image=? WHERE id=?', name, c.p.id); audit(u, 'product_image', { id: +c.p.id }); return { image: '/img/' + name };
}, { max: 5e6 });

/* admin: users, settings, logs */
R('GET', '/api/admin/users', c => { need(c.u, ['OWNER']); return qa('SELECT id,username,role,active,created_at FROM users ORDER BY id'); });
R('POST', '/api/admin/users', c => {
  const u = need(c.u, ['OWNER']), n = String(c.body.username || '').trim(), pw = String(c.body.password || ''); if (!/^[A-Za-z0-9_.-]{3,30}$/.test(n) || pw.length < 10 || !ROLES.includes(c.body.role)) throw new HttpErr(400, 'Username 3-30 chars, password at least 10 chars, valid role');
  if (q1('SELECT 1 FROM users WHERE username=?', n)) throw new HttpErr(409, 'Username taken'); const r = run('INSERT INTO users(username,pw,role,created_at) VALUES(?,?,?,?)', n, hashPw(pw), c.body.role, now()); audit(u, 'user_created', { username: n, role: c.body.role }); return { id: +r.lastInsertRowid };
});
R('PUT', '/api/admin/users/:id', c => {
  const u = need(c.u, ['OWNER']), t = q1('SELECT * FROM users WHERE id=?', c.p.id); if (!t) throw new HttpErr(404, 'Not found');
  const role = c.body.role ?? t.role, active = +!!(c.body.active ?? t.active); if (!ROLES.includes(role)) throw new HttpErr(400, 'Invalid role');
  if (t.role === 'OWNER' && (role !== 'OWNER' || !active) && q1("SELECT COUNT(*) n FROM users WHERE role='OWNER' AND active=1 AND id!=?", t.id).n === 0) throw new HttpErr(409, 'At least one active Owner is required');
  if (c.body.password) { if (String(c.body.password).length < 10) throw new HttpErr(400, 'Password too short'); run('UPDATE users SET pw=? WHERE id=?', hashPw(String(c.body.password)), t.id); run('DELETE FROM sessions WHERE user_id=?', t.id); }
  run('UPDATE users SET role=?,active=? WHERE id=?', role, active, t.id); if (!active) run('DELETE FROM sessions WHERE user_id=?', t.id); audit(u, 'user_updated', { id: t.id, role, active }); return { ok: true };
});
const SETTING_KEYS = ['manager_products', 'manager_prices', 'hours_enforced', 'open_hour', 'close_hour', 'wa_number', 'event_number', 'bank_name', 'bank_account'];
R('GET', '/api/admin/settings', c => { need(c.u, ['OWNER', 'DEVELOPER']); return Object.fromEntries(SETTING_KEYS.map(k => [k, getSet(k)])); });
R('PUT', '/api/admin/settings', c => { const u = need(c.u, ['OWNER']); for (const [k, v] of Object.entries(c.body)) if (SETTING_KEYS.includes(k)) putSet(k, String(v).slice(0, 100)); audit(u, 'settings_changed', c.body); return { ok: true }; });
R('GET', '/api/admin/logs', c => { need(c.u, ['OWNER', 'DEVELOPER']); return qa('SELECT * FROM audit ORDER BY id DESC LIMIT ?', Math.min(+c.url.searchParams.get('limit') || 200, 1000)).map(l => ({ ...l, detail: JSON.parse(l.detail) })); });

/* ---------- server ---------- */
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
const SEC = { 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'same-origin' };
function serveFile(res, f, headers = {}) { fs.readFile(f, (e, d) => { if (e) { res.writeHead(404, SEC); return res.end('Not found'); } res.writeHead(200, { 'Content-Type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream', ...SEC, ...headers }); res.end(d); }); }
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x'), p = url.pathname;
    /* Behind Netlify's proxy every request shares the proxy IP, so set TRUST_PROXY=1 to use the real visitor IP (login lockout and order limits are per IP). */
    const ip = (process.env.TRUST_PROXY === '1' && (req.headers['x-nf-client-connection-ip'] || String(req.headers['x-forwarded-for'] || '').split(',')[0].trim())) || req.socket.remoteAddress || '';
    let m;
    if (req.method === 'GET' && (m = /^\/s\/(\d+)\/(\d+)\/([a-f0-9]{32})$/.exec(p))) {   // signed screenshot link (for WhatsApp recipients)
      if (+m[2] < now() || sign(m[1], m[2]) !== m[3]) { res.writeHead(403, SEC); return res.end('Link expired or invalid'); }
      const pay = q1('SELECT file FROM payments WHERE id=?', +m[1]); return pay ? serveFile(res, path.join(DATA, 'uploads', pay.file), { 'Cache-Control': 'private, no-store' }) : (res.writeHead(404), res.end());
    }
    if (req.method === 'GET' && (m = /^\/img\/([\w.-]+)$/.exec(p))) return serveFile(res, path.join(DATA, 'uploads', 'products', m[1]), { 'Cache-Control': 'public, max-age=86400' });
    if (p.startsWith('/api/')) {
      for (const r of routes) {
        const mm = r.re.exec(p); if (!mm || r.m !== req.method) continue;
        const c = { req, url, ip, p: mm.groups || {}, u: sessionUser(req), body: {} };
        if (req.method !== 'GET') {
          if ((p.startsWith('/api/admin') || p === '/api/logout') && req.headers['x-requested-with'] !== 'rk') throw new HttpErr(403, 'Missing request header');   // CSRF guard on top of SameSite
          if (req.method !== 'DELETE') { const raw = await readBody(req, r.max || 65536); try { c.body = raw.length ? JSON.parse(raw) : {}; } catch { throw new HttpErr(400, 'Invalid JSON'); } if (!c.body || typeof c.body !== 'object') c.body = {}; }
        }
        const out = r.f(c);
        if (out && out.__file) return serveFile(res, out.__file, { 'Cache-Control': 'private, no-store' });
        return out && out.__h ? send(res, 200, out.body, out.__h) : send(res, 200, out);
      }
      throw new HttpErr(404, 'Not found');
    }
    const rel = p === '/' ? '/index.html' : p === '/admin' ? '/admin.html' : p, f = path.normalize(path.join(__dirname, 'public', rel));
    if (!f.startsWith(path.join(__dirname, 'public'))) { res.writeHead(403, SEC); return res.end(); }
    serveFile(res, f);
  } catch (e) {
    if (e instanceof HttpErr) return send(res, e.s, { error: e.message });
    console.error(e); send(res, 500, { error: 'Server error' });
  }
});
server.listen(PORT, () => console.log('Royal Kitchen backend listening on http://localhost:' + PORT));
