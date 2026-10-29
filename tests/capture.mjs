import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const errs=[];
const URLX=new URL('../index.html', import.meta.url).href;
const mock=()=>{
  const t0=T();
  window.DB={projects:[{id:'z',name:'Zenare',color:'#2F6DB5',area:'Career'},{id:'g',name:'Gardening',color:'#3E8A57',area:'Life'}],
    tasks:[{id:'a',title:'Instantly tags finalisation',project_id:'z',status:'todo',priority:'high',due:t0,notes:'Linear COM-606 campaign tags'},
           {id:'b',title:'Order tomato seedlings',project_id:'g',status:'todo',priority:'low'},
           {id:'c',title:'Compost bin for the balcony',project_id:'g',status:'todo',priority:'low'}],
    notes:[{id:'n1',project_id:'z',kind:'link',title:'Instantly docs',url:'https://instantly.ai/docs/tags',body:'',created_at:new Date().toISOString()},
           {id:'n2',project_id:'g',kind:'idea',title:'Balcony tomato trellis',body:'Vertical trellis for cherry tomato plants on the balcony',created_at:new Date().toISOString()},
           {id:'n3',project_id:'g',kind:'fact',title:'Tomato plants need 6 hours of sun',body:'balcony faces east, cherry tomato varieties do best',created_at:new Date().toISOString()}],
    daily_log:[],sync_state:[],sources:[],project_briefs:[],source_segments:[],changes:[],inputs:[],input_uses:[],call_series:[],agenda_items:[],links:[]};
  let n=0;
  const q=t=>{const o={then:(r,j)=>Promise.resolve({data:JSON.parse(JSON.stringify(DB[t]||[])),error:null}).then(r,j),order:()=>o,limit:()=>o,gte:()=>o,eq:()=>o,is:()=>o,in:()=>o};return o};
  sb.rpc=()=>Promise.resolve({data:null,error:null});
  sb.channel=()=>({on(){return this},subscribe(){return this}});
  sb.from=t=>{const tb=DB[t]||(DB[t]=[]);return{select:()=>q(t),
    update:row=>({eq:(c,id)=>{const r=tb.find(x=>x.id===id);if(r)Object.assign(r,row);return Promise.resolve({error:null})}}),
    upsert:row=>{const r=tb.find(x=>x.id===row.id);if(r)Object.assign(r,row);else tb.push({...row});return Promise.resolve({error:null})},
    delete:()=>({eq:(c,id)=>{const i=tb.findIndex(x=>x.id===id);if(i>=0)tb.splice(i,1);return Promise.resolve({error:null})}}),
    insert:row=>({select:()=>({single:()=>{const r={id:'new'+(++n),...row};tb.push(r);return Promise.resolve({data:{...r},error:null})}})})}};
};
const ctx=await b.newContext({viewport:{width:1280,height:900}});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
await p.goto(URLX);await p.waitForTimeout(800);await p.evaluate(mock);await p.evaluate(()=>refresh());await p.waitForTimeout(500);

// what the reader makes of plain text
console.log('kinds:',await p.evaluate(()=>[
  'Feeling great today, shipped the deck','in a good mood','today was rough','not feeling great','mood 4','😊','Feel free to send the deck',
  'Call the bank about the card','Need to renew passport by Friday','Great piece https://x.com/a',
  'Decided: we go with annual pricing','What if the podcast had one guest per ICP','Sam Ghosh: marketing lead at Zenare',
  'The retainer fee is 55k a month','Pay electricity bill'
].map(t=>{const g=capKindOf(t);return g.k+(g.mood?g.mood:'')+(g.energy?'e'+g.energy:'')}).join(' ')));
console.log('project named:',await p.evaluate(()=>capProject('Zenare launch post')?.pid),'| by words:',await p.evaluate(()=>capProject('cherry tomato balcony netting')?.pid),'| none:',await p.evaluate(()=>capProject('dentist on Tuesday'))==null);

// the box: mood goes to today's check-in, the preview says so, no project
await p.keyboard.press('c');await p.waitForTimeout(150);
console.log('Change closed:',await p.evaluate(()=>document.getElementById('capMore').offsetHeight===0));
await p.fill('#capText','Feeling really good today, slept well');await p.waitForTimeout(250);
console.log('preview:',await p.textContent('#capSays'));
await p.keyboard.press('Control+Enter');await p.waitForTimeout(300);
console.log('mood saved:',await p.evaluate(()=>JSON.stringify(DB.daily_log.map(x=>[x.day===T(),x.mood,x.line]))));
// a second feeling on the same day keeps the first line and adds to the body
await p.evaluate(()=>openCapture('Feeling anxious about the pitch'));await p.waitForTimeout(200);
await p.evaluate(()=>document.getElementById('capForm').requestSubmit());await p.waitForTimeout(300);
console.log('second mood:',await p.evaluate(()=>{const l=DB.daily_log[0];return l.mood+'|'+l.line+'|'+/anxious/.test(l.body||'')}),'| Today card:',await p.evaluate(()=>logOf(T())?.mood+' '+document.querySelector('#view .ci p')?.textContent.slice(0,12)));

// a link already saved: no duplicate, the words go onto it
await p.evaluate(()=>openCapture('Tag naming rules https://instantly.ai/docs/tags'));await p.waitForTimeout(200);
console.log('dup preview:',await p.textContent('#capSays'));
await p.evaluate(()=>document.getElementById('capForm').requestSubmit());await p.waitForTimeout(300);
console.log('dup link:',await p.evaluate(()=>DB.notes.filter(n=>n.url).length+'|'+DB.notes.find(n=>n.id==='n1').body));

// an idea finds its project and links to related notes
await p.evaluate(()=>openCapture('Idea: self-watering pots for the cherry tomato plants on the balcony'));await p.waitForTimeout(200);
console.log('idea preview:',await p.textContent('#capSays'));
await p.evaluate(()=>document.getElementById('capForm').requestSubmit());await p.waitForTimeout(400);
console.log('idea saved:',await p.evaluate(()=>{const n=DB.notes.find(x=>x.title.startsWith('Idea: self'));return n.kind+'|'+n.project_id+'|'+DB.links.filter(l=>l.from_id===n.id).map(l=>l.to_id).sort().join(',')}));

// Change overrides the guess and the project
await p.evaluate(()=>openCapture('Order tomato stakes'));await p.waitForTimeout(200);
await p.click('#capChange');await p.click('#capKind [data-kind="note"]');await p.selectOption('#capForm [name=projectId]','');
console.log('override preview:',await p.textContent('#capSays'));
await p.click('#capForm button[type=submit]');await p.waitForTimeout(300);
console.log('override saved:',await p.evaluate(()=>{const n=DB.notes.find(x=>x.title==='Order tomato stakes');return !!n&&n.kind+'|'+n.project_id}));
await p.screenshot({path:new URL('./out/capture.png', import.meta.url).pathname});

// phone: the type switch wraps, targets stay 44px
const q=await ctx.newPage();await q.setViewportSize({width:390,height:844});q.on('pageerror',e=>errs.push(e.message));
await q.goto(URLX);await q.waitForTimeout(800);await q.evaluate(mock);await q.evaluate(()=>refresh());await q.waitForTimeout(400);
await q.evaluate(()=>openCapture('Feeling great'));await q.waitForTimeout(200);await q.click('#capChange');
console.log('phone:',await q.evaluate(()=>{const r=[...document.querySelectorAll('#capKind button,#capChange')].map(b=>b.getBoundingClientRect());return Math.min(...r.map(x=>x.height))>=44&&document.documentElement.scrollWidth<=390}));
await q.screenshot({path:new URL('./out/capture-phone.png', import.meta.url).pathname});
console.log('errors',errs);
await b.close();
