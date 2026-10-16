"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePaceStore } from "@/lib/store";
import { triggerHaptic } from "@/lib/haptics";
import { IOSPermissionModal } from "./IOSPermissionModal";

// Photos are from Unsplash (free for commercial use, no attribution required).
// Source ids on images.unsplash.com:
//   onb-hero.jpg  photo-1711598850173-0b0a0f69b4f4
//   onb-race.jpg  photo-1547483238-f400e65ccd56
//   onb-days.jpg  photo-1594882645126-14020914d58d
//   onb-feel.jpg  photo-1700086196666-b20449181ed2
const HERO_PHOTO = "/media/onb-hero.jpg";

const QUESTIONS = [
  {
    prompt: "What are you training for?",
    options: ["5K", "10K", "Half marathon"],
    photo: "/media/onb-race.jpg",
    position: "center 60%",
  },
  {
    prompt: "How many days a week can you run?",
    options: ["3 days", "4 days", "5 days"],
    photo: "/media/onb-days.jpg",
    position: "center 45%",
  },
  {
    prompt: "How should most runs feel?",
    options: ["Easy", "Steady", "Fast"],
    photo: "/media/onb-feel.jpg",
    position: "center 40%",
  },
];

export function OnboardingGate() {
  const { platform, isOnboarded, setIsOnboarded, setHasLocationPermission } = usePaceStore();
  const ios = platform === "ios";
  const radius = ios ? "rounded-full" : "rounded-2xl";
  const [phase, setPhase] = useState<"welcome" | "questions" | "permission">("welcome");
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<string[]>(["", "", ""]);

  useEffect(() => {
    if (sessionStorage.getItem("pace-onboarded") === "1") {
      setIsOnboarded(true);
      setHasLocationPermission(sessionStorage.getItem("pace-location") !== "denied");
    }
  }, [setHasLocationPermission, setIsOnboarded]);

  useEffect(() => {
    if (isOnboarded) return;
    setPhase("welcome");
    setStep(0);
    setPicks(["", "", ""]);
  }, [isOnboarded]);

  // Warm the question photos while the user reads the welcome screen so the
  // crossfade between steps never shows an empty header.
  useEffect(() => {
    if (isOnboarded) return;
    QUESTIONS.forEach((q) => {
      const img = new Image();
      img.src = q.photo;
    });
  }, [isOnboarded]);

  if (isOnboarded) return null;

  const finish = (allow: boolean) => {
    triggerHaptic(allow ? "medium" : "light");
    sessionStorage.setItem("pace-onboarded", "1");
    sessionStorage.setItem("pace-location", allow ? "allow" : "denied");
    setHasLocationPermission(allow);
    setIsOnboarded(true);
  };

  const question = QUESTIONS[step];

  return (
    <div className="absolute inset-0 z-[42] overflow-hidden bg-obsidian">
      {phase === "welcome" && (
        <div className="relative h-full">
          <motion.img
            src={HERO_PHOTO}
            alt=""
            width={1000}
            height={1500}
            fetchPriority="high"
            initial={{ transform: "scale(1.08)" }}
            animate={{ transform: "scale(1)" }}
            transition={{ duration: 7, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07080A] via-[#07080A]/55 via-45% to-transparent" />
          <div className="relative flex h-full flex-col px-5 pb-10">
            <div className="mt-auto">
              <h1 className={`font-semibold tracking-tight ${ios ? "text-[44px]" : "text-[38px]"}`}>PACE</h1>
              <p className="mt-2 max-w-[290px] text-[17px] leading-snug text-white/80">
                Runs, a plan, and a coach that changes today&apos;s workout.
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-2">
              <button
                onClick={() => {
                  triggerHaptic("medium");
                  setPhase("permission");
                }}
                className={`relative flex h-12 w-full items-center justify-center ${radius} bg-volt text-[15px] font-semibold text-black`}
              >
                <img
                  src="/media/marco.jpg"
                  alt=""
                  className={`absolute left-2 h-8 w-8 object-cover object-[center_18%] ${ios ? "rounded-full" : "rounded-xl"}`}
                />
                Continue as Marco
              </button>
              <button
                onClick={() => {
                  triggerHaptic("light");
                  setPhase("questions");
                }}
                className="h-11 w-full text-[14px] text-white/70"
              >
                Answer 3 questions
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === "questions" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="flex h-full flex-col"
        >
          <div className="relative h-[38%] shrink-0">
            <AnimatePresence initial={false}>
              <motion.img
                key={question.photo}
                src={question.photo}
                alt=""
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: question.position }}
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent via-40% to-[#07080A]" />
            <div className="absolute inset-x-5 top-14 flex gap-1.5">
              {QUESTIONS.map((_, index) => (
                <div key={index} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25">
                  <div
                    className="h-full rounded-full bg-volt transition-[width] duration-300"
                    style={{ width: index <= step ? "100%" : "0%" }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="relative -mt-6 flex flex-1 flex-col px-5 pb-10">
            <motion.div
              key={step}
              initial={step === 0 ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            >
              <p className="text-[12px] text-white/50">{step + 1} of 3</p>
              <h2 className="mt-2 text-[26px] font-semibold tracking-tight leading-tight">{question.prompt}</h2>
              <div className="mt-5 flex flex-col gap-2">
                {question.options.map((option) => {
                  const selected = picks[step] === option;
                  return (
                    <button
                      key={option}
                      onClick={() => {
                        triggerHaptic("light");
                        setPicks((prev) => prev.map((value, index) => (index === step ? option : value)));
                      }}
                      className={`h-12 w-full px-4 text-left text-[15px] font-medium transition-colors duration-150 ${radius} ${
                        selected ? "bg-volt text-black" : "bg-obsidian-sheet text-white"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {step === 2 && picks[2] && (
                <p className="mt-4 text-[13px] leading-relaxed text-white/50">
                  {picks.filter(Boolean).join(", ")}. This preview opens Marco&apos;s half marathon week.
                </p>
              )}
            </motion.div>
            <button
              disabled={!picks[step]}
              onClick={() => {
                triggerHaptic("medium");
                if (step < 2) setStep((n) => n + 1);
                else setPhase("permission");
              }}
              className={`mt-auto h-12 w-full ${radius} bg-volt text-[15px] font-semibold text-black transition-[opacity,transform] duration-150 disabled:opacity-30`}
            >
              {step < 2 ? "Next" : "Continue"}
            </button>
          </div>
        </motion.div>
      )}

      {phase === "permission" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img src={HERO_PHOTO} alt="" className="absolute inset-0 h-full w-full object-cover object-[center_30%]" />
          <IOSPermissionModal onAllow={() => finish(true)} onDeny={() => finish(false)} />
        </motion.div>
      )}
    </div>
  );
}
