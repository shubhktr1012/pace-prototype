"use client";

import React, { useState } from "react";
import { Drawer } from "vaul";
import { usePaceStore } from "@/lib/store";

export function IOSPermissionModal({
  onAllow,
  onDeny,
}: {
  onAllow: () => void;
  onDeny: () => void;
}) {
  const ios = usePaceStore((s) => s.platform) === "ios";
  const radius = ios ? "rounded-[28px]" : "rounded-2xl";
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  return (
    <div ref={setContainer} className="absolute inset-0">
      {container && (
        <Drawer.Root
          open
          dismissible
          onOpenChange={(next) => {
            if (!next) onDeny();
          }}
        >
          <Drawer.Portal container={container}>
            <Drawer.Overlay className="absolute inset-0 z-10 bg-black/55" />
            <Drawer.Content
              className={`absolute inset-x-0 bottom-0 z-10 bg-obsidian-sheet px-5 pt-3 pb-10 outline-none ${
                ios ? "rounded-t-[28px]" : "rounded-t-2xl"
              }`}
            >
              <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-white/25" />
              <p className="text-[20px] font-semibold tracking-tight">
                {ios ? "Allow PACE to use your location?" : "Use your location?"}
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-white/60">
                PACE draws your route and counts distance while you run, including when the phone is locked.
              </p>
              <button
                type="button"
                data-vaul-no-drag
                onClick={onAllow}
                className={`mt-5 h-12 w-full ${radius} bg-volt text-black text-[15px] font-semibold`}
              >
                {ios ? "Always Allow" : "Allow"}
              </button>
              <button
                type="button"
                data-vaul-no-drag
                onClick={onDeny}
                className="mt-2 h-10 w-full text-[14px] text-white/50"
              >
                Don&apos;t Allow
              </button>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      )}
    </div>
  );
}
