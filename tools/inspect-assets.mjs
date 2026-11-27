import fs from 'node:fs';
import path from 'node:path';
const root = new URL('../public/assets/models/', import.meta.url);
for (const name of fs.readdirSync(root).filter(n=>n.endsWith('.glb'))) {
 const b=fs.readFileSync(new URL(name,root));
 const j=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString());
 let triangles=0;const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(const m of j.meshes??[])for(const p of m.primitives){const a=j.accessors[p.attributes.POSITION];triangles+=(p.indices!==undefined?j.accessors[p.indices].count:a.count)/3;for(let i=0;i<3;i++){min[i]=Math.min(min[i],a.min?.[i]??0);max[i]=Math.max(max[i],a.max?.[i]??0);}}
 console.log(JSON.stringify({file:name,bytes:b.length,triangles,meshLocalBounds:{min,max},animations:j.animations?.length??0,skins:j.skins?.length??0,nodes:j.nodes?.length??0}));
}
