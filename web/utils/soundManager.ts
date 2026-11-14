"use client";

/**
 * Zero-asset sci-fi UI sound design — every effect is synthesized directly
 * via the Web Audio API (oscillator + gain envelope), no audio files.
 * AudioContext is created lazily (`init()`), since constructing one before
 * a user gesture is blocked/suspended by browser autoplay policy anyway.
 */
class SoundManager {
  private ctx: AudioContext | null = null;
  private hum: { osc: OscillatorNode; gain: GainNode } | null = null;
  public isMuted: boolean = false;

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) this.stopReactorHum();
  }

  playHoverTick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.03);

    gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.03);
  }

  playClickLock() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  /** Sustained low Arc Reactor drone — started once (e.g. boot sequence
   *  mount) and explicitly stopped, unlike the one-shot effects above. */
  playReactorHum() {
    if (this.isMuted || this.hum) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(55, this.ctx.currentTime);
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.03, this.ctx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    this.hum = { osc, gain };
  }

  stopReactorHum() {
    if (!this.hum || !this.ctx) return;
    const { osc, gain } = this.hum;
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.4);
    osc.stop(this.ctx.currentTime + 0.42);
    this.hum = null;
  }
}

export const soundFX = new SoundManager();
