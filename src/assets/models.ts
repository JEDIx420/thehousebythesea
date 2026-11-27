import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/addons/loaders/GLTFLoader.js";

/** Only local, credited files enter the browser. No API credentials or remote runtime URLs. */
export const MODEL_FILES = {
  male: "rowan-casual",
  female: "mira-casual",
  mira: "mira-family-traveller",
  vessel: "caique-fishing-boat",
} as const;
export type ModelId = keyof typeof MODEL_FILES;
const assets = new Map<ModelId, GLTF>();
const pending = new Map<ModelId, Promise<void>>();
export async function preloadModels(ids: readonly ModelId[]): Promise<void> {
  await Promise.all(
    ids.map((id) => {
      if (assets.has(id)) return Promise.resolve();
      const current = pending.get(id);
      if (current) return current;
      const request = (async () => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 20000);
        try {
          const base = (
            import.meta as ImportMeta & { env: { BASE_URL: string } }
          ).env.BASE_URL;
          const response = await fetch(
            `${base}assets/models/${MODEL_FILES[id]}.glb`,
            { signal: controller.signal },
          );
          if (!response.ok)
            throw new Error(
              `Model ${MODEL_FILES[id]} could not load (${response.status}).`,
            );
          const bytes = await response.arrayBuffer();
          const model = await new GLTFLoader().parseAsync(bytes, "");
          assets.set(id, model);
        } catch {
          throw new Error(
            `The ${MODEL_FILES[id]} model could not load. Check the connection and retry.`,
          );
        } finally {
          clearTimeout(timer);
          pending.delete(id);
        }
      })();
      pending.set(id, request);
      return request;
    }),
  );
}
export function loadedModel(id: ModelId): GLTF {
  const model = assets.get(id);
  if (!model)
    throw new Error(`Preload ${MODEL_FILES[id]} before entering the harbour.`);
  return model;
}
export function disposeModelAssets(): void {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  for (const model of assets.values())
    model.scene.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        geometries.add(o.geometry);
        for (const m of Array.isArray(o.material) ? o.material : [o.material])
          materials.add(m);
      }
    });
  for (const geometry of geometries) geometry.dispose();
  for (const material of materials) material.dispose();
  assets.clear();
}
