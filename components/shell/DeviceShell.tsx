"use client";

import React, { useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import { usePaceStore, PlatformType } from "@/lib/store";
import { triggerHaptic } from "@/lib/haptics";
import { installAudioUnlock } from "@/lib/audio";
import { DynamicIslandHUD } from "./DynamicIslandHUD";
import { BottomNav } from "./BottomNav";
import { OnboardingGate } from "@/components/onboarding/OnboardingFlow";
import { ShellPortalProvider } from "./ShellPortal";
import { Icon } from "@/components/icons/Icon";

interface DeviceShellProps {
  children: React.ReactNode;
}

export function DeviceShell({ children }: DeviceShellProps) {
  const { platform, setPlatform } = usePaceStore();
  const [scale, setScale] = useState(1);
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const [overlayEl, setOverlayEl] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    installAudioUnlock();
  }, []);

  // Full-bleed on a phone. On a laptop, fit the chassis and side buttons
  // to the visible window instead of stopping at a scale floor that clips.
  useEffect(() => {
    const handleResize = () => {
      const viewport = window.visualViewport;
      const width = viewport?.width ?? window.innerWidth;
      const height = viewport?.height ?? window.innerHeight;
      const isMobile = width < 768;
      setIsMobileScreen(isMobile);

      if (isMobile) {
        setScale(1);
        const ua = navigator.userAgent || "";
        if (/iPhone|iPad|iPod/i.test(ua)) {
          setPlatform("ios");
        } else if (/Android/i.test(ua)) {
          setPlatform("android");
        }
        return;
      }

      const chromeH = 128;
      const sideButtons = 36;
      const availableH = height - chromeH;
      const availableW = width - 32;
      const scaleH = availableH / 860;
      const scaleW = availableW / (393 + sideButtons);
      const next = Math.min(1, scaleH, scaleW);
      setScale(Number.isFinite(next) ? Math.max(0.38, next) : 1);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    window.visualViewport?.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.visualViewport?.removeEventListener("resize", handleResize);
    };
  }, [setPlatform]);

  const handlePlatformSwitch = (newPlatform: PlatformType) => {
    if (newPlatform !== platform) {
      triggerHaptic("medium");
      setPlatform(newPlatform);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
    <div className="h-dvh w-full bg-[#07080A] text-white flex flex-col items-center justify-between relative overflow-hidden selection:bg-volt selection:text-black">
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

        <div className="flex items-center gap-2">
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
            <Icon name="phone" size={14} />
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
            <Icon name="phone" size={14} />
            <span>Pixel 9 Pro</span>
            {platform === "android" && (
              <span className="w-1.5 h-1.5 rounded-full bg-black/60" />
            )}
          </button>
          </div>
        </div>
      </header>

      {/* Main Hardware Chassis Container with Outer Scaling Wrapper */}
      <main className="w-full flex items-center justify-center flex-1 overflow-hidden">
        <div
          style={{
            width: isMobileScreen ? "100%" : `${(393 + 36) * scale}px`,
            height: isMobileScreen ? "100dvh" : `${852 * scale}px`,
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
            {/* PHYSICAL HARDWARE BUTTONS & ANTENNA BREAKS (Desktop Mode Only) */}
            {!isMobileScreen && platform === "ios" && (
              <>
                {/* Titanium RF Antenna Bands */}
                <div className="absolute top-[68px] -left-[1px] w-[3px] h-[5px] bg-[#18181b]/80 z-20 pointer-events-none" />
                <div className="absolute top-[68px] -right-[1px] w-[3px] h-[5px] bg-[#18181b]/80 z-20 pointer-events-none" />
                <div className="absolute bottom-[68px] -left-[1px] w-[3px] h-[5px] bg-[#18181b]/80 z-20 pointer-events-none" />
                <div className="absolute bottom-[68px] -right-[1px] w-[3px] h-[5px] bg-[#18181b]/80 z-20 pointer-events-none" />

                {/* Left Hardware Buttons: Action + Volume Up/Down */}
                <div
                  title="Action Button"
                  className="absolute -left-[14px] top-[125px] w-[4px] h-[30px] bg-gradient-to-b from-[#4a4a50] via-[#27272a] to-[#4a4a50] rounded-l-md border-l border-white/20 shadow-[-2px_0_4px_rgba(0,0,0,0.8)] z-10"
                />

                <div
                  title="Volume Up"
                  className="absolute -left-[14px] top-[174px] w-[4px] h-[58px] bg-gradient-to-b from-[#4a4a50] via-[#27272a] to-[#4a4a50] rounded-l-md border-l border-white/20 shadow-[-2px_0_4px_rgba(0,0,0,0.8)] z-10"
                />

                <div
                  title="Volume Down"
                  className="absolute -left-[14px] top-[248px] w-[4px] h-[58px] bg-gradient-to-b from-[#4a4a50] via-[#27272a] to-[#4a4a50] rounded-l-md border-l border-white/20 shadow-[-2px_0_4px_rgba(0,0,0,0.8)] z-10"
                />

                {/* Right Hardware Buttons: Power / Siri Button */}
                <div
                  title="Power / Siri Button"
                  className="absolute -right-[14px] top-[195px] w-[4px] h-[86px] bg-gradient-to-b from-[#4a4a50] via-[#27272a] to-[#4a4a50] rounded-r-md border-r border-white/20 shadow-[2px_0_4px_rgba(0,0,0,0.8)] z-10"
                />

                {/* iPhone 16 Sapphire Glass Recessed Camera Control Button (Right Down) */}
                <div
                  title="Camera Control Button (Capacitive & Force-sensitive)"
                  className="absolute -right-[13px] top-[325px] w-[3px] h-[50px] bg-[#1f1f23] rounded-r-sm border-r border-white/15 opacity-90 z-10 flex items-center justify-center"
                >
                  <div className="w-[1px] h-[34px] bg-white/10 rounded-full" />
                </div>
              </>
            )}

            {!isMobileScreen && platform === "android" && (
              <>
                {/* Pixel 9 Pro Power Button (Right Top) */}
                <div
                  title="Power Button"
                  className="absolute -right-[13px] top-[180px] w-[4.5px] h-[44px] bg-gradient-to-b from-[#3c3e44] via-[#222327] to-[#3c3e44] rounded-r-md border-r border-white/20 shadow-[2px_0_5px_rgba(0,0,0,0.8)] z-10"
                />

                {/* Pixel 9 Pro Volume Rocker (Right Middle) */}
                <div
                  title="Volume Rocker"
                  className="absolute -right-[13px] top-[240px] w-[4.5px] h-[96px] bg-gradient-to-b from-[#3c3e44] via-[#222327] to-[#3c3e44] rounded-r-md border-r border-white/20 shadow-[2px_0_5px_rgba(0,0,0,0.8)] z-10"
                />
              </>
            )}

            {/* Main Phone Screen & Bezel with Titanium Multi-Stop Finish */}
            <div
              className={`w-full h-full relative flex flex-col justify-between overflow-hidden select-none ${
                isMobileScreen
                  ? "rounded-none border-none ring-0 shadow-none"
                  : platform === "ios"
                  ? "rounded-[54px] p-[10px] bg-gradient-to-b from-[#3a3a3f] via-[#262629] to-[#333338] shadow-[0_0_0_1px_#52525b,0_0_0_4px_#18181b,0_30px_70px_-10px_rgba(0,0,0,0.9),inset_0_0_6px_rgba(255,255,255,0.2)]"
                  : "rounded-[42px] p-[9px] bg-gradient-to-b from-[#2a2b30] via-[#1a1b1f] to-[#25262a] shadow-[0_0_0_1px_#3f414a,0_0_0_4px_#111215,0_30px_70px_-10px_rgba(0,0,0,0.9),inset_0_0_5px_rgba(255,255,255,0.12)]"
              }`}
            >
              {/* Inner Black OLED Bezel with Mask for strict radius clipping */}
              <div
                style={{
                  WebkitMaskImage: isMobileScreen ? "none" : "-webkit-radial-gradient(white, black)",
                  maskImage: isMobileScreen ? "none" : "radial-gradient(white, black)",
                }}
                className={`relative w-full h-full bg-black ${
                  isMobileScreen ? "rounded-none" : "rounded-[46px]"
                } overflow-hidden flex flex-col justify-between shadow-[inset_0_0_4px_rgba(0,0,0,1)]`}
              >
                <ShellPortalProvider value={overlayEl}>
                  <div className="absolute inset-0 z-0">
                    {children}
                  </div>
                  <DynamicIslandHUD />
                  <OnboardingGate />
                  <BottomNav />
                  <div ref={setOverlayEl} className="absolute inset-0 z-[45] pointer-events-none" />
                </ShellPortalProvider>

                {/* Native Home Indicator Pill (Centered cleanly at bottom) */}
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 pointer-events-none z-50 flex justify-center">
                  {platform === "ios" ? (
                    <div className="w-32 h-[4px] bg-white/40 rounded-full shadow-sm" />
                  ) : (
                    <div className="w-20 h-[3px] bg-white/35 rounded-full" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Desktop Footer Specs */}
      <footer className="w-full max-w-4xl py-2 px-6 hidden md:flex items-center justify-between text-[11px] text-white/40 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Icon name="check" size={14} className="text-volt" />
          <span>Dual-OS Chameleon Shell Active · 60 FPS Spring Kinematics</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Viewport: 393 × 852 (100dvh on mobile)</span>
          <span>·</span>
          <span>Haptics: Web Audio & Native Vibrator</span>
        </div>
      </footer>
    </div>
    </MotionConfig>
  );
}
