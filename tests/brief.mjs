import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
// The brief on Today (after Dia's Morning Brief): agent items with feedback, "You owe" (tasks.owed_to), the 9 AM lead's picks with "Not useful",
// Since yesterday, Monday and Friday editions, Looking ahead, saved prompts (brief and quick look), and the meeting countdown card
const b = await chromium.launch();
async function setup(p,{edition='monday'}={}){
  await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(1000);
  await p.evaluate(({edition})=>{
    const t0=T(),d=n=>addDays(t0,n),ago=h=>new Date(Date.now()-h*36e5).toISOString();
    const k=(id,title,o={})=>({id,title,project_id:'zen',status:'todo',priority:'med',steps:[],activity:[],blocked_by:[],created_at:ago(30),...o});
    window.DB={projects:[{id:'zen',name:'Zenara',area:'Career',color:'#1F8A8A'},{id:'home',name:'Home & family',area:'Life',color:'#D0662A'}],
    tasks:[
     k('o1','Send Asha the pricing sheet',{owed_to:'Asha',created_at:ago(72)}),
     k('o2','Approve Ravi\'s invoice',{owed_to:'Ravi',project_id:'home'}),
     k('p1','Ship the Flow deck',{highlight_day:t0,activity:[{at:ago(2),by:'claude',text:'Marked high impact by daily routine: due tomorrow and two tasks wait on it'}]}),
     k('p2','My own star',{highlight_day:t0}),
     k('r1','Reply to Deepak',{}),
     k('h1','File the GST return',{due:t0,due_firm:true}),
     k('w1','Draft the launch plan',{due:d(1)}),
     k('w2','Book the venue',{due:d(2)}),
     k('w3','Write the FAQ',{status:'doing'}),
     k('w4','Review the brand video',{due:d(1)}),
     k('s1','Old one that slipped',{due:addDays(week()[0],-3)}),
     k('dn','Finished thing',{status:'done',done_at:new Date().toISOString()})],
    notes:[{id:'dec1',title:'Go with vendor B',kind:'decision',project_id:'zen',created_at:new Date().toISOString()}],
    changes:[{id:1,at:ago(3),project_id:'zen',kind:'task_done',summary:'Done: Pricing page copy',actor:'chat'},{id:2,at:ago(5),project_id:'zen',kind:'task_added',summary:'Added: Flow deck v2',actor:'meeting-agent'},{id:3,at:ago(200),project_id:'home',kind:'task_added',summary:'Old change',actor:'chat'}],
    day_briefs:[{id:'b-1',day:t0,edition,headline:'Two people are waiting on you, and the Flow deck is due tomorrow.',created_at:ago(1),updated_at:ago(1),feedback:{},items:[
      {id:'1',section:'needs_you',tag:'needs_you',text:'Reply to Deepak about tracking',why:'He asked on Friday',ref_type:'task',ref_id:'r1',url:'https://mail.google.com/mail/u/0/#inbox/abc'},
      {id:'2',section:'needs_you',tag:'awaiting',text:'Linear: COM-612 needs your review',url:'https://linear.app/x/issue/COM-612'},
      {id:'3',section:'heads_up',text:'Clash: Zenara standup overlaps the dentist at 4pm'},
      {id:'4',section:'updates',tag:'active',text:'HLTH campaign: Kara sent the final copy'}]}],
    call_series:[],agenda_items:[]};
    const q=t=>{const o={then:(r,j)=>Promise.resolve({data:JSON.parse(JSON.stringify(DB[t]||[])),error:null}).then(r,j),order:()=>o,limit:()=>o,gte:()=>o};return o};
    sb.rpc=()=>Promise.resolve({data:null,error:null});
    sb.from=t=>{const tb=DB[t]||(DB[t]=[]);return{select:()=>q(t),
      update:row=>({eq:(c,id)=>{const r=tb.find(x=>x.id===id);if(r)Object.assign(r,row);return Promise.resolve({error:null})}}),
      upsert:row=>{const r=tb.find(x=>x.id===row.id);if(r)Object.assign(r,row);else tb.push({...row});return Promise.resolve({error:null})},
      delete:()=>({eq:(c,id)=>{const i=tb.findIndex(x=>x.id===id);if(i>=0)tb.splice(i,1);return Promise.resolve({error:null})}}),
      insert:row=>({select:()=>({single:()=>{const r={id:'new'+tb.length,...row};tb.push(r);return Promise.resolve({data:{...r},error:null})}})})}};
    try{localStorage.removeItem('ambalam.brief.v1')}catch{}
    S.showBrief=true;S.tmode='list'; // 9 Nov: the brief sits behind the Brief chip on Today
    window.opened=[];window.open=u=>{opened.push(u);return null};
    refresh();
  },{edition});
  await p.waitForTimeout(800);
}
const errs=[];
const p=await b.newPage({viewport:{width:1440,height:1100}}); p.on('pageerror',e=>errs.push(e.message));
p.on('dialog',d=>d.accept());
await setup(p);
const txt=sel=>p.evaluate(s=>document.querySelector(s)?.textContent||'',sel);
console.log('brief at the top of Today, open:', await p.evaluate(()=>{const d=document.querySelector('#view details.brief');return!!d&&d.open&&d.compareDocumentPosition(document.querySelector('.thead'))===Node.DOCUMENT_POSITION_PRECEDING}));
console.log('agent headline and edition:', (await txt('.brief summary')).includes('Two people are waiting')&&(await txt('.brief summary')).includes('Monday brief'));
const secs=await p.evaluate(()=>[...document.querySelectorAll('.brief .bsec h3')].map(x=>x.textContent));
console.log('sections:', JSON.stringify(secs), ['Needs you','Your day','Picked for you','Last week','This week','Heads up'].every(x=>secs.includes(x))&&secs.some(x=>/^Since/.test(x)));
console.log('You owe in Needs you:', await p.evaluate(()=>{const s=[...document.querySelectorAll('.brief .bsec')].find(x=>x.querySelector('h3').textContent==='Needs you');return s.textContent.includes('Send Asha the pricing sheet')&&s.textContent.includes('Asha is waiting')&&s.textContent.includes('Ravi is waiting')&&s.textContent.includes('Reply to Deepak about tracking')}));
console.log('agent item links to its task and its source:', await p.evaluate(()=>!!document.querySelector('.brief button.bi-t[data-peek="r1"]')&&!!document.querySelector('.brief a[href^="https://mail.google.com"]')&&!!document.querySelector('.brief a.bi-t[href^="https://linear.app"]')));
console.log('since yesterday skips old changes:', await p.evaluate(()=>{const s=[...document.querySelectorAll('.brief .bsec')].find(x=>/^Since/.test(x.querySelector('h3').textContent));return s.textContent.includes('Pricing page copy')&&s.textContent.includes('Kara sent the final copy')&&!s.textContent.includes('Old change')}));
console.log('Monday: hard deadline and slipped:', await p.evaluate(()=>{const g=h=>[...document.querySelectorAll('.brief .bsec')].find(x=>x.querySelector('h3').textContent===h)?.textContent||'';return g('This week').includes('File the GST return')&&g('Last week').includes('Old one that slipped')}));
console.log('only the lead\'s star is in Picked for you:', await p.evaluate(()=>{const s=[...document.querySelectorAll('.brief .bsec')].find(x=>x.querySelector('h3').textContent==='Picked for you');return s.textContent.includes('Ship the Flow deck')&&s.textContent.includes('two tasks wait on it')&&!s.textContent.includes('My own star')}));
await p.screenshot({path:new URL('out/brief.png',import.meta.url).pathname,fullPage:false});
// feedback
await p.click('.brief [data-bfb="no"][data-k="2"]'); await p.waitForTimeout(300);
console.log('Not useful saved and hidden:', await p.evaluate(()=>DB.day_briefs[0].feedback['2']==='no'&&!document.querySelector('.brief [data-k="2"]')));
await p.click('.brief [data-bfb="done"][data-k="1"]'); await p.waitForTimeout(400);
console.log('Done on a task item closes the task:', await p.evaluate(()=>DB.day_briefs[0].feedback['1']==='done'&&DB.tasks.find(x=>x.id==='r1').status==='done'));
await p.click('.brief [data-hino="p1"]'); await p.waitForTimeout(400);
console.log('Not useful on a lead pick unstars and logs it:', await p.evaluate(()=>{const t=DB.tasks.find(x=>x.id==='p1');return t.highlight_day===null&&t.activity.some(a=>a.text==='Routine pick rejected: not useful')&&!document.querySelector('.brief [data-hino]')}));
await p.click('.brief [data-quickdone="o2"]'); await p.waitForTimeout(300);
console.log('Done on an owed task:', await p.evaluate(()=>DB.tasks.find(x=>x.id==='o2').status==='done'));
// collapse is remembered for the day
await p.click('.brief summary'); await p.waitForTimeout(200);
await p.evaluate(()=>render()); await p.waitForTimeout(100);
console.log('collapsed stays collapsed today:', await p.evaluate(()=>localStorage.getItem('ambalam.brief.v1')===T()&&!document.querySelector('.brief').open));
await p.click('.brief summary'); await p.waitForTimeout(200);
// saved prompts
await p.click('.brief [data-bskill="plan"]'); await p.waitForTimeout(200);
console.log('Plan my day opens Claude with the brief:', await p.evaluate(()=>{const u=decodeURIComponent(opened.at(-1)||'');return u.startsWith('https://claude.ai/new?q=')&&u.includes('task-hub skill')&&u.includes('File the GST return')&&u.includes('Send Asha the pricing sheet (Asha)')}));
await p.evaluate(()=>setPeek('w1')); await p.waitForTimeout(200);
await p.click('#peek [data-pkmore]'); await p.waitForTimeout(150); // 9 Nov: Claude prompts sit under the quick look's More
await p.click('#peek [data-tskill="steps"]'); await p.waitForTimeout(200);
console.log('quick look: More with Claude:', await p.evaluate(()=>{const u=decodeURIComponent(opened.at(-1)||'');return u.includes('Task: Draft the launch plan')&&u.includes('Break this into 3–7 concrete next steps')&&!u.includes('Help me finish it')}));
await p.evaluate(()=>setPeek('o1')); await p.waitForTimeout(200);
console.log('quick look says who is waiting:', (await txt('#peek .pk-facts')).includes('Asha is waiting on you'));
await p.evaluate(()=>setPeek(null));
// Owed to in the task sheet
await p.evaluate(()=>openTask(S.tasks.find(x=>x.id==='w2'))); await p.waitForTimeout(200);
await p.evaluate(()=>document.getElementById('tsMore').open=true);
await p.fill('#taskForm input[name="owedTo"]','Kara'); await p.click('#taskForm .foot button.primary'); await p.waitForTimeout(400);
console.log('task sheet saves Owed to:', await p.evaluate(()=>DB.tasks.find(x=>x.id==='w2').owed_to==='Kara'&&document.querySelector('.brief').textContent.includes('Kara is waiting')));
// Looking ahead (evening): now step 3 of Close the day
await p.evaluate(()=>{S.forceEvening=true;S.view='close';render()}); await p.waitForTimeout(200);
const cands=await p.evaluate(()=>[...document.querySelectorAll('.cd-stars [data-ahead]')].map(x=>x.dataset.ahead));
console.log('Looking ahead shows candidates:', JSON.stringify(cands), cands.length>=4);
for(const id of cands.slice(0,4)){await p.click(`.cd-stars [data-ahead="${id}"]`); await p.waitForTimeout(250)}
console.log('up to 3 starred for the next working day:', await p.evaluate(()=>{const n=tmrw();return DB.tasks.filter(x=>x.highlight_day===n).length===3}));
await p.click(`.cd-stars [data-ahead="${cands[0]}"]`); await p.waitForTimeout(250);
console.log('tap again unpicks:', await p.evaluate(id=>DB.tasks.find(x=>x.id===id).highlight_day===null,cands[0]));
await p.screenshot({path:new URL('out/brief-evening.png',import.meta.url).pathname});
await p.evaluate(()=>{S.forceEvening=false;S.view='today';render()});
// meeting countdown card
await p.evaluate(()=>{S.series=[{id:'cs1',name:'Zenara weekly',active:true,order:1}];S.prep={cs1:{next_at:new Date(Date.now()+25*6e4).toISOString(),agenda:[{id:'a1',kind:'decide',text:'Pick the launch date'}],asks:[],inputs:[],questions:[],done:[],doing:[],next:[],blocked:[],decided:[]}};render()}); await p.waitForTimeout(200);
console.log('call within the hour: countdown and points:', await p.evaluate(()=>{const c=document.querySelector('.next-call.near');return!!c&&/in 2\d min/.test(c.querySelector('.cd').textContent)&&c.textContent.includes('Pick the launch date')}));
console.log('brief lists today\'s call:', await p.evaluate(()=>!!document.querySelector('.brief [data-cs="cs1"]')));
await p.evaluate(()=>{S.prep.cs1.next_at=new Date(Date.now()-10*6e4).toISOString();render()}); await p.waitForTimeout(200);
await p.click('.next-call [data-callfu="cs1"]'); await p.waitForTimeout(200);
console.log('after the call: Add follow-ups opens Capture:', await p.evaluate(()=>document.getElementById('capDlg')?.open!==false&&document.querySelector('#capForm textarea, #capForm input')?.value.startsWith('Follow-up from Zenara weekly')));
await p.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
// Friday edition and a day with no agent row
await p.evaluate(()=>{DB.day_briefs[0].edition='friday';refresh()}); await p.waitForTimeout(500);
console.log('Friday: Your week with decisions and Weekly wrap:', await p.evaluate(()=>{const s=[...document.querySelectorAll('.brief .bsec')].find(x=>x.querySelector('h3').textContent==='Your week');return!!s&&s.textContent.includes('Go with vendor B')&&!!s.querySelector('[data-bskill="week"]')&&(document.querySelector('.brief summary').textContent.includes('Friday wrap'))}));
await p.evaluate(()=>{DB.day_briefs=[];S.day_briefs=[];refresh()}); await p.waitForTimeout(500);
console.log('no agent row: the app builds its own brief:', await p.evaluate(()=>{const s=document.querySelector('.brief summary').textContent;return s.includes(ED[edOf()])&&/need|Nothing needs you/.test(s)&&!s.includes('9 AM lead')}));
// phone
const m=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2}); m.on('pageerror',e=>errs.push(e.message));
await setup(m,{edition:'daily'});
console.log('phone: brief buttons are 44px:', await m.evaluate(()=>[...document.querySelectorAll('.brief .bi-a .tool')].every(x=>x.getBoundingClientRect().height>=44)));
console.log('phone: no sideways scroll:', await m.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1&&document.querySelector('main').scrollWidth<=document.querySelector('main').clientWidth+1));
await m.screenshot({path:new URL('out/brief-phone.png',import.meta.url).pathname});
console.log('errors', errs);
await b.close();
