export type AuditAction =
  | "study_progress_updated"
  | "test_submitted"
  | "mined_entry_created"
  | "onboarding_saved";

export const logInfo = (message: string, metadata?: unknown) => {
  console.info(JSON.stringify({ level: "info", message, metadata, at: new Date().toISOString() }));
};

export const logError = (message: string, metadata?: unknown) => {
  console.error(JSON.stringify({ level: "error", message, metadata, at: new Date().toISOString() }));
};
