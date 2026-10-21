// Highlights: picked by judgement only when something stands out; done pins the win; pin, swap and hide.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1280,height:900}});
const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('dialog',d=>d.accept());
await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(1500);
const ok=(c,m)=>{if(!c){errs.push('FAIL '+m)}};
await p.evaluate(()=>{window.LOG=[];try{localStorage.removeItem('hub.hlhide')}catch{}hlHide={};
  S.db={doc:path=>({update:async d=>{LOG.push([path,d]);const t=S.tasks.find(x=>'tasks/'+x.id===path);Object.assign(t,d);render()}})};
  const t=T();S.projects=[];S.notes=[];
  S.tasks=[{id:'a',title:'Tidy the inbox',status:'todo',priority:'low',todayDate:t},{id:'b',title:'Reply to Ravi',status:'todo',priority:'med',todayDate:t}];
  S.ready.p=S.ready.t=true;S.view='today';render()});
await p.waitForTimeout(100);
ok(!(await p.$('.hl')),'no card when nothing stands out');
await p.evaluate(()=>{const t=T();S.tasks.push({id:'c',title:'Send the pitch deck',status:'todo',priority:'high',due:t},{id:'d',title:'Plan the offsite',status:'todo',priority:'high',weekOf:week()[0],due:week()[6]});render()});
await p.waitForTimeout(100);
const day=await p.textContent('.hl-half:first-child');
ok(day.includes('Send the pitch deck')&&day.includes('picked for you')&&/due today/i.test(day),'day pick with reasons: '+day);
ok((await p.textContent('.hl')).includes('Plan the offsite'),'week pick shown');
ok(!!(await p.$('.task[data-tid="c"] .hl-star')),'star on the highlighted row');
await p.screenshot({path:'tests/out/hl-today.png'});
// done pins the win
await p.click('.hl-half:first-child [data-quickdone="c"]');await p.waitForTimeout(150);
const lastC=await p.evaluate(()=>LOG.filter(x=>x[0]==='tasks/c').pop()[1]);
ok(lastC.status==='done'&&lastC.highlightDay===await p.evaluate(()=>T()),'done pins highlightDay');
ok((await p.textContent('.hl-half:first-child')).includes("Today's a win"),'won state');
ok((await p.textContent('#toast')).includes("Today's a win"),'win toast');
// pin another for the week from the quick look
await p.evaluate(()=>setPeek('b'));await p.waitForTimeout(100);
await p.click('#peek [data-hlset="week"]');await p.waitForTimeout(150);
ok(await p.evaluate(()=>S.tasks.find(x=>x.id==='b').highlightWeek===week()[0]),'week pinned from quick look');
ok((await p.textContent('.hl')).includes('your pick'),'shows your pick');
await p.evaluate(()=>setPeek(null));
// pick another for the week, then hide it
await p.click('[data-hlpick="week"]');await p.waitForTimeout(100);
await p.click('.hl-c[data-id="d"]');await p.waitForTimeout(150);
ok(await p.evaluate(()=>S.tasks.find(x=>x.id==='d').highlightWeek===week()[0]&&!S.tasks.find(x=>x.id==='b').highlightWeek),'swap moves the pin');
await p.click('[data-hlset="week"][data-id="d"]');await p.waitForTimeout(150);
ok(await p.evaluate(()=>!S.tasks.find(x=>x.id==='d').highlightWeek),'unpin');
await p.click('[data-hlhide="week"]');await p.waitForTimeout(150);
ok(!(await p.textContent('.hl')).includes('Plan the offsite'),'hidden for the week');
// week view and dark phone
await p.evaluate(()=>{S.view='week';render()});await p.waitForTimeout(100);
ok(!!(await p.$('.hl')),'card on week view');
await p.setViewportSize({width:390,height:844});await p.evaluate(()=>{document.documentElement.dataset.theme='dark';S.view='today';render()});await p.waitForTimeout(150);
await p.screenshot({path:'tests/out/hl-phone-dark.png'});
ok(await p.evaluate(()=>document.documentElement.scrollWidth<=390),'no sideways scroll on phone');
console.log('errors', errs);
await b.close(); process.exit(errs.length?1:0);
