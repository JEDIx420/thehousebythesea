import {
  initialState,
  reduce,
  type Action,
  type GameState,
  type PlayerCheckpoint,
  type BoatCheckpoint,
} from "../state/game";
import { loadGame, loadLegacy, saveGame } from "../state/persistence";
export class Session {
  state: GameState = initialState();
  existing = false;
  protectedSave = false;
  warning: string | null = null;
  saving = false;
  savedAt = 0;
  started = false;
  onChange: () => void = () => {};
  private dirty = false;
  private revision = 0;
  private lastAttempt = 0;
  private requested = false;
  private inFlight?: Promise<boolean>;
  async load() {
    const result = await loadGame();
    this.state = result.state ?? initialState();
    this.existing = Boolean(result.state);
    this.protectedSave = result.protected;
    this.warning = result.warning;
  }
  dispatch(action: Action) {
    const next = reduce(this.state, action);
    if (next !== this.state) {
      this.state = next;
      this.dirty = true;
      this.revision++;
      this.onChange();
      if (this.started) void this.save();
    }
  }
  checkpoint(player: PlayerCheckpoint, boat: BoatCheckpoint) {
    if (
      JSON.stringify(this.state.player) === JSON.stringify(player) &&
      JSON.stringify(this.state.boat) === JSON.stringify(boat)
    )
      return;
    this.state = { ...this.state, player: { ...player }, boat: { ...boat } };
    this.dirty = true;
    this.revision++;
  }
  async importOriginal() {
    if (this.existing || this.protectedSave)
      throw new Error(
        "An existing pixel voyage is protected. It will not be replaced by an import.",
      );
    const copy = await loadLegacy();
    this.state = copy;
    this.existing = true;
    this.dirty = true;
    this.revision++;
    this.onChange();
    return this.save();
  }
  save(): Promise<boolean> {
    if (this.protectedSave) {
      this.warning ??=
        "Your original saved data is protected. This temporary voyage will not overwrite it.";
      this.onChange();
      return Promise.resolve(false);
    }
    this.requested = true;
    if (this.inFlight) return this.inFlight;
    this.saving = true;
    this.onChange();
    this.inFlight = (async () => {
      try {
        while (this.requested) {
          this.requested = false;
          this.lastAttempt = Date.now();
          const version = this.revision;
          await saveGame(this.state);
          if (this.revision === version) this.dirty = false;
          this.savedAt = Date.now();
          this.warning = null;
          this.existing = true;
        }
        return true;
      } catch (e) {
        this.requested = false;
        this.warning =
          e instanceof Error
            ? e.message
            : "Saving failed. Keep this tab open and retry.";
        return false;
      } finally {
        this.saving = false;
        this.inFlight = undefined;
        this.onChange();
      }
    })();
    return this.inFlight;
  }
  autosave() {
    if (
      this.started &&
      this.dirty &&
      !this.protectedSave &&
      !this.inFlight &&
      Date.now() - this.lastAttempt > 10000
    )
      void this.save();
  }
  snapshot() {
    return structuredClone(this.state);
  }
}
