import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
// High impact today (starred tasks, themes, carry-over) and merging / ticking off sibling tasks from the quick look
const b = await chromium.launch();
const errs=[];
const p=await b.newPage({viewport:{width:1440,height:1000}}); p.on('pageerror',e=>errs.push(e.message));
await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(1000);
await p.evaluate(()=>{
  const t0=T(),d=n=>{const x=new Date();x.setDate(x.getDate()+n);return iso2(x)};
  window.DB={projects:[{id:'fish',name:'Small Fish',area:'Products',color:'#1F8A8A'},{id:'home',name:'Home',area:'Life',color:'#D0662A'}],
   tasks:[
    {id:'f1',title:'Small Fish: wire the scoring job',project_id:'fish',status:'doing',priority:'med',today_date:t0,steps:[],activity:[],blocked_by:[]},
    {id:'f2',title:'Small Fish: fix the CSV export',project_id:'fish',status:'todo',priority:'high',due:d(3),notes:'Export drops the last row.',steps:[{text:'repro',done:true},{text:'patch',done:false}],activity:[],blocked_by:[]},
    {id:'f3',title:'Small Fish: update the README',project_id:'fish',status:'todo',priority:'low',due:d(6),steps:[],activity:[],blocked_by:[]},
    {id:'f4',title:'Small Fish: deploy after export fix',project_id:'fish',status:'todo',priority:'med',due:d(8),steps:[],activity:[],blocked_by:['f2']},
    {id:'a1',title:'Retire the Zapier automation',project_id:'home',status:'todo',priority:'med',due:d(2),steps:[],activity:[],blocked_by:[]},
    {id:'a2',title:'Move the email automation to n8n',project_id:'home',status:'todo',priority:'med',steps:[],activity:[],blocked_by:[]},
    {id:'h1',title:'Book plumber',project_id:'home',status:'todo',priority:'low',today_date:t0,highlight_day:d(-1),steps:[],activity:[],blocked_by:[]}],
   focus_themes:[],notes:[]};
  window.WR=[];
  const q=t=>{const o={then:(r,j)=>Promise.resolve({data:JSON.parse(JSON.stringify(DB[t]||[])),error:null}).then(r,j),order:()=>o,limit:()=>o,gte:()=>o};return o};
  sb.rpc=()=>Promise.resolve({data:null,error:null});
  sb.from=t=>({select:()=>q(t),
    update:v=>({eq:(_,id)=>{WR.push([t,'update',id,v]);const r=(DB[t]||[]).find(x=>x.id===id);if(r)Object.assign(r,v);return Promise.resolve({error:null})}}),
    upsert:v=>{WR.push([t,'upsert',v.id,v]);const a=DB[t]||(DB[t]=[]);const r=a.find(x=>x.id===v.id);r?Object.assign(r,v):a.push(v);return Promise.resolve({error:null})},
    insert:v=>({select:()=>({single:()=>{const row={id:'f-'+Math.random().toString(36).slice(2,8),created_at:new Date().toISOString(),...v};(DB[t]||(DB[t]=[])).push(row);WR.push([t,'insert',row.id,v]);return Promise.resolve({data:row,error:null})}})}),
    delete:()=>({eq:(_,id)=>{WR.push([t,'delete',id]);DB[t]=(DB[t]||[]).filter(x=>x.id!==id);return Promise.resolve({error:null})}})});
  refresh();
});
await p.waitForTimeout(700);
const hi=()=>p.evaluate(()=>{const s=document.querySelector('#view .hi');return s&&{rows:[...s.querySelectorAll('.task')].map(x=>x.dataset.tid),themes:[...s.querySelectorAll('.theme-t')].map(x=>x.textContent),n:[...s.querySelectorAll('.theme-n')].map(x=>x.textContent),carry:s.querySelector('.hi-carry')?.textContent||'',empty:!!s.querySelector('.hi-empty')}});
console.log('empty block, carry-over offered:', await hi());

// star a task from its quick look; it moves out of the lists below into the block
await p.click('#view .task[data-tid="f1"] .title'); await p.waitForTimeout(150);
await p.click('#peek [data-hi="f1"]'); await p.waitForTimeout(150);
console.log('starred f1:', await hi(), 'pressed', await p.getAttribute('#peek [data-hi="f1"]','aria-pressed'), 'db', await p.evaluate(()=>DB.tasks.find(x=>x.id==='f1').highlight_day===T()));
console.log('f1 shown once on Today:', await p.evaluate(()=>document.querySelectorAll('#view .task[data-tid="f1"]').length));

// siblings in the quick look: other Small Fish tasks on other dates
console.log('also open in Small Fish:', await p.evaluate(()=>[...document.querySelectorAll('#peek .sibs li .pk-link')].map(x=>x.dataset.peek)));
// tick one off while working on f1
await p.click('#peek [data-donehere="f3"]'); await p.waitForTimeout(200);
console.log('done here:', await p.evaluate(()=>{const a=S.tasks.find(x=>x.id==='f3'),t=S.tasks.find(x=>x.id==='f1');return{f3:a.status,f3log:a.activity.at(-1).text,f1log:t.activity.at(-1).text}}));
// merge one in: its steps and notes move over, the earlier deadline and higher priority win, the dependent task now waits on f1
await p.click('#peek [data-mergein="f2"]'); await p.waitForTimeout(250);
console.log('merged:', await p.evaluate(()=>{const t=S.tasks.find(x=>x.id==='f1');return{gone:!S.tasks.some(x=>x.id==='f2'),db:DB.tasks.find(x=>x.id==='f2').superseded_by,steps:t.steps.map(x=>x.text+(x.done?'✓':'')),pri:t.priority,due:t.due,notes:t.notes,dep:S.tasks.find(x=>x.id==='f4').blockedBy,peekSteps:document.querySelectorAll('#peek .step').length}}));
await p.screenshot({path:new URL('./out/focus-peek.png', import.meta.url).pathname});
// undo brings the merged task back
await p.keyboard.press('Control+z'); await p.waitForTimeout(300);
console.log('after undo:', await p.evaluate(()=>({back:S.tasks.find(x=>x.id==='f2')?.status,sup:DB.tasks.find(x=>x.id==='f2').superseded_by,dep:S.tasks.find(x=>x.id==='f4').blockedBy,steps:S.tasks.find(x=>x.id==='f1').steps.length})));
// pick several in the dialog, across projects with search
await p.click('#peek [data-merge="f1"]'); await p.waitForTimeout(150);
console.log('merge dialog lists:', await p.evaluate(()=>[...document.querySelectorAll('#mergeList .pick-gh')].map(x=>x.textContent+':'+[...document.querySelectorAll('#mergeList input')].length)));
await p.fill('#mergeQ','zapier'); await p.waitForTimeout(100);
await p.check('#mergeList input[value="a1"]'); await p.fill('#mergeQ',''); await p.waitForTimeout(100);
await p.check('#mergeList input[value="f2"]');
console.log('buttons:', await p.textContent('#mergeGo'), '|', await p.textContent('#mergeDone'));
await p.click('#mergeDone'); await p.waitForTimeout(250);
console.log('marked done from dialog:', await p.evaluate(()=>({a1:S.tasks.find(x=>x.id==='a1').status,f2:S.tasks.find(x=>x.id==='f2').status,f1log:S.tasks.find(x=>x.id==='f1').activity.at(-1).text})));
await p.keyboard.press('Escape'); await p.evaluate(()=>setPeek(null)); await p.waitForTimeout(100);

// a theme: words in the title tick the matching tasks
await p.click('#view [data-newtheme]'); await p.waitForTimeout(150);
await p.fill('#themeForm input[name="title"]','Close all the automation things'); await p.waitForTimeout(100);
console.log('pre-ticked:', await p.evaluate(()=>[...document.querySelectorAll('#themeList input:checked')].map(x=>x.value)));
await p.click('#themeForm button[type="submit"]'); await p.waitForTimeout(250);
console.log('theme on Today:', await hi(), 'db', await p.evaluate(()=>DB.focus_themes.map(f=>f.title+':'+f.task_ids.join(','))));
await p.click('#view .hi .task[data-tid="a2"] .chk'); await p.waitForTimeout(150);
await p.click('#view .hi .task[data-tid="a2"] .chk'); await p.waitForTimeout(150);
console.log('after closing a2:', (await hi()).n);
// carry yesterday's unfinished star to today
await p.click('#view [data-hicarry]'); await p.waitForTimeout(200);
console.log('carried:', await hi());
await p.screenshot({path:new URL('./out/focus-today.png', import.meta.url).pathname});
// the task sheet has the same switch
await p.click('#view .task[data-tid="h1"] .title'); await p.waitForTimeout(100); await p.click('#peek [data-edit="h1"]'); await p.waitForTimeout(150);
console.log('sheet pill pressed:', await p.getAttribute('#taskForm [data-ck="onHi"]','aria-pressed'));
await p.click('#taskForm [data-ck="onHi"]'); await p.click('#taskForm button[type="submit"]'); await p.waitForTimeout(200);
console.log('unstarred via sheet:', await p.evaluate(()=>DB.tasks.find(x=>x.id==='h1').highlight_day));
// weekly focus: star for the week from the quick look, a week theme, next week's line-up, carry from last week
await p.evaluate(()=>{const m=week()[0],a=d=>{const x=parse(m);x.setDate(x.getDate()+d);return iso(x)};
  S.focus_themes.push({id:'w-old',day:a(-7),span:'week',title:'Last week: close Filow launch',taskIds:['h1']},{id:'w-next',day:a(7),span:'week',title:'Next week: ICP calls',taskIds:[]});
  S.view='week';setPeek(null);render()}); await p.waitForTimeout(150);
await p.evaluate(()=>setPeek('f4')); await p.waitForTimeout(100);
await p.click('#peek [data-hiw="f4"]'); await p.waitForTimeout(150);
console.log('week star:', await p.evaluate(()=>({db:DB.tasks.find(x=>x.id==='f4').highlight_week===week()[0],fact:[...document.querySelectorAll('#peek .pk-facts span')].map(x=>x.textContent).includes('★ Week focus')})));
await p.evaluate(()=>setPeek(null)); await p.waitForTimeout(100);
await p.click('#view [data-newtheme="week"]'); await p.waitForTimeout(150);
await p.fill('#themeForm input[name="title"]','Small Fish polish'); await p.waitForTimeout(100);
await p.click('#themeForm button[type="submit"]'); await p.waitForTimeout(250);
const wk=()=>p.evaluate(()=>{const s=document.querySelector('#view .hi');return{h:s.querySelector('h2').textContent,rows:[...s.querySelectorAll('.task')].map(x=>x.dataset.tid),themes:[...s.querySelectorAll('.theme-t')].map(x=>x.textContent),carry:[...s.querySelectorAll('.hi-carry')].map(x=>x.textContent),dupes:[...document.querySelectorAll('#view .task[data-tid="f4"]')].length}});
console.log('week block:', await wk(), 'db span', await p.evaluate(()=>DB.focus_themes.filter(f=>f.span==='week').map(f=>f.title+':'+f.day)));
await p.click('#view [data-hicarry="week"]'); await p.waitForTimeout(250);
console.log('after week carry:', (await wk()).themes);
await p.screenshot({path:new URL('./out/focus-week.png', import.meta.url).pathname});
// phone
await p.setViewportSize({width:390,height:844}); await p.evaluate(()=>{setPeek(null);render()}); await p.waitForTimeout(200);
await p.screenshot({path:new URL('./out/focus-phone.png', import.meta.url).pathname,fullPage:false});
console.log('errors', errs);
await b.close();
