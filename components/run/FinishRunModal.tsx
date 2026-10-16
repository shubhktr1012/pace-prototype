"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePaceStore } from "@/lib/store";
import { triggerHaptic } from "@/lib/haptics";
import { Trophy, Award, CheckCircle, Share2, ArrowRight } from "lucide-react";

export function FinishRunModal() {
  const { runStatus, resetRun, setActiveTab, telemetry } = usePaceStore();

  if (runStatus !== "FINISHED") return null;

  const handleSaveToFeed = () => {
    triggerHaptic("medium");
    resetRun();
    setActiveTab("feed");
  };

  const handleDismiss = () => {
    triggerHaptic("light");
    resetRun();
  };

  const formattedMins = Math.floor(telemetry.durationSec / 60);
  const formattedSecs = telemetry.durationSec % 60;
  const timeString = `${formattedMins.toString().padStart(2, "0")}:${formattedSecs.toString().padStart(2, "0")}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="w-full max-w-sm bg-[#0E1015] border border-volt/40 rounded-3xl p-6 text-center shadow-[0_0_50px_rgba(212,255,0,0.25)] relative overflow-hidden"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-volt/15 blur-3xl pointer-events-none rounded-full" />

          {/* Golden Trophy Emblem */}
          <div className="w-16 h-16 rounded-3xl bg-volt/15 border border-volt/50 mx-auto flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(212,255,0,0.3)]">
            <Trophy className="w-8 h-8 text-volt" />
          </div>

          <span className="text-[10px] font-bold tracking-widest text-volt uppercase px-3 py-1 rounded-full bg-volt/10 border border-volt/20">
            WORKOUT COMPLETE
          </span>

          <h2 className="text-2xl font-black text-white mt-2 mb-1 tracking-tight">
            Pacific Coastal Loop
          </h2>
          <p className="text-xs text-white/50 mb-5">
            San Francisco · Excellent pacing Marco!
          </p>

          {/* Hero Metrics Summary Grid */}
          <div className="grid grid-cols-3 gap-2 bg-[#13161F] border border-white/10 rounded-2xl p-3.5 mb-4">
            <div>
              <span className="text-[9px] text-white/40 uppercase block mb-0.5">Distance</span>
              <span className="text-base font-black metric-mono text-white">
                {telemetry.distanceKm.toFixed(2)}
              </span>
              <span className="text-[9px] text-volt uppercase block font-bold">km</span>
            </div>
            <div>
              <span className="text-[9px] text-white/40 uppercase block mb-0.5">Time</span>
              <span className="text-base font-black metric-mono text-white">
                {timeString}
              </span>
              <span className="text-[9px] text-white/40 uppercase block">mm:ss</span>
            </div>
            <div>
              <span className="text-[9px] text-white/40 uppercase block mb-0.5">Avg Pace</span>
              <span className="text-base font-black metric-mono text-volt">
                {telemetry.pace}
              </span>
              <span className="text-[9px] text-white/40 uppercase block">/km</span>
            </div>
          </div>

          {/* PR Achievement Badge */}
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-volt/10 border border-volt/30 mb-5 text-left">
            <Award className="w-5 h-5 text-volt flex-shrink-0" />
            <div>
              <span className="text-xs font-bold text-white block">
                Fastest 5K Split Personal Record!
              </span>
              <span className="text-[10px] text-volt">
                5:06 /km on Kilometer 5
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleSaveToFeed}
              className="w-full py-3.5 rounded-2xl bg-volt text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-volt/25 hover:brightness-110 active:scale-95 transition-all"
            >
              <span>Save & Post to PACE Feed</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleDismiss}
              className="w-full py-2.5 rounded-2xl text-xs text-white/60 hover:text-white transition-colors"
            >
              Done / Start Another Run
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
