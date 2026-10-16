import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: "#07080A",
          surface: "#0E1015",
          sheet: "#14171E",
          card: "#13161F",
          ink: "#101216",
          raised: "#1C2028",
          border: "rgba(255, 255, 255, 0.08)",
          subtle: "rgba(255, 255, 255, 0.04)",
        },
        volt: {
          DEFAULT: "#D4FF00",
          glow: "rgba(212, 255, 0, 0.25)",
          muted: "rgba(212, 255, 0, 0.12)",
        },
        infrared: {
          DEFAULT: "#FF3B30",
          glow: "rgba(255, 59, 48, 0.25)",
          muted: "rgba(255, 59, 48, 0.12)",
        },
        cyan: {
          DEFAULT: "#00E5FF",
          glow: "rgba(0, 229, 255, 0.25)",
          muted: "rgba(0, 229, 255, 0.12)",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "sans-serif",
        ],
        mono: [
          "SF Mono",
          "ui-monospace",
          "Menlo",
          "Monaco",
          "Cascadia Mono",
          "monospace",
        ],
      },
      boxShadow: {
        "volt-sm": "0 0 15px rgba(212, 255, 0, 0.2)",
        "volt-md": "0 0 30px rgba(212, 255, 0, 0.35)",
        "volt-lg": "0 0 50px rgba(212, 255, 0, 0.45)",
        "cyan-sm": "0 0 15px rgba(0, 229, 255, 0.25)",
        "infrared-sm": "0 0 15px rgba(255, 59, 48, 0.25)",
        "chassis-ios": "0 25px 70px -10px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.12)",
        "chassis-android": "0 25px 70px -10px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.08)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "beacon-ping": "beaconPing 2s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
      keyframes: {
        beaconPing: {
          "0%": { transform: "scale(1)", opacity: "0.8" },
          "75%, 100%": { transform: "scale(2.2)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
