"use client";

import React, { useState } from "react";
import { Drawer } from "vaul";
import { usePaceStore } from "@/lib/store";
import { triggerHaptic } from "@/lib/haptics";
import { ChevronUp, TrendingUp, Heart, Zap, Award } from "lucide-react";

export function SplitsDrawer() {
  const [open, setOpen] = useState(false);
  const { splits, telemetry } = usePaceStore();

  const handleOpenChange = (newOpen: boolean) => {
    triggerHaptic("light");
    setOpen(newOpen);
  };

  return (
    <Drawer.Root open={open} onOpenChange={handleOpenChange}>
      <Drawer.Trigger asChild>
        <button
          className="w-full py-2.5 px-4 rounded-2xl bg-[#13161F]/80 backdrop-blur-xl border border-white/10 flex items-center justify-between text-xs text-white/80 active:scale-[0.99] transition-all shadow-lg hover:border-volt/30"
          aria-label="View kilometer splits and elevation"
        >
          <div className="flex items-center gap-2">
            <ChevronUp className="w-4 h-4 text-volt animate-bounce" />
            <span className="font-bold tracking-tight text-white">Kilometer Splits & Elevation</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-volt bg-volt/10 px-2 py-0.5 rounded-full border border-volt/20">
              5 Splits
            </span>
            <span className="text-[11px] text-white/40">Details</span>
          </div>
        </button>
      </Drawer.Trigger>

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        <Drawer.Content className="fixed bottom-0 inset-x-0 max-w-[393px] mx-auto z-50 bg-[#0E1015] border-t border-white/15 rounded-t-[32px] p-5 max-h-[85vh] flex flex-col focus:outline-none shadow-2xl">
          {/* iOS Grabber Pill */}
          <div className="w-12 h-1.5 bg-white/30 rounded-full mx-auto mb-4" />

          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div>
              <Drawer.Title className="text-base font-black text-white tracking-tight">
                Splits & Pace Distribution
              </Drawer.Title>
              <Drawer.Description className="text-xs text-white/50">
                Pacific Coastal Loop · Target Pace 5:12 /km
              </Drawer.Description>
            </div>
            <div className="flex items-center gap-1.5 bg-volt/15 border border-volt/30 px-2.5 py-1 rounded-full">
              <Award className="w-3.5 h-3.5 text-volt" />
              <span className="text-[10px] font-bold text-volt">Fastest: Km 5</span>
            </div>
          </div>

          {/* Elevation Profile Mini Area */}
          <div className="bg-[#13161F] border border-white/10 rounded-2xl p-3.5 mb-4">
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="text-white/60 font-medium flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-cyan" /> Total Elevation Gain
              </span>
              <span className="font-mono font-bold text-cyan">+{telemetry.elevationM} m</span>
            </div>

            {/* SVG Elevation Area Graph */}
            <div className="h-14 w-full relative">
              <svg className="w-full h-full" viewBox="0 0 300 60" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="elevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#00E5FF" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 50 Q 50 42 100 24 T 200 36 T 300 18 L 300 60 L 0 60 Z"
                  fill="url(#elevGrad)"
                />
                <path
                  d="M 0 50 Q 50 42 100 24 T 200 36 T 300 18"
                  fill="none"
                  stroke="#00E5FF"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Splits Table with Visual Bar Comparison */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 no-scrollbar">
            {splits.map((split) => {
              const paceSec = parseInt(split.pace.split(":")[0]) * 60 + parseInt(split.pace.split(":")[1]);
              const targetSec = 5 * 60 + 12; // 5:12
              const diffSec = paceSec - targetSec;
              const isFaster = diffSec <= 0;

              return (
                <div
                  key={split.km}
                  className="bg-[#13161F] border border-white/5 rounded-xl p-3 flex items-center justify-between hover:border-white/15 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center font-mono font-bold text-xs text-white/90">
                      {split.km}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-white">
                          {split.pace}
                        </span>
                        <span className="text-[10px] text-white/40">/km</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-white/50">
                        <span className="flex items-center gap-0.5">
                          <Heart className="w-2.5 h-2.5 text-infrared" /> {split.heartRate} bpm
                        </span>
                        <span>·</span>
                        <span>{split.elevationDiffM >= 0 ? `+${split.elevationDiffM}m` : `${split.elevationDiffM}m`}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
                        isFaster
                          ? "text-volt bg-volt/10"
                          : "text-infrared bg-infrared/10"
                      }`}
                    >
                      {isFaster ? `${diffSec}s` : `+${diffSec}s`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Close button */}
          <button
            onClick={() => setOpen(false)}
            className="w-full mt-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-xs font-bold text-white transition-all"
          >
            Done
          </button>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
