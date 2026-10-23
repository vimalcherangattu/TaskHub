import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const errs=[];
const p=await b.newPage({viewport:{width:1440,height:1000}}); p.on('pageerror',e=>errs.push(e.message));
await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(1000);
await p.evaluate(()=>{
  const t0=T(),d=n=>{const x=new Date();x.setDate(x.getDate()+n);return iso2(x)},ago=h=>new Date(Date.now()-h*36e5).toISOString();
  window.DB={projects:[{id:'zenara',name:'Zenara',area:'Career',color:'#1F8A8A'},{id:'zenara-launches',name:'Launches',area:'Career',parent_id:'zenara',color:'#C4412F'},{id:'home',name:'Home',area:'Life',color:'#D0662A'}],
   tasks:[
    {id:'t1',title:'Slice 1 two-pager from Pratik',project_id:'zenara-launches',status:'waiting',waiting_on:'Pratik',waiting_since:ago(50),follow_up_on:d(1),priority:'high',steps:[],activity:[],blocked_by:[]},
    {id:'t2',title:'Send Pratik the pricing launch checklist',project_id:'zenara-launches',status:'todo',priority:'med',today_date:t0,steps:[],activity:[],blocked_by:[]},
    {id:'t3',title:'Book plumber',project_id:'home',status:'todo',priority:'low',steps:[],activity:[],blocked_by:[]}],
   notes:[
    {id:'n1',kind:'person',title:'Pratik Doshi: Product + Chief of Staff',body:'Leaving early Nov.',project_id:'zenara',created_at:ago(300)},
    {id:'n2',kind:'person',title:'Dr. Chelsea Weeks: prospect',body:'',project_id:'zenara',created_at:ago(300)},
    {id:'n3',kind:'decision',title:'Pratik owns the Slice 1 scope',body:'',project_id:'zenara-launches',created_at:ago(40)},
    {id:'n4',kind:'idea',title:'Pricing launch checklist template for every launch',body:'',project_id:'zenara',created_at:ago(30)},
    {id:'n5',kind:'idea',title:'Old idea about newsletters',body:'',project_id:'home',created_at:ago(24*40)}],
   sources:[{id:'s1',title:'Weekly sync',occurred_at:ago(30),attendees:['Pratik Doshi','Vimal'],project_id:'zenara',summary:'Talked Slice 1'},{id:'s2',title:'Other call',occurred_at:ago(20),attendees:['Sam'],project_id:'zenara'}],
   call_series:[{id:'gtm',name:'GTM sync',people:['David','Pratik'],active:true,order:1,next_at:new Date(Date.now()+30*36e5).toISOString()}],
   agenda_items:[{id:'a1',series_id:'gtm',kind:'ask',text:'Slice 1 date',status:'open'}],inputs:[{id:'i1',key:'roi',question:'Flow ROI',owner:'Pratik',status:'pending',created_at:ago(30)}],input_uses:[]};
  const q=t=>{const o={then:(r,j)=>Promise.resolve({data:JSON.parse(JSON.stringify(DB[t]||[])),error:null}).then(r,j),order:()=>o,limit:()=>o,gte:()=>o};return o};
  sb.rpc=()=>Promise.resolve({data:null,error:null});
  sb.from=t=>({select:()=>q(t),update:()=>({eq:()=>Promise.resolve({error:null})}),upsert:()=>Promise.resolve({error:null})});
  refresh();
});
await p.waitForTimeout(800);
console.log('from your notes:', await p.evaluate(()=>[...document.querySelectorAll('.rail .card')].filter(c=>c.querySelector('h2')?.textContent==='From your notes').map(c=>[...c.querySelectorAll('.ritem')].map(r=>r.dataset.editnote+':'+r.querySelector(':scope>span').textContent)).flat()));
await p.evaluate(()=>{S.view='notes';render()}); await p.waitForTimeout(150);
await p.click('[data-go="people"].btn'); await p.waitForTimeout(150);
console.log('people sections:', await p.evaluate(()=>[...document.querySelectorAll('#view section')].map(s=>s.querySelector('h2').textContent+'='+[...s.querySelectorAll('[data-person]')].map(x=>x.dataset.person).join(','))));
await p.click('#view [data-person="n1"]'); await p.waitForTimeout(150);
console.log('person page:', await p.evaluate(()=>({h1:document.querySelector('#view h1').textContent,secs:[...document.querySelectorAll('#view section h2')].map(x=>x.textContent),owe:[...document.querySelectorAll('#view .task')].map(x=>x.dataset.tid)})));
await p.screenshot({path:new URL('./out/person.png', import.meta.url).pathname});
console.log('errors', errs);
await b.close();
