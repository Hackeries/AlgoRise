# Contest Persistence Test

This file documents how to test the contest persistence functionality.

## Test Steps:

1. **Create a Contest**:
   - Go to http://localhost:3001/contests
   - Click "Create New Contest"
   - Fill in the form with test data
   - Click "Create Contest"
   - Verify the contest appears in "Private Contests" section

2. **Test Page Refresh**:
   - Refresh the page (F5 or Ctrl+R)
   - Verify the contest is still visible

3. **Test Server Restart**:
   - Stop the development server (Ctrl+C)
   - Restart with `npm run dev`
   - Go back to contests page
   - Verify the contest is still there

## Expected Behavior:

- ✅ Contests should appear immediately after creation
- ✅ Contests should persist after page refresh
- ✅ Contests should persist after server restart
- ✅ Contest data is saved to `data/contests.json` file

## Storage Location:

Contest data is stored in: `./data/contests.json`

This file is automatically created when the first contest is added.