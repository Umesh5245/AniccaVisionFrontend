"use client";

import { Eye, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import { AniccaDataLogo } from "@/components/AniccaDataLogo";

export function LoginScreen({
  onLogin
}: {
  onLogin: (email: string, remember: boolean) => void;
}) {
  const [email, setEmail] = useState("admin@aniccavision.ai");
  const [password, setPassword] = useState("traffic123");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      return;
    }

    onLogin(email.trim(), remember);
  }

  return (
    <main className="grid min-h-full bg-surface-tint lg:grid-cols-[1fr_460px]">
      <section className="relative hidden overflow-hidden bg-slate-950 lg:block">
        <video
          autoPlay
          className="h-full w-full object-cover opacity-70"
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src="/api/video/demo_bangalore_traffic_h264.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/65 to-transparent" />
        <div className="absolute left-10 top-10 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-primary text-sm font-black text-white">
            AV
          </div>
          <span className="text-base font-semibold text-white">Anicca Vision</span>
        </div>
        <div className="absolute bottom-10 left-10 max-w-xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-200">
            Traffic Analytics
          </p>
          <h1 className="mt-4 text-5xl font-bold leading-tight text-white">
            Real-time road intelligence dashboard
          </h1>
        </div>
      </section>

      <section className="flex min-h-full items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
        <div className="w-full max-w-md rounded-md border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
          <div className="mb-8">
            <AniccaDataLogo className="mb-6" size="md" />
            <div className="mb-5 flex items-center gap-3 lg:hidden">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-primary text-sm font-black text-white">
                AV
              </div>
              <span className="text-base font-semibold text-primary">Anicca Vision</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
              <ShieldCheck size={17} />
              Secure access
            </div>
            <h2 className="mt-5 text-3xl font-bold text-slate-950">Sign in</h2>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Access the traffic analytics dashboard.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-bold text-slate-800">Email</span>
              <span className="mt-2 flex h-12 items-center gap-3 rounded-md border border-slate-300 bg-white px-3 focus-within:border-primary">
                <Mail className="shrink-0 text-slate-400" size={18} />
                <input
                  className="h-full min-w-0 flex-1 border-0 bg-transparent text-sm font-medium text-slate-950 outline-none"
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  value={email}
                />
              </span>
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-800">Password</span>
              <span className="mt-2 flex h-12 items-center gap-3 rounded-md border border-slate-300 bg-white px-3 focus-within:border-primary">
                <LockKeyhole className="shrink-0 text-slate-400" size={18} />
                <input
                  className="h-full min-w-0 flex-1 border-0 bg-transparent text-sm font-medium text-slate-950 outline-none"
                  onChange={(event) => setPassword(event.target.value)}
                  type={showPassword ? "text" : "password"}
                  value={password}
                />
                <button
                  aria-label="Toggle password visibility"
                  className="grid h-8 w-8 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100"
                  onClick={() => setShowPassword((value) => !value)}
                  type="button"
                >
                  <Eye size={17} />
                </button>
              </span>
            </label>

            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <input
                checked={remember}
                className="h-4 w-4 accent-primary"
                onChange={(event) => setRemember(event.target.checked)}
                type="checkbox"
              />
              Remember me
            </label>

            <button
              className="h-12 w-full rounded-md bg-primary text-sm font-bold text-white transition hover:bg-primary-dark"
              type="submit"
            >
              Sign in
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
