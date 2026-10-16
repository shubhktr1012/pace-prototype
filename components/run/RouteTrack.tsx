"use client";

import React, { useMemo } from "react";
import type { LngLat } from "./course";

// A Strava-style track: the route shape, no basemap, fitted to the card.
function project(line: LngLat[]) {
  const width = 320;
  const height = 180;
  const pad = 20;
  const lat0 = line.reduce((sum, point) => sum + point[1], 0) / line.length;
  const cos = Math.cos((lat0 * Math.PI) / 180);
  const pts = line.map(([lng, lat]) => ({ x: lng * cos * 111320, y: -lat * 110540 }));
  const minX = Math.min(...pts.map((point) => point.x));
  const maxX = Math.max(...pts.map((point) => point.x));
  const minY = Math.min(...pts.map((point) => point.y));
  const maxY = Math.max(...pts.map((point) => point.y));
  const spanX = Math.max(maxX - minX, 1);
  const spanY = Math.max(maxY - minY, 1);
  const scale = Math.min((width - pad * 2) / spanX, (height - pad * 2) / spanY);
  const ox = (width - spanX * scale) / 2;
  const oy = (height - spanY * scale) / 2;
  const mapped = pts.map((point) => ({
    x: ox + (point.x - minX) * scale,
    y: oy + (point.y - minY) * scale,
  }));
  const d = mapped
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(" ");
  const start = mapped[0];
  const end = mapped[mapped.length - 1];
  return {
    d,
    start,
    end,
    endDistinct: Math.hypot(start.x - end.x, start.y - end.y) > 10,
  };
}

export function RouteTrack({ line, className }: { line: LngLat[]; className?: string }) {
  const drawn = useMemo(() => (line.length >= 2 ? project(line) : null), [line]);
  if (!drawn) return null;

  return (
    <svg viewBox="0 0 320 180" className={className} role="img" aria-label="Route track">
      <path d={drawn.d} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <path d={drawn.d} fill="none" stroke="#D4FF00" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={drawn.start.x} cy={drawn.start.y} r="5.5" fill="#07080A" />
      <circle cx={drawn.start.x} cy={drawn.start.y} r="3.2" fill="#00E5FF" />
      {drawn.endDistinct && (
        <>
          <circle cx={drawn.end.x} cy={drawn.end.y} r="5.5" fill="#07080A" />
          <circle cx={drawn.end.x} cy={drawn.end.y} r="3.2" fill="#FFFFFF" />
        </>
      )}
    </svg>
  );
}
