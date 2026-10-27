import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
// 2-minute tasks: "Knock these out" on Today, the 2-min toggles, title tags, "Do these take 2 minutes?", and "I have 10 minutes"
const b = await chromium.launch();
async function setup(p){
  await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(1000);
  await p.evaluate(()=>{
    const t0=T(),d=n=>{const x=new Date();x.setDate(x.getDate()+n);return iso2(x)},ago=h=>new Date(Date.now()-h*36e5).toISOString();
    const k=(id,title,o={})=>({id,title,project_id:'zen',status:'todo',priority:'med',steps:[],activity:[],blocked_by:[],created_at:ago(2),...o});
    window.DB={projects:[{id:'zen',name:'Zenara',area:'Career',color:'#1F8A8A'},{id:'home',name:'Home & family',area:'Life',color:'#D0662A'}],
    tasks:[
     k('q1','Review Vamby\'s 40-slide deck',{quick:true,created_at:ago(24*5)}),
     k('q2','Forward the invoice to Ravi',{quick:true,project_id:'home',due:d(12),created_at:ago(24*1)}),
     k('q3','Approve the ad copy',{quick:true,today_date:t0,created_at:ago(3)}),
     k('q4','Send Kara the recap',{quick:true,status:'waiting',waiting_on:'Kara',follow_up_on:d(2)}),
     k('q5','Reply to Asha about Friday',{quick:true,highlight_day:t0}),
     k('s1','Reply to Deepak on the tracking fix',{created_at:ago(24*3)}),
     k('s2','Send the parents\' tickets',{project_id:'home',created_at:ago(24*2)}),
     k('s3','Review the pricing page',{quick:false}),
     k('s4','Draft the launch plan'),
     k('t1','Build the Flow deck',{today_date:t0,effort_days:3})],
    notes:[],call_series:[],agenda_items:[]};
    const q=t=>{const o={then:(r,j)=>Promise.resolve({data:JSON.parse(JSON.stringify(DB[t]||[])),error:null}).then(r,j),order:()=>o,limit:()=>o,gte:()=>o};return o};
    sb.rpc=()=>Promise.resolve({data:null,error:null});
    sb.from=t=>{const tb=DB[t]||(DB[t]=[]);return{select:()=>q(t),
      update:row=>({eq:(c,id)=>{const r=tb.find(x=>x.id===id);if(r)Object.assign(r,row);return Promise.resolve({error:null})}}),
      upsert:row=>{const r=tb.find(x=>x.id===row.id);if(r)Object.assign(r,row);else tb.push({...row});return Promise.resolve({error:null})},
      delete:()=>({eq:(c,id)=>{const i=tb.findIndex(x=>x.id===id);if(i>=0)tb.splice(i,1);return Promise.resolve({error:null})}}),
      insert:row=>({select:()=>({single:()=>{const r={id:'new'+tb.length,...row};tb.push(r);return Promise.resolve({data:{...r},error:null})}})})}};
    refresh();
  });
  await p.waitForTimeout(700);
}
const errs=[];
const p=await b.newPage({viewport:{width:1440,height:1000}}); p.on('pageerror',e=>errs.push(e.message));
p.on('dialog',d=>d.accept());
await setup(p);
const strip=()=>p.evaluate(()=>{const s=document.querySelector('#view section.qk');return s?[...s.querySelectorAll('.task')].map(x=>x.dataset.tid):null});
// whatever the date, oldest first; waiting and starred ones stay where they were
console.log('strip, oldest first:', JSON.stringify(await strip()), JSON.stringify(await strip())==='["q1","q2","q3"]');
console.log('shown once on Today:', await p.evaluate(()=>['q1','q2','q3','q5'].every(id=>document.querySelectorAll(`#view .task[data-tid="${id}"]`).length===1)));
console.log('starred one stays in High impact:', await p.evaluate(()=>!!document.querySelector('#view section.hi .task[data-tid="q5"]')));
console.log('counts in the header:', await p.evaluate(()=>document.querySelector('.thead h1').textContent));
console.log('age tag on old ones only:', await p.evaluate(()=>document.querySelector('.task[data-tid="q1"] .meta').textContent.includes('5 days old')&&!document.querySelector('.task[data-tid="q2"] .meta').textContent.includes('days old')));
// suggestions: only undecided ones that look quick, oldest first
const sug=await p.evaluate(()=>[...document.querySelectorAll('.qk-s b')].map(x=>x.textContent));
console.log('suggestions:', JSON.stringify(sug), sug.length===2&&sug[0].startsWith('Reply to Deepak'));
await p.click('[data-qkyes="s1"]'); await p.waitForTimeout(300);
await p.click('[data-qkno="s2"]'); await p.waitForTimeout(300);
console.log('yes and no saved:', await p.evaluate(()=>{const g=id=>DB.tasks.find(x=>x.id===id).quick;return g('s1')===true&&g('s2')===false}));
console.log('suggestions gone, s1 in the strip:', await p.evaluate(()=>!document.querySelector('.qk-sug')&&!!document.querySelector('section.qk .task[data-tid="s1"]')));
await p.screenshot({path:new URL('out/quick.png',import.meta.url).pathname});
// quick look toggle
await p.click('.task[data-tid="s4"] .title').catch(async()=>{await p.evaluate(()=>setPeek('s4'))});
await p.evaluate(()=>setPeek('s4')); await p.waitForTimeout(200);
await p.click('#peek [data-qk="s4"]'); await p.waitForTimeout(300);
console.log('quick look marks it:', await p.evaluate(()=>DB.tasks.find(x=>x.id==='s4').quick===true&&document.querySelector('#peek [data-qk]').getAttribute('aria-pressed')==='true'&&document.getElementById('peek').textContent.includes('2-minute task')));
await p.click('#peek [data-qk="s4"]'); await p.waitForTimeout(300);
console.log('and unmarks it (false, so no more asking):', await p.evaluate(()=>DB.tasks.find(x=>x.id==='s4').quick===false));
await p.evaluate(()=>setPeek(null));
// task sheet pill
await p.evaluate(()=>openTask(S.tasks.find(x=>x.id==='t1'))); await p.waitForTimeout(200);
console.log('pill off on open:', await p.getAttribute('#taskForm [data-ck="onQuick"]','aria-pressed')==='false');
await p.click('#taskForm [data-ck="onQuick"]'); await p.click('#taskForm .foot button.primary'); await p.waitForTimeout(400);
console.log('sheet saves it:', await p.evaluate(()=>DB.tasks.find(x=>x.id==='t1').quick===true));
// title tags in quick add and Capture
await p.fill('#quick input[name="q"]','Text Mom the flight number 2m'); await p.press('#quick input[name="q"]','Enter'); await p.waitForTimeout(400);
console.log('quick add "2m":', await p.evaluate(()=>{const r=DB.tasks.find(x=>x.title==='Text Mom the flight number');return!!r&&r.quick===true}));
await p.evaluate(()=>openCapture('Sign the NDA #quick\nfrom legal')); await p.waitForTimeout(200);
await p.evaluate(()=>document.getElementById('capForm').requestSubmit()); await p.waitForTimeout(400);
console.log('Capture "#quick":', await p.evaluate(()=>{const r=DB.tasks.find(x=>x.title==='Sign the NDA');return!!r&&r.quick===true&&r.notes==='from legal'}));
console.log('plain title untouched:', await p.evaluate(()=>quickParse('Make it quick').quick!==true&&quickParse('Call (quick)').title==='Call'&&quickParse('Book 2 mins').quick===true&&quickParse('Read 2m').title==='Read'&&quickParse('#quick').title==='#quick'));
// I have 10 minutes
const n0=(await strip()).length;
await p.click('section.qk [data-sprint]'); await p.waitForTimeout(300);
console.log('sprint opens on the oldest:', await p.evaluate(()=>document.getElementById('sprintDlg').open&&document.getElementById('spH').textContent.startsWith('Review Vamby')));
console.log('countdown:', await p.evaluate(()=>/^\d+:\d\d left$/.test(document.getElementById('spClock').textContent)));
await p.click('#sprintBody [data-sp="done"]'); await p.waitForTimeout(300);
await p.click('#sprintBody [data-sp="skip"]'); await p.waitForTimeout(300);
await p.click('#sprintBody [data-sp="not"]'); await p.waitForTimeout(300);
console.log('done, skip, not-quick saved:', await p.evaluate(()=>{const g=id=>DB.tasks.find(x=>x.id===id);return g('q1').status==='done'&&g('s1').status==='todo'&&g('q2').quick===false}));
for(let i=0;i<10;i++){const more=await p.$('#sprintBody [data-sp="done"]');if(!more)break;await more.click();await p.waitForTimeout(200)}
console.log('end screen:', await p.evaluate(()=>document.getElementById('spH').textContent));
await p.click('#sprintBody [data-close]'); await p.waitForTimeout(300);
console.log('strip after:', JSON.stringify(await strip()), n0);
// phone
const m=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}); m.on('pageerror',e=>errs.push(e.message));
await setup(m);
await m.screenshot({path:new URL('out/quick-phone.png',import.meta.url).pathname});
console.log('phone targets ≥44px:', await m.evaluate(()=>[...document.querySelectorAll('section.qk .sh .act, .qk-sa .tool')].every(x=>x.getBoundingClientRect().height>=44)));
await m.evaluate(()=>{document.documentElement.dataset.theme='dark'}); await m.click('section.qk [data-sprint]'); await m.waitForTimeout(300);
await m.screenshot({path:new URL('out/quick-sprint-dark.png',import.meta.url).pathname});
console.log('errors', errs);
await b.close();
