import type {Dialogue,Beat} from '../game/dialogue';
import type {Settings} from '../state/game';
const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export interface PortraitFrame {id:string;x:number;y:number;width:number;height:number;}
export class DialogueView {
 private d?:Dialogue;private index=0;private timer=0;private blink=0;private reveal=0;private text='';private settings?:Settings;
 private frames:PortraitFrame[]=[];
 readonly element=document.createElement('section');
 constructor(private action:(action:string)=>void){
  this.element.id='dialogue';this.element.hidden=true;this.element.setAttribute('role','dialog');this.element.setAttribute('aria-modal','true');this.element.tabIndex=-1;
  document.querySelector('#ui')!.append(this.element);
  this.element.addEventListener('keydown',event=>{
   const buttons=[...this.element.querySelectorAll<HTMLButtonElement>('button')];if(!buttons.length)return;
   const index=buttons.indexOf(document.activeElement as HTMLButtonElement);
   if(event.key==='Tab' && ((event.shiftKey&&index===0)||(!event.shiftKey&&index===buttons.length-1))){event.preventDefault();buttons[event.shiftKey?buttons.length-1:0].focus();}
   if(['ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();buttons[(index+(event.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length].focus();}
  });
 }
 configure(frames:PortraitFrame[]){this.frames=frames;}
 show(d:Dialogue,settings:Settings){this.hide();this.d=d;this.settings=settings;this.index=0;this.element.hidden=false;this.render();}
 get beat(){return this.d?.beats[this.index];}
 next(){if(!this.d)return;if(this.reveal<this.text.length){this.reveal=this.text.length;this.drawText();return;}if(this.index<this.d.beats.length-1){this.index++;this.render();}}
 private portrait(beat:Beat,blink=0){
  const f=this.frames.find(f=>f.id===`portrait-${beat.speakerId}-${beat.expressionId}-${blink}`);return f?`<div class="portrait" role="img" aria-label="${escape(beat.speakerId)} · ${beat.expressionId}" style="width:${f.width}px;height:${f.height}px;background-image:url('${import.meta.env.BASE_URL}assets/atlas.png');background-position:-${f.x}px -${f.y}px"></div>`:'';
 }
 private render(){
  clearInterval(this.timer);clearInterval(this.blink);const d=this.d!,beat=d.beats[this.index];this.text=beat.text;this.reveal=this.settings?.instantText||this.settings?.reducedMotion?this.text.length:0;
  const name=beat.speakerId==='rowan'?'Rowan':d.speaker;
  this.element.innerHTML=`<div class="portrait-slot">${this.portrait(beat)}</div><div class="dialogue-strip"><h1 id="dialogue-name">${escape(name)}</h1><span class="dialogue-role">${escape(beat.speakerId==='rowan'?'YOUR FIRST BOAT':d.role)}</span><span class="sr-only" aria-live="polite">${escape(beat.text)}</span><p class="dialogue-text" aria-hidden="true"></p><div class="dialogue-actions"></div><small class="dialogue-progress">${this.index+1} / ${d.beats.length} · Esc to leave</small></div>`;
  this.element.setAttribute('aria-labelledby','dialogue-name');this.drawText();
  const start=performance.now();this.timer=window.setInterval(()=>{if(this.reveal<this.text.length){this.reveal=Math.min(this.text.length,Math.floor((performance.now()-start)*.034));this.drawText();}},30);
  if(!this.settings?.reducedMotion)this.blink=window.setInterval(()=>{const slot=this.element.querySelector('.portrait-slot');if(!slot)return;slot.innerHTML=this.portrait(beat,1);window.setTimeout(()=>{if(this.beat===beat)slot.innerHTML=this.portrait(beat);},130);},4200);
  this.element.querySelector<HTMLButtonElement>('button')?.focus();
 }
 private drawText(){
  this.element.querySelector('.dialogue-text')!.textContent=this.text.slice(0,this.reveal);
  const area=this.element.querySelector('.dialogue-actions')!,last=this.index===this.d!.beats.length-1&&this.reveal>=this.text.length;
  const html=last?this.d!.choices.map(c=>`<button data-action="${c.action}">${escape(c.label)}</button>`).join(''):`<button data-action="dialogue-next" aria-label="Continue dialogue">${this.reveal<this.text.length?'▸':'Continue ▾'}</button>`;
  if(area.innerHTML!==html){const was=area.contains(document.activeElement);area.innerHTML=html;if(was)area.querySelector<HTMLButtonElement>('button')?.focus();}
 }
 hide(){clearInterval(this.timer);clearInterval(this.blink);this.d=undefined;this.element.hidden=true;this.element.innerHTML='';}
}
