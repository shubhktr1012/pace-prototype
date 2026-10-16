"use client";

import { useEffect, useRef } from "react";
import { usePaceStore } from "@/lib/store";
import { triggerHaptic } from "@/lib/haptics";
import { sound } from "@/lib/audio";
import confetti from "canvas-confetti";

export function useRunEngine() {
  const {
    runStatus,
    setRunStatus,
    telemetry,
    updateTelemetry,
    simulationMultiplier,
    setSimulationMultiplier,
    resetRun,
  } = usePaceStore();

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle active run timer ticks and telemetry simulation
  useEffect(() => {
    if (runStatus === "RUNNING") {
      const intervalMs = simulationMultiplier > 1 ? 50 : 1000;
      const speedStep = simulationMultiplier > 1 ? 20 : 1;

      timerRef.current = setInterval(() => {
        const curDuration = telemetry.durationSec + speedStep;
        // At 5:12 /km pace, 1 second is approx 1 / 312 km = 0.0032 km
        const curDist = Math.min(5.24, +(telemetry.distanceKm + 0.0032 * speedStep).toFixed(2));
        
        // Realistic dynamic pace drift
        const paceVariants = ["5:08", "5:12", "5:10", "5:15", "5:06"];
        const curPace = paceVariants[Math.floor(Math.random() * paceVariants.length)];

        // Heart rate curve rising with effort
        const curHr = Math.min(168, Math.max(142, 145 + Math.floor((curDist / 5.24) * 20)));

        updateTelemetry({
          durationSec: curDuration,
          distanceKm: curDist,
          pace: curPace,
          heartRate: curHr,
          cadence: 168 + Math.floor(Math.random() * 4) - 2,
          calories: Math.floor(curDist * 66),
        });

        // Auto-finish when 5.24 km reached
        if (curDist >= 5.24) {
          if (timerRef.current) clearInterval(timerRef.current);
          setRunStatus("FINISHED");
          triggerHaptic("heavy");
          sound.playFinishChime();
          sound.speak("Workout complete Marco. Excellent 5K pace.");

          try {
            confetti({
              particleCount: 80,
              spread: 80,
              origin: { y: 0.6 },
              colors: ["#D4FF00", "#00E5FF", "#FFFFFF"],
            });
          } catch {
            // Confetti fallback
          }
        }
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [runStatus, telemetry.durationSec, telemetry.distanceKm, simulationMultiplier, updateTelemetry, setRunStatus]);

  const toggleRun = () => {
    triggerHaptic("impact");
    if (runStatus === "IDLE") {
      if (telemetry.distanceKm >= 5.24) {
        resetRun();
      }
      sound.playStartChime();
      sound.speak("Workout started. Target pace 5:12 per kilometer.");
      setRunStatus("RUNNING");
    } else if (runStatus === "RUNNING") {
      sound.playBeep(440, 0.1);
      setRunStatus("PAUSED");
    } else if (runStatus === "PAUSED") {
      sound.playBeep(660, 0.1);
      setRunStatus("RUNNING");
    } else if (runStatus === "FINISHED") {
      resetRun();
    }
  };

  const toggleFastForward = () => {
    triggerHaptic("heavy");
    if (simulationMultiplier === 1) {
      setSimulationMultiplier(20);
      if (runStatus !== "RUNNING" && runStatus !== "FINISHED") {
        if (telemetry.distanceKm >= 5.24) {
          resetRun();
        }
        sound.playStartChime();
        sound.speak("Simulation active. 20x speed.");
        setRunStatus("RUNNING");
      }
    } else {
      setSimulationMultiplier(1);
    }
  };

  const handleFinish = () => {
    triggerHaptic("heavy");
    sound.playFinishChime();
    sound.speak("Workout complete Marco. 5.24 kilometers recorded.");
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
    toggleRun,
    toggleFastForward,
    handleFinish,
    resetRun,
    formattedTime,
  };
}
