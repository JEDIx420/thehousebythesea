import Phaser from "phaser";
import { Session } from "./game/session";
import { View } from "./ui/view";
import { VoyageScene } from "./scenes/VoyageScene";
import "./style.css";
const view = new View();
view.loading();
let game: Phaser.Game | undefined;
function layout() {
  const scale = innerWidth >= 1920 && innerHeight >= 1080 ? 3 : 2;
  const width = Math.max(240, Math.min(640, Math.floor(innerWidth / scale))),
    height = Math.max(180, Math.min(360, Math.floor(innerHeight / scale)));
  const app = document.querySelector<HTMLElement>("#app")!;
  app.style.width = width + "px";
  app.style.height = height + "px";
  app.style.marginLeft = -width / 2 + "px";
  app.style.marginTop = -height / 2 + "px";
  app.dataset.narrow = String(width < 500);
  document.documentElement.style.setProperty("--scale", String(scale));
  document.documentElement.style.setProperty("--logical-height", height + "px");
  game?.scale.resize(width, height);
  return { width, height };
}
async function boot() {
  const session = new Session();
  await session.load();
  const size = layout(),
    scene = new VoyageScene(session, view);
  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: "game",
    ...size,
    pixelArt: true,
    roundPixels: true,
    backgroundColor: "#20596b",
    render: { antialias: false, roundPixels: true },
    audio: { noAudio: true },
    loader: { timeout: 10000 },
    scene,
    fps: { target: 60 },
  });
  window.addEventListener("pagehide", (event) => {
    if (!event.persisted) {
      scene.dispose();
      game?.destroy(true);
    }
  });
}
window.addEventListener("resize", layout);
layout();
void boot().catch(() =>
  view.error(
    "The game could not start in this browser. Your saved voyage is kept.",
  ),
);
