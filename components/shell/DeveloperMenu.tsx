"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Plus } from "lucide-react";

// Streamline Plump Logos
function PlumpGithub({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 5c-2.076 0-3 0.5-3 0.5-1.945-1.72-3.178-2.31-5.5-3-0.902 2.137-1.05 3.34-1 5.5C2.5 8 1 9.169 1 13c0 6.623 5.488 8.5 11 8.5s11-1.877 11-8.5c0-3.831-1.5-5-1.5-5 0.05-2.16-0.099-3.363-1-5.5-2.322 0.69-3.555 1.28-5.5 3 0 0-0.924-0.5-3-0.5Zm-2.05 6.334C7.257 11.02 4.317 10.676 4 14.5c-0.424 5.106 4.394 5.044 7.33 5.006 0.237-0.003 0.461-0.006 0.67-0.006 0.209 0 0.433 0.003 0.67 0.006 2.936 0.038 7.754 0.1 7.33-5.006-0.317-3.824-3.257-3.48-5.95-3.166-0.719 0.084-1.42 0.166-2.05 0.166-0.63 0-1.331-0.082-2.05-0.166Zm-0.2 3.916c0 1.243-0.672 2.25-1.5 2.25s-1.5-1.007-1.5-2.25S7.422 13 8.25 13s1.5 1.007 1.5 2.25Zm6 2.25c0.828 0 1.5-1.007 1.5-2.25S16.578 13 15.75 13s-1.5 1.007-1.5 2.25 0.672 2.25 1.5 2.25Z"
      />
    </svg>
  );
}

function PlumpLinkedin({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.5 6a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM6 23V8H1v15h5ZM8 8h4.5v1.946C13.216 9.005 14.746 8 17.5 8c4.33 0 5.5 4.32 5.5 7v8h-5v-8c0-1-0.5-3-2.5-3-1.42 0-2.42 1.008-3 1.951V23H8V8Z"
      />
    </svg>
  );
}

function PlumpInstagram({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.75 1h-1.5v6.75h0.313c0.36-0.336 0.758-0.632 1.187-0.88V1Zm7.687 6.75A6.477 6.477 0 0 0 12 6a6.52 6.52 0 0 0-1.75 0.238V1H20a3 3 0 0 1 3 3v3.75h-6.563Zm-1.325 1.5a4.5 4.5 0 1 1-6.225 6.5 4.5 4.5 0 0 1 6.226-6.5Zm-8.742 0a6.5 6.5 0 1 0 11.26 0H23V20a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3V9.25h5.37ZM5.75 1v6.75h-1.5V1h1.5Zm-3 0.272V7.75H1V4a3 3 0 0 1 1.75-2.728ZM17 3.5a0.5 0.5 0 0 1 0.5-0.5h2a0.5 0.5 0 0 1 0.5 0.5v2a0.5 0.5 0 0 1-0.5 0.5h-2a0.5 0.5 0 0 1-0.5-0.5v-2Z"
      />
    </svg>
  );
}

export function DeveloperMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    {
      label: "GitHub",
      href: "https://github.com/shubhktr1012",
      icon: <PlumpGithub className="text-[rgba(255,255,255,0.9)]" />,
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/shubhkhatri1209/",
      icon: <PlumpLinkedin className="text-[rgba(255,255,255,0.9)]" />,
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/shubh_khatri12",
      icon: <PlumpInstagram className="text-[rgba(255,255,255,0.9)]" />,
    },
  ];

  // Apple-specific spring configurations (highly elastic, snappy response)
  const menuVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8, y: 15 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 380, damping: 26 },
    },
    exit: {
      opacity: 0,
      scale: 0.85,
      y: 10,
      transition: { duration: 0.15, ease: "easeInOut" },
    },
  };

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className="hidden lg:flex fixed bottom-6 right-6 z-50 flex-col items-end font-sans antialiased selection:bg-none"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={menuVariants}
            className="mb-3 min-w-[190px] overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/85 p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl origin-bottom-right"
          >
            <div className="px-3 py-2 border-b border-white/[0.08] mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-volt">Developer</span>
              <p className="text-[13px] font-semibold text-white">Shubh Khatri</p>
            </div>
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[14px] font-medium text-white/90 transition-colors duration-100 hover:bg-white/10 active:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-volt"
              >
                <span>{item.label}</span>
                {item.icon}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Apple-Style Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Developer links"
        className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-neutral-900/80 text-white shadow-lg backdrop-blur-md transition-all duration-200 active:scale-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-volt"
      >
        <motion.div
          animate={{ rotate: isOpen ? 135 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Plus size={22} />
        </motion.div>
      </button>
    </div>
  );
}
