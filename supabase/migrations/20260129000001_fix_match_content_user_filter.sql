-- Fix match_content to require user_id filter (prevents cross-user data leakage)
create or replace function public.match_content(
  query_embedding vector(1536),
    match_threshold float default 0.75,
      match_count int default 10,
        filter_user_id uuid default null
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
                                          and (filter_user_id is null or content.user_id = filter_user_id)
                                            order by content.embedding <=> query_embedding
                                              limit match_count;
                                              $$;
                                              