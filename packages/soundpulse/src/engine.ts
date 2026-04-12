import { SOUND_EVENTS, type SoundEventKey } from '@ymshots/types';

/**
 * SoundEngine — Synthesizes all 21 YmShotS sounds via Web Audio API.
 * No audio files — everything is generated from oscillators, noise, and envelopes.
 *
 * Usage:
 *   const engine = new SoundEngine();
 *   engine.play('shutter_click');
 *   engine.setVolume(0.7);
 *   engine.setMuted(true);
 */
export class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private volume = 0.7;
  private muted = false;

  private getContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.muted ? 0 : this.volume;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private getGain(): GainNode {
    this.getContext();
    return this.masterGain!;
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : this.volume;
    }
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.masterGain) {
      this.masterGain.gain.value = m ? 0 : this.volume;
    }
  }

  play(event: SoundEventKey) {
    if (this.muted) return;

    const config = SOUND_EVENTS[event];
    const ctx = this.getContext();
    const dest = this.getGain();
    const now = ctx.currentTime;

    switch (config.type) {
      case 'sine+noise':
        this.playSineNoise(ctx, dest, now, config as any);
        break;
      case 'repeat':
        this.playRepeat(ctx, dest, now, config as any);
        break;
      case 'sweep':
        this.playSweep(ctx, dest, now, config as any);
        break;
      case 'chime_pair':
        this.playChimePair(ctx, dest, now, config as any);
        break;
      case 'arpeggio':
        this.playArpeggio(ctx, dest, now, config as any);
        break;
      case 'tick':
        this.playTone(ctx, dest, now, (config as any).freq, (config as any).durationMs, 'square');
        break;
      case 'pop_down':
        this.playSweep(ctx, dest, now, config as any);
        break;
      case 'ding':
        this.playTone(ctx, dest, now, (config as any).freq, (config as any).durationMs, 'sine');
        break;
      case 'whoosh':
      case 'whoosh_high':
        this.playNoise(ctx, dest, now, (config as any).durationMs);
        break;
      case 'swish':
        this.playNoise(ctx, dest, now, (config as any).durationMs);
        break;
      case 'stamp':
        this.playTone(ctx, dest, now, (config as any).freq, (config as any).durationMs, 'sawtooth');
        break;
      case 'pop':
        this.playTone(ctx, dest, now, (config as any).freq, (config as any).durationMs, 'sine');
        break;
      case 'multi_ding':
        this.playMultiDing(ctx, dest, now, config as any);
        break;
      case 'launch':
        this.playSweep(ctx, dest, now, { durationMs: 200, freqStart: 300, freqEnd: 1200 });
        break;
      case 'arpeggio_triumph':
        this.playArpeggio(ctx, dest, now, config as any);
        break;
      case 'arpeggio_bright':
        this.playArpeggio(ctx, dest, now, config as any);
        break;
      case 'double_tap':
        this.playDoubleTap(ctx, dest, now, config as any);
        break;
      case 'confirm_pair':
        this.playChimePair(ctx, dest, now, { tones: (config as any).tones, durationMs: (config as any).durationMs, gapMs: 40 });
        break;
      case 'beep_ascending':
        this.playBeepAscending(ctx, dest, now, config as any);
        break;
      case 'chime':
        this.playTone(ctx, dest, now, (config as any).freq, (config as any).durationMs, 'sine');
        break;
    }
  }

  // ─── Synthesis methods ───

  private playTone(ctx: AudioContext, dest: GainNode, time: number, freq: number, durationMs: number, type: OscillatorType) {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    env.gain.setValueAtTime(0.3, time);
    env.gain.exponentialRampToValueAtTime(0.001, time + durationMs / 1000);
    osc.connect(env).connect(dest);
    osc.start(time);
    osc.stop(time + durationMs / 1000 + 0.05);
  }

  private playSineNoise(ctx: AudioContext, dest: GainNode, time: number, config: { durationMs: number; freqStart: number; freqEnd: number }) {
    // Sine sweep + noise burst (shutter click)
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(config.freqStart, time);
    osc.frequency.exponentialRampToValueAtTime(config.freqEnd, time + config.durationMs / 1000);
    env.gain.setValueAtTime(0.3, time);
    env.gain.exponentialRampToValueAtTime(0.001, time + config.durationMs / 1000);
    osc.connect(env).connect(dest);
    osc.start(time);
    osc.stop(time + config.durationMs / 1000 + 0.05);

    // Add noise burst
    this.playNoise(ctx, dest, time, config.durationMs * 0.5);
  }

  private playNoise(ctx: AudioContext, dest: GainNode, time: number, durationMs: number) {
    const bufferSize = ctx.sampleRate * (durationMs / 1000);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.1;
    }
    const source = ctx.createBufferSource();
    const env = ctx.createGain();
    source.buffer = buffer;
    env.gain.setValueAtTime(0.15, time);
    env.gain.exponentialRampToValueAtTime(0.001, time + durationMs / 1000);
    source.connect(env).connect(dest);
    source.start(time);
  }

  private playSweep(ctx: AudioContext, dest: GainNode, time: number, config: { durationMs: number; freqStart: number; freqEnd: number }) {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(config.freqStart, time);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, config.freqEnd), time + config.durationMs / 1000);
    env.gain.setValueAtTime(0.2, time);
    env.gain.exponentialRampToValueAtTime(0.001, time + config.durationMs / 1000);
    osc.connect(env).connect(dest);
    osc.start(time);
    osc.stop(time + config.durationMs / 1000 + 0.05);
  }

  private playChimePair(ctx: AudioContext, dest: GainNode, time: number, config: { tones: readonly number[]; durationMs: number; gapMs: number }) {
    config.tones.forEach((freq, i) => {
      this.playTone(ctx, dest, time + (i * config.gapMs) / 1000, freq, config.durationMs, 'sine');
    });
  }

  private playArpeggio(ctx: AudioContext, dest: GainNode, time: number, config: { notes: readonly string[]; durationMsEach: number; reverbTailMs?: number }) {
    const noteFreqs: Record<string, number> = {
      'C4': 261.6, 'E4': 329.6, 'G4': 392.0, 'C5': 523.3,
      'E5': 659.3, 'G5': 784.0,
    };

    config.notes.forEach((note, i) => {
      const freq = noteFreqs[note] || 440;
      const t = time + (i * config.durationMsEach) / 1000;
      const dur = config.durationMsEach + (config.reverbTailMs || 0);
      this.playTone(ctx, dest, t, freq, dur, 'sine');
    });
  }

  private playRepeat(ctx: AudioContext, dest: GainNode, time: number, config: { count: number; gapMs: number; volumeEnvelope: readonly number[] }) {
    for (let i = 0; i < config.count; i++) {
      const t = time + (i * config.gapMs) / 1000;
      const vol = config.volumeEnvelope[i] ?? 0.5;
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 800;
      env.gain.setValueAtTime(0.3 * vol, t);
      env.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      osc.connect(env).connect(dest);
      osc.start(t);
      osc.stop(t + 0.05);
    }
  }

  private playMultiDing(ctx: AudioContext, dest: GainNode, time: number, config: { noteHz: number; durationMsEach: number }) {
    // Play ascending dings (for star rating)
    for (let i = 0; i < 5; i++) {
      this.playTone(ctx, dest, time + (i * config.durationMsEach) / 1000, config.noteHz * (1 + i * 0.12), config.durationMsEach, 'sine');
    }
  }

  private playDoubleTap(ctx: AudioContext, dest: GainNode, time: number, config: { count: number; durationMs: number; freq: number }) {
    for (let i = 0; i < config.count; i++) {
      this.playTone(ctx, dest, time + (i * config.durationMs * 2) / 1000, config.freq, config.durationMs, 'square');
    }
  }

  private playBeepAscending(ctx: AudioContext, dest: GainNode, time: number, config: { count: number; durationMs: number }) {
    for (let i = 0; i < config.count; i++) {
      this.playTone(ctx, dest, time + (i * config.durationMs * 1.5) / 1000, 400 + i * 200, config.durationMs, 'sine');
    }
  }

  dispose() {
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close();
    }
    this.ctx = null;
    this.masterGain = null;
  }
}
