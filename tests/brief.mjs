import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
// The morning page on Today (after Dia's brief, redesigned 19 Nov): it opens Today once in the morning, then sits behind the brief chip.
// Push your work forward (Let's do it opens Claude), Top to-dos with a tick (agent items, hard deadlines, owed_to, the lead's picks, the triage),
// Your day as a timeline with Prep me, numbered New updates, Your week on Monday and Friday, Looking ahead, quick-look prompts, the meeting card
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
      {id:'p',section:'push',text:'Turn Jas\'s answers into the email segments',body:'Jas replied overnight. I can draft the segment filters.',prompt:'Draft the segment filters from Jas\'s answers.',url:'https://linear.app/x/issue/ZEN-7740'},
      {id:'1',section:'needs_you',tag:'needs_you',text:'Reply to Deepak about tracking',body:'He asked on Friday whether the pixel fires twice.',ref_type:'task',ref_id:'r1',url:'https://mail.google.com/mail/u/0/#inbox/abc'},
      {id:'5',section:'ahead',text:'7:30 PM Post the AI-tool questions video',body:'Video and thumbnail are named in the event.',source:'calendar'},
      {id:'2',section:'needs_you',tag:'awaiting',text:'Linear: COM-612 needs your review',url:'https://linear.app/x/issue/COM-612'},
      {id:'3',section:'heads_up',text:'Clash: Zenara standup overlaps the dentist at 4pm'},
      {id:'4',section:'updates',tag:'active',text:'Kara sent the final copy',project:'HLTH campaign',body:'It is in the shared folder.'}]}],
    call_series:[],agenda_items:[]};
    const q=t=>{const o={then:(r,j)=>Promise.resolve({data:JSON.parse(JSON.stringify(DB[t]||[])),error:null}).then(r,j),order:()=>o,limit:()=>o,gte:()=>o};return o};
    sb.rpc=()=>Promise.resolve({data:null,error:null});
    sb.from=t=>{const tb=DB[t]||(DB[t]=[]);return{select:()=>q(t),
      update:row=>({eq:(c,id)=>{const r=tb.find(x=>x.id===id);if(r)Object.assign(r,row);return Promise.resolve({error:null})}}),
      upsert:row=>{const r=tb.find(x=>x.id===row.id);if(r)Object.assign(r,row);else tb.push({...row});return Promise.resolve({error:null})},
      delete:()=>({eq:(c,id)=>{const i=tb.findIndex(x=>x.id===id);if(i>=0)tb.splice(i,1);return Promise.resolve({error:null})}}),
      insert:row=>({select:()=>({single:()=>{const r={id:'new'+tb.length,...row};tb.push(r);return Promise.resolve({data:{...r},error:null})}})})}};
    try{localStorage.removeItem('ambalam.brief.v1')}catch{}
    localStorage.removeItem('ambalam.briefread');localStorage.removeItem('ambalam.planned');S.tmode=null; // the morning page opens Today on its own (forced morning below)
    window.istHour=()=>9;
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
const sec=h=>p.evaluate(h=>[...document.querySelectorAll('.bf section')].find(x=>x.getAttribute('aria-label')===h)?.textContent||'',h);
console.log('morning: Today opens on the brief, once:', await p.evaluate(()=>!!document.querySelector('#view .bf')&&localStorage.getItem('ambalam.briefread')===T()&&S.tmode==='brief'));
console.log('headline from the lead, edition name:', await p.evaluate(()=>document.querySelector('.bf-h').textContent.includes('Two people are waiting')&&document.querySelector('.bf-h').textContent.includes('9 AM lead')&&document.querySelector('.bf-h h1').textContent===parse(T()).toLocaleDateString('en-GB',{weekday:'long'})+' brief'));
const secs=await p.evaluate(()=>[...document.querySelectorAll('.bf section')].map(x=>x.getAttribute('aria-label')));
console.log('sections:', JSON.stringify(secs), ['Push your work forward','Top to-dos','Your day','New updates','Your week'].every(x=>secs.includes(x)));
console.log('push: the lead\'s item with its source:', await p.evaluate(()=>{const s=document.querySelector('.bf-push');return s.textContent.includes('email segments')&&s.textContent.includes('I can draft')&&!!s.querySelector('a.bf-src[href^="https://linear.app"]')}));
await p.click('[data-bpush]'); await p.waitForTimeout(200);
console.log('Let\'s do it opens Claude with the prompt:', await p.evaluate(()=>{const u=decodeURIComponent(opened.at(-1)||'');return u.startsWith('https://claude.ai/new?q=')&&u.includes('task-hub skill')&&u.includes('Draft the segment filters')&&u.includes('linear.app')}));
const td=await sec('Top to-dos');
console.log('to-dos: agent item, hard deadline, owed, lead pick, triage:', ['Reply to Deepak about tracking','pixel fires twice','File the GST return','Hard deadline','Send Asha the pricing sheet','Asha is waiting','Ravi is waiting','Ship the Flow deck','two tasks wait on it','past its date'].every(x=>td.includes(x))&&!td.includes('My own star'));
console.log('every task to-do has a tick:', await p.evaluate(()=>[...document.querySelectorAll('.bf-td li')].filter(l=>!l.querySelector('[data-triage]')).every(l=>l.querySelector('button.bf-tick'))));
const dy=await sec('Your day');
console.log('your day: the lead\'s 7:30 PM item on the timeline:', dy.includes('7:30pm')&&dy.includes('Post the AI-tool questions video')&&dy.includes('named in the event'));
const up=await sec('New updates');
console.log('updates: numbered, project in italics, heads up, changes; old ones skipped:', up.includes('01')&&up.includes('Kara sent the final copy')&&(await p.evaluate(()=>[...document.querySelectorAll('.bf-up em')].map(e=>e.textContent))).includes('HLTH campaign')&&up.includes('dentist')&&up.includes('Pricing page copy')&&!up.includes('Old change'));
console.log('Monday: your week with slipped and hard:', await p.evaluate(()=>{const s=[...document.querySelectorAll('.bf section')].find(x=>x.getAttribute('aria-label')==='Your week')?.textContent||'';return s.includes('Old one that slipped')&&s.includes('File the GST return')}));
await p.screenshot({path:new URL('out/brief.png',import.meta.url).pathname,fullPage:true});
// feedback
await p.click('.bf [data-bfb="no"][data-k="2"]'); await p.waitForTimeout(300);
console.log('Not useful saved and hidden:', await p.evaluate(()=>DB.day_briefs[0].feedback['2']==='no'&&!document.querySelector('.bf [data-k="2"]')));
await p.click('.bf .bf-tick[data-k="1"]'); await p.waitForTimeout(400);
console.log('tick on an agent item closes its task:', await p.evaluate(()=>DB.day_briefs[0].feedback['1']==='done'&&DB.tasks.find(x=>x.id==='r1').status==='done'));
await p.click('.bf [data-hino="p1"]'); await p.waitForTimeout(400);
console.log('Not useful on a lead pick unstars and logs it:', await p.evaluate(()=>{const t=DB.tasks.find(x=>x.id==='p1');return t.highlight_day===null&&t.activity.some(a=>a.text==='Routine pick rejected: not useful')&&!document.querySelector('.bf [data-hino]')}));
await p.click('.bf-tick[data-quickdone="o2"]'); await p.waitForTimeout(300);
console.log('tick on an owed task:', await p.evaluate(()=>DB.tasks.find(x=>x.id==='o2').status==='done'));
// leaving: Plan the day, then the chip brings it back
await p.click('.bf-f [data-tmode]'); await p.waitForTimeout(200);
console.log('footer goes on to Plan the day:', await p.evaluate(()=>!document.querySelector('.bf')&&S.tmode==='plan'));
await p.evaluate(()=>{S.tmode=null;render()}); await p.waitForTimeout(100);
console.log('read today: it does not open again by itself:', await p.evaluate(()=>!document.querySelector('.bf')));
await p.evaluate(()=>{S.tmode='list';render()}); await p.waitForTimeout(100);
await p.click('.tchips [data-tmode="brief"]'); await p.waitForTimeout(200);
console.log('the brief chip opens it again:', await p.evaluate(()=>!!document.querySelector('.bf')));
await p.evaluate(()=>{S.tmode='list';render()});
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
console.log('task sheet saves Owed to:', await p.evaluate(()=>DB.tasks.find(x=>x.id==='w2').owed_to==='Kara'&&(S.tmode='brief',render(),document.querySelector('.bf').textContent.includes('Kara is waiting'))));
await p.evaluate(()=>{S.tmode='list';render()});
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
await p.evaluate(()=>{S.tmode='brief';S.bdsel=null;render()}); await p.waitForTimeout(150);
console.log('your day: the call is picked, with Prep me:', await p.evaluate(()=>{const d=document.querySelector('.bf-dd');return d.textContent.includes('Zenara weekly')&&d.textContent.includes('Pick the launch date')&&!!d.querySelector('[data-cs="cs1"]')}));
await p.click('.bf-tl [data-bdsel="1"]'); await p.waitForTimeout(150);
console.log('picking another time shows its details:', await p.evaluate(()=>document.querySelector('.bf-dd').textContent.includes('Post the AI-tool questions video')));
await p.evaluate(()=>{S.tmode='list';render()});
await p.evaluate(()=>{S.prep.cs1.next_at=new Date(Date.now()-10*6e4).toISOString();render()}); await p.waitForTimeout(200);
await p.click('.next-call [data-callfu="cs1"]'); await p.waitForTimeout(200);
console.log('after the call: Add follow-ups opens Capture:', await p.evaluate(()=>document.getElementById('capDlg')?.open!==false&&document.querySelector('#capForm textarea, #capForm input')?.value.startsWith('Follow-up from Zenara weekly')));
await p.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
// Friday edition and a day with no agent row
await p.evaluate(()=>{DB.day_briefs[0].edition='friday';refresh()}); await p.waitForTimeout(500);
await p.evaluate(()=>{S.tmode='brief';render()}); await p.waitForTimeout(100);
console.log('Friday: Your week with decisions and Weekly wrap:', await p.evaluate(()=>{const s=document.querySelector('.bf-wk');return!!s&&s.textContent.includes('Go with vendor B')&&!!s.querySelector('[data-bskill="week"]')&&document.querySelector('.bf-h h1').textContent==='Friday wrap'}));
await p.evaluate(()=>{DB.day_briefs=[];S.day_briefs=[];refresh()}); await p.waitForTimeout(500);
console.log('no agent row: the app builds its own brief:', await p.evaluate(()=>{const h=document.querySelector('.bf-h').textContent,ps=document.querySelector('.bf-push')?.textContent||'';return / with .*\. Plenty of room/.test(h)&&!h.includes('9 AM lead')&&ps.includes('Claude can')}));
await p.click('[data-bpush]'); await p.waitForTimeout(200);
console.log('no agent row: Let\'s do it sends the task to Claude:', await p.evaluate(()=>{const u=decodeURIComponent(opened.at(-1)||'');return u.includes('Task: ')&&u.includes('task-hub skill')}));
// phone
const m=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2}); m.on('pageerror',e=>errs.push(e.message));
await setup(m,{edition:'daily'});
console.log('phone: brief buttons are 44px:', await m.evaluate(()=>[...document.querySelectorAll('.bf .bf-fb,.bf .bf-tick,.bf .bf-lets,.bf .bf-ti')].every(x=>x.getBoundingClientRect().height>=44)));
console.log('phone: no sideways scroll:', await m.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1&&document.querySelector('main').scrollWidth<=document.querySelector('main').clientWidth+1));
await m.screenshot({path:new URL('out/brief-phone.png',import.meta.url).pathname});
console.log('errors', errs);
await b.close();
