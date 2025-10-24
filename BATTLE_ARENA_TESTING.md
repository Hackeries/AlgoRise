# Code Battle Arena Testing Guide

## Overview

This document provides instructions for testing the Code Battle Arena feature implemented in AlgoRise.

## Prerequisites

1. Supabase project set up with the database schema
2. AlgoRise application running locally
3. User account for testing

## Testing Components

### 1. Database Schema Testing

#### Manual Verification
1. Open your Supabase dashboard
2. Navigate to the Table Editor
3. Verify the following tables exist:
   - `battles`
   - `battle_participants`
   - `battle_rounds`
   - `battle_submissions`
   - `battle_ratings`

#### Automated Testing
Visit `/api/test/battle-arena` to run the automated database schema test.

### 2. API Endpoint Testing

#### Available Endpoints
- `GET /api/battles` - Get user's battles
- `POST /api/battles` - Create/join battles
- `GET /api/battles/[id]` - Get battle details
- `POST /api/battles/[id]` - Start battle
- `POST /api/battles/[id]/join` - Join battle
- `POST /api/battles/[id]/submit` - Submit solution

#### Testing with cURL
```bash
# Test getting battles (requires auth)
curl -X GET http://localhost:3000/api/battles

# Test creating a battle (requires auth)
curl -X POST http://localhost:3000/api/battles \
  -H "Content-Type: application/json" \
  -d '{"action":"join_queue","format":"best_of_3"}'
```

### 3. UI Component Testing

#### Main Battle Arena Page
1. Navigate to `/battle-arena`
2. Verify the following components are visible:
   - Queue joining interface
   - Private battle creation
   - Battle history section
   - User rating display

#### Battle Room Page
1. Navigate to `/battle-arena/test-battle-id`
2. Verify the following components are visible:
   - Participant information
   - Current round details
   - Code editor
   - Submission controls
   - Timer display

### 4. Navigation Testing

#### Main Navigation
1. Visit any page on the site
2. Verify "Battle Arena" link appears in the main navigation
3. Click the link and verify it navigates to `/battle-arena`

#### Dashboard Quick Action
1. Visit the main dashboard (requires CF verification)
2. Verify "Battle Arena" quick action button appears
3. Click the button and verify it navigates to `/battle-arena`

## Automated Testing

### Running the Test Suite
1. Visit `/test-features/battle-arena`
2. Click "Run All Tests" to execute all automated tests
3. Check results for each test component

### Test Results Interpretation
- ✅ Passed: Component is working correctly
- ❌ Failed: Component has an issue that needs fixing
- ❌ Error: Test encountered an unexpected error

## Manual Testing Procedures

### Test 1: Battle Arena Page
1. Navigate to `/battle-arena`
2. Verify page loads without errors
3. Check that all UI elements are properly rendered
4. Verify responsive design on different screen sizes

### Test 2: Battle Room Page
1. Navigate to `/battle-arena/test-battle-id`
2. Verify page loads without errors
3. Check that all UI elements are properly rendered
4. Verify code editor is functional

### Test 3: API Endpoints
1. Use browser developer tools to monitor network requests
2. Navigate to battle arena pages
3. Verify API requests return appropriate status codes
4. Check that unauthorized requests return 401 status

### Test 4: Database Integration
1. Visit `/api/test/battle-arena`
2. Verify response indicates all tables exist
3. Check that no database errors are reported

## Common Issues and Troubleshooting

### Issue: Database Tables Missing
**Solution**: Run `SUPABASE_SETUP.sql` in your Supabase SQL Editor

### Issue: API Endpoints Return 500 Errors
**Solution**: 
1. Check server logs for specific error messages
2. Verify Supabase environment variables are configured
3. Ensure database tables exist and have correct schema

### Issue: UI Components Not Rendering
**Solution**:
1. Check browser console for JavaScript errors
2. Verify all required dependencies are installed
3. Check that TypeScript compilation completed successfully

## Test Data Preparation

For comprehensive testing, prepare the following test data:

1. **User Accounts**: Create at least 2 test user accounts
2. **Battle Ratings**: Ensure test users have battle ratings
3. **Sample Battles**: Create sample battles for testing room functionality

## Performance Testing

1. Test page load times for battle arena pages
2. Verify API response times are within acceptable limits
3. Check database query performance with large datasets

## Security Testing

1. Verify authentication is required for protected endpoints
2. Test authorization to ensure users can only access their own data
3. Verify input validation on all API endpoints

## Integration Testing

1. Test integration with existing notification system
2. Verify compatibility with CF verification system
3. Check integration with real-time features

## Next Steps

After completing these tests:
1. Document any issues found
2. Fix identified problems
3. Retest fixed components
4. Prepare for user acceptance testing