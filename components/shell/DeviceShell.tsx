"use client";

import React, { useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import { usePaceStore, PlatformType, TabType } from "@/lib/store";
import { triggerHaptic } from "@/lib/haptics";
import { installAudioUnlock } from "@/lib/audio";
import { DynamicIslandHUD } from "./DynamicIslandHUD";
import { BottomNav } from "./BottomNav";
import { OnboardingGate } from "@/components/onboarding/OnboardingFlow";
import { ShellPortalProvider } from "./ShellPortal";
import { Icon, IconName } from "@/components/icons/Icon";

interface DeviceShellProps {
  children: React.ReactNode;
}

const TOUR: { id: TabType; label: string; icon: IconName; hint: string }[] = [
  { id: "run", label: "Record", icon: "shoe", hint: "The map of the run. Tap Simulate 5K to watch it play." },
  { id: "coach", label: "Coach", icon: "chat", hint: "Today's workout. Tap My calves are tight and it changes." },
  { id: "feed", label: "Club", icon: "club", hint: "Marco's run is first. Tap the heart to give kudos." },
  { id: "profile", label: "You", icon: "medal", hint: "This week's miles, your best times, and your shoes." },
];

const DEVICES: { id: PlatformType; label: string }[] = [
  { id: "ios", label: "iPhone 16 Pro" },
  { id: "android", label: "Pixel 9 Pro" },
];

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-volt";

function Wordmark() {
  return <h1 className="text-[20px] font-black leading-none tracking-[-0.04em] text-white">PACE</h1>;
}

function DeviceSwitch({
  platform,
  onChange,
}: {
  platform: PlatformType;
  onChange: (next: PlatformType) => void;
}) {
  return (
    <div role="group" aria-label="Preview device" className="inline-flex rounded-[10px] border border-white/10 p-0.5">
      {DEVICES.map((device) => {
        const active = platform === device.id;
        return (
          <button
            key={device.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(device.id)}
            className={`h-8 rounded-lg px-3 text-[13px] font-medium transition-colors duration-150 ${FOCUS_RING} ${
              active ? "bg-white/[0.12] text-white" : "text-white/50 hover:text-white/80"
            }`}
          >
            {device.label}
          </button>
        );
      })}
    </div>
  );
}

export function DeviceShell({ children }: DeviceShellProps) {
  const { platform, setPlatform, activeTab, setActiveTab, isOnboarded } = usePaceStore();
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

      // Wide screens put the guide rail beside the phone, so the phone gets
      // the full height. Mid widths keep a slim top bar and no rail.
      const sideButtons = 36;
      const wide = width >= 1024;
      const availableH = wide ? height - 56 : height - 88;
      const availableW = wide ? width - (340 + 96 + 96) : width - 32;
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

  const jumpToTab = (tab: TabType) => {
    if (!isOnboarded || tab === activeTab) return;
    triggerHaptic("light");
    setActiveTab(tab);
  };

  return (
    <MotionConfig reducedMotion="user">
    <div className="h-dvh w-full bg-[#07080A] md:bg-[#0E1015] text-white flex flex-col relative overflow-hidden selection:bg-volt selection:text-black">
      {/* Slim top bar for mid-width windows, where the rail does not fit */}
      <header className="hidden md:flex lg:hidden h-16 w-full flex-shrink-0 items-center justify-between px-8">
        <Wordmark />
        <DeviceSwitch platform={platform} onChange={handlePlatformSwitch} />
      </header>

      <div className="flex min-h-0 w-full flex-1 items-center justify-center lg:gap-24">
      {/* Guide rail (wide screens): what the product is, and a way to jump between screens */}
      <aside className="hidden lg:flex w-[340px] flex-shrink-0 flex-col">
        <Wordmark />
        <p className="mt-9 max-w-[12em] text-[32px] font-semibold leading-[1.08] tracking-[-0.025em] text-white [text-wrap:balance]">
          Track the run. Let the coach plan the next one.
        </p>
        <p className="mt-4 max-w-[26em] text-[15px] leading-6 text-white/55">
          Prepared for Marco Izurieta.{" "}
          {isOnboarded
            ? "Tap a row and that screen opens on the phone."
            : "Finish the welcome on the phone, then tap a row to open that screen."}
        </p>

        <ul className="mt-9 border-t border-white/[0.08]">
          {TOUR.map((item) => {
            const current = isOnboarded && activeTab === item.id;
            return (
              <li key={item.id} className="border-b border-white/[0.08]">
                <button
                  type="button"
                  disabled={!isOnboarded}
                  aria-current={current ? "true" : undefined}
                  onClick={() => jumpToTab(item.id)}
                  className={`group flex w-full items-start gap-3.5 py-3.5 text-left disabled:cursor-default ${FOCUS_RING}`}
                >
                  <span
                    className={`mt-0.5 grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg transition-colors duration-150 ${
                      current ? "bg-volt text-black" : "bg-white/[0.06] text-white/60 group-enabled:group-hover:text-white"
                    }`}
                  >
                    <Icon name={item.icon} size={18} />
                  </span>
                  <span className="min-w-0">
                    <span
                      className={`block text-[15px] font-semibold leading-5 transition-colors duration-150 ${
                        current ? "text-white" : "text-white/70 group-enabled:group-hover:text-white"
                      }`}
                    >
                      {item.label}
                    </span>
                    <span className={`mt-0.5 block text-[13px] leading-5 ${current ? "text-white/65" : "text-white/50"}`}>
                      {item.hint}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 flex items-center gap-3">
          <span className="text-[13px] text-white/50">Preview on</span>
          <DeviceSwitch platform={platform} onChange={handlePlatformSwitch} />
        </div>
      </aside>

      {/* Main Hardware Chassis Container with Outer Scaling Wrapper */}
      <main className="flex w-full items-center justify-center lg:w-auto">
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
                    {isOnboarded ? children : null}
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
      </div>
    </div>
    </MotionConfig>
  );
}
