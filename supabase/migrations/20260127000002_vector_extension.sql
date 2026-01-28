-- Enable pgvector extension for semantic search
create extension if not exists vector with schema extensions;

-- Add embedding column to content table
alter table public.content
  add column if not exists embedding vector(1536);

create index idx_content_embedding on public.content
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Similarity search function
create or replace function public.match_content(
  query_embedding vector(1536),
  match_threshold float default 0.78,
  match_count int default 10
)
returns table (
  id uuid,
  topic text,
  generated_text text,
  similarity float
)
language sql stable
as $$
  select
    content.id,
    content.topic,
    content.generated_text,
    1 - (content.embedding <=> query_embedding) as similarity
  from public.content
  where 1 - (content.embedding <=> query_embedding) > match_threshold
  order by content.embedding <=> query_embedding
  limit match_count;
$$;
