"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { triggerHaptic } from "@/lib/haptics";
import { sound } from "@/lib/audio";
import {
  Sparkles,
  ArrowRight,
  Send,
  Watch,
  CheckCircle,
  Activity,
  Flame,
  ShieldAlert,
  RotateCcw,
} from "lucide-react";

interface Message {
  id: string;
  sender: "coach" | "user";
  text: string;
  timestamp: string;
}

export function CoachChatView() {
  const [isAdapted, setIsAdapted] = useState(false);
  const [showSyncToast, setShowSyncToast] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m-1",
      sender: "coach",
      text: "Good morning Marco! Ready for your Week 4 Half Marathon session? Today was scheduled for 5x 800m threshold reps, but let me know how your legs feel after yesterday's coastal hills.",
      timestamp: "6:40 AM",
    },
  ]);

  const handleApplyAdaptation = (adaptationType: "calves" | "time" | "heat") => {
    triggerHaptic("heavy");
    sound.playBeep(440, 0.15, "triangle");

    if (adaptationType === "calves") {
      setIsAdapted(true);
      setShowSyncToast(true);

      const userMsg: Message = {
        id: `u-${Date.now()}`,
        sender: "user",
        text: "My calves feel tight after yesterday's hill reps.",
        timestamp: "6:42 AM",
      };

      const coachMsg: Message = {
        id: `c-${Date.now() + 1}`,
        sender: "coach",
        text: "Smart call Marco. High calf tightness after hill repeats indicates soleus overload. Forcing 4:55/km intervals today risks an Achilles flare-up. I have dynamically adapted today's session to a 35-minute Zone 2 active recovery flush at 6:05/km with light cadence focus (170+ SPM). Your updated workout targets are already synced to your Apple Watch Ultra.",
        timestamp: "6:42 AM",
      };

      setMessages((prev) => [...prev, userMsg, coachMsg]);
      sound.speak("Workout updated. 35 minute Zone 2 recovery flush synced to your watch.");

      setTimeout(() => {
        setShowSyncToast(false);
      }, 3500);
    }
  };

  const handleResetPlan = () => {
    triggerHaptic("medium");
    setIsAdapted(false);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    triggerHaptic("light");
    const userText = inputValue.trim();
    setInputValue("");

    const newMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, newMsg]);

    setTimeout(() => {
      triggerHaptic("medium");
      const replyText =
        "Understood Marco! I have factored that into your weekly load profile. Your cadence and heart rate will be monitored live on your next run to ensure optimal aerobic development.";
      const coachReply: Message = {
        id: `c-${Date.now() + 1}`,
        sender: "coach",
        text: replyText,
        timestamp: "Just now",
      };
      setMessages((prev) => [...prev, coachReply]);
      sound.playBeep(659.25, 0.1);
    }, 600);
  };

  return (
    <div className="flex-1 flex flex-col justify-between h-full relative">
      {/* Dynamic Watch Sync Toast */}
      <AnimatePresence>
        {showSyncToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 450, damping: 30 }}
            className="absolute top-2 inset-x-4 z-40 bg-[#00E5FF] text-black font-bold text-xs py-2 px-3.5 rounded-full flex items-center justify-between shadow-[0_10px_25px_rgba(0,229,255,0.4)]"
          >
            <div className="flex items-center gap-2">
              <Watch className="w-4 h-4" />
              <span>Synced to Apple Watch Ultra</span>
            </div>
            <CheckCircle className="w-4 h-4" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-3 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-volt/15 border border-volt/40 flex items-center justify-center shadow-[0_0_12px_rgba(212,255,0,0.25)]">
              <Sparkles className="w-4 h-4 text-volt" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white flex items-center gap-1.5">
                Coach PACE AI
                <span className="w-1.5 h-1.5 rounded-full bg-volt animate-pulse" />
              </h2>
              <p className="text-[10px] text-white/50">
                Runna Adaptive Engine · Live Sync
              </p>
            </div>
          </div>
          <span className="text-[9px] font-bold text-volt bg-volt/10 border border-volt/20 px-2 py-0.5 rounded-full uppercase">
            WEEK 4 OF 12
          </span>
        </div>

        {/* Dynamic Prescription Workout Card */}
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className={`border rounded-2xl p-4 relative overflow-hidden transition-all ${
            isAdapted
              ? "bg-[#0A161E] border-cyan/40 shadow-[0_0_20px_rgba(0,229,255,0.15)]"
              : "bg-[#13161F] border-white/10"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                isAdapted ? "text-cyan" : "text-volt"
              }`}
            >
              {isAdapted ? "Adapted Session · Low Strain" : "Scheduled Session · Day 3"}
            </span>

            {isAdapted ? (
              <button
                onClick={handleResetPlan}
                className="text-[10px] text-white/50 hover:text-white flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full"
              >
                <RotateCcw className="w-3 h-3" /> Revert
              </button>
            ) : (
              <span className="text-[10px] text-white/40">Target Pace</span>
            )}
          </div>

          {/* Workout Title with Theatrical Strikethrough Diff */}
          <div className="relative mb-2">
            {isAdapted ? (
              <div>
                <span className="text-xs text-white/40 line-through block">
                  6.0 km Threshold (5x 800m @ 4:55/km)
                </span>
                <motion.h3
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-base font-black text-cyan flex items-center gap-2 mt-0.5"
                >
                  35m Zone 2 Active Flush
                  <span className="text-[9px] font-bold bg-cyan/20 text-cyan px-2 py-0.5 rounded-full uppercase">
                    ADAPTED
                  </span>
                </motion.h3>
                <p className="text-[11px] text-white/70 mt-1">
                  Target pace: 6:00 to 6:15/km. Cadence target: 170+ SPM. Protects calves.
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-base font-black text-white">
                  6.0 km Threshold Tempo
                </h3>
                <p className="text-[11px] text-white/60 mt-0.5">
                  5x 800m repeats @ 4:55/km with 90s recovery. Aerobic power focus.
                </p>
              </div>
            )}
          </div>

          {/* Interval breakdown columns */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-center">
            <div>
              <span className="text-[9px] text-white/40 uppercase block">Warmup</span>
              <span className="text-xs font-bold text-white">
                {isAdapted ? "1.0 km Easy" : "1.0 km Easy"}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-white/40 uppercase block">Main Work</span>
              <span
                className={`text-xs font-bold ${
                  isAdapted ? "text-cyan" : "text-volt"
                }`}
              >
                {isAdapted ? "25m Zone 2" : "5x 800m @ 4:55"}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-white/40 uppercase block">Cooldown</span>
              <span className="text-xs font-bold text-white">
                {isAdapted ? "Walk & Stretch" : "1.0 km Easy"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Quick Adaptation Interactive Trigger Chips */}
        {!isAdapted && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">
              One Tap Physiological Adaptations
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleApplyAdaptation("calves")}
                className="w-full text-left p-3 rounded-xl bg-[#0E1015] border border-white/10 hover:border-volt/40 transition-all text-xs text-white/90 flex items-center justify-between active:scale-[0.98] group"
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-infrared" />
                  <span>"My calves feel tight from yesterday"</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-volt group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => handleApplyAdaptation("calves")}
                className="w-full text-left p-3 rounded-xl bg-[#0E1015] border border-white/10 hover:border-volt/40 transition-all text-xs text-white/90 flex items-center justify-between active:scale-[0.98] group"
              >
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-volt" />
                  <span>"Short on time: cut session to 25 minutes"</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-volt group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* Chat Thread Messages */}
        <div className="space-y-3 pt-2">
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${
                m.sender === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[88%] p-3 rounded-2xl text-xs leading-relaxed ${
                  m.sender === "user"
                    ? "bg-volt text-black font-medium rounded-tr-sm"
                    : "bg-[#13161F] text-white/90 border border-white/10 rounded-tl-sm shadow-sm"
                }`}
              >
                {m.text}
              </div>
              <span className="text-[9px] text-white/30 px-1 mt-1">
                {m.timestamp}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={handleSendMessage}
        className="pt-2 pb-1 flex items-center gap-2"
      >
        <div className="flex-1 bg-[#13161F] border border-white/10 rounded-2xl px-3.5 py-2.5 flex items-center focus-within:border-volt/50 transition-colors">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask Coach PACE about recovery, pacing, shoes..."
            className="w-full bg-transparent text-xs text-white placeholder-white/40 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={!inputValue.trim()}
          className="w-10 h-10 rounded-2xl bg-volt disabled:opacity-40 flex items-center justify-center text-black font-bold active:scale-95 transition-all shadow-md shadow-volt/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
