// Original seeded surf synthesis: no recordings, remote calls or music licensing.
export class Ambience {
  private context?: AudioContext;
  private gain?: GainNode;
  start(volume: number) {
    if (!this.context) {
      const ctx = (this.context = new AudioContext()),
        buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate),
        data = buffer.getChannelData(0);
      let previous = 0,
        seed = 11282026;
      for (let i = 0; i < data.length; i++) {
        seed ^= seed << 13;
        seed ^= seed >>> 17;
        seed ^= seed << 5;
        const random = (seed >>> 0) / 4294967296;
        previous = (previous + (random * 2 - 1) * 0.025) / 1.025;
        data[i] =
          previous *
          4 *
          (0.6 + 0.4 * Math.sin((i / data.length) * Math.PI * 2));
      }
      const source = ctx.createBufferSource(),
        filter = ctx.createBiquadFilter();
      source.buffer = buffer;
      source.loop = true;
      filter.type = "lowpass";
      filter.frequency.value = 650;
      this.gain = ctx.createGain();
      source.connect(filter).connect(this.gain).connect(ctx.destination);
      source.start();
    }
    this.setVolume(volume);
    void this.context.resume().catch(() => {});
  }
  setVolume(volume: number) {
    if (this.gain)
      this.gain.gain.value = Math.max(0, Math.min(1, volume)) * 0.25;
  }
  dispose() {
    void this.context?.close().catch(() => {});
  }
}
