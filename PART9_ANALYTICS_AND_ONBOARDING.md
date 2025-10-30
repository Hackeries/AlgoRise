# PART 9: Analytics & Tracking (Without Creepiness)

## 9.1 What to Track (Ethically)

### Track for User Benefit (Visible to the User)
- Problems solved per day, week, and month
- Average solve time broken down by topic
- Win rate in battle modes
- Favorite topics based on engagement and success rate
- Overall learning progress visualized as a chart

### Track for Platform Health (Internal Insights)
- Problem difficulty calibration (solve rates that are too high or too low)
- Drop-off points that show where users abandon flows
- Feature usage statistics (e.g., hints, replays, review tools)
- Server performance metrics to ensure a smooth experience

### Explicitly Do Not Track
- Selling, sharing, or monetizing user data
- Behavioral tracking outside of the platform
- Dark pattern tactics that manipulate or coerce engagement

## 9.2 User-Facing Analytics Dashboard

Provide a personal dashboard that is transparent, motivational, and actionable. Example layout:

```
Week Overview:
├─ Problems Solved: 15 (up from 12 last week ↑)
├─ Battles Won: 8/15 (53% win rate)
├─ Favorite Topic: Dynamic Programming
├─ Longest Streak: 12 days
└─ Average Solve Time: 8:32 (down from 9:15 ↓)

Weak Topics (need practice):
├─ Graph Theory: 45% success rate
├─ Number Theory: 52% success rate
└─ Recommended: Solve 3 Graph problems this week

Recent Battles:
├─ Won vs @username (Rating +15) - 2 hours ago
├─ Lost vs @username (Rating -10) - 1 day ago
└─ [View More]
```

- Use positive reinforcement and trend indicators (up/down arrows) to help learners stay motivated.
- Highlight weak topics along with concrete recommendations to guide practice sessions.
- Surface recent battle outcomes with quick links for deeper review.
- Make every metric explorable so users understand how it is calculated and how to improve it.

# PART 10: Onboarding & First-Time User Experience

## 10.1 Frictionless Signup

### Required (Keep Total Time Under 2 Minutes)
- Email and password (or OAuth with Google)
- Display name
- Self-assessed skill level: `Newbie`, `Pupil`, `Specialist`, or `Expert`
- Primary goal: `Competitive Programming`, `Interviews`, `Learning`, or `Fun`

### Defer Until Later
- Biography and profile photo
- Detailed interests (infer from in-product behavior)
- Social connections or friend invites

### Immediate Post-Signup Flow
- Skip the tutorial by default, but offer an optional “Learn the UI” button.
- Drop the user directly into Practice mode (not Battles) to reduce pressure.
- Auto-load a simple starter problem to help them get comfortable right away.

## 10.2 First Battle Flow

### Pre-Battle Briefing
- Present a friendly explainer: “You’re about to play your first 1v1 battle! Here’s what happens…”
- Clarify the rules: 15 minutes, 3–5 problems, ICPC scoring.
- Offer two call-to-action buttons:
  - `Start Training Battle vs AI`
  - `Jump to Real 1v1`

### Training Battle vs AI (Recommended First Step)
- Show the opponent as “AlgoBot”.
- Disable rating adjustments to remove risk.
- Let users explore the full battle UI without pressure.
- Encourage them to retry until they feel ready for a real opponent.

### Transition to Live Battles
- After completing (or skipping) the training battle, prompt them once more with both options.
- Remind users that real battles affect rating, while AI battles remain practice-only.
- Surface quick links to review battle tips and keyboard shortcuts before they jump in.
