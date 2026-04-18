import { AppShell } from "@/components/app-shell";
import { ModulePage } from "@/components/module-page";

export default function ReadingPage() {
  return <AppShell title="Reading"><ModulePage title="Reading" table="reading_passages" /></AppShell>;
}
