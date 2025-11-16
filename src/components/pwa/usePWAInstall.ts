"use client";

import { useEffect, useMemo, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function usePWAInstall() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [installed, setInstalled] = useState(false);

  const isStandalone = useMemo(() => {
    // Chrome/Edge
    const displayModeStandalone = window.matchMedia?.(
      "(display-mode: standalone)"
    )?.matches;
    // iOS Safari
    const navStandalone = (navigator as any).standalone === true;
    return displayModeStandalone || navStandalone;
  }, []);

  const isIOS = useMemo(
    () => /iphone|ipad|ipod/i.test(navigator.userAgent),
    []
  );
  const isEligibleBrowser = useMemo(() => !isIOS, [isIOS]); // só Chromium tem o prompt

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler as any);

    const onInstalled = () => setInstalled(true);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler as any);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function promptInstall() {
    if (!deferred) return { outcome: "dismissed" as const };
    await deferred.prompt();
    const choice = await deferred.userChoice;
    // Depois de usar, zere o deferred para não reaparecer até o próximo evento
    setDeferred(null);
    return choice;
  }

  return {
    canPrompt: Boolean(deferred),
    promptInstall,
    installed,
    isStandalone,
    isIOS,
    isEligibleBrowser,
  };
}
