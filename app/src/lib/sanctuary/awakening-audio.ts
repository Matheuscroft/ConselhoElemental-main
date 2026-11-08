import { AWAKENING_ELEMENTS, type AwakeningElementId } from '@/lib/sanctuary/awakening-scene';

/**
 * Ambience for the awakening, synthesised in Web Audio rather than shipped as
 * a file: four elemental voices that fade in as their element is lit.
 *
 * Nothing here starts on its own. `start` must be called from a real gesture,
 * which is both the browser's rule and the authorisation the person gives for
 * sound. The music that follows the introduction is never begun from here.
 *
 * Levels are deliberately gentle. Voices arrive one at a time, over more than
 * a second, because a layer landing at full level reads as a startle.
 */

const MASTER_LEVEL = 0.22;
const VOICE_FADE_SECONDS = 1.4;
const MUTE_FADE_SECONDS = 0.25;

interface Voice {
  readonly gain: GainNode;
  readonly sources: readonly AudioScheduledSourceNode[];
  readonly level: number;
  lit: boolean;
}

export interface AwakeningAudio {
  /** Call from a gesture. Safe to call twice; the second call does nothing. */
  start(): Promise<void>;
  /** Fades one element's voice in. Lighting it twice changes nothing. */
  lightVoice(id: AwakeningElementId): void;
  setMuted(muted: boolean): void;
  suspend(): Promise<void>;
  resume(): Promise<void>;
  /** Stops every source, disconnects and closes. The object is spent. */
  stop(): Promise<void>;
  readonly started: boolean;
  readonly muted: boolean;
}

type ContextFactory = () => AudioContext;

const defaultFactory: ContextFactory = () => {
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) throw new Error('Web Audio indisponível neste navegador.');
  return new Ctor();
};

/** A second of noise, looped. Cheaper and calmer than a per-sample processor. */
function noiseBuffer(context: AudioContext): AudioBuffer {
  const buffer = context.createBuffer(1, Math.floor(context.sampleRate), context.sampleRate);
  const data = buffer.getChannelData(0);
  let previous = 0;
  for (let index = 0; index < data.length; index += 1) {
    // Brown-ish noise: softer and less hissy than white for an ambience bed.
    previous = (previous + (Math.random() * 2 - 1) * 0.04) * 0.985;
    data[index] = previous;
  }
  return buffer;
}

function buildVoice(context: AudioContext, master: GainNode, id: AwakeningElementId): Voice {
  const gain = context.createGain();
  gain.gain.value = 0;
  gain.connect(master);

  const sources: AudioScheduledSourceNode[] = [];
  const noise = context.createBufferSource();
  noise.buffer = noiseBuffer(context);
  noise.loop = true;
  sources.push(noise);

  const filter = context.createBiquadFilter();

  if (id === 'terra') {
    // Stone: a low body with a slow pulse under it.
    filter.type = 'lowpass';
    filter.frequency.value = 180;
    const drone = context.createOscillator();
    drone.type = 'sine';
    drone.frequency.value = 55;
    const droneGain = context.createGain();
    droneGain.gain.value = 0.35;
    drone.connect(droneGain).connect(gain);
    sources.push(drone);
  } else if (id === 'fogo') {
    // Embers: a narrow band that breathes.
    filter.type = 'bandpass';
    filter.frequency.value = 900;
    filter.Q.value = 0.8;
    const flicker = context.createOscillator();
    flicker.type = 'sine';
    flicker.frequency.value = 0.37;
    const flickerDepth = context.createGain();
    flickerDepth.gain.value = 420;
    flicker.connect(flickerDepth).connect(filter.frequency);
    sources.push(flicker);
  } else if (id === 'agua') {
    // Water: a sweeping filter, slower than the fire's.
    filter.type = 'lowpass';
    filter.frequency.value = 1400;
    filter.Q.value = 2;
    const sweep = context.createOscillator();
    sweep.type = 'sine';
    sweep.frequency.value = 0.11;
    const sweepDepth = context.createGain();
    sweepDepth.gain.value = 700;
    sweep.connect(sweepDepth).connect(filter.frequency);
    sources.push(sweep);
  } else {
    // Air: bright and thin, drifting across the top.
    filter.type = 'highpass';
    filter.frequency.value = 2200;
    const drift = context.createOscillator();
    drift.type = 'sine';
    drift.frequency.value = 0.07;
    const driftDepth = context.createGain();
    driftDepth.gain.value = 900;
    drift.connect(driftDepth).connect(filter.frequency);
    sources.push(drift);
  }

  noise.connect(filter).connect(gain);
  return { gain, sources, level: id === 'terra' ? 0.9 : 0.6, lit: false };
}

export function createAwakeningAudio(factory: ContextFactory = defaultFactory): AwakeningAudio {
  let context: AudioContext | null = null;
  let master: GainNode | null = null;
  let voices: Map<AwakeningElementId, Voice> | null = null;
  let muted = false;
  let stopped = false;

  const rampMaster = (target: number, seconds: number) => {
    if (!context || !master) return;
    const now = context.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(target, now + seconds);
  };

  return {
    get started() {
      return context !== null;
    },
    get muted() {
      return muted;
    },

    async start() {
      if (context || stopped) return;
      context = factory();
      master = context.createGain();
      master.gain.value = 0;
      master.connect(context.destination);

      voices = new Map();
      for (const element of AWAKENING_ELEMENTS) {
        const voice = buildVoice(context, master, element.id);
        voices.set(element.id, voice);
        for (const source of voice.sources) source.start();
      }

      if (context.state === 'suspended') await context.resume();
      rampMaster(muted ? 0 : MASTER_LEVEL, VOICE_FADE_SECONDS);
    },

    lightVoice(id) {
      if (!context || !voices) return;
      const voice = voices.get(id);
      if (!voice || voice.lit) return;
      voice.lit = true;
      const now = context.currentTime;
      voice.gain.gain.cancelScheduledValues(now);
      voice.gain.gain.setValueAtTime(voice.gain.gain.value, now);
      voice.gain.gain.linearRampToValueAtTime(voice.level, now + VOICE_FADE_SECONDS);
    },

    setMuted(next) {
      muted = next;
      rampMaster(next ? 0 : MASTER_LEVEL, MUTE_FADE_SECONDS);
    },

    async suspend() {
      if (!context || context.state === 'closed') return;
      rampMaster(0, MUTE_FADE_SECONDS);
      await context.suspend();
    },

    async resume() {
      if (!context || context.state === 'closed') return;
      await context.resume();
      rampMaster(muted ? 0 : MASTER_LEVEL, MUTE_FADE_SECONDS);
    },

    async stop() {
      stopped = true;
      if (!context) return;
      for (const voice of voices?.values() ?? []) {
        for (const source of voice.sources) {
          try {
            source.stop();
          } catch {
            // A source that never started throws; nothing to undo.
          }
          source.disconnect();
        }
        voice.gain.disconnect();
      }
      master?.disconnect();
      if (context.state !== 'closed') await context.close();
      context = null;
      master = null;
      voices = null;
    },
  };
}
