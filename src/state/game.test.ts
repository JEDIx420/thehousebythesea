import { describe, expect, it } from "vitest";
import { homeFund, initialState, reduce, type GameState } from "./game";
import { loadGame, parseSave, saveGame, SaveError } from "./persistence";

function atSaltglass(state: GameState): GameState {
  return reduce(state, {
    type: "CHECKPOINT",
    player: {
      x: 48,
      z: -220,
      heading: 0,
      mode: "walk",
      island: "saltglass-bay",
    },
    boat: { x: 62, z: -220, heading: 0, docked: "saltglass-bay" },
  });
}

it("rejects a coerced array delivery flag while preserving valid snapshots", () => {
  expect(() => parseSave({ ...initialState(), delivery: ["active"] })).toThrow(
    SaveError,
  );
  expect(parseSave({ ...initialState(), delivery: "active" }).delivery).toBe(
    "active",
  );
});
describe("the First Voyage domain", () => {
  it("pays a parcel only once, including after restoring the save", () => {
    let state = reduce(initialState(), { type: "ACCEPT_DELIVERY" });
    expect(reduce(state, { type: "DELIVER_PARCEL" }).wallet).toBe(25);
    state = atSaltglass(state);
    state = reduce(state, { type: "DELIVER_PARCEL" });
    expect(state.wallet).toBe(145);
    state = parseSave(JSON.stringify(state));
    expect(
      reduce(reduce(state, { type: "ACCEPT_DELIVERY" }), {
        type: "DELIVER_PARCEL",
      }).wallet,
    ).toBe(145);
  });

  it("requires being ashore before handing over the parcel", () => {
    const state = atSaltglass(
      reduce(initialState(), { type: "ACCEPT_DELIVERY" }),
    );
    state.player.mode = "boat";
    expect(reduce(state, { type: "DELIVER_PARCEL" }).delivery).toBe("active");
  });

  it("accounts for both fish species, clears inventory atomically and cannot resell", () => {
    let state = reduce(initialState(), { type: "CATCH_FISH", fish: "sardine" });
    state = reduce(state, { type: "CATCH_FISH", fish: "bream" });
    expect(state.inventory).toEqual({ sardine: 1, bream: 1 });
    state = reduce(state, { type: "SELL_FISH" });
    expect(state.wallet).toBe(75);
    expect(state.inventory).toEqual({ sardine: 0, bream: 0 });
    expect(reduce(state, { type: "SELL_FISH" })).toBe(state);
  });

  it("records an outing only after an accepted invitation, travel, and return", () => {
    let state = initialState();
    expect(reduce(state, { type: "INVITE_MIRA" }).story.outingInvited).toBe(
      false,
    );
    state = reduce(state, { type: "MEET_MIRA" });
    state = reduce(state, { type: "VISIT_ISLAND", island: "saltglass-bay" });
    state = reduce(state, { type: "INVITE_MIRA" });
    expect(
      reduce(state, { type: "COMPLETE_OUTING" }).story.outingComplete,
    ).toBe(false);
    state = atSaltglass(state);
    state = reduce(state, { type: "VISIT_ISLAND", island: "saltglass-bay" });
    expect(
      reduce(state, { type: "COMPLETE_OUTING" }).story.outingComplete,
    ).toBe(false);
    state = reduce(state, {
      type: "CHECKPOINT",
      player: initialState().player,
      boat: initialState().boat,
    });
    state = reduce(state, { type: "COMPLETE_OUTING" });
    expect(state.story.outingComplete).toBe(true);
    expect(state.wallet).toBe(25);
    expect(state.discoveries).toEqual(["havenport", "saltglass-bay"]);
  });

  it("recovers boat and player together without altering progress", () => {
    const state = atSaltglass(
      reduce(initialState(), { type: "ACCEPT_DELIVERY" }),
    );
    state.player.x = 999;
    state.boat.z = -999;
    const safe = reduce(state, { type: "RECOVER" });
    expect(safe.player.x).toBe(48);
    expect(safe.player.z).toBe(-220);
    expect(safe.boat).toEqual({
      x: 62,
      z: -220,
      heading: 0,
      docked: "saltglass-bay",
    });
    expect(safe.delivery).toBe("active");
  });

  it("reports saved coins and an attainable early milestone without a separate spendable pool", () => {
    const state = initialState();
    state.wallet = 180;
    expect(homeFund(state)).toEqual({
      saved: 180,
      target: 500,
      fraction: 0.36,
      milestone: true,
    });
  });
});

describe("versioned snapshots", () => {
  it("round-trips every persisted field without sharing object references", () => {
    const state = atSaltglass(initialState());
    state.inventory.bream = 2;
    state.story.metMira = true;
    const restored = parseSave(state);
    expect(restored).toEqual(state);
    restored.player.x = 1;
    expect(state.player.x).toBe(48);
  });

  it("migrates the explicit v0 foundation fixture", () => {
    const { settings: _settings, ...state } = initialState();
    const restored = parseSave({ ...state, schemaVersion: 0 });
    expect(restored.schemaVersion).toBe(1);
    expect(restored.settings).toEqual(initialState().settings);
  });

  it.each([
    "{broken",
    null,
    {},
    { ...initialState(), schemaVersion: 99 },
    { ...initialState(), wallet: -1 },
    { ...initialState(), wallet: Infinity },
    { ...initialState(), inventory: { sardine: 1.5, bream: 0 } },
    { ...initialState(), player: { ...initialState().player, z: NaN } },
    { ...initialState(), boat: { ...initialState().boat, docked: "unknown" } },
    { ...initialState(), discoveries: ["havenport", "havenport"] },
    { ...initialState(), story: {} },
    { ...initialState(), settings: { muted: false, volume: 2 } },
  ])("rejects malformed or unsupported data: %j", (raw) => {
    expect(() => parseSave(raw)).toThrow(SaveError);
  });

  it("warns when browser storage is unavailable rather than pretending to save", async () => {
    expect((await loadGame()).warning).toContain("Saving is unavailable");
    await expect(saveGame(initialState())).rejects.toThrow(
      "Saving is unavailable",
    );
  });
});
