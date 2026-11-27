// Real first approach, conversations, boarding and open-sea sailing; no state writes.
import {chromium} from '@playwright/test';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {navigate,installInputProbe,state} from '../../../tests/browser/input.ts';
const base=process.argv[2]??'http://localhost:4180/thehousebythesea/';
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--ignore-gpu-blocklist']});
const ctx=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:.5});
await ctx.tracing.start({sources:true,screenshots:false,snapshots:false});
const page=await ctx.newPage();await installInputProbe(page);
const report={base,browser:browser.version(),deviceScaleFactor:.5,result:'NOT RUN'};
try{
 await page.goto(base);await page.getByRole('button',{name:'Begin your voyage',exact:true}).click();await page.getByRole('button',{name:'Skip memory',exact:true}).click();
 const start=Date.now();await navigate(page,44,4);report.firstApproachMs=Date.now()-start;
 assert.deepEqual(await page.evaluate(()=>[...window.__voyageTestKeys]),[]);
 await page.keyboard.press('e');await page.getByRole('button',{name:/Take the parcel/}).click();
 await navigate(page,37,0);await navigate(page,37,-11);await navigate(page,37,-12);await page.keyboard.press('e');await page.getByRole('button',{name:'Invite Mira to sketch Saltglass'}).click();
 await navigate(page,37,0);await navigate(page,48,0);await navigate(page,54,0);await page.keyboard.press('e');assert.equal((await state(page)).player.mode,'boat');
 const seaStart=Date.now();await navigate(page,68,-20,3);await navigate(page,68,-110,5);report.openSeaMs=Date.now()-seaStart;
 report.totalMs=Date.now()-start;report.after=(await state(page)).player;report.keysAfter=await page.evaluate(()=>[...window.__voyageTestKeys]);assert.deepEqual(report.keysAfter,[]);
 report.metrics=await page.evaluate(()=>window.voyage.metrics());report.bundle=await page.locator('script[type="module"][src]').getAttribute('src');report.result='PASS';
} catch(error){report.result='FAIL';report.error=String(error);throw error;}
finally{fs.mkdirSync('test-results/continuous-input-diagnostic',{recursive:true});await ctx.tracing.stop({path:'test-results/continuous-input-diagnostic/trace.zip'});fs.writeFileSync(new URL('./continuous-input-diagnostic.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify(report));await browser.close();}
