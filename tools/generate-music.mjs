// Original deterministic score/instruments. No MIDI packs, samples or remote APIs.
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {spawnSync} from 'node:child_process';import crypto from 'node:crypto';
import score from '../assets/source/music-score.json' with {type:'json'};
const sr=score.sampleRate,beat=60/score.bpm,duration=score.bars*4*beat,N=Math.round(sr*duration);
const target=new URL('../public/audio/',import.meta.url);fs.mkdirSync(target,{recursive:true});
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'voyage-score-'));
function rng(seed){return()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;};}
const manifest={title:score.title,author:score.author,license:score.license,source:'assets/source/music-score.json + tools/generate-music.mjs',bpm:score.bpm,bars:score.bars,tracks:[]};
for(const name of (process.argv.includes('--all')?Object.keys(score.tracks):['havenport'])){
 const cfg=score.tracks[name],out=[new Float32Array(N),new Float32Array(N)],random=rng(score.seed+name.length);
 function note(midi,start,length,instrument,volume,pan=0){
  const f=440*2**((midi+cfg.transpose-69)/12),seconds=length*beat,tail=instrument==='pad'?1.8:instrument==='flute'?.18:2.2,count=Math.ceil((seconds+tail)*sr),offset=Math.round(start*beat*sr);
  let noise=0;const period=Math.round(sr/f),string=new Float64Array(period);
  for(let j=0;j<period;j++)string[j]=(random()*2-1)*.7;
  const l=Math.sqrt((1-pan)*.5),r=Math.sqrt((1+pan)*.5);
  for(let j=0;j<count;j++){
   const t=j/sr,phase=2*Math.PI*f*t,attack=Math.min(1,t/(instrument==='pad'?.7:.025));let v=0;
   if(instrument==='pluck'){const k=j%period;v=string[k];string[k]=.497*(string[k]+string[(k+1)%period]);v*=Math.exp(-t/2.1);}
   if(instrument==='piano')v=(Math.sin(phase)*Math.exp(-t/1.8)+.35*Math.sin(phase*2.003)*Math.exp(-t/.7)+.12*Math.sin(phase*3.01)*Math.exp(-t/.35))*.38;
   if(instrument==='bass')v=(Math.sin(phase)+.16*Math.sin(phase*2))*.45*Math.exp(-t/1.8);
   if(instrument==='flute'){noise=noise*.82+(random()*2-1)*.18;const vibrato=phase+.035*Math.sin(t*2*Math.PI*4.7)*Math.min(1,t*3);v=(Math.sin(vibrato)+.12*Math.sin(vibrato*2)+.025*Math.sin(vibrato*3)+.035*noise)*.38;}
   if(instrument==='pad')v=(Math.sin(phase)+.25*Math.sin(phase*2+.6*Math.sin(t*1.2))+.12*Math.sin(phase*3))*.22;
   const release=instrument==='flute'||instrument==='pad'?Math.max(0,Math.min(1,(seconds+tail-t)/tail)):1;
   v*=attack*release*volume;
   const at=(offset+j)%N;out[0][at]+=v*l;out[1][at]+=v*r;
  }
 }
 for(let bar=0;bar<score.bars;bar++){
  const section=Math.floor(bar/8),chord=score.harmony[(bar+(section===2?4:0))%8],time=bar*4;
  chord.forEach((n,i)=>note(n+12,time,4,'pad',cfg.pad,i/4-.4));
  for(let k=0;k<8;k++){const n=chord[[0,2,1,3,2,1,3,2][k]]+12;note(n,time+k*.5,.35,'pluck',cfg.pluck*(k%2?.65:1),-.38);}
  note(chord[0]-12,time,1.5,'bass',.18,.05);if(bar%2===0)note(chord[0]-12,time+2,1,'bass',.1,.05);
  if(bar%2===1)chord.forEach((n,i)=>note(n+12,time+.04*i,2.3,'piano',cfg.piano,.35));
  // AABA: every 8 bars changes register, density, response and cadence.
  if(bar%2===0){const phrase=bar%8===6?score.cadence:section===2?score.bridge:bar%4===0?score.motif:score.reply;
   for(const [n,at,len]of phrase)note(n+(section===3&&bar%8<4?12:0),time+at,len,'flute',cfg.flute,.15);}
  if(cfg.percussion)for(let k=0;k<4;k++)for(let j=0;j<1000;j++){const at=(Math.round((time+k)*beat*sr)+j)%N,v=(random()*2-1)*Math.exp(-j/140)*cfg.percussion;out[0][at]+=v*.7;out[1][at]+=v*.5;}
 }
 // Circular, dark room echoes preserve the musical tail over the loop seam.
 for(const channel of out){const dry=new Float32Array(channel);for(const [delay,gain]of [[.137,.13],[.233,.09],[.389,.055]]){const d=Math.round(delay*sr);for(let i=0;i<N;i++)channel[i]+=dry[(i-d+N)%N]*gain;}}
 let peak=0;for(let i=0;i<N;i++)peak=Math.max(peak,Math.abs(out[0][i]),Math.abs(out[1][i]));const scale=.72/Math.max(.8,peak);
 const wav=Buffer.alloc(44+N*4);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(2,22);wav.writeUInt32LE(sr,24);wav.writeUInt32LE(sr*4,28);wav.writeUInt16LE(4,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(N*4,40);
 for(let i=0;i<N;i++)for(let ch=0;ch<2;ch++){// 3ms de-click; sustained circular tail makes the seam unobtrusive.
  const edge=Math.min(1,i/(sr*.003),(N-1-i)/(sr*.003));wav.writeInt16LE(Math.round(Math.tanh(out[ch][i]*scale)*edge*30000),44+i*4+ch*2);}
 const input=path.join(temp,`${name}.wav`),file=new URL(`${name}.mp3`,target);fs.writeFileSync(input,wav);
 const run=spawnSync('ffmpeg',['-y','-loglevel','error','-i',input,'-c:a','libmp3lame','-b:a','64k','-write_xing','1','-map_metadata','-1',file.pathname],{encoding:'utf8'});if(run.status)throw Error(run.stderr);
 const bytes=fs.readFileSync(file);manifest.tracks.push({id:name,file:`audio/${name}.mp3`,duration,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),loop:'32 bars, original circular room tail, 3ms de-click',license:'MIT'});
 console.log(`${name}: ${duration}s, ${bytes.length} bytes`);
}
fs.writeFileSync(new URL('manifest.json',target),JSON.stringify(manifest,null,2)+'\n');fs.rmSync(temp,{recursive:true});
