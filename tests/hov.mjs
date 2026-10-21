import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1280,height:900}});
const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('dialog',d=>d.accept());
await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(1500);
await p.evaluate(()=>{
  const t0=T();
  window.DB={projects:[{id:'w',name:'Work',color:'#2F6DB5',area:'Career'}],
    tasks:[{id:'a',title:'A: Get landlord reference letter',project_id:'w',status:'todo',priority:'med',due:(()=>{const d=new Date();d.setDate(d.getDate()+7);return d.toISOString().slice(0,10)})()},
 {id:'b',title:'B: Submit rental application',project_id:'w',status:'todo',priority:'high',due:t0,blocked_by:['a']},
 {id:'c',title:'C: Book movers',project_id:'w',status:'todo',priority:'med',due:t0,blocked_by:['b']},
 {id:'d',title:'Pay electricity bill',project_id:'w',status:'todo',priority:'med',today_date:t0}],notes:[]};
  let n=0;
  sb.from=t=>{const tb=DB[t]||(DB[t]=[]);return{
    select:()=>{const o={then:(r,j)=>Promise.resolve({data:JSON.parse(JSON.stringify(tb)),error:null}).then(r,j),order:()=>o,limit:()=>o,gte:()=>o};return o},
    update:row=>({eq:(c,id)=>{const r=tb.find(x=>x.id===id);if(r)Object.assign(r,row);return Promise.resolve({error:null})}}),
    upsert:row=>{const r=tb.find(x=>x.id===row.id);if(r)Object.assign(r,row);else tb.push({...row});return Promise.resolve({error:null})},
    delete:()=>({eq:(c,id)=>{const i=tb.findIndex(x=>x.id===id);if(i>=0)tb.splice(i,1);if(t==='projects')DB.tasks.forEach(x=>{if(x.project_id===id)x.project_id=null});return Promise.resolve({error:null})}}),
    insert:row=>({select:()=>({single:()=>{const r={id:'new'+(++n),...row};tb.push(r);return Promise.resolve({data:{...r},error:null})}})})}};
  refresh();
});
await p.waitForTimeout(400);
const sec=()=>p.evaluate(()=>[...document.querySelectorAll('#view section')].map(x=>x.querySelector('h2').textContent.trim().split(' ')[0]+': '+[...x.querySelectorAll('.task .title')].map(t=>t.textContent.slice(0,2)).join(' ')).join(' | '));
await p.hover('.task[data-tid="d"]');await p.waitForTimeout(400);await p.screenshot({path:new URL('./out/dep3.png', import.meta.url).pathname});
await b.close();
