import { initialState,reduce,type GameState } from './game';
export const STORAGE={database:'thehousebythesea-pixel',store:'snapshots',slot:'first-voyage'} as const;
export class SaveError extends Error {override name='SaveError';}
const record=(v:unknown):v is Record<string,unknown>=>typeof v==='object'&&v!==null&&!Array.isArray(v);
const island=(v:unknown)=>v==='havenport'||v==='saltglass-bay';
const count=(v:unknown)=>typeof v==='number'&&Number.isSafeInteger(v)&&v>=0&&v<=1_000_000_000;
const coordinate=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)&&Math.abs(v)<=10000;
function decode(raw:unknown):Record<string,unknown>{let v:unknown;try{v=typeof raw==='string'?JSON.parse(raw):raw;}catch{throw new SaveError('This saved voyage cannot be read. The original has been kept.');}if(!record(v))throw new SaveError('This saved voyage is not a valid snapshot. The original has been kept.');return v;}
function validate(v:Record<string,unknown>,legacy:boolean):GameState{
  const {inventory,story,player,boat,settings,discoveries}=v;
  const valid=count(v.wallet)&&record(inventory)&&count(inventory.sardine)&&count(inventory.bream)
    &&(v.delivery==='available'||v.delivery==='active'||v.delivery==='complete')
    &&Array.isArray(discoveries)&&discoveries.length>0&&discoveries.length<=2&&discoveries.every(island)&&new Set(discoveries).size===discoveries.length
    &&record(story)&&Object.keys(initialState().story).every(k=>typeof story[k]==='boolean')
    &&record(player)&&coordinate(player.x)&&coordinate(player.z)&&coordinate(player.heading)&&island(player.island)&&(player.mode==='walk'||player.mode==='boat')
    &&record(boat)&&coordinate(boat.x)&&coordinate(boat.z)&&coordinate(boat.heading)&&(boat.docked===null||island(boat.docked))
    &&record(settings)&&typeof settings.muted==='boolean'&&typeof settings.volume==='number'&&Number.isFinite(settings.volume)&&settings.volume>=0&&settings.volume<=1
    &&(legacy||typeof settings.reducedMotion==='boolean');
  if(!valid)throw new SaveError('This save contains invalid progress. The original has been kept.');
  const snapshot=JSON.parse(JSON.stringify(v)) as GameState;
  snapshot.schemaVersion=2;snapshot.worldVersion='pixel-first-voyage-v1';
  snapshot.settings.reducedMotion=legacy?false:snapshot.settings.reducedMotion;
  return snapshot;
}
export function parseSave(raw:unknown):GameState{
  const v=decode(raw);if(v.schemaVersion!==2||v.worldVersion!=='pixel-first-voyage-v1')throw new SaveError('This save version is unsupported. Your original voyage has been kept.');
  return validate(v,false);
}
/** Explicit COPY import. Economy/story survive; old 3D coordinates never become pixel positions. */
export function migrateLegacy(raw:unknown):GameState{
  let v=decode(raw);if(v.schemaVersion!==0&&v.schemaVersion!==1)throw new SaveError('Only an original First Voyage schema0/1 snapshot can be imported.');
  if(v.schemaVersion===0)v={...v,settings:{muted:false,volume:.35}};
  return reduce(validate(v,true),{type:'RECOVER'});
}
function openDatabase(name:string=STORAGE.database,create=true):Promise<IDBDatabase>{
  return new Promise((resolve,reject)=>{
    if(typeof indexedDB==='undefined'){reject(new SaveError('Saving is unavailable in this browser. Keep this tab open to retain the voyage.'));return;}
    let settled=false;const finish=(error:Error)=>{if(settled)return;settled=true;clearTimeout(timer);reject(error);};
    const timer=setTimeout(()=>finish(new SaveError('Storage did not respond. Your save has not been overwritten.')),5000);
    let request:IDBOpenDBRequest;
    try{request=indexedDB.open(name,1);}catch{finish(new SaveError('Saving is unavailable. This voyage will stay in this tab.'));return;}
    request.onupgradeneeded=()=>{if(settled||!create){request.transaction?.abort();return;}request.result.createObjectStore(STORAGE.store);};
    request.onblocked=()=>finish(new SaveError('Another game tab is blocking storage. Close it and retry.'));
    request.onerror=()=>finish(new SaveError(create?'Browser storage could not be opened. Your save is kept.':'No original First Voyage save was found.'));
    request.onsuccess=()=>{clearTimeout(timer);if(settled){request.result.close();return;}settled=true;const db=request.result;db.onversionchange=()=>db.close();resolve(db);};
  });
}
async function read(db:IDBDatabase):Promise<unknown>{return new Promise((resolve,reject)=>{
  if(!db.objectStoreNames.contains(STORAGE.store)){reject(new SaveError('No compatible voyage snapshot was found.'));return;}
  const transaction=db.transaction(STORAGE.store,'readonly'),request=transaction.objectStore(STORAGE.store).get(STORAGE.slot);let value:unknown,settled=false;
  const finish=(error?:Error)=>{if(settled)return;settled=true;clearTimeout(timer);if(error)reject(error);else resolve(value);};
  const timer=setTimeout(()=>{try{transaction.abort();}catch{}finish(new SaveError('Loading did not finish. Your saved voyage has been kept.'));},5000);
  request.onsuccess=()=>{value=request.result;};transaction.oncomplete=()=>finish();transaction.onabort=()=>finish(new SaveError('Loading was interrupted. Your save is kept.'));transaction.onerror=()=>finish(new SaveError('The saved voyage could not be loaded.'));
});}
export async function loadGame():Promise<{state:GameState|null;warning:string|null;protected:boolean}>{
  let db:IDBDatabase|undefined;try{db=await openDatabase();const raw=await read(db);return {state:raw===undefined?null:parseSave(raw),warning:null,protected:false};}
  catch(e){return {state:null,warning:e instanceof Error?e.message:'Saving is unavailable. Your save is kept.',protected:true};}finally{db?.close();}
}
export async function loadLegacy():Promise<GameState>{let db:IDBDatabase|undefined;try{db=await openDatabase('thehousebythesea',false);const raw=await read(db);if(raw===undefined)throw new SaveError('No original First Voyage save was found.');return migrateLegacy(raw);}finally{db?.close();}}
export async function saveGame(state:GameState):Promise<void>{
  const snapshot=parseSave(state),db=await openDatabase();
  try{await new Promise<void>((resolve,reject)=>{const transaction=db.transaction(STORAGE.store,'readwrite');let settled=false;
    const finish=(error?:Error)=>{if(settled)return;settled=true;clearTimeout(timer);if(error)reject(error);else resolve();};
    const timer=setTimeout(()=>{try{transaction.abort();}catch{}finish(new SaveError('Saving did not finish. Keep this tab open and retry.'));},5000);
    transaction.objectStore(STORAGE.store).put(snapshot,STORAGE.slot);transaction.oncomplete=()=>finish();transaction.onabort=transaction.onerror=()=>finish(new SaveError('Progress could not be saved. Storage may be full or disabled. Please retry before closing.'));});}finally{db.close();}
}
