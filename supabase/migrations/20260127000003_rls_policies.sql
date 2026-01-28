-- Enable Row Level Security on all tables
alter table public.content enable row level security;
alter table public.research_urls enable row level security;
alter table public.research_content enable row level security;
alter table public.topic_keywords enable row level security;
alter table public.excluded_topics enable row level security;
alter table public.phrase_patterns enable row level security;
alter table public.user_settings enable row level security;
alter table public.generation_jobs enable row level security;

-- Content policies
create policy "Users can view their own content"
  on public.content for select
  using (auth.uid() = user_id);

create policy "Users can insert their own content"
  on public.content for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own content"
  on public.content for update
  using (auth.uid() = user_id);

create policy "Users can delete their own content"
  on public.content for delete
  using (auth.uid() = user_id);

-- Research URLs policies
create policy "Users can view their own research URLs"
  on public.research_urls for select
  using (auth.uid() = user_id);

create policy "Users can insert their own research URLs"
  on public.research_urls for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own research URLs"
  on public.research_urls for update
  using (auth.uid() = user_id);

create policy "Users can delete their own research URLs"
  on public.research_urls for delete
  using (auth.uid() = user_id);

-- Research content policies (via research_urls ownership)
create policy "Users can view research content for their URLs"
  on public.research_content for select
  using (
    exists (
      select 1 from public.research_urls
      where research_urls.id = research_content.research_url_id
        and research_urls.user_id = auth.uid()
    )
  );

create policy "Users can insert research content for their URLs"
  on public.research_content for insert
  with check (
    exists (
      select 1 from public.research_urls
      where research_urls.id = research_content.research_url_id
        and research_urls.user_id = auth.uid()
    )
  );

-- Topic keywords policies
create policy "Users can view their own topic keywords"
  on public.topic_keywords for select
  using (auth.uid() = user_id);

create policy "Users can insert their own topic keywords"
  on public.topic_keywords for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own topic keywords"
  on public.topic_keywords for delete
  using (auth.uid() = user_id);

-- Excluded topics policies
create policy "Users can view their own excluded topics"
  on public.excluded_topics for select
  using (auth.uid() = user_id);

create policy "Users can insert their own excluded topics"
  on public.excluded_topics for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own excluded topics"
  on public.excluded_topics for delete
  using (auth.uid() = user_id);

-- Phrase patterns policies
create policy "Users can view their own phrase patterns"
  on public.phrase_patterns for select
  using (auth.uid() = user_id);

create policy "Users can insert their own phrase patterns"
  on public.phrase_patterns for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own phrase patterns"
  on public.phrase_patterns for update
  using (auth.uid() = user_id);

create policy "Users can delete their own phrase patterns"
  on public.phrase_patterns for delete
  using (auth.uid() = user_id);

-- User settings policies
create policy "Users can view their own settings"
  on public.user_settings for select
  using (auth.uid() = user_id);

create policy "Users can insert their own settings"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own settings"
  on public.user_settings for update
  using (auth.uid() = user_id);

-- Generation jobs policies
create policy "Users can view their own generation jobs"
  on public.generation_jobs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own generation jobs"
  on public.generation_jobs for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own generation jobs"
  on public.generation_jobs for update
  using (auth.uid() = user_id);
