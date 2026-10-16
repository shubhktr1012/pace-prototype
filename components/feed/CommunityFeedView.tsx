"use client";

import React, { useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { triggerHaptic } from "@/lib/haptics";
import { sound } from "@/lib/audio";
import { usePaceStore } from "@/lib/store";
import { formatDistance, formatPace, unitLabel } from "@/lib/units";
import { Icon } from "@/components/icons/Icon";
import { DEFAULT_ROUTE, LOOP_FINISH_KM, coveredLine } from "@/components/run/course";
import { RouteTrack } from "@/components/run/RouteTrack";

const BOARD = [
  { rank: "1", name: "Marco Izurieta", km: 48.6, you: true },
  { rank: "2", name: "Sarah Jenkins", km: 42.1, you: false },
  { rank: "3", name: "David Chen", km: 39.8, you: false },
];

export function CommunityFeedView() {
  const { platform, distanceUnit, savedRun } = usePaceStore();
  const ios = platform === "ios";
  const track = useMemo(
    () => savedRun?.line ?? coveredLine(DEFAULT_ROUTE, LOOP_FINISH_KM),
    [savedRun],
  );
  const distanceKm = savedRun?.distanceKm ?? 14.2;
  const pace = savedRun?.pace ?? "5:04";
  const timeLabel = savedRun
    ? `${Math.floor(savedRun.durationSec / 60).toString().padStart(2, "0")}:${(savedRun.durationSec % 60).toString().padStart(2, "0")}`
    : "1:12:01";
  const [kudos, setKudos] = useState(42);
  const [given, setGiven] = useState(false);

  const toggleKudos = (e: React.MouseEvent<HTMLButtonElement>) => {
    triggerHaptic("success");
    sound.playBeep(880, 0.1);
    if (!given) {
      setKudos((n) => n + 1);
      setGiven(true);
      const rect = e.currentTarget.getBoundingClientRect();
      try {
        confetti({
          particleCount: 24,
          spread: 50,
          origin: {
            x: (rect.left + rect.width / 2) / window.innerWidth,
            y: (rect.top + rect.height / 2) / window.innerHeight,
          },
          colors: ["#D4FF00", "#FFFFFF"],
          ticks: 90,
          scalar: 0.7,
        });
      } catch {
        // Confetti is optional.
      }
    } else {
      setKudos((n) => n - 1);
      setGiven(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <header>
        <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">PACE Global</p>
        <h2 className={`font-semibold tracking-tight ${ios ? "text-[28px]" : "text-[22px]"}`}>Club</h2>
      </header>

      <article className={ios ? "" : "rounded-[24px] bg-obsidian-sheet p-4"}>
        <div className="flex items-center gap-3">
          <img
            src="/media/marco.jpg"
            alt=""
            className={`w-10 h-10 object-cover object-[center_18%] ${ios ? "rounded-full" : "rounded-xl"}`}
          />
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold leading-tight">Marco Izurieta</p>
            <p className="text-[12px] text-white/40">Today · San Francisco</p>
          </div>
          <span className="text-[11px] font-semibold text-volt">Founder</span>
        </div>

        <h3 className="mt-3 text-[17px] font-semibold tracking-tight">
          {savedRun ? (savedRun.loop ? "Pacific Coastal Loop" : "Crissy Field") : "Morning coastal run"}
        </h3>
        <p className="mt-1 text-[13px] text-white/60 leading-relaxed">
          {savedRun
            ? "Out along the promenade. The headwind eased after the bridge."
            : "Coach changed mile 4 because my calves were tight. Then it was smooth into the headwind."}
        </p>

        <div className={`mt-3 overflow-hidden bg-white/[0.03] ${ios ? "-mx-4" : "rounded-xl"}`}>
          <RouteTrack line={track} className="h-44 w-full" />
          <p className="px-4 pb-3 text-[12px] text-white/45">
            {savedRun && !savedRun.loop ? "Point to point" : "Crissy Field to Fort Point"}
          </p>
        </div>

        <div className="mt-3 grid grid-cols-3">
          <Stat k="Distance" v={`${formatDistance(distanceKm, distanceUnit, 1)} ${unitLabel(distanceUnit)}`} />
          <Stat k="Pace" v={formatPace(pace, distanceUnit)} />
          <Stat k="Time" v={timeLabel} />
        </div>

        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={toggleKudos}
            className={`inline-flex items-center gap-1.5 min-h-11 ${ios ? "px-1" : "px-3 rounded-full bg-white/10"}`}
            aria-pressed={given}
          >
            <Icon name="heart" size={20} filled={given} className={`transition-colors duration-150 ${given ? "text-volt" : "text-white/70"}`} />
            <span className={`text-[15px] metric-mono transition-colors duration-150 ${given ? "text-volt" : "text-white/70"}`}>{kudos}</span>
          </button>
          <span className={`inline-flex items-center gap-1.5 text-[15px] text-white/45 ${ios ? "" : "px-3 min-h-11"}`}>
            <Icon name="chat" size={18} />
            8
          </span>
        </div>
      </article>

      <section className={ios ? "" : "rounded-[24px] bg-obsidian-sheet px-4 py-3"}>
        <div className="flex items-baseline justify-between mb-1">
          <h3 className="text-[15px] font-semibold">This week</h3>
          <span className="text-[12px] text-white/40">Week 42</span>
        </div>
        {BOARD.map((row) => (
          <div key={row.rank} className="flex items-center gap-3 py-2.5 border-b border-white/10 last:border-0">
            <span
              className={`w-6 h-6 flex items-center justify-center text-[12px] metric-mono ${
                ios ? "" : "rounded-md"
              } ${row.you ? "text-volt" : "text-white/35"} ${!ios && row.you ? "bg-volt/15" : ""}`}
            >
              {row.rank}
            </span>
            <span className={`flex-1 text-[15px] ${row.you ? "font-semibold" : "text-white/80"}`}>
              {row.name}
            </span>
            <span className="text-[13px] metric-mono text-white/70">
              {formatDistance(row.km, distanceUnit, 1)} {unitLabel(distanceUnit)}
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.12em] text-white/35">{k}</p>
      <p className="text-[15px] font-semibold metric-mono mt-0.5">{v}</p>
    </div>
  );
}
