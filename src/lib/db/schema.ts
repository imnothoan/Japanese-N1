import { boolean, date, index, integer, jsonb, numeric, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

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
  state: varchar("state", { length: 16 }).default("new").notNull(),
  easinessFactor: numeric("easiness_factor", { precision: 4, scale: 2 }).default("2.50").notNull(),
  intervalDays: integer("interval_days").default(1).notNull(),
  repetitions: integer("repetitions").default(0).notNull(),
  dueDate: timestamp("due_date", { withTimezone: true }).defaultNow().notNull(),
  leech: boolean("leech").default(false).notNull(),
  notes: text("notes"),
  ...timestamps,
}, (t) => [index("review_items_due_idx").on(t.userId, t.dueDate)]);

export const reviewLogs = pgTable("review_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  reviewItemId: uuid("review_item_id").notNull(),
  userId: uuid("user_id").notNull(),
  outcome: varchar("outcome", { length: 10 }).notNull(),
  previousState: jsonb("previous_state").notNull(),
  nextState: jsonb("next_state").notNull(),
  ...timestamps,
}, (t) => [index("review_logs_user_idx").on(t.userId)]);

export const mistakeLogs = pgTable("mistake_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  module: varchar("module", { length: 20 }).notNull(),
  item: text("item").notNull(),
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
  selectedItems: jsonb("selected_items").notNull(),
  sourceLabel: text("source_label"),
  ...timestamps,
});

export const dailyTasks = pgTable("daily_tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  taskDate: date("task_date").notNull(),
  title: text("title").notNull(),
  taskType: varchar("task_type", { length: 32 }).notNull(),
  priority: integer("priority").default(3).notNull(),
  estimatedMinutes: integer("estimated_minutes").default(10).notNull(),
  completed: boolean("completed").default(false).notNull(),
  ...timestamps,
});

export const learningMetrics = pgTable("learning_metrics", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  metricDate: date("metric_date").notNull(),
  streakDays: integer("streak_days").default(0).notNull(),
  retentionRate: integer("retention_rate").default(0).notNull(),
  completionRate: integer("completion_rate").default(0).notNull(),
  studyMinutes: integer("study_minutes").default(0).notNull(),
  moduleAccuracy: jsonb("module_accuracy").notNull().default({}),
  dueForecast7: jsonb("due_forecast_7").notNull().default([]),
  dueForecast30: jsonb("due_forecast_30").notNull().default([]),
  masteryHeatmap: jsonb("mastery_heatmap").notNull().default({}),
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
