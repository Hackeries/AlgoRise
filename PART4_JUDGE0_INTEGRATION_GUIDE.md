# PART 4: Judge0 Integration & Code Execution Guide

## Quick Start

### 1. Environment Setup

Add to your `.env.local`:

```bash
# Judge0 Configuration
JUDGE0_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_rapidapi_key_here

# Or use public Judge0 instance (slower, rate-limited)
# JUDGE0_URL=https://judge0-ce.p.rapidapi.com
```

### 2. Get Judge0 API Key

1. Visit https://rapidapi.com/judge0-official/api/judge0-ce
2. Subscribe to a plan (free tier available)
3. Copy your API key
4. Add to `.env.local` as `JUDGE0_API_KEY`

---

## Architecture Overview

```
User Submits Code
       ↓
Client Validation (useSubmission hook)
       ↓
POST /api/battles/[id]/submit
       ↓
BattleService.submitSolution()
       ↓
CodeExecutionService.executeCode()
       ↓
Judge0 API (with retry logic)
       ↓
Poll Submission Status
       ↓
Display Result with SubmissionFeedback
```

---

## Components & Their Roles

### 1. `useSubmission` Hook (`/hooks/use-submission.ts`)

**Purpose**: Central submission management with validation and retry logic

**Key Features**:
- Client-side validation (code size, empty checks)
- Submission throttling (10s cooldown)
- Auto-retry with exponential backoff
- Progress tracking
- User-friendly error messages
- Success sound on AC

**Usage**:
```tsx
const { submit, cancel, isSubmitting, progress, result } = useSubmission({
  battleId: 'battle-123',
  roundId: 'round-456',
  onSuccess: (result) => {
    console.log('Accepted!', result);
  },
  onError: (error) => {
    console.error('Submission failed', error);
  }
});

// Submit code
await submit(code, language);
```

---

### 2. `SubmissionProgressIndicator` (`/components/battle-arena/submission-progress.tsx`)

**Purpose**: Real-time visual feedback during submission

**Progress Stages**:
```typescript
'validating'  → Blue spinner   → "📝 Validating your code..."
'compiling'   → Yellow spinner → "⚙️ Compiling your code..."
'running'     → Purple spinner → "🏃 Running test cases... Test 3/5"
'complete'    → Green check    → Result message
'error'       → Red X          → Error message
```

**Features**:
- Animated progress bar (0-100%)
- Test case counter with visual dots
- Cancel button
- Stage-specific tips

---

### 3. `SubmissionFeedback` (`/components/battle-arena/submission-feedback.tsx`)

**Purpose**: Display submission results with detailed feedback

**Verdict Types**:

| Verdict | Icon | Color | Additional Info |
|---------|------|-------|-----------------|
| AC (Accepted) | ✓ | Green | Points earned, execution time |
| WA (Wrong Answer) | ✗ | Red | Failed test case, expected vs actual output |
| TLE (Time Limit) | ⏱ | Orange | Optimization hint |
| MLE (Memory Limit) | 💾 | Orange | Memory optimization hint |
| RE (Runtime Error) | 💥 | Yellow | Full error output, debugging hint |
| CE (Compilation Error) | ❌ | Yellow | Full compilation output, syntax hint |

**Features**:
- Expandable expected vs actual output (WA only)
- Full error output display (CE/RE)
- Smart hints based on verdict
- Animated transitions

---

### 4. `CodeExecutionService` (`/lib/code-execution-service.ts`)

**Purpose**: Interface with Judge0 API with robust error handling

**Key Improvements in Part 4**:
- ✅ Timeout management (60s max)
- ✅ Retry logic (3 attempts with exponential backoff)
- ✅ Rate limit handling (429)
- ✅ Server error handling (5xx)
- ✅ Cancellable requests (AbortController)
- ✅ User-friendly error messages

**Supported Languages**:
```typescript
'cpp'        → C++ (GCC 9.2.0)
'python'     → Python (3.8.1)
'java'       → Java (OpenJDK 13.0.1)
'javascript' → JavaScript (Node.js 12.14.0)
'c'          → C (GCC 9.2.0)
'go'         → Go (1.13.5)
'rust'       → Rust (1.40.0)
```

---

## API Routes

### POST `/api/battles/[id]/submit`

**Purpose**: Submit code for judging

**Request**:
```json
{
  "roundId": "round-789",
  "codeText": "...",
  "language": "cpp"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "Solution submitted successfully",
  "submissionId": "sub-123"
}
```

**Response (Error)**:
```json
{
  "error": "Please wait 7 seconds before submitting again"
}
```

**Status Codes**:
- `200` - Success
- `400` - Validation error (code empty, too long, etc.)
- `401` - Not logged in
- `403` - Not a participant
- `429` - Too many submissions (throttling)
- `500` - Server error

---

### GET `/api/battles/[id]/submissions/[submissionId]`

**Purpose**: Poll submission status

**Response**:
```json
{
  "id": "sub-123",
  "status": "running",
  "verdict": "RUNNING",
  "currentTest": 3,
  "totalTests": 5,
  "executionTimeMs": null,
  "memoryUsedKb": null,
  "failedTestCase": null,
  "expectedOutput": null,
  "actualOutput": null
}
```

**When Complete**:
```json
{
  "id": "sub-123",
  "status": "wrong_answer",
  "verdict": "WA",
  "executionTimeMs": 125,
  "memoryUsedKb": 2048,
  "failedTestCase": 5,
  "expectedOutput": "42\n",
  "actualOutput": "43\n",
  "points": 0
}
```

---

## Error Handling Flow

### 1. Network Error (Connection Lost)
```
Attempt 1: Failed → Wait 2s → Retry
Attempt 2: Failed → Wait 4s → Retry  
Attempt 3: Failed → Wait 8s → Retry
Attempt 4: Show error with "Contact Support" button
```

### 2. Judge0 Slow Response
```
0-10s:  Normal submission
10s:    "⏳ This is taking longer than usual..." + [Cancel] button
30s:    "⚠️ Judge0 is experiencing delays..." + [Refresh] button
60s:    Timeout → Show error
```

### 3. Rate Limit (429)
```
Judge0 returns 429
  ↓
Auto-retry with backoff (2s, 4s, 8s)
  ↓
If still failing: "Judge0 rate limit exceeded. Please try again later."
```

### 4. Compilation Error
```
Judge0 returns status=6 (CE)
  ↓
Display full compilation output
  ↓
Show hint: "Review syntax errors, missing imports..."
```

---

## UX Best Practices Implemented

### 1. Never Show Technical Errors

❌ **Bad**: "Error: ECONNREFUSED at fetch()"  
✅ **Good**: "Failed to submit. Please try again or contact support."

❌ **Bad**: "HTTP 500 Internal Server Error"  
✅ **Good**: "An error occurred while submitting your code. Please try again."

### 2. Always Provide Next Steps

❌ **Bad**: "Submission failed"  
✅ **Good**: "Submission failed. Please try again or [Contact Support]"

❌ **Bad**: "Code is invalid"  
✅ **Good**: "Code is too short. Please provide a valid solution."

### 3. Reduce Anxiety

✅ Progress indicators show submission isn't stuck  
✅ Test case counters show progress  
✅ Cancel option available  
✅ Timeout warnings before failure  
✅ Success sound provides instant gratification  

---

## Testing Your Integration

### 1. Test Client Validation

```typescript
// Empty code
submit('', 'cpp');
// Expected: Error toast "Your code is empty!"

// Too short
submit('int', 'cpp');
// Expected: Error toast "Code is too short..."

// Too large (>10KB)
submit('a'.repeat(11000), 'cpp');
// Expected: Error toast "Code is too long..."

// Too fast (within 10s of last submission)
submit(code1, 'cpp');
submit(code2, 'cpp'); // Immediately after
// Expected: Error toast "Please wait X seconds..."
```

### 2. Test Judge0 Integration

```cpp
// Test AC (Accepted)
#include <iostream>
using namespace std;
int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}
// Expected: Green AC verdict with success sound

// Test WA (Wrong Answer)
#include <iostream>
using namespace std;
int main() {
    cout << "42" << endl;  // Wrong answer
    return 0;
}
// Expected: Red WA verdict with expected vs actual output

// Test CE (Compilation Error)
#include <iostream>
int main() {
    cout << "Hello"  // Missing semicolon
    return 0;
}
// Expected: Yellow CE verdict with compilation output

// Test TLE (Time Limit)
int main() {
    while(1) {}  // Infinite loop
    return 0;
}
// Expected: Orange TLE verdict with optimization hint
```

### 3. Test Error Handling

```typescript
// Network error simulation
// Disconnect internet → Submit → Should auto-retry 3 times

// Slow response simulation
// Submit code → Wait 10s → Should show "taking longer" warning
// Wait 30s → Should show "experiencing delays" warning
```

---

## Troubleshooting

### Issue: "Judge0 is currently unavailable"

**Cause**: Judge0 API is down or rate limited  
**Solution**:
1. Check Judge0 status: https://status.rapidapi.com/
2. Verify API key is correct
3. Check rate limits on RapidAPI dashboard
4. Wait and retry

### Issue: All submissions timeout

**Cause**: Network issues or Judge0 overload  
**Solution**:
1. Check internet connection
2. Try different Judge0 instance
3. Reduce timeout from 60s to 30s (in code-execution-service.ts)

### Issue: Success sound doesn't play

**Cause**: Missing audio file  
**Solution**:
1. Add `success.mp3` to `/public/sounds/`
2. Check browser console for audio loading errors
3. Ensure file is <1MB and properly encoded

---

## Performance Optimization

### 1. Reduce Polling Frequency
```typescript
// Current: Poll every 1 second
// Optimize: Poll every 2-3 seconds for slower Judge0 instances
while (polls < maxPolls) {
  await new Promise(resolve => setTimeout(resolve, 2000)); // Changed from 1000
}
```

### 2. Cache Test Cases
```typescript
// Store test cases in memory to avoid re-fetching
const testCaseCache = new Map<string, TestCase[]>();
```

### 3. Batch Submissions
```typescript
// For team battles, batch multiple submissions to reduce API calls
const batchSubmissions = async (submissions: Submission[]) => {
  // Implementation
};
```

---

## Security Considerations

✅ **Implemented**:
- Code size limits (10KB max)
- Submission throttling (10s cooldown)
- User authentication required
- Participant verification
- No exposure of internal errors

⚠️ **Future Enhancements**:
- Code similarity detection (prevent cheating)
- IP-based rate limiting
- Submission code encryption
- Plagiarism detection

---

## Migration Guide

### From Old Battle Room to Enhanced V2

1. **Replace Component**:
```tsx
// Old
import { EnhancedBattleRoom } from '@/components/battle-arena/enhanced-battle-room';

// New
import { EnhancedBattleRoomV2 } from '@/components/battle-arena/enhanced-battle-room-v2';
```

2. **Update Props** (same interface, no changes needed)

3. **Add Sound File**:
- Place `success.mp3` in `/public/sounds/`

4. **Test Submission Flow**:
- Verify all verdicts display correctly
- Test retry logic
- Verify sound plays on AC

---

## Conclusion

Part 4 successfully implements:

✅ **Robust submission flow** with validation and retry logic  
✅ **Comprehensive UX** with progress indicators and feedback  
✅ **Judge0 integration** with timeout and error handling  
✅ **User-friendly errors** (no technical jargon)  
✅ **Security best practices** (throttling, validation)  
✅ **Extensible architecture** for future enhancements  

The system is production-ready and provides an excellent user experience for competitive programming battles.
