// Tharavad control room (tharavad.html): renders every view from an in-memory mock, and every button writes the
// right row (alarm Seen, ask Done / Can't do, proposal Approve / Park / Reject, Veto, Pause, Stop and Away, Tell Tharavad
// inserts an order or an idea; a link shared to the app opens the dialog in Idea mode). Phone width never scrolls sideways; light and
// dark screenshots go to tests/out/. Never touches the real database.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const errs = [], fails = [];
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
p.on('pageerror', e => errs.push(e.message));
p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|ERR_|net::/.test(m.text())) errs.push('console: ' + m.text()) });
const ok = (name, v) => { console.log(name + ':', v); if (v !== true) fails.push(name) };
const watch = pg => { pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|ERR_|net::/.test(m.text())) errs.push('console: ' + m.text()) }) };
await p.goto(new URL('../tharavad.html', import.meta.url).href); await p.waitForTimeout(800);
const mock = () => {
  const mk = off => { const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })); d.setDate(1); d.setMonth(d.getMonth() - off); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01` };
  const m = mk(0), ago = h => new Date(Date.now() - h * 36e5).toISOString();
  window.DB = {
    tharavad_flags: [{ key: 'stop_all', value: false }, { key: 'away', value: false }],
    projects: [{ id: 'group-hq', name: 'Tharavad' }, { id: 'publishing', name: 'Publishing', parent_id: 'group-hq' }, { id: 'parenting-series', name: 'Parenting book series', parent_id: 'publishing' }, { id: 'account-finder', name: 'Small Fish', parent_id: 'group-hq' }, { id: 'etsy-shop', name: 'Etsy digital products', parent_id: 'group-hq' }],
    companies: [{ project_id: 'group-hq', kind: 'group', budget_cap_monthly: 20000, currency: 'INR' },
      { project_id: 'publishing', kind: 'company', brand_mode: 'studio', stage: 'running', tier: 1, budget_cap_monthly: 2000, currency: 'INR', repo: 'vimal/publishing',
        charter: { purpose: 'Sell useful books under studio imprints', customer: 'Parents of toddlers in India', motion: 'KDP + Shorts', scope: ['Parenting', 'Activity books'], not_scope: 'Fiction' },
        scorecard: { primary: { metric: 'Books sold a month', target_90d: 300 }, supporting: [{ metric: 'Shorts views', target: 50000 }, 'Review average 4.3+'], guardrails: ['Cost under cap', { metric: 'Refund rate', limit: '2%' }], contribution: 'Positive by month 4', review: { date: '2026-12-15', rule: 'Kill a series under 30 sales by day 60' } } },
      { project_id: 'parenting-series', kind: 'product', stage: 'running' },
      { project_id: 'account-finder', kind: 'company', stage: 'running', budget_cap_monthly: 150, currency: 'USD', scorecard: { primary: { metric: 'Paying customers', target_90d: 5 } } },
      { project_id: 'etsy-shop', kind: 'test', stage: 'pilot', test_ends_on: '2026-12-31', kill_questions: ['Ten sales by 31 Dec?', 'Under 2 h of your time a month?'] }],
    unit_economics: [
      { project_id: 'group-hq', month: mk(3), revenue_inr: 0, cost_inr: 4100, contribution_inr: -4100 }, { project_id: 'group-hq', month: mk(2), revenue_inr: 1800, cost_inr: 6900, contribution_inr: -5100 },
      { project_id: 'group-hq', month: mk(1), revenue_inr: 9400, cost_inr: 8200, contribution_inr: 1200 }, { project_id: 'group-hq', month: m, revenue_inr: 6200, cost_inr: 12672, contribution_inr: -6472 },
      { project_id: 'publishing', month: mk(1), revenue_inr: 9400, cost_inr: 1500, contribution_inr: 7900 }, { project_id: 'publishing', month: m, revenue_inr: 6200, cost_inr: 1400, contribution_inr: 4800 },
      { project_id: 'account-finder', month: m, revenue_inr: 0, cost_inr: 11272, contribution_inr: -11272 }],
    agent_health: [{ id: 'ktn', name: 'KTN weekly run', level: 'product', project_id: 'parenting-series', cadence: 'Wed 09:00', status: 'active', health: 'green', runs_7d: 1, last_evidence: ago(20), last_summary: 'Ep 5 + 6 Shorts scheduled' },
      { id: 'kdp', name: 'KDP draft prep', level: 'company', project_id: 'publishing', cadence: 'daily', status: 'active', health: 'red', fails_in_row: 2, last_evidence: ago(80) },
      { id: 'karanavar', name: 'Karanavar', level: 'group', project_id: 'group-hq', cadence: 'Mon 07:41', status: 'active', health: 'green', last_evidence: ago(30) },
      { id: 'sf', name: 'Small Fish company agent', level: 'company', project_id: 'account-finder', status: 'planned', health: 'planned' }],
    agents: [{ id: 'kdp', name: 'KDP draft prep', note: 'Prepares manuscripts for KDP', handoff: 'Pick up from the draft folder.\nNever press Publish.', version: 3 }],
    runs: [{ id: 1, agent_id: 'ktn', started_at: ago(20), ended_at: ago(19), status: 'succeeded', summary: 'Ep 5 + 6 Shorts scheduled', cost_usd: 1.2 },
      { id: 2, agent_id: 'kdp', started_at: ago(50), ended_at: ago(50), status: 'failed', error: 'Login expired' }, { id: 3, agent_id: 'kdp', started_at: ago(74), status: 'blocked', summary: 'Waiting on login' },
      { id: 4, agent_id: 'karanavar', started_at: ago(30), status: 'succeeded', summary: 'Board report filed' }, { id: 9, agent_id: 'ktn', started_at: ago(24 * 30), status: 'succeeded', summary: 'old run' }],
    asks: [{ id: 7, project_id: 'etsy-shop', type: 'login', title: 'Create the Etsy shop', why: 'Nothing can be listed', unblocks: 'Christmas bundle', steps: ['Open Etsy', 'Create app'], est_minutes: 20, deadline: new Date(Date.now() + 864e5).toISOString(), fallback: 'Wait for January', status: 'open' },
      { id: 8, project_id: 'publishing', type: 'payment', title: 'Renew the ISBN block', est_minutes: 5, deadline: new Date(Date.now() + 3600e3).toISOString(), fallback: 'Use free KDP ISBNs', status: 'open' }],
    alarms: [{ id: 3, kind: 'silent', project_id: 'publishing', agent_id: 'kdp', message: 'KDP draft prep has not reported', created_at: ago(2), acked_at: null }],
    proposals: [{ id: 11, agent_id: 'karanavar', project_id: 'publishing', kind: 'product', title: 'Toddler sleep activity book', score: 7.8, scores: { demand: 8, fit: 7 }, evidence: 'Search volume is **rising**.\n- 40 competitors\n- Top seller ₹299', kill_questions: ['30 sales by day 60?'], cost_cap: 3000, status: 'new', created_at: ago(5) },
      { id: 12, agent_id: 'karanavar', project_id: 'etsy-shop', kind: 'test', title: 'Printable chore charts', score: 6.1, status: 'new', created_at: ago(6) },
      { id: 13, agent_id: 'karanavar', project_id: 'etsy-shop', kind: 'test', title: 'Wedding planners', score: 5.2, status: 'new', created_at: ago(7) },
      { id: 14, agent_id: 'karanavar', kind: 'company', title: 'B2B newsletter', score: 4, status: 'parked', created_at: ago(90) }],
    orders: [{ id: 21, from_who: 'vimal', project_id: 'publishing', request: 'Get the parenting series into two Bengaluru bookshops', priority: 'high', status: 'in_progress', agent_id: 'kdp', evidence: [{ label: 'Shop list', url: 'https://example.com/list' }], created_at: ago(30) },
      { id: 22, from_who: 'vimal', request: 'Draft a privacy page for Small Fish', priority: 'low', status: 'done', result: 'Live on the site', created_at: ago(100), closed_at: ago(60) },
      { id: 23, kind: 'idea', from_who: 'vimal', request: 'AI dubbing for Shorts in Hindi', link: 'https://example.com/dub-tool', priority: 'low', status: 'done', agent_id: 'karanavar', verdict: 'What: a dubbing service for short videos.\nScore: 6/10, cheap to try.\nNext: test on two KTN Shorts.', created_at: ago(12) },
      { id: 24, kind: 'idea', from_who: 'vimal', request: 'Sticker packs on WhatsApp', link: null, priority: 'low', status: 'new', created_at: ago(3) }],
    experiments: [{ id: 31, project_id: 'publishing', agent_id: 'ktn', channel: 'YouTube Shorts', hypothesis: 'Shorts lift book sales', metric: 'Sales from Shorts link', sample: '6 Shorts', pass_bar: '15 sales', kill_bar: '3 sales', starts_on: ago(24 * 7), ends_on: new Date(Date.now() + 7 * 864e5).toISOString(), status: 'running' }],
    agent_decisions: [{ id: 41, agent_id: 'kdp', project_id: 'publishing', call: 'Drop the price of book 2 to ₹199', rights: 'veto', evidence: ['https://example.com/sales'], expected: '+20% sales', check_on: '2026-12-01', vetoed: false, created_at: ago(10) },
      { id: 42, agent_id: 'ktn', project_id: 'parenting-series', call: 'Post Shorts at 19:00', rights: 'alone', vetoed: false, correct: true, created_at: ago(200) }],
    notes: [{ title: 'Board report 23 Nov', body: '# Week 47\n**Money:** zero revenue.\n\n## Wins\n- KTN shipped two Shorts\n- Etsy test approved\n\n## Asks\n1. Create the Etsy shop', created_at: ago(40), tags: ['weekly-report'] },
      { title: 'Audit: KDP agent', body: 'Two failed runs in a row. **Fix:** refresh login.', created_at: ago(60), tags: ['audit'] }],
    library_cards: [{ domain: 'pricing', claim: 'Anchor with a premium tier', applies_when: 'Three or more tiers', not_when: 'Single product', source: 'Monetizing Innovation', source_url: 'https://example.com/mi', confidence: 'high', kind: 'canon', status: 'active' },
      { domain: 'youtube', claim: 'Shorts posted at 19:00 IST got 2x views', source: 'KTN run 12', kind: 'case', status: 'active' }],
    commons_assets: [{ kind: 'account', name: 'KDP account', owner_unit: 'publishing', identity_bound: true, used_by: ['publishing', 'parenting-series'], location: 'kdp.amazon.com', status: 'active' },
      { kind: 'brand', name: 'Studio imprint logo', owner_unit: 'publishing', identity_bound: false, used_by: ['publishing'], status: 'active' }]
  };
  window.WRITES = [];
  const q = t => { let rows = JSON.parse(JSON.stringify(DB[t] || [])); const o = { then: (r, j) => Promise.resolve({ data: rows, error: null }).then(r, j) };
    for (const k of ['select', 'order', 'limit']) o[k] = () => o;
    o.eq = (c, v) => { rows = rows.filter(x => x[c] === v); return o }; o.is = (c, v) => { rows = rows.filter(x => (x[c] ?? null) === v); return o };
    o.in = (c, vs) => { rows = rows.filter(x => vs.includes(x[c])); return o }; o.gte = (c, v) => { rows = rows.filter(x => x[c] >= v); return o };
    o.contains = (c, vs) => { rows = rows.filter(x => vs.every(v => (x[c] || []).includes(v))); return o }; return o };
  sb.from = t => ({ select: () => q(t),
    insert: row => { WRITES.push({ t, row, op: 'insert' }); (DB[t] ||= []).unshift({ id: 900 + WRITES.length, status: 'new', created_at: new Date().toISOString(), ...row }); return Promise.resolve({ error: null }) },
    update: row => ({ eq: (c, v) => { WRITES.push({ t, row, c, v }); const r = (DB[t] || []).find(x => x[c] === v); if (r) Object.assign(r, row);
      if (t === 'asks' && row.status && row.status !== 'open') DB.asks = DB.asks.filter(x => x.id !== v); if (t === 'alarms' && row.acked_at) DB.alarms = DB.alarms.filter(x => x.id !== v);
      return Promise.resolve({ error: null }) } }) });
  sb.channel = () => ({ on() { return this }, subscribe() { return this } });
  TH.start();
};
await p.evaluate(mock);
await p.waitForTimeout(500);
const out = n => new URL(`./out/tharavad-${n}.png`, import.meta.url).pathname;
const shot = async n => { await p.evaluate(() => { document.getElementById('toast').hidden = true }); await p.screenshot({ path: out(n), fullPage: true }) };
const go = async h => { await p.evaluate(h => { location.hash = h }, h); await p.waitForTimeout(200) };
const has = t => p.evaluate(t => document.getElementById('view').innerText.includes(t), t);
const wrote = f => p.evaluate(f => WRITES.some(new Function('w', 'return ' + f)), f);

// Home
ok('home headline counts 7 things', await has('7 things need you'));
ok('home money this month', await has('−₹6,472'));
ok('home chart drawn (4 months)', await p.$$eval('.chart .c-dot', d => d.length === 4));
ok('home report rendered as markdown', await p.evaluate(() => !!document.querySelector('.report h3') && document.querySelectorAll('.report li').length === 3 && !!document.querySelector('.report strong')));
ok('queue badge 7', (await p.textContent('#qn')) === '7');
ok('updated stamp', /updated \d\d:\d\d/.test(await p.textContent('#stamp')));
await shot('overview');

// Family tree
await go('#tree');
ok('tree: root + 3 companies', await p.evaluate(() => !!document.querySelector('.org-root') && document.querySelectorAll('.org-co').length === 3));
ok('tree: product inside its company', await p.evaluate(() => [...document.querySelectorAll('.org-co')].some(c => c.innerText.includes('Publishing') && c.querySelector('.kid')?.innerText.includes('Parenting book series'))));
ok('tree: one dot per agent', await p.$$eval('.org .dot', d => d.length === 4));
await shot('tree');

// Company page via click
await p.click('.org-co h3 a[href="#co/publishing"]'); await p.waitForTimeout(200);
ok('company route', await p.evaluate(() => location.hash === '#co/publishing'));
ok('company: charter, scorecard, guardrails', await has('Sell useful books') && await has('Books sold a month') && await has('Refund rate: limit 2%') && await has('Kill a series under 30 sales'));
ok('company: repo link', await p.evaluate(() => document.querySelector('a[href="https://github.com/vimal/publishing"]') !== null));
ok('company: agents, experiment, decisions, asks, orders', await has('KDP draft prep') && await has('Shorts lift book sales') && await has('Drop the price of book 2') && await has('Renew the ISBN block') && await has('two Bengaluru bookshops'));
await shot('company');
await p.click('[data-veto="41"]'); await p.waitForTimeout(100);
ok('veto asks to confirm', await p.evaluate(() => !!document.querySelector('[data-vetoyes="41"]') && !WRITES.some(w => w.t === 'agent_decisions')));
await p.click('[data-vetoyes="41"]'); await p.waitForTimeout(250);
ok('veto written', await wrote("w.t==='agent_decisions'&&w.v===41&&w.row.vetoed===true"));
await p.click('[data-pause="publishing"]'); await p.waitForTimeout(100);
ok('pause asks to confirm', await p.evaluate(() => !!document.querySelector('[data-pauseyes="publishing"]') && !WRITES.some(w => w.t === 'companies')));
await p.click('[data-pauseyes="publishing"]'); await p.waitForTimeout(250);
ok('pause written', await wrote("w.t==='companies'&&w.v==='publishing'&&w.row.paused_at"));
ok('paused shown, resume offered', await has('Paused since') && (await p.textContent('[data-pause="publishing"]')) === 'Resume');
await go('#co/etsy-shop');
ok('test company shows kill questions', await has('Ten sales by 31 Dec?') && await p.evaluate(() => document.getElementById('view').textContent.includes('Kill questions')));
await go('#co/nope');
ok('unknown unit empty state', await has("There's no unit called"));

// Queue
await go('#queue'); await shot('queue');
ok('queue order: alarm, asks by deadline, proposals, veto', await p.evaluate(() => { const t = document.getElementById('view').innerText; return t.indexOf('KDP draft prep has not reported') < t.indexOf('Renew the ISBN block') && t.indexOf('Renew the ISBN block') < t.indexOf('Create the Etsy shop') && t.indexOf('Create the Etsy shop') < t.indexOf('Toddler sleep activity book') }));
await p.click('[data-ack="3"]'); await p.waitForTimeout(250);
ok('alarm acked', await wrote("w.t==='alarms'&&w.v===3&&w.row.acked_at"));
await p.click('[data-drop="7"]'); await p.waitForTimeout(100);
ok("can't do shows fallback before writing", await has('Wait for January') && await p.evaluate(() => !WRITES.some(w => w.t === 'asks')));
await p.click('[data-cancel]'); await p.click('[data-done="7"]'); await p.waitForTimeout(250);
ok('ask done', await wrote("w.t==='asks'&&w.v===7&&w.row.status==='done'&&w.row.done_at"));
await p.click('[data-drop="8"]'); await p.click('[data-dropyes="8"]'); await p.waitForTimeout(250);
ok('ask dropped', await wrote("w.t==='asks'&&w.v===8&&w.row.status==='dropped'"));
await p.click('[data-prop="yes"][data-pid="11"]'); await p.waitForTimeout(250);
ok('proposal approved', await wrote("w.t==='proposals'&&w.v===11&&w.row.status==='yes'&&w.row.decided_at"));
await p.click('[data-prop="no"][data-pid="12"]'); await p.waitForTimeout(250);
ok('proposal rejected', await wrote("w.t==='proposals'&&w.v===12&&w.row.status==='no'"));
await p.click('[data-prop="parked"][data-pid="13"]'); await p.waitForTimeout(250);
ok('proposal parked', await wrote("w.t==='proposals'&&w.v===13&&w.row.status==='parked'"));
ok('queue empties with empty states', await has('Nothing waiting on you') && await has('No proposals waiting') && await has('No calls in a veto window'));

// Agents
await go('#agents');
ok('agents grouped by level', await p.$$eval('.lvl > .eyebrow', e => e.map(x => x.textContent.split(' ·')[0]).join('|')) === 'Group|Company|Product');
ok('timeline: 14 days, old run excluded', await p.evaluate(() => document.querySelectorAll('table.tl thead th').length === 15 && document.querySelectorAll('table.tl td.r-failed').length === 1 && !document.body.innerText.includes('old run')));
await p.click('[data-filter="attention"]'); await p.waitForTimeout(100);
ok('filter: needs a look shows only red', await p.$$eval('details.agent', d => d.length === 1 && d[0].innerText.includes('KDP draft prep')));
await p.click('details.agent summary'); await p.waitForTimeout(100);
ok('handoff on expand', await has('Never press Publish.'));
await shot('agents');
await p.click('[data-filter="all"]');

// Orders + Tell Tharavad
await go('#orders');
ok('orders listed with evidence', await has('two Bengaluru bookshops') && await p.evaluate(() => !!document.querySelector('a[href="https://example.com/list"]')));
await p.fill('#ordText', 'Find three bulk buyers before Christmas');
await p.selectOption('#ordUnit', 'publishing'); await p.click('[data-prio="high"]');
ok('typed draft survives a background refresh', await p.evaluate(async () => { await TH.load(); return document.getElementById('ordText').value === 'Find three bulk buyers before Christmas' }));
await p.click('#ordForm button[type="submit"]'); await p.waitForTimeout(300);
ok('order inserted', await wrote("w.t==='orders'&&w.op==='insert'&&w.row.kind==='order'&&w.row.from_who==='vimal'&&w.row.project_id==='publishing'&&w.row.priority==='high'&&w.row.request==='Find three bulk buyers before Christmas'"));
ok('new order shows as New', await has('Find three bulk buyers'));
await shot('orders');
await go('#library');
await p.click('#tellOpen'); await p.waitForTimeout(150);
await p.fill('#dlgText', 'Pause the Etsy ads'); await p.click('#dlgForm button[type="submit"]'); await p.waitForTimeout(300);
ok('home open orders leave ideas out', await (async () => { await go('#overview'); return await has('two Bengaluru bookshops') && !(await has('AI dubbing for Shorts')) })());
await go('#library');
ok('Tell Tharavad dialog inserts from any view', await wrote("w.t==='orders'&&w.row.request==='Pause the Etsy ads'&&w.row.project_id===null&&w.row.priority==='med'") && await p.evaluate(() => !document.getElementById('tellDlg').open));

// Ideas: render with verdict, filter chips, insert payload
await go('#orders');
ok('ideas section lists both ideas', await p.$$eval('.card.idea', c => c.length === 2) && await has('AI dubbing for Shorts in Hindi') && await has('Sticker packs on WhatsApp'));
ok('idea link opens in a new tab safely', await p.evaluate(() => { const a = document.querySelector('.card.idea a[href="https://example.com/dub-tool"]'); return !!a && a.target === '_blank' && /noopener/.test(a.rel) }));
ok('idea shows who evaluates it, or waiting', await p.evaluate(() => { const c = [...document.querySelectorAll('.card.idea')]; return c.some(x => x.innerText.includes('Evaluated by Karanavar')) && c.some(x => x.innerText.includes('Waiting for the runner')) }));
ok('verdict shown with line breaks kept', await p.evaluate(() => { const v = document.querySelector('.card.idea .verdict'); return !!v && getComputedStyle(v).whiteSpace === 'pre-wrap' && v.textContent.includes('cheap to try.\nNext: test on two KTN Shorts.') && v.getBoundingClientRect().height > 60 }));
await p.click('[data-ofilter="ideas"]'); await p.waitForTimeout(100);
ok('Ideas chip hides orders', await p.evaluate(() => document.querySelectorAll('.card.idea').length === 2 && !document.getElementById('view').innerText.includes('Open orders')));
await p.click('[data-ofilter="orders"]'); await p.waitForTimeout(100);
ok('Orders chip hides ideas', await p.evaluate(() => document.querySelectorAll('.card.idea').length === 0 && document.getElementById('view').innerText.includes('Open orders')));
await p.click('[data-ofilter="all"]');
await p.click('#ordForm [data-kind="idea"]'); await p.waitForTimeout(100);
ok('Idea mode: link field, new label, no priority', await p.evaluate(() => !!document.getElementById('ordLink') && document.querySelector('label[for="ordText"]').textContent === 'What caught your eye?' && document.querySelector('label[for="ordLink"]').textContent === 'Link (optional)' && !document.querySelector('#ordForm [data-prio]') && document.querySelector('#ordForm [data-kind="idea"]').getAttribute('aria-checked') === 'true'));
await p.fill('#ordLink', 'https://example.com/printables'); await p.fill('#ordText', 'Printable planners are trending on Pinterest');
ok('typed idea survives a background refresh', await p.evaluate(async () => { await TH.load(); return document.getElementById('ordLink').value === 'https://example.com/printables' && document.getElementById('ordText').value.startsWith('Printable') }));
await p.click('#ordForm button[type="submit"]'); await p.waitForTimeout(300);
ok('idea inserted with the right payload', await p.evaluate(() => { const w = WRITES.filter(w => w.t === 'orders' && w.op === 'insert').pop().row;
  return JSON.stringify(w) === JSON.stringify({ from_who: 'vimal', kind: 'idea', link: 'https://example.com/printables', request: 'Printable planners are trending on Pinterest', project_id: null, priority: 'low' }) }));
ok('new idea shows under Ideas, form back to Order', await p.evaluate(() => document.querySelectorAll('.card.idea').length === 3 && document.querySelector('#ordForm [data-kind="order"]').getAttribute('aria-checked') === 'true' && !document.getElementById('ordLink')));
await p.click('#ordForm [data-kind="idea"]'); await p.fill('#ordLink', 'example.com/no-scheme'); await p.click('#ordForm button[type="submit"]'); await p.waitForTimeout(300);
ok('link-only idea: request falls back to the link, scheme added', await wrote("w.t==='orders'&&w.row.kind==='idea'&&w.row.link==='https://example.com/no-scheme'&&w.row.request==='https://example.com/no-scheme'"));
ok('share parser: url param wins, text kept', await p.evaluate(() => { const r = TH.parseShare(new URLSearchParams('url=https%3A%2F%2Fa.com%2Fx&text=Nice+tool&title=A')); return r.link === 'https://a.com/x' && r.request === 'A\nNice tool' }));
await shot('ideas');

// Library
await go('#library');
ok('library cards by domain, assets by kind', await p.$$eval('.lvl .eyebrow', e => e.map(x => x.textContent).join('|') === 'pricing · 1|youtube · 1|account · 1|brand · 1'));
ok('identity-bound flagged', await has('identity-bound'));
await p.fill('#libQ', 'shorts'); await p.waitForTimeout(100);
ok('library filter', await p.evaluate(() => [...document.querySelectorAll('[data-hay]')].filter(e => !e.hidden).length === 1));
await p.fill('#libQ', ''); await shot('library');

// Controls
await go('#controls');
await p.click('[data-flag="stop_all"]'); await p.waitForTimeout(100);
ok('stop asks to confirm', await p.evaluate(() => !!document.querySelector('[data-flagyes="stop_all"]') && !WRITES.some(w => w.t === 'tharavad_flags')));
await p.click('[data-flagyes="stop_all"]'); await p.waitForTimeout(250);
ok('stop written + banner', await wrote("w.t==='tharavad_flags'&&w.v==='stop_all'&&w.row.value===true") && await p.evaluate(() => !!document.querySelector('.banner.stop') && !!document.querySelector('.estop.on')));
await p.click('[data-flag="away"]'); await p.click('[data-flagyes="away"]'); await p.waitForTimeout(250);
ok('away written', await wrote("w.t==='tharavad_flags'&&w.v==='away'&&w.row.value===true"));
await shot('controls');

// Phone: no sideways scroll on any view; light + dark
await p.setViewportSize({ width: 390, height: 844 });
const views = ['#overview', '#queue', '#tree', '#co/publishing', '#agents', '#orders', '#library', '#controls'];
const wide = [];
for (const v of views) { await go(v); if (await p.evaluate(() => document.documentElement.scrollWidth > 390)) wide.push(v) }
ok('phone: no sideways scroll on any view', wide.length === 0 || wide.join(','));
ok('phone: buttons at least 44px', await p.evaluate(() => [...document.querySelectorAll('#view .btn, nav a')].filter(e => e.offsetParent).every(e => e.getBoundingClientRect().height >= 44)));
for (const v of ['overview', 'tree', 'co/publishing', 'queue', 'agents', 'orders']) { await go('#' + v); await shot('phone-' + v.replace('/', '-')) }
const ideaDlg = async () => { await p.click('#tellOpen'); await p.waitForTimeout(150); await p.click('#tellDlgBody [data-kind="idea"]'); await p.waitForTimeout(100); await p.fill('#dlgLink', 'https://example.com/a-very-long-path/that-keeps-going/and-going?utm_source=share&utm_medium=android'); await p.fill('#dlgText', 'Saw this on a podcast'); await p.evaluate(() => { document.getElementById('toast').hidden = true }) };
await go('#overview'); await ideaDlg();
ok('phone: idea dialog fits, no sideways scroll', await p.evaluate(() => { const d = document.getElementById('tellDlg').getBoundingClientRect(); return document.documentElement.scrollWidth <= 390 && d.right <= 390 && d.left >= 0 && document.getElementById('tellDlg').scrollWidth <= document.getElementById('tellDlg').clientWidth }));
ok('phone: idea dialog targets at least 44px', await p.evaluate(() => [...document.querySelectorAll('#tellDlg .btn, #tellDlg .seg button, #tellDlg select, #dlgLink')].filter(e => e.offsetParent).every(e => e.getBoundingClientRect().height >= 44)));
await p.screenshot({ path: out('phone-idea-dialog') });
await p.click('#tellClose');
await p.emulateMedia({ colorScheme: 'dark' }); await p.waitForTimeout(100);
for (const v of ['overview', 'tree', 'co/publishing', 'controls', 'orders']) { await go('#' + v); await shot('phone-dark-' + v.replace('/', '-')) }
await go('#overview'); await ideaDlg(); await p.screenshot({ path: out('phone-dark-idea-dialog') }); await p.click('#tellClose');
await p.setViewportSize({ width: 1280, height: 900 });
for (const v of ['overview', 'tree', 'co/publishing', 'agents', 'orders', 'library']) { await go('#' + v); await shot('dark-' + v.replace('/', '-')) }
await p.evaluate(() => document.documentElement.setAttribute('data-theme', 'light')); await go('#overview');
ok('explicit light theme wins over dark system', await p.evaluate(() => getComputedStyle(document.body).backgroundColor === 'rgb(244, 246, 244)'));

// Share target: a link shared from the phone, before sign-in, opens Tell Tharavad in Idea mode once signed in
const s2 = await b.newPage({ viewport: { width: 390, height: 844 } }); watch(s2);
await s2.goto(new URL('../tharavad.html', import.meta.url).href + '?title=' + encodeURIComponent('Cool tool') + '&text=' + encodeURIComponent('Look at this https://example.com/tool?x=1 nice') + '#orders'); await s2.waitForTimeout(800);
ok('share: query string cleared, hash kept', await s2.evaluate(() => location.search === '' && location.hash === '#orders'));
ok('share: stashed while signed out', await s2.evaluate(() => !!document.getElementById('loginForm') && JSON.parse(localStorage.getItem('tharavad.share.v1') || 'null')?.link === 'https://example.com/tool?x=1'));
await s2.evaluate(mock); await s2.waitForTimeout(500);
ok('share: dialog opens in Idea mode after sign-in', await s2.evaluate(() => document.getElementById('tellDlg').open && document.querySelector('#tellDlgBody [data-kind="idea"]').getAttribute('aria-checked') === 'true'));
ok('share: link and words prefilled', await s2.evaluate(() => document.getElementById('dlgLink').value === 'https://example.com/tool?x=1' && document.getElementById('dlgText').value === 'Cool tool\nLook at this nice'));
ok('share: stash used once', await s2.evaluate(() => localStorage.getItem('tharavad.share.v1') === null));
await s2.evaluate(() => { document.getElementById('toast').hidden = true }); await s2.screenshot({ path: out('phone-share-dialog') });
await s2.click('#dlgForm button[type="submit"]'); await s2.waitForTimeout(300);
ok('share: idea inserted', await s2.evaluate(() => WRITES.some(w => w.t === 'orders' && w.row.kind === 'idea' && w.row.link === 'https://example.com/tool?x=1' && w.row.priority === 'low' && w.row.from_who === 'vimal')));

if (fails.length) console.log('FAILED checks:', fails);
console.log('errors', errs);
await b.close();
process.exit(errs.length || fails.length ? 1 : 0);
