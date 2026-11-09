import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
// Soft vs hard dates (only hard deadlines are overdue; soft ones that pass go to "Left from earlier"), paused projects,
// the triage (Today / This week / Next week / No date / Drop), the week's capacity line and "Trim the week", and overdue zero on Fridays
const b = await chromium.launch();
async function setup(p){
  await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(1000);
  await p.evaluate(()=>{
    const t0=T(),d=n=>addDays(t0,n),ago=h=>new Date(Date.now()-h*36e5).toISOString(),wk=week()[0];
    const k=(id,title,o={})=>({id,title,project_id:'zen',status:'todo',priority:'med',steps:[],activity:[],blocked_by:[],created_at:ago(300),...o});
    const done=[...Array(8)].map((_,i)=>k('dn'+i,'Done '+i,{status:'done',done_at:new Date(parse(addDays(wk,-3-i*3)).getTime()+12*36e5).toISOString()}));
    window.DB={projects:[{id:'zen',name:'Zenara',area:'Career',color:'#1F8A8A'},{id:'fy',name:'Fyule',area:'Products',color:'#7A4FB0',paused_at:ago(1)}],
    tasks:[
     k('s1','Soft five days late',{due:d(-5)}),
     k('s2','Soft three weeks late',{due:d(-21),priority:'high'}),
     k('h1','Hard deadline missed',{due:d(-1),due_firm:true}),
     k('fy1','Paused project task',{project_id:'fy',due:d(-9)}),
     k('fy2','Paused due today',{project_id:'fy',due:t0}),
     k('td','Due today soft',{due:t0}),
     k('w1','Week low one',{week_of:wk,priority:'low'}),
     k('w2','Week med due later',{due:week()[6]}),
     k('w3','Week high',{week_of:wk,priority:'high'}),
     k('w4','Week low two',{week_of:wk,priority:'low'}),
     ...done],
    notes:[],call_series:[],agenda_items:[],changes:[],day_briefs:[]};
    const q=t=>{const o={then:(r,j)=>Promise.resolve({data:JSON.parse(JSON.stringify(DB[t]||[])),error:null}).then(r,j),order:()=>o,limit:()=>o,gte:()=>o};return o};
    sb.rpc=()=>Promise.resolve({data:null,error:null});
    sb.from=t=>{const tb=DB[t]||(DB[t]=[]);return{select:()=>q(t),
      update:row=>({eq:(c,id)=>{const r=tb.find(x=>x.id===id);if(r)Object.assign(r,row);return Promise.resolve({error:null})}}),
      upsert:row=>{const r=tb.find(x=>x.id===row.id);if(r)Object.assign(r,row);else tb.push({...row});return Promise.resolve({error:null})},
      delete:()=>({eq:(c,id)=>{const i=tb.findIndex(x=>x.id===id);if(i>=0)tb.splice(i,1);return Promise.resolve({error:null})}}),
      insert:row=>({select:()=>({single:()=>{const r={id:'new'+tb.length,...row};tb.push(r);return Promise.resolve({data:{...r},error:null})}})})}};
    S.forceEvening=false;refresh();
  });
  await p.waitForTimeout(800);
}
const errs=[];
const p=await b.newPage({viewport:{width:1440,height:1100}}); p.on('pageerror',e=>errs.push(e.message)); p.on('dialog',d=>d.accept());
await setup(p);
const secOf=h=>p.evaluate(h=>{const s=[...document.querySelectorAll('#view section')].find(x=>x.querySelector('h2')?.textContent.trim().startsWith(h));return s?[...s.querySelectorAll('.task')].map(x=>x.dataset.tid):[]},h);
console.log('only hard deadlines are overdue:', await p.evaluate(()=>{const g=id=>S.tasks.find(x=>x.id===id);return overdue(g('h1'))&&!overdue(g('s1'))&&lapsed(g('s1'))&&!lapsed(g('h1'))}));
// 9 Nov: soft dates that passed wait in Inbox ("Past its date"), not on Today
await p.evaluate(()=>{S.showBrief=true;S.tmode='list';render()}); await p.waitForTimeout(100);
const lateIds=()=>p.evaluate(()=>inboxItems().filter(x=>x.k==='late').map(x=>x.id));
const left=await lateIds(),todo=await p.evaluate(()=>[...document.querySelectorAll('#view .tlist .task')].map(x=>x.dataset.tid));
console.log('soft-late tasks in Inbox, not on Today:', JSON.stringify(left), left.includes('s1')&&left.includes('s2')&&!todo.includes('s1')&&todo.includes('td'));
await p.evaluate(()=>{S.view='inbox';S.ik='late';render()}); await p.waitForTimeout(100);
console.log('Inbox card says "Was for", not Overdue:', await p.evaluate(()=>{const c=document.querySelector('.in-card');return c.textContent.includes('Past its date')&&c.textContent.includes('Was for')&&!c.textContent.includes('Overdue')}));
await p.evaluate(()=>{S.view='today';S.ik=null;render()}); await p.waitForTimeout(100);
console.log('paused project stays off Today:', await p.evaluate(()=>!document.querySelector('#view .task[data-tid="fy1"]')&&!document.querySelector('#view .task[data-tid="fy2"]')&&!onToday(S.tasks.find(x=>x.id==='fy2'))));
// 9 Nov: the sidebar lists only projects that moved this week
console.log('sidebar marks it paused:', await p.evaluate(()=>{S.tasks.find(x=>x.id==='fy1').updatedAt=new Date().toISOString();render();return document.querySelector('aside [data-proj="fy"]')?.textContent.includes('paused')}));
console.log('needs attention: 2+ weeks past, once:', await p.evaluate(()=>attentionLine().includes('past its date for 2+ weeks')));
console.log('brief offers the triage:', await p.evaluate(()=>!!document.querySelector('.brief [data-triage="late"]')&&document.querySelector('.brief').textContent.includes('3 tasks past their dates')||document.querySelector('.brief').textContent.includes('Three tasks past their dates')));
// triage
await p.click('[data-triage="late"]'); await p.waitForTimeout(200);
console.log('triage opens on the oldest:', await p.evaluate(()=>document.getElementById('triDlg').open&&document.getElementById('triH').textContent==='Soft three weeks late'&&TR.ids.join()==='s2,s1,h1'));
await p.click('#triBody [data-tri="today"]'); await p.waitForTimeout(250);
console.log('Today: on today, soft date cleared, logged:', await p.evaluate(()=>{const t=DB.tasks.find(x=>x.id==='s2');return t.today_date===T()&&t.due===null&&t.activity.at(-1).text.startsWith('Triage: today')}));
await p.keyboard.press('w'); await p.waitForTimeout(250);
console.log('key W: this week, date cleared:', await p.evaluate(()=>{const t=DB.tasks.find(x=>x.id==='s1');return t.week_of===week()[0]&&t.due===null&&t.today_date===null}));
await p.click('#triBody [data-tri="none"]'); await p.waitForTimeout(250);
console.log('No date on a hard deadline asks first, then clears it:', await p.evaluate(()=>{const t=DB.tasks.find(x=>x.id==='h1');return t.due===null&&t.due_firm===null}));
console.log('end screen sums it up:', await p.evaluate(()=>document.getElementById('triH').textContent.startsWith('Sorted three')&&document.getElementById('triBody').textContent.includes('Overdue zero')));
await p.click('#triBody [data-close]'); await p.waitForTimeout(200);
console.log('Inbox has nothing past its date now:', JSON.stringify(await lateIds()));
// week capacity: 8 done in the last 4 weeks → usually 2 a week
await p.evaluate(()=>{S.view='week';render()}); await p.waitForTimeout(200);
const cl=await p.evaluate(()=>document.querySelector('.cap-line')?.textContent||'');
console.log('capacity line:', cl, /planned this week; you usually finish about 2/.test(cl)&&cl.includes('Trim the week'));
await p.click('.cap-line [data-triage="week"]'); await p.waitForTimeout(200);
console.log('trim starts with low priority:', await p.evaluate(()=>TR.mode==='week'&&DB.tasks.find(x=>x.id===TR.ids[0]).priority==='low'&&!TR.ids.includes('h1')));
await p.click('#triBody [data-tri="next"]'); await p.waitForTimeout(250);
console.log('Next week moves it on:', await p.evaluate(id=>{const t=DB.tasks.find(x=>x.id===id);return t.week_of===addDays(week()[0],7)&&t.due===null},await p.evaluate(()=>TR.ids[0])));
await p.click('#triBody [data-tri="drop"]'); await p.waitForTimeout(250);
console.log('Drop deletes it:', await p.evaluate(()=>!DB.tasks.find(x=>x.id===TR.ids[1])));
await p.click('#triBody [data-close]'); await p.waitForTimeout(200);
// pause / resume from the project page
await p.evaluate(()=>{S.view='project';S.pid='fy';render()}); await p.waitForTimeout(200);
console.log('project page says paused:', await p.evaluate(()=>!!document.querySelector('.paused-note')&&document.querySelector('[data-pause="fy"]').textContent==='Resume'));
await p.click('[data-pause="fy"]'); await p.waitForTimeout(300);
console.log('Resume brings its tasks back:', await p.evaluate(()=>DB.projects.find(x=>x.id==='fy').paused_at===null&&!document.querySelector('.paused-note')&&onToday(S.tasks.find(x=>x.id==='fy2'))&&lapsed(S.tasks.find(x=>x.id==='fy1'))));
await p.click('[data-pause="fy"]'); await p.waitForTimeout(300);
console.log('Pause again:', await p.evaluate(()=>!!DB.projects.find(x=>x.id==='fy').paused_at&&!onToday(S.tasks.find(x=>x.id==='fy2'))));
// Friday wrap: overdue zero
await p.evaluate(()=>{S.view='today';S.day_briefs=[{id:'b1',day:T(),edition:'friday',items:[],feedback:{}}];DB.day_briefs=S.day_briefs;S.tasks.push({id:'z1',title:'Soft late again',projectId:'zen',status:'todo',priority:'med',due:addDays(T(),-2),steps:[],activity:[],blockedBy:[]});render()}); await p.waitForTimeout(200);
console.log('Friday: overdue zero line with Triage:', await p.evaluate(()=>{const s=[...document.querySelectorAll('.brief .bsec')].find(x=>x.querySelector('h3').textContent==='Your week');return!!s&&s.textContent.includes('Close the week at overdue zero: 1 left')}));
await p.screenshot({path:new URL('out/triage.png',import.meta.url).pathname});
// phone
const m=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2}); m.on('pageerror',e=>errs.push(e.message)); m.on('dialog',d=>d.accept());
await setup(m); await m.evaluate(()=>{S.showBrief=true;S.tmode='list';render()});
await m.click('#view [data-triage="late"]'); await m.waitForTimeout(200);
console.log('phone: triage buttons 44px, no sideways scroll:', await m.evaluate(()=>[...document.querySelectorAll('#triBody .tri-acts .btn')].every(x=>x.getBoundingClientRect().height>=44)&&document.getElementById('triBody').scrollWidth<=document.getElementById('triBody').clientWidth+1));
await m.screenshot({path:new URL('out/triage-phone.png',import.meta.url).pathname});
console.log('errors', errs);
await b.close();
