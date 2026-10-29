'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

export interface UseWebAudioReturn {
  isPlaying: boolean;
  isReady: boolean;
  toggle: () => Promise<boolean>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  volume: number;
  setVolume: (vol: number) => void;
  theme: 'sakura' | 'rain' | 'dawn';
  setTheme: (theme: 'sakura' | 'rain' | 'dawn') => void;
}

// Pentatonic & Insen harmonic scale intervals for ambient Japanese anime chimes
const CHIME_FREQUENCIES = [
  293.66, // D4
  349.23, // F4
  392.00, // G4
  440.00, // A4
  523.25, // C5
  587.33, // D5
  698.46, // F5
  783.99, // G5
  880.00, // A5
];

export function useWebAudio(
  initialTheme: 'sakura' | 'rain' | 'dawn' = 'sakura'
): UseWebAudioReturn {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [volume, setVolumeState] = useState<number>(0.35);
  const [themeOverride, setThemeOverride] = useState<'sakura' | 'rain' | 'dawn' | null>(null);

  // Derived theme compliant with React 19 render purity (zero setState in useEffect)
  const currentTheme = themeOverride ?? initialTheme;

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const windGainRef = useRef<GainNode | null>(null);
  const windFilterRef = useRef<BiquadFilterNode | null>(null);
  const windSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const chimeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const volumeRef = useRef<number>(0.35);
  const themeRef = useRef<'sakura' | 'rain' | 'dawn'>(currentTheme);
  const scheduleNextChimeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  // Synchronize audio graph filter cutoff whenever theme shifts
  useEffect(() => {
    themeRef.current = currentTheme;

    const ctx = audioCtxRef.current;
    const filter = windFilterRef.current;
    if (ctx && filter && ctx.state !== 'closed') {
      const now = ctx.currentTime;
      const isRain = currentTheme === 'rain';
      const isDawn = currentTheme === 'dawn';
      const targetFreq = isRain ? 220 : isDawn ? 540 : 450;
      filter.frequency.cancelScheduledValues(now);
      filter.frequency.linearRampToValueAtTime(targetFreq, now + 1.2);
    }
  }, [currentTheme]);

  const setTheme = useCallback((newTheme: 'sakura' | 'rain' | 'dawn') => {
    setThemeOverride(newTheme);
    themeRef.current = newTheme;

    const ctx = audioCtxRef.current;
    const filter = windFilterRef.current;
    if (ctx && filter && ctx.state !== 'closed') {
      const now = ctx.currentTime;
      const isRain = newTheme === 'rain';
      const isDawn = newTheme === 'dawn';
      const targetFreq = isRain ? 220 : isDawn ? 540 : 450;
      filter.frequency.cancelScheduledValues(now);
      filter.frequency.linearRampToValueAtTime(targetFreq, now + 1.2);
    }
  }, []);

  // Initialize Audio Graph lazily upon explicit user gesture (browser autoplay compliance)
  const ensureAudioGraph = useCallback((): AudioContext => {
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      return audioCtxRef.current;
    }

    const AudioContextClass =
      window.AudioContext ||
      // @ts-expect-error webkitAudioContext fallback for older browsers
      window.webkitAudioContext;

    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    // 1. Master Output Gain Node
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    // 2. Procedural Pink Noise Buffer for Gentle Night Wind / Rain Wash
    const sampleRate = ctx.sampleRate;
    const duration = 3.0; // 3 seconds looped
    const bufferLength = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferLength, sampleRate);
    const output = buffer.getChannelData(0);

    // Paul Kellet's filtered pink noise synthesis algorithm (F13.1)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferLength; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      b6 = white * 0.115926;
      output[i] = pink * 0.11;
    }

    // Smooth cosine edge fade to eliminate loop-boundary clicks (F13.B4)
    const fadeSamples = Math.min(256, Math.floor(bufferLength * 0.01));
    for (let i = 0; i < fadeSamples; i++) {
      const factor = 0.5 * (1 - Math.cos((Math.PI * i) / fadeSamples));
      output[i] *= factor;
      output[bufferLength - 1 - i] *= factor;
    }

    // 3. Night Wind Loop Source & Resonant Filter
    const windSource = ctx.createBufferSource();
    windSource.buffer = buffer;
    windSource.loop = true;
    windSourceRef.current = windSource;

    // Filter centered per theme: muffled rain/thunder lowpass (220Hz), dawn (540Hz), sakura (450Hz) (F13.2)
    const isRain = themeRef.current === 'rain';
    const isDawn = themeRef.current === 'dawn';
    const baseFreq = isRain ? 220 : isDawn ? 540 : 450;
    const baseQ = isRain ? 3.4 : isDawn ? 2.2 : 2.8;

    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    windFilter.Q.setValueAtTime(baseQ, ctx.currentTime);
    windFilterRef.current = windFilter;

    // LFO frequency modulation simulating natural breathing wind/rain gusts (F13.3)
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(isRain ? 0.08 : 0.12, ctx.currentTime);

    const lfoGain = ctx.createGain();
    const modRange = isRain ? 80 : 140;
    lfoGain.gain.setValueAtTime(modRange, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(windFilter.frequency);
    lfo.start();

    // Wind channel gain
    const windGain = ctx.createGain();
    const channelVol = isRain ? 0.32 : 0.28;
    windGain.gain.setValueAtTime(channelVol, ctx.currentTime);
    windGainRef.current = windGain;

    windSource.connect(windFilter);
    windFilter.connect(windGain);

    // 4. Stereo Panner for atmospheric spatial motion (F13.4)
    if (typeof ctx.createStereoPanner === 'function') {
      const panner = ctx.createStereoPanner();
      const panLfo = ctx.createOscillator();
      panLfo.frequency.setValueAtTime(0.08, ctx.currentTime);
      const panGain = ctx.createGain();
      panGain.gain.setValueAtTime(0.35, ctx.currentTime);
      panLfo.connect(panGain);
      panGain.connect(panner.pan);
      panLfo.start();

      windGain.connect(panner);
      panner.connect(masterGain);
    } else {
      windGain.connect(masterGain);
    }

    windSource.start(0);
    setIsReady(true);
    return ctx;
  }, []);

  // Play an ethereal dual-oscillator anime chime note with delay feedback (F14)
  const triggerChime = useCallback((freq: number) => {
    const ctx = audioCtxRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master || !isPlayingRef.current) return;

    const now = ctx.currentTime;
    const isRain = themeRef.current === 'rain';
    const isDawn = themeRef.current === 'dawn';

    // Primary pure sine oscillator + warm detuned triangle oscillator
    const oscA = ctx.createOscillator();
    oscA.type = 'sine';
    oscA.frequency.setValueAtTime(freq, now);

    const oscB = ctx.createOscillator();
    oscB.type = 'triangle';
    oscB.frequency.setValueAtTime(freq, now);
    oscB.detune.setValueAtTime(7, now); // +7 cents chorus spread (F14.1)

    // Ethereal chime ADSR envelope (F14.3)
    const chimeGain = ctx.createGain();
    chimeGain.gain.setValueAtTime(0.0001, now);
    chimeGain.gain.linearRampToValueAtTime(0.16, now + 0.6); // Soft 0.6s attack
    chimeGain.gain.linearRampToValueAtTime(0.08, now + 1.6); // Decay
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.8); // 4.8s release

    // Stereo ping-pong style delay network (F14.4)
    const delay = ctx.createDelay();
    delay.delayTime.setValueAtTime(0.375, now);

    const delayFeedback = ctx.createGain();
    delayFeedback.gain.setValueAtTime(0.38, now); // Safe feedback < 0.85 (F14.B4)

    const delayFilter = ctx.createBiquadFilter();
    delayFilter.type = 'lowpass';
    const delayCutoff = isRain ? 850 : isDawn ? 2400 : 1800;
    delayFilter.frequency.setValueAtTime(delayCutoff, now);

    // Wire delay loop
    delay.connect(delayFilter);
    delayFilter.connect(delayFeedback);
    delayFeedback.connect(delay);
    delayFilter.connect(master);

    // Wire chime output
    oscA.connect(chimeGain);
    oscB.connect(chimeGain);
    chimeGain.connect(master);
    chimeGain.connect(delay);

    oscA.start(now);
    oscB.start(now);
    oscA.stop(now + 5.0);
    oscB.stop(now + 5.0);
  }, []);

  // Algorithmic chime scheduler
  const scheduleNextChime = useCallback(() => {
    if (!isPlayingRef.current) return;

    const delayMs = 3800 + Math.random() * 3200; // 3.8s to 7.0s intervals
    chimeTimerRef.current = setTimeout(() => {
      if (!isPlayingRef.current) return;

      const randomIndex = Math.floor(Math.random() * CHIME_FREQUENCIES.length);
      const pitch = CHIME_FREQUENCIES[randomIndex];
      triggerChime(pitch);

      // Occasionally trigger a harmonizing second chime note (arpeggio)
      if (Math.random() > 0.5) {
        setTimeout(() => {
          if (!isPlayingRef.current) return;
          const secondPitch =
            CHIME_FREQUENCIES[(randomIndex + 2) % CHIME_FREQUENCIES.length];
          triggerChime(secondPitch);
        }, 400 + Math.random() * 300);
      }

      scheduleNextChimeRef.current?.();
    }, delayMs);
  }, [triggerChime]);

  useEffect(() => {
    scheduleNextChimeRef.current = scheduleNextChime;
  }, [scheduleNextChime]);

  // Play audio with smooth gain fade-in to prevent pops (F13.5)
  const play = useCallback(async () => {
    try {
      const ctx = ensureAudioGraph();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      isPlayingRef.current = true;
      setIsPlaying(true);

      const master = masterGainRef.current;
      if (master) {
        const now = ctx.currentTime;
        master.gain.cancelScheduledValues(now);
        master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), now);
        master.gain.linearRampToValueAtTime(volumeRef.current, now + 1.2);
      }

      // Play an initial welcoming chime after sound starts
      setTimeout(() => {
        if (isPlayingRef.current) {
          triggerChime(587.33); // D5
        }
      }, 500);

      scheduleNextChime();
    } catch (err) {
      console.warn('Web Audio playback failed to start:', err);
    }
  }, [ensureAudioGraph, triggerChime, scheduleNextChime]);

  // Pause / Mute audio with smooth gain fade-out to prevent clicks (F13.5)
  const pause = useCallback(async () => {
    isPlayingRef.current = false;
    setIsPlaying(false);

    if (chimeTimerRef.current) {
      clearTimeout(chimeTimerRef.current);
      chimeTimerRef.current = null;
    }

    const ctx = audioCtxRef.current;
    const master = masterGainRef.current;
    if (ctx && master && ctx.state !== 'closed') {
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0.0001, now + 0.8);
    }
  }, []);

  // Atomic toggle handler
  const toggle = useCallback(async (): Promise<boolean> => {
    if (isPlayingRef.current) {
      await pause();
      return false;
    } else {
      await play();
      return true;
    }
  }, [play, pause]);

  // Master volume control with bounds clamp [0.0, 1.0] (F13.B3)
  const setVolume = useCallback((newVol: number) => {
    const clamped = Math.max(0.0, Math.min(1.0, newVol));
    setVolumeState(clamped);
    volumeRef.current = clamped;

    const ctx = audioCtxRef.current;
    const master = masterGainRef.current;
    if (ctx && master && isPlayingRef.current) {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(clamped, ctx.currentTime);
    }
  }, []);

  // Cleanup on unmount to prevent audio node memory leaks (F14.B5)
  useEffect(() => {
    return () => {
      isPlayingRef.current = false;
      if (chimeTimerRef.current) {
        clearTimeout(chimeTimerRef.current);
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        try {
          audioCtxRef.current.close();
        } catch {
          // ignore already closed
        }
      }
    };
  }, []);

  return {
    isPlaying,
    isReady,
    toggle,
    play,
    pause,
    volume,
    setVolume,
    theme: currentTheme,
    setTheme,
  };
}

export default useWebAudio;
