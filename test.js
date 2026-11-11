'use strict';
/* End-to-end test. Run: node test.js   (starts its own temporary server, uses a temporary database) */
const { spawn } = require('node:child_process'), fs = require('node:fs'), os = require('node:os'), path = require('node:path'), crypto = require('node:crypto');
const PORT = 3917, BASE = 'http://localhost:' + PORT, PW = 'Test-Passw0rd-123';
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rk-'));
const srv = spawn(process.execPath, ['--no-warnings', path.join(__dirname, 'server.js')], { env: { ...process.env, PORT, DATA_DIR: tmp, ADMIN_PASSWORD: PW, HOLD_MINUTES: '0.05', PUBLIC_URL: BASE }, stdio: 'ignore' });
let pass = 0, fail = 0;
const ok = (c, name) => { c ? pass++ : fail++; console.log((c ? 'PASS  ' : 'FAIL  ') + name); };
async function api(method, url, body, cookie) {
  const r = await fetch(BASE + url, { method, headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'rk', ...(cookie ? { Cookie: cookie } : {}) }, body: body ? JSON.stringify(body) : undefined });
  let j = null; try { j = await r.json(); } catch { }
  return { s: r.status, j, ck: (r.headers.get('set-cookie') || '').split(';')[0] };
}
const png = extra => 'data:image/png;base64,' + Buffer.concat([Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]), Buffer.from(extra || ''), crypto.randomBytes(300)]).toString('base64');
const login = async (u, p) => (await api('POST', '/api/login', { username: u, password: p })).ck;
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  for (let i = 0; i < 50; i++) { try { if ((await fetch(BASE + '/api/health')).ok) break; } catch { } await sleep(100); }
  // auth
  ok((await api('GET', '/api/admin/stats')).s === 401, 'admin API blocked without login');
  let r; for (let i = 0; i < 5; i++) r = await api('POST', '/api/login', { username: 'nobody', password: 'x' });
  ok((await api('POST', '/api/login', { username: 'nobody', password: 'x' })).s === 429, 'login locked after 5 failures');
  ok((await api('POST', '/api/login', { username: 'owner', password: 'wrong' })).s === 401, 'wrong password rejected');
  const own = await login('owner', PW); ok(!!own, 'owner login');
  await api('PUT', '/api/admin/settings', { hours_enforced: '0' }, own);
  await api('POST', '/api/admin/users', { username: 'mgr', password: 'Manager-Pass-123', role: 'MANAGER' }, own);
  await api('POST', '/api/admin/users', { username: 'dev', password: 'Developer-Pass-123', role: 'DEVELOPER' }, own);
  const mgr = await login('mgr', 'Manager-Pass-123'), dev = await login('dev', 'Developer-Pass-123');
  ok((await api('GET', '/api/admin/users', null, mgr)).s === 403, 'manager cannot manage users');
  // menu and tables
  const menu = (await api('GET', '/api/menu')).j, tables = (await api('GET', '/api/tables')).j;
  ok(menu.length === 176, 'menu has 176 items'); ok(tables.length === 50 && tables.filter(t => t.hall === 'Gents').length === 25 && tables.filter(t => t.hall === 'Family').length === 25, '25 Gents + 25 Family tables');
  const id = n => menu.find(m => m.name === n).id;
  // pricing is computed by the server (a client cannot send its own prices)
  const dine = { name: 'Ali', phone: '03001234567', type: 'dine', table_id: tables.find(t => t.hall === 'Gents' && t.num === 1).id, pay: 'advance', items: [{ id: id('Chicken Afghani Karahi'), opt: 0, qty: 1, price: 1 }, { id: id('Zinger Burger'), opt: 0, qty: 2 }] };
  r = await api('POST', '/api/orders', dine);
  ok(r.s === 200 && r.j.subtotal === 1650 && r.j.service === 29 && r.j.total === 1679, 'dine-in total: 950 karahi + 700 burgers, 3% on karahi only = Rs. 1679');
  const o1 = r.j;
  ok((await api('POST', '/api/orders', { ...dine, name: 'Bob', phone: '03007654321' })).s === 409, 'double booking of same table blocked');
  ok((await api('GET', '/api/tables')).j.find(t => t.id === dine.table_id).status === 'waiting', 'table shows Waiting for Confirmation');
  const pz = await api('POST', '/api/orders', { name: 'Sara', phone: '03111234567', type: 'delivery', address: 'Hasilpur', km: 3.1, pay: 'advance', items: [{ id: id('Royal Crown Crust'), opt: 2, extra: true, qty: 1 }] });
  ok(pz.j.total === 1550 + 250 + 60, 'delivery: Large pizza 1550 + topping 250 + Rs. 60 delivery (3.1 km)');
  ok((await api('POST', '/api/orders', { ...dine, type: 'pickup', pay: 'cod' })).s === 400, 'COD rejected for non-delivery orders');
  // payment flow
  ok((await api('GET', `/api/orders/${o1.id}/whatsapp?token=${o1.token}`)).s === 403, 'no confirmed WhatsApp message before approval');
  r = await api('POST', `/api/orders/${o1.id}/screenshot?token=${o1.token}`, { image: png('clean') }); ok(r.s === 200 && r.j.status === 'PENDING_PAYMENT_VERIFICATION', 'screenshot upload -> pending verification');
  const pw = await api('GET', `/api/orders/${o1.id}/whatsapp?token=${o1.token}`);
  ok(pw.s === 200 && pw.j.text.includes('PENDING VERIFICATION') && !pw.j.text.includes('APPROVED') && pw.j.text.includes('/s/'), 'order + screenshot link can go to the restaurant WhatsApp while payment is still pending (clearly marked NOT confirmed)');
  ok((await api('POST', `/api/orders/${o1.id}/screenshot?token=badtoken`, { image: png() })).s === 404, 'screenshot upload needs the order token');
  const dupImg = png('same'); await api('POST', `/api/orders/${pz.j.id}/screenshot?token=${pz.j.token}`, { image: dupImg });
  let det = (await api('GET', `/api/admin/orders/${o1.id}`, null, own)).j, pid = det.payments[0].id;
  ok(det.status === 'PENDING_PAYMENT_VERIFICATION' && det.payments[0].ai_risk === 'MANUAL VERIFICATION REQUIRED', 'AI review is only a hint: manual verification required');
  ok((await api('POST', `/api/admin/payments/${pid}/approve`, { received_amount: 1679, reference: 'FBL123456' }, dev)).s === 403, 'developer cannot approve payments');
  ok((await api('POST', `/api/admin/payments/${pid}/approve`, { received_amount: 1000, reference: 'FBL123456' }, mgr)).s === 400, 'approval refused when amount does not match the bill');
  r = await api('POST', `/api/admin/payments/${pid}/approve`, { received_amount: 1679, reference: 'FBL123456' }, mgr);
  ok(r.s === 200 && r.j.status === 'CONFIRMED' && r.j.whatsapp.text.includes('APPROVED') && r.j.whatsapp.text.includes('/s/'), 'manager approval confirms order + WhatsApp text has APPROVED + secure screenshot link');
  const link = r.j.whatsapp.text.match(/http\S+\/s\/\S+/)[0]; ok((await fetch(link)).status === 200, 'signed screenshot link opens'); ok((await fetch(link.slice(0, -3) + 'abc')).status === 403, 'tampered screenshot link refused');
  ok((await api('GET', '/api/tables')).j.find(t => t.id === dine.table_id).status === 'reserved', 'table becomes Reserved after approval');
  ok((await api('GET', `/api/orders/${o1.id}/whatsapp?token=${o1.token}`)).s === 200, 'customer can fetch WhatsApp message after approval');
  // duplicate screenshot + same bank reference + editing marker
  const o3 = (await api('POST', '/api/orders', { name: 'Zed', phone: '03211234567', type: 'pickup', pay: 'advance', items: [{ id: id('Malai Boti'), opt: 1, qty: 1 }] })).j;
  await api('POST', `/api/orders/${o3.id}/screenshot?token=${o3.token}`, { image: dupImg });
  det = (await api('GET', `/api/admin/orders/${o3.id}`, null, own)).j; ok(det.payments[0].ai_risk === 'HIGH RISK' && det.payments[0].flags.length === 1, 'duplicate screenshot flagged HIGH RISK');
  const o4 = (await api('POST', '/api/orders', { name: 'Ed', phone: '03221234567', type: 'pickup', pay: 'advance', items: [{ id: id('Malai Boti'), opt: 0, qty: 1 }] })).j;
  await api('POST', `/api/orders/${o4.id}/screenshot?token=${o4.token}`, { image: png('Adobe Photoshop 25') });
  det = (await api('GET', `/api/admin/orders/${o4.id}`, null, own)).j; ok(det.payments[0].ai_risk === 'SUSPICIOUS' && det.payments[0].status === 'AI Review Required', 'editing-software marker flagged SUSPICIOUS');
  ok((await api('POST', `/api/admin/payments/${det.payments[0].id}/approve`, { received_amount: 490, reference: 'FBL123456' }, own)).s === 409, 'same bank reference cannot approve two payments');
  // rejection + resubmission
  r = await api('POST', `/api/admin/payments/${det.payments[0].id}/reject`, { reason: 'Amount not received' }, mgr); ok(r.s === 200, 'payment rejected with reason');
  ok((await api('GET', `/api/orders/${o4.id}?token=${o4.token}`)).j.rejection_reason === 'Amount not received', 'customer sees rejection reason');
  r = await api('POST', `/api/orders/${o4.id}/screenshot?token=${o4.token}`, { image: png() }); ok(r.s === 200, 'customer can resubmit a new screenshot (same order, no duplicate order)');
  ok((await api('GET', `/api/admin/orders/${o4.id}`, null, own)).j.payments.length === 2, 'rejected screenshot kept in payment history');
  // completing frees table via cleaning
  await api('POST', `/api/admin/orders/${o1.id}/status`, { status: 'COMPLETED' }, mgr);
  ok((await api('GET', '/api/tables')).j.find(t => t.id === dine.table_id).status === 'cleaning', 'completed order -> table Cleaning');
  ok((await api('POST', `/api/admin/tables/${dine.table_id}/status`, { status: 'available' }, mgr)).s === 200 && (await api('GET', '/api/tables')).j.find(t => t.id === dine.table_id).status === 'available', 'staff releases table');
  // products and permissions
  const karahi = id('Chicken Afghani Karahi'), newOpts = [['Half', 1000], ['Full', 1800]];
  ok((await api('PUT', `/api/admin/products/${karahi}`, { opts: newOpts }, mgr)).s === 403, 'manager cannot edit products until owner allows');
  ok((await api('PUT', `/api/admin/products/${karahi}`, { opts: newOpts }, dev)).s === 200, 'developer can change price');
  ok((await api('GET', '/api/menu')).j.find(m => m.id === karahi).opts[0][1] === 1000, 'new price shows on customer menu immediately');
  ok((await api('POST', '/api/orders', { name: 'Old', phone: '03331234567', type: 'pickup', pay: 'advance', items: [{ id: karahi, opt: 0, qty: 1 }] })).j.total === 1000, 'new orders use the new price');
  ok((await api('GET', `/api/admin/orders/${o1.id}`, null, own)).j.total === 1679, 'existing orders keep their original price');
  const logs = (await api('GET', '/api/admin/logs', null, own)).j; ok(logs.some(l => l.action === 'product_price_changed' && l.username === 'dev' && l.detail.old[0][1] === 950 && l.detail.new[0][1] === 1000), 'audit log records who changed price (old and new)');
  ok(logs.some(l => l.action === 'payment_approved' && l.username === 'mgr'), 'audit log records who approved payment');
  ok((await api('POST', '/api/admin/products', { name: 'Test Dish', group: 'BBQ', opts: [['Regular', 500]] }, dev)).s === 200 && (await api('POST', '/api/admin/products', { name: 'Test Dish', group: 'BBQ', opts: [['Regular', 500]] }, dev)).s === 409, 'new product added; duplicate blocked');
  ok((await api('POST', '/api/admin/products', { name: 'Bad', group: 'BBQ', opts: [['Regular', -5]] }, dev)).s === 400, 'invalid price rejected');
  const st = (await api('GET', '/api/admin/stats', null, own)).j; ok(st.sales > 0 && st.pending_verifications >= 1, 'dashboard stats work');
  // hold expiry (HOLD_MINUTES=0.05 -> 3 s)
  const t2 = tables.find(t => t.hall === 'Family' && t.num === 7).id, e = (await api('POST', '/api/orders', { name: 'Late', phone: '03441234567', type: 'dine', table_id: t2, pay: 'advance', items: [{ id: id('Fresh Salad'), opt: 0, qty: 1 }] })).j;
  ok((await api('GET', '/api/tables')).j.find(t => t.id === t2).status === 'waiting', 'unpaid table is held'); await sleep(3500);
  ok((await api('GET', '/api/tables')).j.find(t => t.id === t2).status === 'available' && (await api('GET', `/api/orders/${e.id}?token=${e.token}`)).j.status === 'CANCELLED', 'expired unpaid hold released automatically');
  console.log(`\n${pass} passed, ${fail} failed`); srv.kill(); fs.rmSync(tmp, { recursive: true, force: true }); process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); srv.kill(); process.exit(1); });
