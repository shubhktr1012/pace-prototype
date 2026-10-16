# Cursor & Grok Re-Audit Playbook: PACE Prototype

This playbook contains prompt sequences tailored for Grok in Cursor. Each prompt leverages the indexed repository context and .cursorrules to conduct deep-dive audits.

---

### Audit 1: Visual Polish & Native Feel (Apple HIG & Nike Run Club Tier)

Copy and paste this into Cursor Composer or Chat with Grok:

```text
Review the current frontend in app/page.tsx, components/run/RunMapCanvas.tsx, components/run/SplitsDrawer.tsx, and components/coach/CoachChatView.tsx.

Our benchmark is Nike Run Club, watchOS 11, and Strava Summit.

Please audit the following 4 areas:
1. Viewport Ergonomics: Check if safe areas (env safe-area-inset), overscroll behavior, and tap highlight colors are properly handled for mobile Safari on iPhone 16 Pro and Chrome on Pixel 9 Pro.
2. Motion & Physics: Verify that all tab transitions, drawer gestures, and the Dynamic Island live activity widget use realistic spring kinematics without visual stutter or layout jumping.
3. Typography & Numerals: Ensure all telemetry data (distance, pace, duration, heart rate, cadence) use tabular figures (metric-mono) so numbers never jitter during live ticking.
4. Edge-to-Edge Canvas: Confirm the route map canvas feels expansive and tactile rather than like a boxed web wireframe.

Identify any remaining visual flaws or web artifacts that could break the native app illusion.
```

---

### Audit 2: Client Conversion Psychology (The 15-Second Hook)

Copy and paste this into Cursor Composer or Chat with Grok:

```text
Audit the PACE prototype from the psychological perspective of our client, Marco Izurieta:
* Profile: US Eastern founder, ID verified on LinkedIn, non-technical, very busy ("I just want to see an app I do not have time for a call").
* Goal: Shock and delight him inside the first 15 seconds on his mobile screen so he immediately releases the agreed $450 Milestone 1 deposit.

Evaluate these 4 conversion levers:
1. The 20x Speed Simulation Trigger: Is the "Simulate 5K Run (20x Speed)" button obvious enough for a user who won't go on a real run while testing the link from his desk?
2. The Theatrical Plan Diff: Does the calf tightness adaptation in Coach AI clearly demonstrate the Runna adaptive intelligence promise without needing a live LLM backend?
3. Social Proof & Ego Bait: Is Marco's featured post and #1 ranking on the PACE Global Run Club leaderboard prominent and gratifying?
4. Audio & Voice Cues: Does the audio engine fire reliably across mobile browsers, and does it elevate the experience to feeling like a live personal coach?

What 2 or 3 micro-enhancements would make this link completely irresistible to Marco?
```

---

### Audit 3: Performance, Browser Resilience & Safe Audio Policies

Copy and paste this into Cursor Composer or Chat with Grok:

```text
Audit lib/audio.ts, lib/haptics.ts, components/run/useRunEngine.ts, and lib/store.ts for browser compatibility and runtime resilience:

1. Web Audio & Web Speech Autoplay Policies: On iOS Safari, AudioContext and SpeechSynthesis are often suspended until a user gesture. Ensure our audio engine handles suspended contexts gracefully on first tap.
2. Canvas High-DPI Performance: Verify that components/run/RunMapCanvas.tsx cleans up animation frames on unmount, handles devicePixelRatio without blur, and does not leak memory during tab switches.
3. Responsive Desktop Scaling: Review components/shell/DeviceShell.tsx to ensure the titanium chassis scales cleanly on smaller laptop screens while remaining full-bleed on physical mobile devices.

Provide any necessary hardening patches.
```

---

### Audit 4: Milestone 1 LinkedIn Handoff Message

Copy and paste this into Cursor Composer or Chat with Grok:

```text
Draft a high-converting, professional handoff message for Shubh to send to Marco Izurieta on LinkedIn alongside our live Vercel deployment link.

Key criteria:
1. Tone: Confident, respectful, concise, and focused on his product vision.
2. Length: Under 120 words. No robotic AI fluff or corporate jargon.
3. Instructions: Guide him to tap "Simulate 5K Run (20x Speed)" and test "Coach AI" on his phone with sound turned on.
4. Call to Action: Clear, frictionless next step to approve Milestone 1 and release the $450 deposit so Milestone 2 (Live GPS & Auth) begins immediately.
5. Strictly zero em dashes or en dashes.
```
