"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { usePaceStore, type PlatformType } from "@/lib/store";
import { triggerHaptic } from "@/lib/haptics";
import { DeviceShell } from "@/components/shell/DeviceShell";
import { useShellPortal } from "@/components/shell/ShellPortal";
import { IOSPermissionModal } from "@/components/onboarding/IOSPermissionModal";
import { RunMapCanvas } from "@/components/run/RunMapCanvas";
import { SplitsDrawer } from "@/components/run/SplitsDrawer";
import { FinishRunModal } from "@/components/run/FinishRunModal";
import { useRunEngine } from "@/components/run/useRunEngine";
import { CoachChatView } from "@/components/coach/CoachChatView";
import { CommunityFeedView } from "@/components/feed/CommunityFeedView";
import { ProfileView } from "@/components/profile/ProfileView";
import { Icon } from "@/components/icons/Icon";
import { formatDistance, formatPace, paceSuffix, unitLabel } from "@/lib/units";

export default function HomePage() {
  const { activeTab, platform, distanceUnit } = usePaceStore();
  const {
    runStatus,
    telemetry,
    simulationMultiplier,
    count,
    toggleRun,
    toggleFastForward,
    handleFinish,
    resetRun,
    formattedTime,
  } = useRunEngine();

  const pill = platform === "ios" ? "rounded-full" : "rounded-2xl";
  const distance = formatDistance(telemetry.distanceKm, distanceUnit);
  const pace = formatPace(telemetry.pace, distanceUnit);
  const distanceName = unitLabel(distanceUnit);
  const paceName = paceSuffix(distanceUnit);

  return (
    <DeviceShell>
      {/* Record stays mounted so the map keeps its tiles, zoom, and position between tabs. */}
      <motion.div
        initial={false}
        animate={{ opacity: activeTab === "run" ? 1 : 0 }}
        transition={{ duration: 0.16 }}
        inert={activeTab !== "run"}
        className="absolute inset-0 isolate"
      >
        <RunMapCanvas />

        <LocationPill platform={platform} />

        <AnimatePresence>
          {count != null && (
            <motion.div
              key="countdown-scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="pointer-events-none absolute inset-0 z-[5] bg-obsidian/55"
            />
          )}
        </AnimatePresence>

        {count != null && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex h-[52%] flex-col items-center justify-center">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">Get ready</p>
            <div className="relative flex h-[168px] w-[168px] items-center justify-center">
              <motion.span
                key={`ring-${count}`}
                aria-hidden
                initial={{ opacity: 0.55, scale: 0.7 }}
                animate={{ opacity: 0, scale: 1.45 }}
                transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
                className="absolute inset-0 rounded-full border-2 border-volt"
              />
              <motion.p
                key={count}
                initial={{ opacity: 0, scale: 1.3 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
                style={{ textShadow: "0 0 36px rgba(212,255,0,0.45)" }}
                className="text-[148px] font-bold leading-none metric-mono text-volt"
              >
                {count}
              </motion.p>
            </div>
          </div>
        )}

        {runStatus !== "FINISHED" && (platform === "android" ? (
          <div
            data-map-cover="bottom"
            className="absolute inset-x-3 bottom-[76px] z-10 rounded-[24px] bg-obsidian-sheet px-4 pt-4 pb-3"
          >
            <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-white/40">Distance</p>
            <div className="mt-1 flex items-end gap-2">
              <p className="text-[52px] leading-none font-medium metric-mono text-white">
                {distance}
              </p>
              <p className="mb-1.5 text-[15px] font-medium text-volt">{distanceName}</p>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-1">
              <Metric label="Pace" value={pace} unit={paceName} align="left" />
              <Metric label="Time" value={formattedTime()} unit="" align="left" />
              <Metric label="Heart" value={String(telemetry.heartRate)} unit="bpm" tone="heart" align="left" />
              <Metric label="Cadence" value={String(telemetry.cadence)} unit="spm" align="left" />
            </div>
            <SplitsDrawer />
            <RunActions
              pill={pill}
              runStatus={runStatus}
              fast={simulationMultiplier > 1}
              onReset={resetRun}
              onSimulate={toggleFastForward}
              onToggle={toggleRun}
              onFinish={handleFinish}
            />
          </div>
        ) : (
          <div className="absolute inset-x-0 bottom-0 z-10 px-4 pt-24 pb-[96px] bg-gradient-to-t from-obsidian via-obsidian/95 to-transparent">
            <p
              data-map-cover="bottom"
              className="text-center text-[11px] font-medium tracking-[0.16em] uppercase text-white/40"
            >
              Distance
            </p>
            <div className="flex items-baseline justify-center gap-1.5 mt-0.5">
              <span className="text-[68px] leading-none font-semibold metric-mono text-white">
                {distance}
              </span>
              <span className="text-lg font-semibold text-volt">{distanceName}</span>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-1">
              <Metric label="Pace" value={pace} unit={paceName} />
              <Metric label="Time" value={formattedTime()} unit="" />
              <Metric label="Heart" value={String(telemetry.heartRate)} unit="bpm" tone="heart" />
              <Metric label="Cadence" value={String(telemetry.cadence)} unit="spm" />
            </div>
            <div className="mt-3">
              <SplitsDrawer />
            </div>
            <RunActions
              pill={pill}
              runStatus={runStatus}
              fast={simulationMultiplier > 1}
              onReset={resetRun}
              onSimulate={toggleFastForward}
              onToggle={toggleRun}
              onFinish={handleFinish}
            />
          </div>
        ))}
        <FinishRunModal />
      </motion.div>

      <AnimatePresence initial={false}>
        {activeTab === "coach" && (
          <Screen key="tab-coach">
            <CoachChatView />
          </Screen>
        )}
        {activeTab === "feed" && (
          <Screen key="tab-feed">
            <CommunityFeedView />
          </Screen>
        )}
        {activeTab === "profile" && (
          <Screen key="tab-profile">
            <ProfileView />
          </Screen>
        )}
      </AnimatePresence>
    </DeviceShell>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
      className="absolute inset-0 bg-obsidian"
    >
      <div className="absolute inset-0 overflow-y-auto no-scrollbar px-4 pt-14 pb-28">
        {children}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-16 bg-gradient-to-b from-obsidian to-transparent" />
    </motion.div>
  );
}

function Metric({
  label,
  value,
  unit,
  tone = "default",
  align = "center",
}: {
  label: string;
  value: string;
  unit: string;
  tone?: "default" | "heart";
  align?: "center" | "left";
}) {
  return (
    <div className={align === "left" ? "text-left" : "text-center"}>
      <p className="text-[10px] uppercase tracking-[0.12em] text-white/35">{label}</p>
      <p className={`mt-0.5 text-[18px] font-semibold metric-mono leading-none ${tone === "heart" ? "text-infrared" : "text-white"}`}>
        {value}
      </p>
      <p className="mt-1 text-[10px] text-white/35 h-3">{unit}</p>
    </div>
  );
}

function RunActions({
  pill,
  runStatus,
  fast,
  onReset,
  onSimulate,
  onToggle,
  onFinish,
}: {
  pill: string;
  runStatus: string;
  fast: boolean;
  onReset: () => void;
  onSimulate: () => void;
  onToggle: () => void;
  onFinish: () => void;
}) {
  return (
    <div className="mt-3 flex items-center gap-2">
      {runStatus !== "IDLE" && runStatus !== "COUNTDOWN" && (
        <button
          onClick={onReset}
          aria-label="Reset run"
          className={`h-[52px] w-[52px] ${pill} bg-white/10 text-white/80 flex items-center justify-center active:scale-95`}
        >
          <Icon name="reset" size={18} />
        </button>
      )}
      <button
        onClick={onSimulate}
        className={`h-[52px] px-3.5 ${pill} text-[12px] font-semibold active:scale-[0.98] ${
          fast ? "bg-volt text-black" : "bg-white/10 text-white"
        }`}
      >
        {fast ? "20x on" : "Simulate 5K"}
      </button>
      <button
        onClick={onToggle}
        className={`flex-1 h-[52px] ${pill} font-semibold text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] ${
          runStatus === "RUNNING" ? "bg-infrared text-white" : "bg-volt text-black"
        }`}
      >
        {runStatus !== "COUNTDOWN" && <Icon name={runStatus === "RUNNING" ? "pause" : "play"} size={16} />}
        {runStatus === "RUNNING" ? "Pause" : runStatus === "PAUSED" ? "Resume" : runStatus === "COUNTDOWN" ? "Cancel" : "Start"}
      </button>
      {runStatus !== "IDLE" && runStatus !== "COUNTDOWN" && (
        <button
          onClick={onFinish}
          className={`h-[52px] px-3.5 ${pill} bg-white text-black text-[13px] font-semibold flex items-center gap-1.5 active:scale-95`}
        >
          <Icon name="flag" size={15} />
          Finish
        </button>
      )}
    </div>
  );
}

function LocationPill({ platform }: { platform: PlatformType }) {
  const portal = useShellPortal();
  const { hasLocationPermission, setHasLocationPermission, requestMapFocus } = usePaceStore();
  const [askLocation, setAskLocation] = useState(false);
  const shape = platform === "ios" ? "rounded-full bg-black/60 backdrop-blur-xl" : "rounded-xl bg-obsidian-card";

  return (
    <>
      <button
        type="button"
        aria-label={hasLocationPermission ? "Center on your position" : "Location is off. Turn it on"}
        onClick={() => {
          triggerHaptic("light");
          if (hasLocationPermission) requestMapFocus();
          else setAskLocation(true);
        }}
        className={`absolute top-[50px] left-4 z-10 grid h-9 w-9 place-items-center transition-colors duration-200 ${shape} ${
          hasLocationPermission ? "text-volt" : "text-white/40"
        }`}
      >
        <Icon name="locate" size={20} />
      </button>
      {askLocation && !hasLocationPermission && portal &&
        createPortal(
          <div className="pointer-events-auto absolute inset-0 z-10">
            <IOSPermissionModal
              onAllow={() => {
                triggerHaptic("medium");
                sessionStorage.setItem("pace-onboarded", "1");
                sessionStorage.setItem("pace-location", "allow");
                setHasLocationPermission(true);
                setAskLocation(false);
              }}
              onDeny={() => {
                triggerHaptic("light");
                setAskLocation(false);
              }}
            />
          </div>,
          portal
        )}
    </>
  );
}
