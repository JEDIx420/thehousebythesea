import { chromium } from '@playwright/test';
import fs from 'node:fs';
const base=process.argv[2]??'http://localhost:4190/thehousebythesea/';
const label=process.argv[3]??'golden-v2';
if(!/^[a-z0-9-]+$/.test(label))throw new Error('Use a plain evidence label');
const browser=await chromium.launch({channel:process.env.CI?undefined:'chrome'});
try {
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await page.waitForFunction(()=>window.voyage?.getMetrics().frames>100);
 fs.mkdirSync('docs/evidence/pixel',{recursive:true});
 await page.screenshot({path:`docs/evidence/pixel/${label}.png`});
 const result={base,browser:browser.version(),metrics:await page.evaluate(()=>window.voyage.getMetrics()),bundle:await page.locator('script[type="module"]').getAttribute('src'),errors};
 fs.writeFileSync(`docs/evidence/pixel/${label}.json`,JSON.stringify(result,null,2)+'\n');
 if(errors.length)throw new Error(errors.join('\n'));console.log(JSON.stringify(result));
} finally {await browser.close();}
