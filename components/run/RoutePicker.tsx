"use client";

import React from "react";
import { triggerHaptic } from "@/lib/haptics";
import { usePaceStore } from "@/lib/store";
import { formatDistance, unitLabel } from "@/lib/units";
import { finishKm, isClosedLoop } from "./course";
import { placeName } from "./places";

export type RouteTool = "start" | "end" | "destination";

const SLOTS: { kind: RouteTool; label: string; letter: string; badge: string }[] = [
  { kind: "start", label: "Start", letter: "S", badge: "bg-cyan" },
  { kind: "end", label: "End", letter: "E", badge: "bg-white" },
  { kind: "destination", label: "Destination", letter: "D", badge: "bg-volt" },
];

const HINT: Record<RouteTool, string> = {
  start: "Tap the map to set your start",
  end: "Tap the map to set your end",
  destination: "Tap the map to set your destination",
};

export function RoutePicker({ tool, onTool }: { tool: RouteTool | null; onTool: (tool: RouteTool | null) => void }) {
  const { routePlan, platform, distanceUnit, placeRoutePoint, clearDestination, resetRoutePlan } = usePaceStore();
  const ios = platform === "ios";
  const loop = isClosedLoop(routePlan);
  const custom = routePlan.start !== 0 || routePlan.end !== routePlan.start || routePlan.destination != null;

  const value = (kind: RouteTool) => {
    if (kind === "start") return { text: placeName(routePlan.start), set: true };
    if (kind === "end") {
      return routePlan.end === routePlan.start
        ? { text: "Same as start", set: false }
        : { text: placeName(routePlan.end), set: true };
    }
    return routePlan.destination == null
      ? { text: "Optional", set: false }
      : { text: placeName(routePlan.destination), set: true };
  };

  const clear = (kind: RouteTool) => {
    triggerHaptic("light");
    if (kind === "end") placeRoutePoint("end", routePlan.start);
    if (kind === "destination") clearDestination();
    if (tool === kind) onTool(null);
  };

  return (
    <div data-map-cover="top" className="absolute inset-x-3 top-[92px] z-10">
      <div
        className={`grid grid-cols-[1fr_1fr_1.2fr] divide-x divide-white/10 overflow-hidden ${
          ios ? "rounded-2xl bg-black/60 backdrop-blur-xl" : "rounded-xl bg-obsidian-sheet"
        }`}
      >
        {SLOTS.map((slot) => {
          const active = tool === slot.kind;
          const v = value(slot.kind);
          const clearable = slot.kind !== "start" && v.set;
          return (
            <div key={slot.kind} className="relative min-w-0">
              <button
                type="button"
                aria-pressed={active}
                aria-label={`${slot.label}: ${v.text}`}
                onClick={() => {
                  triggerHaptic("light");
                  onTool(active ? null : slot.kind);
                }}
                className={`block h-[54px] w-full px-2.5 py-2 text-left transition-colors duration-150 ${
                  active ? "bg-white/[0.14]" : ""
                }`}
              >
                <span
                  className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors duration-150 ${
                    active ? "text-volt" : "text-white/50"
                  }`}
                >
                  <span
                    className={`grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full text-[8px] font-extrabold text-obsidian ${slot.badge}`}
                  >
                    {slot.letter}
                  </span>
                  {slot.label}
                </span>
                <span
                  className={`mt-1 block truncate text-[13px] font-medium ${clearable ? "pr-5" : ""} ${
                    v.set ? "text-white" : "text-white/40"
                  }`}
                >
                  {v.text}
                </span>
              </button>
              {active && <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-volt" />}
              {clearable && (
                <button
                  type="button"
                  aria-label={slot.kind === "end" ? "Make the end the same as the start" : "Remove the destination"}
                  onClick={() => clear(slot.kind)}
                  className="absolute bottom-0 right-0 grid h-9 w-9 place-items-center"
                >
                  <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-white/15 text-white/80">
                    <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden>
                      <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-1.5 flex items-center justify-between gap-3 px-1 text-[11px] font-medium [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]">
        <span className={tool ? "text-volt" : "text-white/75"}>
          {tool ? HINT[tool] : "Tap a slot, then the map. Or drag a pin."}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {custom && !tool && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic("light");
                resetRoutePlan();
              }}
              className="text-white/75 underline decoration-white/30 underline-offset-2"
            >
              Reset
            </button>
          )}
          <span className="metric-mono text-white/85">
            {formatDistance(finishKm(routePlan), distanceUnit, 1)} {unitLabel(distanceUnit)}
            {loop ? " loop" : ""}
          </span>
        </span>
      </div>
    </div>
  );
}
