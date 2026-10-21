import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1280,height:1000}});
const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('dialog',d=>d.accept());
await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(1200);
await p.evaluate(()=>{
  const t0=T();
  window.DB={projects:[{id:'w',name:'Work',color:'#2F6DB5',area:'Career'}],
    tasks:[{id:'a',title:'Alpha task',project_id:'w',status:'doing',priority:'high',today_date:t0,started_at:new Date().toISOString(),steps:[],activity:[],blocked_by:[]},
           {id:'b',title:'Beta task',project_id:'w',status:'doing',priority:'med',today_date:t0,started_at:new Date().toISOString(),steps:[],activity:[],blocked_by:[]},
           {id:'c',title:'Gamma task',project_id:'w',status:'doing',priority:'med',today_date:t0,started_at:new Date().toISOString(),steps:[],activity:[],blocked_by:[]}],
    notes:[],call_series:[],agenda_items:[]};
  window.DELAY=800;window.FAIL=false;window.REQ=0;
  const slow=v=>new Promise(r=>setTimeout(()=>r(v),DELAY));
  const q=t=>{const o={then:(r,j)=>{REQ++;return slow({data:JSON.parse(JSON.stringify(DB[t]||[])),error:null}).then(r,j)},order:()=>o,limit:()=>o,gte:()=>o};return o};
  sb.rpc=()=>{REQ++;return slow({data:null,error:null})};
  sb.from=t=>{const tb=DB[t]||(DB[t]=[]);return{select:()=>q(t),
    update:row=>({eq:(c,id)=>{REQ++;return slow(null).then(()=>{if(FAIL)return{error:{message:'boom'}};const r=tb.find(x=>x.id===id);if(r)Object.assign(r,row);return{error:null}})}}),
    upsert:row=>{REQ++;return slow(null).then(()=>{const r=tb.find(x=>x.id===row.id);if(r)Object.assign(r,row);else tb.push({...row});return{error:null}})},
    delete:()=>({eq:(c,id)=>{REQ++;return slow(null).then(()=>{const i=tb.findIndex(x=>x.id===id);if(i>=0)tb.splice(i,1);return{error:null}})}}),
    insert:row=>({select:()=>({single:()=>{REQ++;const r={id:'new'+tb.length,...row};return slow(null).then(()=>{tb.push(r);return{data:{...r},error:null}})}})})}};
  refresh();
});
await p.waitForTimeout(3500);
const isDone=id=>p.evaluate(id=>{const el=document.querySelector(`.task[data-tid="${id}"]`);return !!el&&el.classList.contains('done')},id);
const where=id=>p.evaluate(id=>{const el=document.querySelector(`.task[data-tid="${id}"]`);return el?el.closest('section')?.querySelector('h2')?.textContent.trim().split(' ')[0]:'gone'},id);
// 1. speed: click done on a "doing" task and time until the UI shows it done
console.log('before:', await where('a'));
const t1=Date.now(); await p.click('.task[data-tid="a"] [data-done]');
await p.waitForFunction(()=>{const el=document.querySelector('.task[data-tid="a"]');return el&&el.classList.contains('done')},null,{timeout:5000});
console.log('UI showed done after', Date.now()-t1, 'ms (each request takes 800 ms)');
await p.waitForTimeout(5000);
console.log('after sync settles: a in', await where('a'), '| db status', await p.evaluate(()=>DB.tasks.find(x=>x.id==='a').status));
// 2. failure: save fails -> task goes back + message
await p.evaluate(()=>{FAIL=true});
await p.click('.task[data-tid="b"] [data-done]');
await p.waitForTimeout(150); console.log('optimistic during failing save: b done =', await isDone('b'));
await p.waitForTimeout(1500); console.log('after failed save: b done =', await isDone('b'), '| toast:', await p.textContent('#toast'));
await p.evaluate(()=>{FAIL=false});
// 3. a sync already in flight must not overwrite a newer click
await p.evaluate(()=>{refresh()}); await p.waitForTimeout(100);
await p.click('.task[data-tid="c"] [data-done]');
await p.waitForTimeout(950); console.log('sync finished mid-save: c still done =', await isDone('c'));
await p.waitForTimeout(5000); console.log('settled: c done =', await isDone('c'), '| db', await p.evaluate(()=>DB.tasks.find(x=>x.id==='c').status));
// 4. undo is instant too
console.log('undo stack:', await p.evaluate(()=>JSON.stringify(HIST.undo.map(g=>g.ops.map(o=>o.kind+':'+o.id+':'+JSON.stringify(o.before))))));
const t4=Date.now(); p.evaluate(()=>{HIST.run('undo')}); 
await p.waitForFunction(()=>{const el=document.querySelector('.task[data-tid="c"]');return el&&!el.classList.contains('done')},null,{timeout:5000});
console.log('undo showed after', Date.now()-t4, 'ms');
await p.waitForTimeout(4000); console.log('db after undo:', await p.evaluate(()=>DB.tasks.find(x=>x.id==='c').status));
console.log('errors', errs);
await b.close();
