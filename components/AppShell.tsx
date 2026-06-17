"use client";

import { useEffect, useState } from "react";
import { LoginScreen } from "@/components/LoginScreen";
import { TrafficDashboard } from "@/components/TrafficDashboard";

const storageKey = "anicca-vision-user";

export function AppShell() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setUserEmail(window.localStorage.getItem(storageKey));
    setIsReady(true);
  }, []);

  function handleLogin(email: string) {
    window.localStorage.setItem(storageKey, email);
    setUserEmail(email);
  }

  function handleLogout() {
    window.localStorage.removeItem(storageKey);
    setUserEmail(null);
  }

  if (!isReady) {
    return <div className="min-h-screen bg-[#eef5fc]" />;
  }

  if (!userEmail) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return <TrafficDashboard onLogout={handleLogout} userEmail={userEmail} />;
}
