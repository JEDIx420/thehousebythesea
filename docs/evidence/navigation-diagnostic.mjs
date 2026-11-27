// Reproduce traced software navigation without changing gameplay state.
import { chromium } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'node:fs';
import { navigate, installInputProbe, state } from '../../tests/browser/input.ts';
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--ignore-gpu-blocklist']});
const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:.5});
await context.tracing.start({screenshots:true,snapshots:true,sources:true});
const page=await context.newPage();await installInputProbe(page);
const base=process.argv[2]??'http://localhost:4181/thehousebythesea/';
let timer;const result={base,browser:browser.version(),renderScale:.5,result:'NOT RUN'};
try{
 await page.goto(base);await page.getByRole('button',{name:'Begin your voyage',exact:true}).click();await page.getByRole('button',{name:'Skip memory',exact:true}).click();
 result.before=(await state(page)).player;const started=Date.now();
 await Promise.race([navigate(page,44,4),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('First approach exceeded 45s')),45000);})]);
 result.elapsedMs=Date.now()-started;result.after=(await state(page)).player;
 result.renderer=await page.evaluate(()=>{const gl=document.querySelector('canvas').getContext('webgl2'),ext=gl.getExtension('WEBGL_debug_renderer_info');return ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER);});
 result.result='PASS';
}catch(error){result.result='FAIL';result.error=String(error);throw error;}
finally{clearTimeout(timer);mkdirSync('test-results/navigation-diagnostic',{recursive:true});await context.tracing.stop({path:'test-results/navigation-diagnostic/trace.zip'});writeFileSync(new URL('./navigation-diagnostic.json',import.meta.url),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));await browser.close();}
