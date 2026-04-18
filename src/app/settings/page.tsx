"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { AppShell } from "@/components/app-shell";
import { supabase } from "@/lib/client";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    setStatus(error ? error.message : "Magic link sent.");
  };

  return (
    <AppShell title="Settings">
      <section className="card p-4 space-y-3">
        <h2 className="font-semibold">Theme</h2>
        <div className="flex gap-2">
          <button className="rounded-lg border px-3 py-1" onClick={() => setTheme("light")}>Light</button>
          <button className="rounded-lg border px-3 py-1" onClick={() => setTheme("dark")}>Dark</button>
          <button className="rounded-lg border px-3 py-1" onClick={() => setTheme("system")}>System ({theme})</button>
        </div>
      </section>
      <section className="card p-4 space-y-3">
        <h2 className="font-semibold">Auth</h2>
        <input className="rounded-lg border p-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-white" onClick={signIn}>Send magic link</button>
        {status ? <p className="text-sm">{status}</p> : null}
      </section>
    </AppShell>
  );
}
