"use client";

import { useEffect, useRef, useState } from "react";
import { usePaceStore } from "@/lib/store";
import { formatDistance, parsePace } from "@/lib/units";
import { triggerHaptic } from "@/lib/haptics";
import { sound } from "@/lib/audio";
import { toggleRun } from "@/lib/runControls";
import { finishKm } from "@/components/run/course";
import confetti from "canvas-confetti";

// Live engine paces are "5:06" through "5:15", which is 306 to 315 seconds per km.
const PACE_EASY_SEC = 5 * 60 + 15;
const PACE_FAST_SEC = 5 * 60 + 6;

function paceEffort(pace: string): number {
  const paceSec = parsePace(pace);
  if (!Number.isFinite(paceSec)) return 0;
  const span = PACE_EASY_SEC - PACE_FAST_SEC;
  return Math.min(1, Math.max(0, (PACE_EASY_SEC - paceSec) / span));
}

// Non-zero so a steady pace still moves the readout every tick.
function tickWobble(): number {
  const magnitude = Math.random() < 0.5 ? 1 : 2;
  return Math.random() < 0.5 ? -magnitude : magnitude;
}

function liveHeartRate(pace: string): number {
  const base = Math.round(140 + paceEffort(pace) * 28);
  return Math.min(172, Math.max(138, base + tickWobble()));
}

function liveCadence(pace: string): number {
  const base = Math.round(166 + paceEffort(pace) * 10);
  return Math.min(178, Math.max(164, base + tickWobble()));
}

export function useRunEngine() {
  const {
    runStatus,
    setRunStatus,
    telemetry,
    updateTelemetry,
    simulationMultiplier,
    setSimulationMultiplier,
    resetRun,
    distanceUnit,
  } = usePaceStore();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const telemetryRef = useRef(telemetry);
  telemetryRef.current = telemetry;

  // Tick from refs so a 20x interval is not torn down on every distance update.
  useEffect(() => {
    if (runStatus !== "RUNNING") {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const intervalMs = simulationMultiplier > 1 ? 50 : 1000;
    const speedStep = simulationMultiplier > 1 ? 20 : 1;
    let finished = false;

    timerRef.current = setInterval(() => {
      if (finished) return;
      const current = telemetryRef.current;
      const curDuration = current.durationSec + speedStep;
      // 5:12 per kilometer is 3.205 meters each real second. Keep full precision
      // so a 1x run can move. Rounding to 2 decimals here froze distance at 0.00.
      const limit = finishKm(usePaceStore.getState().routePlan);
      const curDist = Math.min(limit, current.distanceKm + 0.003205 * speedStep);
      const splitKm = usePaceStore.getState().distanceUnit === "mi" ? 1.609344 : 1;
      const crossed = Math.floor(curDist / splitKm) > Math.floor(current.distanceKm / splitKm);
      if (crossed && curDist < limit - 0.04) {
        sound.playSplitBell();
        triggerHaptic("light");
      }
      const paceVariants = ["5:08", "5:12", "5:10", "5:15", "5:06"];
      const curPace = paceVariants[Math.floor(Math.random() * paceVariants.length)];

      const next = {
        ...current,
        durationSec: curDuration,
        distanceKm: curDist,
        pace: curPace,
        heartRate: liveHeartRate(curPace),
        cadence: liveCadence(curPace),
        calories: Math.floor(curDist * 66),
      };
      telemetryRef.current = next;
      updateTelemetry(next);

      if (curDist >= limit) {
        finished = true;
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setRunStatus("FINISHED");
        triggerHaptic("success");
        sound.playFinishChime();
        sound.speak(
          Math.abs(limit - 5.24) < 0.05
            ? "Workout complete Marco. Excellent 5K pace."
            : "Workout complete Marco. Route finished."
        );

        try {
          confetti({
            particleCount: 80,
            spread: 80,
            origin: { y: 0.6 },
            colors: ["#D4FF00", "#00E5FF", "#FFFFFF"],
          });
        } catch {
          // Confetti is optional.
        }
      }
    }, intervalMs);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [runStatus, simulationMultiplier, updateTelemetry, setRunStatus]);

  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (runStatus !== "COUNTDOWN") {
      setCount(null);
      return;
    }
    let left = 3;
    setCount(3);
    sound.playBeep(880, 0.08);
    triggerHaptic("light");
    const id = window.setInterval(() => {
      left -= 1;
      if (left <= 0) {
        window.clearInterval(id);
        setCount(null);
        sound.playStartChime();
        triggerHaptic("medium");
        setRunStatus("RUNNING");
        return;
      }
      setCount(left);
      sound.playBeep(left === 1 ? 1046 : 880, 0.08);
      triggerHaptic("light");
    }, 1000);
    return () => window.clearInterval(id);
  }, [runStatus, setRunStatus]);

  const toggleFastForward = () => {
    triggerHaptic("heavy");
    if (simulationMultiplier === 1) {
      setSimulationMultiplier(20);
      if (runStatus === "RUNNING" || runStatus === "COUNTDOWN") return;
      if (runStatus === "PAUSED") {
        setRunStatus("RUNNING");
        return;
      }
      if (telemetry.distanceKm >= finishKm(usePaceStore.getState().routePlan)) {
        resetRun();
      }
      sound.speak("Simulation active. 20x speed.");
      setRunStatus("COUNTDOWN");
      return;
    }
    setSimulationMultiplier(1);
  };

  const handleFinish = () => {
    triggerHaptic("success");
    sound.playFinishChime();
    sound.speak(
      `Workout complete Marco. ${formatDistance(telemetry.distanceKm, distanceUnit)} ${distanceUnit === "mi" ? "miles" : "kilometers"} recorded.`
    );
    setRunStatus("FINISHED");

    try {
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.5 },
        colors: ["#D4FF00", "#00E5FF", "#FF3B30", "#FFFFFF"],
      });
    } catch {
      // Confetti fallback
    }
  };

  const formattedTime = () => {
    const mins = Math.floor(telemetry.durationSec / 60);
    const secs = telemetry.durationSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    runStatus,
    telemetry,
    simulationMultiplier,
    count,
    toggleRun,
    toggleFastForward,
    handleFinish,
    resetRun,
    formattedTime,
  };
}
