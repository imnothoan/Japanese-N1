create table if not exists content_sources (
  id uuid primary key default uuid_generate_v4(),
  source_name text not null,
  source_url text not null,
  license text not null,
  retrieved_at timestamptz not null default now(),
  content_type text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists content_import_reports (
  id uuid primary key default uuid_generate_v4(),
  source_id uuid references content_sources(id) on delete set null,
  content_type text not null,
  total_records int not null default 0,
  accepted_records int not null default 0,
  missing_required int not null default 0,
  duplicate_collisions int not null default 0,
  by_level jsonb not null default '{}'::jsonb,
  report_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists kana_items (
  id uuid primary key default uuid_generate_v4(),
  script text not null check (script in ('hiragana', 'katakana')),
  kana text not null,
  romaji text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(script, kana)
);

alter table vocab_items add column if not exists content_source_id uuid references content_sources(id) on delete set null;
alter table kanji_items add column if not exists content_source_id uuid references content_sources(id) on delete set null;
alter table grammar_points add column if not exists content_source_id uuid references content_sources(id) on delete set null;
alter table reading_passages add column if not exists content_source_id uuid references content_sources(id) on delete set null;
alter table listening_tracks add column if not exists content_source_id uuid references content_sources(id) on delete set null;

alter table review_items add column if not exists lapse_count int not null default 0;
alter table profiles add column if not exists kana_mastered boolean not null default false;

alter table mock_test_attempts add column if not exists status text not null default 'in_progress';
alter table mock_test_attempts add column if not exists current_section text;
alter table mock_test_attempts add column if not exists remaining_seconds int;
alter table mock_test_attempts add column if not exists section_state jsonb not null default '{}'::jsonb;
alter table mock_test_attempts add column if not exists responses jsonb not null default '{}'::jsonb;

create index if not exists idx_content_sources_type on content_sources(content_type);
create index if not exists idx_import_reports_type on content_import_reports(content_type, created_at desc);
create index if not exists idx_mock_attempts_status on mock_test_attempts(user_id, status, updated_at desc);

alter table content_sources enable row level security;
alter table content_import_reports enable row level security;
alter table kana_items enable row level security;

create policy "public content sources read" on content_sources for select using (true);
create policy "service role content sources write" on content_sources for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role import reports write" on content_import_reports for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "public import reports read" on content_import_reports for select using (true);
create policy "public kana read" on kana_items for select using (true);
create policy "service role kana write" on kana_items for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
