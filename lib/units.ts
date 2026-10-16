export type DistanceUnit = "mi" | "km";

const KM_PER_MILE = 1.609344;
const FEET_PER_METER = 3.28084;

export function parsePace(pace: string): number {
  const [minutes, seconds] = pace.split(":").map((part) => Number(part));
  return minutes * 60 + seconds;
}

export function formatPaceSeconds(totalSeconds: number): string {
  const rounded = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(rounded / 60);
  const seconds = rounded % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatPace(pacePerKm: string, unit: DistanceUnit): string {
  if (unit === "km") return pacePerKm;
  return formatPaceSeconds(parsePace(pacePerKm) * KM_PER_MILE);
}

export function paceSuffix(unit: DistanceUnit): "/mi" | "/km" {
  return unit === "mi" ? "/mi" : "/km";
}

export function unitWord(unit: DistanceUnit): "mile" | "kilometer" {
  return unit === "mi" ? "mile" : "kilometer";
}

export function unitLabel(unit: DistanceUnit): "mi" | "km" {
  return unit === "mi" ? "mi" : "km";
}

export function formatDistance(km: number, unit: DistanceUnit, digits = 2): string {
  const value = unit === "km" ? km : km / KM_PER_MILE;
  return value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatClimb(meters: number, unit: DistanceUnit): string {
  const value = unit === "km" ? meters : meters * FEET_PER_METER;
  const rounded = Math.round(value);
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded} ${unit === "km" ? "m" : "ft"}`;
}

export interface DisplaySplit {
  index: number;
  pace: string;
  elevationM: number;
  heartRate: number;
}

export function displaySplits(
  splits: { km: number; pace: string; elevationDiffM: number; heartRate: number }[],
  unit: DistanceUnit,
): DisplaySplit[] {
  if (unit === "km") {
    return splits.map((split) => ({
      index: split.km,
      pace: split.pace,
      elevationM: split.elevationDiffM,
      heartRate: split.heartRate,
    }));
  }

  const segments = splits.map((split) => ({
    remainKm: 1,
    secPerKm: parsePace(split.pace),
    elevPerKm: split.elevationDiffM,
    heartRate: split.heartRate,
  }));
  const totalKm = segments.length;
  const fullMiles = Math.floor(totalKm / KM_PER_MILE);
  let segIndex = 0;
  const miles: DisplaySplit[] = [];

  for (let mile = 1; mile <= fullMiles; mile++) {
    let need = KM_PER_MILE;
    let time = 0;
    let elev = 0;
    let hrWeighted = 0;
    let hrDist = 0;
    while (need > 0.0001 && segIndex < segments.length) {
      const seg = segments[segIndex];
      const take = Math.min(need, seg.remainKm);
      time += take * seg.secPerKm;
      elev += take * seg.elevPerKm;
      hrWeighted += take * seg.heartRate;
      hrDist += take;
      need -= take;
      seg.remainKm -= take;
      if (seg.remainKm <= 0.0001) segIndex += 1;
    }
    miles.push({
      index: mile,
      pace: formatPaceSeconds(time),
      elevationM: elev,
      heartRate: hrDist > 0 ? Math.round(hrWeighted / hrDist) : 0,
    });
  }

  return miles;
}
