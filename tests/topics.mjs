import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
// Topics: tags on 3+ notes across 2+ top-level projects become topic pages with the agent's brief, notes, tasks and calls
const b = await chromium.launch();
const errs=[];
const p=await b.newPage({viewport:{width:1440,height:1000}}); p.on('pageerror',e=>errs.push(e.message));
await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(1000);
await p.evaluate(()=>{
  const ago=h=>new Date(Date.now()-h*36e5).toISOString();
  window.DB={projects:[{id:'zenara',name:'Zenara',area:'Career',color:'#1F8A8A'},{id:'zenara-launches',name:'Launches',area:'Career',parent_id:'zenara',color:'#C4412F'},{id:'fish',name:'Small Fish',area:'Products',color:'#3E8A57'}],
   tasks:[{id:'t1',title:'Send the pricing sheet to David',project_id:'zenara',status:'todo',priority:'high',steps:[],activity:[],blocked_by:[]},
     {id:'t2',title:'Fix the PR deck',project_id:'zenara',status:'todo',priority:'med',steps:[],activity:[],blocked_by:[]},
     {id:'t3',title:'Book plumber',project_id:'fish',status:'todo',priority:'low',steps:[],activity:[],blocked_by:[]}],
   notes:[
    {id:'n1',kind:'decision',title:'Flow pricing: $49 per seat',body:'',project_id:'zenara-launches',tags:['pricing','flow'],created_at:ago(10)},
    {id:'n2',kind:'idea',title:'Usage-based pricing for Small Fish',body:'',project_id:'fish',tags:['Pricing'],created_at:ago(30)},
    {id:'n3',kind:'fact',title:'Competitor X charges $99',body:'',project_id:'zenara',tags:['pricing'],created_at:ago(50)},
    {id:'n4',kind:'note',title:'Only one project',body:'',project_id:'fish',tags:['solo','handoff'],created_at:ago(5)},
    {id:'n5',kind:'note',title:'Handoff A',project_id:'fish',tags:['handoff'],created_at:ago(5)},{id:'n6',kind:'note',title:'Handoff B',project_id:'zenara',tags:['handoff'],created_at:ago(5)}],
   sources:[{id:'s1',title:'GTM sync',occurred_at:ago(20),summary:'Talked pricing tiers',project_id:'zenara'},{id:'s2',title:'Other call',occurred_at:ago(20),summary:'Nothing',project_id:'zenara'}],
   topic_briefs:[{tag:'pricing',body:'**Where it stands:** Flow is $49 a seat; Small Fish is weighing usage pricing.\n\n**Current decisions:**\n- $49 per seat (Launches, 23 Oct)',updated_at:ago(2)}]};
  const q=t=>{const o={then:(r,j)=>Promise.resolve({data:JSON.parse(JSON.stringify(DB[t]||[])),error:null}).then(r,j),order:()=>o,limit:()=>o,gte:()=>o};return o};
  sb.rpc=()=>Promise.resolve({data:null,error:null});
  sb.from=t=>({select:()=>q(t),update:()=>({eq:()=>Promise.resolve({error:null})}),upsert:()=>Promise.resolve({error:null})});
  refresh();
});
await p.waitForTimeout(700);
await p.click('#side [data-go="topics"]'); await p.waitForTimeout(150);
console.log('topics:', await p.evaluate(()=>[...document.querySelectorAll('#view [data-topic]')].map(x=>x.dataset.topic+' | '+x.querySelector('.nb>span').textContent)));
await p.click('#view [data-topic="pricing"]'); await p.waitForTimeout(150);
console.log('page:', await p.evaluate(()=>({h1:document.querySelector('#view h1').textContent,sub:document.querySelector('#view .sub').textContent,brief:!!document.querySelector('#view .brief'),secs:[...document.querySelectorAll('#view section .sh h2')].map(x=>x.textContent),tasks:[...document.querySelectorAll('#view .task')].map(x=>x.dataset.tid),calls:[...document.querySelectorAll('#view .pk-list li')].length,nav:document.querySelector('#side [data-go="topics"]').getAttribute('aria-current')})));
await p.screenshot({path:new URL('./out/topic.png', import.meta.url).pathname});
await p.evaluate(()=>{S.view='notes';render()}); await p.waitForTimeout(100);
console.log('notes has Topics button:', await p.evaluate(()=>!!document.querySelector('#view [data-go="topics"]')));
console.log('errors', errs);
await b.close();
