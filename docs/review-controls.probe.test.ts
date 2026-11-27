import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { initialState } from '../src/state/game';
import { updateMovement } from '../src/player/movement';
import { createBoat } from '../src/boat/boat';

describe('independent shoreline review probe', () => {
  it('does not advance an east-facing bow that would overlap east land', () => {
    const state = initialState();
    state.player.mode = 'boat';
    state.boat.x = 0; state.boat.z = 0; state.boat.heading = Math.PI / 2;
    const land = { groundHeight: (x: number) => x > 3 ? 1 : null, blocked: () => false };
    const before = state.boat.x;
    updateMovement(state, { forward: 1, turn: 0 }, .05, land);
    const boat = createBoat(new THREE.Scene());
    boat.root.rotation.y = -state.boat.heading;
    boat.root.updateMatrixWorld(true);
    const extent = new THREE.Box3().setFromObject(boat.root);
    expect(extent.max.x).toBeGreaterThan(3);
    boat.dispose();
    expect(state.boat.x).toBe(before);
  });
});
