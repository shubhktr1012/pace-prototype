"use client";

import React, { useState } from "react";
import { Drawer } from "vaul";
import { usePaceStore, type SplitData } from "@/lib/store";
import { displaySplits, formatClimb, formatPace, paceSuffix, parsePace } from "@/lib/units";
import { triggerHaptic } from "@/lib/haptics";
import { Icon } from "@/components/icons/Icon";
import { useShellPortal } from "@/components/shell/ShellPortal";

export function SplitsDrawer() {
  const [open, setOpen] = useState(false);
  const { splits, telemetry, platform, distanceUnit } = usePaceStore();
  const portal = useShellPortal();
  const sheetRadius = platform === "ios" ? "rounded-t-[28px]" : "rounded-t-2xl";
  const shown = displaySplits(splits, distanceUnit);
  const fastest = shown.reduce((best, split) => (parsePace(split.pace) < parsePace(best.pace) ? split : best), shown[0]);
  const targetPace = formatPace("5:12", distanceUnit);

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(next) => {
        triggerHaptic("light");
        setOpen(next);
      }}
    >
      <Drawer.Trigger asChild>
        <button
          data-no-press
          className="w-full h-11 px-1 flex items-center justify-between text-left"
          aria-label={
            distanceUnit === "mi"
              ? `View mile splits. Best mile ${fastest?.pace ?? targetPace} per mile`
              : `View kilometer splits. Best kilometer ${fastest?.pace ?? targetPace} per kilometer`
          }
        >
          <span className="text-[14px] font-medium text-white/85">
            {distanceUnit === "mi" ? "Mile splits" : "Kilometer splits"}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[13px]">
            <span className="text-white/45">Best</span>
            <span className="metric-mono font-semibold text-white">{fastest?.pace ?? targetPace}</span>
            <span className="text-white/45">{paceSuffix(distanceUnit)}</span>
            <Icon name="chevronUp" size={16} className="ml-0.5 text-white/45" />
          </span>
        </button>
      </Drawer.Trigger>

      <Drawer.Portal container={portal ?? undefined}>
        <Drawer.Overlay className="absolute inset-0 bg-black/60 z-10 pointer-events-auto" />
        <Drawer.Content
          className={`absolute bottom-0 inset-x-0 z-20 bg-obsidian-sheet border-t border-white/10 ${sheetRadius} px-5 pt-3 pb-10 max-h-[82%] flex flex-col focus:outline-none pointer-events-auto`}
        >
          <div className="w-9 h-1 rounded-full bg-white/25 mx-auto mb-4" />
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">Pacific Coastal Loop</p>
          <Drawer.Title className="text-[24px] font-semibold tracking-tight text-white">Splits</Drawer.Title>
          <Drawer.Description className="text-[13px] text-white/45 mt-0.5">
            Target {targetPace} {paceSuffix(distanceUnit)} · {formatClimb(telemetry.elevationM, distanceUnit)}
          </Drawer.Description>

          <Elevation splits={shown.map((split) => ({ elevationDiffM: split.elevationM }))} />

          <div className="mt-2 flex-1 overflow-y-auto no-scrollbar">
            {shown.map((split) => {
              const diffSec = parsePace(split.pace) - parsePace(targetPace);
              const faster = diffSec <= 0;
              return (
                <div
                  key={split.index}
                  className="flex items-center gap-3 py-2.5 border-b border-white/10 last:border-0"
                >
                  <span className="w-14 text-[12px] text-white/45">
                    {distanceUnit === "mi" ? "Mile" : "Km"} {split.index}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[20px] leading-none font-semibold metric-mono text-white">{split.pace}</p>
                    <p className="mt-1 text-[12px] text-white/40">
                      <span className="text-infrared metric-mono">{split.heartRate}</span>
                      {` bpm · ${formatClimb(split.elevationM, distanceUnit)}`}
                    </p>
                  </div>
                  <span className={`text-[15px] font-semibold metric-mono ${faster ? "text-volt" : "text-infrared"}`}>
                    {faster ? `${diffSec}s` : `+${diffSec}s`}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setOpen(false)}
            data-vaul-no-drag
            className="mt-3 h-11 text-[15px] font-semibold text-white/60"
          >
            Done
          </button>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function Elevation({ splits }: { splits: Pick<SplitData, "elevationDiffM">[] }) {
  const gain = splits.reduce<number[]>((acc, split) => {
    const prev = acc.length ? acc[acc.length - 1] : 0;
    acc.push(prev + split.elevationDiffM);
    return acc;
  }, []);
  if (gain.length < 2) return null;

  const min = Math.min(...gain);
  const max = Math.max(...gain);
  const span = Math.max(1, max - min);
  const width = 300;
  const height = 56;
  const points = gain.map((value, index) => {
    const x = (index / (gain.length - 1)) * width;
    const y = height - 10 - ((value - min) / span) * (height - 20);
    return `${x} ${y}`;
  });
  const line = `M ${points.join(" L ")}`;

  return (
    <svg className="mt-4 h-14 w-full text-volt" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden>
      <path d={`${line} L ${width} ${height} L 0 ${height} Z`} className="fill-volt/10" />
      <path d={line} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
