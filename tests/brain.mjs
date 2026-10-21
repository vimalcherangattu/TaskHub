import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const errs=[];
const URLX=new URL('../index.html', import.meta.url).href;
const mock=()=>{
  const t0=T();
  window.DB={projects:[{id:'w',name:'Work',color:'#2F6DB5',area:'Career'},{id:'h',name:'Home',color:'#3E8A57',area:'Life'}],
    tasks:[{id:'a',title:'Send pricing deck to David',project_id:'w',status:'todo',priority:'high',due:t0,notes:'v3 of the rate card'},
           {id:'b',title:'Pay electricity bill',project_id:'h',status:'todo',priority:'low',today_date:t0}],
    notes:[{id:'n1',project_id:'w',kind:'decision',title:'Prices shown to the cent',body:'Billing people read exact numbers, so no rounding on the rate card.',created_at:new Date().toISOString()},
           {id:'n2',project_id:null,kind:'idea',title:'Weekly review ritual',body:'Sunday 20 minutes',created_at:new Date().toISOString()}],
    sources:[{id:'s1',project_id:'w',title:'GTM sync',occurred_at:new Date().toISOString(),summary:'Talked about the rate card and pilots'}],
    project_briefs:[{project_id:'w',body:'**Status:** Rate card agreed. Pilots next.'}],source_segments:[],changes:[],inputs:[],input_uses:[],call_series:[],agenda_items:[]};
  let n=0;
  const q=t=>{const o={then:(r,j)=>Promise.resolve({data:JSON.parse(JSON.stringify(DB[t]||[])),error:null}).then(r,j),order:()=>o,limit:()=>o,gte:()=>o};return o};
  sb.rpc=(fn,a)=>Promise.resolve({data:fn==='brain_search'?[{layer:'source',id:'s9',project_id:'w',title:'Pricing call with Ravi',snippet:'…we agreed the rate card…'}]:null,error:null});
  sb.channel=()=>({on(){return this},subscribe(){return this}});
  sb.from=t=>{const tb=DB[t]||(DB[t]=[]);return{select:()=>q(t),
    update:row=>({eq:(c,id)=>{const r=tb.find(x=>x.id===id);if(r)Object.assign(r,row);return Promise.resolve({error:null})}}),
    upsert:row=>{const r=tb.find(x=>x.id===row.id);if(r)Object.assign(r,row);else tb.push({...row});return Promise.resolve({error:null})},
    delete:()=>({eq:(c,id)=>{const i=tb.findIndex(x=>x.id===id);if(i>=0)tb.splice(i,1);return Promise.resolve({error:null})}}),
    insert:row=>({select:()=>({single:()=>{const r={id:'new'+(++n),...row};tb.push(r);return Promise.resolve({data:{...r},error:null})}})})}};
};
const ctx=await b.newContext({viewport:{width:1280,height:900}});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
await p.goto(URLX);await p.waitForTimeout(800);await p.evaluate(mock);await p.evaluate(()=>refresh());await p.waitForTimeout(500);

// capture: keyboard C, a task on Today
await p.keyboard.press('c');await p.waitForTimeout(150);
console.log('capture opens on C:',await p.evaluate(()=>document.getElementById('capDlg').open));
await p.fill('#capText','Call the bank about the card');await p.keyboard.press('Control+Enter');await p.waitForTimeout(300);
console.log('task captured:',await p.evaluate(()=>JSON.stringify(DB.tasks.filter(x=>x.title.startsWith('Call the bank')).map(x=>[x.status,x.today_date===T()]))));
// capture: a link auto-detects its kind
await p.click('#side [data-capture]');await p.fill('#capText','Great piece on pricing https://example.com/pricing-post');await p.waitForTimeout(50);
console.log('link kind auto:',await p.evaluate(()=>document.querySelector('#capForm [name=kind]').value));
await p.click('#capForm button[type=submit]');await p.waitForTimeout(300);
console.log('link saved:',await p.evaluate(()=>JSON.stringify(DB.notes.filter(x=>x.kind==='link').map(x=>[x.title,x.url,x.project_id]))));
// capture: an idea into a project, picked with the switch
await p.click('#side [data-capture]');await p.fill('#capText','Podcast with Ravi\nTen episodes, one per ICP');await p.click('#capKind [data-kind="idea"]');await p.selectOption('#capForm [name=projectId]','w');await p.click('#capForm button[type=submit]');await p.waitForTimeout(300);
console.log('idea saved:',await p.evaluate(()=>JSON.stringify(DB.notes.filter(x=>x.kind==='idea').map(x=>[x.title,x.body,x.project_id]))));
// notes view: inbox first, then projects
await p.click('#side [data-go="notes"]');await p.waitForTimeout(200);
console.log('notes sections:',await p.evaluate(()=>[...document.querySelectorAll('#view section')].map(s=>s.querySelector('h2').textContent+'='+s.querySelectorAll('.nrow').length).join(' | ')));
await p.click('[data-nk="idea"]');await p.waitForTimeout(100);console.log('ideas filter rows:',await p.evaluate(()=>document.querySelectorAll('#view .nrow').length));
await p.screenshot({path:new URL('./out/brain-notes.png', import.meta.url).pathname});
// search: Ctrl+K, local + transcript hits, Enter opens the quick look
await p.keyboard.press('Control+k');await p.waitForTimeout(100);await p.keyboard.type('rate card');await p.waitForTimeout(500);
console.log('search groups:',await p.evaluate(()=>[...document.querySelectorAll('#findRes .fg')].map(g=>g.textContent).join(', ')));
await p.screenshot({path:new URL('./out/brain-search.png', import.meta.url).pathname});
await p.keyboard.press('Enter');await p.waitForTimeout(300);
console.log('enter → peek:',await p.evaluate(()=>S.peek));
await p.keyboard.press('Escape');await p.keyboard.press('/');await p.keyboard.type('weekly');await p.waitForTimeout(150);await p.keyboard.press('Enter');await p.waitForTimeout(300);
console.log('note result opens editor:',await p.evaluate(()=>document.getElementById('noteDlg').open&&document.querySelector('#noteForm [name=title]').value));
await p.evaluate(()=>document.getElementById('noteDlg').close());
// mind map still draws with d3 loaded lazily
await p.evaluate(()=>{S.view='brain';render()});await p.waitForTimeout(2500);
console.log('mind map nodes:',await p.evaluate(()=>document.querySelectorAll('#brainSvg circle').length>0));
console.log('cache saved:',await p.evaluate(()=>{const c=JSON.parse(localStorage.getItem(CACHE)||'null');return !!c&&c.tasks.length}));

// next open: paints from cache before any data arrives, and a shared link opens Capture
const q=await ctx.newPage();await q.setViewportSize({width:390,height:844});q.on('pageerror',e=>errs.push(e.message));
await q.goto(URLX+'?title=Article&url=https%3A%2F%2Fexample.com%2Fa');await q.waitForTimeout(800);
await q.evaluate(()=>{sb.channel=()=>({on(){return this},subscribe(){return this}});const never={select:()=>{const o={then:()=>{},order:()=>o,limit:()=>o,gte:()=>o};return o}};sb.from=()=>never;sb.rpc=()=>new Promise(()=>{});start()});
await q.waitForTimeout(300);
console.log('painted from cache:',await q.evaluate(()=>document.querySelectorAll('#view .task').length),'| share opens capture:',await q.evaluate(()=>document.getElementById('capDlg').open&&document.getElementById('capText').value.replace('\n',' / ')),'| kind',await q.evaluate(()=>document.querySelector('#capForm [name=kind]').value));
await q.evaluate(()=>document.getElementById('capDlg').close());await q.waitForTimeout(200);
await q.screenshot({path:new URL('./out/brain-phone.png', import.meta.url).pathname});
console.log('phone hscroll:',await q.evaluate(()=>document.documentElement.scrollWidth));
console.log('errors',errs);
await b.close();
