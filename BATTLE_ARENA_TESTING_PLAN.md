# Battle Arena Testing Plan

This document outlines the testing approach for the newly upgraded Battle Arena features.

## Test Environment Setup

1. Ensure Supabase database is properly configured with `SUPABASE_SETUP.sql`
2. Verify Redis server is running and accessible
3. Check that all dependencies are installed (`npm install`)
4. Start the development server (`npm run dev`)

## Feature Areas to Test

### 1. Matchmaking System
- [ ] Redis-based queue management
- [ ] +200/-100 rating range matching
- [ ] 15s accept/decline system
- [ ] AI-based matchmaking algorithm
- [ ] Queue cleanup mechanisms

### 2. Battle Room
- [ ] Split-view interface (problem/editor/scoreboard)
- [ ] Real-time scoreboard updates
- [ ] Code editor functionality
- [ ] Submission handling
- [ ] Battle chat system

### 3. Tournament System
- [ ] Tournament listing page
- [ ] Tournament detail page with brackets
- [ ] Tournament registration
- [ ] Bracket visualization

### 4. Spectator Mode
- [ ] Join/leave spectator mode
- [ ] Live battle viewing
- [ ] Spectator chat
- [ ] Participant tracking

### 5. Replay System
- [ ] Replay listing page
- [ ] Replay detail page
- [ ] Timeline navigation
- [ ] Playback controls
- [ ] Event-based progression

### 6. Responsive Design
- [ ] Mobile layout adjustments
- [ ] Tablet layout adjustments
- [ ] Desktop layout consistency
- [ ] Touch interaction support

## Test Scenarios

### Matchmaking Tests
1. User joins queue and gets matched within rating range
2. User waits in queue and receives match notification
3. User accepts match within 15 seconds
4. User declines match and returns to queue
5. AI-based matching pairs compatible players
6. Queue cleanup removes stale entries

### Battle Room Tests
1. User navigates between problem, editor, and submission tabs
2. User submits code and receives verdict
3. Scoreboard updates in real-time
4. Chat messages appear for all participants
5. Battle progresses through rounds correctly

### Tournament Tests
1. User views list of available tournaments
2. User registers for a tournament
3. User views tournament bracket
4. Bracket updates as matches complete

### Spectator Tests
1. User joins battle as spectator
2. User views battle from spectator perspective
3. User participates in spectator chat
4. User leaves spectator mode

### Replay Tests
1. User views list of available replays
2. User selects replay and views details
3. User navigates timeline
4. User adjusts playback speed
5. Events display correctly during playback

### Responsive Design Tests
1. Battle Arena pages display correctly on mobile
2. Battle Arena pages display correctly on tablet
3. Battle Arena pages display correctly on desktop
4. Interactive elements are touch-friendly

## Testing Tools

### Automated Tests
- Unit tests for backend services
- Integration tests for API endpoints
- Component tests for frontend UI
- End-to-end tests for user flows

### Manual Testing
- Browser testing (Chrome, Firefox, Safari, Edge)
- Device testing (mobile, tablet, desktop)
- User flow validation
- Edge case exploration

## Test Data Requirements

### User Accounts
- Multiple test users with varying ratings
- Admin user for tournament management
- Bot users for practice battles

### Battle Data
- Sample problems with different difficulty levels
- Predefined battle scenarios
- Tournament structures

### Mock Data
- Queue entries for matchmaking testing
- Submission data for replay system
- Chat messages for real-time testing

## Success Criteria

### Performance Metrics
- Matchmaking response time < 2 seconds
- Page load time < 3 seconds
- Real-time update latency < 500ms

### Functional Requirements
- All features work as designed
- Error handling is appropriate
- User experience is smooth and intuitive

### Quality Standards
- No critical or high-severity bugs
- Code coverage > 80% for new features
- Accessibility standards met
- Security best practices followed

## Rollback Plan

If critical issues are found during testing:
1. Document all issues with reproduction steps
2. Prioritize issues by severity
3. Create fix branches for critical issues
4. Re-test fixed issues
5. If necessary, rollback to previous stable version