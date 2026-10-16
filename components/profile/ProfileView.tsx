"use client";

import React from "react";
import { usePaceStore } from "@/lib/store";
import { triggerHaptic } from "@/lib/haptics";
import { formatDistance, formatPace, paceSuffix, unitLabel, type DistanceUnit } from "@/lib/units";

const RECORDS = [
  ["1K", "3:42", "3:42"],
  ["5K", "21:40", "4:20"],
  ["10K", "45:15", "4:31"],
  ["Half", "1:41:20", "4:48"],
];

export function ProfileView() {
  const { platform, distanceUnit, setDistanceUnit, resetOnboarding } = usePaceStore();
  const ios = platform === "ios";
  const week = formatDistance(28.4, distanceUnit, 1);
  const goal = formatDistance(40, distanceUnit, distanceUnit === "km" ? 0 : 1);
  const left = formatDistance(11.6, distanceUnit, 1);
  const label = unitLabel(distanceUnit);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <img
          src="/media/marco.jpg"
          alt="Marco Izurieta"
          className={`w-14 h-14 object-cover object-[center_18%] ${ios ? "rounded-full" : "rounded-2xl"}`}
        />
        <div>
          <h2 className={`font-semibold tracking-tight leading-tight ${ios ? "text-[28px]" : "text-[22px]"}`}>
            Marco Izurieta
          </h2>
          <p className="text-[13px] text-white/45">Half marathon · Week 4</p>
        </div>
      </header>

      <UnitSwitch
        ios={ios}
        value={distanceUnit}
        onChange={(next) => {
          if (next === distanceUnit) return;
          triggerHaptic("light");
          setDistanceUnit(next);
        }}
      />

      <section className={`flex items-center justify-between ${ios ? "" : "rounded-2xl bg-obsidian-sheet p-4"}`}>
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">This week</p>
          <p className="mt-1 text-[34px] leading-none font-semibold metric-mono">
            {week}<span className="text-[16px] text-white/40"> / {goal} {label}</span>
          </p>
          <p className="mt-1 text-[13px] text-volt">{left} {label} left before Sunday</p>
        </div>
        <Ring />
      </section>

      <section
        className={`grid grid-cols-3 divide-x divide-white/10 ${
          ios ? "py-3 border-y border-white/10" : "py-3.5 rounded-2xl bg-obsidian-sheet"
        }`}
      >
        <Stat k="Runs" v="142" />
        <Stat k="Distance" v={formatDistance(1482, distanceUnit, 0)} unit={label} />
        <Stat k="Pace" v={formatPace("5:08", distanceUnit)} unit={paceSuffix(distanceUnit)} />
      </section>

      <section className={ios ? "" : "rounded-[24px] bg-obsidian-sheet p-4"}>
        <h3 className="text-[15px] font-semibold mb-2">Latest</h3>
        <div className="flex items-center gap-3">
          <img
            src="/media/runner-portrait.jpg"
            alt=""
            className={`w-16 h-16 object-cover ${ios ? "rounded-2xl" : "rounded-xl"}`}
          />
          <div className="min-w-0">
            <p className="text-[15px] font-semibold">Morning coastal run</p>
            <p className="text-[12px] text-white/45 mt-0.5">
              Today · {formatDistance(14.2, distanceUnit, 1)} {label} · {formatPace("5:04", distanceUnit)} {paceSuffix(distanceUnit)}
            </p>
          </div>
        </div>
      </section>

      <section className={ios ? "" : "rounded-[24px] bg-obsidian-sheet px-4 py-3"}>
        <h3 className="text-[15px] font-semibold mb-1">Records</h3>
        {RECORDS.map(([name, time, pace]) => (
          <div key={name} className="flex items-center py-2.5 border-b border-white/10">
            <span className="w-12 text-[13px] text-white/40">{name}</span>
            <span className="flex-1 text-[17px] font-semibold metric-mono">{time}</span>
            <span className="text-[12px] text-white/40 metric-mono">{formatPace(pace, distanceUnit)} {paceSuffix(distanceUnit)}</span>
          </div>
        ))}
      </section>

      <section className={ios ? "" : "rounded-[24px] bg-obsidian-sheet px-4 py-3"}>
        <div className="flex items-baseline justify-between">
          <h3 className="text-[15px] font-semibold">Vaporfly 3</h3>
          <span className="text-[12px] text-white/40 metric-mono">
            {formatDistance(164, distanceUnit, 0)} / {formatDistance(500, distanceUnit, 0)} {label}
          </span>
        </div>
        <div className="mt-2 h-1 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full w-[32%] bg-volt" />
        </div>
      </section>

      <section>
        <p className="text-[11px] uppercase tracking-[0.14em] text-white/35">Developer</p>
        <button
          type="button"
          onClick={() => {
            triggerHaptic("light");
            resetOnboarding();
          }}
          className={`mt-2 h-11 w-full text-[15px] font-semibold text-white/80 border border-white/15 ${
            ios ? "rounded-2xl bg-white/5" : "rounded-xl bg-obsidian-sheet"
          }`}
        >
          Reset onboarding
        </button>
      </section>
    </div>
  );
}

function UnitSwitch({
  ios,
  value,
  onChange,
}: {
  ios: boolean;
  value: DistanceUnit;
  onChange: (unit: DistanceUnit) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Distance unit"
      className={`inline-flex w-fit p-0.5 ${ios ? "rounded-full bg-white/10" : "rounded-xl bg-obsidian-raised"}`}
    >
      {(["mi", "km"] as const).map((unit) => {
        const selected = value === unit;
        return (
          <button
            key={unit}
            onClick={() => onChange(unit)}
            aria-pressed={selected}
            className={`h-7 px-3 text-[12px] font-semibold transition-colors duration-150 ${ios ? "rounded-full" : "rounded-lg"} ${
              selected ? "bg-volt text-black" : "text-white/55"
            }`}
          >
            {unit === "mi" ? "Miles" : "Kilometers"}
          </button>
        );
      })}
    </div>
  );
}

function Stat({ k, v, unit }: { k: string; v: string; unit?: string }) {
  return (
    <div className="flex flex-col items-center px-2 text-center">
      <p className="text-[10px] uppercase tracking-[0.12em] text-white/40">{k}</p>
      <p className="mt-1 text-[20px] leading-none font-semibold metric-mono whitespace-nowrap">
        {v}
        {unit && <span className="text-[12px] font-medium text-white/40"> {unit}</span>}
      </p>
    </div>
  );
}

function Ring() {
  const r = 28;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - 0.71);
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden>
      <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
      <circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        stroke="#D4FF00"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 36 36)"
      />
      <text x="36" y="40" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">
        71%
      </text>
    </svg>
  );
}
