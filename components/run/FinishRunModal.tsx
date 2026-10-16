"use client";

import React from "react";
import { Drawer } from "vaul";
import { usePaceStore } from "@/lib/store";
import { triggerHaptic } from "@/lib/haptics";
import { useShellPortal } from "@/components/shell/ShellPortal";
import { formatDistance, formatPace, unitLabel } from "@/lib/units";
import { coveredLine, isClosedLoop } from "@/components/run/course";
import { RouteTrack } from "@/components/run/RouteTrack";

export function FinishRunModal() {
  const { runStatus, resetRun, setActiveTab, telemetry, platform, distanceUnit, routePlan, saveRun } = usePaceStore();
  const portal = useShellPortal();

  if (runStatus !== "FINISHED" || !portal) return null;

  const mins = Math.floor(telemetry.durationSec / 60);
  const secs = telemetry.durationSec % 60;
  const time = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  const radius = platform === "ios" ? "rounded-t-[28px]" : "rounded-t-2xl";

  const dismiss = () => {
    triggerHaptic("light");
    resetRun();
  };

  const track = coveredLine(routePlan, telemetry.distanceKm);
  const loop = isClosedLoop(routePlan);

  const save = () => {
    triggerHaptic("medium");
    saveRun({
      distanceKm: telemetry.distanceKm,
      durationSec: telemetry.durationSec,
      pace: telemetry.pace,
      loop,
      line: track,
    });
    resetRun();
    setActiveTab("feed");
  };

  return (
    <Drawer.Root
      open
      dismissible
      onOpenChange={(next) => {
        if (!next) dismiss();
      }}
    >
      <Drawer.Portal container={portal}>
        <Drawer.Overlay className="absolute inset-0 z-[60] bg-black/70" />
        <Drawer.Content
          className={`absolute inset-x-0 bottom-0 z-[61] outline-none ${radius} bg-obsidian-ink px-5 pt-3 pb-8`}
        >
          <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-white/30" />
          <p className="text-[11px] uppercase tracking-[0.14em] text-volt">Workout saved</p>
          <RouteTrack line={track} className="mt-3 h-36 w-full" />
          <h2 className="mt-3 text-[24px] font-semibold tracking-tight">
            {loop ? "Pacific Coastal Loop" : "Crissy Field"}
          </h2>
          <p className="text-[13px] text-white/45">
            {loop
              ? distanceUnit === "mi"
                ? `Fastest 5K split, mile pace ${formatPace("5:06", "mi")}`
                : "Fastest 5K split, kilometer 5 at 5:06"
              : "Along the promenade"}
          </p>

          <div className="mt-4 grid grid-cols-3">
            <Cell k="Distance" v={`${formatDistance(telemetry.distanceKm, distanceUnit)} ${unitLabel(distanceUnit)}`} />
            <Cell k="Time" v={time} />
            <Cell k="Pace" v={formatPace(telemetry.pace, distanceUnit)} />
          </div>

          <button
            onClick={save}
            data-vaul-no-drag
            className={`mt-5 h-12 w-full ${platform === "ios" ? "rounded-full" : "rounded-2xl"} bg-volt text-black text-[15px] font-semibold`}
          >
            Post to Club
          </button>
          <button
            onClick={dismiss}
            data-vaul-no-drag
            className="mt-2 h-10 w-full text-[14px] text-white/50"
          >
            Done
          </button>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function Cell({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.12em] text-white/35">{k}</p>
      <p className="mt-0.5 text-[16px] font-semibold metric-mono">{v}</p>
    </div>
  );
}
