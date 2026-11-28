import Phaser from 'phaser';
import WORLD from '../assets/source/world.json';
import { project,unproject,contains,walkDirection,depth } from './world/projection';
import './style.css';

const ui=document.querySelector<HTMLDivElement>('#ui')!;
ui.innerHTML=`<header><div class="wordmark">The House <em>by the Sea</em></div><div class="place">HAVENPORT<small>A new beginning · late afternoon</small></div></header><div class="sample-caption"><span>COASTLINE STUDIES</span><h1>A little boat.<br>A whole new life.</h1></div><footer>WASD / arrows · walk & steer <span>E · board / step ashore</span><span>Scroll · zoom</span></footer><div id="message" role="status"></div>`;
const notice=(text:string)=>{document.querySelector('#message')!.textContent=text;};
function fit(){const scale=Math.max(1,Math.floor(Math.min(innerWidth/640,innerHeight/360)));document.documentElement.style.setProperty('--scale',String(scale));}
fit();window.addEventListener('resize',fit);
interface FrameMeta {id:string;width:number;height:number;anchor:number[]}
class CoastScene extends Phaser.Scene {
  private frames=new Map<string,FrameMeta>();
  private actors:Phaser.GameObjects.Image[]=[];
  private decorative:Phaser.GameObjects.Image[]=[];
  private keys=new Set<string>();
  private walking=true;
  private player={x:48,z:0};
  private boat={x:63,z:0,heading:0,speed:0};
  private rowan!:Phaser.GameObjects.Image;
  private mira!:Phaser.GameObjects.Image;
  private vessel!:Phaser.GameObjects.Image;
  private cameraGoal={x:152,y:12};
  private movementStarted=false;
  private lastFacing='s';
  private samples:number[]=[];
  private elapsed=0;
  private lastFrame=0;
  private stalls=0;
  private loadFailed=false;
  constructor(){super('coast');}
  preload(){const base=import.meta.env.BASE_URL;this.load.atlas('coast',`${base}assets/atlas.png`,`${base}assets/atlas.json`);this.load.json('manifest',`${base}assets/manifest.json`);this.load.on('loaderror',()=>{this.loadFailed=true;notice('The coastline could not load. Refresh to try again.');});}
  private art(id:string,x:number,z:number,layer?:number){const f=this.frames.get(id);if(!f)throw new Error(`Missing credited art ${id}`);const p=project(x,z);return this.add.image(Math.round(p.x),Math.round(p.y),'coast',id).setOrigin(f.anchor[0]/f.width,f.anchor[1]/f.height).setDepth(layer??depth(x,z));}
  create(){
    if(this.loadFailed||!this.textures.exists('coast'))return;
    const manifest=this.cache.json.get('manifest') as {frames:FrameMeta[]};manifest.frames.forEach(f=>this.frames.set(f.id,f));
    this.add.tileSprite(0,0,5000,5000,'coast','water').setDepth(-100000);
    this.art('sample-ground',0,0,-50000);
    for(let x=WORLD.sample.dock.minX;x<WORLD.sample.dock.maxX;x+=8)this.art('deck-0',x,0,-49999+x);
    for(const p of WORLD.sample.landmarks){const id=p.kind==='tree'?'tree-0':p.kind;const image=this.art(id,p.x,p.z);image.setData('world',p);if(p.kind==='tree')this.actors.push(image);}
    for(let i=0;i<4;i++){const x=53+Math.sin(i*1.7)*14,z=8+i*11;const image=this.art(`ripple-${i%16}`,x,z,-50001);image.setAlpha(.65).setData('phase',i);this.decorative.push(image);}
    this.vessel=this.art('boat-0-0',this.boat.x,this.boat.z);
    this.rowan=this.art('rowan-s-idle-0',this.player.x,this.player.z);
    this.mira=this.art('mira-s-idle-0',35,-12);
    const gull=this.art('gull-0',10,-20,10000).setData('gull',true);gull.y-=90;this.decorative.push(gull);
    this.input.keyboard!.on('keydown',(event:KeyboardEvent)=>{const key=event.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(key))event.preventDefault();if(!event.repeat&&key==='e')this.board();this.keys.add(key);});
    this.input.keyboard!.on('keyup',(event:KeyboardEvent)=>this.keys.delete(event.key.toLowerCase()));
    this.game.events.on(Phaser.Core.Events.BLUR,()=>this.keys.clear());
    this.input.on('wheel',(_p:unknown,_o:unknown,_x:number,dy:number)=>{this.cameras.main.setZoom(dy<0?2:1);});
    this.input.on('pointerdown',(pointer:Phaser.Input.Pointer)=>{const p=this.cameras.main.getWorldPoint(pointer.x,pointer.y);const logical=unproject(p.x,p.y);this.registry.set('lastPick',logical);});
    this.cameras.main.setRoundPixels(true).centerOn(152,12);
    const scene=this;
    Object.defineProperty(window,'voyage',{configurable:true,value:{getState:()=>({player:{...scene.player,mode:scene.walking?'walk':'boat'},boat:{...scene.boat}}),getMetrics:()=>({renderer:scene.game.renderer.type===Phaser.WEBGL?'WebGL':'Canvas',frames:scene.samples.length,sampleKind:"raw render callback interval",stallsOver50ms:scene.stalls,p50:scene.percentile(.5),p95:scene.percentile(.95),assets:scene.frames.size,viewport:[640,360],projection:project(10,5),lastPick:scene.registry.get('lastPick')})}});
  }
  private percentile(q:number){const a=[...this.samples].sort((a,b)=>a-b);return a.length?a[Math.min(a.length-1,Math.floor(a.length*q))]:0;}
  private walkable(x:number,z:number){const dock=WORLD.sample.dock;const land=contains(x,z,WORLD.sample.shore)||(x>=dock.minX&&x<=dock.maxX&&z>=dock.minZ&&z<=dock.maxZ);const shop=WORLD.sample.landmarks[0];return land&&!(x>shop.x-15&&x<shop.x&&z>shop.z-15&&z<shop.z);}
  private board(){if(this.walking&&Math.hypot(this.player.x-55,this.player.z)<7){this.walking=false;this.boat.heading=0;notice('Your boat. Your days are finally your own. W to sail; A / D to steer.');}else if(!this.walking&&Math.hypot(this.boat.x-63,this.boat.z)<11){this.walking=true;this.boat.speed=0;this.player={x:55,z:0};notice('Back on the pier.');}else notice(this.walking?'Follow the pier to your boat.':'Come alongside the Havenport pier to step ashore.');}
  update(_time:number,milliseconds:number){
    if(!this.rowan)return;const dt=Math.min(milliseconds/1000,.1);this.elapsed+=dt;const now=performance.now();if(this.lastFrame){const raw=now-this.lastFrame;this.samples.push(raw);if(raw>50)this.stalls++;if(this.samples.length>600)this.samples.shift();}this.lastFrame=now;
    const h=Number(this.keys.has('d')||this.keys.has('arrowright'))-Number(this.keys.has('a')||this.keys.has('arrowleft')),v=Number(this.keys.has('s')||this.keys.has('arrowdown'))-Number(this.keys.has('w')||this.keys.has('arrowup'));
    let moving=false;
    if(this.walking){const d=walkDirection(h,v),step=4.6*dt;const x=this.player.x+d.x*step,z=this.player.z+d.z*step;if(this.walkable(x,this.player.z))this.player.x=x;if(this.walkable(this.player.x,z))this.player.z=z;moving=Boolean(h||v);if(moving){this.movementStarted=true;this.lastFacing=Math.abs(h)>Math.abs(v)?(h>0?'e':'w'):(v>0?'s':'n');}}
    else {this.boat.heading+=h*dt*1.2;this.boat.speed=Phaser.Math.Linear(this.boat.speed,v<0?7:0,Math.min(1,dt*1.2));if(v>0)this.boat.speed=Math.max(0,this.boat.speed-dt*8);const x=this.boat.x+Math.sin(this.boat.heading)*this.boat.speed*dt,z=this.boat.z-Math.cos(this.boat.heading)*this.boat.speed*dt;if(!this.walkable(x,z)&&Math.abs(x)<180&&Math.abs(z)<180){this.boat.x=x;this.boat.z=z;}else this.boat.speed=0;this.player={x:this.boat.x,z:this.boat.z};moving=this.boat.speed>.2;this.movementStarted=true;}
    const time=this.elapsed,phase=Math.floor(time*8)%6,id=`rowan-${this.lastFacing}-${moving&&this.walking?'walk-'+phase:'idle-'+(Math.floor(time*2)%2)}`;this.rowan.setFrame(id);
    const p=project(this.player.x,this.player.z);this.rowan.setPosition(Math.round(p.x),Math.round(p.y-(this.walking?0:5))).setDepth(p.y+1);
    this.mira.setFrame(`mira-s-idle-${Math.floor(time*2)%2}`);
    const b=project(this.boat.x,this.boat.z),dir=((Math.round(this.boat.heading/(Math.PI/4))%8)+8)%8;this.vessel.setPosition(Math.round(b.x),Math.round(b.y)).setDepth(b.y).setFrame(`boat-${dir}-${Math.floor(time*2)%2}`);
    for(const tree of this.actors){tree.setFrame(`tree-${Math.floor(time)%2}`);const box=tree.getBounds();tree.setAlpha(box.contains(this.rowan.x,this.rowan.y-25)&&tree.depth>this.rowan.depth?.45:1);}
    for(const fx of this.decorative){if(fx.getData('gull'))fx.setFrame(`gull-${Math.floor(time*5)%4}`);else fx.setFrame(`ripple-${(Math.floor(time*8)+Number(fx.getData('phase')))%16}`);}
    if(this.movementStarted){this.cameraGoal.x=Phaser.Math.Linear(this.cameraGoal.x,p.x,Math.min(1,dt*3));this.cameraGoal.y=Phaser.Math.Linear(this.cameraGoal.y,p.y-25,Math.min(1,dt*3));this.cameras.main.centerOn(Math.round(this.cameraGoal.x),Math.round(this.cameraGoal.y));}
  }
}
const game=new Phaser.Game({type:Phaser.AUTO,parent:'game',width:640,height:360,pixelArt:true,roundPixels:true,backgroundColor:'#20596b',render:{antialias:false,roundPixels:true},audio:{noAudio:true},scene:CoastScene,fps:{target:60}});
window.addEventListener('pagehide',event=>{if(!event.persisted)game.destroy(true);});
