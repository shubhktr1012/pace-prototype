import { sound } from "@/lib/audio";
import { triggerHaptic } from "@/lib/haptics";
import { usePaceStore } from "@/lib/store";
import { formatPace, unitWord } from "@/lib/units";
import { finishKm } from "@/components/run/course";

// Shared by the Record screen and the expanded island, so both controls
// start, pause, and resume the same run.
export function toggleRun() {
  const { runStatus, telemetry, resetRun, setRunStatus, distanceUnit } = usePaceStore.getState();
  triggerHaptic("impact");

  if (runStatus === "COUNTDOWN") {
    usePaceStore.getState().setSimulationMultiplier(1);
    setRunStatus("IDLE");
    return;
  }

  if (runStatus === "RUNNING") {
    sound.playBeep(440, 0.1);
    setRunStatus("PAUSED");
    return;
  }

  if (runStatus === "PAUSED") {
    sound.playBeep(660, 0.1);
    setRunStatus("RUNNING");
    return;
  }

  if (runStatus === "FINISHED" || telemetry.distanceKm >= finishKm(usePaceStore.getState().routePlan)) {
    resetRun();
  }
  sound.speak(
    `Workout started. Target pace ${formatPace("5:12", distanceUnit)} per ${unitWord(distanceUnit)}.`
  );
  setRunStatus("COUNTDOWN");
}
