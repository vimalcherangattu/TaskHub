import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
async function setup(p){
  await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(1000);
  await p.evaluate(()=>{
    const t0=T(),d=n=>{const x=new Date();x.setDate(x.getDate()+n);return iso2(x)},ago=h=>new Date(Date.now()-h*36e5).toISOString();
    const steps=(n,k)=>Array.from({length:n},(_,i)=>({text:['Discovery call guide + scorecard','Flow sales deck (from ICPC deck) — sent to David','Flow program overview + workflow one-pager v2','Value-prop doc for prospects (COM-432 #3)','Status note: posted on COM-432; Teams note still to send','Reviews: Pratik, David, Tyler','Attach overview + value prop to COM-432','AI trust talk track / objection handling','Post-call follow-up email templates','Pilot agreement summary','Pricing one-pager'][i%11],done:i<k}));
    window.DB={projects:[{id:'zenara',name:'Zenara',area:'Career',color:'#1F8A8A'},{id:'zenara-launches',name:'Launches & campaigns',area:'Career',parent_id:'zenara',color:'#C4412F'},{id:'zenara-positioning',name:'Positioning & ICP',area:'Career',parent_id:'zenara',color:'#2F6DB5'},{id:'zenara-content',name:'Content & thought leadership',area:'Career',parent_id:'zenara',color:'#E0A21A'},{id:'job',name:'Job search',area:'Career',color:'#2F6DB5'},{id:'yt',name:'Faceless YouTube',area:'Products',color:'#C4412F'},{id:'fyule',name:'Fyule Story Studio',area:'Products',color:'#E0A21A'},{id:'jini',name:'Hey Jini',area:'Products',color:'#B0407A'},{id:'home',name:'Home & family',area:'Life',color:'#D0662A'},{id:'admin',name:'Admin & finance',area:'Life',color:'#5E6E68'}],
    tasks:[
     {id:'t1',title:'Build ep5 Gold for Thu 29 Oct 14:00 UTC: research → bad-cop check → script for Vimal → voice → render',project_id:'yt',status:'doing',priority:'high',due:d(8),today_date:t0,started_at:ago(3),notes:'Script v1 in channel/ep5.md',steps:[],activity:[],blocked_by:[]},
     {id:'t2',title:'Close COM-432 core Flow sales collateral this week (David: build fast)',project_id:'zenara-launches',status:'doing',priority:'high',due:d(9),effort_days:10,started_at:ago(170),resume_note:'Get Product to name the HEDIS measures and David to OK the fee wording; re-upload the one-pager',notes:'Linear COM-432.\nOne-pager v3 in SharePoint.',steps:steps(11,4),activity:[{at:ago(5),by:'claude',text:'One-pager revised per 21 Oct feedback; claims softened, 2 sign-offs needed'},{at:ago(30),by:'claude',text:'Value-prop doc drafted'}],blocked_by:[]},
     {id:'t3',title:'Draft patient-facing Assess handout',project_id:'zenara-content',status:'doing',priority:'high',due:t0,started_at:ago(26),steps:steps(4,1),activity:[],blocked_by:[]},
     {id:'t4',title:'Finalise AI trust position and merge it into the FAQ AI section',project_id:'zenara-positioning',status:'doing',priority:'med',due:d(2),started_at:ago(50),steps:[],activity:[{at:ago(2),by:'claude',text:'Deepak confirmed wording'}],blocked_by:[]},
     {id:'t5',title:'Book parents\' doctor appointment for Saturday 24 Oct',project_id:'home',status:'todo',priority:'high',due:t0,today_date:t0,steps:[],activity:[],blocked_by:[]},
     {id:'t6',title:'Review David\'s pricing sheet against the rate card',project_id:'zenara-positioning',status:'todo',priority:'med',due:d(-2),today_date:t0,carry_count:3,steps:[],activity:[],blocked_by:[]},
     {id:'t7',title:'Draft Flow launch plan working back from Intuitive Psychiatry go-live',project_id:'zenara-launches',status:'todo',priority:'high',due:t0,today_date:t0,steps:[],activity:[],blocked_by:['t9']},
     {id:'t8',title:'Pay electricity bill',project_id:'admin',status:'todo',priority:'low',today_date:t0,steps:[],activity:[],blocked_by:[]},
     {id:'t9',title:'Slice 1 two-pager from Pratik (live vs pilot vs roadmap)',project_id:'zenara-positioning',status:'waiting',waiting_on:'Pratik',waiting_since:ago(200),follow_up_on:t0,follow_ups:2,priority:'high',steps:[],activity:[],blocked_by:[]},
     {id:'t10',title:'Sam to revise paid media plan (COM-512) per feedback: Segment C audience, realistic forecast, walkthroughs as primary conversion, owner during his leave',project_id:'zenara-launches',status:'waiting',waiting_on:'Sam',waiting_since:ago(220),follow_up_on:t0,priority:'med',due:d(2),steps:[],activity:[],blocked_by:[],resume_note:'Cover audience, conversion, channel mix verbally'},
     {id:'t11',title:'Get a company Make account (Zenara-owned) + Ravi\'s M365 admin consent for Make',project_id:'zenara-launches',status:'waiting',waiting_on:'David',waiting_since:ago(4),follow_up_on:d(1),priority:'med',due:d(1),steps:steps(4,1),activity:[],blocked_by:[]},
     {id:'t12',title:'Transfer Malad flat electricity connection to Vishal & Mom\'s names',project_id:'home',status:'waiting',waiting_on:'Adani Electricity',waiting_since:ago(140),follow_up_on:d(1),priority:'low',due:d(40),steps:[],activity:[],blocked_by:[]},
     {id:'t13',title:'Raise doctor contact-data sourcing on its own Linear ticket',project_id:'zenara-launches',status:'suggested',priority:'med',due:d(6),source_chat:'Linear COM-536 – Cold email setup',steps:[],activity:[],blocked_by:[]},
     {id:'t14',title:'Prep HLTH recap + new-year pitch for Kara\'s January call',project_id:'zenara-content',status:'suggested',priority:'low',due:d(50),steps:[],activity:[],blocked_by:[]},
     {id:'t15',title:'Fix booking-conversion tracking with Deepak',project_id:'zenara-launches',status:'doing',priority:'med',due:d(3),started_at:ago(20),steps:[],activity:[],blocked_by:[]},
     {id:'t16',title:'Submit Stripe tax form',project_id:'jini',status:'todo',priority:'med',due:d(3),steps:[],activity:[],blocked_by:[]},
     {id:'t17',title:'Outline chapter 3',project_id:'fyule',status:'done',done_at:ago(1),priority:'med',steps:[],activity:[],blocked_by:[]}],
    notes:[],call_series:[{id:'sam-catchup',name:'Sam catch-up',people:['Sam'],kind:'catch-up',order:3,active:true}],agenda_items:[]};
    window.PREP={'sam-catchup':{id:'sam-catchup',name:'Sam catch-up',next_at:new Date(Date.now()+22*36e5).toISOString(),since:ago(48),agenda:[{id:'a',kind:'update',text:'x'}],done:[],doing:[],next:[],blocked:[],asks:[{id:'t10',title:'x'}],inputs:[],questions:[],decided:[]}};
    const q=t=>{const o={then:(r,j)=>Promise.resolve({data:JSON.parse(JSON.stringify(DB[t]||[])),error:null}).then(r,j),order:()=>o,limit:()=>o,gte:()=>o};return o};
    sb.rpc=(fn,a)=>Promise.resolve({data:fn==='call_prep'?PREP[a.s]:null,error:null});
    sb.from=t=>{const tb=DB[t]||(DB[t]=[]);return{select:()=>q(t),
      update:row=>({eq:(c,id)=>{const r=tb.find(x=>x.id===id);if(r)Object.assign(r,row);return Promise.resolve({error:null})}}),
      upsert:row=>{const r=tb.find(x=>x.id===row.id);if(r)Object.assign(r,row);else tb.push({...row});return Promise.resolve({error:null})},
      delete:()=>({eq:(c,id)=>{const i=tb.findIndex(x=>x.id===id);if(i>=0)tb.splice(i,1);return Promise.resolve({error:null})}}),
      insert:row=>({select:()=>({single:()=>{const r={id:'new'+tb.length,...row};tb.push(r);return Promise.resolve({data:{...r},error:null})}})})}};
    refresh();
  });
  await p.waitForTimeout(700);
}
const errs=[];
const p=await b.newPage({viewport:{width:1440,height:1000}}); p.on('pageerror',e=>errs.push(e.message));
await setup(p);
// t1 (episode build) is the agent's job; t5 stays Vimal's
await p.evaluate(()=>{DB.tasks.find(x=>x.id==='t1').owner='agent';refresh()}); await p.waitForTimeout(500);
const onToday=await p.evaluate(()=>[...document.querySelectorAll('#view .task')].map(x=>x.dataset.tid));
console.log('agent task off Today:', !onToday.includes('t1'), '| own task still on Today:', onToday.includes('t5'));
console.log('Today hint links to agents:', await p.evaluate(()=>!!document.querySelector('#view [data-go="agents"]')));
console.log('nav count:', await p.evaluate(()=>document.querySelector('#side [data-go="agents"] .count')?.textContent));
await p.evaluate(()=>{S.view='week';render()}); await p.waitForTimeout(200);
console.log('agent task off Week:', await p.evaluate(()=>!document.querySelector('#view .task[data-tid="t1"]')));
await p.click('#side [data-go="agents"]'); await p.waitForTimeout(200);
console.log('agents view lists it:', await p.evaluate(()=>[...document.querySelectorAll('#view .task')].map(x=>x.dataset.tid)));
await p.evaluate(()=>{S.view='all';render()}); await p.waitForTimeout(200);
console.log('All tasks shows Agent tag:', await p.evaluate(()=>document.querySelector('#view .task[data-tid="t1"]')?.textContent.includes('Agent')));
// toggle back from the quick look
await p.click('.task[data-tid="t1"] .title'); await p.waitForTimeout(300);
await p.click('#peek [data-own="t1"]'); await p.waitForTimeout(300);
console.log('toggle back to me:', await p.evaluate(()=>DB.tasks.find(x=>x.id==='t1').owner));
await p.click('#peek [data-own="t1"]'); await p.waitForTimeout(300);
console.log('toggle to agent:', await p.evaluate(()=>DB.tasks.find(x=>x.id==='t1').owner));
const m=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}); m.on('pageerror',e=>errs.push(e.message));
await setup(m); console.log('phone: Run by agents in More, with its count:', await m.evaluate(()=>{openMore();const b=document.querySelector('#moreBody [data-go="agents"]');document.getElementById('moreDlg').close();return b?b.textContent:false}));
console.log('errors', errs);
await b.close();
