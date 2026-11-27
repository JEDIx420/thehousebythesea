// Original synthesised surf: no external audio or copyrighted recordings.
export class Ambience {
  private context?: AudioContext;
  private gain?: GainNode;
  start(volume: number) {
    if (!this.context) {
      const ctx = (this.context = new AudioContext());
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < data.length; i++) {
        last = (last + (Math.random() * 2 - 1) * 0.025) / 1.025;
        data[i] =
          last * 4 * (0.6 + 0.4 * Math.sin((i / data.length) * Math.PI * 2));
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 600;
      this.gain = ctx.createGain();
      source.connect(filter).connect(this.gain).connect(ctx.destination);
      source.start();
    }
    void this.context.resume().catch(() => {});
    this.setVolume(volume);
  }
  setVolume(value: number) {
    if (this.gain) this.gain.gain.value = value * 0.25;
  }
  dispose() {
    void this.context?.close();
  }
}
