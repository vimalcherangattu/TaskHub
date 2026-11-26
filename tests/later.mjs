// Later shelf: capture parsing (format, minutes, tags), share-sheet default, "I'm free" picks, done + takeaway → note, stale keep/drop, edit, phone layout
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const errs=[];let fail=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)fail++};
async function boot(vp,url=''){
  const p=await b.newPage({viewport:vp}); p.on('pageerror',e=>errs.push(e.message));
  await p.goto(new URL('../index.html'+url, import.meta.url).href); await p.waitForTimeout(900);
  await p.evaluate(()=>{const ago=d=>new Date(Date.now()-d*864e5).toISOString();
    window.DB={projects:[{id:'zenara',name:'Zenara',area:'Career',color:'#1F8A8A'}],tasks:[],
      notes:[{id:'n1',kind:'idea',title:'Pricing idea',tags:['pricing'],project_id:'zenara',created_at:ago(3)}],
      shelf:[
        {id:'sh1',title:'Long read on agents',url:'https://example.com/agents',format:'read',minutes:25,tags:['ai'],status:'queued',created_at:ago(5)},
        {id:'sh2',title:'Talk on pricing',url:'https://www.youtube.com/watch?v=abc',format:'watch',minutes:18,tags:['pricing'],status:'queued',created_at:ago(2)},
        {id:'sh3',title:'Old podcast',url:'https://open.spotify.com/episode/x',format:'listen',minutes:50,tags:[],status:'queued',created_at:ago(90)},
        {id:'sh4',title:'Half-read essay',url:'https://example.com/essay',format:'read',minutes:8,tags:['ai'],status:'started',created_at:ago(10)},
        {id:'sh6',title:'My 2026 desk setup',url:'https://www.youtube.com/watch?v=mac',format:'watch',minutes:14,tags:[],status:'queued',author:'Ali Abdaal',site:'YouTube',summary:'The Mac apps I use every day: Raycast, Things and Obsidian.',enriched_at:ago(1),created_at:ago(4)},
        {id:'sh5',title:'Finished thing',url:'https://example.com/f',format:'read',minutes:5,tags:[],status:'done',done_at:ago(1),takeaway:'Keep it short.',created_at:ago(20)}],
      call_series:[],agenda_items:[],inputs:[],input_uses:[]};
    window.WR=[];
    const q=t=>{const o={then:(r,j)=>Promise.resolve({data:JSON.parse(JSON.stringify((DB[t]||[]).filter(x=>!o.nq||x[o.nq[0]]!==o.nq[1]))),error:null}).then(r,j),order:()=>o,limit:()=>o,gte:()=>o,neq:(k,v)=>{o.nq=[k,v];return o}};return o};
    sb.rpc=()=>Promise.resolve({data:null,error:null});
    window.FN=[];Object.defineProperty(sb,'functions',{configurable:true,value:{invoke:(n,o)=>{FN.push([n,o?.body]);return Promise.resolve({data:{done:[]},error:null})}}});
    sb.from=t=>({select:()=>q(t),
      update:v=>({eq:(_,id)=>{WR.push([t,'update',id,v]);const r=(DB[t]||[]).find(x=>x.id===id);if(r)Object.assign(r,v);return Promise.resolve({error:null})}}),
      upsert:v=>{WR.push([t,'upsert',v.id,v]);const a=DB[t]||(DB[t]=[]);const r=a.find(x=>x.id===v.id);r?Object.assign(r,v):a.push(v);return Promise.resolve({error:null})},
      insert:v=>({select:()=>({single:()=>{const row={id:(t==='shelf'?'sh-':'n-')+Math.random().toString(36).slice(2,8),created_at:new Date().toISOString(),...v};(DB[t]||(DB[t]=[])).push(row);WR.push([t,'insert',row.id,v]);return Promise.resolve({data:row,error:null})}})}),
      delete:()=>({eq:(_,id)=>{WR.push([t,'delete',id]);DB[t]=(DB[t]||[]).filter(x=>x.id!==id);return Promise.resolve({error:null})}})});
    refresh()});
  await p.waitForTimeout(700);return p}

const p=await boot({width:1440,height:1000});
// parsing
const parsed=await p.evaluate(()=>[shParse('Great talk on pricing #AI 20m https://youtu.be/xyz'),shParse('https://overcast.fm/+abc'),shParse('Essay on habits 1.5h https://example.com/a\nRavi said read this')]);
ok(parsed[0].format==='watch'&&parsed[0].minutes===20&&parsed[0].tags.includes('ai')&&parsed[0].tags.includes('pricing')&&parsed[0].title==='Great talk on pricing','parse: watch, 20 min, #ai + known tag pricing, clean title → '+JSON.stringify(parsed[0]));
ok(parsed[1].format==='listen'&&parsed[1].title.startsWith('overcast.fm'),'parse: podcast link is Listen, title from the link');
ok(parsed[2].format==='read'&&parsed[2].minutes===90&&parsed[2].why==='Ravi said read this','parse: hours and a why line');
// capture: a YouTube link picks Later on its own; an ordinary link stays Link
await p.evaluate(()=>openCapture('')); await p.waitForTimeout(80); await p.fill('#capText','https://www.youtube.com/watch?v=q1 Sleep science'); await p.waitForTimeout(80);
ok(await p.evaluate(()=>document.getElementById('capForm').elements.kind.value)==='later','capture: a video link defaults to Later');
await p.waitForTimeout(80); await p.fill('#capText','https://docs.google.com/doc/1 spec'); await p.waitForTimeout(80);
ok(await p.evaluate(()=>document.getElementById('capForm').elements.kind.value)==='link','capture: a doc link stays Link');
await p.click('#capKind [data-kind="later"]'); await p.fill('#capText','Sleep science https://www.youtube.com/watch?v=q1 #health 12m');
await p.click('#capForm button[type="submit"], #capForm button.primary'); await p.waitForTimeout(300);
const ins=await p.evaluate(()=>WR.find(w=>w[0]==='shelf'&&w[1]==='insert')?.[3]);
ok(ins&&ins.format==='watch'&&ins.minutes===12&&ins.tags.includes('health')&&ins.status==='queued'&&ins.title==='Sleep science','capture: saved to shelf → '+JSON.stringify(ins));
await p.evaluate(()=>document.getElementById('capDlg').open&&document.getElementById('capDlg').close());
ok(await p.evaluate(()=>FN.some(([n,b])=>n==='shelf-enrich'&&b?.id&&DB.shelf.some(x=>x.id===b.id&&x.title==='Sleep science'))),'a saved link is sent to shelf-enrich to read');
ok(await p.evaluate(()=>FN.some(([n,b])=>n==='shelf-enrich'&&!b?.id)),'on load, links not read yet are sent to shelf-enrich');
// content search: "mac apps" is only in the description
await p.evaluate(()=>{S.view='later';render()}); await p.fill('#shq','mac apps'); await p.waitForTimeout(80);
const hits=await p.evaluate(()=>[...document.querySelectorAll('#view .sh-row .sh-t')].map(x=>x.textContent));
ok(hits.length===1&&hits[0]==='My 2026 desk setup','Later search finds a video by its description: '+hits.join(', '));
ok(await p.evaluate(()=>document.querySelector('#shr-sh6 .sh-why').textContent.toLowerCase().includes('mac apps')&&document.activeElement.id==='shq'),'shows the matching words and keeps focus in the box');
await p.fill('#shq','abdaal'); await p.waitForTimeout(80);
ok(await p.evaluate(()=>[...document.querySelectorAll('#view .sh-row .sh-t')].map(x=>x.textContent).join())==='My 2026 desk setup','search by channel / author');
await p.fill('#shq','short'); await p.waitForTimeout(80);
ok(await p.evaluate(()=>[...document.querySelectorAll('#view .sh-row .sh-t')].map(x=>x.textContent).join())==='Finished thing','search finds a done item by its takeaway');
await p.fill('#shq',''); await p.waitForTimeout(50);
const g=await p.evaluate(()=>findLocal('mac apps').filter(x=>x.g==='Later').map(x=>x.title));
ok(g.join()==='My 2026 desk setup','main search (Ctrl K) lists it under Later');
await p.evaluate(()=>{S.view='today';render();findHits=findLocal('mac apps');document.getElementById('findDlg').showModal();findGo(findHits.findIndex(x=>x.type==='later'))}); await p.waitForTimeout(100);
ok(await p.evaluate(()=>S.view==='later'&&!!document.getElementById('shr-sh6')),'picking it opens Later at that item');
// view
await p.evaluate(()=>{S.view='later';render()}); await p.waitForTimeout(100);
const secs=await p.evaluate(()=>[...document.querySelectorAll('#view .sh h2')].map(x=>x.textContent));
ok(JSON.stringify(secs)===JSON.stringify(['Still want these?','Started','On the shelf','Done']),'sections: '+secs.join(' | '));
ok(await p.evaluate(()=>document.querySelector('#side [data-go="later"] .count').textContent)==='6','sidebar count shows 6 live items');
// I'm free: 20 min, anything → started essay first, then the 18-min talk
await p.click('[data-shfree]'); await p.click('[data-shmin="20"]'); await p.waitForTimeout(50);
const picks=await p.evaluate(()=>[...document.querySelectorAll('.sh-free .sh-t')].map(x=>x.textContent));
ok(picks[0]==='Half-read essay'&&picks.includes('Talk on pricing')&&!picks.includes('Long read on agents'),"I'm free 20 min: "+picks.join(', '));
await p.click('[data-shmood="listen"]'); await p.waitForTimeout(50);
ok(await p.evaluate(()=>document.querySelector('.sh-free .cap-line')?.textContent.includes('Nothing fits')),'listen in 20 min: says nothing fits and offers the shortest');
await p.click('[data-shmood=""]'); await p.click('[data-shmin="60"]'); await p.click('[data-shnext]'); await p.waitForTimeout(50);
const next=await p.evaluate(()=>[...document.querySelectorAll('.sh-free .sh-t')].map(x=>x.textContent));
ok(next.length&&!next.includes('Half-read essay'),'Something else shows different picks: '+next.join(', '));
await p.click('[data-shfree]');
// filter
await p.click('[data-shf="watch"]'); await p.waitForTimeout(50);
ok(await p.evaluate(()=>[...document.querySelectorAll('#view .sh-row .sh-t')].every(x=>x.closest('.sh-row').querySelector('.sh-f').textContent==='Watch')),'Watch filter shows only videos');
await p.click('[data-shf=""]');
await p.click('[data-sht="ai"]'); await p.waitForTimeout(50);
ok(await p.evaluate(()=>[...document.querySelectorAll('#view .sh-row:not(.done) .sh-t')].map(x=>x.textContent).sort().join())==='Half-read essay,Long read on agents','#ai tag filter');
await p.click('[data-sht="ai"]');
// opening a queued link marks it started
await p.evaluate(()=>{window.open=()=>null;document.querySelector('a[data-shopen="sh1"]').addEventListener('click',e=>e.preventDefault(),{once:true})});
await p.click('a[data-shopen="sh1"]'); await p.waitForTimeout(150);
ok(await p.evaluate(()=>S.shelf.find(x=>x.id==='sh1').status)==='started','opening a link marks it started');
// done with takeaway → note
await p.click('[data-shdone="sh2"]'); await p.fill('[data-shtake="sh2"] textarea','Price on outcomes, not seats.');
await p.click('[data-shtake="sh2"] button.primary'); await p.waitForTimeout(300);
const note=await p.evaluate(()=>DB.notes.find(n=>n.source==='later'));
ok(note&&note.kind==='link'&&note.body==='Price on outcomes, not seats.'&&note.url.includes('youtube')&&note.tags.includes('later'),'takeaway saved as a note');
ok(await p.evaluate(()=>{const x=DB.shelf.find(x=>x.id==='sh2');return x.status==='done'&&!!x.done_at&&!!x.note_id&&!!x.takeaway}),'item done, linked to the note');
ok(await p.evaluate(()=>!inboxItems().some(i=>i.n&&i.n.source==='later')),'takeaway notes stay out of the Inbox');
// done without takeaway
await p.click('[data-shdone="sh1"]'); await p.click('[data-shtake="sh1"] button.primary'); await p.waitForTimeout(200);
ok(await p.evaluate(()=>DB.shelf.find(x=>x.id==='sh1').status==='done'&&DB.notes.filter(n=>n.source==='later').length===1),'done without a takeaway makes no note');
// undo puts it back
await p.evaluate(()=>HIST.run('undo')); await p.waitForTimeout(200);
ok(await p.evaluate(()=>S.shelf.find(x=>x.id==='sh1').status)==='started','undo restores the item');
// stale: keep and drop
await p.click('[data-shkeep="sh3"]'); await p.waitForTimeout(150);
ok(await p.evaluate(()=>!!DB.shelf.find(x=>x.id==='sh3').kept_at&&!document.querySelector('[data-shkeep="sh3"]')),'Keep resets the 60-day clock');
await p.click('[data-shdrop="sh4"]'); await p.waitForTimeout(150);
ok(await p.evaluate(()=>DB.shelf.find(x=>x.id==='sh4').status)==='dropped','Drop marks it dropped');
// edit
await p.click('[data-shed="sh3"]'); await p.fill('[data-shedit="sh3"] input[name="minutes"]','45'); await p.fill('[data-shedit="sh3"] input[name="tags"]','money, #Health');
await p.selectOption('[data-shedit="sh3"] select[name="projectId"]','zenara'); await p.click('[data-shedit="sh3"] button.primary'); await p.waitForTimeout(200);
ok(await p.evaluate(()=>{const x=DB.shelf.find(x=>x.id==='sh3');return x.minutes===45&&x.tags.join()==='money,health'&&x.project_id==='zenara'}),'edit saves minutes, tags and project');
await p.evaluate(()=>{document.documentElement.dataset.theme='dark';render()}); await p.click('[data-shfree]');
await p.screenshot({path:'tests/out/later-dark.png',fullPage:true});
await p.close();

// share sheet: start() opens Capture with kind "later" for a shared link; typing doesn't flip it back
const s2=await boot({width:1440,height:1000});
await s2.evaluate(()=>openCapture('Deep work talk\nhttps://example.com/post','later'));
await s2.fill('#capText','Deep work talk https://example.com/post #focus');
ok(await s2.evaluate(()=>document.getElementById('capForm').elements.kind.value)==='later','shared link stays on Later while editing');
ok(/openCapture\(cap,\/https\?:\\\/\\\/\/\.test\(cap\)&&!sp\.get\("capture"\)\?"later":null\)/.test(await s2.evaluate(()=>[...document.scripts].map(x=>x.text).join(''))),'start() sends shared links to Later');
await s2.close();

// phone: no horizontal scroll, 44px targets
const m=await boot({width:390,height:844});
await m.evaluate(()=>{S.view='later';render()}); await m.click('[data-shfree]'); await m.waitForTimeout(100);
ok(await m.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'phone: no horizontal scroll');
const small=await m.evaluate(()=>[...document.querySelectorAll('#view .sh-acts .tool,.sh-free .chip')].filter(x=>x.getBoundingClientRect().height<44).length);
ok(small===0,'phone: action buttons and picker chips are 44px+');
await m.evaluate(()=>openMore()); ok(await m.evaluate(()=>!!document.querySelector('#moreBody [data-go="later"]')),'phone: Later is in the More sheet');
await m.evaluate(()=>document.getElementById('moreDlg').close());
await m.screenshot({path:'tests/out/later-phone.png',fullPage:true});
await b.close();
console.log('errors', errs);
process.exit(fail||errs.length?1:0);
