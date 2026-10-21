import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1280,height:900}});
const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('dialog',d=>d.accept());
await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(1500);
await p.evaluate(()=>{window.LOG=[];S.db={doc:path=>({update:async d=>{LOG.push([path,d]);const t=S.tasks.find(x=>'tasks/'+x.id===path);Object.assign(t,d);render()},delete:async()=>{LOG.push([path,'delete']);S.tasks=S.tasks.filter(x=>'tasks/'+x.id!==path);render()}})};
 const mk=i=>({id:'s'+i,title:'Idea '+i,status:'suggested',priority:'med'});S.projects=[];S.tasks=[1,2,3,4,5,6].map(mk);S.notes=[];S.ready.p=S.ready.t=true;S.view='suggested';render()});
for (const sel of ['[data-done="s1"]','[data-stoday="s2"]','[data-sweek="s3"]','[data-sstart="s4"]','[data-quickdone="s5"]','[data-dismiss="s6"]']) { const id=sel.match(/"(s\d)"/)[1]; const onRow=await p.$('#view '+sel); if(!onRow){await p.evaluate(i=>setPeek(i),id);await p.waitForTimeout(100);await p.click('#peek '+sel)}else await p.click('#view '+sel); await p.waitForTimeout(150); }
console.log(JSON.stringify(await p.evaluate(()=>LOG.map(([a,d])=>[a,typeof d==='string'?d:Object.keys(d).filter(k=>k!=='updatedAt').map(k=>k+'='+(k.endsWith('At')?'set':d[k])).join(',')]))), errs);
await b.close();
