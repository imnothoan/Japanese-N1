create extension if not exists "uuid-ossp";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists jlpt_levels (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  sort_order int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists study_goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  target_jlpt_level text not null,
  target_exam_date timestamptz,
  daily_minutes int not null check (daily_minutes between 15 and 600),
  preferred_schedule text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists study_plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  plan_date date not null,
  tasks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, plan_date)
);

create table if not exists study_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  module text not null,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_minutes int,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists vocab_items (
  id uuid primary key default uuid_generate_v4(),
  term text not null,
  reading text,
  meaning text not null,
  jlpt_level text not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists kanji_items (
  id uuid primary key default uuid_generate_v4(),
  character text not null unique,
  onyomi text,
  kunyomi text,
  meaning text not null,
  jlpt_level text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists grammar_points (
  id uuid primary key default uuid_generate_v4(),
  pattern text not null,
  meaning text not null,
  explanation text not null,
  jlpt_level text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists example_sentences (
  id uuid primary key default uuid_generate_v4(),
  module text not null,
  source_item_id uuid not null,
  japanese text not null,
  english text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists reading_passages (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  content text not null,
  jlpt_level text not null,
  questions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists listening_tracks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  transcript text not null,
  audio_url text,
  jlpt_level text not null,
  questions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists review_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  module text not null,
  source_item_id uuid not null,
  state text not null default 'new',
  easiness_factor numeric(4,2) not null default 2.50,
  interval_days int not null default 1,
  repetitions int not null default 0,
  due_date timestamptz not null default now(),
  leech boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, module, source_item_id)
);

create table if not exists review_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  review_item_id uuid not null references review_items(id) on delete cascade,
  outcome text not null,
  previous_state jsonb not null,
  next_state jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists quiz_templates (
  id uuid primary key default uuid_generate_v4(),
  module text not null,
  jlpt_level text not null,
  title text not null,
  timed_seconds int,
  questions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists quiz_attempts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  quiz_template_id uuid references quiz_templates(id) on delete set null,
  module text not null,
  jlpt_level text not null,
  score int not null,
  total int not null,
  duration_seconds int,
  responses jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists mock_tests (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  level text not null,
  sections jsonb not null,
  duration_seconds int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists mock_test_attempts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  mock_test_id uuid not null references mock_tests(id) on delete cascade,
  started_at timestamptz not null,
  completed_at timestamptz,
  paused boolean not null default false,
  total_score int not null default 0,
  total_questions int not null default 0,
  section_scores jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists mock_test_section_results (
  id uuid primary key default uuid_generate_v4(),
  attempt_id uuid not null references mock_test_attempts(id) on delete cascade,
  section_name text not null,
  score int not null,
  total int not null,
  elapsed_seconds int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists mistake_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  item text not null,
  module text not null,
  question_context text not null,
  chosen_answer text not null,
  correct_answer text not null,
  error_type text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists mined_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  source_text text not null,
  selected_items jsonb not null default '[]'::jsonb,
  source_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists daily_tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  task_date date not null,
  title text not null,
  task_type text not null,
  priority int not null default 3,
  estimated_minutes int not null default 10,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists learning_metrics (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  metric_date date not null,
  streak_days int not null default 0,
  retention_rate int not null default 0,
  completion_rate int not null default 0,
  study_minutes int not null default 0,
  module_accuracy jsonb not null default '{}'::jsonb,
  due_forecast_7 jsonb not null default '[]'::jsonb,
  due_forecast_30 jsonb not null default '[]'::jsonb,
  mastery_heatmap jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, metric_date)
);

create table if not exists audit_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_review_due on review_items(user_id, due_date);
create index if not exists idx_quiz_attempts_user_created on quiz_attempts(user_id, created_at desc);
create index if not exists idx_mock_attempts_user_created on mock_test_attempts(user_id, created_at desc);
create index if not exists idx_mistake_logs_user_type on mistake_logs(user_id, error_type);
create index if not exists idx_learning_metrics_user_date on learning_metrics(user_id, metric_date desc);

alter table profiles enable row level security;
alter table study_goals enable row level security;
alter table study_plans enable row level security;
alter table study_sessions enable row level security;
alter table review_items enable row level security;
alter table review_logs enable row level security;
alter table quiz_attempts enable row level security;
alter table mock_test_attempts enable row level security;
alter table mock_test_section_results enable row level security;
alter table mistake_logs enable row level security;
alter table mined_entries enable row level security;
alter table daily_tasks enable row level security;
alter table notifications enable row level security;
alter table learning_metrics enable row level security;
alter table audit_events enable row level security;

create policy "profiles owner" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "study_goals owner" on study_goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "study_plans owner" on study_plans for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "study_sessions owner" on study_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "review_items owner" on review_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "review_logs owner" on review_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "quiz_attempts owner" on quiz_attempts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "mock_test_attempts owner" on mock_test_attempts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "mock_test_section_results owner" on mock_test_section_results for all using (exists (select 1 from mock_test_attempts m where m.id = attempt_id and m.user_id = auth.uid()));
create policy "mistake_logs owner" on mistake_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "mined_entries owner" on mined_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "daily_tasks owner" on daily_tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notifications owner" on notifications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "learning_metrics owner" on learning_metrics for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "audit_events owner" on audit_events for select using (auth.uid() = user_id);

create policy "public vocab read" on vocab_items for select using (true);
create policy "public kanji read" on kanji_items for select using (true);
create policy "public grammar read" on grammar_points for select using (true);
create policy "public reading read" on reading_passages for select using (true);
create policy "public listening read" on listening_tracks for select using (true);
create policy "public quiz templates read" on quiz_templates for select using (true);
create policy "public mock tests read" on mock_tests for select using (true);
