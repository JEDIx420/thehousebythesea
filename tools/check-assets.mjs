import fs from 'node:fs';
import assert from 'node:assert/strict';
import { PNG } from 'pngjs';
import { compile,contacts,ROOT } from './generate-assets.mjs';
const generated=compile(),prefix=`${ROOT}public/assets/`,png=fs.readFileSync(prefix+'atlas.png'),m=JSON.parse(fs.readFileSync(prefix+'manifest.json','utf8')),atlas=PNG.sync.read(png);
assert.ok(png.equals(generated.png),'Atlas differs from deterministic source; run npm run assets:build');
assert.deepEqual(JSON.parse(fs.readFileSync(prefix+'atlas.json','utf8')),generated.json);
assert.deepEqual(m,generated.manifest);
assert.equal(new Set(m.frames.map(f=>f.id)).size,m.frames.length,'Duplicate frame IDs');
const actorHashes=new Map();
for(const f of m.frames){
  assert.ok(f.license&&f.source,'Uncredited frame '+f.id);assert.ok(f.anchor[0]>=0&&f.anchor[0]<=f.width&&f.anchor[1]>=0&&f.anchor[1]<=f.height,'Invalid anchor '+f.id);
  assert.ok(f.x>=2&&f.y>=2&&f.x+f.width+2<=atlas.width&&f.y+f.height+2<=atlas.height,'Atlas overflow '+f.id);
  let opaque=0,hash=0;
  for(let y=-2;y<f.height+2;y++)for(let x=-2;x<f.width+2;x++){
    const i=((f.y+y)*atlas.width+f.x+x)*4,a=atlas.data[i+3];
    if(x<0||y<0||x>=f.width||y>=f.height)assert.equal(a,0,'Padding/halo '+f.id);
    else {assert.ok([0,72,255].includes(a),'Unapproved alpha/antialias '+f.id);if(a){opaque++;hash=(Math.imul(hash,31)+atlas.data[i]+atlas.data[i+1]*3+atlas.data[i+2]*7+x+y*17)|0;}}
  }
  assert.ok(opaque>2,'Transparent/empty frame '+f.id);
  if(f.category==='character'){
    assert.deepEqual([f.width,f.height,...f.anchor],[48,72,24,64],'Character dimensions/anchor drift');
    const key=`${f.actor}-${f.direction}-${f.animation}`;const hashes=actorHashes.get(key)??new Set();hashes.add(hash);actorHashes.set(key,hashes);
    for(let y=10;y<64;y++){let ink=0;for(let x=8;x<40;x++)if(atlas.data[((f.y+y)*atlas.width+f.x+x)*4+3]===255)ink++;assert.ok(ink>0,'Detached head/torso/legs row '+y+' in '+f.id);}
  }
}
for(const [key,hashes] of actorHashes)assert.ok(hashes.size>1,'Static fake animation '+key);
for(const name of ['rowan','mira','ellis','nessa'])for(const d of ['s','w','n','e'])assert.ok(m.frames.some(f=>f.actor===name&&f.direction===d&&f.animation==='walk'));
const contact=contacts(generated.frames),layout=JSON.parse(fs.readFileSync(`${ROOT}assets/source/contact-layout.json`,'utf8'));assert.deepEqual(layout,contact.layout);
for(const f of layout)assert.ok(f.x>=0&&f.y>=0&&f.x+f.width<=800&&f.y+f.height+9<=600,'Cropped contact asset '+f.id);
for(const id of ['rowan-s-idle-0','mira-s-idle-0','boat-0-0','shop','tree-0','rock','deck-0','ripple-4'])assert.ok(layout.some(f=>f.id===id),'Missing audition asset '+id);
for(let i=0;i<contact.pages.length;i++)assert.ok(fs.readFileSync(`${ROOT}assets/source/contact-sheet${i?'-'+(i+1):''}.png`).equals(contact.pages[i].png()),'Contact sheet out of date');
assert.equal(m.attributions.length,2);console.log(`PASS: ${m.frames.length} frames; bounds, alpha, four facings, shared anchors, distinct animations, sources and exact-byte reproducibility.`);
