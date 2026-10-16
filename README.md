# PACE

A browser preview of PACE, prepared for Marco Izurieta. Open it and tap through it. This is not an app from the App Store. The installable version comes after this preview.

Live preview: https://pace-prototype-fawn.vercel.app

## Open the preview

Use a phone, held upright, in Safari or Chrome. If the link opens inside LinkedIn, use the menu and choose Open in browser.

Tap **Answer 3 questions**, pick any answers, then **Always Allow**, then **Simulate 5K**. Take the phone off silent to hear the countdown.

**Continue as Marco** skips the three questions and goes straight to the location sheet. The answers do not change the plan. Either way, the preview opens Marco's half marathon week.

The same address on a computer shows the phone. In a wide window, the rows beside it open Record, Coach, Club, and You. The switch in the corner flips the frame between iPhone 16 Pro and Pixel 9 Pro. On a real phone, the preview matches the phone he is holding.

Onboarding is remembered for that browser tab. To see the welcome again, open You and tap **Reset onboarding** under Developer.

## What is on the phone

- **Record.** The Crissy Field map. Set the route, then tap Simulate 5K to watch the run.
- **Coach.** Today's workout. Tap **My calves are tight** or **I only have 25 minutes** and the plan changes.
- **Club.** Marco's run. Tap the heart to give kudos.
- **You.** This week's miles, best times, shoes, and the miles or kilometers switch.

On the iPhone frame, the black pill at the top is drawn by the preview. It is not the hardware Dynamic Island, and a website cannot control that. After the welcome it says **Tap the island**. Tap it for the run card. During a run it stays as a smaller pill with distance and pace. The Pixel frame has no island. A small distance and pace chip shows only while a run is on Record.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. There are no environment variables. `npm run build` is the production build. Pushing `main` updates the live preview.
