import { initialState, type GameState } from "./game";

export class SaveError extends Error {
  override name = "SaveError";
}
const DB_NAME = "thehousebythesea";
const STORE = "snapshots";
const SLOT = "first-voyage";
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const island = (value: unknown) =>
  value === "havenport" || value === "saltglass-bay";
const count = (value: unknown) =>
  typeof value === "number" &&
  Number.isSafeInteger(value) &&
  value >= 0 &&
  value <= 1_000_000_000;
const coordinate = (value: unknown) =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  Math.abs(value) <= 10_000;

/** v0 is the foundation fixture: identical state before audio preferences were persisted. */
export function parseSave(raw: unknown): GameState {
  let value: unknown;
  try {
    value = typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    throw new SaveError(
      "The saved voyage could not be read. Your existing save has not been overwritten.",
    );
  }
  if (!isRecord(value))
    throw new SaveError("The saved voyage is not a valid snapshot.");
  if (value.schemaVersion === 0)
    value = { ...value, schemaVersion: 1, settings: initialState().settings };
  if (!isRecord(value) || value.schemaVersion !== 1)
    throw new SaveError(
      "This save version is unsupported. Your existing save has been kept.",
    );
  const { inventory, story, player, boat, settings, discoveries } = value;
  const valid =
    count(value.wallet) &&
    isRecord(inventory) &&
    count(inventory.sardine) &&
    count(inventory.bream) &&
    (value.delivery === "available" ||
      value.delivery === "active" ||
      value.delivery === "complete") &&
    Array.isArray(discoveries) &&
    discoveries.length > 0 &&
    discoveries.length <= 2 &&
    discoveries.every(island) &&
    new Set(discoveries).size === discoveries.length &&
    isRecord(story) &&
    Object.keys(initialState().story).every(
      (key) => typeof story[key] === "boolean",
    ) &&
    isRecord(player) &&
    coordinate(player.x) &&
    coordinate(player.z) &&
    coordinate(player.heading) &&
    island(player.island) &&
    (player.mode === "walk" || player.mode === "boat") &&
    isRecord(boat) &&
    coordinate(boat.x) &&
    coordinate(boat.z) &&
    coordinate(boat.heading) &&
    (boat.docked === null || island(boat.docked)) &&
    isRecord(settings) &&
    typeof settings.muted === "boolean" &&
    typeof settings.volume === "number" &&
    Number.isFinite(settings.volume) &&
    settings.volume >= 0 &&
    settings.volume <= 1;
  if (!valid)
    throw new SaveError(
      "The saved voyage contains invalid progress. Your existing save has been kept.",
    );
  // Round-trip also detaches the caller's mutable object. Saves contain only plain JSON values.
  return JSON.parse(JSON.stringify(value)) as GameState;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(
        new SaveError(
          "Saving is unavailable in this browser. Keep this tab open to retain this voyage.",
        ),
      );
      return;
    }
    let settled = false;
    const fail = (message: string) => {
      settled = true;
      clearTimeout(timer);
      reject(new SaveError(message));
    };
    const timer = setTimeout(
      () =>
        fail(
          "Browser storage did not respond. Progress is only in this tab; retry saving before leaving.",
        ),
      5000,
    );
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onerror = () =>
      fail(
        "Browser storage could not be opened. Progress is only in this tab.",
      );
    request.onblocked = () =>
      fail(
        "Another tab is blocking storage. Close other game tabs and retry saving.",
      );
    request.onsuccess = () => {
      clearTimeout(timer);
      if (settled) request.result.close();
      else {
        settled = true;
        request.result.onversionchange = () => request.result.close();
        resolve(request.result);
      }
    };
  });
}

export async function loadGame(): Promise<{
  state: GameState | null;
  warning: string | null;
}> {
  let db: IDBDatabase | undefined;
  try {
    db = await openDB();
    const raw = await new Promise<unknown>((resolve, reject) => {
      const transaction = db!.transaction(STORE, "readonly");
      const request = transaction.objectStore(STORE).get(SLOT);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () =>
        reject(new SaveError("The saved voyage could not be loaded."));
      transaction.onabort = () =>
        reject(new SaveError("Loading was interrupted. Please retry."));
    });
    return { state: raw === undefined ? null : parseSave(raw), warning: null };
  } catch (error) {
    return {
      state: null,
      warning:
        error instanceof Error
          ? error.message
          : "Saving is unavailable. Progress is only in this tab.",
    };
  } finally {
    db?.close();
  }
}

export async function saveGame(state: GameState): Promise<void> {
  const snapshot = parseSave(state);
  const db = await openDB();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE, "readwrite");
      transaction.objectStore(STORE).put(snapshot, SLOT);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(
          new SaveError(
            "Progress could not be saved. Storage may be full or disabled.",
          ),
        );
      transaction.onabort = () =>
        reject(
          new SaveError(
            "Saving was interrupted. Please retry before closing this tab.",
          ),
        );
    });
  } finally {
    db.close();
  }
}
