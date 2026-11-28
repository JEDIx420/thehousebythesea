import walkFixture from "../../tests/fixtures/pixel-v1-walk.json" with { type: "json" };
import seaFixture from "../../tests/fixtures/pixel-v1-midsea.json" with { type: "json" };
import saltFixture from "../../tests/fixtures/pixel-v1-saltglass.json" with { type: "json" };
import completeFixture from "../../tests/fixtures/pixel-v1-complete.json" with { type: "json" };
import type { GameState } from "./game";
import { expect, test } from "vitest";
import { parseSave } from "./persistence";
import { initialState } from "./game";
import { navigation } from "../data/navigation";
const old = () => {
  const s = structuredClone(walkFixture) as GameState;
  s.wallet = 195;
  s.delivery = "complete";
  s.inventory.bream = 2;
  s.story.outingInvited = true;
  return s;
};
for (const [name, fixture] of Object.entries({
  walkFixture,
  seaFixture,
  saltFixture,
  completeFixture,
}))
  test(`actual captured v1 ${name} preserves all progress and adds mixer defaults`, () => {
    const m = parseSave(fixture);
    expect(m.wallet).toBe(fixture.wallet);
    expect(m.inventory).toEqual(fixture.inventory);
    expect(m.delivery).toBe(fixture.delivery);
    expect(m.discoveries).toEqual(fixture.discoveries);
    expect(m.story).toEqual(fixture.story);
  });
test("corrupt non-scalar version stays protected", () => {
  for (const worldVersion of [
    ["pixel-first-voyage-v2"],
    ["pixel-first-voyage-v1"],
    null,
    {},
  ])
    expect(() => parseSave({ ...old(), worldVersion })).toThrow();
});
test("docked tags always remap to canonical berths on either island", () => {
  for (const island of ["havenport", "saltglass-bay"] as const) {
    const s = old();
    s.player.island = island;
    Object.assign(s.player, navigation(island).safe);
    s.boat = { x: 95, z: -110, heading: 1, docked: island };
    expect(parseSave(s).boat).toEqual(navigation(island).dock);
  }
});

test("migrates a real historical v1 walking checkpoint without reward/reset or mutating source", () => {
  const s = old(),
    raw = JSON.stringify(s),
    m = parseSave(raw);
  expect(m.worldVersion).toBe("pixel-first-voyage-v2");
  expect(m.wallet).toBe(195);
  expect(m.inventory.bream).toBe(2);
  expect(m.player).toEqual(s.player);
  expect(JSON.stringify(s)).toBe(raw);
  expect(m.settings.music).toBe(0.7);
});
test("valid midsea checkpoint and passenger progress survive", () => {
  const s = old();
  s.player.mode = "boat";
  s.boat = { x: 95, z: -110, heading: 0.3, docked: null };
  Object.assign(s.player, s.boat);
  const m = parseSave(s);
  expect(m.boat).toEqual(s.boat);
  expect(m.player.x).toBe(95);
  expect(m.story.outingInvited).toBe(true);
});
test("invalid walking coordinates and hull repair to coherent safe dock", () => {
  const s = old();
  s.player.x = 999;
  s.boat.x = 999;
  const m = parseSave(s);
  expect(m.player.x).toBe(navigation("havenport").safe.x);
  expect(m.boat).toEqual(navigation("havenport").dock);
  expect(m.wallet).toBe(195);
});
test("old master zero stays zero and current malformed mixer or future saves are protected", () => {
  const s = old();
  s.settings.volume = 0;
  expect(parseSave(s).settings.volume).toBe(0);
  const current = initialState();
  current.settings.music = NaN;
  expect(() => parseSave(current)).toThrow();
  expect(() => parseSave({ ...s, worldVersion: "future" })).toThrow();
});

test("preserves valid Saltglass local walking location when its island moves", () => {
  const m = parseSave(saltFixture);
  expect(m.player.x).toBe(saltFixture.player.x);
  expect(m.player.z).toBe(saltFixture.player.z - 120);
});
