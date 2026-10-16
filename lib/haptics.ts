/**
 * Cross-Platform Tactile Haptic Engine
 * 
 * Android Chrome: Native Hardware Vibrator via navigator.vibrate()
 * iOS Safari & Desktop Web: Synthesizes ultra-low-frequency physical thumps
 * via Web Audio API singleton so taps feel weighted and tactile.
 */

class HapticEngine {
  private audioCtx: AudioContext | null = null;

  private initAudio() {
    if (typeof window === "undefined") return null;
    if (!this.audioCtx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  private playSubBassThump(freqStart = 58, freqEnd = 20, durationSec = 0.028, gainVal = 0.35) {
    try {
      const ctx = this.initAudio();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freqStart, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(freqEnd, 10),
        ctx.currentTime + durationSec
      );

      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + durationSec);
    } catch {
      // AudioContext unavailable or restricted by browser autoplay policy
    }
  }

  // Light selection tap (tab change, button hover/tap)
  light() {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(10);
      } catch {}
    }
    this.playSubBassThump(52, 18, 0.022, 0.28);
  }

  // Medium action tap (drawer drag snap, toggle switch)
  medium() {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(22);
      } catch {}
    }
    this.playSubBassThump(68, 22, 0.038, 0.42);
  }

  // Success milestone (run completed, kudos given, plan updated)
  success() {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([15, 40, 25, 40, 35]);
      } catch {}
    }
    this.playSubBassThump(80, 25, 0.05, 0.45);
    setTimeout(() => {
      this.playSubBassThump(95, 30, 0.06, 0.5);
    }, 60);
  }

  // Heavy start/stop tap (Start Run, Finish Workout)
  impact() {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([35, 20, 50]);
      } catch {}
    }
    this.playSubBassThump(75, 16, 0.065, 0.55);
  }

  heavy() {
    this.impact();
  }
}

export const haptics = new HapticEngine();

export type HapticType = "light" | "medium" | "success" | "impact" | "heavy";

export function triggerHaptic(type: HapticType = "light") {
  haptics[type]();
}
