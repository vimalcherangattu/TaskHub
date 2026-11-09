import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1280,height:900}});
const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('dialog',d=>d.accept());
await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(1500);
await p.evaluate(()=>{window.LOG=[];S.db={doc:path=>({update:async d=>{LOG.push([path,d]);const t=S.tasks.find(x=>'tasks/'+x.id===path);Object.assign(t,d);render()},delete:async()=>{LOG.push([path,'delete']);S.tasks=S.tasks.filter(x=>'tasks/'+x.id!==path);render()}})};
 const mk=i=>({id:'s'+i,title:'Idea '+i,status:'suggested',priority:'med'});S.projects=[];S.tasks=[1,2,3,4,5,6].map(mk);S.notes=[];S.ready.p=S.ready.t=true;S.view='suggested';render()});
// Inbox (9 Nov): suggestions are decided one at a time, by key or button
await p.evaluate(()=>{S.view='inbox';render()});await p.waitForTimeout(150);
console.log('one card at a time:', await p.evaluate(()=>document.querySelectorAll('.in-card').length===1&&/Idea 1/.test(document.querySelector('.in-card h2').textContent)));
for (const k of ['y','t','w','n','d']) { await p.keyboard.press(k); await p.waitForTimeout(150); }
await p.click('#view [data-in="drop"]'); await p.waitForTimeout(150);
console.log('pile clear:', await p.evaluate(()=>!!document.querySelector('.in-empty')));
console.log(JSON.stringify(await p.evaluate(()=>LOG.map(([a,d])=>[a,typeof d==='string'?d:Object.keys(d).filter(k=>!['updatedAt','activity'].includes(k)).map(k=>k+'='+(k.endsWith('At')?'set':d[k])).join(',')]))));
console.log('errors', errs);
await b.close();
