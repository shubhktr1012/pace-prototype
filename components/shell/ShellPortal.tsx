"use client";

import React, { createContext, useContext } from "react";

const ShellPortalContext = createContext<HTMLDivElement | null>(null);

export function ShellPortalProvider({
  value,
  children,
}: {
  value: HTMLDivElement | null;
  children: React.ReactNode;
}) {
  return <ShellPortalContext.Provider value={value}>{children}</ShellPortalContext.Provider>;
}

export function useShellPortal() {
  return useContext(ShellPortalContext);
}
