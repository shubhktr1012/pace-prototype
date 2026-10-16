"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/icons/Icon";
import { usePaceStore } from "@/lib/store";
import { toggleRun } from "@/lib/runControls";
import { formatDistance, formatPace, paceSuffix, unitLabel } from "@/lib/units";
import { triggerHaptic } from "@/lib/haptics";

export function DynamicIslandHUD() {
  const { platform, runStatus, telemetry, activeTab, distanceUnit, isOnboarded } = usePaceStore();
  const liveDistance = `${formatDistance(telemetry.distanceKm, distanceUnit)} ${unitLabel(distanceUnit)}`;
  const livePace = formatPace(telemetry.pace, distanceUnit);
  const [expanded, setExpanded] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const platformRef = useRef(platform);
  platformRef.current = platform;

  const isRunning = runStatus === "RUNNING" || runStatus === "PAUSED";
  // The lenses stay on screen during setup. Live pace, expansion, and the tap hint wait.
  const hudEnabled = isOnboarded;
  const live = hudEnabled && isRunning;
  const open = hudEnabled && expanded;
  const lensesShown = !open && !live;

  // The island looks like a camera until it is tapped, so point at it once per
  // onboarding. Resetting onboarding turns isOnboarded off and the hint returns.
  useEffect(() => {
    if (!isOnboarded || platformRef.current !== "ios") {
      setHintVisible(false);
      if (!isOnboarded) setExpanded(false);
      return;
    }
    setHintVisible(true);
    const timer = setTimeout(() => setHintVisible(false), 5000);
    return () => clearTimeout(timer);
  }, [isOnboarded]);

  const handleIslandTap = (e: React.MouseEvent) => {
    if (!hudEnabled) return;
    if ((e.target as HTMLElement).closest("[data-island-control]")) return;
    triggerHaptic("medium");
    setHintVisible(false);
    setExpanded((prev) => !prev);
  };

  const statusLine =
    runStatus === "RUNNING"
      ? "Pacific Coastal Loop"
      : runStatus === "PAUSED"
        ? "Paused"
        : runStatus === "COUNTDOWN"
          ? "Starting"
          : "Ready";
  const controlLabel =
    runStatus === "RUNNING"
      ? "Pause run"
      : runStatus === "PAUSED"
        ? "Resume run"
        : runStatus === "COUNTDOWN"
          ? "Cancel"
          : "Start run";

  const handleControl = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleRun();
  };

  // Android 15 Status Bar & Centered Punch-Hole Camera
  if (platform === "android") {
    return (
      <>
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
      {live && activeTab === "run" && (
        <div className="absolute top-14 right-4 z-50 h-7 px-2.5 rounded-lg bg-obsidian-card flex items-center gap-2 pointer-events-none">
          <span className="text-[12px] font-semibold text-volt metric-mono">
            {liveDistance}
          </span>
          <span className="text-[12px] text-white metric-mono">{livePace}</span>
        </div>
      )}
      </>
    );
  }

  // iOS 18 Titanium Bezel with Optical Lenses & 3-State Interactive Dynamic Island
  return (
    <>
      {/* Ultra-thin Top Earpiece Speaker Mesh */}
      <div className="absolute top-[2px] left-1/2 -translate-x-1/2 w-[46px] h-[2.5px] bg-[#141417] rounded-full border-b border-white/[0.06] z-50 pointer-events-none" />

      {/* iOS 18 Status Bar Flanking the Dynamic Island */}
      <div className="relative z-50 flex items-center justify-between px-7 pt-[12px] text-[13px] font-semibold tracking-tight pointer-events-none">
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

      {/* First-run hint: a volt pulse on the island and a one-line caption under it */}
      <AnimatePresence>
        {hintVisible && !open && !live && (
          <>
            <div className="pointer-events-none absolute inset-x-0 top-[9px] z-[49] flex justify-center">
              <motion.div
                key="island-pulse"
                aria-hidden
                initial={{ opacity: 0.7, scale: 1 }}
                animate={{ opacity: [0.7, 0], scale: [1, 1.22] }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={{ duration: 1.5, repeat: Infinity, ease: [0.23, 1, 0.32, 1] }}
                className="h-[29px] w-[110px] rounded-2xl border-2 border-volt"
              />
            </div>
            <motion.p
              key="island-caption"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.3 } }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              className="pointer-events-none absolute left-0 right-0 top-[46px] z-50 text-center text-[12px] font-medium text-white/80"
            >
              Tap the island
            </motion.p>
          </>
        )}
      </AnimatePresence>

      {/* Dynamic Island Morphing Container */}
      <div className={`absolute top-[9px] left-0 right-0 z-50 flex justify-center ${hudEnabled ? "pointer-events-auto" : "pointer-events-none"}`}>
        <motion.div
          onClick={handleIslandTap}
          initial={false}
          animate={{
            width: open ? 371 : live ? 218 : 110,
            height: open ? 136 : live ? 31 : 29,
            borderRadius: open ? 44 : 16,
            paddingLeft: open ? 16 : 12,
            paddingRight: open ? 20 : 12,
            paddingTop: open ? 12 : 0,
            paddingBottom: open ? 16 : 0,
          }}
          transition={{ type: "spring", stiffness: open ? 340 : 220, damping: open ? 32 : 26, mass: 0.9 }}
          className={`relative flex items-center bg-black overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.6)] ${hudEnabled ? "cursor-pointer" : ""}`}
        >
          {/* Idle hardware lenses. They fade out fast when the island grows, so pace stays readable,
              and return once it has nearly settled. */}
          <motion.div
            initial={false}
            animate={{ opacity: lensesShown ? 1 : 0 }}
            transition={{ duration: lensesShown ? 0.18 : 0.1, delay: lensesShown ? 0.18 : 0 }}
            className="pointer-events-none absolute inset-x-0 top-0 h-full flex items-center justify-between px-[11px]"
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
          </motion.div>

          <AnimatePresence initial={false}>
            {/* STATE 1: EXPANDED TELEMETRY HUD */}
            {open ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                transition={{ duration: 0.22, delay: 0.06 }}
                className="absolute inset-x-4 top-3 bottom-4 flex flex-col justify-between select-none"
              >
                {/* Leading and trailing regions flank the camera, as in a real expanded Live Activity */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-volt text-black flex items-center justify-center">
                      <Icon name="runner" size={18} />
                    </span>
                    <div className="leading-tight">
                      <p className="text-[13px] font-semibold text-white">Outdoor Run</p>
                      <p className="text-[11px] text-white/45">{statusLine}</p>
                    </div>
                  </div>
                  <p
                    className={`text-[24px] leading-8 font-semibold metric-mono ${
                      runStatus === "PAUSED" ? "text-white/45" : "text-volt"
                    }`}
                  >
                    {formatElapsed(telemetry.durationSec)}
                  </p>
                </div>

                <div className="flex items-end justify-between">
                  <div className="flex items-baseline gap-4">
                    <p className="text-[22px] leading-none font-semibold text-white metric-mono">
                      {formatDistance(telemetry.distanceKm, distanceUnit)}
                      <span className="ml-0.5 text-[12px] font-medium text-white/45">{unitLabel(distanceUnit)}</span>
                    </p>
                    <p className="text-[22px] leading-none font-semibold text-white metric-mono">
                      {livePace}
                      <span className="ml-0.5 text-[12px] font-medium text-white/45">{paceSuffix(distanceUnit)}</span>
                    </p>
                    <p className="text-[22px] leading-none font-semibold text-infrared metric-mono flex items-baseline">
                      {telemetry.heartRate}
                      <Icon name="heart" size={11} className="ml-1 text-infrared self-center" />
                    </p>
                  </div>

                  <button
                    type="button"
                    data-island-control
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={handleControl}
                    aria-label={controlLabel}
                    className="w-11 h-11 shrink-0 rounded-full bg-volt/20 text-volt flex items-center justify-center active:scale-90 transition-transform"
                  >
                    <Icon name={runStatus === "RUNNING" ? "pause" : "play"} size={18} />
                  </button>
                </div>
              </motion.div>
            ) : live ? (
              /* STATE 2: COMPACT LIVE ACTIVITY PILL */
              <motion.div
                key="compact"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.22, delay: 0.16 } }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                className="flex h-full w-full items-center justify-between text-[11px] z-10 select-none"
              >
                <span className="flex items-center gap-1.5 font-bold text-volt metric-mono">
                  <Icon name="pulse" size={12} className="text-volt" />
                  {liveDistance}
                </span>
                <span className="font-semibold text-white metric-mono text-[11px]">
                  {livePace}{paceSuffix(distanceUnit)}
                </span>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}

function formatElapsed(totalSec: number) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.floor(totalSec % 60);
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}
