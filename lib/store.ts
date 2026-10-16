import { create } from "zustand";
import type { DistanceUnit } from "@/lib/units";
import { DEFAULT_ROUTE, indexesNear, normIndex, type LngLat, type RoutePlan } from "@/components/run/course";

export type PlatformType = "ios" | "android";
export type { DistanceUnit };
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

export interface SavedRun {
  distanceKm: number;
  durationSec: number;
  pace: string;
  loop: boolean;
  line: LngLat[];
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
  resetOnboarding: () => void;

  // Run Lifecycle & Telemetry
  runStatus: RunStatus;
  setRunStatus: (status: RunStatus) => void;
  routePlan: RoutePlan;
  placeRoutePoint: (kind: "start" | "end" | "destination", index: number) => void;
  clearDestination: () => void;
  resetRoutePlan: () => void;
  savedRun: SavedRun | null;
  saveRun: (run: SavedRun) => void;
  // Bumped by the locate button; the map refocuses on the runner when it changes.
  mapFocusRequest: number;
  requestMapFocus: () => void;
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

  distanceUnit: DistanceUnit;
  setDistanceUnit: (unit: DistanceUnit) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Defaults
  platform: "ios",
  setPlatform: (platform) => set({ platform }),
  togglePlatform: () =>
    set((state) => ({ platform: state.platform === "ios" ? "android" : "ios" })),

  activeTab: "run",
  setActiveTab: (activeTab) => set({ activeTab }),

  isOnboarded: false,
  setIsOnboarded: (isOnboarded) => set({ isOnboarded }),

  hasLocationPermission: false,
  setHasLocationPermission: (hasLocationPermission) => set({ hasLocationPermission }),
  resetOnboarding: () => {
    sessionStorage.removeItem("pace-onboarded");
    sessionStorage.removeItem("pace-location");
    set({
      isOnboarded: false,
      hasLocationPermission: false,
      activeTab: "run",
      runStatus: "IDLE",
      routePlan: DEFAULT_ROUTE,
      savedRun: null,
      simulationMultiplier: 1,
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
    });
  },

  runStatus: "IDLE",
  setRunStatus: (runStatus) => set({ runStatus }),

  routePlan: DEFAULT_ROUTE,
  placeRoutePoint: (kind, index) =>
    set((state) => {
      const plan = { ...state.routePlan };
      const i = normIndex(index);
      if (kind === "start") {
        // An end that matched the start keeps following it.
        const followed = plan.end === plan.start;
        plan.start = i;
        if (followed || indexesNear(plan.end, i)) plan.end = i;
        if (plan.destination != null && indexesNear(plan.destination, i)) plan.destination = null;
      } else if (kind === "end") {
        plan.end = indexesNear(plan.start, i) ? plan.start : i;
        if (plan.destination != null && indexesNear(plan.destination, plan.end)) plan.destination = null;
      } else if (!indexesNear(plan.start, i) && !indexesNear(plan.end, i)) {
        plan.destination = i;
      }
      return { routePlan: plan };
    }),
  clearDestination: () =>
    set((state) => ({ routePlan: { ...state.routePlan, destination: null } })),
  resetRoutePlan: () => set({ routePlan: DEFAULT_ROUTE }),
  savedRun: null,
  saveRun: (savedRun) => set({ savedRun }),
  mapFocusRequest: 0,
  requestMapFocus: () => set((state) => ({ mapFocusRequest: state.mapFocusRequest + 1 })),

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
      simulationMultiplier: 1,
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
    }),

  audioEnabled: true,
  toggleAudio: (enabled) =>
    set((state) => ({
      audioEnabled: enabled !== undefined ? enabled : !state.audioEnabled,
    })),

  distanceUnit: "mi",
  setDistanceUnit: (distanceUnit) => set({ distanceUnit }),

  simulationMultiplier: 1,
  setSimulationMultiplier: (simulationMultiplier) =>
    set({
      simulationMultiplier:
        Number.isFinite(simulationMultiplier) && simulationMultiplier >= 1
          ? simulationMultiplier
          : 1,
    }),
}));

// Export alias for PACE components
export const usePaceStore = useAppStore;
