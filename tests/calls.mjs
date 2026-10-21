import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
for (const [w,hgt,name] of [[1280,1600,"calls-desk"],[390,2400,"calls-phone"]]) {
const p = await b.newPage({viewport:{width:w,height:hgt}});
const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('dialog',d=>d.accept());
await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(1200);
await p.evaluate(()=>{
  const now=new Date().toISOString(), t0=T(), inH=h=>new Date(Date.now()+h*36e5).toISOString();
  window.DB={projects:[{id:'zenara',name:'Zenara',area:'Career',color:'#2F6DB5'},{id:'zenara-launches',name:'Launches & campaigns',area:'Career',parent_id:'zenara',color:'#C4412F'}],
   tasks:[{id:'a',title:'Close COM-432 core Flow sales collateral',project_id:'zenara-launches',status:'doing',priority:'high',due:t0,steps:[{text:'x',done:true},{text:'y',done:false}]},
          {id:'w',title:'Get David\'s review of the AI trust position (COM-450)',project_id:'zenara',status:'waiting',waiting_on:'David',waiting_since:now,follow_ups:1,follow_up_on:t0}],
   notes:[{id:'n1',project_id:'zenara',kind:'decision',title:'Flow pilot = Founding Partner Program',body:'x'}],
   project_briefs:[],source_segments:[],sources:[],changes:[],inputs:[],input_uses:[],
   call_series:[{id:'david-1on1',name:'David 1:1',people:['David'],kind:'1:1',order:1,active:true},{id:'sam-catchup',name:'Sam catch-up',people:['Sam'],kind:'catch-up',order:3,active:true}],
   agenda_items:[{id:'a1',series_id:'david-1on1',kind:'update',text:'Bookings with Bambi and conversion since last week (not opens)',status:'open',recurring:true,created_at:now},
                 {id:'a2',series_id:'david-1on1',kind:'decide',text:'Budget OK for healthcare ghostwriter + podcast producer',status:'open',recurring:false,created_at:now}]};
  window.PREP={'david-1on1':{id:'david-1on1',name:'David 1:1',people:['David'],purpose:'Your manager (commercial lead). Lead with results he measures marketing on: bookings with Bambi and conversion, not opens.',next_at:inH(5),since:new Date(Date.now()-2*864e5).toISOString(),
     last:{id:'s1',title:'Strategy, messaging and sales collateral for Flow with David, 13 Oct 2026',at:new Date(Date.now()-2*864e5).toISOString(),summary:'Flow is a practice workflow automation platform, not just CCM.\n- Cold email: separate M365 account\n- Partner program one-pager to David',url:'https://notes.wisprflow.ai/x'},
     agenda:[], done:[{id:'d1',title:'Build messaging house with Flow StoryBrand folded in',at:now},{id:'d2',title:'Cut the Partner Program down to a US version',at:now},{id:'d3',title:'Create the marketing-content backlog (COM-453)',at:now},{id:'d4',title:'d4',at:now},{id:'d5',title:'d5',at:now},{id:'d6',title:'d6',at:now}],
     doing:[{id:'a',title:'Close COM-432 core Flow sales collateral',steps:11,steps_done:4,due:t0}],
     next:[{id:'x1',title:'Fix booking-conversion tracking: call with Deepak',due:t0}],
     blocked:[{id:'b1',title:'Draft Flow launch plan working back from Intuitive Psychiatry go-live',waits_on:'Slice 1 two-pager from Pratik (live vs pilot vs roadmap)'}],
     asks:[{id:'w',title:"Get David's review of the AI trust position (COM-450)",waiting_on:'David',since:now,follow_ups:1}],
     inputs:[{id:'i1',question:'Approved claims list (COM-412)',docs:3},{id:'i2',question:'Founding Partner fee definitions',docs:0}],
     questions:[{project_id:'zenara',text:'Is there a real HLTH announcement? — David / Ravi'}],
     decided:[{id:'n1',title:'Flow pilot = Founding Partner Program'}]},
   'sam-catchup':{id:'sam-catchup',name:'Sam catch-up',people:['Sam'],purpose:'Direct report.',next_at:inH(120),since:now,last:null,agenda:[],done:[],doing:[],next:[],blocked:[],asks:[],inputs:[],questions:[],decided:[]}};
  const q=(t)=>{let rows=JSON.parse(JSON.stringify(DB[t]||[]));const o={then:(r,j)=>Promise.resolve({data:rows,error:null}).then(r,j),order:()=>o,limit:()=>o,gte:()=>o};return o};
  sb.rpc=(fn,{s})=>{if(fn==='call_prep'){const p=JSON.parse(JSON.stringify(PREP[s]));p.agenda=DB.agenda_items.filter(a=>a.series_id===s&&a.status==='open');return Promise.resolve({data:p,error:null})}
    return Promise.resolve({data:'# Prep: '+s+'\n## To raise\n- x',error:null})};
  sb.from=t=>{const tb=DB[t];return{select:()=>q(t),
    update:row=>({eq:(c,id)=>{const r=tb.find(x=>x.id===id);if(r)Object.assign(r,row);return Promise.resolve({error:null})}}),
    upsert:row=>{tb.push(row);return Promise.resolve({error:null})},
    delete:()=>({eq:(c,id)=>{const i=tb.findIndex(x=>x.id===id);if(i>=0)tb.splice(i,1);return Promise.resolve({error:null})}}),
    insert:row=>{const r={id:'new'+tb.length,status:'open',created_at:new Date().toISOString(),...row};tb.push(r);const pr=Promise.resolve({error:null});pr.select=()=>({single:()=>Promise.resolve({data:r,error:null})});return pr}}};
  refresh();
});
await p.waitForTimeout(600);
const rail = await p.$('.next-call'); console.log(name,'next-call card:', rail? (await rail.innerText()).replace(/\n/g,' | '):'none');
if(w>500) await p.screenshot({path:new URL('./out/'+name+'-today.png', import.meta.url).pathname,fullPage:false});
await (w>500? p.click('.next-call [data-cs]') : p.evaluate(()=>{S.view='calls';render()}));
await p.waitForTimeout(500);
console.log('hash', await p.evaluate(()=>location.hash), 'view', await p.evaluate(()=>S.view+'/'+S.cs));
await p.screenshot({path:new URL('./out/'+name+'.png', import.meta.url).pathname,fullPage:true});console.log(await p.evaluate(()=>{const u=document.querySelector('.pl'),l=u.querySelector('li');const cu=getComputedStyle(u),cl=getComputedStyle(l);return [cu.display,cu.alignItems,cu.textAlign,cl.display,cl.width,cl.justifyContent,cl.marginLeft,u.getBoundingClientRect().width].join(' ')}));
await p.fill('#agendaAdd [name=t]','Who owns Chelsea follow-up?'); await p.selectOption('#agendaAdd [name=k]','ask'); await p.click('#agendaAdd button'); await p.waitForTimeout(400);
console.log('agenda after add:', await p.evaluate(()=>DB.agenda_items.map(a=>a.kind+':'+a.text+':'+a.status).join(' | ')));
await p.click('[data-acov="a2"]'); await p.waitForTimeout(400);
console.log('after cover:', await p.evaluate(()=>DB.agenda_items.find(a=>a.id==='a2').status), 'shown:', await p.evaluate(()=>!!document.querySelector('[data-acov="a2"]')));
await p.evaluate(()=>HIST.run('undo')); await p.waitForTimeout(500);
console.log('after undo:', await p.evaluate(()=>DB.agenda_items.find(a=>a.id==='a2').status));
await p.click('[data-prepall="david-1on1"]'); await p.waitForTimeout(200);
console.log('show all rows:', await p.evaluate(()=>document.querySelectorAll('.pl li').length));
await p.click('[data-cs="sam-catchup"]'); await p.waitForTimeout(300);
console.log('sam sheet boxes:', await p.evaluate(()=>[...document.querySelectorAll('.prep-box h2')].map(x=>x.textContent).join(' / ')));
console.log('nav:', await p.evaluate(()=>document.querySelector('#side [data-go="calls"]')?.textContent));
console.log('errors', errs);
await p.close();
}
await b.close();
