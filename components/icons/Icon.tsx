import React from "react";

export type IconName =
  | "shoe"
  | "plan"
  | "club"
  | "medal"
  | "play"
  | "pause"
  | "flag"
  | "reset"
  | "heart"
  | "bolt"
  | "clock"
  | "locate"
  | "chevronUp"
  | "trend"
  | "watch"
  | "send"
  | "chat"
  | "share"
  | "pin"
  | "check"
  | "pulse"
  | "runner"
  | "phone";

const glyphs: Record<IconName, React.ReactNode> = {
  shoe: (
    <>
      <circle cx="12" cy="12" r="7.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  plan: (
    <>
      <path d="M5 6.5h14M5 12h10M5 17.5h7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  club: (
    <>
      <circle cx="9" cy="9" r="3.1" />
      <circle cx="15.2" cy="9.4" r="2.6" />
      <path d="M3.8 18.2c.4-2.6 2.4-4 5.2-4s4.6 1.3 5 3.6c.2-1.6 1.6-2.8 3.6-2.8 1.6 0 2.8.8 3.2 2.4.2.8-.4 1.6-1.2 1.6H5c-.8 0-1.4-.7-1.2-1.4z" />
    </>
  ),
  medal: (
    <>
      <path d="M8.2 3.2h2.1L12 7.2l1.7-4h2.1L12.6 10H11.4L8.2 3.2z" />
      <circle cx="12" cy="15.4" r="4.3" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M10.3 15.4 11.5 16.6 13.8 14.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </>
  ),
  play: <path d="M8 5.8v12.4c0 .8.9 1.3 1.6.8l9-6.2c.6-.4.6-1.3 0-1.7l-9-6.2c-.7-.4-1.6 0-1.6.9z" />,
  pause: (
    <>
      <rect x="6.5" y="5" width="3.4" height="14" rx="1" />
      <rect x="14.1" y="5" width="3.4" height="14" rx="1" />
    </>
  ),
  flag: <path d="M6 3.5h1.4V21H6V3.5zm1.4 1.2h10.2L15.2 9l2.4 4.2H7.4V4.7z" />,
  reset: (
    <path
      d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3L5.6 7.8M5.6 4.3v3.5h3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  heart: (
    <path d="M12 19.2s-6.8-4.1-6.8-8.2C5.2 8.4 7.1 6.8 9.2 6.8c1.2 0 2.2.6 2.8 1.5.6-.9 1.6-1.5 2.8-1.5 2.1 0 4 1.6 4 4.2 0 4.1-6.8 8.2-6.8 8.2z" />
  ),
  bolt: <path d="M13.2 2.8 5.4 13h5.2l-.8 8.2 8-10.6h-5.2l.6-7.8z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4.2l2.6 1.6" stroke="#07080A" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  locate: (
    <>
      <circle cx="12" cy="12" r="6.6" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="12" cy="12" r="3.1" />
      <path d="M12 2.4v3M12 18.6v3M2.4 12h3M18.6 12h3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </>
  ),
  chevronUp: <path d="M6.2 14.4 12 8.6l5.8 5.8-1.4 1.4L12 11.4l-4.4 4.4-1.4-1.4z" />,
  trend: <path d="M4 16.5 9.2 11l3.2 2.6L20 6.8v3.2h-2.2l-4.8 5.2-3.2-2.6L6 16.5H4z" />,
  watch: (
    <>
      <rect x="7" y="5.5" width="10" height="13" rx="3.2" />
      <path d="M9 5.5 10 3h4l1 2.5M9 18.5 10 21h4l1-2.5" />
    </>
  ),
  send: <path d="M3.6 11.2 20.2 4.2l-6.2 16-2.8-6.2-7.6-2.8z" />,
  chat: <path d="M5 5.5h14a2 2 0 0 1 2 2v7.2a2 2 0 0 1-2 2H10l-4.2 3.2V16.7H5a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2z" />,
  share: <path d="M14 4.2h6v6h-2.1V7.7l-7.2 7.2-1.5-1.5 7.2-7.2H14V4.2zM6 7.5h5v2H7.5v7h7V13h2v5.2a1.5 1.5 0 0 1-1.5 1.5H6.8a1.5 1.5 0 0 1-1.5-1.5V8.8A1.5 1.5 0 0 1 6.8 7.5H6z" />,
  pin: <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10zm0-7.6a2.4 2.4 0 1 1 0-4.8 2.4 2.4 0 0 1 0 4.8z" />,
  check: <path d="M5.2 12.4 9.4 16.6 18.8 7.2l-1.5-1.5-7.9 7.9-2.7-2.7-1.5 1.5z" />,
  pulse: <path d="M2.8 12h3.4l2-4.6 3.2 9.2 2.2-5.2H21" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  runner: (
    <>
      <circle cx="14.6" cy="4.3" r="2" />
      <path
        d="M6.4 10.4 9.2 8.2l3.8-.6 2.4 3 2.8.2M13 7.6l-2 5.6 2.6 2.8-1 4.6M11 13.2l-2.4 3-3.4.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  phone: (
    <rect x="7.2" y="3" width="9.6" height="18" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
  ),
};

export function Icon({
  name,
  size = 20,
  className = "",
  filled = true,
}: {
  name: IconName;
  size?: number;
  className?: string;
  filled?: boolean;
}) {
  const outline = name === "heart" && !filled;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill={outline ? "none" : "currentColor"}
      stroke={outline ? "currentColor" : "none"}
      strokeWidth={outline ? 1.7 : 0}
    >
      {glyphs[name]}
    </svg>
  );
}
