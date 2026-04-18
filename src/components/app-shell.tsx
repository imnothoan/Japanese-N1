import Link from "next/link";
import { SiteNav } from "@/components/site-nav";

export const AppShell = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-4 p-4 md:grid-cols-[240px_1fr]">
    <aside className="card h-fit p-4">
      <Link href="/" className="mb-4 block text-lg font-semibold">
        Nihongo Path
      </Link>
      <SiteNav />
    </aside>
    <main className="space-y-4">
      <header className="card p-4">
        <h1 className="text-xl font-semibold">{title}</h1>
      </header>
      {children}
    </main>
  </div>
);
