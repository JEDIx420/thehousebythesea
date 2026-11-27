// Independent reviewer reproduction. Run after npm run build + npm run preview -- --port 4173.
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const base = process.argv[2] ?? 'http://localhost:4173/thehousebythesea/';
const browser = await chromium.launch({channel:process.env.CI?undefined:'chrome',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist']});
const results={base,browser:browser.version(),viewport:[1280,800],checks:[],errors:[]};
async function context(){return browser.newContext({viewport:{width:1280,height:800}});}
async function ready(page){page.on('pageerror',e=>results.errors.push(e.message));await page.goto(base);await page.waitForFunction(()=>window.voyage);}
async function readRaw(page){return page.evaluate(async()=>{const db=await new Promise((resolve,reject)=>{const q=indexedDB.open('thehousebythesea',1);q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)});const value=await new Promise((resolve,reject)=>{const q=db.transaction('snapshots','readonly').objectStore('snapshots').get('first-voyage');q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)});db.close();return value;});}
try{
  const ctx=await context(),page=await ctx.newPage();await ready(page);
  await page.getByRole('button',{name:'Credits & provenance',exact:true}).click();await page.keyboard.press('Escape');await page.getByRole('button',{name:'Begin your voyage',exact:true}).waitFor();
  await page.getByRole('button',{name:'Begin your voyage',exact:true}).click();await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>window.voyage.getState().story.prologueSeen),true);await page.waitForTimeout(800);await page.reload();await page.getByRole('button',{name:'Continue your voyage',exact:true}).waitFor();results.checks.push({name:'Title Credits/Escape and memory Escape/reload',result:'PASS'});await ctx.close();
  for(const raw of [{schemaVersion:99,wallet:999,marker:'do-not-overwrite'},'{broken-save']){
    const ctx=await context(),page=await ctx.newPage();
    // Plain text same-origin resource seeds storage without an old game's unload autosave race.
    await page.goto(`${base}assets/CREDITS.txt`);
    await page.evaluate(async(raw)=>{const db=await new Promise((resolve,reject)=>{const q=indexedDB.open('thehousebythesea',1);q.onupgradeneeded=()=>q.result.createObjectStore('snapshots');q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)});await new Promise((resolve,reject)=>{const t=db.transaction('snapshots','readwrite');t.objectStore('snapshots').put(raw,'first-voyage');t.oncomplete=resolve;t.onerror=()=>reject(t.error)});db.close();},raw);
    await ready(page);assert.match(await page.locator('#overlay').innerText(),/save.*(kept|overwritten)/i);await page.getByRole('button',{name:'Begin your voyage',exact:true}).click();await page.getByRole('button',{name:'Skip memory',exact:true}).click();await page.waitForTimeout(5500);assert.deepEqual(await readRaw(page),raw);results.checks.push({name:typeof raw==='string'?'Corrupt snapshot retained':'Newer snapshot retained',result:'PASS'});await ctx.close();
  }
  const ctx2=await context();await ctx2.addInitScript(()=>Object.defineProperty(window,'indexedDB',{value:undefined,configurable:true}));const page2=await ctx2.newPage();await ready(page2);assert.match(await page2.locator('#overlay').innerText(),/Saving is unavailable/);await page2.getByRole('button',{name:'Begin your voyage',exact:true}).click();await page2.getByRole('button',{name:'Skip memory',exact:true}).click();await page2.keyboard.press('Escape');assert.match(await page2.locator('#overlay').innerText(),/Saving is unavailable/);results.checks.push({name:'Unavailable storage warns on title and Pause; play starts',result:'PASS'});await ctx2.close();assert.deepEqual(results.errors,[]);
}finally{writeFileSync(new URL('./state-review-results.json',import.meta.url),JSON.stringify(results,null,2));await browser.close();}
console.log(JSON.stringify(results,null,2));
