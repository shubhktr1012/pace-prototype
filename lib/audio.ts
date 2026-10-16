// Audio engine for athletic audio cues and spoken feedback
// Zero external dependencies: uses native Web Audio API and Web Speech API

class SoundEngine {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Double beep for workout countdown or milestone split
  playBeep(frequency = 880, duration = 0.12, type: OscillatorType = "sine") {
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // Tonal chime when starting a run (Volt aesthetic)
  playStartChime() {
    this.playBeep(523.25, 0.08); // C5
    setTimeout(() => {
      this.playBeep(659.25, 0.08); // E5
      setTimeout(() => {
        this.playBeep(1046.5, 0.2); // C6
      }, 90);
    }, 90);
  }

  // Finish fan-fare chime
  playFinishChime() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playBeep(freq, 0.18);
      }, idx * 120);
    });
  }

  // Native Web Speech spoken coaching voice cue
  speak(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech synthesis fallback
    }
  }
}

export const sound = new SoundEngine();
