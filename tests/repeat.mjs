import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
// recurring tasks: the Repeats field, the ↻ tag, title tags, done adds the next copy, undo, done elsewhere, no duplicates
const b = await chromium.launch();
async function setup(p){
  await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(1000);
  await p.evaluate(()=>{
    const t0=T(),d=n=>{const x=new Date();x.setDate(x.getDate()+n);return iso2(x)};
    const k=(id,title,o={})=>({id,title,project_id:'zen',status:'todo',priority:'med',steps:[],activity:[],blocked_by:[],created_at:new Date().toISOString(),...o});
    window.DB={projects:[{id:'zen',name:'Zenara',area:'Career',color:'#1F8A8A'}],
    tasks:[
     k('r1','LinkedIn post',{repeat:'weekly',due:t0,priority:'high',steps:[{text:'Draft',done:true},{text:'Post',done:true}],notes:'Tuesday slot'}),
     k('r2','Healio piece',{repeat:'fortnightly',due:d(-20)}),
     k('r3','Monthly numbers',{repeat:'monthly',status:'done',due:d(-2),done_at:new Date().toISOString()}),
     k('r4','Standup notes',{repeat:'daily',status:'done',due:t0}),
     k('r5','Standup notes',{repeat:'daily',due:d(1)}),
     k('p1','Plain task',{today_date:t0})],
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
  await p.waitForTimeout(800);
}
const errs=[],ok=[];
const check=(l,v)=>{console.log(l+':',v);if(v!==true)ok.push(l)};
const p=await b.newPage({viewport:{width:1440,height:1000}}); p.on('pageerror',e=>errs.push(e.message));
p.on('dialog',d=>d.accept());
await setup(p);
const rows=title=>p.evaluate(t=>DB.tasks.filter(x=>x.title===t),title);
// done elsewhere (a chat, an agent): the sync adds the next copy
let mn=await rows('Monthly numbers');
check('done elsewhere rolls on sync', mn.length===2&&mn.some(x=>x.status==='done'&&x.repeat==null)&&mn.some(x=>x.status==='todo'&&x.repeat==='monthly'&&x.due>=new Date().toISOString().slice(0,8)));
let sn=await rows('Standup notes');
check('no second copy when one is already open', sn.length===2&&sn.filter(x=>x.status!=='done').length===1&&sn.find(x=>x.id==='r4').repeat==null);
// the ↻ tag on rows and in the quick look
check('row tag', await p.evaluate(()=>document.querySelector('.task[data-tid="r1"] .meta').textContent.includes('↻ weekly')));
await p.evaluate(()=>setPeek('r1')); await p.waitForTimeout(200);
check('quick look says when the next one is', await p.evaluate(()=>document.getElementById('peek').textContent.includes('Every week. Done adds the next one, '+nice(addDays(T(),7)))));
// done: next copy a week on, steps unticked, priority and notes kept; the finished one hands the rule on
await p.click('#peek [data-quickdone="r1"]'); await p.waitForTimeout(500);
let li=await rows('LinkedIn post');const nx=li.find(x=>x.id!=='r1');
check('done adds the next one', li.length===2&&!!nx&&nx.status==='todo'&&nx.repeat==='weekly'&&nx.priority==='high'&&nx.notes==='Tuesday slot'&&nx.steps.every(s=>!s.done)&&nx.steps.length===2);
check('next date is a week on', await p.evaluate(d=>d===addDays(T(),7),nx?.due));
check('finished one keeps no rule', li.find(x=>x.id==='r1').status==='done'&&li.find(x=>x.id==='r1').repeat==null);
check('toast names the next date', await p.evaluate(()=>document.getElementById('toast').textContent.includes('next one is on')));
// undo takes it all back
await p.evaluate(()=>HIST.run('undo')); await p.waitForTimeout(600);
li=await rows('LinkedIn post');
check('undo removes the copy and reopens it', li.length===1&&li[0].status==='todo'&&li[0].repeat==='weekly');
// a missed one lands on its next slot from today, not in the past
await p.evaluate(()=>setPeek('r2')); await p.waitForTimeout(200);
await p.click('#peek [data-quickdone="r2"]'); await p.waitForTimeout(500);
const he=(await rows('Healio piece')).find(x=>x.id!=='r2');
check('missed one rolls past today', await p.evaluate(d=>!!d&&d>=T()&&d<addDays(T(),14),he?.due));
await p.evaluate(()=>setPeek(null));
// task sheet
await p.evaluate(()=>openTask(S.tasks.find(x=>x.id==='p1'))); await p.waitForTimeout(200);
check('sheet starts on "Doesn\'t repeat"', await p.evaluate(()=>document.querySelector('#taskForm [name="repeat"]').value===''));
await p.selectOption('#taskForm [name="repeat"]','weekdays'); await p.click('#taskForm .foot button.primary'); await p.waitForTimeout(400);
check('sheet saves it', await p.evaluate(()=>DB.tasks.find(x=>x.id==='p1').repeat==='weekdays'));
// title tags
await p.fill('#quick input[name="q"]','Write the newsletter every Monday'); await p.press('#quick input[name="q"]','Enter'); await p.waitForTimeout(400);
check('"every Monday" = weekly, on the next Monday', await p.evaluate(()=>{const r=DB.tasks.find(x=>x.title==='Write the newsletter');return!!r&&r.repeat==='weekly'&&parse(r.due).getDay()===1&&r.due>=T()&&r.due<addDays(T(),7)}));
check('parsing', await p.evaluate(()=>{const a=tagParse('Healio piece every 2 weeks 2m'),c=tagParse('Send invoices #monthly');
  return a.title==='Healio piece'&&a.repeat==='fortnightly'&&a.quick===true&&c.title==='Send invoices'&&c.repeat==='monthly'
   &&tagParse('Review the weekly').repeat===undefined&&tagParse('every week').title==='every week'&&tagParse('Ping Ravi 2m every day').repeat==='daily'}));
check('weekdays skip the weekend', await p.evaluate(()=>{const fri='2026-10-30';return repStep(fri,'weekdays')==='2026-11-02'&&repStep('2026-01-31','monthly')==='2026-02-28'}));
await p.screenshot({path:new URL('out/repeat.png',import.meta.url).pathname});
const m=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}); m.on('pageerror',e=>errs.push(e.message));
await setup(m);
await m.evaluate(()=>{document.documentElement.dataset.theme='dark';openTask(S.tasks.find(x=>x.id==='p1'))}); await m.waitForTimeout(200);
await m.screenshot({path:new URL('out/repeat-sheet-dark.png',import.meta.url).pathname});
check('phone: Repeats field ≥44px', await m.evaluate(()=>document.querySelector('#taskForm [name="repeat"]').getBoundingClientRect().height>=44));
console.log('failed', ok);
console.log('errors', errs);
await b.close();
if(ok.length)process.exit(1);
