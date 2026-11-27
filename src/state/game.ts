import { FISH, FIRST_DELIVERY, HOME_FUND_TARGET } from "../data/content";

export type IslandId = "havenport" | "saltglass-bay";
export type FishId = keyof typeof FISH;
export interface PlayerCheckpoint {
  x: number;
  z: number;
  heading: number;
  mode: "walk" | "boat";
  island: IslandId;
}
export interface BoatCheckpoint {
  x: number;
  z: number;
  heading: number;
  docked: IslandId | null;
}
export interface Settings {
  muted: boolean;
  volume: number;
}
export interface GameState {
  schemaVersion: 1;
  wallet: number;
  inventory: Record<FishId, number>;
  delivery: "available" | "active" | "complete";
  discoveries: IslandId[];
  story: {
    metMira: boolean;
    outingInvited: boolean;
    outingVisitedSaltglass: boolean;
    outingComplete: boolean;
    homeSeen: boolean;
    prologueSeen: boolean;
  };
  player: PlayerCheckpoint;
  boat: BoatCheckpoint;
  settings: Settings;
}
export type Action =
  | {
      type:
        | "ACCEPT_DELIVERY"
        | "DELIVER_PARCEL"
        | "SELL_FISH"
        | "MEET_MIRA"
        | "INVITE_MIRA"
        | "COMPLETE_OUTING"
        | "SEE_HOME"
        | "FINISH_PROLOGUE"
        | "RECOVER";
    }
  | { type: "CATCH_FISH"; fish: FishId }
  | { type: "VISIT_ISLAND"; island: IslandId }
  | { type: "CHECKPOINT"; player: PlayerCheckpoint; boat: BoatCheckpoint }
  | { type: "SETTINGS"; settings: Partial<Settings> };

export function initialState(): GameState {
  return {
    schemaVersion: 1,
    wallet: 25,
    inventory: { sardine: 0, bream: 0 },
    delivery: "available",
    discoveries: ["havenport"],
    story: {
      metMira: false,
      outingInvited: false,
      outingVisitedSaltglass: false,
      outingComplete: false,
      homeSeen: false,
      prologueSeen: false,
    },
    player: { x: 48, z: 0, heading: 0, mode: "walk", island: "havenport" },
    boat: { x: 62, z: 0, heading: 0, docked: "havenport" },
    settings: { muted: false, volume: 0.35 },
  };
}

export function homeFund(state: GameState): {
  saved: number;
  target: number;
  fraction: number;
  milestone: boolean;
} {
  return {
    saved: state.wallet,
    target: HOME_FUND_TARGET,
    fraction: Math.min(1, state.wallet / HOME_FUND_TARGET),
    milestone: state.wallet >= 150,
  };
}

export function reduce(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "ACCEPT_DELIVERY":
      return state.delivery === "available"
        ? { ...state, delivery: "active" }
        : state;
    case "DELIVER_PARCEL":
      return state.delivery === "active" &&
        state.player.island === "saltglass-bay" &&
        state.player.mode === "walk"
        ? {
            ...state,
            delivery: "complete",
            wallet: state.wallet + FIRST_DELIVERY.reward,
          }
        : state;
    case "CATCH_FISH":
      return {
        ...state,
        inventory: {
          ...state.inventory,
          [action.fish]: state.inventory[action.fish] + 1,
        },
      };
    case "SELL_FISH": {
      const earned =
        state.inventory.sardine * FISH.sardine.price +
        state.inventory.bream * FISH.bream.price;
      return earned
        ? {
            ...state,
            wallet: state.wallet + earned,
            inventory: { sardine: 0, bream: 0 },
          }
        : state;
    }
    case "MEET_MIRA":
      return { ...state, story: { ...state.story, metMira: true } };
    case "INVITE_MIRA":
      return state.story.metMira && !state.story.outingComplete
        ? { ...state, story: { ...state.story, outingInvited: true } }
        : state;
    case "VISIT_ISLAND":
      return {
        ...state,
        discoveries: state.discoveries.includes(action.island)
          ? state.discoveries
          : [...state.discoveries, action.island],
        story: {
          ...state.story,
          outingVisitedSaltglass:
            state.story.outingVisitedSaltglass ||
            (state.story.outingInvited && action.island === "saltglass-bay"),
        },
      };
    case "COMPLETE_OUTING":
      return state.story.outingInvited &&
        state.story.outingVisitedSaltglass &&
        state.player.island === "havenport" &&
        state.player.mode === "walk"
        ? {
            ...state,
            story: {
              ...state.story,
              outingComplete: true,
              outingInvited: false,
            },
          }
        : state;
    case "SEE_HOME":
      return { ...state, story: { ...state.story, homeSeen: true } };
    case "FINISH_PROLOGUE":
      return { ...state, story: { ...state.story, prologueSeen: true } };
    case "CHECKPOINT":
      return {
        ...state,
        player: { ...action.player },
        boat: { ...action.boat },
      };
    case "SETTINGS":
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.settings,
          volume: Math.max(
            0,
            Math.min(1, action.settings.volume ?? state.settings.volume),
          ),
        },
      };
    case "RECOVER": {
      const island = state.player.island;
      const z = island === "havenport" ? 0 : -220;
      return {
        ...state,
        player: { x: 48, z, heading: 0, mode: "walk", island },
        boat: { x: 62, z, heading: 0, docked: island },
      };
    }
  }
}
