"use client";

import React from "react";
import { motion } from "framer-motion";
import { useAppStore, TabType } from "@/lib/store";
import { haptics } from "@/lib/haptics";
import { Flame, Sparkles, Users, Trophy } from "lucide-react";

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "run",
    label: "Track",
    icon: Flame,
  },
  {
    id: "coach",
    label: "Coach AI",
    icon: Sparkles,
    badge: "AI",
  },
  {
    id: "feed",
    label: "Club",
    icon: Users,
  },
  {
    id: "profile",
    label: "Athlete",
    icon: Trophy,
  },
];

export function BottomNav() {
  const { platform, activeTab, setActiveTab } = useAppStore();

  const handleSelectTab = (tab: TabType) => {
    if (tab !== activeTab) {
      haptics.light();
      setActiveTab(tab);
    }
  };

  // Android 15 Material 3 Surface Dock
  if (platform === "android") {
    return (
      <nav
        aria-label="Bottom Navigation"
        className="w-full bg-[#0E1015] border-t border-white/[0.08] px-4 pt-2 pb-5 z-40 relative flex items-center justify-around"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className="flex-1 flex flex-col items-center justify-center relative py-1 focus:outline-none tap-highlight-transparent"
            >
              {/* Material 3 Sliding Active Pill Indicator */}
              <div className="relative w-14 h-8 flex items-center justify-center">
                {isActive && (
                  <motion.div
                    layoutId="android-m3-pill"
                    transition={{
                      type: "spring",
                      stiffness: 450,
                      damping: 36,
                    }}
                    className="absolute inset-0 bg-volt/15 rounded-full border border-volt/30 shadow-[0_0_12px_rgba(212,255,0,0.15)]"
                  />
                )}
                <Icon
                  className={`w-5 h-5 relative z-10 transition-colors duration-200 ${
                    isActive ? "text-volt" : "text-white/45"
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-0.5 -right-0.5 z-20 text-[8px] font-bold px-1 py-[1px] rounded-full bg-volt text-black tracking-tighter shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Tab Label */}
              <span
                className={`text-[11px] font-medium tracking-tight mt-1 transition-colors duration-200 ${
                  isActive ? "text-volt font-semibold" : "text-white/45"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    );
  }

  // iOS 18 Frosted Glass Floating Dock
  return (
    <nav
      aria-label="Bottom Navigation"
      className="w-full bg-[#13161F]/80 backdrop-blur-2xl border-t border-white/[0.08] px-3 pt-2.5 pb-6 z-40 relative flex items-center justify-around shadow-[0_-8px_24px_rgba(0,0,0,0.6)]"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.id;
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            onClick={() => handleSelectTab(item.id)}
            className="flex-1 flex flex-col items-center justify-center relative py-1 focus:outline-none transition-transform active:scale-95"
          >
            {/* iOS Active Top Specular Indicator */}
            {isActive && (
              <motion.div
                layoutId="ios-active-glow"
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 34,
                }}
                className="absolute -top-2.5 w-8 h-[2px] bg-volt rounded-full shadow-[0_0_8px_#D4FF00]"
              />
            )}

            <div className="relative">
              <Icon
                className={`w-[22px] h-[22px] transition-colors duration-200 ${
                  isActive ? "text-volt drop-shadow-[0_0_8px_rgba(212,255,0,0.4)]" : "text-white/40"
                }`}
              />
              {item.badge && (
                <span className="absolute -top-1.5 -right-3 text-[9px] font-extrabold px-1 py-[0.5px] rounded-full bg-volt text-black tracking-tighter">
                  {item.badge}
                </span>
              )}
            </div>

            <span
              className={`text-[10px] font-medium tracking-tight mt-1 transition-colors duration-200 ${
                isActive ? "text-volt font-semibold" : "text-white/40"
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
