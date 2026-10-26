import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const errs=[];
const p=await b.newPage({viewport:{width:1440,height:1000}}); p.on('pageerror',e=>errs.push(e.message));
await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(1000);
await p.evaluate(()=>{
  const t0=T(),d=n=>{const x=new Date();x.setDate(x.getDate()+n);return iso2(x)},ago=h=>new Date(Date.now()-h*36e5).toISOString();
  window.DB={projects:[{id:'zenara',name:'Zenara',area:'Career',color:'#1F8A8A'},{id:'zen-pos',name:'Positioning',area:'Career',parent_id:'zenara',color:'#2F6DB5'},{id:'zen-lau',name:'Launches',area:'Career',parent_id:'zenara',color:'#C4412F'},{id:'home',name:'Home',area:'Life',color:'#D0662A'}],
   tasks:[
    {id:'t1',title:'Sign-off on positioning doc',project_id:'zen-pos',status:'waiting',waiting_on:'David',waiting_since:ago(50),follow_up_on:d(1),priority:'high',steps:[],activity:[],blocked_by:[]},
    {id:'t2',title:'Send David the HLTH brief',project_id:'zen-lau',status:'todo',priority:'med',today_date:t0,steps:[],activity:[],blocked_by:[]},
    {id:'t3',title:'Call Jaya about Diwali',project_id:'home',status:'todo',priority:'low',steps:[],activity:[],blocked_by:[]}],
   notes:[
    {id:'n1',kind:'person',title:'David McMahon: manager',body:'Australian, based in LA. Leads [[Launches]] reviews.',project_id:'zenara',created_at:ago(300)},
    {id:'n2',kind:'person',title:'Cabo',body:'Dog.',project_id:'home',created_at:ago(300)},
    {id:'n3',kind:'decision',title:'Pricing tiers: keep three',body:'Agreed with David and Ravi.',project_id:'zen-pos',created_at:ago(40)},{id:'n4',kind:'idea',title:'Free plan attracts the wrong pricing buyers',body:'Tiers matter more than discounts.',project_id:'home',tags:['pricing'],created_at:ago(20)},{id:'n5',kind:'fact',title:'Launch checklist lives in Notion',body:'',project_id:'zen-lau',created_at:ago(10)}],
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
  sb.from=t=>({select:()=>q(t),
    update:v=>({eq:(_,id)=>{WR.push([t,'update',id,v]);const r=(DB[t]||[]).find(x=>x.id===id);if(r)Object.assign(r,v);return Promise.resolve({error:null})}}),
    upsert:v=>{WR.push([t,'upsert',v.id,v]);const a=DB[t]||(DB[t]=[]);const r=a.find(x=>x.id===v.id);r?Object.assign(r,v):a.push(v);return Promise.resolve({error:null})},
    insert:v=>({select:()=>({single:()=>{const row={id:'x-'+Math.random().toString(36).slice(2,8),created_at:new Date().toISOString(),...v};(DB[t]||(DB[t]=[])).push(row);WR.push([t,'insert',row.id,v]);return Promise.resolve({data:row,error:null})}})}),
    delete:()=>({eq:(_,id)=>{WR.push([t,'delete',id]);DB[t]=(DB[t]||[]).filter(x=>x.id!==id);return Promise.resolve({error:null})}})});
  refresh();
});
await p.waitForTimeout(800);
const ta='#noteForm textarea[name="body"]';
await p.evaluate(()=>openNote(null,'zen-pos')); await p.waitForTimeout(100);
await p.fill('#noteForm input[name="title"]','Pricing call notes');
await p.click(ta); await p.keyboard.type('Talked to [[Dav');
await p.waitForTimeout(100);
console.log('picker:', await p.evaluate(()=>[...document.querySelectorAll('#noteForm .wpick [role=option]')].map(x=>x.textContent)));
await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter');
await p.keyboard.type(' about [[pricing tiers'); await p.waitForTimeout(80); await p.keyboard.press('Enter');
console.log('body:', await p.inputValue(ta));
await p.click('#noteForm button[type="submit"]'); await p.waitForTimeout(400);
console.log('links made:', await p.evaluate(()=>DB.links.filter(l=>l.kind==='mentions'&&l.from_type==='note'&&l.from_id!=='n3').map(l=>l.to_type+':'+l.to_id)));
await p.evaluate(()=>{S.view='person';S.person='p1';render()}); await p.waitForTimeout(100);
console.log('person linked here:', await p.evaluate(()=>[...document.querySelectorAll('#view .lk.tag')].map(x=>x.textContent)));
console.log('wiki link in note body:', await p.evaluate(()=>[...document.querySelectorAll('#view .wl')].map(x=>x.dataset.wl)));
await p.click('#view .wl'); await p.waitForTimeout(100);
console.log('opened:', await p.evaluate(()=>S.view+':'+S.pid));
// removing the [[...]] removes the link
const nid=await p.evaluate(()=>DB.notes.find(n=>n.title==='Pricing call notes').id);
await p.evaluate(id=>openNote(S.notes.find(n=>n.id===id)),nid); await p.waitForTimeout(100);
await p.fill(ta,'Talked to [[David McMahon]] only.'); await p.click('#noteForm button[type="submit"]'); await p.waitForTimeout(400);
console.log('after edit:', await p.evaluate(id=>DB.links.filter(l=>l.from_id===id).map(l=>l.to_type+':'+l.to_id),nid));
// might be related + link it
await p.evaluate(()=>openNote(S.notes.find(n=>n.id==='n3'))); await p.waitForTimeout(100);
console.log('note editor links:', await p.evaluate(()=>({linked:[...document.querySelectorAll('#noteLinks .lk.tag')].map(x=>x.textContent),rel:[...document.querySelectorAll('#noteLinks .rel-row .lk b')].map(x=>x.textContent)})));
await p.click('#noteLinks [data-linkrel]'); await p.waitForTimeout(300);
console.log('related link saved:', await p.evaluate(()=>DB.links.filter(l=>l.kind==='related'&&l.from_type==='note').map(l=>l.from_id+'->'+l.to_id)), 'suggestions left:', await p.evaluate(()=>document.querySelectorAll('#noteLinks .rel-row').length));
await p.screenshot({path:new URL('./out/note-links.png', import.meta.url).pathname});
await p.click('#noteDlg [data-close]');
// task notes link too
await p.evaluate(()=>openTask(S.tasks.find(t=>t.id==='t2'))); await p.waitForTimeout(150);
await p.evaluate(()=>{const d=document.querySelector('#taskForm details');if(d)d.open=true});
const tn='#taskForm textarea[name="notes"]';await p.click(tn); await p.keyboard.type('See [[Launch check'); await p.waitForTimeout(80); await p.keyboard.press('Enter');
await p.click('#taskForm button[type="submit"]'); await p.waitForTimeout(400);
console.log('task link:', await p.evaluate(()=>DB.links.filter(l=>l.from_type==='task').map(l=>l.from_id+'->'+l.to_type+':'+l.to_id)));
await p.evaluate(()=>setPeek('t2')); await p.waitForTimeout(150);
await p.evaluate(()=>{S.view='today';render()});
console.log('errors', errs);
await b.close();
