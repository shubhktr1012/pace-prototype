import { create } from "zustand";

export type PlatformType = "ios" | "android";
export type TabType = "run" | "coach" | "feed" | "profile";
export type RunStatus = "IDLE" | "COUNTDOWN" | "RUNNING" | "PAUSED" | "FINISHED";

export interface TelemetryData {
  distanceKm: number;
  pace: string;
  durationSec: number;
  heartRate: number;
  cadence: number;
  elevationM: number;
  calories: number;
  watchSynced: boolean;
}

export interface SplitData {
  km: number;
  pace: string;
  elevationDiffM: number;
  heartRate: number;
}

interface AppState {
  // Dual-OS Chassis state
  platform: PlatformType;
  setPlatform: (platform: PlatformType) => void;
  togglePlatform: () => void;

  // Navigation state
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;

  // Onboarding & Permissions
  isOnboarded: boolean;
  setIsOnboarded: (val: boolean) => void;
  hasLocationPermission: boolean;
  setHasLocationPermission: (val: boolean) => void;

  // Run Lifecycle & Telemetry
  runStatus: RunStatus;
  setRunStatus: (status: RunStatus) => void;
  telemetry: TelemetryData;
  updateTelemetry: (partial: Partial<TelemetryData>) => void;
  splits: SplitData[];
  addSplit: (split: SplitData) => void;
  resetRun: () => void;

  // Audio Engine State
  audioEnabled: boolean;
  toggleAudio: (enabled?: boolean) => void;

  // Speed Simulation Scrubber
  simulationMultiplier: number;
  setSimulationMultiplier: (mult: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Defaults
  platform: "ios",
  setPlatform: (platform) => set({ platform }),
  togglePlatform: () =>
    set((state) => ({ platform: state.platform === "ios" ? "android" : "ios" })),

  activeTab: "run",
  setActiveTab: (activeTab) => set({ activeTab }),

  isOnboarded: true, // Default to true for smooth immediate preview; toggled in Onboarding milestone
  setIsOnboarded: (isOnboarded) => set({ isOnboarded }),

  hasLocationPermission: true,
  setHasLocationPermission: (hasLocationPermission) => set({ hasLocationPermission }),

  runStatus: "IDLE",
  setRunStatus: (runStatus) => set({ runStatus }),

  telemetry: {
    distanceKm: 0.0,
    pace: "5:12",
    durationSec: 0,
    heartRate: 142,
    cadence: 168,
    elevationM: 42,
    calories: 0,
    watchSynced: true,
  },
  updateTelemetry: (partial) =>
    set((state) => ({
      telemetry: { ...state.telemetry, ...partial },
    })),

  splits: [
    { km: 1, pace: "5:18", elevationDiffM: 8, heartRate: 148 },
    { km: 2, pace: "5:14", elevationDiffM: 12, heartRate: 152 },
    { km: 3, pace: "5:09", elevationDiffM: 5, heartRate: 156 },
    { km: 4, pace: "5:11", elevationDiffM: -2, heartRate: 158 },
    { km: 5, pace: "5:06", elevationDiffM: 4, heartRate: 162 },
  ],
  addSplit: (split) =>
    set((state) => ({ splits: [...state.splits, split] })),

  resetRun: () =>
    set({
      runStatus: "IDLE",
      telemetry: {
        distanceKm: 0.0,
        pace: "0:00",
        durationSec: 0,
        heartRate: 72,
        cadence: 0,
        elevationM: 0,
        calories: 0,
        watchSynced: true,
      },
    }),

  audioEnabled: true,
  toggleAudio: (enabled) =>
    set((state) => ({
      audioEnabled: enabled !== undefined ? enabled : !state.audioEnabled,
    })),

  simulationMultiplier: 1,
  setSimulationMultiplier: (simulationMultiplier) => set({ simulationMultiplier }),
}));

// Export alias for PACE components
export const usePaceStore = useAppStore;
