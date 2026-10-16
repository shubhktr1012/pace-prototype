"use client";

import React from "react";
import { Award, Zap, Compass, CheckCircle2 } from "lucide-react";

export function ProfileView() {
  return (
    <div className="flex-1 flex flex-col justify-start space-y-4 overflow-y-auto no-scrollbar pb-3">
      {/* Profile Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-white/10">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-volt via-cyan to-white p-[2px]">
          <div className="w-full h-full rounded-full bg-[#0E1015] flex items-center justify-center text-sm font-black text-volt">
            MI
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="font-bold text-sm text-white">Marco Izurieta</h2>
            <CheckCircle2 className="w-3.5 h-3.5 text-volt" />
          </div>
          <p className="text-[11px] text-white/50">
            Half Marathon Trainee · PACE Elite Member
          </p>
        </div>
      </div>

      {/* Weekly Mileage Circular Ring Bento */}
      <div className="bg-[#13161F] border border-white/10 rounded-2xl p-4 shadow-md flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider block mb-1">
            Weekly Mileage Target
          </span>
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-3xl font-black metric-mono text-white">28.4</span>
            <span className="text-xs text-white/40 font-mono">/ 40.0 km</span>
          </div>
          <p className="text-[11px] text-volt font-medium">
            11.6 km remaining · On pace for Sunday goal
          </p>
        </div>

        {/* Circular Progress Ring */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r="32"
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="7"
            />
            <circle
              cx="40"
              cy="40"
              r="32"
              fill="none"
              stroke="#D4FF00"
              strokeWidth="7"
              strokeDasharray={201}
              strokeDashoffset={201 * (1 - 0.71)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute text-center">
            <span className="text-xs font-black metric-mono text-white">71%</span>
          </div>
        </div>
      </div>

      {/* Lifetime Athletic Metrics */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#13161F] border border-white/5 rounded-xl p-2.5 text-center">
          <span className="text-[9px] text-white/40 uppercase block mb-0.5">Total Runs</span>
          <span className="text-sm font-black metric-mono text-white">142</span>
        </div>
        <div className="bg-[#13161F] border border-white/5 rounded-xl p-2.5 text-center">
          <span className="text-[9px] text-white/40 uppercase block mb-0.5">Total Km</span>
          <span className="text-sm font-black metric-mono text-white">1,482</span>
        </div>
        <div className="bg-[#13161F] border border-white/5 rounded-xl p-2.5 text-center">
          <span className="text-[9px] text-white/40 uppercase block mb-0.5">Avg Pace</span>
          <span className="text-sm font-black metric-mono text-volt">5:08</span>
        </div>
      </div>

      {/* Personal Records Showcase */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
            Personal Records
          </p>
          <Award className="w-3.5 h-3.5 text-volt" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#0E1015] border border-white/10 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[10px] text-white/40 uppercase">1K Sprint</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-base font-black metric-mono text-white">3:42</span>
              <span className="text-[9px] text-cyan font-mono">Pace 3:42</span>
            </div>
          </div>

          <div className="bg-[#0E1015] border border-white/10 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[10px] text-white/40 uppercase">5K Best</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-base font-black metric-mono text-white">21:40</span>
              <span className="text-[9px] text-volt font-mono">Pace 4:20</span>
            </div>
          </div>

          <div className="bg-[#0E1015] border border-white/10 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[10px] text-white/40 uppercase">10K Best</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-base font-black metric-mono text-white">45:15</span>
              <span className="text-[9px] text-white/50 font-mono">Pace 4:31</span>
            </div>
          </div>

          <div className="bg-[#0E1015] border border-white/10 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[10px] text-white/40 uppercase">Half Marathon</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-base font-black metric-mono text-white">1:41:20</span>
              <span className="text-[9px] text-white/50 font-mono">Pace 4:48</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gear Tracker Odometer */}
      <div className="bg-[#13161F] border border-white/10 rounded-2xl p-3.5">
        <div className="flex items-center justify-between mb-1.5 text-xs">
          <span className="text-white font-bold">Nike Vaporfly 3</span>
          <span className="text-white/40 font-mono text-[11px]">164 / 500 km</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mb-1">
          <div className="h-full bg-volt rounded-full w-[32%]" />
        </div>
        <span className="text-[10px] text-white/40">32% wear · Optimal cushion remaining</span>
      </div>
    </div>
  );
}
