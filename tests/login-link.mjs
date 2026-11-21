import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
// an email link to the app (?token_hash=) waits for a tap; opening it (a preview) uses nothing
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:390,height:844}});
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{window.calls=[]});
await p.goto(new URL('../index.html?token_hash=th1&type=magiclink', import.meta.url).href); await p.waitForTimeout(1500);
await p.evaluate(()=>{sb.auth.verifyOtp=async o=>{calls.push(o.token_hash+'/'+o.type);return{error:{status:403}}}});
console.log('opened:',await p.textContent('.login .sub'),'calls',JSON.stringify(await p.evaluate(()=>calls)));
await p.click('#linkForm button[type=submit]');await p.waitForTimeout(100);
console.log('tapped (used):',await p.textContent('.login .sub'),'calls',JSON.stringify(await p.evaluate(()=>calls)),'url',p.url().includes('token_hash'));
await p.click('#loginForm button').catch(()=>{});
// pasting an app link into the code form
await p.evaluate(()=>showCode('me@example.com'));await p.fill('#codeForm input','https://task-hub-one-delta.vercel.app/?token_hash=th2&type=magiclink');await p.click('#codeForm button[type=submit]');await p.waitForTimeout(100);
const c=await p.evaluate(()=>calls);console.log('pasted calls',JSON.stringify(c));
if(c.join()!=='th1/magiclink,th2/magiclink')errs.push('unexpected calls '+c.join());
console.log('errors',errs);await b.close();if(errs.length)process.exit(1);
