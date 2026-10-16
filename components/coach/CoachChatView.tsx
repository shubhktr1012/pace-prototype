"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { triggerHaptic } from "@/lib/haptics";
import { sound } from "@/lib/audio";
import { Icon } from "@/components/icons/Icon";
import { usePaceStore } from "@/lib/store";
import { formatDistance, formatPace, paceSuffix, unitLabel } from "@/lib/units";

type Adaptation = "none" | "calves" | "short";
type CoachLine = "opener" | "calves" | "short";

interface Message {
  id: string;
  sender: "coach" | "user";
  text: string;
  line?: CoachLine;
}

interface Step {
  name: string;
  detail: React.ReactNode;
  accent?: "volt" | "cyan";
}

const coachLines: Record<CoachLine, string> = {
  opener: "Today is a fast workout. Five short repeats.",
  calves: "I took out the fast repeats. Today is an easy 35 minute run so your calves can recover.",
  short: "I shortened today. Five minutes easy, fifteen steady, five walking. The fast repeats move to Thursday.",
};

export function CoachChatView() {
  const { platform, distanceUnit } = usePaceStore();
  const ios = platform === "ios";
  const radius = ios ? "rounded-[22px]" : "rounded-2xl";
  const chip = ios ? "rounded-full" : "rounded-lg";
  const [adaptation, setAdaptation] = useState<Adaptation>("none");
  const [showSync, setShowSync] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: "m-1", sender: "coach", text: coachLines.opener, line: "opener" },
  ]);

  // A chip tap changes the plan card in place, so the page stays put and the change is seen.
  // Typing a message follows the thread instead.
  const followThreadRef = useRef(false);

  const apply = (next: Exclude<Adaptation, "none">) => {
    triggerHaptic("success");
    sound.playBeep(440, 0.15, "triangle");
    followThreadRef.current = false;
    setAdaptation(next);
    setShowSync(true);

    const userText = next === "calves" ? "My calves are tight." : "I only have 25 minutes.";
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, sender: "user", text: userText },
      { id: `c-${Date.now() + 1}`, sender: "coach", text: coachLines[next], line: next },
    ]);
    sound.speak(
      next === "calves"
        ? "Done. Today is an easy 35 minute run. It is on your watch."
        : "Done. Today is a 25 minute run. It is on your watch."
    );
    window.setTimeout(() => setShowSync(false), 2800);
  };

  const restore = () => {
    triggerHaptic("light");
    setAdaptation("none");
  };

  const send = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputValue.trim();
    if (!text) return;
    triggerHaptic("light");
    followThreadRef.current = true;
    setInputValue("");
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, sender: "user", text }]);
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `c-${Date.now()}`,
          sender: "coach",
          text: "Got it. Today's run stays as it is, and I will check how you feel next time.",
        },
      ]);
      sound.playBeep(659.25, 0.1);
    }, 500);
  };

  const pace = (pacePerKm: string, tone: "volt" | "cyan") => (
    <span className={`metric-mono font-semibold ${tone === "volt" ? "text-volt" : "text-cyan"}`}>
      {formatPace(pacePerKm, distanceUnit)} {paceSuffix(distanceUnit)}
    </span>
  );
  const easyDistance = `${formatDistance(1, distanceUnit, 1)} ${unitLabel(distanceUnit)}`;
  const repeatDistance = distanceUnit === "km" ? "800 meters" : "about half a mile";

  const steps: Step[] =
    adaptation === "calves"
      ? [
          { name: "Warm up", detail: "10 minutes easy." },
          {
            name: "Easy running",
            detail: <>25 more minutes at {pace("6:05", "cyan")}. Short, quick steps.</>,
            accent: "cyan",
          },
          { name: "Cool down", detail: "Walk until your calves loosen." },
        ]
      : adaptation === "short"
        ? [
            { name: "Warm up", detail: "5 minutes easy." },
            { name: "Steady running", detail: <>15 minutes at {pace("5:40", "cyan")}.</>, accent: "cyan" },
            { name: "Cool down", detail: "5 minutes walking." },
          ]
        : [
            { name: "Warm up", detail: <>Easy for about <span className="metric-mono">{easyDistance}</span>.</> },
            {
              name: "The hard part",
              detail: (
                <>
                  Run {repeatDistance}, five times, at {pace("4:55", "volt")}. Jog 90 seconds between them.
                </>
              ),
              accent: "volt",
            },
            { name: "Cool down", detail: <>Easy again for about <span className="metric-mono">{easyDistance}</span>.</> },
          ];

  const summary =
    adaptation === "calves"
      ? "About 35 minutes. Keep your heart near 142."
      : adaptation === "short"
        ? "About 25 minutes. Keep your heart near 150."
        : "About 45 minutes. Keep your heart near 168.";

  const why =
    adaptation === "calves"
      ? "Easy running keeps the week on track without making the tightness worse."
      : adaptation === "short"
        ? "You still get a run in. The hard workout can wait."
        : "This teaches you to hold a faster pace without sprinting.";

  const week: [string, string, "done" | "today" | "plan" | "rest"][] = [
    ["Mon", "", "done"],
    ["Tue", "", "done"],
    ["Wed", adaptation === "calves" ? "Easy" : adaptation === "short" ? "Short" : "Today", "today"],
    ["Thu", "Fast", "plan"],
    ["Fri", "Easy", "plan"],
    ["Sat", "Long", "plan"],
    ["Sun", "Rest", "rest"],
  ];

  const opener = messages[0];
  const thread = messages.slice(1);
  const threadEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (thread.length === 0 || !followThreadRef.current) return;
    threadEndRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [thread.length]);

  return (
    <div className="relative flex flex-col gap-4">
      {/* Zero-height anchor: the toast floats over the page and never pushes content. -mb-4 cancels the flex gap. */}
      <div className="sticky top-0 z-10 -mb-4 h-0">
        <AnimatePresence>
          {showSync && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className="absolute inset-x-0 top-0 h-9 px-3 rounded-full bg-cyan text-black text-[12px] font-semibold flex items-center justify-between"
            >
              <span className="inline-flex items-center gap-1.5">
                <Icon name="watch" size={14} />
                On your Apple Watch
              </span>
              <Icon name="check" size={14} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <header className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-volt text-black text-[15px] font-semibold flex items-center justify-center">
          P
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-[20px] font-semibold tracking-tight leading-tight flex items-center gap-2">
            Coach PACE
            <span className="w-1.5 h-1.5 rounded-full bg-volt" />
          </h2>
          <p className="text-[12px] text-white/45">Wednesday · Week 4 of your half marathon</p>
        </div>
      </header>

      {opener && (
        <p className="text-[17px] leading-snug text-white">
          {adaptation === "none" ? messageText(opener) : coachLines[adaptation]}
        </p>
      )}

      <section className={`${radius} bg-obsidian-sheet px-4 py-4`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={adaptation}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.24, ease: [0.23, 1, 0.32, 1] } }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
          >
            <p className={`text-[12px] font-semibold uppercase tracking-[0.12em] ${adaptation === "none" ? "text-volt" : "text-cyan"}`}>
              {adaptation === "none" ? "Today's run" : "Changed for today"}
            </p>

            {adaptation === "none" ? (
              <h3 className="mt-2 text-[20px] font-semibold text-white tracking-tight">Fast workout</h3>
            ) : (
              <div className="mt-2">
                <p className="relative inline-block text-[13px] text-white/35">
                  Fast workout
                  <motion.span
                    aria-hidden
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.2, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    className="absolute inset-x-0 top-1/2 h-px origin-left bg-white/45"
                  />
                </p>
                <h3 className="text-[20px] font-semibold text-white tracking-tight">
                  {adaptation === "calves" ? "Easy run" : "25 minute run"}
                </h3>
              </div>
            )}

            <ol className="mt-4 flex flex-col">
              {steps.map((step, i) => (
                <li key={step.name} className="relative flex gap-3 pb-4 last:pb-0">
                  {i < steps.length - 1 && <span className="absolute left-3 top-7 bottom-1 w-px bg-white/10" />}
                  <span
                    className={`relative w-6 h-6 shrink-0 ${chip} text-[12px] font-semibold metric-mono flex items-center justify-center ${
                      step.accent === "volt"
                        ? "bg-volt text-black"
                        : step.accent === "cyan"
                          ? "bg-cyan text-black"
                          : "bg-white/10 text-white"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-[15px] font-semibold text-white leading-tight">{step.name}</p>
                    <p className="mt-1 text-[13px] text-white/55 leading-snug">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>

            <p className="mt-4 pt-3 border-t border-white/5 text-[13px] text-white/45">{summary}</p>
          </motion.div>
        </AnimatePresence>
      </section>

      <p className="text-[13px] text-white/55 leading-snug">{why}</p>

      {adaptation === "none" ? (
        <div className="flex flex-col gap-2">
          <h3 className="text-[15px] font-semibold text-white">Need a different run?</h3>
          <button
            onClick={() => apply("calves")}
            className={`h-12 px-4 w-full flex items-center gap-3 text-left text-[15px] font-medium text-white bg-obsidian-sheet active:opacity-70 ${radius}`}
          >
            <Icon name="heart" size={16} className="text-infrared" />
            My calves are tight
          </button>
          <button
            onClick={() => apply("short")}
            className={`h-12 px-4 w-full flex items-center gap-3 text-left text-[15px] font-medium text-white bg-obsidian-sheet active:opacity-70 ${radius}`}
          >
            <Icon name="clock" size={16} className="text-cyan" />
            I only have 25 minutes
          </button>
        </div>
      ) : (
        <button
          onClick={restore}
          className={`h-12 px-4 w-full flex items-center gap-3 text-left text-[15px] font-medium text-white bg-obsidian-sheet active:opacity-70 ${radius}`}
        >
          <Icon name="reset" size={16} className="text-volt" />
          Back to the fast workout
        </button>
      )}

      <div>
        <h3 className="text-[15px] font-semibold text-white">This week</h3>
        <div className="mt-2 grid grid-cols-7 gap-1">
          {week.map(([day, word, state]) => (
            <div key={day} className="flex flex-col items-center gap-1">
              <span className={`text-[10px] ${state === "today" ? "text-white" : "text-white/35"}`}>{day}</span>
              <span
                className={`w-full h-8 flex items-center justify-center text-[11px] font-semibold transition-colors duration-200 ${chip} ${
                  state === "today"
                    ? adaptation === "none"
                      ? "bg-volt text-black"
                      : "bg-cyan text-black"
                    : state === "done"
                      ? "bg-white/10 text-volt"
                      : state === "plan"
                        ? "bg-white/10 text-white/80"
                        : "bg-white/5 text-white/35"
                }`}
              >
                {state === "done" ? <Icon name="check" size={12} /> : word}
              </span>
            </div>
          ))}
        </div>
      </div>

      {thread.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {thread.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <p
                className={`max-w-[88%] px-3.5 py-2.5 text-[13px] leading-relaxed ${
                  m.sender === "user"
                    ? "bg-volt text-black rounded-2xl rounded-br-md"
                    : "bg-obsidian-raised text-white/90 rounded-2xl rounded-bl-md"
                }`}
              >
                {messageText(m)}
              </p>
            </motion.div>
          ))}
          <div ref={threadEndRef} />
        </div>
      )}

      <form onSubmit={send} className="flex items-center gap-2">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Or tell the coach in your own words"
          className={`flex-1 min-w-0 h-11 px-4 bg-obsidian-raised text-[16px] text-white placeholder:text-white/35 outline-none ${radius}`}
        />
        <button
          type="submit"
          aria-label="Send"
          disabled={!inputValue.trim()}
          className={`h-11 w-11 shrink-0 ${radius} bg-volt text-black flex items-center justify-center disabled:opacity-30`}
        >
          <Icon name="send" size={16} />
        </button>
      </form>
    </div>
  );
}

function messageText(message: Message) {
  return message.line ? coachLines[message.line] : message.text;
}
