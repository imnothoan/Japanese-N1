"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, ClipboardCheck, FileQuestion, Gem, Languages, ListChecks, Pickaxe, Settings, SpellCheck, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  ["/dashboard", "Dashboard", Gem],
  ["/learn/kana", "Kana", Languages],
  ["/learn/vocabulary", "Vocabulary", BookOpen],
  ["/learn/kanji", "Kanji", SpellCheck],
  ["/learn/grammar", "Grammar", ListChecks],
  ["/learn/reading", "Reading", ClipboardCheck],
  ["/learn/listening", "Listening", Volume2],
  ["/review", "Review", BookOpen],
  ["/quiz", "Quiz", FileQuestion],
  ["/mock-tests", "Mock Tests", ClipboardCheck],
  ["/mistakes", "Mistakes", ListChecks],
  ["/mining", "Mining", Pickaxe],
  ["/analytics", "Analytics", BarChart3],
  ["/settings", "Settings", Settings],
] as const;

export const SiteNav = () => {
  const pathname = usePathname();

  return (
    <nav className="grid gap-1">
      {links.map(([href, label, Icon]) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
            pathname === href ? "bg-blue-600 text-white" : "hover:bg-black/5 dark:hover:bg-white/10",
          )}
        >
          <Icon size={16} />
          {label}
        </Link>
      ))}
    </nav>
  );
};
