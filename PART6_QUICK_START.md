# Adaptive Learning Engine - Quick Start Guide

## 🚀 Setup Instructions

### 1. Run Database Migrations

Execute the adaptive learning schema in your Supabase SQL Editor:

```bash
# In Supabase Dashboard > SQL Editor
# Run the contents of:
scripts/034_create_adaptive_learning_engine.sql
```

This creates:
- Problem attempt tracking tables
- User skill profile tables
- Learning path tables
- Spaced repetition tables
- Automatic triggers for metrics updates

### 2. Verify Tables Created

Check that these tables exist in your Supabase database:
- ✅ `problem_attempts`
- ✅ `user_topic_mastery`
- ✅ `user_skill_profiles`
- ✅ `problem_recommendations`
- ✅ `learning_paths`
- ✅ `user_learning_path_progress`
- ✅ `spaced_repetition_reviews`

The script also seeds 6 default learning paths (Level 1-6).

### 3. Access the Dashboard

Navigate to:
```
https://your-domain.com/adaptive-learning
```

Or add a link in your navigation:
```tsx
<Link href="/adaptive-learning">
  Adaptive Learning
</Link>
```

## 📖 Usage Guide

### For Users

#### 1. **View Your Skill Profile**

The dashboard automatically shows:
- Current skill level (calculated from recent solves)
- Success rate (% of problems solved)
- Learning velocity (problems per week)
- Current streak and best streak

#### 2. **Get Problem Recommendations**

Click the "Recommendations" tab to see:
- **Skill Level Problems** (60%) - Match your current ability
- **Weak Topic Problems** - Focus on areas <50% success
- **Exploratory Problems** (40%) - Slightly harder, new topics
- **Review Problems** - From spaced repetition queue

Each recommendation includes:
```
Problem Title
└─ "Practice DP - your success rate is below 50%"
   [Solve Now]
```

#### 3. **Follow Learning Paths**

Click "Learning Paths" to see structured progression:
```
Level 1: Basics (800-1000) ───────────────── 47%
  ├─ Arrays & Strings: 5 problems
  ├─ Loops & Conditionals: 5 problems
  └─ Simulations: 5 problems
```

Start with Level 1 if you're new, or jump to your skill level.

#### 4. **Review Difficult Problems**

Click "Reviews" to see problems you struggled with:
```
🔄 Two Sum Problem
└─ 3 days overdue • Reviewed 2 times
   [Review Now]
```

Review schedule:
- After 3 days (first retry)
- After 1 week (second retry)
- After 1 month (long-term retention)

### For Developers

#### Recording Problem Attempts

When a user completes a problem, record it:

```typescript
const recordAttempt = async (problemData: {
  problem_id: string;
  problem_title: string;
  rating: number;
  tags: string[];
  status: 'solved' | 'failed' | 'attempted';
  time_spent_seconds: number;
}) => {
  const response = await fetch('/api/adaptive-learning/metrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(problemData)
  });
  
  return response.json();
};

// Usage
await recordAttempt({
  problem_id: '1234A',
  problem_title: 'Two Sum',
  rating: 1200,
  tags: ['implementation', 'hash-table'],
  status: 'solved',
  time_spent_seconds: 1800
});
```

This automatically:
- Updates user skill profile
- Recalculates topic mastery
- Generates new recommendations
- Adds to spaced repetition if failed

#### Getting Recommendations

```typescript
// Get cached recommendations
const getRecommendations = async () => {
  const response = await fetch('/api/adaptive-learning/recommendations');
  return response.json();
};

// Generate fresh recommendations
const refreshRecommendations = async () => {
  const response = await fetch(
    '/api/adaptive-learning/recommendations?refresh=true'
  );
  return response.json();
};
```

#### Tracking Learning Path Progress

```typescript
// Update progress when user solves a problem in a path
const updatePathProgress = async (pathId: string) => {
  await fetch('/api/adaptive-learning/learning-paths', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pathId,
      problemCompleted: true
    })
  });
};
```

#### Recording Review Outcomes

```typescript
const recordReview = async (
  problemId: string, 
  outcome: 'failed' | 'partial' | 'success'
) => {
  const response = await fetch('/api/adaptive-learning/spaced-repetition', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      problemId,
      outcome,
      timeSpentSeconds: 900
    })
  });
  
  const data = await response.json();
  console.log('Next review:', data.nextReviewAt);
  if (data.mastered) {
    console.log('Problem mastered! 🎉');
  }
};
```

## 🔍 API Reference

### Recommendations API

**GET `/api/adaptive-learning/recommendations`**
- Query params: `count` (default: 10), `refresh` (default: false)
- Returns: Array of recommended problems with reasoning

**POST `/api/adaptive-learning/recommendations`**
- Body: `{ problemId, status: 'viewed' | 'started' | 'completed' | 'skipped' }`
- Updates recommendation status

### Metrics API

**GET `/api/adaptive-learning/metrics`**
- Returns: User skill profile and comprehensive metrics

**POST `/api/adaptive-learning/metrics`**
- Body: Problem attempt data
- Records attempt and updates all metrics

### Learning Paths API

**GET `/api/adaptive-learning/learning-paths`**
- Query params: `pathId` (optional), `overview` (default: false)
- Returns: Learning paths with user progress

**POST `/api/adaptive-learning/learning-paths`**
- Body: `{ pathId, problemCompleted: boolean }`
- Updates path progress

### Spaced Repetition API

**GET `/api/adaptive-learning/spaced-repetition`**
- Query params: `stats` (default: false), `upcoming` (default: false)
- Returns: Due reviews and statistics

**POST `/api/adaptive-learning/spaced-repetition`**
- Body: `{ problemId, outcome, timeSpentSeconds }`
- Records review and schedules next review

**DELETE `/api/adaptive-learning/spaced-repetition?problemId=xxx`**
- Archives a review (user doesn't want to review anymore)

## 🎯 Integration Examples

### Add to Problem Solving Page

```tsx
'use client';

import { useEffect } from 'react';

export function ProblemPage({ problemId }: { problemId: string }) {
  const handleSolve = async (timeSpent: number) => {
    // Record the solve
    await fetch('/api/adaptive-learning/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problem_id: problemId,
        problem_title: 'Current Problem',
        rating: 1400,
        tags: ['dp', 'greedy'],
        status: 'solved',
        time_spent_seconds: timeSpent
      })
    });
    
    // Show success and next recommendation
    const { recommendations } = await fetch(
      '/api/adaptive-learning/recommendations'
    ).then(r => r.json());
    
    if (recommendations[0]) {
      alert(`Great! Try this next: ${recommendations[0].problem_title}`);
    }
  };
  
  // ... rest of problem page
}
```

### Add to Navigation

```tsx
import { Badge } from '@/components/ui/badge';

export function Navigation() {
  const [dueCount, setDueCount] = useState(0);
  
  useEffect(() => {
    fetch('/api/adaptive-learning/spaced-repetition?stats=true')
      .then(r => r.json())
      .then(data => setDueCount(data.stats?.dueToday || 0));
  }, []);
  
  return (
    <nav>
      <Link href="/adaptive-learning">
        Adaptive Learning
        {dueCount > 0 && (
          <Badge variant="destructive">{dueCount}</Badge>
        )}
      </Link>
    </nav>
  );
}
```

## 🧪 Testing the System

### 1. Record Some Attempts

Use the API or UI to record 5-10 problem attempts with varying results.

### 2. Check Metrics

Visit `/adaptive-learning` and verify:
- Skill level is calculated
- Success rate is shown
- Topics appear in weak/strong lists

### 3. Get Recommendations

Click "Refresh" on recommendations and verify:
- Problems are recommended
- Each has clear reasoning
- Categories are assigned correctly

### 4. Test Spaced Repetition

Record a failed attempt, then check "Reviews" tab:
- Problem should appear in reviews
- Should show "Due in 3 days"

## 📊 Monitoring & Analytics

### Check User Engagement

```sql
-- Total users using adaptive learning
SELECT COUNT(DISTINCT user_id) FROM user_skill_profiles;

-- Most active users
SELECT user_id, total_problems_attempted, current_skill_level
FROM user_skill_profiles
ORDER BY total_problems_attempted DESC
LIMIT 10;

-- Average skill level progression
SELECT 
  user_id,
  current_skill_level,
  skill_level_7d_ago,
  improvement_rate
FROM user_skill_profiles
WHERE improvement_rate > 0
ORDER BY improvement_rate DESC;
```

### Popular Learning Paths

```sql
SELECT 
  lp.name,
  COUNT(DISTINCT ulpp.user_id) as users_enrolled,
  AVG(ulpp.completion_percentage) as avg_completion
FROM learning_paths lp
LEFT JOIN user_learning_path_progress ulpp ON lp.id = ulpp.learning_path_id
GROUP BY lp.id, lp.name
ORDER BY users_enrolled DESC;
```

## 🐛 Troubleshooting

### Problem: No recommendations showing

**Solution**: 
1. Record some problem attempts first
2. Click "Refresh" to generate new recommendations
3. Check that user has a skill profile created

### Problem: Skill level not updating

**Solution**:
1. Verify problem attempts are being recorded with ratings
2. Check that at least one problem is marked as 'solved'
3. Database triggers should auto-update; verify they exist

### Problem: Reviews not appearing

**Solution**:
1. Record a problem attempt with status='failed'
2. Wait 3 days OR manually update `next_review_at` in database for testing
3. Refresh the Reviews tab

## 🎓 Best Practices

### For Users:
1. **Record All Attempts** - Even failed ones help the system learn
2. **Follow Recommendations** - They're personalized to your level
3. **Do Daily Reviews** - Spaced repetition works best with consistency
4. **Complete Learning Paths** - Structured progression is most effective

### For Developers:
1. **Always Include Problem Ratings** - Essential for skill calculation
2. **Track Solve Time** - Helps identify areas for improvement
3. **Use Accurate Tags** - Topic mastery depends on correct tagging
4. **Refresh Recommendations Weekly** - Keep them fresh and relevant

## 🚀 What's Next?

Now that the adaptive learning engine is set up:

1. **Integrate with existing problem pages** - Record attempts automatically
2. **Add email reminders** - Notify users of due reviews
3. **Create achievement system** - Reward completing learning paths
4. **Build analytics dashboard** - Track overall platform learning trends

---

**Questions?** Check `PART6_ADAPTIVE_LEARNING_ENGINE.md` for detailed documentation.

**Ready to learn?** Visit `/adaptive-learning` and start your personalized journey! 🎯
