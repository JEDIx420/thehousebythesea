import {it,expect} from 'vitest';
import {cast,tickFishing,reel} from './fishing';
it('requires a visible bite window and exposes both catchable species',()=>{
 const first=cast(0),next=cast(1);expect(first.species).toBe('sardine');expect(next.species).toBe('bream');
 expect(tickFishing(first,first.biteAt-.01).phase).toBe('waiting');
 const bite=tickFishing(first,first.biteAt);expect(bite.phase).toBe('bite');expect(reel(bite).phase).toBe('caught');
 expect(tickFishing(first,first.biteAt+2.1).phase).toBe('bite');expect(tickFishing(first,first.biteAt+2.11).phase).toBe('missed');
});
it('supports painless early/late retry without carrying a prior bite into a fresh cast',()=>{
 expect(reel(cast(0)).phase).toBe('missed');const late=tickFishing(cast(0),20);expect(reel(late)).toBe(late);
 const retry=cast(1);expect(retry.phase).toBe('waiting');expect(retry.elapsed).toBe(0);
});
it('keeps terminal catches idempotent and rejects invalid elapsed time',()=>{
 const s=cast(0),caught=reel(tickFishing(s,s.biteAt));expect(reel(caught)).toBe(caught);expect(tickFishing(caught,100)).toBe(caught);
 expect(tickFishing(s,NaN)).toBe(s);expect(tickFishing(s,-1).elapsed).toBe(0);
});
