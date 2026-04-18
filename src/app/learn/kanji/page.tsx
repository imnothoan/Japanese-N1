import { AppShell } from "@/components/app-shell";
import { ModulePage } from "@/components/module-page";

export default function KanjiPage() {
  return <AppShell title="Kanji"><ModulePage title="Kanji" table="kanji_items" /></AppShell>;
}
