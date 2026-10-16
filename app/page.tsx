"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePaceStore } from "@/lib/store";
import { DeviceShell } from "@/components/shell/DeviceShell";
import { RunMapCanvas } from "@/components/run/RunMapCanvas";
import { SplitsDrawer } from "@/components/run/SplitsDrawer";
import { FinishRunModal } from "@/components/run/FinishRunModal";
import { useRunEngine } from "@/components/run/useRunEngine";
import { CoachChatView } from "@/components/coach/CoachChatView";
import { CommunityFeedView } from "@/components/feed/CommunityFeedView";
import { ProfileView } from "@/components/profile/ProfileView";
import {
  Play,
  Pause,
  RotateCcw,
  Compass,
  Zap,
  Clock,
  Heart,
  Flag,
  Sparkles,
  Watch,
} from "lucide-react";

export default function HomePage() {
  const { activeTab } = usePaceStore();
  const {
    runStatus,
    telemetry,
    simulationMultiplier,
    toggleRun,
    toggleFastForward,
    handleFinish,
    resetRun,
    formattedTime,
  } = useRunEngine();

  return (
    <DeviceShell>
      <div className="w-full h-full flex flex-col justify-between relative overflow-hidden select-none">
        <AnimatePresence mode="wait">
          {/* TAB 1: RUN / TRACK SCREEN */}
          {activeTab === "run" && (
            <motion.div
              key="tab-run"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col justify-between h-full relative"
            >
              {/* TOP SECTION: Full-Bleed High-DPI Vector Map Canvas */}
              <div className="w-full h-[250px] relative flex-shrink-0">
                <RunMapCanvas />

                {/* Floating Top Telemetry Badges */}
                <div className="absolute top-3 inset-x-4 flex items-center justify-between pointer-events-none z-10">
                  <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full shadow-md">
                    <span className="w-2 h-2 rounded-full bg-volt animate-pulse" />
                    <span className="text-[10px] font-bold text-white/90">
                      Apple Watch Ultra
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md border border-white/10 px-2 py-1 rounded-full text-[10px] text-white/60">
                    <Compass className="w-3 h-3 text-volt" />
                    <span className="font-mono text-[9px] uppercase">GPS Active</span>
                  </div>
                </div>

                {/* Crucial Marco Trigger: 20x Speed Simulation Pill */}
                <div className="absolute bottom-3 inset-x-4 flex justify-center z-10">
                  <button
                    onClick={toggleFastForward}
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xl active:scale-95 ${
                      simulationMultiplier > 1
                        ? "bg-volt text-black ring-2 ring-volt/40 animate-pulse"
                        : "bg-black/80 backdrop-blur-md text-white/80 border border-white/15 hover:border-volt/40"
                    }`}
                  >
                    <Zap className="w-3 h-3 fill-current" />
                    <span>
                      {simulationMultiplier > 1
                        ? "20x SPEED SIMULATION ACTIVE"
                        : "⚡ Simulate 5K Run (20x Speed)"}
                    </span>
                  </button>
                </div>
              </div>

              {/* LOWER SECTION: Athletic Telemetry HUD & Action Controls */}
              <div className="flex-1 flex flex-col justify-between px-5 pt-2 pb-3 bg-gradient-to-b from-[#07080A]/80 via-[#07080A] to-[#07080A]">
                <div>
                  {/* Primary Hero Distance Metric */}
                  <div className="text-center my-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-0.5">
                      Total Distance
                    </p>
                    <div className="flex items-baseline justify-center gap-1.5">
                      <span className="text-6xl font-black metric-mono text-white tracking-tighter">
                        {telemetry.distanceKm.toFixed(2)}
                      </span>
                      <span className="text-lg font-black text-volt uppercase tracking-tight">
                        km
                      </span>
                    </div>
                  </div>

                  {/* 3-Metric Athletic Bento HUD */}
                  <div className="grid grid-cols-3 gap-2 my-2.5">
                    {/* Live Pace */}
                    <div className="bg-[#13161F] border border-white/10 rounded-2xl p-2.5 flex flex-col items-center shadow-md">
                      <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5 text-volt" /> Pace
                      </span>
                      <span className="text-lg font-black metric-mono text-white">
                        {telemetry.pace}
                      </span>
                      <span className="text-[9px] text-white/40">/km</span>
                    </div>

                    {/* Elapsed Time */}
                    <div className="bg-[#13161F] border border-white/10 rounded-2xl p-2.5 flex flex-col items-center shadow-md">
                      <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 text-cyan" /> Time
                      </span>
                      <span className="text-lg font-black metric-mono text-white">
                        {formattedTime()}
                      </span>
                      <span className="text-[9px] text-white/40">mm:ss</span>
                    </div>

                    {/* Heart Rate */}
                    <div className="bg-[#13161F] border border-white/10 rounded-2xl p-2.5 flex flex-col items-center shadow-md">
                      <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                        <Heart className="w-2.5 h-2.5 text-infrared fill-[#FF3B30] animate-pulse" /> Heart
                      </span>
                      <span className="text-lg font-black metric-mono text-infrared">
                        {telemetry.heartRate}
                      </span>
                      <span className="text-[9px] text-white/40">BPM (Z4)</span>
                    </div>
                  </div>

                  {/* Pull-Up Kilometer Splits Drawer */}
                  <div className="my-1">
                    <SplitsDrawer />
                  </div>
                </div>

                {/* Bottom Action Dock */}
                <div className="pt-2">
                  <div className="flex items-center gap-2.5">
                    {/* Reset Button */}
                    {runStatus !== "IDLE" && (
                      <button
                        onClick={resetRun}
                        title="Reset Run"
                        className="w-13 h-13 py-3 px-3.5 rounded-2xl bg-[#13161F] border border-white/10 flex items-center justify-center text-white/60 hover:text-white active:scale-95 transition-all shadow-md"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}

                    {/* Giant Primary Start/Pause Button */}
                    <button
                      onClick={toggleRun}
                      className={`flex-1 h-13 py-3.5 rounded-2xl font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xl ${
                        runStatus === "RUNNING"
                          ? "bg-[#FF3B30] text-white shadow-infrared/30 hover:brightness-110"
                          : "bg-volt text-black shadow-volt/30 hover:brightness-110"
                      }`}
                    >
                      {runStatus === "RUNNING" ? (
                        <>
                          <Pause className="w-4 h-4 fill-current" />
                          <span>PAUSE RUN</span>
                        </>
                      ) : runStatus === "PAUSED" ? (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>RESUME RUN</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>START RUN</span>
                        </>
                      )}
                    </button>

                    {/* Finish Run Milestone Button */}
                    {runStatus !== "IDLE" && (
                      <button
                        onClick={handleFinish}
                        title="Finish and Record"
                        className="h-13 py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 flex items-center justify-center gap-1.5 text-xs font-bold text-white active:scale-95 transition-all shadow-md"
                      >
                        <Flag className="w-4 h-4 text-volt" />
                        <span>Finish</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Celebration Modal on Finish */}
              <FinishRunModal />
            </motion.div>
          )}

          {/* TAB 2: COACH PACE AI (Runna Engine) */}
          {activeTab === "coach" && (
            <motion.div
              key="tab-coach"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col justify-between px-5 pb-3 pt-2 h-full"
            >
              <CoachChatView />
            </motion.div>
          )}

          {/* TAB 3: COMMUNITY FEED (Strava Club) */}
          {activeTab === "feed" && (
            <motion.div
              key="tab-feed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col justify-between px-5 pb-3 pt-2 h-full"
            >
              <CommunityFeedView />
            </motion.div>
          )}

          {/* TAB 4: ATHLETE PROFILE */}
          {activeTab === "profile" && (
            <motion.div
              key="tab-profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col justify-between px-5 pb-3 pt-2 h-full"
            >
              <ProfileView />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DeviceShell>
  );
}
