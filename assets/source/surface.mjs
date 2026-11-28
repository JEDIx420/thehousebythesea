// Single elevation authority used by terrain baking AND runtime collision.
export function inside(x,z,polygon){let hit=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const[a,b]=polygon[i],[c,d]=polygon[j];if((b>z)!==(d>z)&&x<(c-a)*(z-b)/(d-b)+a)hit=!hit;}return hit;}
export function heightAtLocal(map,x,z){
 for(const r of map.ramps??[]){const[a,b,c,d]=r.rect;if(x>=a&&x<=c&&z>=b&&z<=d){const v=r.axis==='x'?(x-a)/(c-a):(z-b)/(d-b);return r.from+(r.to-r.from)*v;}}
 let h=0;for(const level of map.levels??[])if(inside(x,z,level.polygon))h=Math.max(h,level.height);return h;
}
export function traversable(map,from,to,radius=.7){const a=heightAtLocal(map,from.x,from.z),b=heightAtLocal(map,to.x,to.z);if(Math.abs(a-b)>1.8)return false;
 for(let i=0;i<8;i++){const angle=i*Math.PI/4;if(Math.abs(heightAtLocal(map,to.x+Math.cos(angle)*radius,to.z+Math.sin(angle)*radius)-b)>1.8)return false;}return true;}
