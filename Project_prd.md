Utah's Elite Realtors Content Planner — PRD v1.0
Product Requirements Document
Project: AI-Powered Content Planning System
Client: Utah's Elite Realtors (Liz Sears)
Builder: Echo Mind Automation (Braxton)
Date: January 27, 2026
Status: Phase 1 - Planning

Executive Summary
Replace the current Google Sheets + Apps Script system with a modern web application that:

Generates 1 week of content at a time with zero repetition for 6+ months
Uses Claude (LinkedIn/Blog), GPT (YouTube/IG/FB), and Grok (X) APIs
Researches user-provided URLs before generating content (context-aware generation)
Syncs approved content to Google Calendar automatically
Provides clean, professional UI for content review and approval
Self-hosted on Supabase (pgvector for anti-repetition)


Table of Contents

Problem Statement
Technical Architecture
Development Environment Setup
Database Schema
API Design
Research System
Frontend Specifications
Backend Specifications
Development Phases
Success Metrics


Problem Statement
Current System Limitations

Poor UX: Google Sheets is not user-friendly for content review
No anti-repetition: Topics repeat within 3-4 months
Manual workflow: No automatic calendar sync
Single API: Only uses GPT-4, missing Claude's long-form quality
No research capability: Content is generic, not informed by current market data

Target Outcomes

1-click content generation: User clicks "Generate Week" → 7 days of content ready in 3 minutes
6-month uniqueness: Vector similarity prevents repetitive topics
Research-informed: Scrape Utah real estate news, market reports, safety alerts before generating
Auto-calendar sync: Approved content appears on Google Calendar instantly
Professional UI: Clean dashboard Liz can show clients


Technical Architecture
Stack
Frontend:   Next.js 15 (App Router) + Tailwind + shadcn/ui
Backend:    Next.js API Routes + Supabase Edge Functions
Database:   Supabase PostgreSQL + pgvector
Auth:       Supabase Auth (magic link)
Hosting:    Vercel (frontend) + Supabase (backend)
Dev Env:    GitHub Codespaces + Claude Code (terminal AI)
Architecture Diagram
┌─────────────────────────────────────────────────────────────┐
│ Next.js Frontend (Vercel)                                   │
│ ┌─────────────┬─────────────┬─────────────┬──────────────┐ │
│ │ Dashboard   │ Research    │ Calendar    │ Settings     │ │
│ │ (Review)    │ Config      │ View        │ (URLs)       │ │
│ └─────────────┴─────────────┴─────────────┴──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Next.js API Routes                                          │
│ • POST /api/generate-week                                   │
│ • POST /api/approve-content                                 │
│ • GET  /api/content?status=draft                            │
│ • PATCH /api/research-urls                                  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────┬──────────────┬──────────────┬───────────────┐
│ Supabase     │ Claude API   │ OpenAI API   │ Grok API      │
│ PostgreSQL   │ (Sonnet 4.5) │ (GPT-4o)     │ (X posts)     │
│ + pgvector   │              │              │               │
└──────────────┴──────────────┴──────────────┴───────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Research Pipeline                                           │
│ 1. Fetch URLs (Jina AI Reader or Firecrawl)                │
│ 2. Extract text/markdown                                    │
│ 3. Summarize with Claude                                    │
│ 4. Store in research_context table                          │
│ 5. Inject into generation prompts                           │
└─────────────────────────────────────────────────────────────┘

Development Environment Setup
GitHub Codespaces Configuration
.devcontainer/devcontainer.json
json{
  "name": "UER Content Planner",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:1-20-bullseye",
  "features": {
    "ghcr.io/devcontainers/features/github-cli:1": {},
    "ghcr.io/devcontainers/features/docker-in-docker:2": {}
  },
  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "bradlc.vscode-tailwindcss",
        "Prisma.prisma",
        "GitHub.copilot"
      ],
      "settings": {
        "editor.formatOnSave": true,
        "editor.defaultFormatter": "esbenp.prettier-vscode",
        "editor.codeActionsOnSave": {
          "source.fixAll.eslint": true
        }
      }
    }
  },
  "postCreateCommand": "npm install && npx supabase init",
  "forwardPorts": [3000, 54321],
  "portsAttributes": {
    "3000": {
      "label": "Next.js App",
      "onAutoForward": "openBrowser"
    },
    "54321": {
      "label": "Supabase Studio"
    }
  },
  "remoteEnv": {
    "NODE_ENV": "development"
  }
}
```

### Repository Structure
```
uer-content-planner/
├── .devcontainer/
│   └── devcontainer.json
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── calendar/
│   │   │   └── page.tsx
│   │   ├── research/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── generate-week/
│   │   │   └── route.ts
│   │   ├── approve-content/
│   │   │   └── route.ts
│   │   ├── research-urls/
│   │   │   └── route.ts
│   │   ├── sync-calendar/
│   │   │   └── route.ts
│   │   └── content/
│   │       └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/              # shadcn components
│   ├── content-card.tsx
│   ├── calendar-view.tsx
│   ├── research-manager.tsx
│   └── generation-wizard.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts
│   ├── ai/
│   │   ├── claude.ts
│   │   ├── openai.ts
│   │   ├── grok.ts
│   │   └── router.ts
│   ├── research/
│   │   ├── scraper.ts
│   │   ├── summarizer.ts
│   │   └── context-builder.ts
│   ├── calendar/
│   │   └── google-calendar.ts
│   └── utils.ts
├── supabase/
│   ├── migrations/
│   │   ├── 20260127000001_initial_schema.sql
│   │   ├── 20260127000002_vector_extension.sql
│   │   └── 20260127000003_rls_policies.sql
│   ├── functions/
│   │   └── generate-embeddings/
│   │       └── index.ts
│   └── config.toml
├── docs/
│   ├── PRD.md (this file)
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── ARCHITECTURE.md
├── .env.local.example
├── .eslintrc.json
├── .prettierrc
├── next.config.js
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
Initial Setup Commands
bash# 1. Create GitHub repository
gh repo create uer-content-planner --private --clone

cd uer-content-planner

# 2. Initialize Next.js
npx create-next-app@latest . --typescript --tailwind --app --src-dir false --import-alias "@/*"

# 3. Install dependencies
npm install @supabase/supabase-js@latest
npm install @supabase/auth-helpers-nextjs
npm install @anthropic-ai/sdk
npm install openai
npm install googleapis
npm install jina-ai  # For web scraping
npm install zod      # For validation
npm install date-fns # For date manipulation

# 4. Install shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input label select textarea toast

# 5. Initialize Supabase locally
npx supabase init
npx supabase start

# 6. Setup environment variables
cp .env.local.example .env.local
# Edit .env.local with API keys

# 7. Open Codespace (or run locally)
# In GitHub UI: Code > Codespaces > New Codespace
Environment Variables
.env.local.example
bash# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI APIs
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GROK_API_KEY=xai-...

# Google Calendar
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALENDAR_ID=your-calendar-id

# Jina AI (for web scraping)
JINA_API_KEY=your-jina-key

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

Database Schema
Supabase Migrations
supabase/migrations/20260127000001_initial_schema.sql
sql-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Content table (main storage)
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content metadata
  platform TEXT NOT NULL CHECK (platform IN ('IGFB', 'LinkedIn', 'Blog', 'YouTube', 'X')),
  content_type TEXT NOT NULL CHECK (content_type IN (
    'Professional', 'Personal', 'Educational', 'Promotional', 
    'Safety', 'Market', 'Community', 'Guide', 'Local', 
    'Reflection', 'Insight'
  )),
  topic TEXT NOT NULL,
  generated_text TEXT NOT NULL,
  
  -- Publishing info
  publish_date TIMESTAMPTZ NOT NULL,
  publish_time TEXT NOT NULL,  -- "9:00 AM" format
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'published', 'archived')),
  
  -- Integration data
  calendar_event_id TEXT,
  doc_url TEXT,
  
  -- AI metadata
  api_used TEXT CHECK (api_used IN ('claude', 'gpt', 'grok')),
  generation_timestamp TIMESTAMPTZ DEFAULT NOW(),
  prompt_version TEXT,  -- Track prompt changes over time
  
  -- Research context (which URLs were used)
  research_context_ids UUID[],
  
  -- Performance tracking
  views INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2),
  client_rating INTEGER CHECK (client_rating BETWEEN 1 AND 5),
  
  -- Ownership
  owner TEXT DEFAULT 'Liz Sears',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_updated_at
  BEFORE UPDATE ON content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Indexes for common queries
CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_content_publish_date ON content(publish_date);
CREATE INDEX idx_content_platform ON content(platform);
CREATE INDEX idx_content_owner ON content(owner);
CREATE INDEX idx_content_created_at ON content(created_at DESC);

-- ============================================================================
-- RESEARCH SYSTEM
-- ============================================================================

-- Research URLs (configurable by user)
CREATE TABLE research_urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL UNIQUE,
  title TEXT,
  category TEXT,  -- 'Utah Market', 'Safety News', 'Local Events', 'Industry News'
  scrape_frequency TEXT DEFAULT 'weekly' CHECK (scrape_frequency IN ('daily', 'weekly', 'biweekly', 'monthly')),
  is_active BOOLEAN DEFAULT true,
  last_scraped TIMESTAMPTZ,
  scrape_count INTEGER DEFAULT 0,
  owner TEXT DEFAULT 'Liz Sears',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_research_urls_active ON research_urls(is_active);
CREATE INDEX idx_research_urls_category ON research_urls(category);

-- Research content (scraped data)
CREATE TABLE research_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url_id UUID REFERENCES research_urls(id) ON DELETE CASCADE,
  
  -- Scraped data
  raw_content TEXT NOT NULL,
  summary TEXT,  -- Claude-generated summary
  key_points JSONB,  -- Structured extraction
  
  -- Metadata
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  content_hash TEXT,  -- For deduplication
  word_count INTEGER,
  
  -- Usage tracking
  times_used INTEGER DEFAULT 0,
  last_used TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_research_content_url ON research_content(url_id);
CREATE INDEX idx_research_content_scraped ON research_content(scraped_at DESC);
CREATE INDEX idx_research_content_hash ON research_content(content_hash);

-- ============================================================================
-- TOPIC DIVERSITY SYSTEM
-- ============================================================================

-- Topic keywords (for diversity tracking)
CREATE TABLE topic_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL,
  category TEXT NOT NULL,
  platform TEXT NOT NULL,
  last_used TIMESTAMPTZ NOT NULL,
  frequency INTEGER DEFAULT 1,
  
  UNIQUE(keyword, platform)
);

CREATE INDEX idx_topic_keywords_last_used ON topic_keywords(last_used DESC);
CREATE INDEX idx_topic_keywords_platform ON topic_keywords(platform);

-- Excluded topics (manual override)
CREATE TABLE excluded_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  reason TEXT,
  excluded_by TEXT,
  excluded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Phrase patterns (avoid overuse)
CREATE TABLE phrase_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phrase TEXT NOT NULL,
  last_used TIMESTAMPTZ NOT NULL,
  usage_count INTEGER DEFAULT 0,
  cycle_start TIMESTAMPTZ NOT NULL,  -- Reset every 2 weeks
  
  UNIQUE(phrase, cycle_start)
);

CREATE INDEX idx_phrase_patterns_cycle ON phrase_patterns(cycle_start DESC);

-- ============================================================================
-- USER SETTINGS
-- ============================================================================

CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT UNIQUE NOT NULL,
  
  -- Generation preferences
  weekly_generation_day TEXT DEFAULT 'Sunday',
  weekly_generation_time TEXT DEFAULT '23:00',
  auto_approve_enabled BOOLEAN DEFAULT false,
  
  -- Notification preferences
  notify_on_generation BOOLEAN DEFAULT true,
  notify_on_publish_reminder BOOLEAN DEFAULT true,
  notification_email TEXT,
  
  -- Content preferences
  default_tone TEXT DEFAULT 'conversational',
  forbidden_phrases TEXT[],
  required_disclaimers TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- GENERATION JOBS (Track background tasks)
-- ============================================================================

CREATE TABLE generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  
  -- Job config
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  platforms TEXT[],
  
  -- Progress tracking
  total_items INTEGER,
  completed_items INTEGER DEFAULT 0,
  failed_items INTEGER DEFAULT 0,
  
  -- Results
  generated_content_ids UUID[],
  error_messages JSONB,
  
  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_generation_jobs_status ON generation_jobs(status);
CREATE INDEX idx_generation_jobs_created ON generation_jobs(created_at DESC);
supabase/migrations/20260127000002_vector_extension.sql
sql-- ============================================================================
-- VECTOR EXTENSION FOR ANTI-REPETITION
-- ============================================================================

-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to content table
ALTER TABLE content ADD COLUMN embedding vector(1536);

-- Create index for similarity search (HNSW is faster than IVFFlat)
CREATE INDEX ON content USING hnsw (embedding vector_cosine_ops);

-- Vector similarity search function
CREATE OR REPLACE FUNCTION match_content(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.75,
  match_count int DEFAULT 5,
  months_back int DEFAULT 6,
  excluded_platforms text[] DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  topic text,
  platform text,
  content_type text,
  generated_text text,
  publish_date timestamptz,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.topic,
    c.platform,
    c.content_type,
    c.generated_text,
    c.publish_date,
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM content c
  WHERE 
    c.embedding IS NOT NULL
    AND c.created_at > NOW() - (months_back || ' months')::interval
    AND (excluded_platforms IS NULL OR c.platform = ANY(excluded_platforms))
    AND (1 - (c.embedding <=> query_embedding)) > match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to check if a topic is too similar to recent content
CREATE OR REPLACE FUNCTION is_topic_repetitive(
  topic_text text,
  content_preview text,
  similarity_threshold float DEFAULT 0.75
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  test_embedding vector(1536);
  max_similarity float;
BEGIN
  -- Generate embedding (this would be called from application code)
  -- For now, return false (implement in application layer)
  RETURN false;
END;
$$;
supabase/migrations/20260127000003_rls_policies.sql
sql-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE excluded_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE phrase_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_jobs ENABLE ROW LEVEL SECURITY;

-- Content policies
CREATE POLICY "Users can view own content"
  ON content FOR SELECT
  USING (owner = auth.jwt() ->> 'email' OR owner IS NULL);

CREATE POLICY "Users can insert own content"
  ON content FOR INSERT
  WITH CHECK (owner = auth.jwt() ->> 'email' OR owner IS NULL);

CREATE POLICY "Users can update own content"
  ON content FOR UPDATE
  USING (owner = auth.jwt() ->> 'email' OR owner IS NULL);

CREATE POLICY "Users can delete own content"
  ON content FOR DELETE
  USING (owner = auth.jwt() ->> 'email' OR owner IS NULL);

-- Research URLs policies (similar pattern for all tables)
CREATE POLICY "Users can manage own research URLs"
  ON research_urls FOR ALL
  USING (owner = auth.jwt() ->> 'email' OR owner IS NULL)
  WITH CHECK (owner = auth.jwt() ->> 'email' OR owner IS NULL);

CREATE POLICY "Users can view research content"
  ON research_content FOR SELECT
  USING (true);

-- User settings policies
CREATE POLICY "Users can manage own settings"
  ON user_settings FOR ALL
  USING (user_email = auth.jwt() ->> 'email')
  WITH CHECK (user_email = auth.jwt() ->> 'email');

-- Generation jobs policies
CREATE POLICY "Users can view own jobs"
  ON generation_jobs FOR SELECT
  USING (true);

-- Service role bypass (for backend operations)
CREATE POLICY "Service role has full access"
  ON content FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

API Design
REST Endpoints
app/api/generate-week/route.ts
typescript/**
 * POST /api/generate-week
 * 
 * Generates 1 week of content (7 days) with research context
 * 
 * Request Body:
 * {
 *   startDate: "2026-02-03",  // Monday
 *   platforms: ["IGFB", "LinkedIn", "Blog", "YouTube", "X"],
 *   researchFirst: true,  // Scrape URLs before generation
 *   autoApprove: false    // If true, skip draft status
 * }
 * 
 * Response:
 * {
 *   jobId: "uuid",
 *   status: "running",
 *   estimatedDuration: 180,  // seconds
 *   contentItems: [
 *     {
 *       id: "uuid",
 *       platform: "LinkedIn",
 *       topic: "Utah Market Update: January 2026",
 *       publishDate: "2026-02-03T09:00:00Z",
 *       status: "draft"
 *     }
 *   ]
 * }
 */
app/api/content/route.ts
typescript/**
 * GET /api/content
 * 
 * Query Parameters:
 * - status: draft | approved | published | archived
 * - platform: IGFB | LinkedIn | Blog | YouTube | X
 * - startDate: ISO date
 * - endDate: ISO date
 * - limit: number (default 50)
 * - offset: number (default 0)
 * 
 * Response:
 * {
 *   items: ContentItem[],
 *   total: number,
 *   page: number
 * }
 */
app/api/approve-content/route.ts
typescript/**
 * POST /api/approve-content
 * 
 * Request Body:
 * {
 *   contentId: "uuid",
 *   syncToCalendar: true,
 *   customText?: string  // If user edited content
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   calendarEventId: "google-calendar-event-id",
 *   calendarUrl: "https://calendar.google.com/..."
 * }
 */
app/api/research-urls/route.ts
typescript/**
 * GET /api/research-urls
 * Response: ResearchUrl[]
 * 
 * POST /api/research-urls
 * Request: { url: string, category: string, scrapeFrequency: string }
 * Response: ResearchUrl
 * 
 * PATCH /api/research-urls/:id
 * Request: Partial<ResearchUrl>
 * Response: ResearchUrl
 * 
 * DELETE /api/research-urls/:id
 * Response: { success: true }
 * 
 * POST /api/research-urls/scrape-now
 * Request: { urlIds: string[] }
 * Response: { jobId: string, status: "running" }
 */
```

---

## Research System

### Architecture

The research system scrapes user-configured URLs, summarizes content with Claude, and injects context into generation prompts.

### Flow Diagram
```
┌─────────────────────────────────────────────────────────────┐
│ 1. User adds research URLs via /research page               │
│    - Utah Association of Realtors news                      │
│    - Local news sites (KSL, Deseret News)                   │
│    - Market data sites (Zillow, Redfin)                     │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Cron job (or manual trigger) scrapes URLs                │
│    - Use Jina AI Reader: r.jina.ai/{url}                    │
│    - Returns clean markdown                                 │
│    - Store in research_content table                        │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Claude summarizes research content                       │
│    - Prompt: "Extract key insights for real estate content" │
│    - Store summary in research_content.summary              │
│    - Extract key_points as JSON                             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. When generating content, inject research context         │
│    - Query: "Get research from last 7 days, category=Market"│
│    - Build context block:                                   │
│      "Recent Utah market insights:                          │
│       - [Insight 1 from URL A]                              │
│       - [Insight 2 from URL B]"                             │
│    - Prepend to generation prompt                           │
└─────────────────────────────────────────────────────────────┘
Implementation
lib/research/scraper.ts
typescriptimport { createClient } from '@supabase/supabase-js';

const JINA_READER_URL = 'https://r.jina.ai';

export async function scrapeUrl(url: string): Promise<{
  content: string;
  title: string;
  wordCount: number;
}> {
  // Use Jina AI Reader for clean markdown extraction
  const response = await fetch(`${JINA_READER_URL}/${encodeURIComponent(url)}`, {
    headers: {
      'Authorization': `Bearer ${process.env.JINA_API_KEY}`,
      'X-Return-Format': 'markdown'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to scrape ${url}: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  return {
    content: data.data.content,
    title: data.data.title,
    wordCount: data.data.content.split(/\s+/).length
  };
}

export async function scrapeAndStore(urlId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  // Get URL config
  const { data: urlConfig } = await supabase
    .from('research_urls')
    .select('*')
    .eq('id', urlId)
    .single();
  
  if (!urlConfig) throw new Error('URL not found');
  
  // Scrape
  const scraped = await scrapeUrl(urlConfig.url);
  
  // Check if content changed (deduplication)
  const contentHash = hashContent(scraped.content);
  const { data: existing } = await supabase
    .from('research_content')
    .select('id')
    .eq('url_id', urlId)
    .eq('content_hash', contentHash)
    .single();
  
  if (existing) {
    console.log(`Content unchanged for ${urlConfig.url}`);
    return existing;
  }
  
  // Summarize with Claude
  const summary = await summarizeContent(scraped.content, urlConfig.category);
  
  // Store
  const { data: stored } = await supabase
    .from('research_content')
    .insert({
      url_id: urlId,
      raw_content: scraped.content,
      summary: summary.text,
      key_points: summary.keyPoints,
      content_hash: contentHash,
      word_count: scraped.wordCount
    })
    .select()
    .single();
  
  // Update URL last_scraped
  await supabase
    .from('research_urls')
    .update({
      last_scraped: new Date().toISOString(),
      scrape_count: urlConfig.scrape_count + 1
    })
    .eq('id', urlId);
  
  return stored;
}

function hashContent(content: string): string {
  // Simple hash for deduplication
  return Buffer.from(content).toString('base64').substring(0, 64);
}
lib/research/summarizer.ts
typescriptimport Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export async function summarizeContent(
  content: string,
  category: string
): Promise<{
  text: string;
  keyPoints: Array<{ point: string; relevance: string }>;
}> {
  
  const prompt = `You are summarizing research content for Utah real estate content creation.

Category: ${category}

Content to summarize:
${content.substring(0, 8000)}

Extract:
1. A concise summary (150-200 words) of key insights relevant to Utah real estate professionals
2. 3-5 bullet points of actionable insights

Format as JSON:
{
  "summary": "...",
  "keyPoints": [
    { "point": "...", "relevance": "Why this matters for content" }
  ]
}`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  });
  
  const response = message.content[0].text;
  const parsed = JSON.parse(response);
  
  return {
    text: parsed.summary,
    keyPoints: parsed.keyPoints
  };
}
lib/research/context-builder.ts
typescriptimport { createClient } from '@supabase/supabase-js';

export async function buildResearchContext(options: {
  categories?: string[];
  daysBack?: number;
  maxItems?: number;
}): Promise<string> {
  
  const { categories = [], daysBack = 7, maxItems = 10 } = options;
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const query = supabase
    .from('research_content')
    .select(`
      id,
      summary,
      key_points,
      scraped_at,
      research_urls!inner(category, title, url)
    `)
    .gte('scraped_at', new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString())
    .order('scraped_at', { ascending: false })
    .limit(maxItems);
  
  if (categories.length > 0) {
    query.in('research_urls.category', categories);
  }
  
  const { data: research } = await query;
  
  if (!research || research.length === 0) {
    return '';
  }
  
  // Build context string
  let context = '## Recent Research Context\n\n';
  context += 'The following insights were gathered from recent research. Use them to inform your content:\n\n';
  
  for (const item of research) {
    const url = item.research_urls as any;
    context += `### ${url.category}: ${url.title}\n`;
    context += `Source: ${url.url}\n`;
    context += `${item.summary}\n\n`;
    
    if (item.key_points && Array.isArray(item.key_points)) {
      context += 'Key Points:\n';
      for (const point of item.key_points) {
        context += `- ${point.point}\n`;
      }
      context += '\n';
    }
  }
  
  return context;
}

Frontend Specifications
Design System
Colors (Tailwind config)
typescript// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',  // Primary blue
          600: '#0284c7',
          700: '#0369a1'
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
      }
    }
  }
}
Page Specifications
1. Login Page (/login)
Purpose: Magic link authentication
Layout: Centered card, minimal
Components:

Email input
"Send Magic Link" button
Supabase Auth handles email delivery

Code Skeleton:
typescript// app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = createClientComponentClient();
  
  async function handleLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    });
    
    if (error) {
      alert(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }
  
  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Check your email</h2>
          <p className="mt-2 text-gray-600">
            We sent a magic link to {email}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-4 rounded-lg border p-8">
        <h1 className="text-3xl font-bold">Utah's Elite Realtors</h1>
        <p className="text-gray-600">Content Planning System</p>
        
        <Input
          type="email"
          placeholder="liz@utahseliterealtors.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <Button
          onClick={handleLogin}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Sending...' : 'Send Magic Link'}
        </Button>
      </div>
    </div>
  );
}
```

#### 2. Dashboard (`/dashboard`)
**Purpose**: Content review and approval  
**Layout**: Grid of content cards, filters on left  
**Components**:
- ContentCard (reusable)
- FilterSidebar (status, platform, date range)
- GenerateWeekButton (triggers generation)
- BatchApproveButton

**Wireframe**:
```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] Utah's Elite Realtors          [Settings] [Logout]   │
├─────────┬───────────────────────────────────────────────────┤
│         │ Dashboard                                         │
│ Filters │ ┌───────────────────┬───────────────────┐        │
│         │ │ 📱 IGFB           │ 💼 LinkedIn       │        │
│ Status  │ │ Coffee Shops      │ Market Update     │        │
│ □ Draft │ │ Feb 3, 9:00 AM    │ Feb 3, 10:00 AM   │        │
│ ☑ Appr. │ │ [Approve] [Edit]  │ [Approve] [Edit]  │        │
│         │ └───────────────────┴───────────────────┘        │
│ Platfor │ ┌───────────────────┬───────────────────┐        │
│ ☑ IGFB  │ │ 📝 Blog           │ 🎬 YouTube        │        │
│ ☑ Linke │ │ Buyer's Guide     │ Home Tour         │        │
│ ☑ Blog  │ │ Feb 4, 2:00 PM    │ Feb 5, 3:00 PM    │        │
│         │ │ [Approve] [Edit]  │ [Approve] [Edit]  │        │
│         │ └───────────────────┴───────────────────┘        │
│         │                                                   │
│ [Generate│                                                  │
│  Week]   │                                                  │
└─────────┴───────────────────────────────────────────────────┘
Code Skeleton:
typescript// app/(dashboard)/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ContentCard } from '@/components/content-card';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    loadContent();
    
    // Real-time subscription
    const subscription = supabase
      .channel('content-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'content' },
        () => loadContent()
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  async function loadContent() {
    const { data } = await supabase
      .from('content')
      .select('*')
      .eq('status', 'draft')
      .order('publish_date', { ascending: true });
    
    setContent(data || []);
    setLoading(false);
  }
  
  async function generateWeek() {
    setLoading(true);
    const response = await fetch('/api/generate-week', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate: getNextMonday(),
        platforms: ['IGFB', 'LinkedIn', 'Blog', 'YouTube', 'X'],
        researchFirst: true
      })
    });
    
    const result = await response.json();
    alert(`Generation started! Job ID: ${result.jobId}`);
  }
  
  return (
    <div className="container mx-auto p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Content Calendar</h1>
        <Button onClick={generateWeek} disabled={loading}>
          Generate Week
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {content.map((item) => (
          <ContentCard key={item.id} item={item} onUpdate={loadContent} />
        ))}
      </div>
    </div>
  );
}

function getNextMonday(): string {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilMonday);
  return nextMonday.toISOString().split('T')[0];
}
```

#### 3. Research Config Page (`/research`)
**Purpose**: Manage research URLs  
**Layout**: Table with add/edit/delete actions  
**Components**:
- ResearchUrlTable
- AddUrlModal
- ScrapeTrigger button

**Wireframe**:
```
┌─────────────────────────────────────────────────────────────┐
│ Research Sources                              [+ Add URL]    │
├─────────────────────────────────────────────────────────────┤
│ URL                          Category    Frequency  Actions  │
│ ───────────────────────────────────────────────────────────│
│ utahrealtors.com/news        Industry    Weekly     [Edit]  │
│ ksl.com/real-estate          Local       Daily      [Delete]│
│ zillow.com/research/data     Market      Weekly     [Edit]  │
│                                                               │
│ [Scrape All Now]                                             │
└─────────────────────────────────────────────────────────────┘
4. Calendar View (/calendar)
Purpose: Visual week/month view of scheduled content
Layout: Calendar grid
Components:

FullCalendar integration (or custom calendar component)
Click event to view content details

5. Settings Page (/settings)
Purpose: User preferences, API keys, notification settings
Layout: Form sections
Components:

GenerationSchedule settings
NotificationPreferences
ForbiddenPhrases manager
API key display (masked)


Backend Specifications
Content Generation Pipeline
lib/ai/router.ts
typescriptimport { generateClaudeContent } from './claude';
import { generateGPTContent } from './openai';
import { generateGrokContent } from './grok';

export type Platform = 'IGFB' | 'LinkedIn' | 'Blog' | 'YouTube' | 'X';

export async function generateContent(
  platform: Platform,
  topic: string,
  contentType: string,
  researchContext: string
): Promise<string> {
  
  switch (platform) {
    case 'LinkedIn':
    case 'Blog':
      return await generateClaudeContent({ platform, topic, contentType, researchContext });
    
    case 'YouTube':
    case 'IGFB':
      return await generateGPTContent({ platform, topic, contentType, researchContext });
    
    case 'X':
      return await generateGrokContent({ topic, contentType, researchContext });
    
    default:
      throw new Error(`Unknown platform: ${platform}`);
  }
}
lib/ai/claude.ts
typescriptimport Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const FORBIDDEN_PHRASES = [
  'cutting-edge', 'revolutionary', 'groundbreaking', 'game changer',
  'paradigm shift', 'unprecedented', 'transformative', 'visionary'
];

export async function generateClaudeContent(params: {
  platform: 'LinkedIn' | 'Blog';
  topic: string;
  contentType: string;
  researchContext: string;
}): Promise<string> {
  
  const { platform, topic, contentType, researchContext } = params;
  
  const systemPrompt = `You are Liz Sears writing for Utah's Elite Realtors.

Voice characteristics:
- Natural, conversational tone (like talking to a friend over coffee)
- Mix paragraph lengths (one-liners, medium, longer paragraphs)
- Use contractions and run-on thoughts when natural
- Include emotional beats (excitement, relief, hope, gratitude)
- Break grammar rules when it feels right
- Use exclamation points when genuinely excited (aim for 2-3 per piece)

Hard rules:
- NEVER use em dash (—)
- NEVER use these phrases: ${FORBIDDEN_PHRASES.join(', ')}
- NO markdown headings (#, ##, ###) or formatting (* _)
- NO bullet lists or numbered lists

${platform === 'Blog' ? 'Write 1000-1500 words with clear sections in prose.' : 'Write 200-300 words. Hook → Insight → CTA.'}`;

  const userPrompt = `${researchContext ? `${researchContext}\n\n---\n\n` : ''}Topic: ${topic}
Type: ${contentType}

Write ${platform} content using the research context above to inform your perspective.`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    temperature: 0.85,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userPrompt }
    ]
  });
  
  let content = message.content[0].text;
  
  // Safety: Remove any rogue em dashes
  content = content.replace(/—/g, ',');
  
  return content;
}
Vector Similarity Check
lib/vectors/similarity.ts
typescriptimport { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.substring(0, 8000)
  });
  
  return response.data[0].embedding;
}

export async function checkSimilarity(
  topic: string,
  content: string
): Promise<{
  isSimilar: boolean;
  similarItems: Array<{ id: string; topic: string; similarity: number }>;
}> {
  
  // Generate embedding for new content
  const embedding = await generateEmbedding(`${topic} ${content.substring(0, 500)}`);
  
  // Query similar content
  const { data: similar } = await supabase.rpc('match_content', {
    query_embedding: embedding,
    match_threshold: 0.70,  // 70% similarity threshold
    match_count: 3,
    months_back: 6
  });
  
  const isSimilar = similar && similar.length > 0 && similar[0].similarity > 0.75;
  
  return {
    isSimilar,
    similarItems: similar || []
  };
}

Development Phases
Phase 1: Frontend Foundation (Week 1)
Goal: Build all UI components and pages without backend integration
Tasks:

✅ Initialize Next.js + Supabase in GitHub Codespaces
✅ Setup Tailwind + shadcn/ui
✅ Build Login page (UI only, no auth yet)
✅ Build Dashboard layout with mock data
✅ Build ContentCard component
✅ Build Research Config page (table + forms)
✅ Build Settings page (forms)
✅ Build Calendar View (FullCalendar or custom)

Deliverable: Fully functional UI with mock data, no API calls
Testing: Run npm run dev, navigate all pages, verify responsive design

Phase 2: Database & Auth (Week 1-2)
Goal: Connect frontend to Supabase, implement authentication
Tasks:

✅ Run Supabase migrations (schema, vector extension, RLS)
✅ Implement Supabase Auth (magic link)
✅ Setup RLS policies
✅ Connect Dashboard to real content table (read-only)
✅ Connect Research page to research_urls table (CRUD)
✅ Implement real-time subscriptions for content updates

Deliverable: Authenticated app with live database reads/writes
Testing: Create test data in Supabase Studio, verify UI updates in real-time

Phase 3: Research Pipeline (Week 2)
Goal: Implement URL scraping, summarization, context building
Tasks:

✅ Implement Jina AI scraper
✅ Implement Claude summarizer
✅ Build research cron job (or manual trigger)
✅ Build context builder (query research, format for prompts)
✅ Add "Scrape Now" button to Research page

Deliverable: Working research system that scrapes URLs and stores summaries
Testing: Add 3 test URLs, trigger scrape, verify summaries in database

Phase 4: Content Generation (Week 3)
Goal: Implement AI content generation with vector anti-repetition
Tasks:

✅ Implement Claude API integration
✅ Implement OpenAI API integration (GPT + embeddings)
✅ Implement Grok API integration
✅ Build API route: POST /api/generate-week
✅ Implement vector similarity check
✅ Implement regeneration logic if content is too similar
✅ Add generation progress tracking (generation_jobs table)

Deliverable: "Generate Week" button creates 7 days of unique content
Testing: Generate 3 weeks consecutively, verify no repetitive topics

Phase 5: Calendar Sync (Week 3-4)
Goal: Auto-publish approved content to Google Calendar
Tasks:

✅ Setup Google Calendar OAuth
✅ Implement Google Calendar API client
✅ Build API route: POST /api/approve-content
✅ Create calendar events with formatted descriptions
✅ Store calendar_event_id in content table
✅ Handle calendar event updates/deletions

Deliverable: Approved content automatically appears on Google Calendar
Testing: Approve 3 posts, verify they appear on calendar with correct times

Phase 6: Polish & Deployment (Week 4)
Goal: Production-ready deployment
Tasks:

✅ Add loading states and error handling
✅ Add toast notifications
✅ Implement batch approve
✅ Add content editing (inline or modal)
✅ Setup Vercel deployment
✅ Configure production environment variables
✅ Test end-to-end flow in production

Deliverable: Live production app
Testing: Full user flow: Login → Configure research → Generate week → Approve → Verify calendar

Success Metrics
Technical Metrics

Content generation time: < 3 minutes for 7 days
Vector similarity accuracy: < 5% false positives (content flagged as similar when it's not)
Uptime: 99.5%
Page load time: < 2 seconds

Product Metrics

Content approval rate: > 85% (client approves without edits)
Time savings: 10+ hours/week vs. manual content creation
Repetition rate: < 2% topics repeat within 6 months
Research utilization: 80% of generated content references research context

User Feedback

Client rates UI usability: 8/10 or higher
Client reports content quality improved vs. current system
Zero calendar sync errors after 1 month