import * as THREE from "three";
import { createWorld } from "./world/world";
import { createAvatar } from "./player/avatar";
import { createBoat } from "./boat/boat";
import { updateMovement } from "./player/movement";
import {
  initialState,
  reduce,
  type Action,
  type GameState,
  type IslandId,
} from "./state/game";
import { loadGame, saveGame } from "./state/persistence";
import { Ambience } from "./audio/ambience";
import { assets } from "./data/assets";
import "./ui/style.css";
import { createFishingView } from "./activities/fishing-view";

const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `<canvas id="sea" aria-label="Third-person sailing and island world"></canvas><div id="hud"><header><a class="wordmark" href="#">THE HOUSE<br><i>by the sea</i></a><div class="location"><span id="region">HAVENPORT</span><small>FIRST VOYAGE · LATE AFTERNOON</small></div><button id="fund" class="fund"><span>YOUR LITTLE FUTURE</span><strong id="coins">25 coins</strong></button></header><aside class="objective"><small>YOUR FIRST VOYAGE</small><p id="objective"></p><span id="distance"></span></aside><nav><button data-panel="chart">M <span>Chart</span></button><button data-panel="journal">J <span>Journal</span></button><button data-panel="pause">Esc <span>Pause</span></button></nav><div id="hint"></div><footer><span>W A S D / arrows · move & steer</span><span>Drag · look around</span><span>F · fishing</span></footer></div><div id="overlay"></div><div id="toast" role="status"></div>`;
const overlay = document.querySelector<HTMLDivElement>("#overlay")!;
const hint = document.querySelector<HTMLDivElement>("#hint")!;
let state: GameState = initialState(),
  started = false,
  panel = "",
  activeDialog = "",
  savedWarning = "",
  disposed = false,
  saveProtected = false;
let fishing: { start: number; phase: "waiting" | "bite" } | null = null,
  catches = 0,
  toastUntil = 0,
  lastSave = 0;
const keys = new Set<string>();
const audio = new Ambience();
const scene = new THREE.Scene();
scene.background = new THREE.Color("#a9d5d4");
scene.fog = new THREE.Fog("#aecfcd", 130, 490);
function fatalRenderError() {
  app.innerHTML =
    '<div class="fatal"><h1>The harbour needs WebGL2.</h1><p>Enable hardware acceleration in your browser, then reload to begin. Your saved voyage is kept.</p><button onclick="location.reload()">Try again</button></div>';
}
let renderer: THREE.WebGLRenderer;
try {
  renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector<HTMLCanvasElement>("#sea")!,
    antialias: true,
    powerPreference: "high-performance",
  });
} catch (error) {
  fatalRenderError();
  throw error;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
const camera = new THREE.PerspectiveCamera(
  48,
  innerWidth / innerHeight,
  0.1,
  650,
);
scene.add(new THREE.HemisphereLight("#cce9ed", "#557056", 2.7));
const sun = new THREE.DirectionalLight("#ffdfa3", 3.4);
sun.position.set(-70, 110, 45);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -100;
sun.shadow.camera.right = 100;
sun.shadow.camera.top = 100;
sun.shadow.camera.bottom = -100;
sun.shadow.camera.far = 260;
sun.shadow.bias = -0.001;
scene.add(sun);
let orbit = 0.8,
  pitch = 0.48,
  drag = false,
  lastMouseX = 0,
  lastMouseY = 0;
const canvas = renderer.domElement;
canvas.addEventListener("pointerdown", (e) => {
  if (panel) return;
  drag = true;
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener("pointermove", (e) => {
  if (drag) {
    orbit -= (e.clientX - lastMouseX) * 0.006;
    pitch = THREE.MathUtils.clamp(
      pitch + (e.clientY - lastMouseY) * 0.003,
      0.2,
      1.05,
    );
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  }
});
canvas.addEventListener("pointerup", () => (drag = false));
function resize() {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}
addEventListener("resize", resize);
resize();
function toast(message: string) {
  document.querySelector("#toast")!.textContent = message;
  toastUntil = performance.now() + 4500;
}
function dispatch(action: Action) {
  state = reduce(state, action);
  updateHUD();
  void persist();
}
let saveQueue = Promise.resolve();
function persist() {
  if (saveProtected) return Promise.resolve();
  const snapshot = structuredClone(state);
  saveQueue = saveQueue
    .then(() => saveGame(snapshot))
    .then(() => {
      lastSave = performance.now();
    })
    .catch(() => {
      savedWarning =
        "Saving is unavailable. This session still works; progress may not survive refresh.";
      toast(savedWarning);
    });
  return saveQueue;
}
function button(label: string, fn: () => void, secondary = false) {
  const b = document.createElement("button");
  b.textContent = label;
  if (secondary) b.className = "secondary";
  b.onclick = fn;
  document.querySelector("#actions")!.append(b);
  return b;
}
function modal(eyebrow: string, title: string, body: string) {
  keys.clear();
  fishing = null;
  overlay.innerHTML = `<section class="card" role="dialog" aria-modal="true" aria-label="${title}"><small>${eyebrow}</small><h1>${title}</h1><div class="body">${body}</div><div id="actions"></div></section>`;
  overlay.classList.add("open");
  setTimeout(
    () => overlay.querySelector<HTMLButtonElement>("button")?.focus(),
    0,
  );
}
function close() {
  panel = "";
  activeDialog = "";
  overlay.classList.remove("open");
  overlay.innerHTML = "";
  keys.clear();
}
function showTitle() {
  panel = "title";
  modal(
    "AN UNHURRIED ADVENTURE",
    "A little boat.<br>A whole new life.",
    `<p>For years, the sea was something Rowan watched from the shore. Today, the boat at the end of the pier is his.</p><p>Two islands. Honest work. Someone worth coming home to.</p><div class="title-rule">THE FIRST VOYAGE <span>10–15 MINUTES · KEYBOARD & MOUSE</span></div>${savedWarning ? `<p>${savedWarning}</p>` : ""}`,
  );
  button(
    state.story.prologueSeen ? "Continue your voyage" : "Begin your voyage",
    () => {
      started = true;
      if (saveProtected) {
        toast(
          "Existing unreadable save preserved. This voyage runs without saving.",
        );
      }
      audio.start(state.settings.muted ? 0 : state.settings.volume);
      if (!state.story.prologueSeen) showMemory();
      else close();
    },
  );
  button("Credits & provenance", () => showPanel("credits"), true);
}
function showMemory() {
  panel = "memory";
  modal(
    "HAVENPORT · MANY SUMMERS AGO",
    "“One day, that’ll be me.”",
    `<p>The boy sat on the harbour wall until the fishing boats became tiny marks on the horizon.</p><p>He saved the picture in his mind. Years of ordinary work later, he has saved enough for the real thing.</p><p class="quote">Your boat is small. Your days are finally your own.</p>`,
  );
  button("Step into the afternoon", () => {
    dispatch({ type: "FINISH_PROLOGUE" });
    close();
    toast("Welcome home, Rowan. Find Harbourmaster Ellis by the pier.");
  });
  button(
    "Skip memory",
    () => {
      dispatch({ type: "FINISH_PROLOGUE" });
      close();
    },
    true,
  );
}
function showPanel(which: string) {
  panel = which;
  if (which === "chart") {
    modal(
      "YOUR POCKET CHART",
      "A small stretch of sea",
      `<div class="chart"><div class="island haven">Havenport<br><small>Market · home harbour</small></div><div class="sea-route">~ 1 minute by boat<br>↑ N · 220 m</div><div class="island salt">Saltglass Bay<br><small>${state.discoveries.includes("saltglass-bay") ? "Fisher · shell arch" : "A sheltered cove to discover"}</small></div><span class="chart-you">You: ${state.player.mode === "boat" ? "at sea" : state.player.island === "havenport" ? "Havenport" : "Saltglass Bay"}</span></div><p>Both docks sit on the <b>east coast</b> (x 62). Sail north for Saltglass, south to return. Compass: W/↑ forward; A/D steer. Ten more islands belong to a later chapter.</p>`,
    );
  } else if (which === "journal") {
    modal(
      "NOTES FROM THE AFTERNOON",
      "The first of many voyages",
      `<ul class="journal"><li>${state.delivery === "complete" ? "✓ Parcel delivered · 120 coins earned" : state.delivery === "active" ? "○ Deliver Ellis’s parcel to Nessa at Saltglass" : "○ Meet Ellis and take a harbour delivery"}</li><li>${state.story.metMira ? "✓ Met Mira, coastal illustrator" : "○ Say hello to Mira by the waterfront"}</li><li>${state.discoveries.includes("saltglass-bay") ? "✓ Walked the shores of Saltglass Bay" : "○ Discover Saltglass Bay"}</li><li>${state.story.outingComplete ? "✓ A shared afternoon · Mira sketched the shell arch" : state.story.outingInvited ? "○ Take Mira to Saltglass, then return home" : "○ An optional invitation for Mira"}</li><li>${state.story.homeSeen ? "✓ Found the beach plot notice" : "○ Visit the beach plot beside the harbour"}</li></ul><p>In your creel: ${state.inventory.sardine} sardine · ${state.inventory.bream} bream.</p><p>Home fund: <b>${state.wallet} / 500 coins</b>. ${state.wallet >= 150 ? "Your first meaningful savings milestone is reached." : "A delivery and a few catches will make a beginning."} The cottage belongs to a future chapter.</p>`,
    );
  } else if (which === "fund") {
    modal(
      "SOMETHING TO COME HOME TO",
      "A place by the water",
      `<p>Just beyond Havenport, a small beach plot looks out over the channel. No grand house. Room for a porch, a table, and two mugs.</p><div class="big-number">${state.wallet}<small> / 500 coins</small></div><progress value="${Math.min(state.wallet, 500)}" max="500"></progress><p>${state.wallet >= 150 ? "First milestone reached: you’ve made a real start." : "First milestone: save 150 coins. Deliveries and fish sales count toward your future."}</p><p>Mira has a future of her own. A home is a conversation, never a way to buy someone’s affection.</p>`,
    );
  } else if (which === "credits") {
    modal(
      "MADE WITH CARE",
      "Credits & provenance",
      `<p>Three.js · MIT. Vite · MIT. ProceduralTerrains · MIT (authoring and finite terrain comparison).</p>${assets.map((a) => `<p><b>${a.id}</b> · ${a.credit}<br><a href="${a.source}" target="_blank" rel="noopener">Source</a> · ${a.license}<br><small>${a.modified}</small></p>`).join("")}<p>Additional geometry, characters, interface and synthesised sea ambience: original project work. No recorded music. Procedural motion is authored for this experience.</p><p>First Voyage · v0.1.0 · Stage 0 + 1 approval build</p>`,
    );
  } else {
    panel = "pause";
    modal(
      "TAKE YOUR TIME",
      "A moment ashore",
      `<p>WASD / arrows: walk or steer · drag: orbit camera · E: interact / dock · F: fish · Space: reel · M: chart · J: journal · Esc: pause or close.</p><label class="setting"><input id="muted" type="checkbox" ${state.settings.muted ? "checked" : ""}> Mute sea ambience</label><label class="setting">Volume <input id="volume" type="range" min="0" max="1" step="0.05" value="${state.settings.volume}"></label><p id="save-status">${savedWarning || "Autosaved at each meaningful moment."}</p><small>First Voyage · v0.1.0</small>`,
    );
    document.querySelector<HTMLInputElement>("#muted")!.onchange = (e) => {
      dispatch({
        type: "SETTINGS",
        settings: {
          ...state.settings,
          muted: (e.target as HTMLInputElement).checked,
        },
      });
      audio.setVolume(state.settings.muted ? 0 : state.settings.volume);
    };
    document.querySelector<HTMLInputElement>("#volume")!.oninput = (e) => {
      dispatch({
        type: "SETTINGS",
        settings: {
          ...state.settings,
          volume: Number((e.target as HTMLInputElement).value),
        },
      });
      audio.setVolume(state.settings.muted ? 0 : state.settings.volume);
    };
    button("Save voyage", () => {
      void persist().then(() => toast(savedWarning || "Voyage safely saved."));
    });
    button("Return to safe island dock", () => {
      dispatch({ type: "RECOVER" });
      close();
      toast("Back at the island dock. Your earnings and memories are safe.");
    });
    button("Credits & provenance", () => showPanel("credits"), true);
  }
  button(
    started ? "Return to the afternoon" : "Back",
    () => {
      if (started) close();
      else showTitle();
    },
    true,
  );
}

type Point = {
  id: string;
  name: string;
  x: number;
  z: number;
  island: IslandId;
};
const points: Point[] = [
  {
    id: "ellis",
    name: "Ellis · harbourmaster",
    x: 43,
    z: 5,
    island: "havenport",
  },
  {
    id: "mira",
    name: "Mira · coastal illustrator",
    x: 35,
    z: -12,
    island: "havenport",
  },
  {
    id: "seller",
    name: "Tomas · fish market",
    x: 30,
    z: 15,
    island: "havenport",
  },
  { id: "home", name: "Beach plot notice", x: 22, z: -31, island: "havenport" },
  {
    id: "nessa",
    name: "Nessa · Saltglass fisher",
    x: 45,
    z: -216,
    island: "saltglass-bay",
  },
  {
    id: "landmark",
    name: "The shell arch",
    x: 23,
    z: -243,
    island: "saltglass-bay",
  },
];
function distance(x: number, z: number) {
  return Math.hypot(state.player.x - x, state.player.z - z);
}
function nearby(): Point | undefined {
  return points
    .filter((p) => p.island === state.player.island && distance(p.x, p.z) < 5)
    .sort((a, b) => distance(a.x, a.z) - distance(b.x, b.z))[0];
}
function dockNear() {
  return (["havenport", "saltglass-bay"] as IslandId[]).find(
    (id) =>
      Math.hypot(
        state.boat.x - 62,
        state.boat.z - (id === "havenport" ? 0 : -220),
      ) < 15,
  );
}
function interact() {
  if (panel || fishing) return;
  if (state.player.mode === "boat") {
    const dock = dockNear();
    if (dock) {
      const z = dock === "havenport" ? 0 : -220;
      state.boat = { x: 62, z, heading: 0, docked: dock };
      state.player = {
        x: 55,
        z,
        heading: Math.PI / 2,
        mode: "walk",
        island: dock,
      };
      dispatch({ type: "VISIT_ISLAND", island: dock });
      toast(
        `Safely tied up at ${dock === "havenport" ? "Havenport" : "Saltglass Bay"}. E to reboard at the pier.`,
      );
    } else toast("Approach either east-coast pier to tie up safely.");
    return;
  }
  const point = nearby();
  if (point) {
    talk(point);
    return;
  }
  if (
    Math.hypot(state.player.x - state.boat.x, state.player.z - state.boat.z) <
    12
  ) {
    state.player.mode = "boat";
    state.player.x = state.boat.x;
    state.player.z = state.boat.z;
    state.boat.docked = null;
    void persist();
    toast(
      "Your boat, your afternoon. W to sail; A/D to steer. E near a pier to dock.",
    );
  }
}
function talk(p: Point) {
  panel = "dialogue";
  activeDialog = p.id;
  if (p.id === "ellis") {
    modal(
      "ELLIS · HARBOURMASTER",
      "“She’s finally yours, then.”",
      `<p>“I remember you watching these boats when you were knee-high. Take it slowly. The sea isn’t going anywhere.”</p><p>${state.delivery === "available" ? "“Nessa over at Saltglass is waiting for these net needles. Head north along the channel, tie up at her east pier. A hundred and twenty coins for the trouble.”" : state.delivery === "active" ? "“Nessa’s by the Saltglass pier. North along the channel. The chart will keep you straight.”" : "“Nessa sent word. Good work, Rowan. Honest journeys add up.”"}</p>`,
    );
    if (state.delivery === "available")
      button("Take the parcel · 120 coins", () => {
        dispatch({ type: "ACCEPT_DELIVERY" });
        close();
        toast("Parcel aboard. Saltglass Bay lies north, 220 metres away.");
      });
  }
  if (p.id === "mira") {
    dispatch({ type: "MEET_MIRA" });
    modal(
      "MIRA · COASTAL ILLUSTRATOR",
      state.story.outingComplete
        ? "“I caught the light, finally.”"
        : "“The coast looks different from the water.”",
      `<p>${state.story.outingComplete ? "“The shell arch was worth the wind in my sketchbook. Next time I’d like to stay until the shadows reach the tide pools.”" : "“I’m drawing the working coast for a small exhibition. Everyone paints the sunsets. I want the nets, the chipped paint, the people.”"}</p><p>${state.story.outingInvited && !state.story.outingComplete ? "“I’ve got my sketchbook. Let’s see Saltglass, and be back before the café closes.”" : "“That patch of beach would make a lovely place to wake up. But I have a show to finish first. One dream at a time, yes?”"}</p>`,
    );
    if (!state.story.outingInvited && !state.story.outingComplete)
      button("Invite Mira to sketch Saltglass", () => {
        dispatch({ type: "INVITE_MIRA" });
        close();
        toast(
          "Mira will join you aboard. Visit Saltglass together and return to Havenport.",
        );
      });
    if (
      state.story.outingVisitedSaltglass &&
      !state.story.outingComplete &&
      state.player.island === "havenport"
    )
      button("Share the memory of the crossing", () => {
        dispatch({ type: "COMPLETE_OUTING" });
        close();
        toast(
          "A shared memory: Mira’s Saltglass sketch. Your journal remembers.",
        );
      });
    button("Another afternoon, perhaps", close, true);
  }
  if (p.id === "nessa") {
    modal(
      "NESSA · SALTGLASS FISHER",
      "“A new sail in the channel.”",
      `<p>“Welcome to Saltglass. Follow the path to the shell arch when you’ve a moment. Water did all that carving, without a single plan.”</p><p>${state.delivery === "active" ? "“Those net needles are just what we needed. Ellis has paid your delivery into the harbour book.”" : state.delivery === "complete" ? "“The parcel’s safely stowed. Thank you again.”" : "“You can cast from the pier. Wait for a bite, then press Space while the line is lively. F cancels. Sardines and sea bream both come into the shallows.”"}</p>`,
    );
    if (state.delivery === "active")
      button("Hand over the parcel · receive 120 coins", () => {
        dispatch({ type: "DELIVER_PARCEL" });
        close();
        toast("Delivery complete. +120 coins. A real start to the home fund.");
      });
    button("Sell my catch", () => {
      const old = state.wallet;
      dispatch({ type: "SELL_FISH" });
      close();
      toast(
        state.wallet > old
          ? `Catch sold · +${state.wallet - old} coins.`
          : "Your creel is empty. Fish from the pier with F.",
      );
    });
  }
  if (p.id === "seller") {
    modal(
      "TOMAS · FISH MARKET",
      "“Anything fresh today?”",
      `<p>“Eighteen coins for a sardine, thirty-two for a sea bream. Keep a little for supper if you like.”</p><p>Your creel: ${state.inventory.sardine} sardines · ${state.inventory.bream} sea bream.</p>`,
    );
    button("Sell the catch", () => {
      const old = state.wallet;
      dispatch({ type: "SELL_FISH" });
      close();
      toast(
        state.wallet > old
          ? `Fresh fish sold · +${state.wallet - old} coins.`
          : "Empty creel. Try the pier or cast from your boat.",
      );
    });
  }
  if (p.id === "home") {
    dispatch({ type: "SEE_HOME" });
    showPanel("fund");
    return;
  }
  if (p.id === "landmark") {
    modal(
      "SALTGLASS BAY · THE SHELL ARCH",
      "The sea takes its time.",
      `<p>Shells are pressed into the pale stone. Below, small silver fish turn in the clear water.</p><p>${state.story.outingInvited ? "Mira settles onto a sun-warmed rock. “Just five minutes. I want to remember this curve.” A shared sketch takes shape." : "A good place to bring someone with a sketchbook. Or to sit for a while yourself."}</p>`,
    );
  }
  button("Until later", close, true);
}
function fish() {
  if (panel) return;
  if (fishing) {
    fishing = null;
    toast("Line reeled in. You can always try again.");
    return;
  }
  if (
    state.player.mode !== "boat" &&
    !(
      state.player.x > 49 &&
      Math.abs(
        state.player.z - (state.player.island === "havenport" ? 0 : -220),
      ) < 12
    )
  ) {
    toast("Fish from your boat or the end of either pier.");
    return;
  }
  keys.clear();
  fishing = { start: performance.now(), phase: "waiting" };
  toast("Line cast. Watch the float… Space when a fish bites. F to cancel.");
}
function reel() {
  if (!fishing) return;
  if (fishing.phase === "bite") {
    const species = catches++ % 2 === 0 ? "sardine" : "bream";
    dispatch({ type: "CATCH_FISH", fish: species });
    toast(
      `Caught a ${species === "bream" ? "sea bream" : "silver sardine"}! Safely in your creel. Sell to Tomas or Nessa.`,
    );
  } else toast("A little too soon. Try another cast with F.");
  fishing = null;
}
function updateHUD() {
  document.querySelector("#coins")!.textContent = `${state.wallet} coins`;
  document.querySelector("#objective")!.textContent =
    state.delivery === "available"
      ? "Meet Ellis beside the harbour pier."
      : state.delivery === "active"
        ? "Carry the parcel north to Nessa, at Saltglass Bay."
        : !state.story.outingComplete
          ? "A good day’s work. Fish, explore, or invite Mira along."
          : "A voyage worth remembering. Visit the beach plot and your journal.";
  document.querySelector("#region")!.textContent =
    state.player.mode === "boat"
      ? "THE SALTGLASS CHANNEL"
      : state.player.island === "havenport"
        ? "HAVENPORT"
        : "SALTGLASS BAY";
  document.querySelector("#distance")!.textContent =
    state.delivery === "active"
      ? `${Math.round(Math.hypot(state.player.x - 62, state.player.z + 220))} m to Saltglass pier · north ↑`
      : "Home fund · first milestone 150 coins";
}
function updateHint(now: number) {
  if (panel || !started) {
    hint.textContent = "";
    return;
  }
  if (fishing) {
    if (now - fishing.start > 2800 && fishing.phase === "waiting")
      fishing.phase = "bite";
    if (now - fishing.start > 6500) {
      fishing = null;
      toast("The fish slipped away. No harm done. F to try again.");
    }
    hint.innerHTML = fishing
      ? fishing.phase === "bite"
        ? '<kbd>SPACE</kbd> A bite! Reel it in <span class="bite">●</span>'
        : "Watching the float… <small>F to cancel</small>"
      : "";
    return;
  }
  if (state.player.mode === "boat") {
    hint.innerHTML = dockNear()
      ? "<kbd>E</kbd> Tie up & step ashore"
      : "<kbd>F</kbd> Cast a line <span>· W sail · S slow/reverse · A/D steer</span>";
    return;
  }
  const p = nearby();
  hint.innerHTML = p
    ? `<kbd>E</kbd> ${p.name}`
    : Math.hypot(state.player.x - state.boat.x, state.player.z - state.boat.z) <
        12
      ? "<kbd>E</kbd> Board your boat"
      : state.player.x > 49
        ? "<kbd>F</kbd> Fish from the pier"
        : "";
}
addEventListener("keydown", (e) => {
  if (e.key === "Tab" && panel) {
    const focusable = Array.from(
      overlay.querySelectorAll<HTMLElement>("button,a[href],input"),
    );
    const first = focusable[0],
      last = focusable[focusable.length - 1];
    if (first && e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (
      first &&
      (!overlay.contains(document.activeElement) ||
        (!e.shiftKey && document.activeElement === last))
    ) {
      e.preventDefault();
      first.focus();
    }
    return;
  }
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key))
    e.preventDefault();
  if (e.repeat) return;
  const key = e.key.toLowerCase();
  if (key === "escape") {
    if (panel === "title") return;
    if (!started) {
      showTitle();
      return;
    }
    if (panel === "memory") dispatch({ type: "FINISH_PROLOGUE" });
    if (panel) close();
    else showPanel("pause");
    return;
  }
  if (panel) return;
  keys.add(key);
  if (key === "e") interact();
  if (key === "f") fish();
  if (key === " ") reel();
  if (key === "m") showPanel("chart");
  if (key === "j") showPanel("journal");
});
addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));
addEventListener("blur", () => {
  keys.clear();
  if (started && !panel) showPanel("pause");
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    keys.clear();
    void persist();
  }
});
document
  .querySelectorAll<HTMLButtonElement>("[data-panel]")
  .forEach((b) => (b.onclick = () => showPanel(b.dataset.panel!)));
document.querySelector<HTMLButtonElement>("#fund")!.onclick = () =>
  showPanel("fund");

async function boot() {
  try {
    const result = await loadGame();
    state = result.state ?? initialState();
    savedWarning = result.warning ?? "";
    saveProtected = !!result.warning && !result.state;
    const world = await createWorld(scene);
    const fishingView = createFishingView(scene);
    const avatar = createAvatar(scene);
    const boat = createBoat(scene);
    const companion = createAvatar(scene, {
      shirt: 0xb7604d,
      trousers: 0x415f62,
      hair: 0x382a24,
    });
    companion.root.scale.setScalar(0.95);
    const npcs = points
      .filter((p) => ["ellis", "mira", "seller", "nessa"].includes(p.id))
      .map((p, i) => {
        const model = createAvatar(scene, {
          shirt: [0x436c7a, 0xb7604d, 0x73835b, 0xc59c55][i],
          hair: [0x6b665b, 0x382a24, 0x46352a, 0x42332b][i],
        });
        model.root.position.set(p.x, world.groundHeight(p.x, p.z) ?? 1, p.z);
        model.root.rotation.y = i;
        return { p, model };
      });
    let previous = performance.now(),
      elapsed = 0;
    const samples: number[] = [];
    const target = new THREE.Vector3();
    camera.position.set(72, 20, 27);
    updateHUD();
    showTitle();
    function frame(now: number) {
      if (disposed) return;
      const dt = Math.min((now - previous) / 1000, 0.045);
      samples.push(now - previous);
      if (samples.length > 3600) samples.shift();
      previous = now;
      elapsed += dt;
      let movement = { moving: false, speed: 0, boundary: false };
      if (started && !panel && !fishing) {
        movement = updateMovement(
          state,
          {
            forward:
              (keys.has("w") || keys.has("arrowup") ? 1 : 0) -
              (keys.has("s") || keys.has("arrowdown") ? 1 : 0),
            turn:
              (keys.has("d") || keys.has("arrowright") ? 1 : 0) -
              (keys.has("a") || keys.has("arrowleft") ? 1 : 0),
          },
          dt,
          world,
        );
        if (movement.boundary && now > toastUntil)
          toast("Open water ends here. Turn back toward the island lights.");
        if (now - lastSave > 5000) void persist();
      }
      world.update(dt, elapsed);
      avatar.root.visible = true;
      if (state.player.mode === "boat") {
        const h = state.boat.heading;
        avatar.root.position.set(
          state.boat.x - Math.cos(h) * 0.45 - Math.sin(h) * 1.8,
          1.05,
          state.boat.z - Math.sin(h) * 0.45 + Math.cos(h) * 1.8,
        );
      } else
        avatar.root.position.set(
          state.player.x,
          world.groundHeight(state.player.x, state.player.z) ?? 1.5,
          state.player.z,
        );
      avatar.root.rotation.y = -state.player.heading;
      avatar.update(
        dt,
        elapsed,
        state.player.mode === "walk" && movement.moving,
      );
      boat.root.position.set(state.boat.x, 0.2, state.boat.z);
      boat.root.rotation.y = -state.boat.heading;
      boat.update(dt, elapsed, movement.speed);
      companion.root.visible =
        state.story.outingInvited &&
        !state.story.outingComplete &&
        state.player.mode === "boat";
      companion.root.position.set(
        state.boat.x +
          Math.cos(state.boat.heading) * 0.55 -
          Math.sin(state.boat.heading) * 0.9,
        1.05,
        state.boat.z +
          Math.sin(state.boat.heading) * 0.55 +
          Math.cos(state.boat.heading) * 0.9,
      );
      companion.root.rotation.y = -state.boat.heading;
      companion.update(dt, elapsed, false);
      for (const n of npcs) {
        n.model.root.visible = !(n.p.id === "mira" && companion.root.visible);
        n.model.update(dt, elapsed, false);
      }
      const isBoat = state.player.mode === "boat",
        radius = isBoat ? 23 : 16;
      target.set(state.player.x, isBoat ? 1 : 2.2, state.player.z);
      const desired = new THREE.Vector3(
        target.x + Math.sin(orbit) * radius * Math.cos(pitch),
        target.y + radius * Math.sin(pitch),
        target.z + Math.cos(orbit) * radius * Math.cos(pitch),
      );
      camera.position.lerp(desired, 1 - Math.exp(-dt * 5));
      camera.position.y = Math.max(
        camera.position.y,
        (world.groundHeight(camera.position.x, camera.position.z) ?? 0) + 2,
      );
      camera.lookAt(target);
      fishingView.update(
        !!fishing,
        state.player.x,
        state.player.mode === "boat"
          ? 1
          : (world.groundHeight(state.player.x, state.player.z) ?? 1.6),
        state.player.z,
        elapsed,
        fishing?.phase === "bite",
      );
      renderer.render(scene, camera);
      updateHint(now);
      if (now > toastUntil) document.querySelector("#toast")!.textContent = "";
      if (Math.floor(elapsed * 2) !== Math.floor((elapsed - dt) * 2))
        updateHUD();
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    // Read-only diagnostics: browser tests must move and interact through real input.
    Object.defineProperty(window, "voyage", {
      value: {
        getState: () => structuredClone(state),
        metrics: () => ({
          frames: samples.length,
          p50: percentile(samples, 0.5),
          p95: percentile(samples, 0.95),
          drawCalls: renderer.info.render.calls,
          triangles: renderer.info.render.triangles,
          webgl: renderer.getContext() instanceof WebGL2RenderingContext,
          viewport: [innerWidth, innerHeight],
        }),
      },
    });
    addEventListener("pagehide", () => {
      void persist();
      disposed = true;
      world.dispose();
      fishingView.dispose();
      avatar.dispose();
      boat.dispose();
      companion.dispose();
      npcs.forEach((n) => n.model.dispose());
      audio.dispose();
      renderer.dispose();
    });
  } catch (error) {
    console.error(error);
    panel = "error";
    modal(
      "THE VOYAGE NEEDS A MOMENT",
      "We couldn’t open the harbour.",
      `<p>${String(error).replace(/[<>]/g, "")}</p><p>Check that WebGL2 is available, then reload. Your saved progress remains in this browser.</p>`,
    );
    button("Try again", () => location.reload());
  }
}
function percentile(values: number[], q: number) {
  const sorted = [...values].sort((a, b) => a - b);
  return Number((sorted[Math.floor(sorted.length * q)] ?? 0).toFixed(2));
}
void boot();
