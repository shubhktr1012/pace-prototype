"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { haptics } from "@/lib/haptics";
import { Activity, Radio } from "lucide-react";

export function DynamicIslandHUD() {
  const { platform, runStatus, telemetry, activeTab, setActiveTab } = useAppStore();

  const isLiveActivityActive =
    (runStatus === "RUNNING" || runStatus === "PAUSED") && activeTab !== "run";

  const handleIslandClick = () => {
    if (isLiveActivityActive) {
      haptics.medium();
      setActiveTab("run");
    }
  };

  if (platform === "android") {
    return (
      <div className="absolute top-2 left-0 right-0 z-50 flex items-center justify-between px-6 pointer-events-none h-7">
        {/* Left: Clock */}
        <span className="text-[13px] font-semibold tracking-tight text-white/90">
          11:28
        </span>

        {/* Center: Minimalist Pixel 9 Camera Punch Hole */}
        <div className="w-3.5 h-3.5 rounded-full bg-black ring-1 ring-white/10 flex items-center justify-center pointer-events-auto">
          <div className="w-1.5 h-1.5 rounded-full bg-[#05101a] opacity-80" />
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

  // iOS 18 Dynamic Island
  return (
    <>
      {/* iOS Status Bar Flanking Time and Network */}
      <div className="absolute top-3.5 left-0 right-0 z-40 flex items-center justify-between px-8 pointer-events-none">
        <span className="text-[14px] font-semibold tracking-tight text-white">
          9:41
        </span>
        <div className="flex items-center gap-1.5 text-white/90">
          {/* Signal bars */}
          <div className="flex items-end gap-0.5 h-3">
            <div className="w-[3px] h-1.5 bg-white rounded-full" />
            <div className="w-[3px] h-2 bg-white rounded-full" />
            <div className="w-[3px] h-2.5 bg-white rounded-full" />
            <div className="w-[3px] h-3 bg-white rounded-full" />
          </div>
          <span className="text-[12px] font-semibold tracking-tighter">5G</span>
          {/* Battery pill */}
          <div className="w-5 h-2.5 rounded-[4px] border border-white/80 p-[1.5px] flex items-center relative">
            <div className="w-[85%] h-full bg-white rounded-[1.5px]" />
            <div className="absolute -right-1 w-0.5 h-1 bg-white/80 rounded-r-sm" />
          </div>
        </div>
      </div>

      {/* Morphing Dynamic Island Container */}
      <div className="absolute top-2.5 left-0 right-0 z-50 flex justify-center pointer-events-auto">
        <motion.div
          layout
          transition={{
            type: "spring",
            stiffness: 420,
            damping: 32,
          }}
          onClick={handleIslandClick}
          className={`bg-black text-white cursor-pointer select-none relative overflow-hidden transition-all duration-300 ${
            isLiveActivityActive
              ? "w-[260px] h-[38px] rounded-[22px] px-3.5 py-1.5 shadow-[0_4px_24px_rgba(0,0,0,0.85)] ring-1 ring-volt/30"
              : "w-[124px] h-[34px] rounded-[18px] px-3 py-1 ring-1 ring-white/10"
          }`}
        >
          <AnimatePresence mode="wait">
            {isLiveActivityActive ? (
              <motion.div
                key="live-run-hud"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.18 }}
                className="flex items-center justify-between w-full h-full"
              >
                {/* Left Live Indicator & Distance */}
                <div className="flex items-center gap-2">
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-2.5 h-2.5 rounded-full bg-volt/30 animate-beacon-ping" />
                    <span className="w-1.5 h-1.5 rounded-full bg-volt" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[13px] font-bold metric-mono text-volt">
                      {telemetry.distanceKm.toFixed(2)}
                    </span>
                    <span className="text-[9px] font-medium text-white/60 uppercase">
                      km
                    </span>
                  </div>
                </div>

                {/* Center Pulse Pace */}
                <div className="flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded-md">
                  <Activity className="w-3 h-3 text-cyan" />
                  <span className="text-[11px] font-semibold metric-mono text-white">
                    {telemetry.pace}/km
                  </span>
                </div>

                {/* Right Tab Return Prompt */}
                <span className="text-[10px] font-semibold tracking-wide text-volt/90 uppercase">
                  TAP RUN
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="idle-island"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between w-full h-full px-1"
              >
                {/* Front camera lens */}
                <div className="w-2.5 h-2.5 rounded-full bg-[#080d14] ring-1 ring-white/10" />

                {/* Apple Watch Ultra Sync status beacon */}
                <div className="flex items-center gap-1.5">
                  <Radio className="w-3 h-3 text-volt animate-pulse" />
                  <span className="text-[10px] font-medium text-white/80 tracking-tight">
                    PACE
                  </span>
                </div>

                {/* TrueDepth sensor cutout */}
                <div className="w-2.5 h-2.5 rounded-full bg-[#0c0d12]" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}
