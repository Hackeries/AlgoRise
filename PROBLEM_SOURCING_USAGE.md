# Problem Sourcing System - Quick Usage Guide

## 🚀 Quick Start

### 1. Run Database Migrations

In your Supabase SQL Editor:

```sql
-- Step 1: Create tables
\i scripts/032_create_problems_table.sql

-- Step 2: Seed sample problems (optional, for testing)
\i scripts/033_seed_sample_problems.sql
```

### 2. Import the Components

```tsx
import { ProblemDisplay } from '@/components/problems/problem-display';
import { fetchMatchmakingProblems } from '@/lib/problems/problem-fetcher';
import type { Problem } from '@/types/problems';
```

### 3. Fetch Problems for a Battle

```typescript
// In your battle creation logic
const userRating = 1200; // Get from battle_ratings table
const userId = 'user-uuid';

const problems = await fetchMatchmakingProblems(userId, {
  targetRating: userRating,
  ratingRange: 200,  // ±200 rating
  count: 2,          // 2 problems per battle
  daysThreshold: 7   // Don't repeat problems seen in last 7 days
});
```

### 4. Display a Problem

```tsx
function BattleProblemView({ problemId }: { problemId: string }) {
  const [problem, setProblem] = useState<Problem | null>(null);
  
  useEffect(() => {
    // Fetch full problem details
    fetch(`/api/problems/${problemId}`)
      .then(res => res.json())
      .then(data => setProblem(data.problem));
  }, [problemId]);
  
  if (!problem) return <div>Loading...</div>;
  
  return (
    <ProblemDisplay 
      problem={problem}
      showHints={true}  // Enable progressive hints
      compact={false}   // Full detailed view
    />
  );
}
```

## 📋 Common Use Cases

### Use Case 1: Battle Matchmaking

```typescript
// When user clicks "Find Battle"
async function createBattle(userId: string) {
  // 1. Get user's current rating
  const { data: ratingData } = await supabase
    .from('battle_ratings')
    .select('rating')
    .eq('user_id', userId)
    .single();
  
  const userRating = ratingData?.rating || 1200;
  
  // 2. Fetch suitable problems
  const problems = await fetchMatchmakingProblems(userId, {
    targetRating: userRating,
    count: 2
  });
  
  // 3. Create battle with these problems
  const { data: battle } = await supabase
    .from('battles')
    .insert({
      host_user_id: userId,
      status: 'waiting',
      // ... other fields
    })
    .select()
    .single();
  
  // 4. Create battle rounds with problems
  for (let i = 0; i < problems.length; i++) {
    await supabase.from('battle_rounds').insert({
      battle_id: battle.id,
      round_number: i + 1,
      problem_id: problems[i].external_id,
      title: problems[i].title,
      rating: problems[i].difficulty_rating,
    });
  }
  
  return battle;
}
```

### Use Case 2: Practice Mode

```typescript
// User selects difficulty level for practice
async function getPracticeProblems(userId: string, difficulty: number) {
  const response = await fetch(
    `/api/problems/matchmaking?rating=${difficulty}&count=5&range=100`
  );
  
  const { problems } = await response.json();
  return problems;
}
```

### Use Case 3: Track Problem Attempts

```typescript
// When user submits a solution
async function handleSubmission(
  userId: string,
  problemId: string,
  isCorrect: boolean,
  timeSpent: number,
  battleId?: string
) {
  // Update problem history
  await fetch(`/api/problems/${problemId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: isCorrect ? 'solve' : 'attempt',
      timeSpentSeconds: timeSpent,
      battleId,
    }),
  });
}
```

### Use Case 4: Show User's Problem History

```typescript
import { getUserProblemHistory } from '@/lib/problems/problem-fetcher';

async function ProblemHistoryPage({ userId }: { userId: string }) {
  const history = await getUserProblemHistory(userId, 50);
  
  return (
    <div>
      <h2>Your Problem History</h2>
      {history.map((item) => (
        <div key={item.id}>
          <h3>{item.problems.title}</h3>
          <p>Rating: {item.problems.difficulty_rating}</p>
          <p>Attempts: {item.attempt_count}</p>
          <p>Solved: {item.solved_at ? 'Yes' : 'No'}</p>
          <p>Time Spent: {Math.floor(item.time_spent_seconds / 60)}m</p>
        </div>
      ))}
    </div>
  );
}
```

## 🎯 API Endpoints Reference

### GET `/api/problems/matchmaking`

Fetch problems for matchmaking.

**Query Parameters:**
- `rating` (required): Target rating (800-3500)
- `range` (optional): Rating range tolerance (default: 200)
- `count` (optional): Number of problems (default: 2, max: 10)
- `days` (optional): Don't repeat problems seen in last N days (default: 7)

**Response:**
```json
{
  "problems": [
    {
      "id": "uuid",
      "platform": "codeforces",
      "external_id": "1234A",
      "title": "Two Arrays and Swaps",
      "difficulty_rating": 800,
      "topic": ["greedy", "sorting"],
      "time_limit": 1000,
      "memory_limit": 256,
      "test_cases": [...],
      ...
    }
  ],
  "message": "Found 2 suitable problems"
}
```

### POST `/api/problems/matchmaking`

Record a problem view.

**Body:**
```json
{
  "problemId": "uuid",
  "battleId": "uuid",  // optional
  "battleRoundId": "uuid"  // optional
}
```

### GET `/api/problems/[id]`

Get full problem details.

**Response:**
```json
{
  "problem": {
    "id": "uuid",
    "title": "Two Sum",
    "problem_statement": "<p>...</p>",
    "test_cases": [...],
    "hints": [
      {
        "level": 1,
        "hint_type": "restatement",
        "content": "<p>Simplified explanation...</p>"
      }
    ],
    "userHistory": {
      "view_count": 2,
      "attempt_count": 5,
      "solved_at": "2024-01-15T10:30:00Z"
    }
  }
}
```

### PATCH `/api/problems/[id]`

Update problem interaction.

**Body:**
```json
{
  "action": "solve",  // or "attempt"
  "timeSpentSeconds": 180,
  "battleId": "uuid",
  "battleRoundId": "uuid"
}
```

### GET `/api/problems/hints`

Get progressive hints.

**Query Parameters:**
- `problemId` (required)
- `level` (required): 1-4

**Response:**
```json
{
  "hints": [
    {
      "id": "uuid",
      "level": 1,
      "hint_type": "restatement",
      "content": "..."
    }
  ]
}
```

## 🎨 Component Props

### `<ProblemDisplay />`

```tsx
interface ProblemDisplayProps {
  problem: Problem;        // Problem data from API
  showHints?: boolean;     // Enable hint system (default: true)
  compact?: boolean;       // Compact layout (default: false)
}
```

**Features:**
- Automatic difficulty color coding
- Copy-to-clipboard for test cases
- Progressive hint system
- Responsive layout
- Dark mode support
- HTML/Markdown rendering

## 🔧 Utility Functions

### `fetchMatchmakingProblems(userId, options)`

Fetch problems with anti-repetition and diversity.

```typescript
const problems = await fetchMatchmakingProblems('user-uuid', {
  targetRating: 1200,
  ratingRange: 200,
  count: 2,
  daysThreshold: 7
});
```

### `fetchProblemById(problemId)`

Get full problem details including hints.

```typescript
const problem = await fetchProblemById('problem-uuid');
```

### `recordProblemView(userId, problemId, battleId?, roundId?)`

Track when a user views a problem.

```typescript
await recordProblemView(
  'user-uuid',
  'problem-uuid',
  'battle-uuid',
  'round-uuid'
);
```

### `hasSeenRecently(userId, problemId, days)`

Check if user has seen a problem recently.

```typescript
const seen = await hasSeenRecently('user-uuid', 'problem-uuid', 7);
if (seen) {
  // Skip this problem
}
```

### `ensureTopicDiversity(problems)`

Ensure problems cover different topics.

```typescript
const diverse = ensureTopicDiversity(problems);
// Returns problems with unique primary topics
```

## 📊 Type Definitions

Import types for TypeScript support:

```typescript
import type {
  Problem,
  ProblemHint,
  ProblemHistory,
  TestCase,
  ProblemPlatform,
  HintType,
  DifficultyInfo,
} from '@/types/problems';

// Get difficulty info from rating
import { getDifficultyInfo, DIFFICULTY_LEVELS } from '@/types/problems';

const info = getDifficultyInfo(1500);
// { label: 'Medium', color: '...', minRating: 1400, maxRating: 1899 }
```

## ⚡ Performance Tips

1. **Use database functions** - The `get_matchmaking_problems` function is optimized with proper indexes
2. **Cache problem data** - Problems don't change often, consider caching in battle context
3. **Lazy load hints** - Only fetch hints when user requests them
4. **Batch history updates** - Update problem history after battle ends, not on every action

## 🐛 Troubleshooting

### "No suitable problems found"

**Cause:** Not enough problems in database for the rating range.

**Solution:**
1. Seed more problems with `033_seed_sample_problems.sql`
2. Import real problems from Codeforces/AtCoder APIs
3. Increase `ratingRange` parameter

### "Problem not found (404)"

**Cause:** Problem might be inactive or doesn't exist.

**Solution:**
1. Check `is_active = true` in database
2. Verify problem ID is correct
3. Check RLS policies allow access

### Hints not showing

**Cause:** No hints in database for that problem.

**Solution:**
1. Add hints using `INSERT INTO problem_hints`
2. Ensure `showHints={true}` in component
3. Check problem has `hints` array populated

## 📚 Next Steps

1. ✅ Run migrations
2. ✅ Seed sample data
3. ✅ Test API endpoints
4. ✅ Integrate into battle arena
5. 🔄 Import real problems from platforms
6. 🔄 Monitor usage and statistics
7. 🔄 Adjust rating ranges based on data

---

**Need help?** Check the full implementation guide in `PROBLEM_SOURCING_IMPLEMENTATION.md`
