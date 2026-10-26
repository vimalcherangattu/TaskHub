import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const errs=[];
const p=await b.newPage({viewport:{width:1440,height:1000}}); p.on('pageerror',e=>errs.push(e.message));
await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(1000);
await p.evaluate(()=>{
  const t0=T(),d=n=>{const x=new Date();x.setDate(x.getDate()+n);return iso2(x)},ago=h=>new Date(Date.now()-h*36e5).toISOString();
  window.DB={projects:[{id:'zenara',name:'Zenara',area:'Career',color:'#1F8A8A'},{id:'zen-pos',name:'Positioning',area:'Career',parent_id:'zenara',color:'#2F6DB5',life_area:'work'},{id:'zen-lau',name:'Launches',area:'Career',parent_id:'zenara',color:'#C4412F'},{id:'home',name:'Home',area:'Life',color:'#D0662A'},{id:'old',name:'Old launch',area:'Products',color:'#7A4FB0'},{id:'admin-finance',name:'Admin & finance',area:'Life',color:'#3E8A57',life_area:'money'}],
   tasks:[
    {id:'t1',title:'Sign-off on positioning doc',project_id:'zen-pos',status:'waiting',waiting_on:'David',waiting_since:ago(50),follow_up_on:d(1),priority:'high',steps:[],activity:[],blocked_by:[]},
    {id:'t2',title:'Send David the HLTH brief',project_id:'zen-lau',status:'todo',priority:'med',today_date:t0,steps:[],activity:[],blocked_by:[]},
    {id:'t3',title:'Call Jaya about Diwali',project_id:'home',status:'todo',priority:'low',steps:[],activity:[],blocked_by:[]},{id:'t4',title:'Ship old launch',project_id:'old',status:'done',done_at:ago(100),priority:'med',steps:[],activity:[],blocked_by:[]},{id:'tr1',title:'Renew Netflix',project_id:'home',status:'done',done_at:ago(5),priority:'low',steps:[],activity:[],blocked_by:[]},{id:'t5',title:'Secret salary talk prep',project_id:'home',status:'todo',priority:'med',today_date:t0,private:true,steps:[],activity:[],blocked_by:[]}],
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

   life_areas:[{id:'work',name:'Work',standard:'No weekend work',status:'good',order:1,color:'#2F6DB5'},{id:'health',name:'Health',standard:'Move 4x a week',status:'watch',status_note:'Sleep slipping',order:3,color:'#1F8A8A'},{id:'money',name:'Money',standard:'6 months saved',status:'off',order:4,color:'#3E8A57'}],
   goals:[{id:'gy',title:'Two products earning',horizon:'year',period_start:T().slice(0,4)+'-01-01',area_id:'work',measure:'milestones',status:'active',created_at:ago(24*60)},
          {id:'gq',title:'Launch Positioning',horizon:'quarter',period_start:(()=>{const x=new Date();return iso2(new Date(x.getFullYear(),Math.floor(x.getMonth()/3)*3,1))})(),parent_id:'gy',area_id:'work',measure:'milestones',status:'active',created_at:ago(24*60),updated_at:ago(24*30)},
          {id:'gn',title:'Emergency fund',horizon:'quarter',period_start:(()=>{const x=new Date();return iso2(new Date(x.getFullYear(),Math.floor(x.getMonth()/3)*3,1))})(),area_id:'money',measure:'number',target:6,current:2,unit:'months',status:'active',created_at:ago(24*60),updated_at:ago(24*40)},
          {id:'gp',title:'Last quarter goal',horizon:'quarter',period_start:(()=>{const x=new Date();return iso2(new Date(x.getFullYear(),Math.floor(x.getMonth()/3)*3-3,1))})(),area_id:'work',measure:'done',status:'active',created_at:ago(24*120)}],
   habits:[{id:'h1',title:'Meditate',cadence:'daily',part_of_day:'morning',active:true,area_id:'health'},{id:'h2',title:'Walk',cadence:'weekly',per_week:3,part_of_day:'day',active:true,area_id:'health',goal_id:'gn'}],
   habit_logs:[{id:'hl1',habit_id:'h1',day:d(-1),done:true},{id:'hl2',habit_id:'h1',day:d(-2),done:true},{id:'hl3',habit_id:'h1',day:d(-3),done:false,skipped:true},{id:'hl4',habit_id:'h1',day:d(-4),done:true}],
   daily_log:[{id:'dl1',day:d(-1),energy:4,mood:3,line:'Long but good',win:'Shipped it'}],compass:[{id:1,vision:null,values:[],not_doing:[]}],
   reviews:[{id:'rold',kind:'weekly',period_start:'2025-01-06',status:'draft',draft:{},answers:{},step:0}],
   records:[{id:'rec1',title:'Passport',kind:'id',area_id:'money',renews_on:d(400),every_months:120,remind_days:90,currency:'INR',url:'https://drive.google.com/x'},
            {id:'rec2',title:'Car insurance',kind:'policy',area_id:'money',renews_on:d(10),every_months:12,remind_days:30,amount:18000,currency:'INR'},
            {id:'rec3',title:'Netflix',kind:'subscription',area_id:'rest',renews_on:d(-3),every_months:1,remind_days:5,task_id:'tr1',currency:'INR'}],
   metrics:[],metric_logs:[],
   call_series:[],agenda_items:[],inputs:[],input_uses:[]};
  window.WR=[];
  const q=t=>{const o={then:(r,j)=>Promise.resolve({data:JSON.parse(JSON.stringify(DB[t]||[])),error:null}).then(r,j),order:()=>o,limit:()=>o,gte:()=>o};return o};
  sb.rpc=()=>Promise.resolve({data:null,error:null});
  window.NET=true;const net=()=>Promise.resolve(window.NET?{error:null}:{error:{message:'TypeError: Failed to fetch'}});
  sb.from=t=>({select:()=>Object.assign(q(t),{range:()=>q(t)}),
    update:v=>({eq:(_,id)=>{if(!NET)return net();WR.push([t,'update',id,v]);const r=(DB[t]||[]).find(x=>x.id==id);if(r)Object.assign(r,v);return Promise.resolve({error:null})}}),
    upsert:v=>{if(!NET)return net();WR.push([t,'upsert',v.id,v]);const a=DB[t]||(DB[t]=[]);const r=a.find(x=>x.id===v.id);r?Object.assign(r,v):a.push(v);return Promise.resolve({error:null})},
    insert:v=>({select:()=>({single:()=>{if(!NET)return Promise.resolve({data:null,error:{message:'TypeError: Failed to fetch'}});const row={id:'x-'+Math.random().toString(36).slice(2,8),created_at:new Date().toISOString(),...v};(DB[t]||(DB[t]=[])).push(row);WR.push([t,'insert',row.id,v]);return Promise.resolve({data:row,error:null})}})}),
    delete:()=>({eq:(_,id)=>{WR.push([t,'delete',id]);DB[t]=(DB[t]||[]).filter(x=>x.id!==id);return Promise.resolve({error:null})}})});
  sb.from=((f)=>t=>{const o=f(t);const sel=o.select;o.select=()=>{const q=sel();q.gte=()=>q;return q};return o})(sb.from);
  refresh();
});
await p.waitForTimeout(1200);
const ev=(f,a)=>p.evaluate(f,a);
// periods: what each review looks back on, and when it's ready
console.log('periods:', await ev(()=>[rvPeriod('weekly','2026-10-25'),rvPeriod('weekly','2026-10-27'),rvPeriod('monthly','2026-11-01'),rvPeriod('quarterly','2026-10-03'),rvPeriod('yearly','2026-12-28'),rvPeriod('yearly','2027-01-05')].join(' ')));
console.log('open:', await ev(()=>[rvOpen('weekly','2026-10-25'),rvOpen('weekly','2026-10-29'),rvOpen('monthly','2026-11-03'),rvOpen('monthly','2026-11-12'),rvOpen('quarterly','2026-10-10'),rvOpen('quarterly','2026-11-02'),rvOpen('yearly','2026-12-24')].join(' ')));
console.log('stale review:', await ev(()=>{const today=new Date().getDay();return [DB.reviews.find(r=>r.id==='rold').status,[0,1,2].includes(today)?'weekly open':'weekly closed']}));
// renewal task done → the record rolls forward
console.log('rolled:', await ev(()=>{const r=DB.records.find(x=>x.id==='rec3');return [r.task_id,r.renews_on>=T(),r.renews_on]}));
// life admin page
await ev(()=>{S.view='admin';render()}); await p.waitForTimeout(100);
console.log('admin:', await ev(()=>[...document.querySelectorAll('#view section')].map(s=>s.querySelector('h2').textContent+': '+[...s.querySelectorAll('.rec .lk b')].map(b=>b.textContent).join(', '))));
await p.click('[data-rectask="rec2"]'); await p.waitForTimeout(300);
const rt=await ev(()=>{const r=DB.records.find(x=>x.id==='rec2'),t=DB.tasks.find(x=>x.id===r.task_id);return t&&{title:t.title,due:t.due===r.renews_on,proj:t.project_id,status:t.status}});
console.log('renewal task:', rt, 'button now:', await ev(()=>document.querySelector('[data-editrec="rec2"]').closest('.rec').querySelector('.hacts').textContent));
await ev(async()=>{const r=DB.records.find(x=>x.id==='rec2');await upd(r.task_id,{status:'done',doneAt:now()})}); await p.waitForTimeout(400);
console.log('after done:', await ev(()=>{const r=DB.records.find(x=>x.id==='rec2');const x=new Date();x.setDate(x.getDate()+10);x.setMonth(x.getMonth()+12);return [r.task_id,r.renews_on.slice(0,7)===iso2(x).slice(0,7)]}));
await p.click('[data-newrec]'); await p.fill('#recForm input[name="title"]','Health insurance'); await p.selectOption('#recForm select[name="kind"]','policy'); await p.selectOption('#recForm select[name="areaId"]','health');
await p.fill('#recForm input[name="renewsOn"]', await ev(()=>{const x=new Date();x.setDate(x.getDate()+20);return iso2(x)})); await p.selectOption('#recForm select[name="everyMonths"]','12'); await p.click('#recForm button[type="submit"]'); await p.waitForTimeout(300);
console.log('new item:', await ev(()=>{const r=DB.records.find(x=>x.title==='Health insurance');return r&&[r.kind,r.area_id,r.every_months,r.remind_days]}), 'listed due:', await ev(()=>[...document.querySelectorAll('#view section')][0].textContent.includes('Health insurance')));
await p.screenshot({path:new URL('./out/admin.png', import.meta.url).pathname,fullPage:true});
await p.click('[data-editrec="rec1"]'); await p.click('#archRec'); await p.waitForTimeout(250);
console.log('archived:', await ev(()=>[!!DB.records.find(x=>x.id==='rec1').archived_at,!document.querySelector('[data-editrec="rec1"]')]));
// numbers on an area page; a number goal can follow one
await ev(()=>{S.view='area';S.area='money';render()}); await p.click('[data-newmetric="money"]');
await p.fill('#metricForm input[name="name"]','Emergency fund'); await p.fill('#metricForm input[name="unit"]','months'); await p.fill('#metricForm input[name="target"]','6'); await p.click('#metricForm button[type="submit"]'); await p.waitForTimeout(300);
const mid=await ev(()=>DB.metrics.find(m=>m.name==='Emergency fund')?.id); console.log('metric:', !!mid);
await ev(async(id)=>{const x=new Date();x.setDate(x.getDate()-20);DB.metric_logs.push({id:'ml0',metric_id:id,day:iso2(x),value:2});S.metric_logs.push(fromRow(DB.metric_logs[0]));render()},mid);
await ev(()=>openGoal(goalById('gn'))); await p.selectOption('#goalForm select[name="metricId"]',mid); await p.click('#goalForm button[type="submit"]'); await p.waitForTimeout(250);
await ev(()=>{S.view='area';S.area='money';render()});
await p.fill(`[data-mlog="${mid}"] input`,'3.5'); await p.click(`[data-mlog="${mid}"] button`); await p.waitForTimeout(350);
console.log('logged:', await ev(id=>[DB.metric_logs.filter(l=>l.metric_id===id).length,DB.goals.find(g=>g.id==='gn').current,DB.goals.find(g=>g.id==='gn').metric_id===id],mid), 'row:', await ev(()=>document.querySelector('.mrow .mv').textContent.replace(/\s+/g,' ')), 'spark:', await ev(()=>!!document.querySelector('.mrow .spark polyline')));
console.log('admin on area:', await ev(()=>[...document.querySelectorAll('#view .sh h2')].map(x=>x.textContent).filter(x=>/Numbers|Life admin/.test(x))));
await p.screenshot({path:new URL('./out/area-numbers.png', import.meta.url).pathname,fullPage:true});
// Life page: renewals in Coming up, Life admin button
await ev(()=>{S.view='life';render()});
console.log('coming up:', await ev(()=>[...document.querySelectorAll('#view .pk-list li')].map(x=>x.textContent).filter(x=>/Renewal|Review/.test(x))));
// the weekly review, step by step
await ev(()=>{S.view='reviews';render()}); await p.waitForTimeout(100);
console.log('reviews page:', await ev(()=>[...document.querySelectorAll('#view .sh h2')].map(x=>x.textContent)));
await p.click('[data-rvstart="weekly"]'); await p.waitForTimeout(300);
console.log('started:', await ev(()=>{const wk=DB.reviews.find(r=>r.kind==='weekly'&&r.id!=='rold');return wk&&[wk.status,wk.period_start===rvPeriod('weekly'),S.view]}));
console.log('step 1:', await ev(()=>[document.querySelector('.rv-card h2').textContent,document.querySelector('.rv-num').textContent,document.querySelectorAll('.rv-steps li').length]));
await p.fill('.rv-note textarea','Good week for Positioning'); await p.click('.rv-note button[value="1"]'); await p.waitForTimeout(250);
console.log('note saved:', await ev(()=>{const r=DB.reviews.find(r=>r.kind==='weekly'&&r.id!=='rold');return [r.answers.wins?.note,r.step,document.querySelector('.rv-card h2').textContent]}));
await p.click('[data-rvstep="3"]'); await p.waitForTimeout(250);
console.log('areas step:', await ev(()=>[document.querySelector('.rv-card h2').textContent,[...document.querySelectorAll('.rv-area')].map(x=>x.querySelector('b').textContent+(x.querySelector('.warn')?' (flag: '+x.querySelector('.warn').textContent+')':'')).join(' | ')]));
await p.click('.rv-area [data-astatus="good"][data-aid="health"]'); await p.waitForTimeout(200);
console.log('area set in review:', await ev(()=>DB.life_areas.find(a=>a.id==='health').status));
await p.click('[data-rvstep="5"]'); await p.waitForTimeout(250);
await p.fill('[data-rvtheme] input','HLTH campaign close'); await p.selectOption('[data-rvtheme] select','gq'); await p.click('[data-rvtheme] button'); await p.waitForTimeout(300);
console.log('theme for next week:', await ev(()=>{const f=DB.focus_themes?.find(x=>x.title==='HLTH campaign close');return f&&[f.span,f.goal_id,f.day===addDays(monOf(rvEnd('weekly',rvPeriod('weekly'))),7)]}), await ev(()=>document.querySelector('.rv-card .pk-list')?.textContent));
await p.screenshot({path:new URL('./out/review.png', import.meta.url).pathname,fullPage:true});
await p.click('.rv-note button[value="finish"]'); await p.waitForTimeout(300);
console.log('finished:', await ev(()=>{const r=DB.reviews.find(r=>r.kind==='weekly'&&r.id!=='rold');return [r.status,!!r.done_at,S.view]}));
// quarterly: carry a goal into this quarter, archive a finished project
await ev(()=>{S.view='reviews';render()}); await p.click('[data-rvstart="quarterly"]'); await p.waitForTimeout(300);
console.log('quarterly step 1:', await ev(()=>[...document.querySelectorAll('.rv-g .gl b')].map(x=>x.textContent)));
await p.click('[data-gcarry="gp"]'); await p.waitForTimeout(250);
console.log('carried:', await ev(()=>DB.goals.find(g=>g.id==='gp').period_start===qStart()));
await p.click('[data-rvstep="3"]'); await p.waitForTimeout(200);
console.log('archive step:', await ev(()=>[...document.querySelectorAll('.rv-card .pk-list .lk')].map(x=>x.textContent)));
await p.click('[data-rvarch="old"]'); await p.waitForTimeout(250);
console.log('archived project:', await ev(()=>!!DB.projects.find(x=>x.id==='old').archived_at));
// an agent's draft text shows on its step
await ev(()=>{const r=S.reviews.find(r=>r.kind==='quarterly');r.draft={qgoals:{text:'Two of three goals done.'}};r.draftedBy='routine:9am';r.step=0;render()});
console.log('draft:', await ev(()=>document.querySelector('.rv-draft')?.textContent.replace(/\s+/g,' ').trim()));
// phone and dark
await p.setViewportSize({width:390,height:844});
for(const v of ['admin','reviews','review']){await ev(v=>{S.view=v;if(v==='review')S.review=S.reviews.find(r=>r.kind==='weekly'&&r.id!=='rold').id;render()},v);await p.waitForTimeout(100);console.log('phone overflow', v, await ev(()=>document.documentElement.scrollWidth>window.innerWidth))}
await p.screenshot({path:new URL('./out/review-phone.png', import.meta.url).pathname,fullPage:true});
await ev(()=>{document.documentElement.dataset.theme='dark';S.view='area';S.area='money';render()}); await p.waitForTimeout(100);
await p.screenshot({path:new URL('./out/area-dark.png', import.meta.url).pathname,fullPage:true});
console.log('errors', errs);
await b.close();
