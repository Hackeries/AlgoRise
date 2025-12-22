# Battle Arena Migration Guide

## Prerequisites

- Supabase project with PostgreSQL database
- Existing `profiles` table with subscription fields
- Existing `has_active_pro_subscription()` function (from migration 002)

## Migration Files

### 003_battle_arena.sql

This migration creates the complete Battle Arena infrastructure.

## Running the Migration

### Using Supabase Dashboard

1. Navigate to your Supabase project dashboard
2. Go to SQL Editor
3. Copy the contents of `003_battle_arena.sql`
4. Execute the migration
5. Verify tables and functions are created

### Using Supabase CLI

```bash
# Apply the migration
supabase db push

# Or execute directly
psql $DATABASE_URL -f supabase/migrations/003_battle_arena.sql
```

## Post-Migration Verification

Run these queries to verify the migration:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'arena_%';

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'arena_%';

-- Check functions
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'get_tier_from_elo', 
  'can_play_ranked_match', 
  'check_daily_match_limit'
);

-- Check indexes
SELECT indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename LIKE 'arena_%';
```

## Expected Tables

After migration, you should have these tables:

1. `arena_ratings` - Player ELO ratings and stats
2. `arena_matches` - Match records
3. `arena_players` - Player state within matches
4. `arena_events` - Event log for real-time updates
5. `arena_teams` - Team composition for 3v3
6. `arena_match_history` - Archived match results
7. `arena_daily_limits` - Free user match limits

## Initial Data

The migration automatically:
- Creates arena ratings for all existing users (default ELO: 1200)
- Sets up appropriate indexes for performance
- Enables RLS on all tables
- Creates helper functions

## Rollback

If you need to rollback the migration:

```sql
-- WARNING: This will delete all Arena data

DROP TABLE IF EXISTS arena_match_history CASCADE;
DROP TABLE IF EXISTS arena_events CASCADE;
DROP TABLE IF EXISTS arena_players CASCADE;
DROP TABLE IF EXISTS arena_daily_limits CASCADE;
DROP TABLE IF EXISTS arena_matches CASCADE;
DROP TABLE IF EXISTS arena_teams CASCADE;
DROP TABLE IF EXISTS arena_ratings CASCADE;

DROP FUNCTION IF EXISTS get_tier_from_elo(INTEGER);
DROP FUNCTION IF EXISTS update_player_tier();
DROP FUNCTION IF EXISTS update_match_timestamp();
DROP FUNCTION IF EXISTS can_play_ranked_match(UUID);
DROP FUNCTION IF EXISTS check_daily_match_limit(UUID);
```

## Troubleshooting

### Issue: Migration fails with "function does not exist"

**Solution**: Ensure migration 002 has been run first, as it creates the `has_active_pro_subscription()` function.

### Issue: RLS prevents data access

**Solution**: Check that your application uses service role key for server-side operations, and anon key for client-side operations.

### Issue: Indexes not created

**Solution**: Check for naming conflicts. Drop existing indexes if needed before re-running migration.

## Performance Notes

- All foreign key relationships are indexed
- ELO columns are indexed for fast matchmaking
- Match state is indexed for efficient querying
- Event logs use composite index on (match_id, created_at)

## Security Notes

- All tables use RLS to protect data
- Public can view leaderboard (ratings table)
- Users can only modify their own player records
- System operations require elevated privileges
- Suspicious events are logged but not publicly visible
