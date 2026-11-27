import { describe, expect, it } from "vitest";
import { initialState } from "../state/game";
import { stopBoat, updateMovement } from "./movement";

describe("physical movement constraints", () => {
  it("walks north, turns east, and rejects water instead of dropping off the surface", () => {
    const s = initialState();
    s.player.x = 0;
    s.player.z = 0;
    const world = {
      groundHeight: (_x: number, z: number) => (z > -0.6 ? 1 : null),
      blocked: () => false,
    };
    for (let i = 0; i < 20; i++)
      updateMovement(s, { forward: 1, turn: 0 }, 0.05, world);
    expect(s.player.z).toBeGreaterThan(-0.6);
    expect(s.player.z).toBeLessThan(0);
    updateMovement(s, { forward: 0, turn: 1 }, 0.05, world);
    expect(s.player.heading).toBeGreaterThan(0);
  });
  it("does not pass through structures or abrupt cliffs even after a stalled frame", () => {
    const s = initialState();
    s.player.x = 0;
    s.player.z = 0;
    const world = {
      groundHeight: () => 1,
      blocked: (_x: number, z: number) => z < -0.1,
    };
    updateMovement(s, { forward: 1, turn: 0 }, 2, world);
    expect(s.player.z).toBe(0);
    updateMovement(s, { forward: 1, turn: 0 }, 0.05, {
      groundHeight: (_x, z) => (z < 0 ? 5 : 1),
      blocked: () => false,
    });
    expect(s.player.z).toBe(0);
  });
  it("steers the boat through open water and synchronizes the passenger checkpoint", () => {
    const s = initialState();
    s.player.mode = "boat";
    const water = { groundHeight: () => null, blocked: () => false };
    for (let i = 0; i < 80; i++)
      updateMovement(s, { forward: 1, turn: 0 }, 0.05, water);
    expect(s.boat.z).toBeLessThan(-30);
    expect(s.boat.docked).toBeNull();
    expect(s.player.z).toBe(s.boat.z);
    updateMovement(s, { forward: 1, turn: 1 }, 0.05, water);
    expect(s.boat.heading).toBeGreaterThan(0);
  });
  it("keeps the full bow clear when the model is rotated east or west", () => {
    for (const direction of [-1, 1]) {
      const s = initialState();
      s.player.mode = "boat";
      s.boat.x = 0;
      s.boat.z = 0;
      s.boat.heading = (direction * Math.PI) / 2;
      const coast = {
        groundHeight: (x: number) => (direction * x > 3.5 ? 1 : null),
        blocked: () => false,
      };
      for (let i = 0; i < 10; i++)
        updateMovement(s, { forward: 1, turn: 0 }, 0.05, coast);
      expect(s.boat.x).toBe(0);
      expect(s.boat.z).toBe(0);
    }
  });
  it("cannot rotate the bow into land while turning in place beside a coast", () => {
    const s = initialState();
    s.player.mode = "boat";
    s.boat.x = 0;
    s.boat.z = 0;
    s.boat.heading = 0;
    const coast = {
      groundHeight: (x: number) => (x > 2 ? 1 : null),
      blocked: () => false,
    };
    for (let i = 0; i < 100; i++)
      updateMovement(s, { forward: 0, turn: 1 }, 0.05, coast);
    expect(Math.sin(s.boat.heading) * 4).toBeLessThanOrEqual(2);
    expect(s.boat.heading).toBeGreaterThan(0);
  });
  it("rejects hull contact and the bounded world edge; recovery clears momentum", () => {
    const s = initialState();
    s.player.mode = "boat";
    s.boat.z = -339.99;
    const water = { groundHeight: () => null, blocked: () => false };
    let hit = false;
    for (let i = 0; i < 30; i++)
      hit =
        updateMovement(s, { forward: 1, turn: 0 }, 0.05, water).boundary || hit;
    expect(hit).toBe(true);
    expect(s.boat.z).toBeGreaterThanOrEqual(-340);
    s.boat.z = 0;
    const before = s.boat.z;
    updateMovement(s, { forward: 1, turn: 0 }, 0.05, {
      groundHeight: () => 1,
      blocked: () => false,
    });
    expect(s.boat.z).toBe(before);
    stopBoat(s);
    expect(updateMovement(s, { forward: 0, turn: 0 }, 0.05, water).speed).toBe(
      0,
    );
  });
});
