import { DialogueView, type PortraitFrame } from "./dialogue-view";
import { DEFAULT_SETTINGS } from "../data/navigation";
import type { GameState } from "../state/game";
import type { Session } from "../game/session";
import type { Dialogue } from "../game/dialogue";
import type { FishingState } from "../activities/fishing";
import { homeFund } from "../state/game";
import { MAPS } from "../world/world";
import { project } from "../world/projection";
export const escapeHTML = (s: unknown) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export class View {
  panel: string | null = "loading";
  onAction: (action: string, value?: string) => void = () => {};
  onOpen: () => void = () => {};
  private root = document.querySelector<HTMLDivElement>("#ui")!;
  private modal!: HTMLDivElement;
  private focusBefore: Element | null = null;
  private toastTimer = 0;
  private fishPhase = "";
  private dialogueView!: DialogueView;
  private currentSettings = { ...DEFAULT_SETTINGS };
  private lastPlace = "";
  constructor() {
    this.root.innerHTML = `<header id="hud"><div class="place"><span id="place">HAVENPORT</span><small id="where">An unhurried afternoon</small></div><button class="fund" data-action="home" aria-label="Home fund"><span class="coin-icon" aria-hidden="true">●</span><b id="coins">25</b></button></header><aside class="objective"><p id="objective"></p><span id="save-status" role="status"></span></aside><div class="warning" id="warning" role="alert" hidden></div><div class="context" id="context"></div><section id="fishing" class="fishing" aria-live="polite" hidden></section><div id="toast" class="toast" role="status" hidden></div><footer><button data-action="fish" aria-label="F · Fishing" title="F · Fishing"><i class="icon icon-rod" aria-hidden="true"></i></button><button data-action="chart" aria-label="M · Chart" title="M · Chart"><i class="icon icon-chart" aria-hidden="true"></i></button><button data-action="journal" aria-label="J · Journal" title="J · Journal"><i class="icon icon-book" aria-hidden="true"></i></button><button data-action="pause" aria-label="Esc · Pause" title="Esc · Pause"><i class="icon icon-menu" aria-hidden="true"></i></button></footer><div id="cover" class="cover"><section id="panel" class="panel" role="dialog" aria-modal="true" aria-labelledby="panel-title" tabindex="-1"></section></div>`;
    this.modal = this.root.querySelector<HTMLDivElement>("#panel")!;
    this.dialogueView = new DialogueView((action) => this.onAction(action));
    this.root.addEventListener("click", (event) => {
      const b = (event.target as HTMLElement).closest<HTMLElement>(
        "[data-action]",
      );
      if (b && !b.hasAttribute("disabled")) this.onAction(b.dataset.action!);
    });
    this.root.addEventListener("input", (event) => {
      const input = event.target as HTMLInputElement;
      if (input.dataset.setting)
        this.onAction(
          input.dataset.setting,
          input.type === "checkbox" ? String(input.checked) : input.value,
        );
    });
    this.modal.addEventListener("keydown", (event) => {
      const nodes = [
        ...this.modal.querySelectorAll<HTMLElement>(
          "button:not(:disabled),input,a[href]",
        ),
      ];
      if (!nodes.length) return;
      if (event.key === "Tab") {
        const first = nodes[0],
          last = nodes.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
      if (
        (event.key === "ArrowDown" || event.key === "ArrowUp") &&
        !(event.target instanceof HTMLInputElement)
      ) {
        event.preventDefault();
        const i = nodes.indexOf(document.activeElement as HTMLElement),
          next =
            (i + (event.key === "ArrowDown" ? 1 : -1) + nodes.length) %
            nodes.length;
        nodes[next].focus();
      }
    });
  }
  get open() {
    return this.panel !== null;
  }
  private button(
    label: string,
    action: string,
    secondary = false,
    disabled = false,
  ) {
    return `<button data-action="${action}" class="${secondary ? "secondary" : ""}" ${disabled ? "disabled" : ""}>${escapeHTML(label)}</button>`;
  }
  private show(
    kind: string,
    title: string,
    body: string,
    buttons: string,
    eyebrow = "THE HOUSE BY THE SEA",
  ) {
    if (!this.open) this.focusBefore = document.activeElement;
    this.dialogueView.hide();
    this.panel = kind;
    this.onOpen();
    this.root.querySelector<HTMLElement>("#cover")!.hidden = false;
    for (const e of this.root.querySelectorAll<HTMLElement>(
      "header,footer,.context",
    ))
      e.inert = true;
    this.modal.dataset.panel = kind;
    this.modal.innerHTML = `<small class="eyebrow">${eyebrow}</small><h1 id="panel-title">${title}</h1><div class="panel-body">${body}</div><div class="actions">${buttons}</div>`;
    this.modal.scrollTop = 0;
    (
      this.modal.querySelector<HTMLElement>("button:not(:disabled),input,a") ??
      this.modal
    ).focus();
  }
  close() {
    this.dialogueView.hide();
    this.panel = null;
    this.root.querySelector<HTMLElement>("#cover")!.hidden = true;
    for (const e of this.root.querySelectorAll<HTMLElement>(
      "header,footer,.context",
    ))
      e.inert = false;
    if (this.focusBefore instanceof HTMLElement && this.focusBefore.isConnected)
      this.focusBefore.focus();
    else document.querySelector<HTMLCanvasElement>("canvas")?.focus();
  }
  loading() {
    this.show(
      "loading",
      "The tide is coming in…",
      "<p>Opening your little corner of the coast.</p>",
      "",
    );
  }
  error(message: string) {
    this.show(
      "error",
      "The coast could not load",
      `<p>${escapeHTML(message)}</p><p>Your saved voyage is kept.</p>`,
      this.button("Try again", "retry"),
    );
  }
  title(session: Session) {
    this.show(
      "title",
      "A little boat.<br>A whole new life.",
      `<p>For years, the sea was something Rowan watched from the shore. Today, the boat at the end of the pier is his.</p><p>Two islands. Honest work. Someone worth coming home to.</p><p class="minor">An unhurried First Voyage · keyboard & mouse</p>${session.warning ? `<p class="notice">${escapeHTML(session.warning)} ${session.protectedSave ? "This temporary voyage will not overwrite it." : ""}</p>` : ""}`,
      this.button(
        session.protectedSave
          ? "Play a temporary voyage"
          : session.existing
            ? "Continue voyage"
            : "Begin your voyage",
        "begin",
      ) +
        (!session.existing && !session.protectedSave
          ? this.button("Import original voyage", "import", true)
          : "") +
        this.button("Credits & provenance", "credits", true),
    );
  }
  prologue(index: number) {
    const cards = [
      [
        "“One day, that’ll be me.”",
        "The boy sat on the harbour wall until the fishing boats became small marks on the horizon. He knew their colours before he knew their names.",
        "He saved the picture in his mind: a sail, a wake, a whole afternoon with no road telling him where to go.",
      ],
      [
        "A little at a time.",
        "Years of ordinary work followed. Paint on his sleeves. Long walks home. A little money put aside whenever there was a little to spare.",
        "The dream changed shape, but it never quite went away. A small boat would do. Something sound, something his.",
      ],
      [
        "The days are finally his.",
        "Now the key is in his pocket. The lines are tied neatly at the end of the pier. Ellis has work across the water, and someone in town is drawing the coast.",
        "There is no grand adventure waiting to be announced. Only the sea, and a good place to begin.",
      ],
    ];
    const [title, a, b] = cards[index];
    this.show(
      "prologue",
      title,
      `<p>${a}</p><p>${b}</p><p class="minor">${index + 1} of 3 · a childhood memory</p>`,
      this.button(
        index === 2 ? "Step into the afternoon" : "Continue the memory",
        "memory-next",
      ) + this.button("Skip memory", "memory-skip", true),
      "HAVENPORT · MANY SUMMERS AGO",
    );
  }
  audioStatus(message: string) {
    const e = this.root.querySelector("#audio-status");
    if (e) e.textContent = message;
  }
  configurePortraits(frames: PortraitFrame[]) {
    this.dialogueView.configure(frames);
  }
  advanceDialogue() {
    this.dialogueView.next();
  }
  dialogue(source: Dialogue | Omit<Dialogue, "beats">) {
    const d: Dialogue =
      "beats" in source
        ? source
        : {
            ...source,
            beats: source.paragraphs.map((text) => ({
              speakerId: source.speaker.toLowerCase(),
              expressionId: "happy",
              text,
            })),
          };
    if (!this.open) this.focusBefore = document.activeElement;
    this.panel = "dialogue";
    this.onOpen();
    this.root.querySelector<HTMLElement>("#cover")!.hidden = true;
    for (const e of this.root.querySelectorAll<HTMLElement>(
      "header,footer,.context",
    ))
      e.inert = true;
    this.dialogueView.show(d, this.currentSettings);
  }
  pause(session: Session) {
    this.show(
      "pause",
      "A moment on the shore",
      `<p>Your voyage is paused. Take your time.</p><p class="minor">${session.warning ? escapeHTML(session.warning) : "Progress saves as you go. You can also save here before leaving."}</p>`,
      this.button("Resume voyage", "close") +
        this.button(
          session.saving ? "Saving…" : "Save voyage",
          "save",
          true,
          session.protectedSave || session.saving,
        ) +
        this.button("Settings & controls", "settings", true) +
        this.button("Return to the pier", "recover", true) +
        this.button("Credits & provenance", "credits", true),
    );
  }
  settings(s: GameState) {
    this.currentSettings = s.settings;
    this.show(
      "settings",
      "Make yourself comfortable",
      `<label class="setting"><span>Sound off</span><input type="checkbox" data-setting="muted" ${s.settings.muted ? "checked" : ""}></label><label class="setting"><span>Master volume</span><input type="range" min="0" max="1" step="0.05" value="${s.settings.volume}" data-setting="volume" aria-label="Master volume"></label>${(["music", "ambience", "sfx"] as const).map((id) => `<label class="setting"><span>${id === "sfx" ? "Sound effects" : id === "music" ? "Music" : "Ambience"}</span><input type="range" min="0" max="1" step="0.05" value="${s.settings[id]}" data-setting="${id}" aria-label="${id === "sfx" ? "Sound effects" : id === "music" ? "Music" : "Ambience"} volume"></label>`).join("")}<label class="setting"><span>Instant dialogue text</span><input type="checkbox" data-setting="text" ${s.settings.instantText ? "checked" : ""}></label><label class="setting"><span>Reduced decorative motion</span><input type="checkbox" data-setting="motion" ${s.settings.reducedMotion ? "checked" : ""}></label><p id="audio-status" class="minor" role="status">Original coastal music and sea ambience.</p><dl><dt>Walking</dt><dd>WASD or arrows · follow the screen directions</dd><dt>Sailing</dt><dd>W / Up to sail, S / Down to slow, A / D to steer</dd><dt>At the pier</dt><dd>E to board or tie up and step ashore</dd><dt>Fishing</dt><dd>F to cast or cancel; Space when a fish bites</dd><dt>Finding your way</dt><dd>M chart · J journal · Esc pause · R return to a safe pier</dd><dt>Closer look</dt><dd>Scroll to switch between crisp pixel zoom levels</dd></dl>`,
      this.button("Back to the afternoon", "close"),
    );
  }
  journal(s: GameState) {
    const list = [
      s.delivery === "complete"
        ? "Parcel delivered · 120 coins earned"
        : s.delivery === "active"
          ? "Take Ellis’s net needles to Nessa at Saltglass"
          : "Meet Ellis beside the harbour pier",
      s.story.metMira
        ? "Met Mira, coastal illustrator"
        : "Say hello to Mira by the waterfront",
      s.discoveries.includes("saltglass-bay")
        ? "Walked the shores of Saltglass Bay"
        : "Discover Saltglass Bay",
      s.story.outingComplete
        ? "A shared crossing with Mira"
        : s.story.outingInvited
          ? "A crossing to share with Mira"
          : "An invitation, whenever it feels right",
      s.story.homeSeen
        ? "Found the little beachfront plot"
        : "Visit the bench north of the post office",
    ];
    this.show(
      "journal",
      "Notes from the sea",
      `<ul class="journal">${list.map((x) => `<li>${x}</li>`).join("")}</ul><p>In your creel: <b>${s.inventory.sardine} silver sardine</b> · <b>${s.inventory.bream} sunlit bream</b>.</p><p>Home fund: <b>${s.wallet} / 500 coins</b>. ${s.wallet >= 150 ? "Your first savings milestone is reached." : "A delivery and a few catches will make a beginning."}</p>`,
      this.button("Close journal", "close"),
    );
  }
  home(s: GameState) {
    const fund = homeFund(s);
    this.show(
      "home",
      "A place to return to",
      `<p>Just a little beach, a bench, and a notice in the grass. Rowan can almost see it: a small porch, a window facing the afternoon, somewhere to leave wet shoes.</p><p>Not today. Today is the first journey, and the first few coins set aside.</p><div class="home-fund"><b>${fund.saved} <small>/ ${fund.target} coins</small></b><meter min="0" max="500" value="${Math.min(500, fund.saved)}">${fund.saved}</meter><span>${fund.milestone ? "First milestone · 150 coins reached" : "First milestone · 150 coins"}</span></div>`,
      this.button("Keep the picture in mind", "close"),
    );
  }
  chart(s: GameState) {
    const scale = 0.23,
      ox = 70,
      oy = 180,
      draw = (x: number, z: number) => {
        const p = project(x, z);
        return [ox + p.x * scale, oy + p.y * scale];
      };
    const land = MAPS.map((m) => {
      const p = draw(0, m.offsetZ);
      return `<polygon points="${m.shore.map(([x, z]) => draw(x, z + m.offsetZ).join(",")).join(" ")}" fill="${m.id === "havenport" ? "#93a16b" : "#b2aa8d"}" stroke="#e8d7a7" stroke-width="1"/><text x="${p[0]}" y="${p[1] - 38}">${m.name}</text>`;
    }).join("");
    const p = draw(s.player.x, s.player.z);
    this.show(
      "chart",
      "The Saltglass channel",
      `<svg class="chart" viewBox="0 0 340 235" role="img" aria-label="Chart showing Havenport to the southwest, Saltglass to the northeast and your location"><path d="M125 205 Q235 165 310 110" fill="none" stroke="#78a3a5" stroke-dasharray="3 4"/>${land}<circle cx="${p[0]}" cy="${p[1]}" r="3" fill="#f1e1b4" stroke="#b96d58" stroke-width="2"/><text x="35" y="18">N</text><path d="M10 35 L34 23 M27 24 L34 23 L31 29" stroke="#a1d4c4" fill="none"/></svg><p>Saltglass is north along the channel. Its pier is on the east shore. Approach slowly, then E to tie up and step ashore.</p><p class="minor">Discovered: ${s.discoveries.map((id) => (id === "havenport" ? "Havenport" : "Saltglass Bay")).join(" · ")}. R returns you and your boat to the last harbour.</p>`,
      this.button("Fold the chart", "close"),
    );
  }
  credits() {
    const base = import.meta.env.BASE_URL;
    this.show(
      "credits",
      "Made for an afternoon at sea",
      `<p>Original pixel artwork, characters, writing and seeded surf audio: <b>The House by the Sea contributors</b>, MIT. All sprites are generated locally from committed source recipes and the shared palette.</p><p><a href="https://github.com/phaserjs/phaser/tree/v3.90.0" target="_blank" rel="noopener">Phaser3.90.0</a> · MIT, Richard Davey / Phaser Studio Inc. and contributors.</p><p><a href="https://github.com/patch-gg/pixelfx/tree/5294518ce7c72e48b6100a744596e0acf57f2826" target="_blank" rel="noopener">PixelFX water utility</a> · MIT. Offline ripple-frame generation and contact-sheet lettering; upstream notices retained. No online asset generation or paid services.</p><p><a href="${base}THIRD_PARTY_NOTICES.txt" target="_blank" rel="noopener">Full licences & notices</a> · <a href="${base}assets/manifest.json" target="_blank" rel="noopener">Individual frame manifest</a> · <a href="https://github.com/JEDIx420/thehousebythesea" target="_blank" rel="noopener">Source & reproducible asset tools</a>.</p><p class="minor">Thank you for taking the long way home.</p>`,
      this.button("Back to the afternoon", "close"),
    );
  }
  update(
    session: Session,
    objective: string,
    place: string,
    context: string,
    actionable: boolean,
  ) {
    const s = session.state;
    const text = (id: string, value: string) => {
      const e = this.root.querySelector<HTMLElement>(id)!;
      if (e.textContent !== value) e.textContent = value;
    };
    this.currentSettings = s.settings;
    this.root.classList.toggle("reduced-motion", s.settings.reducedMotion);
    if (this.lastPlace !== place) {
      this.lastPlace = place;
      const node = this.root.querySelector<HTMLElement>(".place")!;
      node.classList.remove("arrived");
      void node.offsetWidth;
      node.classList.add("arrived");
    }
    text("#coins", `${s.wallet}`);
    text("#place", place.toUpperCase());
    text("#objective", objective);
    text(
      "#save-status",
      session.protectedSave
        ? "Temporary voyage · original save protected"
        : session.saving
          ? "Saving…"
          : session.warning
            ? "Not saved · see warning"
            : session.savedAt
              ? "Voyage saved"
              : "Your own little beginning",
    );
    const warning = this.root.querySelector<HTMLElement>("#warning")!;
    warning.hidden = !session.warning;
    if (session.warning) warning.textContent = session.warning;
    const e = this.root.querySelector<HTMLElement>("#context")!,
      html =
        context && actionable
          ? `<button data-action="interact" ${actionable ? "" : "disabled"}><kbd>${actionable ? "E" : "W"}</kbd> ${escapeHTML(context)}</button>`
          : "";
    if (e.innerHTML !== html) e.innerHTML = html;
  }
  fishing(state: FishingState) {
    const e = this.root.querySelector<HTMLElement>("#fishing")!;
    e.hidden = false;
    if (this.fishPhase !== state.phase) {
      // A new cast supersedes a previous cancellation or catch notification.
      if (state.phase === "waiting") {
        clearTimeout(this.toastTimer);
        this.root.querySelector<HTMLElement>("#toast")!.hidden = true;
      }
      this.fishPhase = state.phase;
      e.innerHTML = `<small>LINE IN THE WATER</small><h2>${state.phase === "bite" ? "A bite!" : state.phase === "waiting" ? "Watching the float…" : state.phase === "caught" ? "Safely in your creel" : "The bite slipped away"}</h2><p>${state.phase === "bite" ? "Press Space while the line is lively." : "Let the water do its work. F puts the rod away."}</p><div class="bite-track"><i></i></div>${this.button("F · Put away the rod", "cancel-fishing", true)}`;
    }
    const progress =
      state.phase === "bite"
        ? 1 - (state.elapsed - state.biteAt) / 2.1
        : Math.min(1, state.elapsed / state.biteAt);
    e.style.setProperty(
      "--bite",
      `${Math.max(0, Math.min(1, progress)) * 100}%`,
    );
  }
  clearFishing() {
    this.root.querySelector<HTMLElement>("#fishing")!.hidden = true;
    this.fishPhase = "";
  }
  toast(message: string, duration = 4500) {
    clearTimeout(this.toastTimer);
    const e = this.root.querySelector<HTMLElement>("#toast")!;
    e.classList.toggle("over-modal", this.open);
    e.textContent = message;
    e.hidden = false;
    this.toastTimer = window.setTimeout(() => {
      e.hidden = true;
    }, duration);
  }
}
