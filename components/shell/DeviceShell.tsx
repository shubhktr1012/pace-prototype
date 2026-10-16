"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore, PlatformType } from "@/lib/store";
import { haptics } from "@/lib/haptics";
import { DynamicIslandHUD } from "./DynamicIslandHUD";
import { BottomNav } from "./BottomNav";
import { Smartphone, CheckCircle2 } from "lucide-react";

interface DeviceShellProps {
  children: React.ReactNode;
}

export function DeviceShell({ children }: DeviceShellProps) {
  const { platform, setPlatform } = useAppStore();
  const [scale, setScale] = useState(1);
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  // Auto-detect mobile devices & calculate desktop auto-fit scale
  useEffect(() => {
    const handleResize = () => {
      if (typeof window === "undefined") return;

      const isMobile = window.innerWidth < 768;
      setIsMobileScreen(isMobile);

      if (isMobile) {
        setScale(1);
        const ua = navigator.userAgent || "";
        if (/iPhone|iPad|iPod/i.test(ua)) {
          setPlatform("ios");
        } else if (/Android/i.test(ua)) {
          setPlatform("android");
        }
      } else {
        // Desktop: fit 852px chassis + header + footer within window.innerHeight
        const availableH = window.innerHeight - 120;
        const computedScale = Math.min(1, Math.max(0.55, availableH / 870));
        setScale(computedScale);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setPlatform]);

  const handlePlatformSwitch = (newPlatform: PlatformType) => {
    if (newPlatform !== platform) {
      haptics.medium();
      setPlatform(newPlatform);
    }
  };

  return (
    <div className="h-screen w-full bg-[#07080A] text-white flex flex-col items-center justify-between relative overflow-hidden selection:bg-volt selection:text-black">
      {/* Ambient Volt Backdrop Glow (Desktop only) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden hidden md:block">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] bg-[radial-gradient(ellipse_at_center,rgba(212,255,0,0.06)_0%,rgba(0,229,255,0.02)_40%,transparent_70%)] blur-3xl pointer-events-none" />
        <div className="absolute -top-32 left-1/4 w-[420px] h-[420px] bg-volt/5 blur-[120px] rounded-full pointer-events-none" />
      </div>

      {/* Desktop Hardware Control Bar */}
      <header className="w-full max-w-4xl pt-3 pb-1 px-6 hidden md:flex items-center justify-between z-30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-xl bg-volt/10 border border-volt/30 flex items-center justify-center shadow-[0_0_15px_rgba(212,255,0,0.2)]">
            <span className="text-volt font-black text-xs tracking-tighter">P</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-xs tracking-tight text-white">PACE</h1>
              <span className="text-[9px] font-semibold tracking-wider uppercase px-2 py-0.2 rounded-full bg-volt/15 text-volt border border-volt/30">
                PROTOTYPE V1
              </span>
            </div>
            <p className="text-[10px] text-white/50 tracking-tight">
              Prepared for Marco Izurieta · Strava + Runna + AI Coach
            </p>
          </div>
        </div>

        {/* Dual-OS Chameleon Switcher Pill */}
        <div className="flex items-center gap-1.5 p-1 bg-[#13161F] rounded-full border border-white/10 shadow-2xl">
          <button
            onClick={() => handlePlatformSwitch("ios")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
              platform === "ios"
                ? "bg-white text-black shadow-lg"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>iPhone 16 Pro</span>
            {platform === "ios" && (
              <span className="w-1.5 h-1.5 rounded-full bg-black/60" />
            )}
          </button>

          <button
            onClick={() => handlePlatformSwitch("android")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
              platform === "android"
                ? "bg-volt text-black shadow-lg shadow-volt/20"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Pixel 9 Pro</span>
            {platform === "android" && (
              <span className="w-1.5 h-1.5 rounded-full bg-black/60" />
            )}
          </button>
        </div>
      </header>

      {/* Main Hardware Chassis Container with Outer Scaling Wrapper */}
      <main className="w-full flex items-center justify-center flex-1 overflow-hidden">
        <div
          style={{
            width: isMobileScreen ? "100%" : `${393 * scale}px`,
            height: isMobileScreen ? "100dvh" : `${852 * scale}px`,
            transition: "width 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), height 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
          className="relative flex items-center justify-center flex-shrink-0"
        >
          <div
            style={{
              transform: isMobileScreen ? "none" : `scale(${scale})`,
              transformOrigin: "center center",
              width: isMobileScreen ? "100%" : "393px",
              height: isMobileScreen ? "100dvh" : "852px",
            }}
            className="relative flex items-center justify-center flex-shrink-0"
          >
            {/* PHYSICAL HARDWARE BUTTONS (Desktop Mode Only) */}
            {!isMobileScreen && platform === "ios" && (
              <>
                {/* Action Button (Left Up 1) */}
                <div
                  title="Action Button"
                  className="absolute -left-[14px] top-[135px] w-[5px] h-[32px] bg-[#35363C] rounded-l-[3px] border-l border-t border-b border-white/20 shadow-[-2px_0_5px_rgba(0,0,0,0.8)] z-10"
                />

                {/* Volume Up Button (Left Up 2) */}
                <div
                  title="Volume Up"
                  className="absolute -left-[14px] top-[185px] w-[5px] h-[64px] bg-[#35363C] rounded-l-[3px] border-l border-t border-b border-white/20 shadow-[-2px_0_5px_rgba(0,0,0,0.8)] z-10"
                />

                {/* Volume Down Button (Left Down) */}
                <div
                  title="Volume Down"
                  className="absolute -left-[14px] top-[260px] w-[5px] h-[64px] bg-[#35363C] rounded-l-[3px] border-l border-t border-b border-white/20 shadow-[-2px_0_5px_rgba(0,0,0,0.8)] z-10"
                />

                {/* Power / Side Button (Right Power) */}
                <div
                  title="Power / Siri Button"
                  className="absolute -right-[14px] top-[205px] w-[5px] h-[92px] bg-[#35363C] rounded-r-[3px] border-r border-t border-b border-white/20 shadow-[2px_0_5px_rgba(0,0,0,0.8)] z-10"
                />

                {/* iPhone 16 Sapphire Glass Camera Control Button (Right Down) */}
                <div
                  title="Camera Control Button (Capacitive & Force-sensitive)"
                  className="absolute -right-[13px] top-[330px] w-[4px] h-[52px] bg-[#292A30] rounded-r-[2px] border-r border-t border-b border-white/15 shadow-[1px_0_3px_rgba(0,0,0,0.6)] opacity-95 z-10 flex items-center justify-center"
                >
                  <div className="w-[1px] h-[36px] bg-white/10 rounded-full" />
                </div>
              </>
            )}

            {!isMobileScreen && platform === "android" && (
              <>
                {/* Pixel 9 Pro Power Button (Right Top) */}
                <div
                  title="Power Button"
                  className="absolute -right-[13px] top-[180px] w-[5px] h-[44px] bg-[#2E3036] rounded-r-[3px] border-r border-t border-b border-white/20 shadow-[2px_0_5px_rgba(0,0,0,0.8)] z-10"
                />

                {/* Pixel 9 Pro Volume Rocker (Right Middle) */}
                <div
                  title="Volume Rocker"
                  className="absolute -right-[13px] top-[240px] w-[5px] h-[96px] bg-[#2E3036] rounded-r-[3px] border-r border-t border-b border-white/20 shadow-[2px_0_5px_rgba(0,0,0,0.8)] z-10"
                />
              </>
            )}

            {/* Main Phone Screen & Bezel */}
            <motion.div
              layout
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 32,
              }}
              className={`w-full h-full relative flex flex-col justify-between overflow-hidden select-none ${
                isMobileScreen
                  ? "rounded-none border-none ring-0 shadow-none"
                  : platform === "ios"
                  ? "rounded-[54px] ring-[10px] ring-[#1E2025] border-[3px] border-[#3E4048] shadow-[0_0_0_4px_#2B2C32,0_30px_70px_-15px_rgba(0,0,0,0.9),inset_0_0_12px_rgba(255,255,255,0.06)]"
                  : "rounded-[42px] ring-[10px] ring-[#15161A] border-[2px] border-[#2C2D33] shadow-[0_0_0_3px_#23242A,0_30px_70px_-15px_rgba(0,0,0,0.9),inset_0_0_8px_rgba(255,255,255,0.04)]"
              } bg-[#07080A]`}
            >
              {/* Status Bar & Dynamic Island */}
              <DynamicIslandHUD />

              {/* Screen Content Viewport */}
              <div className="flex-1 w-full relative overflow-y-auto overflow-x-hidden no-scrollbar pt-12 flex flex-col">
                {children}
              </div>

              {/* Adaptive Bottom Dock */}
              <BottomNav />

              {/* Native Home Indicator Pill */}
              <div className="w-full pb-2 pt-1 flex justify-center bg-transparent pointer-events-none z-50">
                {platform === "ios" ? (
                  <div className="w-32 h-[4px] bg-white/40 rounded-full" />
                ) : (
                  <div className="w-20 h-[3px] bg-white/35 rounded-full" />
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Desktop Footer Specs */}
      <footer className="w-full max-w-4xl py-2 px-6 hidden md:flex items-center justify-between text-[11px] text-white/40 flex-shrink-0">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-volt" />
          <span>Dual-OS Chameleon Shell Active · 60 FPS Spring Kinematics</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Viewport: 393 × 852 (100dvh on mobile)</span>
          <span>·</span>
          <span>Haptics: Web Audio & Native Vibrator</span>
        </div>
      </footer>
    </div>
  );
}
