# Master Implementation Plan: PACE High-Precision Prototype (Dual-OS Chameleon Edition)

A unified technical and design specification combining the Dual-OS Chameleon Shell (iPhone 16 Pro and Pixel 9 Pro), Framer Motion v12 spring physics, cross-platform haptics, Strava vector telemetry, and Runna adaptive coaching into an interactive mobile prototype.

---

## 1. Executive Summary and Strategic Context

* Client: Marco Izurieta (Founder, PACE)
* Project Value: $1,800 USD agreed in writing ($450 x 4 milestones)
* Deliverable: High-fidelity interactive prototype to trigger Milestone 1 contract signing and $450 deposit today.
* Dual-OS Promise: Marco brief explicitly requests an MVP for both iOS and Android. Our prototype auto-detects physical mobile devices (iPhone Safari vs Android Chrome) and provides a desktop hardware switcher (iPhone 16 Pro Titanium vs Pixel 9 Pro Obsidian) so Marco sees his app running natively on both ecosystems.

---

## 2. Micro-Milestone 1: Project Scaffold, Dual-OS Shell, and Adaptive Dock

### Component Specifications

#### A. Global CSS and Athletic Token System (`app/globals.css`)
* Color tokens:
  * Obsidian Black base: `#07080A` (OLED power saving for outdoor runs)
  * Elevated surface: `#0E1015`
  * Bento card container: `#13161F`
  * Hairline specular border: `rgba(255, 255, 255, 0.08)`
  * Electric Volt: `#D4FF00` (primary CTA, active GPS vector, pace highlights)
  * Infrared Red: `#FF3B30` (heart rate Zone 4/5 threshold, critical alerts)
  * Cyber Cyan: `#00E5FF` (cadence rhythm, AI Coach adaptive diff highlights)
* Anti-Web Resets:
  * Lock document bounce: `html, body { overscroll-behavior: none; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; -webkit-tap-highlight-color: transparent; }`
  * Tabular numerals on all metrics: `.metric-mono { font-variant-numeric: tabular-nums; font-feature-settings: "tnum" 1, "zero" 1; letter-spacing: -0.04em; }`
  * Scrollbar suppression (`scrollbar-width: none`).

#### B. Zustand Master Store (`lib/store.ts`)
* `platform`: `'ios' | 'android'` (auto-detected on mobile, toggleable on desktop)
* `activeTab`: `'run' | 'coach' | 'feed' | 'profile'`
* `runStatus`: `'IDLE' | 'COUNTDOWN' | 'RUNNING' | 'PAUSED' | 'FINISHED'`
* `telemetry`: `{ distanceKm: 5.24, pace: '5:12', durationSec: 1634, heartRate: 156, cadence: 168, watchSynced: true }`

#### C. Cross-Platform Haptic Engine (`lib/haptics.ts`)
* Android: calls native `navigator.vibrate(10)` for light taps, `navigator.vibrate([15, 30, 25])` for success.
* iOS Safari and Desktop: synthesizes a 15ms ultra-low-frequency sine thump (55Hz ramping down to 18Hz) via Web Audio API singleton so taps feel physically weighted.

#### D. Dual-OS Hardware Chassis Wrapper (`components/shell/DeviceShell.tsx`)
* Mobile Viewport: 100dvh full-bleed edge-to-edge container respecting safe-area insets.
* Desktop Viewport: Centers a 393px by 852px photorealistic chassis over an ambient obsidian studio background with radial Volt glow.
* Desktop Top Bar: Floating pill with live switcher: iOS 18 (iPhone 16 Pro) and Android 15 (Pixel 9 Pro).
* iOS Mode: 54px border radius, Grade 5 Titanium multi-stop border, Dynamic Island cutout, and Apple home indicator bar.
* Android Mode: 40px border radius, matte obsidian aluminum bezel, centered camera punch-hole, and Material 3 gesture pill.

#### E. Dynamic Island and Live Activity HUD (`components/shell/DynamicIslandHUD.tsx`)
* When run is idle: displays compact cutout with green watch sync beacon (`Ultra Synced`).
* When run is active and user browses Coach AI, Feed, or Profile: morphs via Framer Motion into an active Live Activity pill displaying live distance and pace in Volt Green. Tapping it jumps back to the Run tab.

#### F. Adaptive Bottom Navigation Dock (`components/shell/BottomNav.tsx`)
* 4 Destinations: Run (Navigation), Coach AI (Sparkles with AI badge), Club (Users), Athlete (Trophy).
* iOS Mode: Floating frosted glass dock (`backdrop-filter: blur(28px)`), top specular border, and active top glow in Volt Green.
* Android Mode: Surface container (`#0E1015`) with sliding Material 3 active pill indicator (`rgba(212, 255, 0, 0.16)`) animated with `layoutId="android-m3-pill"`.

---

## 3. The Complete 6 Micro-Milestones Roadmap

### Micro-Milestone 1: Project Scaffold, Dual-OS Shell, and Adaptive Dock
* Scaffold Next.js 15, React 19, TypeScript, and Tailwind in `/Users/shubh/Development/pace-prototype`.
* Install `zustand`, `framer-motion`, `vaul`, `lucide-react`, `canvas-confetti`, `clsx`, `tailwind-merge`.
* Implement `globals.css`, `lib/store.ts`, `lib/haptics.ts`, `lib/utils.ts`.
* Implement `DeviceShell.tsx`, `DynamicIslandHUD.tsx`, `BottomNav.tsx`.
* Verify 60 FPS transitions and dual-OS chassis morphing.

### Micro-Milestone 2: Two-Door Onboarding and iOS Permission Sheet
* Implement `OnboardingFlow.tsx` with 1-Tap Marco Demo bypass and 30-Second Runna Questionnaire.
* Implement `IOSPermissionModal.tsx` custom Apple-style location action sheet.

### Micro-Milestone 3: Live GPS Run Tracker, 20x Coastal Simulation, and Telemetry
* Implement `lib/telemetry.ts` with Haversine distance math, speed-to-pace conversion, and ACSM calories.
* Implement `LiveRunTracker.tsx`: High-DPI 60 FPS Canvas vector map, ⚡ 20x Speed Coastal Simulation Scrubber, Apple Watch Synced Pill, and Vaul Split Drawer.

### Micro-Milestone 4: Dual-Channel Voice of PACE Audio Engine
* Implement `lib/audio.ts` combining Web Audio harmonic chimes with Web Speech API spoken coach announcements (*"Workout started. Target pace 5:12 per kilometer. Let us go Marco"*).

### Micro-Milestone 5: Coach PACE AI and Theatrical Workout Plan Diff
* Implement `CoachAIChat.tsx` featuring visual plan diffs (red strike-through on hard tempo, morphing recovery card in Cyber Cyan, and Apple Watch sync toast).

### Micro-Milestone 6: Community Feed, Profile Analytics, and Vercel Deployment
* Implement `CommunityFeed.tsx` with Marco Izurieta as #1 on leaderboard and 42 Kudos particle burst button.
* Implement `ProfileAnalytics.tsx` with weekly mileage ring and personal bests.
* Run automated build and Chrome DevTools MCP mobile emulation audits.
* Deploy to Vercel and verify live HTTPS URL.

---

## 4. Verification Plan for Micro-Milestone 1

1. Automated Build: `npm run build` passes with zero TypeScript or syntax errors.
2. Spring Kinematics: Tab switching demonstrates smooth shared-layout transitions with zero layout shift.
3. Dual-OS Parity: Toggling iOS 18 and Android 15 smoothly morphs hardware chassis, status bar, and bottom dock.
4. Mobile Emulation: Verified at 393x852 (iPhone 16 Pro) and 412x915 (Pixel 9 Pro) with zero horizontal overflow.
