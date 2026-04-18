import { AppShell } from "@/components/app-shell";
import { ModulePage } from "@/components/module-page";

export default function ListeningPage() {
  return <AppShell title="Listening"><ModulePage title="Listening" table="listening_tracks" /></AppShell>;
}
