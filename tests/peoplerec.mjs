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
  sb.from=t=>({select:()=>q(t),
    update:v=>({eq:(_,id)=>{WR.push([t,'update',id,v]);const r=(DB[t]||[]).find(x=>x.id===id);if(r)Object.assign(r,v);return Promise.resolve({error:null})}}),
    upsert:v=>{WR.push([t,'upsert',v.id,v]);const a=DB[t]||(DB[t]=[]);const r=a.find(x=>x.id===v.id);r?Object.assign(r,v):a.push(v);return Promise.resolve({error:null})},
    insert:v=>({select:()=>({single:()=>{const row={id:'x-'+Math.random().toString(36).slice(2,8),created_at:new Date().toISOString(),...v};(DB[t]||(DB[t]=[])).push(row);WR.push([t,'insert',row.id,v]);return Promise.resolve({data:row,error:null})}})}),
    delete:()=>({eq:(_,id)=>{WR.push([t,'delete',id]);DB[t]=(DB[t]||[]).filter(x=>x.id!==id);return Promise.resolve({error:null})}})});
  refresh();
});
await p.waitForTimeout(800);
const view=()=>p.evaluate(()=>({h1:document.querySelector('#view h1')?.textContent,secs:[...document.querySelectorAll('#view section .sh h2')].map(x=>x.textContent+'='+[...x.closest('section').querySelectorAll('[data-person]')].map(y=>y.dataset.person).join(','))}));
console.log('keep in touch on Today:', await p.evaluate(()=>[...document.querySelectorAll('.rail .card')].filter(c=>c.querySelector('h2')?.textContent==='Keep in touch').map(c=>[...c.querySelectorAll('.ritem')].map(r=>r.dataset.person+':'+r.querySelector('span').textContent)).flat()));
await p.evaluate(()=>{S.view='people';render()}); await p.waitForTimeout(150);
console.log('people list:', await view());
console.log('suggested strip:', await p.evaluate(()=>[...document.querySelectorAll('.p-sugrow [data-person]')].map(x=>x.dataset.person)));
await p.click('[data-pf="family"]'); await p.waitForTimeout(100);
console.log('family filter:', await p.evaluate(()=>[...document.querySelectorAll('#view .nrow[data-person]')].map(x=>x.dataset.person)));
await p.click('[data-pf=""]'); await p.click('[data-pok="p5"]'); await p.waitForTimeout(200);
console.log('kept suggestion ->', await p.evaluate(()=>DB.people.find(x=>x.id==='p5').status));
await p.click('#view .nrow[data-person="p1"]'); await p.waitForTimeout(150);
const pg=await p.evaluate(()=>({h1:document.querySelector('#view h1').textContent,stats:[...document.querySelectorAll('.p-stats>div')].map(x=>x.querySelector('span').textContent+':'+x.querySelector('b').textContent),
  projects:[...document.querySelectorAll('#view .p-proj')].map(x=>x.textContent.replace('×','').trim()),weak:document.querySelector('.p-weak')?.textContent,
  works:[...document.querySelectorAll('#view section')].find(s=>s.querySelector('h2')?.textContent==='Works with')?.innerText.replace(/\n+/g,' | '),
  owe:[...document.querySelectorAll('#view .task')].map(x=>x.dataset.tid),linked:[...document.querySelectorAll('#view .lk.tag')].map(x=>x.textContent)}));
console.log('person page:', pg);
await p.selectOption('[data-paddform] select','zen-lau'); await p.fill('[data-paddform] input','Approves'); await p.click('[data-paddform] button'); await p.waitForTimeout(250);
console.log('added to Launches:', await p.evaluate(()=>DB.links.filter(l=>l.from_id==='p1'&&l.kind==='member').map(l=>l.to_id+':'+(l.note||''))));
await p.click('[data-ptalk="p1"]'); await p.waitForTimeout(200);
console.log('talked today saved:', await p.evaluate(()=>!!DB.people.find(x=>x.id==='p1').last_contact_at));
// a person note with no record gets one when edited
await p.evaluate(()=>{S.view='person';S.person='n2';render()}); await p.waitForTimeout(100);
await p.click('[data-editperson="n2"]'); await p.waitForTimeout(100);
await p.check('#personForm input[value="family"]'); await p.click('#personForm button[type="submit"]'); await p.waitForTimeout(300);
console.log('record made from note:', await p.evaluate(()=>{const r=DB.people.find(x=>x.note_id==='n2');return r&&{name:r.name,circles:r.circles,view:S.view,person:S.person===r.id}}));
// new person from the list
await p.evaluate(()=>{S.view='people';render()}); await p.click('[data-editperson=""]'); await p.fill('#personForm input[name="name"]','Erica Swerdlow'); await p.fill('#personForm input[name="aliases"]','Erica, E'); await p.selectOption('#personForm select[name="cadence"]','30');
await p.click('#personForm button[type="submit"]'); await p.waitForTimeout(300);
console.log('new person:', await p.evaluate(()=>{const r=DB.people.find(x=>x.name==='Erica Swerdlow');return r&&{aliases:r.aliases,cadence:r.cadence_days,h1:document.querySelector('#view h1').textContent}}));
// project page shows its people
await p.evaluate(()=>{S.view='project';S.pid='zen-pos';render()}); await p.waitForTimeout(100);
console.log('project people:', await p.evaluate(()=>[...document.querySelectorAll('#view section')].filter(s=>s.querySelector('h2')?.textContent==='People').map(s=>[...s.querySelectorAll('[data-person]')].map(x=>x.dataset.person)).flat()));
await p.evaluate(()=>{S.view='project';S.pid='zenara';render()}); await p.waitForTimeout(100);
console.log('workspace people:', await p.evaluate(()=>[...document.querySelectorAll('#view section')].filter(s=>s.querySelector('h2')?.textContent==='People').map(s=>[...s.querySelectorAll('[data-person]')].map(x=>x.dataset.person)).flat()));
// people map
await p.evaluate(()=>{S.view='people';S.pmode='list';render()}); await p.click('[data-pmode="map"]'); await p.waitForTimeout(1500);
console.log('map:', await p.evaluate(()=>({nodes:document.querySelectorAll('#pmap .pm-n').length,lines:document.querySelectorAll('#pmap line').length,label:document.querySelector('#pmap svg')?.getAttribute('aria-label')})));
await p.screenshot({path:new URL('./out/people-map.png', import.meta.url).pathname});
await p.evaluate(()=>{S.view='person';S.person='p1';render()}); await p.waitForTimeout(100);
await p.screenshot({path:new URL('./out/person-rec.png', import.meta.url).pathname,fullPage:true});
await p.setViewportSize({width:390,height:844}); await p.waitForTimeout(200);
console.log('phone overflow:', await p.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth));
await p.screenshot({path:new URL('./out/person-phone.png', import.meta.url).pathname,fullPage:true});
await p.evaluate(()=>{document.documentElement.dataset.theme='dark'}); await p.screenshot({path:new URL('./out/person-dark.png', import.meta.url).pathname});
console.log('errors', errs);
await b.close();
