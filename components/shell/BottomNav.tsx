"use client";

import React from "react";
import { motion } from "framer-motion";
import { usePaceStore, TabType } from "@/lib/store";
import { triggerHaptic } from "@/lib/haptics";
import { Icon, IconName } from "@/components/icons/Icon";

interface NavItem {
  id: TabType;
  label: string;
  icon: IconName;
}

const NAV_ITEMS: NavItem[] = [
  { id: "run", label: "Record", icon: "shoe" },
  { id: "coach", label: "Coach", icon: "chat" },
  { id: "feed", label: "Club", icon: "club" },
  { id: "profile", label: "You", icon: "medal" },
];

export function BottomNav() {
  const { platform, activeTab, setActiveTab, isOnboarded } = usePaceStore();
  if (!isOnboarded) return null;

  const select = (tab: TabType) => {
    if (tab !== activeTab) {
      triggerHaptic("light");
      setActiveTab(tab);
    }
  };

  if (platform === "android") {
    return (
      <nav
        aria-label="Bottom navigation"
        className="absolute bottom-0 inset-x-0 z-40 bg-[#0E1015] border-t border-white/10 pb-3 pt-1"
      >
        <div className="flex items-stretch">
          {NAV_ITEMS.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => select(item.id)}
                className="flex-1 flex flex-col items-center justify-center min-h-14 gap-0.5"
              >
                <span className="relative w-16 h-8 flex items-center justify-center">
                  {active && (
                    <motion.span
                      layoutId="android-tab"
                      transition={{ type: "spring", stiffness: 480, damping: 38 }}
                      className="absolute inset-0 rounded-full bg-volt/15"
                    />
                  )}
                  <Icon
                    name={item.icon}
                    size={22}
                    className={`relative transition-colors duration-150 ${active ? "text-volt" : "text-white/45"}`}
                  />
                </span>
                <span className={`text-[11px] transition-colors duration-150 ${active ? "text-volt font-semibold" : "text-white/45"}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav
      aria-label="Tab bar"
      className="absolute bottom-0 inset-x-0 z-40 bg-black/60 backdrop-blur-xl border-t border-white/10 pb-5 pt-1.5"
    >
      <div className="flex items-stretch">
        {NAV_ITEMS.map((item) => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => select(item.id)}
              className="flex-1 flex flex-col items-center justify-center min-h-11 gap-0.5"
            >
              <Icon name={item.icon} size={22} className={`transition-colors duration-150 ${active ? "text-volt" : "text-white/40"}`} />
              <span className={`text-[10px] tracking-tight transition-colors duration-150 ${active ? "text-volt font-semibold" : "text-white/40"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
