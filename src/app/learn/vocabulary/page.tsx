import { AppShell } from "@/components/app-shell";
import { ModulePage } from "@/components/module-page";

export default function VocabularyPage() {
  return <AppShell title="Vocabulary"><ModulePage title="Vocabulary" table="vocab_items" /></AppShell>;
}
