import fs from 'node:fs/promises';
import {spawn} from 'node:child_process';
/** Captures the actual composited DOM+Phaser browser via CDP, and the actual
 * WebAudio output via a recording-only parallel destination. No invented audio. */
export async function installAudioCapture(page) {
 await page.addInitScript(()=>{
  const connect=AudioNode.prototype.connect;
  AudioNode.prototype.connect=function(destination,...args){
   const result=connect.call(this,destination,...args);
   if(destination===this.context.destination){
    const ctx=this.context;
    if(!ctx.__capture)ctx.__capture=ctx.createMediaStreamDestination();
    connect.call(this,ctx.__capture);
    window.__gameAudioContext=ctx;
   }
   return result;
  };
 });
}
export async function record(page,path){
 const cdp=await page.context().newCDPSession(page), chunks=[];
 let last, timer, audio=false;
 const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate','20','-vcodec','mjpeg','-i','pipe:0','-an','-c:v','libvpx-vp9','-deadline','realtime','-cpu-used','6','-row-mt','1','-threads','2','-crf','35','-b:v','0',`${path}-video.webm`],{stdio:['pipe','ignore','pipe']});
 let errors='',encoderError;const done=new Promise((resolve,reject)=>{ff.once('error',e=>{encoderError=e;reject(e);});ff.once('exit',code=>code?reject(Error(errors)):resolve());});done.catch(()=>{});page.once('close',()=>{clearInterval(timer);if(ff.exitCode===null)ff.kill();});ff.stderr.on('data',x=>errors+=x);ff.stdin.on('error',()=>{});
 cdp.on('Page.screencastFrame',async e=>{last=Buffer.from(e.data,'base64');await cdp.send('Page.screencastFrameAck',{sessionId:e.sessionId});});
 try {
 await cdp.send('Page.startScreencast',{format:'jpeg',quality:85,maxWidth:1440,maxHeight:900,everyNthFrame:2});
 timer=setInterval(()=>{if(last&&!ff.stdin.destroyed){if(ff.stdin.writableLength>8*1024*1024){encoderError=Error('Video encoder backlog; recording rejected rather than silently dropping time');clearInterval(timer);}else ff.stdin.write(last);}},50);
 audio=await page.evaluate(()=>{
  const ctx=window.__gameAudioContext;if(!ctx?.__capture)return false;
  const r=window.__audioRecorder=new MediaRecorder(ctx.__capture.stream,{mimeType:'audio/webm;codecs=opus'});
  window.__audioChunks=[];r.ondataavailable=e=>window.__audioChunks.push(e.data);r.start();return true;
 });
 } catch(error) {clearInterval(timer);try{await cdp.send('Page.stopScreencast');}catch{}try{await cdp.detach();}catch{}ff.stdin.destroy();ff.kill();throw error;}
 return async()=>{
  clearInterval(timer);await cdp.send('Page.stopScreencast');await cdp.detach();
  ff.stdin.end();await done;if(encoderError)throw encoderError;
  if(audio){
   const bytes=await page.evaluate(()=>new Promise(resolve=>{const r=window.__audioRecorder;r.onstop=()=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.readAsDataURL(new Blob(window.__audioChunks));};r.stop();}));
   await fs.writeFile(`${path}-audio.webm`,Buffer.from(bytes,'base64'));
   const mux=spawn('ffmpeg',['-y','-loglevel','error','-i',`${path}-video.webm`,'-i',`${path}-audio.webm`,'-c','copy','-shortest',`${path}.webm`]);await new Promise((resolve,reject)=>{mux.once('error',reject);mux.once('exit',c=>c?reject(Error('mux failed')):resolve());});
  }else await fs.copyFile(`${path}-video.webm`,`${path}.webm`);
  return {audio, fps:20,source:'actual CDP composited browser + live WebAudio',path:`${path}.webm`};
 };
}
