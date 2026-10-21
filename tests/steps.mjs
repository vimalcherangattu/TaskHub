import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1280,height:900}});
const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('dialog',d=>d.accept());
await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(1500);
await p.evaluate(()=>{
  const t0=T();
  window.DB={projects:[{id:'w',name:'Work',color:'#2F6DB5',area:'Career'}],
    tasks:[{id:'a',title:'Move flat: pack, transfer deposit, update address',project_id:'w',status:'doing',priority:'high',today_date:t0,started_at:new Date().toISOString(),steps:[{text:'Pack the kitchen',done:true},{text:'Transfer deposit to landlord',done:false},{text:'Update address with bank',done:false}],activity:[{at:new Date(Date.now()-36e5).toISOString(),by:'claude',text:'Kitchen packed (from chat). Deposit next.'}]},{id:'b',title:'Beta',project_id:'w',status:'todo',priority:'med',today_date:t0}],notes:[]};
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
const st=()=>p.evaluate(()=>JSON.stringify({tasks:DB.tasks.map(x=>x.id+':'+x.status+':'+(x.project_id||'-')),projects:DB.projects.map(x=>x.id)}));
const step=async(label,fn)=>{await fn();await p.waitForTimeout(500);console.log(label.padEnd(24),await p.evaluate(()=>JSON.stringify(DB.tasks[0].steps.map(x=>(x.done?'x ':'- ')+x.text))))};
await p.screenshot({path:new URL('./out/s1.png', import.meta.url).pathname});
await step('tick step 2',()=>p.evaluate(()=>setPeek('a')).then(()=>p.waitForTimeout(150)).then(()=>p.click('#peek .step[data-i="1"]')));
console.log('toast:',await p.textContent('#toast'));
await step('ctrl+z',()=>p.keyboard.press('Control+z'));
await step('edit: add + remove',async()=>{await p.evaluate(()=>setPeek('a'));await p.waitForTimeout(150);await p.click('#peek [data-edit="a"]');await p.waitForTimeout(300);await p.click('#tsMore summary');await p.fill('#stepNew','Return keys');await p.press('#stepNew','Enter');await p.click('[data-dsdel="0"]');await p.click('[data-dstep="0"]');await p.waitForTimeout(200);await p.screenshot({path:new URL('./out/s2.png', import.meta.url).pathname});await p.click('#taskForm button[type=submit]')});
console.log(errs);
await b.close();
