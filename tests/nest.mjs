import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
// Multi-level nesting (12 Nov 2026): Tharavad › Faceless YouTube › Kitchen Table Numbers
const b = await chromium.launch();
async function setup(p){
  await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(1000);
  await p.evaluate(()=>{
    const t0=T(),ago=h=>new Date(Date.now()-h*36e5).toISOString();
    window.DB={projects:[
      {id:'group-hq',name:'Tharavad',area:'Products',color:'#7A4FB0'},
      {id:'faceless-youtube',name:'Faceless YouTube',area:'Products',parent_id:'group-hq',color:'#C4412F'},
      {id:'ktn',name:'Kitchen Table Numbers',area:'Products',parent_id:'faceless-youtube',color:'#1F8A8A'},
      {id:'mopt',name:'Museum of Private Things',area:'Products',parent_id:'faceless-youtube',color:'#B0407A'},
      {id:'filow',name:'Filow',area:'Products',parent_id:'group-hq',color:'#2F6DB5'},
      {id:'home',name:'Home & family',area:'Life',color:'#D0662A'}],
    tasks:[
      {id:'a',title:'Render KTN episode 4',project_id:'ktn',status:'todo',priority:'med',today_date:t0,updated_at:ago(1),steps:[],activity:[],blocked_by:[]},
      {id:'b',title:'Pick the next MoPT painting',project_id:'mopt',status:'todo',priority:'med',updated_at:ago(1),steps:[],activity:[],blocked_by:[]},
      {id:'c',title:'Pipeline: switch voice model',project_id:'faceless-youtube',status:'todo',priority:'med',today_date:t0,updated_at:ago(1),steps:[],activity:[],blocked_by:[]},
      {id:'d',title:'Filow win-back email',project_id:'filow',status:'todo',priority:'med',today_date:t0,updated_at:ago(1),steps:[],activity:[],blocked_by:[]},
      {id:'e',title:'Weekly board run',project_id:'group-hq',status:'todo',priority:'med',updated_at:ago(1),steps:[],activity:[],blocked_by:[]},
      {id:'f',title:'Call the plumber',project_id:'home',status:'todo',priority:'med',today_date:t0,updated_at:ago(1),steps:[],activity:[],blocked_by:[]}],
    notes:[]};
    const q=t=>{const o={then:(r,j)=>Promise.resolve({data:JSON.parse(JSON.stringify(DB[t]||[])),error:null}).then(r,j),order:()=>o,limit:()=>o,gte:()=>o};return o};
    sb.rpc=()=>Promise.resolve({data:null,error:null});
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
console.log('helpers:', await p.evaluate(()=>JSON.stringify({full:fullName(proj('ktn')),top:topOf(proj('ktn')).id,fam:fam('group-hq').sort(),depth:depthOf(proj('ktn'))})));
// Projects grid: one Tharavad card counting the whole tree
await p.evaluate(()=>{S.view='projects';render()}); await p.waitForTimeout(200);
console.log('Tharavad card:', await p.evaluate(()=>document.querySelector('#view .pcard[data-proj="group-hq"]')?.textContent));
console.log('no grandchild card:', await p.evaluate(()=>!document.querySelector('#view .pcard[data-proj="ktn"]')));
// workspace page: Faceless YouTube section holds its own and its sub-projects' tasks
await p.click('#view .pcard[data-proj="group-hq"]'); await p.waitForTimeout(200);
console.log('workspace sections hold grandchildren:', await p.evaluate(()=>{const s=[...document.querySelectorAll('#view section')].find(x=>x.querySelector('h2')?.textContent.includes('Faceless YouTube'));return s?[...s.querySelectorAll('.task')].map(x=>x.dataset.tid).sort().join(','):null}));
// a mid-level workspace has a crumb back to Tharavad, and the sidebar opens the whole path
await p.evaluate(()=>{S.view='project';S.pid='ktn';render()}); await p.waitForTimeout(200);
console.log('leaf crumbs:', await p.evaluate(()=>[...document.querySelectorAll('#view .head .crumb')].map(x=>x.textContent).join(' / ')));
console.log('sidebar path:', await p.evaluate(()=>[...document.querySelectorAll('.nav button[data-proj]')].map(x=>x.dataset.proj+(x.style.getPropertyValue('--lv')?':'+x.style.getPropertyValue('--lv'):'')).join(',')));
console.log('leaf has Add project:', await p.evaluate(()=>!!document.querySelector('#view [data-newsub="ktn"]')));
// seven levels: Tharavad › Faceless YouTube › KTN › Season 1 › Episode block › Ep 4 › Thumbnails
await p.evaluate(()=>{DB.projects.push({id:'s1',name:'Season 1',area:'Products',parent_id:'ktn',color:'#3E8A57'},{id:'blk',name:'Episode block',area:'Products',parent_id:'s1',color:'#E0A21A'},{id:'ep4',name:'Ep 4',area:'Products',parent_id:'blk',color:'#5E6E68'},{id:'thumbs',name:'Thumbnails',area:'Products',parent_id:'ep4',color:'#2F6DB5'},{id:'thumbs-b',name:'Alt thumbnails',area:'Products',parent_id:'ep4',color:'#2F6DB5'});
  DB.tasks.push({id:'g',title:'Pick the Ep 4 thumbnail',project_id:'thumbs',status:'todo',priority:'med',updated_at:new Date().toISOString(),steps:[],activity:[],blocked_by:[]});refresh()}); await p.waitForTimeout(500);
await p.evaluate(()=>{S.view='project';S.pid='thumbs';render()}); await p.waitForTimeout(200);
console.log('deep name on screen:', await p.evaluate(()=>fullName(proj('thumbs'))), '| search path:', await p.evaluate(()=>fullPath(proj('thumbs')).split(' › ').length));
console.log('deep crumbs:', await p.evaluate(()=>[...document.querySelectorAll('#view .head .crumb')].map(x=>x.textContent).join(' / ')));
console.log('deep sidebar rows:', await p.evaluate(()=>[...document.querySelectorAll('.nav button')].filter(x=>x.closest('.nav')&&(x.dataset.proj)).map(x=>(x.classList.contains('more')?'[':'')+x.textContent.trim()+(x.style.getPropertyValue('--lv')?':'+x.style.getPropertyValue('--lv'):'')).join(', ')));
console.log('max indent level:', await p.evaluate(()=>Math.max(...[...document.querySelectorAll('.nav button.sub')].map(x=>+x.style.getPropertyValue('--lv')||1))));
console.log('7th level has no Add project:', await p.evaluate(()=>!document.querySelector('#view [data-newsub]')));
console.log('picker indent capped:', await p.evaluate(()=>{const d=document.createElement('select');d.innerHTML=projOptions('thumbs');const o=[...d.options].find(x=>x.value==='thumbs').textContent;return JSON.stringify(o)}));
await p.screenshot({path:new URL('out/nest-deep.png',import.meta.url).pathname});
await p.evaluate(()=>openProj(proj('home'))); await p.waitForTimeout(150);
await p.evaluate(()=>{const f=document.getElementById('projForm');f.elements.parentId.value='thumbs';f.requestSubmit()}); await p.waitForTimeout(300);
console.log('8th level refused:', await p.evaluate(()=>!DB.projects.find(x=>x.id==='home').parent_id&&document.body.textContent.includes('7 is the most')));
await p.evaluate(()=>document.getElementById('projDlg').close());
await p.evaluate(()=>{DB.projects=DB.projects.filter(x=>!['s1','blk','ep4','thumbs','thumbs-b'].includes(x.id));DB.tasks=DB.tasks.filter(x=>x.id!=='g');S.view='project';S.pid='ktn';refresh()}); await p.waitForTimeout(500);
const ph=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}); ph.on('pageerror',e=>errs.push(e.message));
await setup(ph); await ph.evaluate(()=>{DB.projects.push({id:'s1',name:'Season 1',area:'Products',parent_id:'ktn',color:'#3E8A57'},{id:'blk',name:'Episode block',area:'Products',parent_id:'s1',color:'#E0A21A'},{id:'ep4',name:'Ep 4',area:'Products',parent_id:'blk',color:'#5E6E68'},{id:'thumbs',name:'Thumbnails',area:'Products',parent_id:'ep4',color:'#2F6DB5'});refresh()}); await ph.waitForTimeout(500);
await ph.evaluate(()=>{S.view='project';S.pid='thumbs';render()}); await ph.waitForTimeout(200);
console.log('phone: no sideways scroll:', await ph.evaluate(()=>document.documentElement.scrollWidth<=390));
await ph.screenshot({path:new URL('out/nest-phone.png',import.meta.url).pathname});
// pausing Tharavad pauses every level below
await p.evaluate(()=>{DB.projects.find(x=>x.id==='group-hq').paused_at=new Date().toISOString();refresh()}); await p.waitForTimeout(500);
console.log('paused below:', await p.evaluate(()=>['faceless-youtube','ktn','filow','home'].map(id=>id+':'+pausedIds().has(id)).join(',')));
console.log('paused note names Tharavad:', await p.evaluate(()=>document.querySelector('#view .paused-note')?.textContent.includes('Tharavad')));
await p.evaluate(()=>{delete DB.projects.find(x=>x.id==='group-hq').paused_at;DB.projects.find(x=>x.id==='group-hq').paused_at=null;refresh()}); await p.waitForTimeout(500);
// Today filter: Tharavad chip counts all levels; sub chip for Faceless YouTube covers KTN
await p.evaluate(()=>{S.view='today';S.tf='group-hq';S.tsub='';render()}); await p.waitForTimeout(200);
console.log('sub chips:', await p.evaluate(()=>{const d=document.createElement('div');d.innerHTML=todayFilters(S.tasks.filter(open));return [...d.querySelectorAll('[data-tsub]')].map(x=>x.textContent.trim()).join(' | ')}));
console.log('tfilter sub covers grandchild:', await p.evaluate(()=>{S.tsub='faceless-youtube';const r=['a','c','d'].map(id=>tfilter(S.tasks.find(t=>t.id===id)));S.tsub='';S.tf='';return r.join(',')}));
// task picker lists every level, indented
console.log('task picker:', await p.evaluate(()=>{const d=document.createElement('select');d.innerHTML=projOptions('ktn');return [...d.options].map(o=>o.textContent).filter(x=>/Kitchen|Faceless|Tharavad/.test(x)).join(' / ')}));
// project editor: move Faceless YouTube to top level and back; can't put it inside its own child
await p.evaluate(()=>openProj(proj('faceless-youtube'))); await p.waitForTimeout(150);
console.log('editor offers no own branch:', await p.evaluate(()=>{const o=[...document.querySelector('#projForm [name=parentId]').options].map(x=>x.value);return !o.includes('ktn')&&!o.includes('faceless-youtube')&&o.includes('filow')}));
await p.evaluate(()=>{const f=document.getElementById('projForm');f.elements.parentId.value='filow';f.requestSubmit()}); await p.waitForTimeout(400);
console.log('moved under Filow (3 deep):', await p.evaluate(()=>DB.projects.find(x=>x.id==='faceless-youtube').parent_id+' | '+fullName(proj('ktn'))));
// deleting a middle workspace moves its projects up one level, not to the top
await p.evaluate(()=>{window.confirm=()=>true;openProj(proj('faceless-youtube'))}); await p.waitForTimeout(150);
await p.click('#delProj'); await p.waitForTimeout(500);
console.log('kids moved up to Filow:', await p.evaluate(()=>DB.projects.filter(x=>['ktn','mopt'].includes(x.id)).map(x=>x.parent_id).join(',')));
// a loop in the data doesn't hang the app
await p.evaluate(()=>{DB.projects.find(x=>x.id==='group-hq').parent_id='ktn';refresh()}); await p.waitForTimeout(500);
console.log('loop safe:', await p.evaluate(()=>typeof fullName(proj('ktn'))==='string'&&fam('filow').length<10));
await p.screenshot({path:new URL('out/nest.png',import.meta.url).pathname});
console.log('errors', errs);
await b.close();
