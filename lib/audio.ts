// Athletic cues: native Web Audio and Web Speech, no third-party audio libs.
// iOS Safari starts AudioContext suspended. resume() has to be called inside
// the gesture, then oscillators wait until the context is actually running.

import { usePaceStore } from "@/lib/store";

let sharedCtx: AudioContext | null = null;
let unlockInstalled = false;

function audioAllowed() {
  return usePaceStore.getState().audioEnabled;
}

function createContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  return new AudioCtx();
}

export function getSharedAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!sharedCtx || sharedCtx.state === "closed") {
    sharedCtx = createContext();
  }
  return sharedCtx;
}

function primeSpeech() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.resume();
  } catch {
    // Speech synthesis is missing or blocked.
  }
}

// Call from the shell on mount. pointerdown fires before click, so the
// first tap both unlocks audio and still counts as the user gesture.
export function installAudioUnlock() {
  if (unlockInstalled || typeof window === "undefined") return;
  unlockInstalled = true;

  const unlock = () => {
    const context = getSharedAudioContext();
    if (context && context.state === "suspended") {
      void context.resume().catch(() => {});
    }
    primeSpeech();
  };

  window.addEventListener("pointerdown", unlock, { passive: true });
  window.addEventListener("touchend", unlock, { passive: true });
  window.addEventListener("keydown", unlock);
}

export function runWithAudioContext(fn: (ctx: AudioContext) => void) {
  const context = getSharedAudioContext();
  if (!context) return;

  const start = () => {
    if (context.state !== "running") return;
    try {
      fn(context);
    } catch {
      // Scheduling can throw if the context closed mid-gesture.
    }
  };

  if (context.state === "running") {
    start();
    return;
  }

  // resume() itself must run in the gesture turn. Playback waits for it.
  void context.resume().then(start).catch(() => {});
}

class SoundEngine {
  playBeep(frequency = 880, duration = 0.12, type: OscillatorType = "sine") {
    if (!audioAllowed()) return;
    runWithAudioContext((ctx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    });
  }

  playStartChime() {
    this.playBeep(523.25, 0.08);
    window.setTimeout(() => {
      this.playBeep(659.25, 0.08);
      window.setTimeout(() => {
        this.playBeep(1046.5, 0.2);
      }, 90);
    }, 90);
  }

  playSplitBell() {
    this.playBeep(1318, 0.07);
    window.setTimeout(() => this.playBeep(1568, 0.14), 80);
  }

  playFinishChime() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      window.setTimeout(() => {
        this.playBeep(freq, 0.18);
      }, idx * 120);
    });
  }

  speak(_text: string) {
    // The system voice sounds like a screen reader, so spoken lines stay off for the demo.
    // Start, finish, and button chimes still play.
  }
}

export const sound = new SoundEngine();
