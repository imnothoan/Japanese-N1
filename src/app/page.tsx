import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center gap-8 p-6">
      <div className="card p-8">
        <p className="text-sm uppercase tracking-wide text-blue-600">Nihongo Path</p>
        <h1 className="mt-2 text-4xl font-bold">From Kana Zero to JLPT N1 Readiness</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          Structured curriculum, adaptive planning, SM-2 review, full JLPT drills, and analytics.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/onboarding" className="rounded-xl bg-blue-600 px-4 py-2 text-white">Start Onboarding</Link>
          <Link href="/dashboard" className="rounded-xl border px-4 py-2">Go to Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
