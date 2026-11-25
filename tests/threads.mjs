import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
// Threads (25 Nov 2026): Plan › Threads, a thread page, close / reopen / merge, a project's Threads section
const b = await chromium.launch();
const errs=[];
async function setup(p,hash=''){
  await p.goto(new URL('../index.html', import.meta.url).href+hash); await p.waitForTimeout(1000);
  await p.evaluate(()=>{
    const ago=h=>new Date(Date.now()-h*36e5).toISOString();
    window.CALLS=[];
    window.DB={projects:[{id:'zenara',name:'Zenara',area:'Career',color:'#1F8A8A'},{id:'zenara-website',name:'Website',area:'Career',parent_id:'zenara',color:'#2F6DB5'},{id:'health',name:'Health',area:'Life',color:'#4A8A63'}],
      tasks:[{id:'t1',title:'Ship the homepage',project_id:'zenara-website',status:'todo',priority:'med',steps:[],activity:[],blocked_by:[]}],notes:[],
      threads:[
        {id:'zenara:weekly-plan',project_id:'zenara',name:'Weekly plan and reviews',summary:'STATE at 18:05 IST\n\nDONE TODAY\n- Midweek review done\n- Sent Ravi the list https://linear.app/x/doc-1\n\nNEXT\n- Monday office hours',next_step:'Chase Ravi on Monday',version:3,status:'active',aliases:[],private:false,last_activity_at:ago(0.6),created_at:ago(300),updated_at:ago(0.6)},
        {id:'zenara-website:revamp',project_id:'zenara-website',name:'Website revamp',summary:'Phase 1 ships by 4 Dec.',next_step:'Get WordPress admin from Ravi',version:1,status:'active',aliases:[],private:false,last_activity_at:ago(5),created_at:ago(30),updated_at:ago(5)},
        {id:'zenara-website:seo',project_id:'zenara-website',name:'SEO and AEO',summary:'Keyword map drafted.',next_step:null,version:1,status:'active',aliases:[],private:false,last_activity_at:ago(24*20),created_at:ago(24*30),updated_at:ago(24*20)},
        {id:'zenara:old-plan',project_id:'zenara',name:'October plan',summary:'Done.',version:2,status:'closed',aliases:[],private:false,last_activity_at:ago(24*25),created_at:ago(24*40),updated_at:ago(24*25)},
        {id:'health:lean-bulk-plan',project_id:'health',name:'Lean bulk plan',summary:'Private plan.',version:1,status:'active',aliases:[],private:true,last_activity_at:ago(20),created_at:ago(40),updated_at:ago(20)}],
      thread_checkpoints:[
        {id:'c1',thread_id:'zenara:weekly-plan',session_id:'legacy-note:n-1',base_version:1,body:'Week of 16 Nov plan',next_step:null,merged_at:ago(30),merged_into_version:1,created_at:ago(200)},
        {id:'c2',thread_id:'zenara:weekly-plan',session_id:'legacy-note:n-2',base_version:1,body:'Week of 23 Nov plan',next_step:null,merged_at:ago(30),merged_into_version:2,created_at:ago(60)},
        {id:'c3',thread_id:'zenara-website:revamp',session_id:'session_abc',base_version:1,body:'Drafted the About page copy',next_step:'Review About copy with David',merged_at:null,merged_into_version:null,created_at:ago(1)}],
      hub_sessions:[{session_id:'session_abc',thread_id:'zenara-website:revamp',title:'Website revamp chat',url:'https://claude.ai/chat/abc',kind:'chat',updated_at:ago(0.5)},{session_id:'s-old',thread_id:'zenara:weekly-plan',title:'Old',kind:'chat',updated_at:ago(5)}],
      changes:[{id:9,at:ago(2),project_id:'zenara',kind:'thread',ref_table:'threads',ref_id:'zenara:weekly-plan',summary:'Thread committed v3',actor:'claude'}]};
    const q=t=>{const o={then:(r,j)=>Promise.resolve({data:JSON.parse(JSON.stringify(DB[t]||[])),error:null}).then(r,j),order:()=>o,limit:()=>o,gte:()=>o};return o};
    sb.rpc=(fn,a)=>{CALLS.push([fn,a]);
      if(fn==='thread_close'){const t=DB.threads.find(x=>x.id===a.p_thread);t.status='closed';return Promise.resolve({data:'Closed',error:null})}
      if(fn==='thread_merge'){const f=DB.threads.find(x=>x.id===a.p_from);DB.thread_checkpoints.push({id:'cm',thread_id:a.p_into,session_id:'merge',body:'Merged in thread "'+f.name+'":\n'+f.summary,merged_at:null,created_at:new Date().toISOString()});
        DB.thread_checkpoints.forEach(c=>{if(c.thread_id===a.p_from&&!c.merged_at)c.thread_id=a.p_into});f.status='merged';f.merged_into=a.p_into;return Promise.resolve({data:'Merged',error:null})}
      return Promise.resolve({data:null,error:null})};
    sb.from=t=>{const tb=DB[t]||(DB[t]=[]);return{select:()=>q(t),
      update:row=>({eq:(c,id)=>{CALLS.push(['update',t,row,id]);const r=tb.find(x=>x.id===id);if(r)Object.assign(r,row);return Promise.resolve({error:null})}}),
      upsert:row=>{const r=tb.find(x=>x.id===row.id);if(r)Object.assign(r,row);else tb.push({...row});return Promise.resolve({error:null})},
      delete:()=>{CALLS.push(['DELETE',t]);return{eq:()=>Promise.resolve({error:null})}},
      insert:row=>({select:()=>({single:()=>{const r={id:'new'+tb.length,...row};tb.push(r);return Promise.resolve({data:{...r},error:null})}})})}};
    refresh();
  });
  await p.waitForTimeout(700);
}
const p=await b.newPage({viewport:{width:1440,height:1000}}); p.on('pageerror',e=>errs.push(e.message));
await p.context().grantPermissions(['clipboard-read','clipboard-write']);
await setup(p);
await p.evaluate(()=>{S.view='week';render()}); await p.waitForTimeout(150);
console.log('Threads tab after Agents, before Review:', await p.evaluate(()=>[...document.querySelectorAll('.ptabs button')].map(x=>x.dataset.go).join(',')));
console.log('tab count (threads with pending):', await p.evaluate(()=>document.querySelector('.ptabs [data-go="threads"] span')?.textContent));
await p.click('.ptabs [data-go="threads"]'); await p.waitForTimeout(200);
const rows=()=>p.evaluate(()=>[...document.querySelectorAll('#view .thr')].map(x=>x.dataset.thread));
console.log('active rows, newest first, grouped by top project:', await rows());
console.log('group headings:', await p.evaluate(()=>[...document.querySelectorAll('#view section .sh h2')].map(x=>x.textContent).join(' | ')), '| sub-project line:', await p.evaluate(()=>document.querySelector('.th-sub')?.textContent));
const r=sel=>p.evaluate(s=>{const e=document.querySelector(s);return e?e.textContent.replace(/\s+/g,' ').trim():null},sel);
console.log('weekly-plan row:', await r('.thr[data-thread="zenara:weekly-plan"]'));
console.log('revamp row (pending + live):', await r('.thr[data-thread="zenara-website:revamp"]'), '| live dot:', await p.evaluate(()=>!!document.querySelector('.thr[data-thread="zenara-website:revamp"] .live')), '| old session not live on weekly-plan:', await p.evaluate(()=>!document.querySelector('.thr[data-thread="zenara:weekly-plan"] .live')));
console.log('seo row stale:', await r('.thr[data-thread="zenara-website:seo"] .thb.stale'));
console.log('private row blurred:', await p.evaluate(()=>{const e=document.querySelector('.thr[data-thread="health:lean-bulk-plan"]');return e.classList.contains('priv')&&getComputedStyle(e.querySelector('b')).filter.includes('blur')}));
console.log('closed hidden:', !(await rows()).includes('zenara:old-plan'));
for(const f of ['pending','live','stale']){await p.click(`[data-thf="${f}"]`);await p.waitForTimeout(80);console.log(' filter',f,await rows())}
await p.click('[data-thf=""]'); await p.click('[data-thclosed]'); await p.waitForTimeout(80);
console.log('show closed:', (await rows()).includes('zenara:old-plan'), await r('.thr[data-thread="zenara:old-plan"] .thb'));
await p.click('[data-thclosed]');
await p.screenshot({path:'tests/out/threads.png',fullPage:true});
// thread page
await p.click('.thr[data-thread="zenara:weekly-plan"]'); await p.waitForTimeout(200);
console.log('hash:', await p.evaluate(()=>location.hash), '| tab still Threads:', await p.evaluate(()=>document.querySelector('.ptabs [aria-selected="true"]')?.dataset.go));
console.log('summary with line breaks + link:', await p.evaluate(()=>{const m=document.querySelector('#view .th-sum .md');return m.querySelectorAll('p,li').length+' blocks, link '+m.querySelector('a')?.href}));
console.log('history newest first:', await p.evaluate(()=>[...document.querySelectorAll('#view details summary')].map(x=>x.textContent).join(' | ')));
console.log('activity from changes:', await r('#view .changes li'));
await p.click('[data-thcopy]'); await p.waitForTimeout(150);
console.log('copied:', await p.evaluate(()=>navigator.clipboard.readText()));
// pending above summary on revamp
await p.evaluate(()=>openThread('zenara-website:revamp')); await p.waitForTimeout(150);
console.log('section order:', await p.evaluate(()=>[...document.querySelectorAll('#view section .sh h2')].map(x=>x.textContent).join(' > ')));
console.log('pending marked:', await r('#view .th-box.pend .thb.new'), '| live session:', await r('#view .th-live'));
await p.screenshot({path:'tests/out/thread-page.png',fullPage:true});
// merge: only active threads on the same project
await p.evaluate(()=>openThread('zenara-website:seo')); await p.waitForTimeout(150);
await p.click('[data-thmerge]'); await p.waitForTimeout(100);
console.log('merge candidates:', await p.evaluate(()=>[...document.querySelectorAll('[data-thto]')].map(x=>x.dataset.thto)), '| Merge disabled before pick:', await p.evaluate(()=>document.querySelector('[data-thmgo]').disabled));
await p.click('[data-thto="zenara-website:revamp"]'); await p.click('[data-thmgo]'); await p.waitForTimeout(500);
console.log('merge rpc:', JSON.stringify(await p.evaluate(()=>CALLS.find(c=>c[0]==='thread_merge'))), '| now on:', await p.evaluate(()=>S.thid), '| seo merged:', await p.evaluate(()=>DB.threads.find(x=>x.id==='zenara-website:seo').status));
console.log('target shows merged-in checkpoint as pending:', await p.evaluate(()=>document.querySelectorAll('#view .th-box.pend').length), '| merged-in list:', await r('#view .thr[data-thread="zenara-website:seo"]'));
// close and reopen
await p.click('[data-thclose]'); await p.waitForTimeout(300);
console.log('close rpc:', JSON.stringify(await p.evaluate(()=>CALLS.find(c=>c[0]==='thread_close'))), '| Reopen shown:', await p.evaluate(()=>!!document.querySelector('[data-threopen]')));
await p.click('[data-threopen]'); await p.waitForTimeout(300);
console.log('reopen update:', JSON.stringify(await p.evaluate(()=>CALLS.find(c=>c[0]==='update'))), '| status:', await p.evaluate(()=>DB.threads.find(x=>x.id==='zenara-website:revamp').status));
// failed close puts it back
await p.evaluate(()=>{const o=sb.rpc;sb.rpc=(fn,a)=>fn==='thread_close'?Promise.resolve({data:null,error:{message:'nope'}}):o(fn,a)});
await p.click('[data-thclose]'); await p.waitForTimeout(300);
console.log('failed close rolls back:', await p.evaluate(()=>thOf('zenara-website:revamp').status), await p.evaluate(()=>document.getElementById('toast').textContent));
console.log('no DELETE ever:', await p.evaluate(()=>!CALLS.some(c=>c[0]==='DELETE')));
// project pages
await p.evaluate(()=>{S.view='project';S.pid='zenara-website';render()}); await p.waitForTimeout(150);
console.log('project Threads section:', await p.evaluate(()=>[...document.querySelectorAll('#view .thr')].map(x=>x.dataset.thread)), '|', await r('#view .cap-line'));
await p.evaluate(()=>{S.view='project';S.pid='zenara';render()}); await p.waitForTimeout(150);
console.log('workspace Threads section:', await p.evaluate(()=>[...document.querySelectorAll('#view .thr')].map(x=>x.dataset.thread+' ('+x.querySelector('.tm').textContent+')')));
// a link straight to a thread
const p2=await b.newPage({viewport:{width:1200,height:900}}); p2.on('pageerror',e=>errs.push(e.message));
await setup(p2,'#thread/'+encodeURIComponent('zenara:weekly-plan'));
await p2.evaluate(()=>{started=false;return start()}); await p2.waitForTimeout(500);
console.log('#thread link opens it:', await p2.evaluate(()=>document.querySelector('#view h1')?.textContent));
await p2.evaluate(()=>{location.hash='#thread/'+encodeURIComponent('zenara-website:revamp')}); await p2.waitForTimeout(200);
console.log('hash change follows:', await p2.evaluate(()=>document.querySelector('#view h1')?.textContent));
// phone, dark
const m=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}); m.on('pageerror',e=>errs.push(e.message));
await setup(m); await m.evaluate(()=>{document.documentElement.dataset.theme='dark';S.view='threads';render()}); await m.waitForTimeout(200);
console.log('phone: no sideways scroll:', await m.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), '| row height >= 44:', await m.evaluate(()=>Math.min(...[...document.querySelectorAll('.thr')].map(x=>x.getBoundingClientRect().height))>=44), '| tabs >= 44:', await m.evaluate(()=>Math.min(...[...document.querySelectorAll('.ptabs button,.th-tools .chip')].map(x=>x.getBoundingClientRect().height))>=44));
await m.screenshot({path:'tests/out/threads-phone-dark.png',fullPage:true});
await m.evaluate(()=>openThread('zenara-website:revamp')); await m.waitForTimeout(200);
console.log('phone thread page: no sideways scroll:', await m.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
await m.screenshot({path:'tests/out/thread-phone-dark.png',fullPage:true});
console.log('errors', errs);
await b.close();
