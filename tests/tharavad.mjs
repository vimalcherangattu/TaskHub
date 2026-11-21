// Tharavad control room (tharavad.html): renders every view from an in-memory mock, and the queue,
// alarm and control buttons write the right rows. Never touches the real database.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const errs = [];
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
p.on('pageerror', e => errs.push(e.message));
await p.goto(new URL('../tharavad.html', import.meta.url).href); await p.waitForTimeout(800);
await p.evaluate(() => {
  const m = (() => { const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`; })();
  window.DB = {
    tharavad_flags: [{ key: 'stop_all', value: false }, { key: 'away', value: false }],
    projects: [{ id: 'group-hq', name: 'Tharavad' }, { id: 'publishing', name: 'Publishing', parent_id: 'group-hq' }, { id: 'parenting-series', name: 'Parenting book series', parent_id: 'publishing' }, { id: 'account-finder', name: 'Small Fish', parent_id: 'group-hq' }, { id: 'etsy-shop', name: 'Etsy digital products', parent_id: 'group-hq' }],
    companies: [{ project_id: 'group-hq', kind: 'group' }, { project_id: 'publishing', kind: 'company', brand_mode: 'studio', stage: 'running', budget_cap_monthly: 2000, currency: 'INR' }, { project_id: 'parenting-series', kind: 'product', stage: 'running' }, { project_id: 'account-finder', kind: 'company', stage: 'running', budget_cap_monthly: 150, currency: 'USD', scorecard: { primary: { metric: 'Paying customers', target_90d: 5 } } }, { project_id: 'etsy-shop', kind: 'test', stage: 'pilot' }],
    unit_economics: [{ project_id: 'group-hq', month: m, revenue_inr: 0, cost_inr: 12672, contribution_inr: -12672 }, { project_id: 'account-finder', month: m, revenue_inr: 0, cost_inr: 12672, contribution_inr: -12672 }],
    agent_health: [{ id: 'ktn', name: 'KTN weekly run', project_id: 'parenting-series', status: 'active', health: 'green', runs_7d: 1 }, { id: 'kdp', name: 'KDP draft prep', project_id: 'publishing', status: 'active', health: 'red' }, { id: 'sf', name: 'Small Fish company agent', project_id: 'account-finder', status: 'planned', health: 'planned' }],
    runs: [{ id: 1, agent_id: 'ktn', started_at: new Date().toISOString(), ended_at: new Date().toISOString(), status: 'succeeded', summary: 'Ep 5 + 6 Shorts scheduled' }],
    asks: [{ id: 7, project_id: 'etsy-shop', type: 'login', title: 'Create the Etsy shop', why: 'Nothing can be listed', unblocks: 'Christmas bundle', steps: ['Open Etsy', 'Create app'], est_minutes: 20, deadline: new Date(Date.now() + 864e5).toISOString(), fallback: 'Wait for January', status: 'open' }],
    alarms: [{ id: 3, kind: 'silent', project_id: 'publishing', message: 'KDP draft prep has not reported', created_at: new Date().toISOString(), acked_at: null }],
    notes: [{ title: 'Board report 23 Nov', body: 'Money: zero revenue.', created_at: new Date().toISOString(), tags: ['weekly-report'] }]
  };
  window.WRITES = [];
  const q = t => { let rows = JSON.parse(JSON.stringify(DB[t] || [])); const o = { then: (r, j) => Promise.resolve({ data: rows, error: null }).then(r, j) };
    for (const k of ['select', 'order', 'limit', 'contains']) o[k] = () => o;
    o.eq = (c, v) => { rows = rows.filter(x => x[c] === v); return o }; o.is = (c, v) => { rows = rows.filter(x => (x[c] ?? null) === v); return o }; return o };
  sb.from = t => ({ select: () => q(t), update: row => ({ eq: (c, v) => { WRITES.push({ t, row, c, v }); const r = (DB[t] || []).find(x => x[c] === v); if (r) Object.assign(r, row);
    if (t === 'asks' && row.status && row.status !== 'open') DB.asks = DB.asks.filter(x => x.id !== v); if (t === 'alarms' && row.acked_at) DB.alarms = DB.alarms.filter(x => x.id !== v);
    return Promise.resolve({ error: null }) } }) });
  sb.channel = () => ({ on() { return this }, subscribe() { return this } });
  TH.start();
});
await p.waitForTimeout(500);
const shot = n => p.screenshot({ path: new URL(`./out/tharavad-${n}.png`, import.meta.url).pathname, fullPage: true });
console.log('overview kpis:', await p.$$eval('.kpi', k => k.length), '| tree units:', await p.$$eval('.tree .unit', u => u.length), '| report:', await p.evaluate(() => document.body.innerText.includes('Board report 23 Nov')));
console.log('queue badge:', await p.textContent('#qn')); await shot('overview');
await p.evaluate(() => { location.hash = '#queue' }); await p.waitForTimeout(200); await shot('queue');
await p.click('[data-ack="3"]'); await p.waitForTimeout(200);
console.log('alarm acked:', await p.evaluate(() => WRITES.some(w => w.t === 'alarms' && w.v === 3 && w.row.acked_at)));
await p.click('[data-drop="7"]'); await p.waitForTimeout(100);
console.log('drop asks to confirm:', await p.evaluate(() => !!document.querySelector('[data-dropyes="7"]') && WRITES.every(w => w.t !== 'asks')));
await p.click('[data-cancel]'); await p.click('[data-done="7"]'); await p.waitForTimeout(200);
console.log('ask done:', await p.evaluate(() => WRITES.some(w => w.t === 'asks' && w.v === 7 && w.row.status === 'done')), '| queue empty:', await p.evaluate(() => document.body.innerText.includes('Nothing waiting on you')));
await p.evaluate(() => { location.hash = '#agents' }); await p.waitForTimeout(200);
console.log('agents rows:', await p.$$eval('tbody tr', r => r.length), '| red first:', await p.evaluate(() => document.querySelector('tbody tr').innerText.includes('KDP draft prep'))); await shot('agents');
await p.evaluate(() => { location.hash = '#companies' }); await p.waitForTimeout(200);
console.log('company cards:', await p.$$eval('.cos .card', c => c.length), '| products listed:', await p.evaluate(() => document.body.innerText.includes('Products: Parenting book series'))); await shot('companies');
await p.click('[data-pause="account-finder"]'); await p.click('[data-pauseyes="account-finder"]'); await p.waitForTimeout(200);
console.log('pause written:', await p.evaluate(() => WRITES.some(w => w.t === 'companies' && w.v === 'account-finder' && w.row.paused_at)));
await p.evaluate(() => { location.hash = '#controls' }); await p.waitForTimeout(200);
await p.click('[data-flag="stop_all"]'); await p.click('[data-flagyes="stop_all"]'); await p.waitForTimeout(200);
console.log('stop written:', await p.evaluate(() => WRITES.some(w => w.t === 'tharavad_flags' && w.v === 'stop_all' && w.row.value === true)), '| banner:', await p.evaluate(() => !!document.querySelector('.banner.stop'))); await shot('controls');
await p.setViewportSize({ width: 390, height: 844 }); await p.evaluate(() => { location.hash = '#overview' }); await p.waitForTimeout(200);
console.log('phone no sideways scroll:', await p.evaluate(() => document.documentElement.scrollWidth <= 390)); await shot('phone');
await p.emulateMedia({ colorScheme: 'dark' }); await p.waitForTimeout(100); await shot('dark');
console.log('errors', errs);
await b.close();
process.exit(errs.length ? 1 : 0);
