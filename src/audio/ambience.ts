import { resourceUrl } from "../data/resource-url";
import type { Settings } from "../state/game";
import { DEFAULT_SETTINGS } from "../data/navigation";
export type Track = "havenport" | "sailing" | "saltglass";
/** Own original score + procedural ambience/SFX, mixed through one master. */
export class Ambience {
  private context?: AudioContext;
  private analyser?: AnalyserNode;
  private musicMeter?: AnalyserNode;
  private musicSamples = new Float32Array(1024);
  private samples = new Float32Array(1024);
  private startedAt = 0;
  private ambientFilter?: BiquadFilterNode;
  private nextBird = 12;
  private master?: GainNode;
  private music?: GainNode;
  private ambient?: GainNode;
  private effects?: GainNode;
  private surf?: AudioBufferSourceNode;
  private voices: {
    source: AudioBufferSourceNode;
    gain: GainNode;
    stopAt?: number;
  }[] = [];
  private failedUntil = new Map<Track, number>();
  private buffers = new Map<Track, AudioBuffer>();
  private pending = new Map<Track, Promise<AudioBuffer>>();
  private target: Track = "havenport";
  private active?: Track;
  private generation = 0;
  private disposed = false;
  private duck = false;
  private visible = true;
  private settings = { ...DEFAULT_SETTINGS };
  status = "Waiting for your first step";
  private error: string | null = null;
  start(settings: Settings | number) {
    if (this.disposed) return;
    this.settings =
      typeof settings === "number"
        ? { ...this.settings, volume: settings }
        : { ...settings };
    if (!this.context) {
      const ctx = (this.context = new AudioContext());
      this.master = ctx.createGain();
      this.music = ctx.createGain();
      this.ambient = ctx.createGain();
      this.effects = ctx.createGain();
      this.musicMeter = ctx.createAnalyser();
      this.musicMeter.fftSize = 1024;
      this.music.connect(this.musicMeter);
      this.musicMeter.connect(this.master);
      this.ambient.connect(this.master);
      this.effects.connect(this.master);
      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 1024;
      this.master.connect(this.analyser);
      this.analyser.connect(ctx.destination);
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 8, ctx.sampleRate),
        data = buffer.getChannelData(0);
      let previous = 0,
        seed = 11282026;
      for (let i = 0; i < data.length; i++) {
        seed ^= seed << 13;
        seed ^= seed >>> 17;
        seed ^= seed << 5;
        previous =
          (previous + (((seed >>> 0) / 4294967296) * 2 - 1) * 0.025) / 1.025;
        data[i] =
          previous *
          1.6 *
          (0.65 + 0.35 * Math.sin((i / data.length) * Math.PI * 2));
      }
      const source = (this.surf = ctx.createBufferSource()),
        filter = (this.ambientFilter = ctx.createBiquadFilter());
      source.buffer = buffer;
      source.loop = true;
      filter.type = "lowpass";
      filter.frequency.value = 650;
      source.connect(filter).connect(this.ambient);
      source.start();
      document.addEventListener("visibilitychange", this.visibility);
    }
    this.apply();
    void this.context
      .resume()
      .then(() => {
        this.status = "Music follows the coast";
        void this.switchTrack(this.target);
      })
      .catch(() => {
        this.error = "Sound needs another click to resume";
        this.status = this.error;
      });
  }
  private visibility = () => {
    this.visible = !document.hidden;
    this.apply();
  };
  setVolume(volume: number) {
    this.settings.volume = volume;
    this.apply();
  }
  update(settings: Settings, track: Track, duck: boolean, district = "") {
    this.settings = { ...settings };
    this.duck = duck;
    this.target = track;
    this.apply();
    if (this.context && this.ambientFilter) {
      this.ambientFilter.frequency.setTargetAtTime(
        district.includes("meadow") || district.includes("cliffs")
          ? 1100
          : district.includes("square")
            ? 500
            : district.includes("garden")
              ? 720
              : track === "sailing"
                ? 400
                : track === "saltglass"
                  ? 850
                  : 600,
        this.context.currentTime,
        0.8,
      );
      if (this.context.currentTime > this.nextBird) {
        this.nextBird =
          this.context.currentTime +
          (district.includes("garden") || district.includes("meadow")
            ? 11
            : track === "sailing"
              ? 23
              : 17);
        const o = this.context.createOscillator(),
          g = this.context.createGain(),
          at = this.context.currentTime;
        o.type = "sine";
        o.frequency.setValueAtTime(1200, at);
        o.frequency.linearRampToValueAtTime(1850, at + 0.08);
        o.frequency.linearRampToValueAtTime(1380, at + 0.19);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(0.045, at + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, at + 0.22);
        o.connect(g).connect(this.ambient!);
        o.start();
        o.stop(at + 0.24);
      }
    }
    if (this.context && this.active !== track) void this.switchTrack(track);
  }
  private apply() {
    const ctx = this.context;
    if (!ctx) return;
    const at = ctx.currentTime;
    for (const [gain, value] of [
      [
        this.master,
        this.settings.muted || !this.visible ? 0 : this.settings.volume,
      ],
      [this.music, this.settings.music * (this.duck ? 0.64 : 1)],
      [this.ambient, this.settings.ambience * 0.25],
      [this.effects, this.settings.sfx * 0.4],
    ] as const) {
      if (gain) {
        gain.gain.cancelScheduledValues(at);
        gain.gain.setTargetAtTime(value, at, 0.09);
      }
    }
  }
  private load(track: Track) {
    const existing = this.buffers.get(track);
    if (existing) return Promise.resolve(existing);
    if (!this.pending.has(track)) {
      const controller = new AbortController();
      let timer: ReturnType<typeof setTimeout>;
      const deadline = new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          controller.abort();
          reject(Error("Music took too long to load; the sea continues."));
        }, 10000);
      });
      const request = fetch(resourceUrl(`audio/${track}.mp3`), {
        signal: controller.signal,
      })
        .then((r) => {
          if (!r.ok)
            throw Error("Music is temporarily unavailable; the sea continues.");
          return r.arrayBuffer();
        })
        .then((b) => this.context!.decodeAudioData(b));
      const promise = Promise.race([request, deadline])
        .then((b) => {
          if (!this.disposed) this.buffers.set(track, b);
          return b;
        })
        .finally(() => {
          clearTimeout(timer);
          this.pending.delete(track);
        });
      this.pending.set(track, promise);
    }
    return this.pending.get(track)!;
  }
  private loading?: Track;
  private async switchTrack(track: Track) {
    if (
      this.disposed ||
      this.loading === track ||
      this.active === track ||
      (this.failedUntil.get(track) ?? 0) > Date.now()
    )
      return;
    this.loading = track;
    const token = ++this.generation;
    try {
      const buffer = await this.load(track);
      if (this.disposed || token !== this.generation || this.target !== track)
        return;
      const ctx = this.context!,
        now = ctx.currentTime,
        source = ctx.createBufferSource(),
        gain = ctx.createGain();
      source.buffer = buffer;
      source.loop = true;
      source.loopStart = 0;
      source.loopEnd = buffer.duration;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(1, now + 2);
      source.connect(gain).connect(this.music!);
      source.start();
      // Keep fading sources owned until onended, so rapid changes/disposal cannot leak them.
      for (const voice of this.voices) {
        voice.gain.gain.cancelScheduledValues(now);
        voice.gain.gain.setValueAtTime(voice.gain.gain.value, now);
        const fade =
          this.voices.indexOf(voice) < this.voices.length - 1 ? 0.025 : 2;
        const stopAt = Math.min(voice.stopAt ?? Infinity, now + fade + 0.01);
        voice.stopAt = stopAt;
        voice.gain.gain.linearRampToValueAtTime(
          0,
          Math.max(now, stopAt - 0.01),
        );
        try {
          voice.source.stop(stopAt);
        } catch {}
      }
      const voice = { source, gain };
      this.voices.push(voice);
      source.onended = () => {
        source.disconnect();
        gain.disconnect();
        this.voices = this.voices.filter((v) => v !== voice);
      };
      this.active = track;
      this.startedAt = now;
      this.status = "Music follows the coast";
      this.error = null;
      this.failedUntil.delete(track);
      // At most current and one upcoming decoded track stay resident.
      if (this.buffers.size > 2)
        for (const key of this.buffers.keys())
          if (key !== track) {
            this.buffers.delete(key);
            break;
          }
    } catch (e) {
      if (
        !this.disposed &&
        token === this.generation &&
        this.target === track
      ) {
        this.failedUntil.set(track, Date.now() + 30000);
        this.error = e instanceof Error ? e.message : "Music unavailable";
        this.status = this.error;
      }
    } finally {
      if (this.loading === track) this.loading = undefined;
    }
  }
  sfx(kind: "step" | "interact" | "catch" | "job" | "cast", surface = "sand") {
    const ctx = this.context;
    if (!ctx || this.disposed || this.settings.muted) return;
    const now = ctx.currentTime;
    const tone = (
      frequency: number,
      start: number,
      duration: number,
      volume: number,
      type: OscillatorType = "sine",
    ) => {
      const o = ctx.createOscillator(),
        g = ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(frequency, now + start);
      g.gain.setValueAtTime(0, now + start);
      g.gain.linearRampToValueAtTime(volume, now + start + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);
      o.connect(g).connect(this.effects!);
      o.start(now + start);
      o.stop(now + start + duration + 0.01);
    };
    if (kind === "step") {
      tone(
        surface === "wood" ? 135 : surface === "grass" ? 85 : 105,
        0,
        0.055,
        0.12,
        "triangle",
      );
    } else if (kind === "catch" || kind === "job") {
      [587.33, 739.99, 880].forEach((f, i) => tone(f, i * 0.09, 0.25, 0.12));
    } else if (kind === "cast") tone(370, 0, 0.13, 0.08, "triangle");
    else tone(523.25, 0, 0.12, 0.07);
  }
  metrics() {
    if (this.analyser) this.analyser.getFloatTimeDomainData(this.samples);
    if (this.musicMeter)
      this.musicMeter.getFloatTimeDomainData(this.musicSamples);
    const rms = Math.sqrt(
        this.samples.reduce((n, v) => n + v * v, 0) / this.samples.length,
      ),
      time = this.context ? this.context.currentTime - this.startedAt : 0;
    return {
      rms,
      musicRms: Math.sqrt(
        this.musicSamples.reduce((n, v) => n + v * v, 0) /
          this.musicSamples.length,
      ),
      musicLooping: this.voices.some((v) => v.source.loop),
      musicTime: time,
      musicPosition: this.active
        ? time % (this.buffers.get(this.active)?.duration ?? 96)
        : 0,
      gains: {
        master: this.master?.gain.value,
        music: this.music?.gain.value,
        ambience: this.ambient?.gain.value,
        sfx: this.effects?.gain.value,
      },
      state: this.context?.state ?? "not-started",
      track: this.active ?? null,
      target: this.target,
      status: this.status,
      error: this.error,
      voices: this.voices.length,
      decodedTracks: this.buffers.size,
      retryAfter: this.failedUntil.get(this.target) ?? null,
      loopSeconds: this.active ? this.buffers.get(this.active)?.duration : 0,
      settings: { ...this.settings },
    };
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.generation++;
    document.removeEventListener("visibilitychange", this.visibility);
    for (const v of this.voices) {
      try {
        v.source.stop();
      } catch {}
    }
    try {
      this.surf?.stop();
    } catch {}
    this.buffers.clear();
    this.pending.clear();
    void this.context?.close().catch(() => {});
  }
}
