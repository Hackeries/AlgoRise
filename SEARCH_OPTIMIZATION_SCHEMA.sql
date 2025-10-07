-- Search Optimization Schema for AlgoRise (rewritten to match your schema)
-- Assumptions used:
--  - public.contests has column: id, name, status, created_at
--  - public.groups has column: id, name, created_at
--  - public.adaptive_items has columns: problem_id, problem_name, problem_tags, created_at
--  - public.cf_handles has column: handle, id (or some id); we'll use handle as entity_id if no id
--  - problem_tags is text (not array)
-- The script is defensive: it checks table existence before creating indexes/triggers.

-- 1) Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Helper function: check if a table exists in public schema
CREATE OR REPLACE FUNCTION public._table_exists(tbl text) RETURNS boolean LANGUAGE sql AS $$
    SELECT EXISTS (
        SELECT 1 FROM pg_catalog.pg_class c
        JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = tbl AND c.relkind IN ('r','v','m')
    );
$$;

---------------------------
-- 2) Create per-table indexes (only if table/column exist)
---------------------------

-- contests: create tsvector and trigram indexes on name (no description)
DO $$
BEGIN
  IF public._table_exists('contests') THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='contests' AND column_name='name'
    ) THEN
      EXECUTE 'CREATE INDEX IF NOT EXISTS idx_contests_search_name ON public.contests USING gin (to_tsvector(''english'', name));';
      EXECUTE 'CREATE INDEX IF NOT EXISTS idx_contests_name_trgm ON public.contests USING gin (name gin_trgm_ops);';
    END IF;
  END IF;
END
$$;

-- groups: only index on name
DO $$
BEGIN
  IF public._table_exists('groups') THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='groups' AND column_name='name'
    ) THEN
      EXECUTE 'CREATE INDEX IF NOT EXISTS idx_groups_search_name ON public.groups USING gin (to_tsvector(''english'', name));';
      EXECUTE 'CREATE INDEX IF NOT EXISTS idx_groups_name_trgm ON public.groups USING gin (name gin_trgm_ops);';
    END IF;
  END IF;
END
$$;

-- adaptive_items: problem_name + problem_tags (both text)
DO $$
BEGIN
  IF public._table_exists('adaptive_items') THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='adaptive_items' AND column_name='problem_name'
    ) THEN
      EXECUTE 'CREATE INDEX IF NOT EXISTS idx_adaptive_items_search_name ON public.adaptive_items USING gin (to_tsvector(''english'', problem_name));';
      EXECUTE 'CREATE INDEX IF NOT EXISTS idx_adaptive_items_name_trgm ON public.adaptive_items USING gin (problem_name gin_trgm_ops);';
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='adaptive_items' AND column_name='problem_tags'
    ) THEN
      EXECUTE 'CREATE INDEX IF NOT EXISTS idx_adaptive_items_search_tags ON public.adaptive_items USING gin (to_tsvector(''english'', problem_tags));';
      EXECUTE 'CREATE INDEX IF NOT EXISTS idx_adaptive_items_tags_trgm ON public.adaptive_items USING gin (problem_tags gin_trgm_ops);';
    END IF;
  END IF;
END
$$;

-- cf_handles: trigram on handle (kept as type 'handle')
DO $$
BEGIN
  IF public._table_exists('cf_handles') THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='cf_handles' AND column_name='handle'
    ) THEN
      EXECUTE 'CREATE INDEX IF NOT EXISTS idx_cf_handles_handle_trgm ON public.cf_handles USING gin (handle gin_trgm_ops);';
    END IF;
  END IF;
END
$$;

---------------------------
-- 3) Create materialized view dynamically (only includes sources that exist)
---------------------------
-- We build the SELECT used to create the materialized view, including only the
-- pieces for tables that actually exist. The materialized view has columns:
--   type, entity_id, title, content, created_at, search_vector

CREATE OR REPLACE FUNCTION public.create_search_index_matview() RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  parts text[] := ARRAY[]::text[];
  sql text;
BEGIN
  -- contests
  IF public._table_exists('contests') AND EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='contests' AND column_name='name'
  ) THEN
    parts := array_append(parts, $q$
      SELECT
        'contest' as type,
        id::text as entity_id,
        name as title,
        '' as content,
        created_at,
        to_tsvector('english', name) as search_vector
      FROM public.contests
      WHERE (COALESCE(status,'') <> 'cancelled')
    $q$);
  END IF;

  -- groups
  IF public._table_exists('groups') AND EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='groups' AND column_name='name'
  ) THEN
    parts := array_append(parts, $q$
      SELECT
        'group' as type,
        id::text as entity_id,
        name as title,
        '' as content,
        created_at,
        to_tsvector('english', name) as search_vector
      FROM public.groups
    $q$);
  END IF;

  -- adaptive_items (problems)
  IF public._table_exists('adaptive_items') AND EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='adaptive_items' AND column_name='problem_name'
  ) THEN
    parts := array_append(parts, $q$
      SELECT
        'problem' as type,
        problem_id::text as entity_id,
        problem_name as title,
        COALESCE(problem_tags, '') as content,
        created_at,
        to_tsvector('english', problem_name || ' ' || COALESCE(problem_tags, '')) as search_vector
      FROM public.adaptive_items
      WHERE problem_name IS NOT NULL
    $q$);
  END IF;

  -- cf_handles
  IF public._table_exists('cf_handles') AND EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='cf_handles' AND column_name='handle'
  ) THEN
    -- if cf_handles has an id column, prefer that as entity_id; else use handle text
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='cf_handles' AND column_name='id'
    ) THEN
      parts := array_append(parts, $q$
        SELECT
          'handle' as type,
          id::text as entity_id,
          handle as title,
          '' as content,
          created_at,
          to_tsvector('english', handle) as search_vector
        FROM public.cf_handles
        WHERE handle IS NOT NULL
      $q$);
    ELSE
      parts := array_append(parts, $q$
        SELECT
          'handle' as type,
          handle::text as entity_id,
          handle as title,
          '' as content,
          null::timestamptz as created_at,
          to_tsvector('english', handle) as search_vector
        FROM public.cf_handles
        WHERE handle IS NOT NULL
      $q$);
    END IF;
  END IF;

  IF array_length(parts,1) IS NULL THEN
    RAISE NOTICE 'No source tables found for search_index; creating an empty materialized view.';
    sql := 'CREATE MATERIALIZED VIEW IF NOT EXISTS public.search_index AS SELECT ''none''::text as type, ''0''::text as entity_id, ''''::text as title, ''''::text as content, now()::timestamptz as created_at, to_tsvector(''english'', '''') as search_vector LIMIT 0';
  ELSE
    sql := array_to_string(parts, chr(10) || 'UNION ALL' || chr(10));
    sql := 'CREATE MATERIALIZED VIEW IF NOT EXISTS public.search_index AS ' || sql;
  END IF;

  EXECUTE sql;

  -- ensure we have a uniqueness constraint on (type, entity_id) to allow REFRESH MATERIALIZED VIEW CONCURRENTLY
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND tablename='search_index' AND indexname='idx_search_index_unique_type_entity'
  ) THEN
    EXECUTE 'CREATE UNIQUE INDEX idx_search_index_unique_type_entity ON public.search_index (type, entity_id);';
  END IF;

  -- create additional indexes if not present
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND tablename='search_index' AND indexname='idx_search_index_vector'
  ) THEN
    EXECUTE 'CREATE INDEX idx_search_index_vector ON public.search_index USING gin(search_vector);';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND tablename='search_index' AND indexname='idx_search_index_title_trgm'
  ) THEN
    EXECUTE 'CREATE INDEX idx_search_index_title_trgm ON public.search_index USING gin(title gin_trgm_ops);';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND tablename='search_index' AND indexname='idx_search_index_type'
  ) THEN
    EXECUTE 'CREATE INDEX idx_search_index_type ON public.search_index(type);';
  END IF;
END;
$$;

-- create or replace the materialized view (calls the above function)
SELECT public.create_search_index_matview();

---------------------------
-- 4) Refresh function for the materialized view
---------------------------
CREATE OR REPLACE FUNCTION public.refresh_search_index() RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- REFRESH CONCURRENTLY requires a unique index on the matview; ensured in creation function
  PERFORM 1;
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname='search_index') THEN
    EXECUTE 'REFRESH MATERIALIZED VIEW CONCURRENTLY public.search_index';
  END IF;
END;
$$;

---------------------------
-- 5) Advanced search function
---------------------------
CREATE OR REPLACE FUNCTION public.advanced_search(
    search_query text,
    search_types text[] DEFAULT ARRAY['contest','group','problem','handle'],
    result_limit integer DEFAULT 20,
    similarity_threshold real DEFAULT 0.25
)
RETURNS TABLE (
    type text,
    entity_id text,
    title text,
    content text,
    created_at timestamptz,
    relevance_score real
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    ts_query tsquery;
BEGIN
    -- if matview doesn't exist, return empty
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname='search_index') THEN
      RETURN;
    END IF;

    ts_query := plainto_tsquery('english', search_query);

    RETURN QUERY
    SELECT
      s.type,
      s.entity_id,
      s.title,
      s.content,
      s.created_at,
      GREATEST(
        COALESCE(ts_rank(s.search_vector, ts_query), 0) * 0.65,
        COALESCE(similarity(s.title, search_query), 0) * 0.35
      )::real AS relevance_score
    FROM public.search_index s
    WHERE s.type = ANY(search_types)
      AND (
        (s.search_vector @@ ts_query)
        OR (similarity(s.title, search_query) > similarity_threshold)
      )
    ORDER BY relevance_score DESC NULLS LAST, s.created_at DESC NULLS LAST
    LIMIT result_limit;
END;
$$;

---------------------------
-- 6) Search suggestions / autocomplete
---------------------------
CREATE OR REPLACE FUNCTION public.search_suggestions(
    search_query text,
    suggestion_limit integer DEFAULT 6
)
RETURNS TABLE (
    suggestion text,
    type text,
    frequency integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname='search_index') THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH matches AS (
    SELECT s.title AS suggestion, s.type, similarity(s.title, search_query) AS sim_score
    FROM public.search_index s
    WHERE similarity(s.title, search_query) > 0.2
  ),
  agg AS (
    SELECT suggestion, type, COUNT(*)::int AS frequency, MAX(sim_score) AS max_score
    FROM matches
    GROUP BY suggestion, type
  )
  SELECT suggestion, type, frequency
  FROM agg
  ORDER BY max_score DESC, frequency DESC
  LIMIT suggestion_limit;
END;
$$;

---------------------------
-- 7) Trigger function to refresh matview (lightweight wrapper)
---------------------------
CREATE OR REPLACE FUNCTION public.update_search_index_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- In production you'd queue refreshes; here we do an immediate concurrent refresh
  PERFORM public.refresh_search_index();
  RETURN NULL;
END;
$$;

---------------------------
-- 8) Attach triggers to source tables if they exist
---------------------------

-- contests
DO $$
BEGIN
  IF public._table_exists('contests') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger t JOIN pg_class c ON t.tgrelid=c.oid
      WHERE c.relname='contests' AND t.tgname='trg_contests_search_update'
    ) THEN
      EXECUTE 'CREATE TRIGGER trg_contests_search_update AFTER INSERT OR UPDATE OR DELETE ON public.contests FOR EACH STATEMENT EXECUTE FUNCTION public.update_search_index_trigger();';
    END IF;
  END IF;
END;
$$;

-- groups
DO $$
BEGIN
  IF public._table_exists('groups') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger t JOIN pg_class c ON t.tgrelid=c.oid
      WHERE c.relname='groups' AND t.tgname='trg_groups_search_update'
    ) THEN
      EXECUTE 'CREATE TRIGGER trg_groups_search_update AFTER INSERT OR UPDATE OR DELETE ON public.groups FOR EACH STATEMENT EXECUTE FUNCTION public.update_search_index_trigger();';
    END IF;
  END IF;
END;
$$;

-- adaptive_items
DO $$
BEGIN
  IF public._table_exists('adaptive_items') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger t JOIN pg_class c ON t.tgrelid=c.oid
      WHERE c.relname='adaptive_items' AND t.tgname='trg_adaptive_items_search_update'
    ) THEN
      EXECUTE 'CREATE TRIGGER trg_adaptive_items_search_update AFTER INSERT OR UPDATE OR DELETE ON public.adaptive_items FOR EACH STATEMENT EXECUTE FUNCTION public.update_search_index_trigger();';
    END IF;
  END IF;
END;
$$;

-- cf_handles
DO $$
BEGIN
  IF public._table_exists('cf_handles') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger t JOIN pg_class c ON t.tgrelid=c.oid
      WHERE c.relname='cf_handles' AND t.tgname='trg_cf_handles_search_update'
    ) THEN
      EXECUTE 'CREATE TRIGGER trg_cf_handles_search_update AFTER INSERT OR UPDATE OR DELETE ON public.cf_handles FOR EACH STATEMENT EXECUTE FUNCTION public.update_search_index_trigger();';
    END IF;
  END IF;
END;
$$;

---------------------------
-- 9) Grants (allow authenticated role to query the matview and call functions)
---------------------------
GRANT SELECT ON public.search_index TO authenticated;
GRANT EXECUTE ON FUNCTION public.advanced_search(TEXT, TEXT[], INTEGER, REAL) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_suggestions(TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_search_index() TO authenticated;

---------------------------
-- 10) Initial population (attempt to refresh matview)
---------------------------
-- If matview exists, do an initial concurrent refresh (will be no-op if nothing to refresh)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname='search_index') THEN
    PERFORM public.refresh_search_index();
  END IF;
END;
$$;

-- Done.
-- Usage:
-- SELECT * FROM public.advanced_search('algorithm contest', ARRAY['contest'], 10);
-- SELECT * FROM public.search_suggestions('algor', 5);
