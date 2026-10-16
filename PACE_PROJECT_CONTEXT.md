# PACE Master Project Context and Execution Blueprint

This document is the persistent single source of truth for the PACE Mobile App Prototype project. It carries 100 percent of the context, client intelligence, design guidelines, and execution roadmap across all workspace sessions.

---

## 1. Client Dossier and Deal Status

* Client Name: Marco Izurieta
* Platform: LinkedIn Services / Marketplace
* Role: Founder, PACE
* Profile Persona: Active runner, non-technical first-time founder, spending personal funds, cautious about delivery, respects proof over sales talk.
* Total Project Value Agreed: $1,800 USD (approximately 1,58,000 INR)
* Milestone Payment Structure:
  * Milestone 1: $450 USD (Real GPS run-tracking build on phone)
  * Milestone 2: $450 USD (AI running coach and training plan engine)
  * Milestone 3: $450 USD (Run history and community feed)
  * Milestone 4: $450 USD (App Store and Google Play launch polish)
* Current Stage: Pre-sale high-fidelity interactive prototype delivery to trigger Milestone 1 signing and $450 deposit.
* Client Agreement Status: Marco explicitly agreed in writing on LinkedIn: "Yes sounds good" to the $1,800 total and $450 milestone breakdown.

---

## 2. Marco Original Brief and Chat Transcript

### Original Project Description:
"Hi, I am developing a running app called PACE and am looking for an experienced mobile app developer or development team to help bring the concept to life. PACE is envisioned as an all-in-one running platform that combines Strava GPS tracking and community features with Runna personalized training plans and coaching. The goal is to create a platform where runners can track their runs, follow adaptive training plans, analyze performance, and connect with other runners, all in one app. I am looking to build an MVP for both iOS and Android, with core features including GPS run tracking, personalized training plans, adaptive coaching, performance analytics, run history, and community features. I am seeking someone who has experience building mobile applications, particularly fitness apps or GPS-based products, and who can help guide the technical development from initial planning through launch. I am a non-technical founder, so I value clear communication, practical recommendations, and a collaborative approach. If this aligns with your experience, I would love to connect, learn more about your work, and discuss the potential scope, timeline, and cost of developing PACE."

### Direct Chat Highlights:
* Marco: "How much for this?"
* Marco: "Could you build an ai agent inside the app that helps the runner? My range was around 1.5-2 unfortunately"
* Marco: "Which scope? I need the full app"
* Marco: "Yes. I want a test run, I am paying a lot of money for this"
* Marco: "I just want to see an app I do not have time for a call"
* Marco: "Yes that would be wonderful looking forward to it"
* Marco: "Yes sounds good" (confirmed $1,800 in 4x $450 milestones)

---

## 3. Product Vision: Strava + Runna + AI Coach Moat

PACE solves the two-app fragmentation problem for runners (paying $16/mo for Runna and $12/mo for Strava):

1. Strava GPS Engine: Real-time dark vector map with live coastal route, pulsing runner beacon, big legible telemetry (pace, distance, duration, elevation), split kilometer drawer, and Apple Watch wearable sync.
2. Runna Training Engine: Structured 12-week Half Marathon Builder with exact interval prescriptions (warmup, 5x 800m tempo intervals at 4:55/km, cooldown).
3. The AI Coach Moat: Coach PACE AI that talks back, diagnoses calf soreness, and dynamically rewrites his workout on screen with visual plan diffs.
4. Performance Analytics: Heart rate zones (Zone 1 to Zone 5), cadence rhythm (168 spm), elevation profile area chart, and weekly volume circular progress ring (28.4 / 40.0 km).
5. Run History: Recent activity feed, split pace comparisons, personal best trophies (1K, 5K, 10K), and shoe odometer.
6. Community Features: Activity stream featuring Marco Izurieta and club runners, interactive Kudos buttons with particle animations, and PACE Global Run Club leaderboard rank.

---

## 4. The 0% AI Slop Athletic Design System

* Aesthetic Benchmark: Apple Watch Ultra and Nike Run Club dark mode.
* Palette:
  * Obsidian Black base: `#07080A` and `#0E1015`
  * Card surfaces: `#13161F` with frosted borders `rgba(255,255,255,0.08)`
  * Electric Volt Green: `#D4FF00` (primary CTA, active track line, pace highlights)
  * Infrared Red: `#FF3B30` (heart rate, threshold zones)
  * Cyber Cyan: `#00E5FF` (cadence, recovery metrics)
* Micro-Details:
  * Tabular figures (`tabular-nums`) to prevent number jittering while timers tick.
  * Apple SF Pro typography with condensed athletic tracking.
  * Frosted glass blur overlays (`backdrop-filter: blur(28px)`).
  * No generic purplish gradients or flat dead mockups.

---

## 5. Technology Stack

* Runtime: Node.js v24.6.0
* Framework: Next.js 15 App Router with React 19 and TypeScript (Strict Mode)
* State Management: Zustand store with persistent runner state and finite state machine (IDLE, COUNTDOWN, RUNNING, PAUSED, FINISHED)
* Styling System: Tailwind CSS with Display P3 tokens
* Physics and Gestures: Framer Motion and Vaul (native iOS drawer with spring physics and snap points)
* Telemetry Engine: High-DPI 60 FPS Canvas Vector Route Engine with dynamic pace and elevation gradient polyline
* Audio and Voice Engine: Dual-channel audio combining Web Audio harmonic countdown chimes with Web Speech API voice coach cues
* Icons: Lucide React (feather-style athletic stroke icons matching Apple SF Symbols)
* Celebration: Canvas-Confetti for milestone achievements

---

## 6. The 6 Phased Micro-Milestones Execution Roadmap

### Micro-Milestone 1: Project Scaffold, iOS Shell, and Segmented Dock
* Scaffold Next.js 15 in `/Users/shubh/Development/pace-prototype`.
* Install packages: `next`, `react`, `react-dom`, `typescript`, `tailwindcss`, `lucide-react`, `framer-motion`, `vaul`, `canvas-confetti`, `zustand`.
* Configure `globals.css` with athletic color tokens.
* Implement `IPhoneShell.tsx`: Dual-viewport wrapper (iPhone 16 Pro mockup on desktop, full-bleed 100vh on physical phones).
* Implement `BottomNav.tsx`: Apple HIG segmented glass dock with active Volt Green glow.

### Micro-Milestone 2: Two-Door Onboarding and iOS Permission Sheet
* Implement `OnboardingFlow.tsx`: Welcome splash and 3-step athletic questionnaire with 1-Tap Fast Entry bypass ("Continue as Marco (Demo Access)").
* Implement `IOSPermissionModal.tsx`: Custom Apple-style location action sheet explaining background GPS tracking with "Always Allow" confirmation.

### Micro-Milestone 3: Live GPS Run Tracker, Vector Map, and Telemetry HUD
* Implement `lib/telemetry.ts`: Real sports science formulas (Haversine distance, speed-to-pace conversion, ACSM calorie formula, Karvonen heart rate reserve zones).
* Implement `LiveRunTracker.tsx`:
  * 60 FPS High-DPI Canvas vector route engine with coastal route polyline and animated pulsing runner beacon.
  * Apple Watch Ultra athletic HUD (5.24 km, 5:12 /km pace, 27:14 live timer, 156 bpm heart rate, 168 spm cadence).
  * Apple Watch Ultra live sync pill: `Apple Watch Ultra · Synced`.
  * Interactive Run Controls: Start, Pause, Resume, and Finish Run.
  * Vaul gesture drawer for kilometer splits and elevation climb profile.
  * Finish Run celebration modal with personal record badge, confetti, and Save to Activity Feed.

### Micro-Milestone 4: Dual-Channel Voice of PACE Audio Engine
* Implement `lib/audio.ts`:
  * Web Audio API multi-oscillator harmonic countdown beeps (3, 2, 1, GO) and split completion bells.
  * Web Speech API voice coach cues announcing workout start, pace, and split milestones aloud through the speaker.
  * Audio Cues toggle switch (ON / OFF).

### Micro-Milestone 5: Coach PACE AI Adaptive Brain and Plan Diff Generator
* Implement `CoachAIChat.tsx`:
  * Verified Coach PACE AI avatar with live status beacon.
  * Today Adaptive Plan card: Half Marathon Builder, 6.0 km Tempo Session with interval breakdown table.
  * Interactive chat with athletic coach voice.
  * Interactive quick-prompt chips (tight calves, fresh legs, short on time).
  * Live workout plan diff generator: visually strikes through hard tempo run and adds active recovery routine on screen with green badge.
  * Custom question input box with real running physiology answers.

### Micro-Milestone 6: Community Feed, Profile Analytics, and Vercel Deployment
* Implement `CommunityFeed.tsx`: Activity stream with runner cards for Marco Izurieta and club members, interactive Kudos with floating heart animations, and PACE Global Run Club leaderboard rank.
* Implement `ProfileAnalytics.tsx`: Marco Izurieta athlete profile, circular weekly volume progress ring (28.4 / 40.0 km, 71%), personal best trophies, and shoe odometer.
* Implement `DynamicIslandHUD.tsx`: Persistent Live Activity widget in the Dynamic Island tracking pace across all tabs.
* Automated Verification: `npm run build` production compilation check.
* Tool-Assisted Verification: Chrome DevTools MCP iPhone 16 Pro emulation audit.
* Deployment: Push to Vercel and verify live production HTTPS link on physical mobile Safari.
* Final Walkthrough: Document walkthrough artifact and deliver exact handoff copy for Marco.
