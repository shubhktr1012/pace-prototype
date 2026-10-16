"use client";

import React, { useEffect, useRef } from "react";
import { usePaceStore } from "@/lib/store";

interface Point {
  x: number;
  y: number;
}

// Normalized coordinate loop representing the San Francisco Marina to Fort Point coastal route
const ROUTE_WAYPOINTS: Point[] = [
  { x: 0.12, y: 0.78 }, // Marina Green East
  { x: 0.22, y: 0.70 }, // Marina Blvd
  { x: 0.35, y: 0.62 }, // Marina Green West
  { x: 0.48, y: 0.52 }, // Mason St Promenade
  { x: 0.58, y: 0.42 }, // Crissy Field East
  { x: 0.68, y: 0.35 }, // Crissy Field Marsh
  { x: 0.76, y: 0.28 }, // Crissy Beach Path
  { x: 0.85, y: 0.22 }, // Marine Drive
  { x: 0.90, y: 0.16 }, // Fort Point Overlook
  { x: 0.86, y: 0.20 }, // Turnaround Loop
  { x: 0.74, y: 0.32 }, // Return Path Shoreline
  { x: 0.60, y: 0.44 }, // Crissy Center
  { x: 0.44, y: 0.58 }, // Battery East Trail
  { x: 0.28, y: 0.72 }, // Marina Green Return
  { x: 0.14, y: 0.77 }, // Finish Gate
];

export function RunMapCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { runStatus, telemetry } = usePaceStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let pulseAngle = 0;

    const render = () => {
      const dpr = window.devicePixelRatio || 2;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // 1. Dark athletic topography backdrop
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, "#080A0E");
      bgGrad.addColorStop(1, "#0D1017");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle water / bay boundary gradient along upper section
      const waterGrad = ctx.createLinearGradient(0, 0, width, height * 0.4);
      waterGrad.addColorStop(0, "rgba(0, 229, 255, 0.04)");
      waterGrad.addColorStop(1, "transparent");
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, 0, width, height * 0.45);

      // 2. Vector street grid lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.035)";
      ctx.lineWidth = 1;
      const gridSize = 28;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 3. Topographic contour arcs (Subtle elevation visual)
      ctx.strokeStyle = "rgba(212, 255, 0, 0.025)";
      ctx.lineWidth = 1.5;
      for (let r = 80; r < width * 1.2; r += 70) {
        ctx.beginPath();
        ctx.arc(width * 0.9, height * 0.1, r, Math.PI * 0.4, Math.PI * 1.1);
        ctx.stroke();
      }

      // Convert normalized waypoints to screen pixels with comfortable padding
      const paddingX = 36;
      const paddingY = 40;
      const innerW = width - paddingX * 2;
      const innerH = height - paddingY * 2;

      const screenPts: Point[] = ROUTE_WAYPOINTS.map((pt) => ({
        x: paddingX + pt.x * innerW,
        y: paddingY + pt.y * innerH,
      }));

      // 4. Draw base route shadow / roadbed
      ctx.beginPath();
      ctx.moveTo(screenPts[0].x, screenPts[0].y);
      for (let i = 1; i < screenPts.length; i++) {
        const xc = (screenPts[i - 1].x + screenPts[i].x) / 2;
        const yc = (screenPts[i - 1].y + screenPts[i].y) / 2;
        ctx.quadraticCurveTo(screenPts[i - 1].x, screenPts[i - 1].y, xc, yc);
      }
      ctx.lineTo(screenPts[screenPts.length - 1].x, screenPts[screenPts.length - 1].y);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      // 5. Draw active glowing polyline (Electric Volt with neon blur)
      // Progress calculation based on distance up to 5.24 km
      const maxDistance = 5.24;
      const progressRatio = Math.min(1, Math.max(0.08, telemetry.distanceKm / maxDistance));
      const targetIndex = (screenPts.length - 1) * progressRatio;
      const baseIndex = Math.floor(targetIndex);
      const frac = targetIndex - baseIndex;

      // Outer neon volt halo
      ctx.shadowColor = "#D4FF00";
      ctx.shadowBlur = 14;
      ctx.strokeStyle = "rgba(212, 255, 0, 0.4)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(screenPts[0].x, screenPts[0].y);
      for (let i = 1; i <= baseIndex; i++) {
        ctx.lineTo(screenPts[i].x, screenPts[i].y);
      }
      if (baseIndex < screenPts.length - 1) {
        const cur = screenPts[baseIndex];
        const nxt = screenPts[baseIndex + 1];
        ctx.lineTo(cur.x + (nxt.x - cur.x) * frac, cur.y + (nxt.y - cur.y) * frac);
      }
      ctx.stroke();

      // Inner crisp volt core
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#D4FF00";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Current runner position along path
      let runnerX = screenPts[0].x;
      let runnerY = screenPts[0].y;
      let heading = 0;

      if (baseIndex < screenPts.length - 1) {
        const p1 = screenPts[baseIndex];
        const p2 = screenPts[baseIndex + 1];
        runnerX = p1.x + (p2.x - p1.x) * frac;
        runnerY = p1.y + (p2.y - p1.y) * frac;
        heading = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      } else {
        const last = screenPts[screenPts.length - 1];
        runnerX = last.x;
        runnerY = last.y;
      }

      // 6. Start Flag / Milestone pin
      ctx.fillStyle = "#00E5FF";
      ctx.beginPath();
      ctx.arc(screenPts[0].x, screenPts[0].y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Start label
      ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
      ctx.font = "bold 9px sans-serif";
      ctx.fillText("MARINA GREEN", screenPts[0].x - 12, screenPts[0].y + 16);

      // 7. Dynamic Runner Beacon (Pulsing Radar + Heading Cone)
      pulseAngle += 0.045;
      const pulseSize = 10 + Math.sin(pulseAngle) * 5;
      const pulseAlpha = 0.5 - Math.sin(pulseAngle) * 0.25;

      // Radar ripple
      ctx.strokeStyle = `rgba(212, 255, 0, ${pulseAlpha})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(runnerX, runnerY, pulseSize, 0, Math.PI * 2);
      ctx.stroke();

      // Heading directional beam cone
      ctx.save();
      ctx.translate(runnerX, runnerY);
      ctx.rotate(heading);

      const coneGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 24);
      coneGrad.addColorStop(0, "rgba(212, 255, 0, 0.35)");
      coneGrad.addColorStop(1, "rgba(212, 255, 0, 0)");
      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 22, -Math.PI / 4, Math.PI / 4);
      ctx.closePath();
      ctx.fill();

      // Solid inner core dot
      ctx.shadowColor = "#D4FF00";
      ctx.shadowBlur = 8;
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#D4FF00";
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      ctx.restore();

      if (runStatus === "RUNNING") {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    // If running, continuously animate
    if (runStatus === "RUNNING") {
      animationFrameId = requestAnimationFrame(render);
    }

    const handleResize = () => {
      render();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [runStatus, telemetry.distanceKm]);

  return (
    <div className="w-full h-full relative overflow-hidden select-none">
      <canvas ref={canvasRef} className="w-full h-full block" />
      
      {/* Subtle vignette shadow overlays around borders */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#07080A] via-[#07080A]/60 to-transparent pointer-events-none" />
    </div>
  );
}
