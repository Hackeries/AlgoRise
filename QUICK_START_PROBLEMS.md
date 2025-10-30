# 🚀 Quick Start: Problem Sourcing System

## 5-Minute Setup

### Step 1: Run Database Migrations (2 minutes)

Open your Supabase SQL Editor and run these scripts in order:

```sql
-- 1. Create tables (copy/paste from file)
-- Run: scripts/032_create_problems_table.sql

-- 2. Add sample data (copy/paste from file)
-- Run: scripts/033_seed_sample_problems.sql
```

Or via command line:
```bash
psql $DATABASE_URL -f scripts/032_create_problems_table.sql
psql $DATABASE_URL -f scripts/033_seed_sample_problems.sql
```

### Step 2: Test the API (1 minute)

```bash
# Test matchmaking endpoint
curl "http://localhost:3000/api/problems/matchmaking?rating=1200&count=2"

# You should get 2 problems matching rating 1200±200
```

### Step 3: Use in Your Code (2 minutes)

```tsx
import { ProblemDisplay } from '@/components/problems/problem-display';
import { fetchMatchmakingProblems } from '@/lib/problems/problem-fetcher';

// Fetch problems
const problems = await fetchMatchmakingProblems(userId, {
  targetRating: 1200,
  count: 2
});

// Display problem
<ProblemDisplay problem={problems[0]} showHints={true} />
```

## That's It! 🎉

You now have:
- ✅ A complete problem database
- ✅ Smart problem fetching (no repeats, topic diversity)
- ✅ Beautiful problem display component
- ✅ Progressive 4-level hint system
- ✅ Full TypeScript support

## Next Steps

1. **Integrate into Battle Arena**
   - See `/workspace/examples/battle-arena-problem-integration.tsx`
   - Copy the pattern for your battle room

2. **Add More Problems**
   - Import from Codeforces API
   - Add custom problems via INSERT INTO problems

3. **Customize**
   - Adjust rating ranges
   - Modify hint system
   - Add more test cases

## Common Tasks

### Get Problems for Battle
```typescript
const problems = await fetchMatchmakingProblems(userId, {
  targetRating: userRating,
  count: 2,
  daysThreshold: 7  // Don't repeat last 7 days
});
```

### Track User Attempt
```typescript
await fetch(`/api/problems/${problemId}`, {
  method: 'PATCH',
  body: JSON.stringify({
    action: 'attempt',
    timeSpentSeconds: 120
  })
});
```

### Track User Solve
```typescript
await fetch(`/api/problems/${problemId}`, {
  method: 'PATCH',
  body: JSON.stringify({
    action: 'solve',
    timeSpentSeconds: 300
  })
});
```

## Troubleshooting

**No problems found?**
- Run the seed script: `033_seed_sample_problems.sql`
- Or add custom problems via Supabase dashboard

**API errors?**
- Check database migrations ran successfully
- Verify RLS policies are enabled
- Check user is authenticated

**Hints not showing?**
- Ensure `showHints={true}` in component
- Check problem has hints in database
- Verify `problem_hints` table has data

## Full Documentation

- **Implementation Guide**: `PROBLEM_SOURCING_IMPLEMENTATION.md`
- **Usage Guide**: `PROBLEM_SOURCING_USAGE.md`
- **Complete Example**: `examples/battle-arena-problem-integration.tsx`
- **Summary**: `PART3_IMPLEMENTATION_SUMMARY.md`

---

**Need Help?** All code is production-ready with full error handling, TypeScript types, and comprehensive comments.
