"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Heart, Radio, Watch } from "lucide-react";
import { usePaceStore } from "@/lib/store";
import { triggerHaptic } from "@/lib/haptics";

export function DynamicIslandHUD() {
  const { platform, runStatus, telemetry, setActiveTab, activeTab } = usePaceStore();
  const [expanded, setExpanded] = useState(false);

  const isRunning = runStatus === "RUNNING" || runStatus === "PAUSED";

  const handleIslandTap = () => {
    triggerHaptic("medium");
    setExpanded((prev) => !prev);
  };

  // Android 15 Status Bar & Centered Punch-Hole Camera
  if (platform === "android") {
    return (
      <div className="absolute top-2 left-0 right-0 z-50 flex items-center justify-between px-6 pointer-events-none h-7">
        {/* Left: Clock */}
        <span className="text-[13px] font-semibold tracking-tight text-white/90">
          11:28
        </span>

        {/* Center: Minimalist Pixel 9 Camera Punch Hole with lens reflection */}
        <div className="w-4 h-4 rounded-full bg-black ring-1 ring-white/10 flex items-center justify-center pointer-events-auto">
          <div className="w-2 h-2 rounded-full bg-[radial-gradient(circle_at_35%_35%,#1e3a8a_0%,#050507_75%,#000000_100%)] relative flex items-center justify-center">
            <div className="w-0.5 h-0.5 rounded-full bg-cyan/80 -translate-x-[0.5px] -translate-y-[0.5px]" />
          </div>
        </div>

        {/* Right: Android Status Icons */}
        <div className="flex items-center gap-1.5 text-[11px] text-white/80">
          <span className="font-mono text-[10px] tracking-widest">5G</span>
          <div className="w-4 h-2.5 rounded-[3px] border border-white/70 relative p-0.5">
            <div className="w-full h-full bg-white rounded-[1px]" />
          </div>
        </div>
      </div>
    );
  }

  // iOS 18 Titanium Bezel with Optical Lenses & 3-State Interactive Dynamic Island
  return (
    <>
      {/* Ultra-thin Top Earpiece Speaker Mesh */}
      <div className="absolute top-[2px] left-1/2 -translate-x-1/2 w-[46px] h-[2.5px] bg-[#141417] rounded-full border-b border-white/[0.06] z-50 pointer-events-none" />

      {/* iOS 18 Status Bar Flanking the Dynamic Island */}
      <div className="relative z-40 flex items-center justify-between px-7 pt-[12px] text-[13px] font-semibold tracking-tight pointer-events-none">
        {/* Left: Time */}
        <span className="metric-mono tracking-tight font-semibold w-[54px] text-left text-white">
          9:41
        </span>

        {/* Right: Cellular, Wi-Fi, Battery */}
        <div className="flex items-center justify-end gap-1.5 w-[68px]">
          {/* Signal Bars */}
          <div className="flex items-end gap-[1.5px] h-[10px]">
            <span className="w-[2.5px] h-[4px] bg-white rounded-[0.5px]" />
            <span className="w-[2.5px] h-[6px] bg-white rounded-[0.5px]" />
            <span className="w-[2.5px] h-[8px] bg-white rounded-[0.5px]" />
            <span className="w-[2.5px] h-[10px] bg-white rounded-[0.5px]" />
          </div>

          {/* Wi-Fi SVG */}
          <svg className="w-[14px] h-[14px] fill-current text-white" viewBox="0 0 24 24">
            <path d="M12 4.5C7 4.5 2.73 6.61 0 10l2.12 2.12C4.3 9.39 7.91 7.5 12 7.5s7.7 1.89 9.88 4.62L24 10c-2.73-3.39-7-5.5-12-5.5zm0 6c-3.33 0-6.31 1.4-8.36 3.64L5.76 16.26c1.52-1.69 3.75-2.76 6.24-2.76s4.72 1.07 6.24 2.76l2.12-2.12C18.31 11.9 15.33 10.5 12 10.5zm0 6c-1.66 0-3.14.69-4.18 1.82L12 22.5l4.18-4.18C15.14 17.19 13.66 16.5 12 16.5z" />
          </svg>

          {/* iOS Battery Icon */}
          <div className="flex items-center gap-[1.5px]">
            <div className="w-[21px] h-[11px] rounded-[3.5px] border border-white/50 p-[1.5px] flex items-center">
              <div className="w-full h-full bg-volt rounded-[1.5px]" />
            </div>
            <div className="w-[1.5px] h-[4px] bg-white/50 rounded-r-full" />
          </div>
        </div>
      </div>

      {/* Dynamic Island Morphing Container */}
      <div className="absolute top-[9px] left-0 right-0 z-50 flex justify-center pointer-events-auto">
        <motion.div
          layout
          onClick={handleIslandTap}
          transition={{ type: "spring", stiffness: 420, damping: 32, mass: 0.8 }}
          className={`relative bg-black cursor-pointer overflow-hidden shadow-[0_6px_24px_rgba(0,0,0,0.9),inset_0_0_0_0.75px_rgba(255,255,255,0.12)] transition-colors duration-200 ${
            expanded
              ? "w-[336px] h-[126px] rounded-[34px] p-4 border border-volt/30"
              : isRunning
              ? "w-[218px] h-[31px] rounded-full px-3 flex items-center justify-between"
              : "w-[110px] h-[29px] rounded-full px-[11px] flex items-center justify-between"
          }`}
        >
          {/* Physical Optical Hardware Lenses (Visible in Idle & subtly in Compact) */}
          {!expanded && (
            <div
              className={`pointer-events-none absolute inset-x-0 top-0 h-full flex items-center justify-between px-[11px] transition-opacity duration-300 ${
                isRunning ? "opacity-25" : "opacity-100"
              }`}
            >
              {/* TrueDepth IR Dot Projector */}
              <div
                title="TrueDepth IR Sensor"
                className="w-[10px] h-[10px] rounded-full bg-[radial-gradient(circle_at_50%_50%,#27121b_0%,#09090b_75%,#000_100%)] shadow-[inset_0_0_1.5px_rgba(255,255,255,0.14)]"
              />

              {/* Sapphire Front Camera Lens with Anti-Reflective Coating */}
              <div
                title="Sapphire Lens"
                className="w-[11px] h-[11px] rounded-full bg-[radial-gradient(circle_at_35%_35%,#3b82f6_0%,#1e1b4b_38%,#050507_72%,#000_100%)] shadow-[inset_0_0_2px_rgba(255,255,255,0.35)] flex items-center justify-center relative"
              >
                <div className="w-[3px] h-[3px] rounded-full bg-sky-300/60 blur-[0.2px] -translate-x-[1px] -translate-y-[1px]" />
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* STATE 1: EXPANDED TELEMETRY HUD */}
            {expanded ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.18 }}
                className="flex flex-col justify-between h-full w-full select-none"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-volt text-black font-black text-[10px] flex items-center justify-center shadow-sm">
                      P
                    </span>
                    <div className="leading-none">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-volt">
                        PACE Live Telemetry
                      </p>
                      <p className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                        <Watch className="w-2.5 h-2.5 text-volt" /> Apple Watch Ultra · Synced
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpanded(false);
                      setActiveTab("run");
                    }}
                    className="px-2.5 py-1 rounded-full bg-volt text-black text-[10px] font-extrabold tracking-tight active:scale-95 transition-transform"
                  >
                    Open Run
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-white/10">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-zinc-400 block">
                      Distance
                    </span>
                    <span className="text-base font-extrabold text-white metric-mono">
                      {telemetry.distanceKm.toFixed(2)}{" "}
                      <small className="text-[10px] font-normal text-zinc-400">km</small>
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-zinc-400 block">
                      Current Pace
                    </span>
                    <span className="text-base font-extrabold text-volt metric-mono">
                      {telemetry.pace}{" "}
                      <small className="text-[10px] font-normal text-zinc-400">/km</small>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase tracking-wider text-zinc-400 block">
                      Heart Rate
                    </span>
                    <span className="text-base font-extrabold text-infrared metric-mono inline-flex items-center gap-1 justify-end">
                      <Heart className="w-3.5 h-3.5 fill-[#FF3B30]" />
                      {telemetry.heartRate}
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : isRunning ? (
              /* STATE 2: COMPACT LIVE ACTIVITY PILL */
              <motion.div
                key="compact"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex items-center justify-between text-[11px] z-10 px-0.5 select-none"
              >
                <span className="flex items-center gap-1.5 font-bold text-volt metric-mono">
                  <Activity className="w-3 h-3 text-volt animate-pulse" />
                  {telemetry.distanceKm.toFixed(2)} km
                </span>
                <span className="font-mono font-semibold text-white metric-mono text-[10.5px]">
                  {telemetry.pace}/km
                </span>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}
