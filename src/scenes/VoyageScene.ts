import { resourceUrl } from "../data/resource-url";
import { navigation } from "../data/navigation";
import WORLD from "../../assets/source/world.json" with { type: "json" };
import { Locomotion } from "../player/locomotion";
import Phaser from "phaser";
import { Session } from "../game/session";
import { View } from "../ui/view";
import { conversation } from "../game/dialogue";
import { Ambience } from "../audio/ambience";
import {
  cast,
  tickFishing,
  reel,
  type FishingState,
} from "../activities/fishing";
import { FISH } from "../data/content";
import { project, unproject, depth, type Point } from "../world/projection";
import {
  MAPS,
  PLACES,
  dockFor,
  walkable,
  boatClear,
  reachableDock,
  groundAt,
  hullPoints,
  elevationAt,
  surfaceDepth,
  pickSurface,
  districtAt,
  materialAt,
  canStep,
} from "../world/world";
import { People, deckSeat } from "../world/people";
import {
  moveFoot,
  moveVessel,
  board,
  disembark,
  facing,
} from "../player/movement";
import type { GameState } from "../state/game";
interface FrameMeta {
  id: string;
  width: number;
  height: number;
  anchor: number[];
}
interface Target {
  id: string;
  name: string;
  distance: number;
}
export class VoyageScene extends Phaser.Scene {
  private frames = new Map<string, FrameMeta>();
  private covers: Phaser.GameObjects.Image[] = [];
  private trees: Phaser.GameObjects.Image[] = [];
  private personImages = new Map<string, Phaser.GameObjects.Image>();
  private people!: People;
  private rowan!: Phaser.GameObjects.Image;
  private vessel!: Phaser.GameObjects.Image;
  private passenger!: Phaser.GameObjects.Image;
  private ripple!: Phaser.GameObjects.Image;
  private caughtImage!: Phaser.GameObjects.Image;
  private line!: Phaser.GameObjects.Graphics;
  private seaFx: Phaser.GameObjects.Image[] = [];
  private birds: Phaser.GameObjects.Image[] = [];
  private water!: Phaser.GameObjects.TileSprite;
  private wakes: { image: Phaser.GameObjects.Image; age: number }[] = [];
  private wakeClock = 0;
  private wakeIndex = 0;
  private keys = new Set<string>();
  private readonly nativeKeyDown = (event: KeyboardEvent) =>
    this.keyDown(event);
  private readonly nativeKeyUp = (event: KeyboardEvent) =>
    this.keys.delete(event.key.toLowerCase());
  private speed = 0;
  private locomotion = new Locomotion();
  private elapsed = 0;
  private visualElapsed = 0;
  private fish?: FishingState;
  private castCount = 0;
  private fishPoint: Point = { x: 0, z: 0 };
  private catchEffect?: {
    species: "sardine" | "bream";
    age: number;
    position: Point;
  };
  private memory = -1;
  private memoryElapsed = 0;
  private gangway?: { from: Point; to: Point; age: number };
  private cameraPoint = { x: 152, y: -12 };
  private samples: number[] = [];
  private rawLast = 0;
  private stalls = 0;
  private hudTime = 0;
  private blockedToast = 0;
  private failed = false;
  private bootTimer?: ReturnType<typeof setTimeout>;
  private audio = new Ambience();
  private booted = false;
  private zoom = 1;
  private lastAudioError = "";
  constructor(
    private session: Session,
    private view: View,
  ) {
    super("first-voyage");
  }
  preload() {
    this.bootTimer = setTimeout(
      () =>
        this.failBoot(
          "The coastline took too long to load. Please retry when your connection is ready.",
        ),
      12000,
    );
    this.load.atlas(
      "coast",
      resourceUrl("assets/atlas.png"),
      resourceUrl("assets/atlas.json"),
    );
    this.load.json("manifest", resourceUrl("assets/manifest.json"));
    this.load.on("loaderror", () => {
      this.failed = true;
    });
  }
  private setFrame(image: Phaser.GameObjects.Image, id: string) {
    const f = this.frames.get(id);
    if (!f) throw new Error(`Missing credited frame ${id}`);
    image.setFrame(id).setOrigin(f.anchor[0] / f.width, f.anchor[1] / f.height);
  }
  private art(id: string, x: number, z: number, layer?: number) {
    const p = project(x, z),
      image = this.add.image(
        Math.round(p.x),
        Math.round(p.y - (layer === undefined ? elevationAt(x, z) : 0)),
        "coast",
        id,
      );
    this.setFrame(image, id);
    return image.setDepth(layer ?? surfaceDepth(x, z));
  }
  create() {
    try {
      this.initialise();
    } catch {
      this.failBoot(
        "Some coastline artwork or its metadata is incomplete. Please retry.",
      );
    }
  }
  private failBoot(message: string) {
    clearTimeout(this.bootTimer);
    this.failed = true;
    this.booted = false;
    this.keys.clear();
    this.view.error(message);
    this.view.onAction = (action) => {
      if (action === "retry") location.reload();
    };
  }
  private initialise() {
    if (this.failed || !this.textures.exists("coast")) {
      this.failBoot(
        "Some coastline artwork could not be loaded. Check your connection and retry.",
      );
      return;
    }
    const m: unknown = this.cache.json.get("manifest");
    if (
      !m ||
      typeof m !== "object" ||
      !("frames" in m) ||
      !Array.isArray(m.frames)
    )
      throw new Error("Invalid atlas manifest");
    const texture = this.textures.get("coast");
    for (const candidate of m.frames) {
      const f = candidate as FrameMeta & {
        license?: unknown;
        source?: unknown;
      };
      if (
        !f ||
        typeof f.id !== "string" ||
        !f.id ||
        this.frames.has(f.id) ||
        !Number.isInteger(f.width) ||
        !Number.isInteger(f.height) ||
        f.width < 1 ||
        f.height < 1 ||
        f.width > 2048 ||
        f.height > 2048 ||
        !Array.isArray(f.anchor) ||
        f.anchor.length !== 2 ||
        !f.anchor.every(Number.isFinite) ||
        f.anchor[0] < 0 ||
        f.anchor[0] > f.width ||
        f.anchor[1] < 0 ||
        f.anchor[1] > f.height ||
        typeof f.license !== "string" ||
        !f.license ||
        typeof f.source !== "string" ||
        !f.source ||
        !texture.has(f.id)
      )
        throw new Error("Invalid credited sprite metadata");
      const actual = texture.get(f.id);
      if (actual.width !== f.width || actual.height !== f.height)
        throw new Error("Atlas size mismatch");
      this.frames.set(f.id, f);
    }
    const required = [
      "water",
      "havenport-ground",
      "saltglass-ground",
      "young-rowan",
      "tree-1",
      ...MAPS.flatMap((m) =>
        (m.levels ?? []).map((l) => `top-${m.id}-${l.id}`),
      ),
      ...MAPS.flatMap((map) =>
        map.landmarks.map((p) => (p.kind === "tree" ? "tree-0" : p.kind)),
      ),
    ];
    for (const actor of ["rowan", "mira", "ellis", "nessa", "tomas"])
      for (const dir of ["s", "n", "w", "e"])
        for (const [pose, count] of [
          ["idle", 4],
          ["walk", 12],
          ["sit", 2],
        ] as const)
          for (let i = 0; i < count; i++)
            required.push(`${actor}-${dir}-${pose}-${i}`);
    for (const actor of ["rowan", "mira", "ellis", "tomas", "nessa"])
      for (const expression of actor === "rowan" || actor === "mira"
        ? ["neutral", "happy", "thoughtful", "surprised"]
        : ["neutral", "happy", "thoughtful"])
        for (let i = 0; i < 2; i++)
          required.push(`portrait-${actor}-${expression}-${i}`);
    for (const dir of ["s", "n", "e", "w"])
      for (let i = 0; i < 2; i++) required.push(`rowan-${dir}-fish-${i}`);
    for (let i = 0; i < 16; i++) required.push(`ripple-${i}`);
    for (let i = 0; i < 8; i++)
      for (let j = 0; j < 2; j++) required.push(`boat-${i}-${j}`);
    for (let i = 0; i < 4; i++) required.push(`gull-${i}`);
    for (const fish of ["sardine", "bream"])
      for (let i = 0; i < 2; i++) required.push(`fish-${fish}-${i}`);
    for (const id of required)
      if (!this.frames.has(id)) throw new Error(`Missing required frame ${id}`);
    this.view.configurePortraits(
      m.frames as unknown as import("../ui/dialogue-view").PortraitFrame[],
    );
    const s = this.session.state;
    if (
      (s.player.mode === "walk" && !walkable(s.player.x, s.player.z)) ||
      (s.player.mode === "boat" && !boatClear(s.boat))
    ) {
      this.session.dispatch({ type: "RECOVER" });
      this.view.toast(
        "Your old position needed a safer landing. Your progress is kept; you and the boat are at the pier.",
      );
    }
    this.people = new People(this.session.state);
    this.water = this.add
      .tileSprite(0, 0, this.scale.width, this.scale.height, "coast", "water")
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(-100000);
    for (const island of MAPS) {
      this.art(
        island.id === "havenport" ? "havenport-ground" : "saltglass-ground",
        0,
        island.offsetZ,
        -50000,
      );
      for (const frame of m.frames as {
        id: string;
        category?: string;
        island?: string;
        world?: number[];
        pixelOffset?: number[];
        depthY?: number;
      }[])
        if (
          frame.category === "cliff" &&
          frame.island === island.id &&
          frame.world
        ) {
          const [x, z] = frame.world,
            image = this.art(
              frame.id,
              x,
              z + island.offsetZ,
              frame.depthY !== undefined
                ? frame.depthY + project(0, island.offsetZ).y
                : depth(x, z + island.offsetZ) + 0.1,
            );
          if (frame.pixelOffset)
            image.setPosition(
              image.x + frame.pixelOffset[0],
              image.y + frame.pixelOffset[1],
            );
        }

      for (const p of island.landmarks) {
        const id = p.kind === "tree" ? "tree-0" : p.kind,
          image = this.art(id, p.x, p.z + island.offsetZ);
        if (
          [
            "shop",
            "market-stall",
            "garden-house",
            "beacon",
            "net-shed",
            "cafe",
            "hut",
            "cottage",
            "fishing-hut",
            "tree",
            "arch",
          ].includes(p.kind)
        )
          this.covers.push(image);
        if (p.kind === "tree") this.trees.push(image);
      }
      for (const [i, p] of [
        [50, 10],
        [57, -13],
        [-45, 9],
        [18, 37],
      ].entries()) {
        const image = this.art(
          `ripple-${i * 4}`,
          p[0],
          p[1] + island.offsetZ,
          -50001,
        )
          .setAlpha(0.65)
          .setData("phase", i * 4);
        this.seaFx.push(image);
      }
    }
    for (const boat of WORLD.decorativeBoats)
      this.art(
        `boat-${boat.direction}-0`,
        boat.x,
        boat.z +
          navigation(boat.island as import("../state/game").IslandId).offsetZ,
        -1000,
      ).setAlpha(0.8);
    this.vessel = this.art(
      "boat-0-0",
      this.session.state.boat.x,
      this.session.state.boat.z,
    );
    this.rowan = this.art(
      "rowan-s-idle-0",
      this.session.state.player.x,
      this.session.state.player.z,
    );
    this.passenger = this.art("mira-e-sit-0", 0, 0).setVisible(false);
    for (const p of this.people.persons)
      this.personImages.set(
        p.id,
        this.art(`${p.actor}-s-idle-0`, p.point.x, p.point.z),
      );
    this.ripple = this.art("ripple-0", 0, 0, -50002).setVisible(false);
    this.caughtImage = this.art("fish-sardine-0", 0, 0, 20000).setVisible(
      false,
    );
    this.line = this.add.graphics().setDepth(15000);
    for (let i = 0; i < 8; i++)
      this.wakes.push({
        image: this.art("ripple-0", 0, 0, -50002).setVisible(false),
        age: 100,
      });
    for (let i = 0; i < 5; i++)
      this.birds.push(
        this.art("gull-0", 40 + i * 18, -30 - i * 60, 12000).setData("seed", i),
      );
    // Use each physical DOM event once. Phaser's queued keyboard events can be
    // replayed between immediate input and frame polling, toggling board/dock.
    window.addEventListener("keydown", this.nativeKeyDown);
    window.addEventListener("keyup", this.nativeKeyUp);
    this.game.events.on(Phaser.Core.Events.BLUR, () => {
      this.keys.clear();
      this.locomotion.reset();
    });
    this.input.on(
      "wheel",
      (_p: unknown, _o: unknown, _x: number, dy: number) => {
        if (this.view.open) return;
        const next = dy < 0 ? 2 : 1,
          camera = this.cameras.main;
        const screen = {
          x: (this.rowan.x - camera.worldView.x) * this.zoom,
          y: (this.rowan.y - camera.worldView.y) * this.zoom,
        };
        this.zoom = next;
        this.cameraPoint = {
          x: this.rowan.x + (this.scale.width / 2 - screen.x) / next,
          y: this.rowan.y + (this.scale.height / 2 - screen.y) / next,
        };
        camera.setZoom(next).centerOn(this.cameraPoint.x, this.cameraPoint.y);
      },
    );
    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
      const world = this.cameras.main.getWorldPoint(p.x, p.y);
      this.registry.set("lastPick", pickSurface(world.x, world.y));
    });
    this.view.onOpen = () => {
      this.keys.clear();
      this.locomotion.reset();
    };
    this.view.onAction = (action, value) => {
      void this.action(action, value);
    };
    this.session.onChange = () => this.hud();
    const start = project(
      this.session.state.player.x,
      this.session.state.player.z,
    );
    this.cameraPoint = { x: start.x - 40, y: start.y - 108 };
    this.cameras.main
      .setRoundPixels(true)
      .centerOn(this.cameraPoint.x, this.cameraPoint.y);
    this.game.canvas.tabIndex = 0;
    this.game.canvas.setAttribute(
      "aria-label",
      "The First Voyage pixel-art world",
    );
    this.booted = true;
    this.hud();
    this.view.title(this.session);
    this.renderActors(0, false);
    const scene = this;
    Object.defineProperty(window, "voyage", {
      configurable: true,
      value: {
        getState: () => scene.session.snapshot(),
        getMetrics: () => scene.metrics(),
      },
    });
    clearTimeout(this.bootTimer);
  }
  private metrics() {
    const a = [...this.samples].sort((x, y) => x - y),
      q = (p: number) =>
        a[Math.min(a.length - 1, Math.floor(a.length * p))] ?? 0;
    return {
      renderer: this.game.renderer.type === Phaser.WEBGL ? "WebGL" : "Canvas",
      frames: a.length,
      sampleKind: "raw render callback interval",
      p50: q(0.5),
      p95: q(0.95),
      stallsOver50ms: this.stalls,
      assets: this.frames.size,
      viewport: [this.scale.width, this.scale.height],
      scene: this.scene.key,
      zoom: this.zoom,
      companionReady:
        !this.session.state.story.outingInvited || this.people.aboard,
      loadBytes: performance
        .getEntriesByType("resource")
        .reduce(
          (n, r) => n + ((r as PerformanceResourceTiming).transferSize || 0),
          0,
        ),
      heap: (
        performance as Performance & { memory?: { usedJSHeapSize: number } }
      ).memory?.usedJSHeapSize,
      lastPick: this.registry.get("lastPick"),
      npcs: this.people.persons.map((p) => ({
        id: p.id,
        x: p.point.x,
        z: p.point.z,
        walking: p.walking,
      })),
      audio: this.audio.metrics(),
      screenActors: [this.rowan, this.passenger, ...this.personImages.values()]
        .filter((i) => i.visible)
        .map((i) => ({
          x: (i.x - this.cameras.main.worldView.x - 16) * this.zoom,
          y: (i.y - this.cameras.main.worldView.y - 63) * this.zoom,
          width: 32 * this.zoom,
          height: 64 * this.zoom,
        })),
      locomotion: this.locomotion.metrics(),
      gangway: this.gangway
        ? {
            age: this.gangway.age,
            from: { ...this.gangway.from },
            to: { ...this.gangway.to },
          }
        : null,
      elevation: elevationAt(
        this.session.state.player.x,
        this.session.state.player.z,
      ),
    };
  }
  private keyDown(e: KeyboardEvent) {
    const key = e.key.toLowerCase();
    if (this.view.open) {
      if (this.view.panel === "dialogue" && key === "e" && !e.repeat) {
        e.preventDefault();
        this.view.advanceDialogue();
        return;
      }
      if (key === "escape") {
        e.preventDefault();
        if (this.view.panel === "prologue") this.finishMemory();
        else if (!["title", "loading", "error"].includes(this.view.panel!))
          if (this.session.started) this.view.close();
          else this.view.title(this.session);
      }
      return;
    }
    if (
      e.target instanceof HTMLElement &&
      e.target.closest("#ui button,#ui input,#ui a") &&
      [
        " ",
        "enter",
        "arrowup",
        "arrowdown",
        "arrowleft",
        "arrowright",
      ].includes(key)
    )
      return;
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key))
      e.preventDefault();
    if (e.repeat) return;
    this.keys.add(key);
    const action: Record<string, string> = {
      e: "interact",
      f: "fish",
      m: "chart",
      j: "journal",
      escape: "pause",
      r: "recover",
      " ": "reel",
    };
    if (action[key]) void this.action(action[key]);
  }
  private objective() {
    const s = this.session.state;
    if (s.delivery === "available")
      return "Meet Ellis beside the harbour pier.";
    if (s.delivery === "active")
      return "Take the parcel north to Nessa at Saltglass.";
    if (!s.story.outingComplete && s.story.outingInvited)
      return s.story.outingVisitedSaltglass
        ? "Return to Havenport and share the crossing with Mira."
        : "Take Mira across the channel when you’re ready.";
    if (!s.story.homeSeen)
      return "Look for the beach-plot notice north of the post office.";
    return s.wallet < 150
      ? "A few fresh catches will begin your home fund."
      : s.story.outingComplete
        ? "A first journey. A shared memory. A little saved for tomorrow."
        : "A first journey. A little saved for tomorrow.";
  }
  private target(): Target | null {
    const s = this.session.state,
      p = s.player;
    if (p.mode === "boat") {
      const d = reachableDock(s.boat, this.speed);
      return d
        ? {
            id: "dock",
            name: `Tie up & step ashore · ${d === "havenport" ? "Havenport" : "Saltglass"}`,
            distance: 0,
          }
        : null;
    }
    const candidates: Target[] = [];
    const canBoard = board(p, s.boat);
    if (canBoard) {
      const d = dockFor(p.island),
        distance = Math.hypot(p.x - d.landingX, p.z - d.landingZ);
      if (distance < 3)
        return { id: "board", name: "Board your boat", distance };
      candidates.push({
        id: "board",
        name: "Board your boat",
        distance: distance + 2,
      });
    }
    for (const npc of this.people.persons)
      if (npc.visible && npc.point.island === p.island) {
        const distance = Math.hypot(p.x - npc.point.x, p.z - npc.point.z);
        if (distance < 6)
          candidates.push({ id: npc.id, name: npc.name, distance });
      }
    for (const place of PLACES)
      if (place.island === p.island) {
        const distance = Math.hypot(p.x - place.x, p.z - place.z);
        if (distance < 5)
          candidates.push({ id: place.id, name: place.name, distance });
      }
    return candidates.sort((a, b) => a.distance - b.distance)[0] ?? null;
  }
  private hud() {
    if (!this.booted) return;
    const s = this.session.state,
      target = this.target(),
      waiting =
        s.player.mode === "boat" &&
        s.story.outingInvited &&
        !this.people.aboard;
    const camera = this.cameras.main;
    this.view.contextPosition(
      Math.max(
        80,
        Math.min(
          this.scale.width - 80,
          (this.rowan.x - camera.worldView.x) * camera.zoom,
        ),
      ),
      Math.max(
        35,
        Math.min(
          this.scale.height - 25,
          (this.rowan.y - camera.worldView.y) * camera.zoom - 74 * camera.zoom,
        ),
      ),
      [this.rowan, this.passenger, ...this.personImages.values()]
        .filter((image) => image.visible)
        .map((image) => ({
          x: (image.x - camera.worldView.x - 16) * camera.zoom,
          y: (image.y - camera.worldView.y - 63) * camera.zoom,
          width: 32 * camera.zoom,
          height: 64 * camera.zoom,
        })),
    );
    this.view.update(
      this.session,
      this.objective(),
      s.player.mode === "boat"
        ? "The Saltglass channel"
        : districtAt(s.player.x, s.player.z),
      this.fish
        ? ""
        : waiting
          ? "Mira is bringing her sketchbook…"
          : (target?.name ??
            (s.player.mode === "boat"
              ? "Sail · A / D steer · S slow"
              : "Explore the waterfront")),
      !waiting && Boolean(target),
    );
  }
  private finishMemory() {
    this.memory = -1;
    this.session.dispatch({ type: "FINISH_PROLOGUE" });
    this.view.close();
    this.view.arrive();
    this.view.toast(
      "WASD to walk · E to talk. Ellis is beside the pier. · M opens your chart.",
    );
    // A new arrival replays only the brief location tab.
    /*this.view.toast("Welcome home, Rowan. Ellis is waiting beside the pier.");*/
  }
  private startAmbience() {
    try {
      this.audio.start(this.session.state.settings);
    } catch {
      this.view.toast("Sound is unavailable here. Your voyage can continue.");
    }
  }
  private async action(action: string, value?: string) {
    const s = this.session.state;
    if (this.gangway && ["interact", "fish", "reel"].includes(action)) return;
    if (action === "dialogue-next") {
      this.view.advanceDialogue();
      return;
    }
    if (action === "retry") {
      location.reload();
      return;
    }
    if (action === "begin") {
      this.session.started = true;
      this.startAmbience();
      if (!s.story.prologueSeen) {
        this.memory = 0;
        this.memoryElapsed = 0;
        this.view.prologue(0);
      } else this.view.close();
      return;
    }
    if (action === "memory-next") {
      if (this.memory < 2) {
        this.memory++;
        this.memoryElapsed = 0;
        this.view.prologue(this.memory);
      } else this.finishMemory();
      return;
    }
    if (action === "memory-skip") {
      this.finishMemory();
      return;
    }
    if (action === "close") {
      if (this.session.started) this.view.close();
      else this.view.title(this.session);
      return;
    }
    if (action === "import") {
      try {
        const persisted = await this.session.importOriginal();
        this.people = new People(this.session.state);
        this.renderActors(0, false);
        this.view.title(this.session);
        this.view.toast(
          persisted
            ? "Original progress copied. World positions begin at a safe pier; the original save is unchanged."
            : "Original progress loaded for this tab only. It was not saved; the original is unchanged.",
        );
      } catch (e) {
        this.view.toast(
          e instanceof Error
            ? e.message
            : "The original voyage could not be imported.",
          7000,
        );
      }
      return;
    }
    if (action === "credits") {
      this.view.credits();
      return;
    }
    if (action === "pause") {
      this.view.pause(this.session);
      return;
    }
    if (action === "settings") {
      this.view.settings(s);
      return;
    }
    if (action === "chart") {
      this.view.chart(s);
      return;
    }
    if (action === "journal") {
      this.view.journal(s);
      return;
    }
    if (action === "home") {
      this.view.home(s);
      return;
    }
    if (action === "save") {
      const ok = await this.session.save();
      if (this.view.panel === "pause") this.view.pause(this.session);
      this.view.toast(
        ok
          ? "Your voyage is saved."
          : (this.session.warning ?? "Saving is unavailable."),
        6000,
      );
      return;
    }
    if (
      [
        "muted",
        "volume",
        "motion",
        "music",
        "ambience",
        "sfx",
        "text",
      ].includes(action)
    ) {
      this.session.dispatch({
        type: "SETTINGS",
        settings:
          action === "muted"
            ? { muted: value === "true" }
            : action === "motion"
              ? { reducedMotion: value === "true" }
              : action === "text"
                ? { instantText: value === "true" }
                : { [action]: Number(value) },
      });
      this.startAmbience();
      return;
    }
    if (action === "recover") {
      this.gangway = undefined;
      this.fish = undefined;
      this.view.clearFishing();
      this.line.clear();
      this.ripple.setVisible(false);
      this.speed = 0;
      this.locomotion.reset();
      this.session.dispatch({ type: "RECOVER" });
      this.people = new People(this.session.state);
      this.view.close();
      this.view.toast(
        "You and your boat are safe at the pier. All progress is kept.",
      );
      return;
    }
    if (action === "interact") {
      if (!this.view.open && !this.fish) this.interact();
      return;
    }
    if (action === "fish" || action === "cancel-fishing") {
      if (this.fish) {
        this.cancelFishing();
        return;
      }
      if (action === "fish" && !this.view.open) this.startFishing();
      return;
    }
    if (action === "reel") {
      if (this.fish) {
        const result = reel(this.fish);
        if (result.phase === "caught") {
          const fish = this.fish.species;
          this.session.dispatch({ type: "CATCH_FISH", fish });
          this.audio.sfx("catch");
          this.catchEffect = {
            species: fish,
            age: 0,
            position: { ...this.fishPoint },
          };
          this.view.toast(
            `Caught a ${FISH[fish].name.toLowerCase()}! Safely in your creel.`,
          );
        } else
          this.view.toast("A little too soon. There will be another bite.");
        this.cancelFishing(false);
      }
      return;
    }
    if (action === "accept") {
      this.session.dispatch({ type: "ACCEPT_DELIVERY" });
      this.view.close();
      this.view.toast(
        "Parcel safely aboard. Nessa is north across the channel at Saltglass.",
      );
      return;
    }
    if (action === "meet") {
      this.session.dispatch({ type: "MEET_MIRA" });
      this.view.dialogue(conversation("mira", this.session.state));
      return;
    }
    if (action === "invite") {
      this.session.dispatch({ type: "INVITE_MIRA" });
      this.people.invite();
      this.view.dialogue(conversation("mira", this.session.state));
      return;
    }
    if (action === "memory") {
      this.session.dispatch({ type: "COMPLETE_OUTING" });
      this.view.dialogue({
        speaker: "Mira",
        role: "A SHARED AFTERNOON",
        title: "A beginning worth keeping",
        paragraphs: [
          "“The sea gave us a perfectly ordinary afternoon. I think I’ll remember it for a long time.”",
          "She tucks the loose pages into her bag. A wet line of blue crosses one corner. Neither of you feels the need to fix it.",
        ],
        choices: [{ label: "See you soon, Mira", action: "close" }],
      });
      return;
    }
    if (action === "deliver") {
      const before = s.wallet;
      this.session.dispatch({ type: "DELIVER_PARCEL" });
      if (s.delivery === "active") this.audio.sfx("job");
      this.view.dialogue(conversation("nessa", this.session.state));
      this.view.toast(
        this.session.state.wallet > before
          ? "Parcel delivered · 120 coins earned."
          : "The parcel has already been delivered.",
      );
      return;
    }
    if (action === "sell") {
      const earned = s.inventory.sardine * 18 + s.inventory.bream * 32;
      this.session.dispatch({ type: "SELL_FISH" });
      this.view.close();
      this.view.toast(
        earned
          ? `Sold your catch · ${earned} coins added to the home fund.`
          : "Your creel is empty. A good spot is waiting at the pier.",
      );
      return;
    }
    if (action === "plot-hint") {
      this.view.close();
      this.view.toast(
        "The little beachfront plot is north of the post office, beside the bench.",
      );
      return;
    }
    if (action === "arch-hint") {
      this.view.close();
      this.view.toast(
        "Follow the pale path north and uphill, past the fishing huts, to the shell arch.",
      );
    }
  }
  private interact() {
    const target = this.target();
    if (!target) return;
    this.audio.sfx("interact");
    const person = this.people.persons.find((p) => p.id === target.id);
    if (person) {
      this.locomotion.direction = facing(
        person.point.x - this.session.state.player.x,
        person.point.z - this.session.state.player.z,
      );
      person.direction = facing(
        this.session.state.player.x - person.point.x,
        this.session.state.player.z - person.point.z,
      );
    }

    const s = this.session.state;
    if (target.id === "board") {
      const player = board(s.player, s.boat);
      if (player) {
        this.locomotion.reset();
        this.stepGangway(s.player, {
          x: MAPS.find((m) => m.id === s.player.island)!.dock.maxX - 1,
          z: navigation(s.player.island).dock.z,
        });
        this.session.checkpoint(player, s.boat);
        if (s.story.outingInvited) this.people.prepareBoarding();
        this.speed = 0;
        void this.session.save();
        this.view.toast(
          s.story.outingInvited && !this.people.aboard
            ? "Mira is on her way down the pier. Give her a moment."
            : "Your boat. Your days are finally your own.",
        );
      }
      return;
    }
    if (target.id === "dock") {
      const result = disembark(s.player, s.boat, this.speed);
      if (result) {
        this.speed = 0;
        this.locomotion.reset();
        this.stepGangway(
          {
            x: MAPS.find((m) => m.id === result.player.island)!.dock.maxX - 1,
            z: result.boat.z,
          },
          result.player,
        );
        this.session.checkpoint(result.player, result.boat);
        this.session.dispatch({
          type: "VISIT_ISLAND",
          island: result.player.island,
        });
        this.people.disembarked(result.player.island, this.session.state);
        void this.session.save();
        this.view.toast(
          result.player.island === "saltglass-bay"
            ? "Welcome to Saltglass. Nessa is working beside the pier."
            : "Back in Havenport. A good place to return to.",
        );
      }
      return;
    }
    if (target.id === "home") {
      this.session.dispatch({ type: "SEE_HOME" });
      this.view.home(this.session.state);
      return;
    }
    if (target.id === "arch") {
      this.view.dialogue({
        speaker: "The shell arch",
        role: "SALTGLASS OVERLOOK",
        title: "Where the sea draws",
        paragraphs: [
          "From the pier it looked like a pale line on the hill. Up close, the stone is full of little shells. Wind moves through the opening as softly as someone turning a page.",
          "Below, the fishing roofs gather around their sheltered cove. The boat is still there. For once, there is nowhere you need to hurry.",
        ],
        choices: [{ label: "Stay for a moment", action: "close" }],
      });
      return;
    }
    this.view.dialogue(conversation(target.id, s));
  }
  private startFishing() {
    const s = this.session.state,
      atPier = MAPS.some((m) => {
        const d = dockFor(m.id);
        return (
          Math.hypot(s.player.x - d.landingX, s.player.z - d.landingZ) < 16
        );
      });
    if (
      (s.player.mode === "boat" && this.speed < 0.6) ||
      (s.player.mode === "walk" && atPier)
    ) {
      let point: Point | undefined;
      for (let i = 0; i < 8; i++) {
        const a = Math.PI / 4 + (i * Math.PI) / 4,
          candidate = {
            x: s.player.x + Math.cos(a) * 18,
            z: s.player.z + Math.sin(a) * 18,
          };
        if (
          !groundAt(candidate.x, candidate.z) &&
          (s.player.mode === "boat" ||
            Math.hypot(candidate.x - s.boat.x, candidate.z - s.boat.z) > 12)
        ) {
          point = candidate;
          break;
        }
      }
      if (!point) {
        this.view.toast("Try the open-water side of the pier.");
        return;
      }
      this.keys.clear();
      this.locomotion.reset();
      this.game.canvas.focus();
      this.speed = 0;
      this.audio.sfx("cast");
      this.fish = cast(this.castCount++);
      this.fishPoint = point;
      this.view.fishing(this.fish);
      this.ripple.setVisible(true);
      this.hud();
    } else
      this.view.toast(
        s.player.mode === "boat"
          ? "Slow the boat before casting."
          : "Cast from a pier or your stopped boat.",
      );
  }
  private cancelFishing(message = true) {
    this.keys.clear();
    this.fish = undefined;
    this.view.clearFishing();
    this.ripple.setVisible(false);
    this.line.clear();
    if (message)
      this.view.toast("Rod put away. Your catch and progress are kept.");
  }
  private stepGangway(from: Point, to: Point) {
    // Only animate an actual clear pier path. Persistent checkpoint is already valid.
    let previous = from;
    for (let i = 1; i <= 40; i++) {
      const next = {
        x: from.x + ((to.x - from.x) * i) / 40,
        z: from.z + ((to.z - from.z) * i) / 40,
      };
      if (
        !walkable(next.x, next.z) ||
        !canStep(previous.x, previous.z, next.x, next.z)
      )
        return;
      previous = next;
    }
    this.gangway = { from: { ...from }, to: { ...to }, age: 0 };
    this.keys.clear();
  }
  private idleFrame(time: number, offset = 0) {
    const t = (time + offset) % 9;
    return t > 7.8 && t < 7.96
      ? 2
      : t > 6.4 && t < 7.1
        ? 3
        : t > 2.5 && t < 5
          ? 1
          : 0;
  }
  private renderActors(time: number, walking: boolean) {
    const s = this.session.state,
      visual = this.visualElapsed,
      p = project(s.player.x, s.player.z),
      b = project(s.boat.x, s.boat.z),
      direction = ((Math.round(s.boat.heading / (Math.PI / 4)) % 8) + 8) % 8;
    const vesselDepth = Math.max(
      ...hullPoints(s.boat).map((q) => depth(q.x, q.z)),
    );
    this.setFrame(
      this.vessel,
      `boat-${direction}-${Math.floor(visual * 2) % 2}`,
    );
    this.vessel
      .setPosition(Math.round(b.x), Math.round(b.y))
      .setDepth(vesselDepth);
    if (this.memory >= 0) {
      this.setFrame(this.rowan, "young-rowan");
      this.rowan.setPosition(p.x, p.y - 4).setDepth(p.y + 1);
    } else if (s.player.mode === "boat") {
      const seat = deckSeat(s.boat, 0, -2),
        foot = project(seat.x, seat.z),
        dir = facing(Math.sin(s.boat.heading), -Math.cos(s.boat.heading));
      this.setFrame(
        this.rowan,
        `rowan-${dir}-${this.fish ? "fish-" + (Math.floor(visual) % 2) : "sit-" + (Math.floor(visual * 0.7) % 2)}`,
      );
      this.rowan
        .setPosition(Math.round(foot.x), Math.round(foot.y - 3))
        .setDepth(vesselDepth + 1);
    } else {
      p.y -= elevationAt(s.player.x, s.player.z);
      const dir = this.locomotion.direction;
      this.setFrame(
        this.rowan,
        `rowan-${dir}-${this.fish ? "fish-" + (Math.floor(visual) % 2) : walking ? "walk-" + this.locomotion.frame() : "idle-" + this.idleFrame(visual)}`,
      );
      this.rowan
        .setPosition(Math.round(p.x), Math.round(p.y))
        .setDepth(surfaceDepth(s.player.x, s.player.z) + 0.001);
    }
    if (this.gangway) {
      const g = this.gangway,
        t = Math.min(1, g.age / 0.48),
        q = {
          x: g.from.x + (g.to.x - g.from.x) * t,
          z: g.from.z + (g.to.z - g.from.z) * t,
        },
        foot = project(q.x, q.z);
      const dir = facing(g.to.x - g.from.x, g.to.z - g.from.z);
      this.setFrame(
        this.rowan,
        `rowan-${dir}-walk-${Math.floor(((t * Math.hypot(g.to.x - g.from.x, g.to.z - g.from.z)) / 3.3) * 12) % 12}`,
      );
      this.rowan
        .setPosition(
          Math.round(foot.x),
          Math.round(foot.y - elevationAt(q.x, q.z)),
        )
        .setDepth(surfaceDepth(q.x, q.z) + 0.001);
    }
    for (const person of this.people.persons) {
      const image = this.personImages.get(person.id)!;
      image.setVisible(person.visible && this.memory < 0);
      if (!image.visible) continue;
      const foot = project(person.point.x, person.point.z);
      foot.y -= elevationAt(person.point.x, person.point.z);
      this.setFrame(
        image,
        `${person.actor}-${person.direction}-${person.walking ? "walk-" + (Math.floor((person.distance / 3.3) * 12) % 12) : "idle-" + this.idleFrame(visual, person.id.length * 0.47 + person.actor.charCodeAt(0) * 0.61)}`,
      );
      image
        .setPosition(Math.round(foot.x), Math.round(foot.y))
        .setDepth(surfaceDepth(person.point.x, person.point.z));
    }
    this.passenger.setVisible(this.people.aboard && this.memory < 0);
    if (this.passenger.visible) {
      const seat = deckSeat(s.boat, 5, 1.6),
        foot = project(seat.x, seat.z),
        dir = facing(Math.sin(s.boat.heading), -Math.cos(s.boat.heading));
      this.setFrame(
        this.passenger,
        `mira-${dir}-sit-${Math.floor(visual * 2) % 2}`,
      );
      this.passenger
        .setPosition(Math.round(foot.x), Math.round(foot.y - 3))
        .setDepth(vesselDepth + 2);
    }
    for (const tree of this.trees)
      this.setFrame(tree, `tree-${Math.floor(visual) % 2}`);
    for (const image of this.covers) {
      const bounds = image.getBounds();
      image.setAlpha(
        image.depth > this.rowan.depth &&
          bounds.contains(this.rowan.x, this.rowan.y - 30)
          ? 0.42
          : 1,
      );
    }
    for (const image of this.seaFx)
      this.setFrame(
        image,
        `ripple-${(Math.floor(visual * 8) + Number(image.getData("phase"))) % 16}`,
      );
    if (
      this.water.width !== this.scale.width ||
      this.water.height !== this.scale.height
    )
      this.water.setSize(this.scale.width, this.scale.height);
    this.water.tilePositionX = Math.floor(
      this.cameras.main.scrollX + visual * 0.6,
    );
    this.water.tilePositionY = Math.floor(this.cameras.main.scrollY);
    for (const [i, bird] of this.birds.entries()) {
      const pos = project(
        40 + Math.cos(visual * 0.05 + i * 1.5) * 35,
        -110 + Math.sin(visual * 0.04 + i) * 160,
      );
      this.setFrame(bird, `gull-${Math.floor(visual * 5) % 4}`);
      bird.setPosition(Math.round(pos.x), Math.round(pos.y - 75));
    }
  }
  update(_t: number, milliseconds: number) {
    if (!this.booted) return;
    const now = performance.now();
    if (this.rawLast) {
      const raw = now - this.rawLast;
      this.samples.push(raw);
      if (raw > 50) this.stalls++;
      if (this.samples.length > 1200) this.samples.shift();
    }
    this.rawLast = now;
    const dt = Math.min(milliseconds / 1000, 0.15);
    this.elapsed += dt;
    if (!this.session.state.settings.reducedMotion) this.visualElapsed += dt;
    if (this.memory >= 0) {
      this.memoryElapsed += dt;
      if (this.memoryElapsed >= 10) {
        if (this.memory < 2) {
          this.memory++;
          this.memoryElapsed = 0;
          this.view.prologue(this.memory);
        } else this.finishMemory();
      }
    }
    let walking = false;
    const audioStatus = this.audio.metrics();
    this.view.audioStatus(audioStatus.status);
    if (
      audioStatus.error &&
      !this.view.open &&
      audioStatus.error !== this.lastAudioError
    ) {
      this.lastAudioError = audioStatus.error;
      this.view.toast(audioStatus.error, 6000);
    }
    if (!audioStatus.error) this.lastAudioError = "";
    const paused = this.view.open || !this.session.started;
    if (this.session.started)
      this.audio.update(
        this.session.state.settings,
        this.session.state.player.mode === "boat"
          ? "sailing"
          : this.session.state.player.island === "havenport"
            ? "havenport"
            : "saltglass",
        this.view.open,
        districtAt(this.session.state.player.x, this.session.state.player.z),
      );
    if (this.gangway && !paused) {
      this.gangway.age += dt;
      if (this.gangway.age >= 0.48) {
        this.gangway = undefined;
        this.locomotion.reset();
      }
    }
    if (!paused && !this.fish && !this.gangway) {
      const s = this.session.state,
        h =
          Number(this.keys.has("d") || this.keys.has("arrowright")) -
          Number(this.keys.has("a") || this.keys.has("arrowleft")),
        v =
          Number(this.keys.has("s") || this.keys.has("arrowdown")) -
          Number(this.keys.has("w") || this.keys.has("arrowup"));
      if (s.player.mode === "walk") {
        const moved = this.locomotion.update(s.player, h, v, dt);
        walking = moved.travel > 0.00001;
        if (moved.footstep && walking)
          this.audio.sfx("step", materialAt(s.player.x, s.player.z));
        this.session.checkpoint(moved.player, s.boat);
      } else {
        const waiting = s.story.outingInvited && !this.people.aboard,
          r = moveVessel(
            s.boat,
            this.speed,
            waiting ? 0 : -v,
            waiting ? 0 : h,
            dt,
          );
        this.speed = r.speed;
        this.session.checkpoint(
          { ...s.player, x: r.boat.x, z: r.boat.z, heading: r.boat.heading },
          r.boat,
        );
        if (r.blocked && this.elapsed - this.blockedToast > 6) {
          this.blockedToast = this.elapsed;
          this.view.toast(
            "Give the hull some sea room. Ease forward before turning, or E to tie up near a pier.",
          );
        }
      }
    }
    this.people.update(dt, paused, this.session.state);
    if (this.fish && !paused) {
      this.fish = tickFishing(this.fish, dt);
      if (this.fish.phase === "missed") {
        this.view.toast("The fish slipped away. There will be another bite.");
        this.cancelFishing(false);
      } else this.view.fishing(this.fish);
    }
    this.renderActors(this.elapsed, walking);
    if (this.fish) {
      const p = project(this.fishPoint.x, this.fishPoint.z);
      this.ripple
        .setVisible(true)
        .setPosition(Math.round(p.x), Math.round(p.y));
      this.setFrame(this.ripple, `ripple-${Math.floor(this.elapsed * 8) % 16}`);
      this.line
        .clear()
        .lineStyle(1, 0xd6bd87, 0.8)
        .beginPath()
        .moveTo(this.rowan.x + 5, this.rowan.y - 28)
        .lineTo(p.x, p.y)
        .strokePath();
    } else this.line.clear();
    if (this.catchEffect) {
      const c = this.catchEffect;
      c.age += dt;
      const p = project(c.position.x, c.position.z);
      this.setFrame(
        this.caughtImage,
        `fish-${c.species}-${Math.floor(c.age * 3) % 2}`,
      );
      this.caughtImage
        .setVisible(true)
        .setPosition(Math.round(p.x), Math.round(p.y - 20 - c.age * 18))
        .setAlpha(Math.max(0, 1 - c.age / 2));
      if (c.age > 2) {
        this.catchEffect = undefined;
        this.caughtImage.setVisible(false);
      }
    }
    const s = this.session.state,
      visual = s.settings.reducedMotion ? 0 : dt;
    if (
      !paused &&
      s.player.mode === "boat" &&
      this.speed > 0.7 &&
      !s.settings.reducedMotion
    ) {
      this.wakeClock += dt;
      if (this.wakeClock > 0.3) {
        this.wakeClock = 0;
        const w = this.wakes[this.wakeIndex++ % this.wakes.length],
          p = deckSeat(s.boat, -10, 0),
          screen = project(p.x, p.z);
        w.age = 0;
        w.image
          .setPosition(Math.round(screen.x), Math.round(screen.y))
          .setVisible(true);
      }
    }
    for (const w of this.wakes) {
      w.age += visual;
      if (w.age < 2) {
        this.setFrame(w.image, `ripple-${Math.min(15, Math.floor(w.age * 8))}`);
        w.image.setAlpha((1 - w.age / 2) * 0.6);
      } else w.image.setVisible(false);
    }
    if (this.session.started && !this.view.open) {
      const p = project(s.player.x, s.player.z),
        look =
          s.player.mode === "boat"
            ? project(
                Math.sin(s.boat.heading) * 5,
                -Math.cos(s.boat.heading) * 5,
              )
            : project(this.locomotion.vx * 0.22, this.locomotion.vz * 0.22),
        target = {
          x: p.x + look.x - 20,
          y:
            p.y -
            elevationAt(s.player.x, s.player.z) +
            look.y -
            Math.min(58, this.scale.height * 0.18),
        };
      const lerp = s.settings.reducedMotion ? 1 : 1 - Math.exp(-dt / 0.18);
      this.cameraPoint.x = Phaser.Math.Linear(
        this.cameraPoint.x,
        Math.abs(target.x - this.cameraPoint.x) < 3
          ? this.cameraPoint.x
          : target.x - Math.sign(target.x - this.cameraPoint.x) * 3,
        lerp,
      );
      this.cameraPoint.y = Phaser.Math.Linear(
        this.cameraPoint.y,
        Math.abs(target.y - this.cameraPoint.y) < 2
          ? this.cameraPoint.y
          : target.y - Math.sign(target.y - this.cameraPoint.y) * 2,
        lerp,
      );
      this.cameras.main.centerOn(
        Math.round(this.cameraPoint.x),
        Math.round(this.cameraPoint.y),
      );
    }
    this.hudTime += dt;
    if (this.hudTime > 0.12) {
      this.hudTime = 0;
      this.hud();
    }
    this.session.autosave();
  }
  dispose() {
    window.removeEventListener("keydown", this.nativeKeyDown);
    window.removeEventListener("keyup", this.nativeKeyUp);
    clearTimeout(this.bootTimer);
    this.audio.dispose();
  }
}
