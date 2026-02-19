"use client";

import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 768;

let mql: MediaQueryList | null = null;

function getMediaQuery() {
  return (mql ??= window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`));
}

function subscribe(callback: () => void) {
  const mq = getMediaQuery();
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSnapshot() {
  return getMediaQuery().matches;
}

function getServerSnapshot() {
  return false;
}

export function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
