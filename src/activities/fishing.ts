import type {FishId} from '../state/game';
export type FishingState={phase:'waiting'|'bite'|'missed'|'caught';elapsed:number;biteAt:number;species:FishId};
/** Session time is ephemeral: cancel/reload never grants a fish. */
export function cast(castNumber:number):FishingState{return {phase:'waiting',elapsed:0,biteAt:3.8+(castNumber%3)*.7,species:castNumber%2?'bream':'sardine'};}
export function tickFishing(state:FishingState,dt:number):FishingState{if(state.phase==='caught'||state.phase==='missed'||!Number.isFinite(dt))return state;const elapsed=state.elapsed+Math.max(0,dt);return {...state,elapsed,phase:elapsed>state.biteAt+2.1?'missed':elapsed>=state.biteAt?'bite':'waiting'};}
export function reel(state:FishingState):FishingState{return state.phase==='caught'||state.phase==='missed'?state:{...state,phase:state.phase==='bite'?'caught':'missed'};}
