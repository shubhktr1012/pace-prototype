import { CRISSY_LOOP } from "./crissyLoop";

export type LngLat = [number, number];

export interface RoutePlan {
  start: number;
  end: number;
  destination: number | null;
}

export const DEFAULT_ROUTE: RoutePlan = { start: 0, end: 0, destination: null };

// The drawn loop closes on its first point. The ring is the unique vertices.
const RING: LngLat[] = CRISSY_LOOP.slice(0, -1);

// A full loop still finishes as the 5.24 km demo. A custom course finishes
// at its own length, so the runner reaches the pin they placed.
export const LOOP_FINISH_KM = 5.24;

export const segmentMetres = (a: LngLat, b: LngLat) => {
  const lat = ((a[1] + b[1]) / 2) * (Math.PI / 180);
  const dx = (b[0] - a[0]) * 111320 * Math.cos(lat);
  const dy = (b[1] - a[1]) * 110540;
  return Math.hypot(dx, dy);
};

export const normIndex = (index: number) => {
  const n = RING.length;
  return ((index % n) + n) % n;
};

export const vertex = (index: number): LngLat => RING[normIndex(index)];

export const indexesNear = (a: number, b: number) => {
  if (normIndex(a) === normIndex(b)) return true;
  return segmentMetres(vertex(a), vertex(b)) < 40;
};

export const nearestVertex = (lngLat: LngLat) => {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < RING.length; i++) {
    const d = segmentMetres(lngLat, RING[i]);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
};

const sliceForward = (from: number, to: number): LngLat[] => {
  const n = RING.length;
  const out: LngLat[] = [RING[from]];
  let i = from;
  for (let step = 0; step < n; step++) {
    if (i === to) break;
    i = (i + 1) % n;
    out.push(RING[i]);
  }
  return out;
};

export const lineMetres = (line: LngLat[]) => {
  let metres = 0;
  for (let i = 1; i < line.length; i++) metres += segmentMetres(line[i - 1], line[i]);
  return metres;
};

const sliceShorter = (from: number, to: number): LngLat[] => {
  if (from === to) return [RING[from]];
  const forward = sliceForward(from, to);
  const reverse = sliceForward(to, from).reverse();
  return lineMetres(forward) <= lineMetres(reverse) ? forward : reverse;
};

const rotateLoop = (start: number): LngLat[] => [
  ...RING.slice(start),
  ...RING.slice(0, start),
  RING[start],
];

export const isClosedLoop = (plan: RoutePlan) =>
  plan.destination == null && normIndex(plan.end) === normIndex(plan.start);

export const buildCourse = (plan: RoutePlan): LngLat[] => {
  const start = normIndex(plan.start);
  const end = normIndex(plan.end);
  const dest = plan.destination == null ? null : normIndex(plan.destination);
  if (dest == null && end === start) return rotateLoop(start);
  if (dest == null) return sliceShorter(start, end);
  if (end === start) {
    const going = sliceShorter(start, dest);
    return [...going, ...[...going].reverse().slice(1)];
  }
  const out = sliceShorter(start, dest);
  const back = sliceShorter(dest, end);
  return [...out, ...back.slice(1)];
};

export const finishKm = (plan: RoutePlan) => {
  if (isClosedLoop(plan)) return LOOP_FINISH_KM;
  return Math.max(lineMetres(buildCourse(plan)) / 1000, 0.05);
};

export const pointAt = (line: LngLat[], metres: number): LngLat => {
  if (line.length === 0) return RING[0];
  if (line.length === 1 || metres <= 0) return line[0];
  let walked = 0;
  for (let i = 1; i < line.length; i++) {
    const span = segmentMetres(line[i - 1], line[i]);
    if (walked + span >= metres) {
      const f = span === 0 ? 0 : (metres - walked) / span;
      const a = line[i - 1];
      const b = line[i];
      return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
    }
    walked += span;
  }
  return line[line.length - 1];
};

export const simplifyLine = (line: LngLat[], maxPoints = 80): LngLat[] => {
  if (line.length <= maxPoints) return line;
  const total = lineMetres(line);
  const out: LngLat[] = [];
  for (let i = 0; i < maxPoints; i++) out.push(pointAt(line, (total * i) / (maxPoints - 1)));
  return out;
};

// The part of the course the runner has actually covered.
export const coveredLine = (plan: RoutePlan, distanceKm: number): LngLat[] => {
  const course = buildCourse(plan);
  if (course.length < 2) return course;
  const progress = Math.min(1, Math.max(0, distanceKm / finishKm(plan)));
  const done = lineUntil(course, lineMetres(course) * progress);
  return simplifyLine(done.length >= 2 ? done : course);
};

export const lineUntil = (line: LngLat[], metres: number): LngLat[] => {
  if (metres <= 0 || line.length === 0) return [];
  const out: LngLat[] = [line[0]];
  let walked = 0;
  for (let i = 1; i < line.length; i++) {
    const span = segmentMetres(line[i - 1], line[i]);
    if (walked + span >= metres) {
      out.push(pointAt(line, metres));
      return out;
    }
    walked += span;
    out.push(line[i]);
  }
  return line;
};
