-- Initial schema for UER Content Planner

-- Content table (main content storage)
create table if not exists public.content (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check (platform in ('IGFB', 'LinkedIn', 'Blog', 'YouTube', 'X')),
  content_type text not null check (content_type in ('Local', 'Market', 'Educational', 'Personal', 'Promotional', 'Professional', 'Community', 'Reflection', 'Insight', 'Guide', 'Safety')),
  topic text not null,
  generated_text text not null default '',
  publish_date date not null,
  publish_time text not null default '09:00 AM',
  status text not null default 'draft' check (status in ('draft', 'approved', 'published', 'scheduled')),
  owner text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_content_user_id on public.content(user_id);
create index idx_content_status on public.content(status);
create index idx_content_platform on public.content(platform);
create index idx_content_publish_date on public.content(publish_date);

-- Research URLs table
create table if not exists public.research_urls (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  title text not null,
  category text not null default 'General' check (category in ('Market Research', 'Local News', 'Industry Trends', 'Competitor Analysis', 'General')),
  scrape_frequency text not null default 'weekly' check (scrape_frequency in ('daily', 'weekly', 'monthly')),
  is_active boolean not null default true,
  last_scraped timestamptz,
  created_at timestamptz not null default now()
);

create index idx_research_urls_user_id on public.research_urls(user_id);

-- Research content table (scraped content)
create table if not exists public.research_content (
  id uuid primary key default gen_random_uuid(),
  research_url_id uuid not null references public.research_urls(id) on delete cascade,
  raw_content text not null,
  summary text,
  scraped_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index idx_research_content_url_id on public.research_content(research_url_id);
create index idx_research_content_scraped_at on public.research_content(scraped_at desc);

-- Topic keywords table
create table if not exists public.topic_keywords (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  keyword text not null,
  created_at timestamptz not null default now()
);

create index idx_topic_keywords_user_id on public.topic_keywords(user_id);

-- Excluded topics table
create table if not exists public.excluded_topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic text not null,
  created_at timestamptz not null default now()
);

create index idx_excluded_topics_user_id on public.excluded_topics(user_id);

-- Phrase patterns table (forbidden phrases)
create table if not exists public.phrase_patterns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  phrase text not null,
  is_forbidden boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_phrase_patterns_user_id on public.phrase_patterns(user_id);

-- User settings table
create table if not exists public.user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  weekly_generation_day integer not null default 0 check (weekly_generation_day between 0 and 6),
  weekly_generation_time text not null default '18:00',
  auto_approve_enabled boolean not null default false,
  notification_email text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_user_settings_user_id on public.user_settings(user_id);

-- Generation jobs table
create table if not exists public.generation_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'running', 'completed', 'failed')),
  week_start_date date not null,
  items_generated integer not null default 0,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_generation_jobs_user_id on public.generation_jobs(user_id);
create index idx_generation_jobs_status on public.generation_jobs(status);

-- Updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers
create trigger set_content_updated_at
  before update on public.content
  for each row execute function public.handle_updated_at();

create trigger set_user_settings_updated_at
  before update on public.user_settings
  for each row execute function public.handle_updated_at();
