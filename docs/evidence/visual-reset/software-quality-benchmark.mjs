// Five-second actual-render benchmark. No gameplay state or movement is injected.
import {chromium} from '@playwright/test';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const base=process.argv[2]??'http://localhost:4180/thehousebythesea/';
const mode=process.argv[3]??'software';
const dpr=Number(process.argv[4]??(mode==='software'?'.5':'1'));
// Optional assertions apply only to the rejected experimental preset builds.
const expectedShadow=process.argv[5]===undefined?null:Number(process.argv[5]);
const label=process.argv[6]??`${mode}-current`;
const browser=await chromium.launch({headless:true,channel:mode==='native'?'chrome':undefined,args:['--enable-webgl','--ignore-gpu-blocklist']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:dpr});
 await page.goto(base);await page.getByRole('button',{name:'Begin your voyage',exact:true}).click();await page.getByRole('button',{name:'Skip memory',exact:true}).click();await page.waitForTimeout(1000);
 const result=await page.evaluate(()=>new Promise(resolve=>{const intervals=[];let previous=performance.now(),start=previous;function sample(now){intervals.push(now-previous);previous=now;if(now-start<5000)requestAnimationFrame(sample);else{const sorted=[...intervals].sort((a,b)=>a-b),gl=document.querySelector('canvas').getContext('webgl2'),ext=gl.getExtension('WEBGL_debug_renderer_info'),name=ext?String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)):'';resolve({devicePixelRatio,frames:intervals.length,durationMs:now-start,meanMs:intervals.reduce((a,b)=>a+b,0)/intervals.length,p50:sorted[Math.floor(sorted.length*.5)],p95:sorted[Math.floor(sorted.length*.95)],rendererClass:/SwiftShader|llvmpipe|software/i.test(name)?'software':'hardware-or-unexposed',game:window.voyage.metrics(),bundle:document.querySelector('script[type="module"][src]').src});}}requestAnimationFrame(sample);}));
 if(expectedShadow!==null){
   assert.equal(result.game.graphicsPreset,mode==='software'?'compatibility':'standard');
   assert.equal(result.game.shadowMapSize,expectedShadow);
   assert.equal(result.game.realtimeShadows,expectedShadow>0);
 }
 fs.writeFileSync(new URL(`./${label}-benchmark.json`,import.meta.url),JSON.stringify({browser:browser.version(),mode,viewport:[1440,900],result},null,2));console.log(JSON.stringify(result));
}finally{await browser.close();}
