import { boolean, index, integer, jsonb, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  displayName: varchar("display_name", { length: 120 }),
  avatarUrl: text("avatar_url"),
  ...timestamps,
});

export const studyGoals = pgTable("study_goals", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  targetJlptLevel: varchar("target_jlpt_level", { length: 2 }).notNull(),
  targetExamDate: timestamp("target_exam_date", { withTimezone: true }),
  dailyMinutes: integer("daily_minutes").notNull(),
  preferredSchedule: varchar("preferred_schedule", { length: 20 }).notNull(),
  ...timestamps,
}, (t) => [index("study_goals_user_idx").on(t.userId)]);

export const reviewItems = pgTable("review_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  module: varchar("module", { length: 30 }).notNull(),
  sourceItemId: uuid("source_item_id").notNull(),
  easinessFactor: integer("easiness_factor").default(250).notNull(),
  intervalDays: integer("interval_days").default(1).notNull(),
  repetitions: integer("repetitions").default(0).notNull(),
  dueDate: timestamp("due_date", { withTimezone: true }).defaultNow().notNull(),
  leech: boolean("leech").default(false).notNull(),
  ...timestamps,
}, (t) => [index("review_items_due_idx").on(t.userId, t.dueDate)]);

export const reviewLogs = pgTable("review_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  reviewItemId: uuid("review_item_id").notNull(),
  userId: uuid("user_id").notNull(),
  grade: varchar("grade", { length: 10 }).notNull(),
  previousState: jsonb("previous_state").notNull(),
  nextState: jsonb("next_state").notNull(),
  ...timestamps,
}, (t) => [index("review_logs_user_idx").on(t.userId)]);

export const mistakeLogs = pgTable("mistake_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  module: varchar("module", { length: 20 }).notNull(),
  itemId: uuid("item_id").notNull(),
  questionContext: text("question_context").notNull(),
  chosenAnswer: text("chosen_answer").notNull(),
  correctAnswer: text("correct_answer").notNull(),
  errorType: varchar("error_type", { length: 40 }).notNull(),
  ...timestamps,
}, (t) => [index("mistake_logs_user_idx").on(t.userId)]);

export const minedEntries = pgTable("mined_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  sourceText: text("source_text").notNull(),
  selectedTokens: jsonb("selected_tokens").notNull(),
  ...timestamps,
});

export const dailyTasks = pgTable("daily_tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  taskType: varchar("task_type", { length: 32 }).notNull(),
  title: text("title").notNull(),
  effortMinutes: integer("effort_minutes").notNull(),
  metadata: jsonb("metadata").notNull().default({}),
  ...timestamps,
});

export const learningMetrics = pgTable("learning_metrics", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  metricDate: timestamp("metric_date", { withTimezone: true }).notNull(),
  streakDays: integer("streak_days").default(0).notNull(),
  retentionRate: integer("retention_rate").default(0).notNull(),
  studyMinutes: integer("study_minutes").default(0).notNull(),
  payload: jsonb("payload").notNull().default({}),
  ...timestamps,
});

export const auditEvents = pgTable("audit_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id"),
  action: varchar("action", { length: 80 }).notNull(),
  entityType: varchar("entity_type", { length: 40 }).notNull(),
  entityId: uuid("entity_id"),
  payload: jsonb("payload").notNull().default({}),
  ...timestamps,
});
