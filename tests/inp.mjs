import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1280,height:1400}});
const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('dialog',d=>d.type()==='prompt'?d.accept('Kara'):d.accept());
await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(1500);
await p.evaluate(()=>{
  const now=new Date().toISOString(), t0=T();
  window.DB={projects:[{id:'zenara',name:'Zenara',area:'Career',color:'#2F6DB5'},{id:'zenara-launches',name:'Launches & campaigns',area:'Career',parent_id:'zenara',color:'#C4412F'},{id:'zenara-content',name:'Content & thought leadership',area:'Career',parent_id:'zenara',color:'#3E8A57'}],
   tasks:[{id:'a',title:'Flow one-pager',project_id:'zenara-launches',status:'todo',priority:'high',due:t0},{id:'old',title:'Old approach',project_id:'zenara-launches',status:'done',superseded_by:'a',done_at:now},
          {id:'s1',title:'Follow up with Pratik on claims',project_id:'zenara-launches',status:'suggested',priority:'med',waiting_on:'Pratik'}],
   notes:[{id:'n1',project_id:'zenara-launches',kind:'decision',title:'Build implementation model on NeuroCoach',body:'x',source_id:'s-1'},{id:'n0',project_id:'zenara-launches',kind:'decision',title:'Old decision',body:'y',superseded_by:'n1'}],
   project_briefs:[{project_id:'zenara-launches',body:'**Status:** NeuroCoach live ~26 Oct; Pratik leaving is the main risk.\n**Where it stands:**\n- Assess campaign: ~400 sent, 1 booking\n- Booking tracking broken\n**Decisions:**\n- 13 Oct – Implementation model on NeuroCoach\n**Risks:**\n- Pratik exit',updated_at:now,updated_from:'s-1'},
                   {project_id:'zenara',body:'**Status:** Week 3 of 3 pilots by Dec.\n**Sub-projects:**\n- Launches — NeuroCoach ~26 Oct',updated_at:now,updated_from:'s-1'}],
   source_segments:[{id:'g1',source_id:'s-1',project_id:'zenara-launches',summary:'Assess numbers in, tracking broken.\n**Updates:** 400 sent\n**Actions:** Vimal → one-pager',created_at:now},{id:'g2',source_id:'s-1',project_id:'zenara-content',summary:'Kara January call.',created_at:now}],
   sources:[{id:'s-1',project_id:'zenara',related_projects:['zenara-launches','zenara-content'],title:'Weekly commercial sync, 13 Oct 2026',occurred_at:now,url:'https://notes.wisprflow.ai/x',summary:'sync',tags:[]},
            {id:'s-2',project_id:null,related_projects:[],title:'Quick sync, 14 Oct 2026',occurred_at:now,url:null,summary:'Unclear call about a school app',tags:[]}],
   changes:[{id:1,at:now,project_id:'zenara-launches',kind:'call',summary:'Call: Weekly commercial sync — Assess numbers in',actor:'meeting-agent'},{id:2,at:now,project_id:'zenara-launches',kind:'brief',summary:'Brief created',actor:'meeting-agent'}],
   routing_rules:[],
   inputs:[{id:'i1',key:'zenara-claims',question:'Approved claims list (COM-412)',project_id:'zenara-launches',owner:'Pratik',status:'pending',created_at:now},{id:'i2',key:'flow-roi',question:'Flow ROI',project_id:'zenara-launches',owner:'David',status:'received',answer:'$4.2k/mo',received_at:now,created_at:now}],
   input_uses:[{id:'u1',input_id:'i1',doc:'Flow one-pager',location:'Value lines',project_id:'zenara-launches',status:'pending',created_at:now},{id:'u2',input_id:'i1',doc:'Website structure',location:'Section copy',url:'https://x.y',project_id:'zenara-website',status:'pending',created_at:now}]};
  const q=(t)=>{let rows=JSON.parse(JSON.stringify(DB[t]));const o={then:(r,j)=>Promise.resolve({data:rows,error:null}).then(r,j),order:()=>o,limit:()=>o,gte:()=>o};return o};
  sb.from=t=>{const tb=DB[t];return{select:()=>q(t),
    update:row=>({eq:(c,id)=>{const r=tb.find(x=>x.id===id||x.project_id===id&&c==='project_id');if(r)Object.assign(r,row);return Promise.resolve({error:null})}}),
    upsert:row=>{tb.push(row);return Promise.resolve({error:null})},
    delete:()=>({eq:(c,id)=>{const i=tb.findIndex(x=>x.id===id);if(i>=0)tb.splice(i,1);return Promise.resolve({error:null})}}),
    insert:row=>{const r={id:'new'+tb.length,...row};tb.push(r);const pr=Promise.resolve({error:null});pr.select=()=>({single:()=>Promise.resolve({data:r,error:null})});return pr}}};
  refresh();
});
await p.waitForTimeout(500);
p.removeAllListeners('dialog');let answers=['Win rate 3x (approved)','Psych Congress proposal','Slide 4'];p.on('dialog',d=>d.type()==='prompt'?d.accept(answers.shift()):d.accept());
await p.evaluate(()=>{S.view='followups';render()});await p.waitForTimeout(300);
await p.screenshot({path:new URL('./out/inp1.png', import.meta.url).pathname,fullPage:true});
await p.click('[data-iuse="i1"]');await p.waitForTimeout(300);
console.log('use added:', await p.evaluate(()=>DB.input_uses.map(u=>u.doc+'/'+u.location).join(' | ')));
await p.click('[data-irecv="i1"]');await p.waitForTimeout(300);
console.log('received:', await p.evaluate(()=>{const i=DB.inputs.find(x=>x.id==='i1');return i.status+' / '+i.answer}), await p.textContent('#toast'));
await p.fill('#inputAdd [name=q]','HLTH speaker count');await p.fill('#inputAdd [name=who]','Bambi');await p.fill('#inputAdd [name=doc]','HLTH pitch');await p.click('#inputAdd button');await p.waitForTimeout(300);
console.log('new input:', await p.evaluate(()=>JSON.stringify(DB.inputs.slice(-1)[0])+' uses:'+DB.input_uses.length));
await p.evaluate(()=>{S.view='project';S.pid='zenara-launches';render()});await p.waitForTimeout(300);
await p.screenshot({path:new URL('./out/inp2.png', import.meta.url).pathname,fullPage:true});
console.log('errors', errs);
await b.close();
