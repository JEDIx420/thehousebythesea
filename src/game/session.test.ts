import {it,expect,vi,beforeEach} from 'vitest';
import {Session} from './session';
import {initialState} from '../state/game';
import {loadGame,loadLegacy,saveGame} from '../state/persistence';
vi.mock('../state/persistence',()=>({loadGame:vi.fn(),loadLegacy:vi.fn(),saveGame:vi.fn()}));
beforeEach(()=>{vi.resetAllMocks();vi.restoreAllMocks();vi.mocked(loadGame).mockResolvedValue({state:null,warning:null,protected:false});vi.mocked(saveGame).mockResolvedValue();});
it('never writes over a protected unsupported snapshot, including explicit save and story events',async()=>{
 vi.mocked(loadGame).mockResolvedValue({state:null,warning:'Unsupported original kept',protected:true});
 const session=new Session();await session.load();session.started=true;session.dispatch({type:'MEET_MIRA'});session.autosave();expect(await session.save()).toBe(false);expect(saveGame).not.toHaveBeenCalled();
 expect(session.state.story.metMira).toBe(true);await expect(session.importOriginal()).rejects.toThrow('protected');expect(loadLegacy).not.toHaveBeenCalled();
});
it('serializes writes and coalesces a later story update into the next complete snapshot',async()=>{
 let release!:()=>void;vi.mocked(saveGame).mockImplementationOnce(()=>new Promise<void>(resolve=>{release=resolve;}));
 const session=new Session();await session.load();session.started=true;session.dispatch({type:'ACCEPT_DELIVERY'});session.dispatch({type:'MEET_MIRA'});const saved=session.save();
 expect(saveGame).toHaveBeenCalledTimes(1);expect(vi.mocked(saveGame).mock.calls[0][0].story.metMira).toBe(false);release();expect(await saved).toBe(true);
 expect(saveGame).toHaveBeenCalledTimes(2);expect(vi.mocked(saveGame).mock.calls[1][0].delivery).toBe('active');expect(vi.mocked(saveGame).mock.calls[1][0].story.metMira).toBe(true);expect(session.warning).toBe(null);
});
it('reports imported progress as temporary when the pixel transaction cannot commit',async()=>{
 const copy=initialState();copy.wallet=195;copy.delivery='complete';vi.mocked(loadLegacy).mockResolvedValue(copy);vi.mocked(saveGame).mockRejectedValue(new Error('quota denied'));
 const session=new Session();await session.load();expect(await session.importOriginal()).toBe(false);expect(session.state.wallet).toBe(195);expect(session.warning).toContain('quota');expect(session.savedAt).toBe(0);
});
it('throttles failed autosave attempts without discarding dirty progress',async()=>{
 let now=15000;vi.spyOn(Date,'now').mockImplementation(()=>now);vi.mocked(saveGame).mockRejectedValue(new Error('storage unavailable'));
 const session=new Session();await session.load();session.dispatch({type:'MEET_MIRA'});session.started=true;session.autosave();await Promise.resolve();await Promise.resolve();
 for(let i=0;i<100;i++)session.autosave();expect(saveGame).toHaveBeenCalledTimes(1);now+=9000;session.autosave();expect(saveGame).toHaveBeenCalledTimes(1);now+=2000;session.autosave();expect(saveGame).toHaveBeenCalledTimes(2);
});
