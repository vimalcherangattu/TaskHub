import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const errs=[];
const p=await b.newPage({viewport:{width:1440,height:1000}}); p.on('pageerror',e=>errs.push(e.message));
await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(1000);
await p.evaluate(()=>{
  const t0=T(),d=n=>{const x=new Date();x.setDate(x.getDate()+n);return iso2(x)},ago=h=>new Date(Date.now()-h*36e5).toISOString();
  window.DB={projects:[{id:'zenara',name:'Zenara',area:'Career',color:'#1F8A8A'},{id:'zen-pos',name:'Positioning',area:'Career',parent_id:'zenara',color:'#2F6DB5',life_area:'work'},{id:'zen-lau',name:'Launches',area:'Career',parent_id:'zenara',color:'#C4412F'},{id:'home',name:'Home',area:'Life',color:'#D0662A'},{id:'old',name:'Old launch',area:'Products',color:'#7A4FB0'}],
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

   life_areas:[{id:'work',name:'Work',standard:'No weekend work',status:'good',order:1,color:'#2F6DB5'},{id:'health',name:'Health',standard:'Move 4x a week',status:'watch',status_note:'Sleep slipping',order:3,color:'#1F8A8A'},{id:'money',name:'Money',standard:'6 months saved',status:'off',order:4,color:'#3E8A57'}],
   goals:[{id:'gy',title:'Two products earning',horizon:'year',period_start:T().slice(0,4)+'-01-01',area_id:'work',measure:'milestones',status:'active',created_at:ago(24*60)},
          {id:'gq',title:'Launch Positioning',horizon:'quarter',period_start:(()=>{const x=new Date();return iso2(new Date(x.getFullYear(),Math.floor(x.getMonth()/3)*3,1))})(),parent_id:'gy',area_id:'work',measure:'milestones',status:'active',created_at:ago(24*60),updated_at:ago(24*30)},
          {id:'gn',title:'Emergency fund',horizon:'quarter',period_start:(()=>{const x=new Date();return iso2(new Date(x.getFullYear(),Math.floor(x.getMonth()/3)*3,1))})(),area_id:'money',measure:'number',target:6,current:2,unit:'months',status:'active',created_at:ago(24*60),updated_at:ago(24*40)}],
   habits:[{id:'h1',title:'Meditate',cadence:'daily',part_of_day:'morning',active:true,area_id:'health'},{id:'h2',title:'Walk',cadence:'weekly',per_week:3,part_of_day:'day',active:true,area_id:'health',goal_id:'gn'}],
   habit_logs:[{id:'hl1',habit_id:'h1',day:d(-1),done:true},{id:'hl2',habit_id:'h1',day:d(-2),done:true},{id:'hl3',habit_id:'h1',day:d(-3),done:false,skipped:true},{id:'hl4',habit_id:'h1',day:d(-4),done:true}],
   daily_log:[{id:'dl1',day:d(-1),energy:4,mood:3,line:'Long but good',win:'Shipped it'}],compass:[{id:1,vision:null,values:[],not_doing:[]}],
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
await p.waitForTimeout(800);
await p.waitForTimeout(400);
const txt=s=>p.evaluate(s=>[...document.querySelectorAll(s)].map(x=>x.textContent.replace(/\s+/g,' ').trim()),s);
console.log('sidebar groups:', await txt('#side .nav-g'), 'live items:', await p.evaluate(()=>['life','goals','habits','log'].every(v=>document.querySelector(`#side [data-go="${v}"]`))));
console.log('phone tabs:', await p.evaluate(()=>[...document.querySelectorAll('#tabs button')].map(b=>b.dataset.go||'more')));
// habits on Today
console.log('today habits:', await txt('.hb .hb-b'));
await p.click('.hb [data-habit="h1"]'); await p.waitForTimeout(250);
console.log('ticked:', await p.evaluate(()=>({db:DB.habit_logs.some(l=>l.habit_id==='h1'&&l.day===T()&&l.done),label:document.querySelector('.hb [data-habit="h1"]').textContent.replace(/\s+/g,' ')})));
await p.click('.hb [data-habit="h1"]'); await p.waitForTimeout(250);
console.log('unticked:', await p.evaluate(()=>!DB.habit_logs.some(l=>l.habit_id==='h1'&&l.day===T())));
// evening check-in
await p.evaluate(()=>{S.forceEvening=true;render()});
await p.click('#ciForm [data-ci="energy"][data-v="4"]'); await p.click('#ciForm [data-ci="mood"][data-v="5"]');
await p.fill('#ciForm input[name="line"]','Good focus day'); await p.fill('#ciForm input[name="win"]','Finished the deck'); await p.click('#ciForm button[type="submit"]'); await p.waitForTimeout(300);
console.log('check-in saved:', await p.evaluate(()=>{const l=DB.daily_log.find(x=>x.day===T());return l&&[l.energy,l.mood,l.line,l.win].join('|')}), await txt('.ci.done p'));
// Life view
await p.evaluate(()=>{S.view='life';render()}); await p.waitForTimeout(100);
console.log('life:', await p.evaluate(()=>({sub:document.querySelector('#view .sub').textContent,goals:[...document.querySelectorAll('#view .gl')].map(x=>x.querySelector('b').textContent+' '+x.querySelector('.gl-p span:last-child').textContent+' '+x.querySelector('.gl-m').textContent),areas:[...document.querySelectorAll('.ac')].map(x=>x.querySelector('b').textContent+':'+x.querySelector('.ast').textContent),energy:document.querySelector('.esr').getAttribute('aria-label')})));
await p.screenshot({path:new URL('./out/life.png', import.meta.url).pathname,fullPage:true});
// goal: link a project, progress moves
await p.click('.gl[data-goal="gq"]'); await p.waitForTimeout(100);
await p.selectOption('[data-glink] select','project:zen-pos'); await p.click('[data-glink] button'); await p.waitForTimeout(250);
console.log('goal page:', await p.evaluate(()=>({h1:document.querySelector('#view h1').textContent,stats:[...document.querySelectorAll('.p-stats>div')].map(x=>x.textContent),items:[...document.querySelectorAll('.gi .lk')].map(x=>x.textContent)})));
await p.evaluate(()=>{S.view='goal';S.goal='gn';render()}); await p.fill('[data-gnum] input','3'); await p.click('[data-gnum] button'); await p.waitForTimeout(250);
console.log('number goal:', await p.evaluate(()=>[DB.goals.find(g=>g.id==='gn').current,document.querySelector('.p-stats b').textContent]));
await p.click('[data-gstatus="done"]'); await p.waitForTimeout(200);
console.log('achieved:', await p.evaluate(()=>DB.goals.find(g=>g.id==='gn').status));
// new goal under the year goal
await p.evaluate(()=>{S.view='goals';render()}); await p.click('[data-newgoal="quarter"][data-parent="gy"]'); await p.fill('#goalForm input[name="title"]','Small Fish first customer'); await p.click('#goalForm button[type="submit"]'); await p.waitForTimeout(300);
console.log('new goal:', await p.evaluate(()=>{const g=DB.goals.find(x=>x.title==='Small Fish first customer');return g&&[g.horizon,g.parent_id,g.area_id,g.period_start,S.view]}));
// area status and standard
await p.evaluate(()=>{S.view='area';S.area='money';render()}); await p.click('[data-astatus="watch"]'); await p.waitForTimeout(200);
console.log('area status:', await p.evaluate(()=>[DB.life_areas.find(a=>a.id==='money').status,DB.life_areas.find(a=>a.id==='money').status_set_by]));
await p.click('[data-editarea="money"]'); await p.fill('#areaForm textarea','Six months saved; bills on time'); await p.fill('#areaForm input[name="statusNote"]','Fund behind'); await p.click('#areaForm button[type="submit"]'); await p.waitForTimeout(200);
console.log('area text:', await p.evaluate(()=>[DB.life_areas.find(a=>a.id==='money').standard,document.querySelector('.p-stats b').textContent]));
// habits view: new habit, skip, stop
await p.evaluate(()=>{S.view='habits';render()}); await p.click('[data-newhabit=""]'); await p.fill('#habitForm input[name="title"]','Read 20 pages'); await p.selectOption('#habitForm select[name="cadence"]','weekdays'); await p.click('#habitForm button[type="submit"]'); await p.waitForTimeout(250);
console.log('habits:', await txt('#view .hrow .lk b'), await p.evaluate(()=>DB.habits.find(h=>h.title==='Read 20 pages')?.cadence));
await p.click('[data-hskip="h1"]'); await p.waitForTimeout(200);
console.log('skip:', await p.evaluate(()=>DB.habit_logs.find(l=>l.habit_id==='h1'&&l.day===T())?.skipped), 'streak kept:', await p.evaluate(()=>hStreakTxt(S.habits.find(h=>h.id==='h1'))));
await p.screenshot({path:new URL('./out/habits.png', import.meta.url).pathname,fullPage:true});
// log
await p.evaluate(()=>{S.view='log';render()}); await p.waitForTimeout(100);
await p.click(`[data-logday="${await p.evaluate(()=>{const x=new Date();x.setDate(x.getDate()-1);return iso2(x)})}"]`).catch(()=>{});
console.log('log day:', await p.evaluate(()=>({h2:document.querySelector('.logd h2')?.textContent,quote:document.querySelector('.logd .quote')?.textContent,facts:[...document.querySelectorAll('.logf dt')].map(x=>x.textContent)})));
await p.click('[data-logedit]'); await p.fill('#logForm input[name="lesson"]','Protect mornings'); await p.click('#logForm button[type="submit"]'); await p.waitForTimeout(200);
console.log('log edit:', await p.evaluate(()=>DB.daily_log.find(x=>x.lesson)?.lesson));
await p.screenshot({path:new URL('./out/log.png', import.meta.url).pathname,fullPage:true});
// week theme serves a goal
await p.evaluate(()=>{S.view='week';render()}); await p.click('[data-newtheme="week"]'); await p.fill('#themeForm input[name="title"]','Positioning push'); await p.selectOption('#themeForm select[name="goalId"]','gq'); await p.click('#themeForm button[type="submit"]'); await p.waitForTimeout(250);
console.log('theme goal tag:', await txt('.theme .gtag'));
// compass
await p.evaluate(()=>{S.view='life';render()}); await p.evaluate(()=>document.querySelector('.cmp').open=true); await p.click('[data-editcompass]'); await p.fill('#compassForm textarea[name="vision"]','Calm, creative, free'); await p.fill('#compassForm textarea[name="values"]','Freedom: time is wealth\nCraft'); await p.click('#compassForm button[type="submit"]'); await p.waitForTimeout(250);
console.log('compass:', await p.evaluate(()=>[DB.compass[0].vision,JSON.stringify(DB.compass[0].values)]));
// project life area
await p.evaluate(()=>openProj(S.projects.find(x=>x.id==='home'))); await p.selectOption('#projForm select[name="lifeArea"]','health'); await p.click('#projForm button[type="submit"]'); await p.waitForTimeout(250);
console.log('project life area:', await p.evaluate(()=>DB.projects.find(x=>x.id==='home').life_area));
// phone: 5 tabs and More sheet
await p.setViewportSize({width:390,height:844}); await p.evaluate(()=>{S.view='life';render()}); await p.waitForTimeout(200);
console.log('phone overflow:', await p.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth));
await p.screenshot({path:new URL('./out/life-phone.png', import.meta.url).pathname,fullPage:true});
await p.click('#tabs [data-more]'); await p.waitForTimeout(150);
console.log('more sheet:', await p.evaluate(()=>[...document.querySelectorAll('#moreBody .sh h2')].map(x=>x.textContent)));
await p.screenshot({path:new URL('./out/more-phone.png', import.meta.url).pathname});
await p.click('#moreBody [data-go="people"]'); await p.waitForTimeout(150);
console.log('from more:', await p.evaluate(()=>[S.view,document.getElementById('moreDlg').open,document.querySelector('#tabs [data-more]').getAttribute('aria-current')]));
await p.evaluate(()=>{document.documentElement.dataset.theme='dark';S.view='life';render()}); await p.waitForTimeout(100);
await p.screenshot({path:new URL('./out/life-dark.png', import.meta.url).pathname});
console.log('errors', errs);
await b.close();
