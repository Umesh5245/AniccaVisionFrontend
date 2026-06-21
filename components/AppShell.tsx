"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { DataProvider } from "@/components/DataContext";
import { LoginScreen } from "@/components/LoginScreen";
import { TrafficDashboard } from "@/components/TrafficDashboard";

const storageKey = "anicca-vision-user";

export function AppShell() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // "Remember me" persists in localStorage; otherwise sessionStorage (cleared
    // when the tab closes).
    setUserEmail(
      window.localStorage.getItem(storageKey) ?? window.sessionStorage.getItem(storageKey)
    );
    setIsReady(true);
  }, []);

  function handleLogin(email: string, remember: boolean) {
    const store = remember ? window.localStorage : window.sessionStorage;
    const other = remember ? window.sessionStorage : window.localStorage;
    store.setItem(storageKey, email);
    other.removeItem(storageKey);
    setUserEmail(email);
  }

  function handleLogout() {
    window.localStorage.removeItem(storageKey);
    window.sessionStorage.removeItem(storageKey);
    setUserEmail(null);
  }

  if (!isReady) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface-tint text-primary">
        <Loader2 className="animate-spin" size={28} />
      </div>
    );
  }

  if (!userEmail) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <DataProvider>
      <TrafficDashboard onLogout={handleLogout} userEmail={userEmail} />
    </DataProvider>
  );
}
