"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { DeviceShell } from "@/components/shell/DeviceShell";
import { haptics } from "@/lib/haptics";
import {
  Flame,
  Activity,
  Heart,
  Zap,
  Radio,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Users,
  Trophy,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  Compass,
} from "lucide-react";

export default function HomePage() {
  const {
    activeTab,
    runStatus,
    setRunStatus,
    telemetry,
    resetRun,
    platform,
  } = useAppStore();

  const handleToggleRun = () => {
    haptics.impact();
    if (runStatus === "IDLE") {
      setRunStatus("RUNNING");
    } else if (runStatus === "RUNNING") {
      setRunStatus("PAUSED");
    } else if (runStatus === "PAUSED") {
      setRunStatus("RUNNING");
    }
  };

  const handleResetRun = () => {
    haptics.medium();
    resetRun();
  };

  return (
    <DeviceShell>
      <div className="w-full h-full flex flex-col justify-between px-5 pb-4 pt-1">
        <AnimatePresence mode="wait">
          {activeTab === "run" && (
            <motion.div
              key="tab-run"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col justify-between"
            >
              {/* Top Sub-Bar: Watch Sync & GPS Status */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 bg-[#13161F] border border-white/10 px-3 py-1 rounded-full shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-volt animate-pulse" />
                    <span className="text-[11px] font-semibold tracking-tight text-white/90">
                      Apple Watch Ultra · Synced
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-white/50 bg-[#13161F] border border-white/5 px-2.5 py-1 rounded-full text-[11px]">
                    <Compass className="w-3.5 h-3.5 text-volt" />
                    <span className="font-mono text-[10px]">GPS HIGH ACCURACY</span>
                  </div>
                </div>

                {/* Primary Hero Metric: Distance */}
                <div className="text-center my-3">
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-white/50 mb-1">
                    Total Distance
                  </p>
                  <div className="flex items-baseline justify-center gap-1.5">
                    <span className="text-6xl font-black metric-mono text-white tracking-tighter">
                      {telemetry.distanceKm.toFixed(2)}
                    </span>
                    <span className="text-lg font-bold text-volt tracking-tight uppercase">
                      km
                    </span>
                  </div>
                </div>

                {/* Primary Telemetry Grid Bento */}
                <div className="grid grid-cols-3 gap-2.5 my-4">
                  {/* Pace */}
                  <div className="bg-[#13161F] border border-white/10 rounded-2xl p-3 flex flex-col items-center">
                    <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-volt" /> Pace
                    </span>
                    <span className="text-xl font-black metric-mono text-white">
                      {telemetry.pace}
                    </span>
                    <span className="text-[9px] text-white/40">/km</span>
                  </div>

                  {/* Time Duration */}
                  <div className="bg-[#13161F] border border-white/10 rounded-2xl p-3 flex flex-col items-center">
                    <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan" /> Time
                    </span>
                    <span className="text-xl font-black metric-mono text-white">
                      27:14
                    </span>
                    <span className="text-[9px] text-white/40">mm:ss</span>
                  </div>

                  {/* Heart Rate */}
                  <div className="bg-[#13161F] border border-white/10 rounded-2xl p-3 flex flex-col items-center">
                    <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Heart className="w-3 h-3 text-infrared" /> Heart
                    </span>
                    <span className="text-xl font-black metric-mono text-infrared">
                      {telemetry.heartRate}
                    </span>
                    <span className="text-[9px] text-white/40">BPM (Z4)</span>
                  </div>
                </div>

                {/* Route Vector Map Preview Card */}
                <div className="w-full h-36 bg-[#0E1015] border border-white/10 rounded-2xl relative overflow-hidden flex flex-col justify-between p-3.5 shadow-inner">
                  {/* Subtle Grid Lines simulating athletic GPS vector map */}
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#D4FF00_1px,transparent_1px)] [background-size:16px_16px]" />

                  {/* Simulated Vector Polyline Path */}
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox="0 0 320 140"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M 20 110 Q 70 40 130 80 T 230 40 T 300 30"
                      stroke="#D4FF00"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeDasharray="0"
                    />
                    {/* Pulsing Runner Beacon */}
                    <circle cx="300" cy="30" r="5" fill="#D4FF00" />
                    <circle cx="300" cy="30" r="10" stroke="#D4FF00" strokeWidth="1.5" className="animate-ping opacity-75" />
                  </svg>

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white/60 tracking-wider uppercase bg-black/60 px-2 py-0.5 rounded-full border border-white/10">
                      Pacific Coastal Loop
                    </span>
                    <span className="text-[10px] font-mono text-volt bg-volt/15 px-2 py-0.5 rounded-full border border-volt/30">
                      LIVE TRACKING
                    </span>
                  </div>

                  <div className="relative z-10 flex items-center justify-between text-[11px] text-white/70">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-cyan" /> +42m Climb
                    </span>
                    <span className="font-mono text-white/50 text-[10px]">
                      Cadence: 168 SPM
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Run Action Controls */}
              <div className="pt-4 pb-1">
                <div className="flex items-center gap-3">
                  {runStatus !== "IDLE" && (
                    <button
                      onClick={handleResetRun}
                      className="w-14 h-14 rounded-2xl bg-[#13161F] border border-white/10 flex items-center justify-center text-white/70 hover:text-white active:scale-95 transition-transform"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  )}

                  <button
                    onClick={handleToggleRun}
                    className={`flex-1 h-14 rounded-2xl font-black text-sm tracking-wide uppercase flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg ${
                      runStatus === "RUNNING"
                        ? "bg-[#FF3B30] text-white shadow-infrared/30"
                        : "bg-volt text-black shadow-volt/30 hover:brightness-110"
                    }`}
                  >
                    {runStatus === "RUNNING" ? (
                      <>
                        <Pause className="w-5 h-5 fill-current" />
                        <span>PAUSE RUN</span>
                      </>
                    ) : runStatus === "PAUSED" ? (
                      <>
                        <Play className="w-5 h-5 fill-current" />
                        <span>RESUME RUN</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 fill-current" />
                        <span>START TRACKING</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "coach" && (
            <motion.div
              key="tab-coach"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col justify-between"
            >
              <div>
                {/* Coach Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-volt/15 border border-volt/40 flex items-center justify-center shadow-volt-sm">
                      <Sparkles className="w-4 h-4 text-volt" />
                    </div>
                    <div>
                      <h2 className="font-bold text-sm text-white flex items-center gap-1.5">
                        Coach PACE AI
                        <span className="w-1.5 h-1.5 rounded-full bg-volt animate-pulse" />
                      </h2>
                      <p className="text-[10px] text-white/50">
                        Adaptive Training Intelligence
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-volt bg-volt/10 border border-volt/20 px-2 py-0.5 rounded-full uppercase">
                    ACTIVE PLAN
                  </span>
                </div>

                {/* Workout Plan Card (Runna Engine) */}
                <div className="bg-[#13161F] border border-white/10 rounded-2xl p-4 my-4 shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-volt uppercase tracking-wider">
                      Week 4 · Day 3 of 5
                    </span>
                    <span className="text-[10px] text-white/40">Half Marathon Builder</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    6.0 km Threshold Tempo
                  </h3>
                  <p className="text-xs text-white/60 mb-3">
                    Target pace: 4:55 - 5:05/km. High-cadence aerobic threshold work.
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
                    <div>
                      <span className="text-[9px] text-white/40 uppercase block">Warmup</span>
                      <span className="text-xs font-bold text-white">1.0 km Easy</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-white/40 uppercase block">Work Interval</span>
                      <span className="text-xs font-bold text-volt">4.0 km @ 4:58</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-white/40 uppercase block">Cooldown</span>
                      <span className="text-xs font-bold text-white">1.0 km Easy</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Physiological Prompt Chips */}
                <div className="space-y-2">
                  <p className="text-[11px] font-medium text-white/40 uppercase tracking-wider">
                    Quick Coach Adaptations
                  </p>
                  <div className="flex flex-col gap-2">
                    <button className="w-full text-left p-3 rounded-xl bg-[#0E1015] border border-white/5 hover:border-volt/30 transition-colors text-xs text-white/80 flex items-center justify-between">
                      <span>"My calves feel tight after yesterday's hill reps"</span>
                      <ArrowRight className="w-3.5 h-3.5 text-volt" />
                    </button>
                    <button className="w-full text-left p-3 rounded-xl bg-[#0E1015] border border-white/5 hover:border-volt/30 transition-colors text-xs text-white/80 flex items-center justify-between">
                      <span>"Short on time: cut session to 25 minutes"</span>
                      <ArrowRight className="w-3.5 h-3.5 text-volt" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Chat Input Bar Preview */}
              <div className="pt-4 pb-1">
                <div className="flex items-center gap-2 bg-[#13161F] border border-white/10 rounded-2xl px-3.5 py-2.5">
                  <input
                    type="text"
                    readOnly
                    placeholder="Ask Coach PACE anything..."
                    className="bg-transparent text-xs text-white placeholder-white/40 focus:outline-none flex-1 cursor-default"
                  />
                  <button className="w-7 h-7 rounded-xl bg-volt flex items-center justify-center text-black">
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "feed" && (
            <motion.div
              key="tab-feed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col justify-start space-y-4"
            >
              {/* Club Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h2 className="font-bold text-sm text-white">PACE Global Run Club</h2>
                  <p className="text-[10px] text-white/50">
                    Leaderboard & Community Feed
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-[#13161F] border border-white/10 px-2.5 py-1 rounded-full">
                  <Trophy className="w-3 h-3 text-volt" />
                  <span className="text-[10px] font-bold text-volt">#1 Club Rank</span>
                </div>
              </div>

              {/* Featured Athlete Card: Marco Izurieta */}
              <div className="bg-[#13161F] border border-white/10 rounded-2xl p-4 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-volt to-cyan p-[1.5px]">
                      <div className="w-full h-full rounded-full bg-[#0E1015] flex items-center justify-center text-xs font-black text-white">
                        MI
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-white flex items-center gap-1">
                        Marco Izurieta
                        <span className="text-[9px] px-1.5 py-0.2 bg-volt/20 text-volt rounded-full font-semibold">
                          FOUNDER
                        </span>
                      </h4>
                      <p className="text-[10px] text-white/40">Today at 6:42 AM · San Francisco</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-volt bg-volt/10 px-2 py-0.5 rounded-full">
                    14.2 km
                  </span>
                </div>

                <p className="text-xs text-white/80 mb-3">
                  "Pre-dawn coastal tempo. Coach PACE adapted the intervals around mile 4 for calf recovery. Felt effortless!"
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] text-white/60">
                  <span className="font-mono">Pace: 5:04 /km</span>
                  <button className="flex items-center gap-1.5 text-volt bg-volt/10 hover:bg-volt/20 px-3 py-1 rounded-full transition-colors font-semibold">
                    <Heart className="w-3 h-3 fill-current" />
                    <span>42 Kudos</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "profile" && (
            <motion.div
              key="tab-profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col justify-start space-y-4"
            >
              {/* Profile Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-volt to-cyan p-[2px]">
                  <div className="w-full h-full rounded-full bg-[#0E1015] flex items-center justify-center text-sm font-black text-volt">
                    MI
                  </div>
                </div>
                <div>
                  <h2 className="font-bold text-sm text-white">Marco Izurieta</h2>
                  <p className="text-[11px] text-white/50">
                    Half Marathon Trainee · PACE Elite Member
                  </p>
                </div>
              </div>

              {/* Weekly Mileage Bento */}
              <div className="bg-[#13161F] border border-white/10 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-white/60 uppercase tracking-wider">
                    Weekly Mileage Target
                  </span>
                  <span className="text-xs font-mono font-bold text-volt">71%</span>
                </div>
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="text-2xl font-black metric-mono text-white">28.4</span>
                  <span className="text-xs text-white/50">/ 40.0 km</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-volt rounded-full w-[71%]" />
                </div>
              </div>

              {/* Personal Bests */}
              <div className="space-y-2">
                <p className="text-[11px] font-medium text-white/40 uppercase tracking-wider">
                  Personal Records
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-[#0E1015] border border-white/5 rounded-xl p-3">
                    <span className="text-[10px] text-white/40 block mb-0.5">5K Best</span>
                    <span className="text-base font-black metric-mono text-white">21:40</span>
                  </div>
                  <div className="bg-[#0E1015] border border-white/5 rounded-xl p-3">
                    <span className="text-[10px] text-white/40 block mb-0.5">10K Best</span>
                    <span className="text-base font-black metric-mono text-white">45:15</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DeviceShell>
  );
}
