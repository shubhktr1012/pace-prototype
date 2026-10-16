"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { triggerHaptic } from "@/lib/haptics";
import { sound } from "@/lib/audio";
import { Heart, Trophy, Flame, Share2, MessageCircle, MapPin, TrendingUp, CheckCircle } from "lucide-react";

export function CommunityFeedView() {
  const [kudosCount, setKudosCount] = useState(42);
  const [hasGivenKudos, setHasGivenKudos] = useState(false);

  const handleKudos = (e: React.MouseEvent<HTMLButtonElement>) => {
    triggerHaptic("heavy");
    sound.playBeep(880, 0.12, "sine");

    if (!hasGivenKudos) {
      setKudosCount((prev) => prev + 1);
      setHasGivenKudos(true);

      // Trigger celebratory micro-confetti burst from the button position
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      try {
        confetti({
          particleCount: 28,
          spread: 60,
          origin: { x, y },
          colors: ["#D4FF00", "#00E5FF", "#FF3B30", "#FFFFFF"],
          ticks: 120,
          gravity: 1.2,
          scalar: 0.8,
        });
      } catch {
        // Fallback
      }
    } else {
      setKudosCount((prev) => prev - 1);
      setHasGivenKudos(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-start space-y-4 overflow-y-auto no-scrollbar pb-3">
      {/* Club Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h2 className="font-bold text-sm text-white flex items-center gap-1.5">
            PACE Global Run Club
            <span className="w-2 h-2 rounded-full bg-volt" />
          </h2>
          <p className="text-[10px] text-white/50">
            Leaderboard & Community Feed
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-volt/10 border border-volt/30 px-2.5 py-1 rounded-full">
          <Trophy className="w-3.5 h-3.5 text-volt" />
          <span className="text-[10px] font-bold text-volt">#1 Club Rank</span>
        </div>
      </div>

      {/* Featured Athlete Card: Marco Izurieta */}
      <div className="bg-[#13161F] border border-white/10 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-volt via-cyan to-white p-[1.5px]">
              <div className="w-full h-full rounded-full bg-[#0E1015] flex items-center justify-center text-xs font-black text-white">
                MI
              </div>
            </div>
            <div>
              <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
                Marco Izurieta
                <span className="text-[9px] px-2 py-0.5 bg-volt/20 text-volt rounded-full font-bold border border-volt/30 uppercase">
                  FOUNDER
                </span>
              </h4>
              <p className="text-[10px] text-white/40 flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5 text-volt" /> San Francisco · Today at 6:42 AM
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-black font-mono text-volt">14.2</span>
            <span className="text-[10px] text-white/40 uppercase ml-0.5">km</span>
          </div>
        </div>

        <p className="text-xs text-white/80 leading-relaxed mb-3">
          "Pre-dawn coastal tempo. Coach PACE adapted intervals around mile 4 for calf recovery. Felt effortless and smooth into the headwind!"
        </p>

        {/* Mini Polyline Vector Preview */}
        <div className="w-full h-24 bg-[#0A0C10] rounded-xl border border-white/5 relative overflow-hidden mb-3">
          <svg className="w-full h-full" viewBox="0 0 300 90" fill="none">
            <path
              d="M 20 70 Q 70 20 140 50 T 220 30 T 280 20"
              stroke="#D4FF00"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="280" cy="20" r="4" fill="#D4FF00" />
          </svg>
          <div className="absolute bottom-2 left-2.5 flex items-center gap-3 text-[10px] text-white/60 font-mono">
            <span>Avg: 5:04 /km</span>
            <span>·</span>
            <span className="flex items-center gap-0.5 text-cyan">
              <TrendingUp className="w-2.5 h-2.5" /> +68m
            </span>
          </div>
        </div>

        {/* Card Social Metrics & Kudos Button */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
          <div className="flex items-center gap-3 text-white/50 text-[11px]">
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" /> 8 comments
            </span>
            <span className="flex items-center gap-1">
              <Share2 className="w-3.5 h-3.5" /> Share
            </span>
          </div>

          <button
            onClick={handleKudos}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs transition-all active:scale-95 ${
              hasGivenKudos
                ? "bg-volt text-black shadow-[0_0_15px_rgba(212,255,0,0.4)]"
                : "bg-white/10 text-white hover:bg-white/15"
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                hasGivenKudos ? "fill-black" : "text-volt"
              }`}
            />
            <span>{kudosCount} Kudos</span>
          </button>
        </div>
      </div>

      {/* PACE Global Run Club Weekly Leaderboard */}
      <div className="bg-[#13161F] border border-white/10 rounded-2xl p-4 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">
            Weekly Mileage Leaderboard
          </span>
          <span className="text-[10px] text-volt font-mono font-bold">Week 42</span>
        </div>

        <div className="space-y-2">
          {/* Rank 1: Marco */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-volt/10 border border-volt/30">
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-volt text-black font-black text-[10px] flex items-center justify-center">
                1
              </span>
              <div>
                <span className="font-bold text-xs text-white">Marco Izurieta</span>
                <span className="text-[9px] text-volt block">Top Performer</span>
              </div>
            </div>
            <span className="font-mono font-black text-xs text-white">48.6 km</span>
          </div>

          {/* Rank 2 */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-white/20 text-white font-bold text-[10px] flex items-center justify-center">
                2
              </span>
              <span className="font-semibold text-xs text-white/80">Sarah Jenkins</span>
            </div>
            <span className="font-mono text-xs text-white/70">42.1 km</span>
          </div>

          {/* Rank 3 */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-white/10 text-white/60 font-bold text-[10px] flex items-center justify-center">
                3
              </span>
              <span className="font-semibold text-xs text-white/80">David Chen</span>
            </div>
            <span className="font-mono text-xs text-white/70">39.8 km</span>
          </div>
        </div>
      </div>
    </div>
  );
}
