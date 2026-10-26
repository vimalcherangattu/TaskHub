import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const errs=[];
const p=await b.newPage({viewport:{width:1440,height:1000}}); p.on('pageerror',e=>errs.push(e.message));
await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(1000);
await p.evaluate(()=>{
  const t0=T(),d=n=>{const x=new Date();x.setDate(x.getDate()+n);return iso2(x)},ago=h=>new Date(Date.now()-h*36e5).toISOString();
  window.DB={projects:[{id:'zenara',name:'Zenara',area:'Career',color:'#1F8A8A'},{id:'zen-pos',name:'Positioning',area:'Career',parent_id:'zenara',color:'#2F6DB5'},{id:'zen-lau',name:'Launches',area:'Career',parent_id:'zenara',color:'#C4412F'},{id:'home',name:'Home',area:'Life',color:'#D0662A'},{id:'old',name:'Old launch',area:'Products',color:'#7A4FB0'}],
   tasks:[
    {id:'t1',title:'Sign-off on positioning doc',project_id:'zen-pos',status:'waiting',waiting_on:'David',waiting_since:ago(50),follow_up_on:d(1),priority:'high',steps:[],activity:[],blocked_by:[]},
    {id:'t2',title:'Send David the HLTH brief',project_id:'zen-lau',status:'todo',priority:'med',today_date:t0,steps:[],activity:[],blocked_by:[]},
    {id:'t3',title:'Call Jaya about Diwali',project_id:'home',status:'todo',priority:'low',steps:[],activity:[],blocked_by:[]},{id:'t4',title:'Ship old launch',project_id:'old',status:'done',done_at:ago(100),priority:'med',steps:[],activity:[],blocked_by:[]},{id:'t5',title:'Secret salary talk prep',project_id:'home',status:'todo',priority:'med',today_date:t0,private:true,steps:[],activity:[],blocked_by:[]}],
   notes:[
    {id:'n1',kind:'person',title:'David McMahon: manager',body:'Australian, based in LA.',project_id:'zenara',created_at:ago(300)},
    {id:'n2',kind:'person',title:'Cabo',body:'Dog.',project_id:'home',created_at:ago(300)},
    {id:'n3',kind:'decision',title:'Pricing tiers: keep three',body:'Agreed with David and Ravi.',project_id:'zen-pos',created_at:ago(40)}],
   people:[
    {id:'p1',name:'David McMahon',aliases:['Dave','David'],emails:[],org:'Zenara',role:'Manager',circles:['work'],note_id:'n1',status:'active'},
    {id:'p2',name:'Ravi Hariprasad',aliases:['Ravi'],emails:[],org:'Zenara',role:null,circles:['work'],status:'active'},
    {id:'p3',name:'David Kumar',aliases:[],emails:[],circles:['network'],status:'active'},
    {id:'p4',name:'Jaya',aliases:[],emails:[],role:'Mother',circles:['family'],cadence_days:7,last_contact_at:ago(24*12),status:'active'},
    {id:'p5',name:'Meera Iyer',aliases:[],emails:[],role:'Clinic owner',circles:[],status:'suggested'}],
   links:[
    {id:'l1',from_type:'person',from_id:'p1',to_type:'project',to_id:'zen-pos',kind:'member',note:'Decides'},
    {id:'l2',from_type:'person',from_id:'p2',to_type:'project',to_id:'zen-pos',kind:'member',note:null},
    {id:'l3',from_type:'person',from_id:'p1',to_type:'project',to_id:'zen-lau',kind:'related',note:'Came up in calls'},
    {id:'l4',from_type:'note',from_id:'n3',to_type:'person',to_id:'p1',kind:'mentions'}],
   sources:[{id:'s1',title:'GTM sync',occurred_at:ago(30),attendees:['David McMahon','Ravi Hariprasad','Vimal'],project_id:'zen-pos',summary:'Pricing'},
            {id:'s2',title:'1:1',occurred_at:ago(80),attendees:['David McMahon','Vimal'],project_id:'zenara',summary:'Plan'}],
   call_series:[],agenda_items:[],inputs:[],input_uses:[]};
  window.WR=[];
  const q=t=>{const o={then:(r,j)=>Promise.resolve({data:JSON.parse(JSON.stringify(DB[t]||[])),error:null}).then(r,j),order:()=>o,limit:()=>o,gte:()=>o};return o};
  sb.rpc=()=>Promise.resolve({data:null,error:null});
  window.NET=true;const net=()=>Promise.resolve(window.NET?{error:null}:{error:{message:'TypeError: Failed to fetch'}});
  sb.from=t=>({select:()=>Object.assign(q(t),{range:()=>q(t)}),
    update:v=>({eq:(_,id)=>{if(!NET)return net();WR.push([t,'update',id,v]);const r=(DB[t]||[]).find(x=>x.id===id);if(r)Object.assign(r,v);return Promise.resolve({error:null})}}),
    upsert:v=>{if(!NET)return net();WR.push([t,'upsert',v.id,v]);const a=DB[t]||(DB[t]=[]);const r=a.find(x=>x.id===v.id);r?Object.assign(r,v):a.push(v);return Promise.resolve({error:null})},
    insert:v=>({select:()=>({single:()=>{if(!NET)return Promise.resolve({data:null,error:{message:'TypeError: Failed to fetch'}});const row={id:'x-'+Math.random().toString(36).slice(2,8),created_at:new Date().toISOString(),...v};(DB[t]||(DB[t]=[])).push(row);WR.push([t,'insert',row.id,v]);return Promise.resolve({data:row,error:null})}})}),
    delete:()=>({eq:(_,id)=>{WR.push([t,'delete',id]);DB[t]=(DB[t]||[]).filter(x=>x.id!==id);return Promise.resolve({error:null})}})});
  refresh();
});
await p.waitForTimeout(800);
// archive: blocked while tasks are open, then hidden from the sidebar and listed in Archive
await p.evaluate(()=>openProj(S.projects.find(x=>x.id==='home'))); await p.click('#archProj'); await p.waitForTimeout(150);
console.log('archive with open tasks blocked:', await p.evaluate(()=>!S.projects.find(x=>x.id==='home').archivedAt&&document.getElementById('toast')?.textContent));
await p.click('#projDlg [data-close]');
await p.evaluate(()=>openProj(S.projects.find(x=>x.id==='old'))); await p.click('#archProj'); await p.waitForTimeout(250);
console.log('archived:', await p.evaluate(()=>({view:S.view,rows:[...document.querySelectorAll('#view .nrow')].map(x=>x.textContent),side:[...document.querySelectorAll('#side [data-proj]')].map(x=>x.dataset.proj),nav:!!document.querySelector('#side [data-go="archive"]'),picker:[...new DOMParser().parseFromString(projOptions(null),'text/html').querySelectorAll('option')].map(o=>o.value)})));
await p.evaluate(()=>{S.view='project';S.pid='old';render()}); console.log('archived page sub:', await p.evaluate(()=>document.querySelector('#view .sub').textContent));
await p.evaluate(()=>openProj(S.projects.find(x=>x.id==='old'))); await p.click('#archProj'); await p.waitForTimeout(250);
console.log('brought back:', await p.evaluate(()=>!S.projects.find(x=>x.id==='old').archivedAt&&[...document.querySelectorAll('#side [data-proj]')].some(x=>x.dataset.proj==='old')));
// offline: edits and a new task wait in the outbox, then sync in order
await p.evaluate(()=>{S.view='today';render();NET=false});
await p.evaluate(async()=>{await upd('t3',{title:'Call Jaya about Diwali plans'});await addTask({title:'Buy diyas',projectId:'home'})}); await p.waitForTimeout(200);
console.log('offline:', await p.evaluate(()=>({queued:OB.q.map(o=>o.op+':'+o.t),chip:document.getElementById('outbox').hidden?'':document.getElementById('outbox').textContent,local:S.tasks.some(x=>x.title==='Buy diyas'),saved:JSON.parse(localStorage.getItem('ambalam.outbox.v1')).length,dbHas:DB.tasks.some(x=>x.title==='Buy diyas')})));
await p.evaluate(()=>{NET=true;dispatchEvent(new Event('online'))}); await p.waitForTimeout(600);
console.log('back online:', await p.evaluate(()=>({queued:OB.q.length,chip:document.getElementById('outbox').hidden,db:DB.tasks.filter(x=>x.title==='Buy diyas'||x.title==='Call Jaya about Diwali plans').map(x=>x.id.slice(0,2)+':'+x.title)})));
// private
console.log('private row blurred:', await p.evaluate(()=>{const r=document.querySelector('.task[data-tid="t5"]');return r&&r.classList.contains('priv')&&getComputedStyle(r.querySelector('.title')).filter}));
await p.evaluate(()=>openNote(S.notes.find(n=>n.id==='n3'))); await p.check('#noteForm input[name="private"]'); await p.click('#noteForm button[type="submit"]'); await p.waitForTimeout(300);
await p.evaluate(()=>{S.view='notes';render()}); 
console.log('private note:', await p.evaluate(()=>({db:DB.notes.find(n=>n.id==='n3').private,row:document.querySelector('.nrow[data-editnote="n3"]').className,label:document.querySelector('.nrow[data-editnote="n3"]').getAttribute('aria-label')})));
await p.evaluate(()=>openTask(S.tasks.find(t=>t.id==='t2'))); await p.waitForTimeout(100);await p.evaluate(()=>{document.getElementById('tsMore').open=true});
await p.check('#taskForm input[name="private"]'); await p.click('#taskForm button[type="submit"]'); await p.waitForTimeout(300);
console.log('private task saved:', await p.evaluate(()=>DB.tasks.find(t=>t.id==='t2').private));
// chat link on a task
await p.evaluate(()=>{S.view='today';render();setPeek('t3')}); await p.waitForTimeout(150);
await p.fill('[data-chatform] input','https://example.com/x'); await p.click('[data-chatform] button'); await p.waitForTimeout(150);
console.log('bad link refused:', await p.evaluate(()=>DB.tasks.find(t=>t.id==='t3').chat_url||'none'));
await p.fill('[data-chatform] input','https://claude.ai/chat/abc-123'); await p.click('[data-chatform] button'); await p.waitForTimeout(250);
console.log('chat link saved:', await p.evaluate(()=>({db:DB.tasks.find(t=>t.id==='t3').chat_url,btn:[...document.querySelectorAll('#peek [data-claude]')].map(x=>x.textContent)})));
await p.screenshot({path:new URL('./out/peek-chat.png', import.meta.url).pathname});
// export
const [dl]=await Promise.all([p.waitForEvent('download'),p.evaluate(()=>exportAll())]);
const path=await dl.path();const fs=await import('fs');const j=JSON.parse(fs.readFileSync(path,'utf8'));
console.log('export json:', dl.suggestedFilename(), Object.keys(j).filter(k=>Array.isArray(j[k])).map(k=>k+'='+j[k].length).join(' '));
const dl2=await p.waitForEvent('download');const md=fs.readFileSync(await dl2.path(),'utf8');
console.log('export md:', dl2.suggestedFilename(), md.split('\n').filter(l=>l.startsWith('#')).slice(0,6));
console.log('mic shown only with dictation:', await p.evaluate(()=>!!(window.SpeechRecognition||window.webkitSpeechRecognition)===!document.getElementById('capMic').hidden));
console.log('errors', errs);
await b.close();
