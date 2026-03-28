# 👨‍💼 Admin Guide

## Getting Started

### Accessing Admin Panel

1. Navigate to `/admin`
2. Enter the passcode: `847291`
3. You now have full control!

> 💡 Session lasts 24 hours. After that, re-enter passcode.

## Pre-Auction Setup

### 1. Set Team Owners

Before auction:
1. Go to **Admin → Teams** tab
2. Enter owner name for each team
3. Names appear on team cards throughout the app

### 2. Verify Player Data

1. Go to **Admin → Data** tab
2. Check the player count
3. If needed, import updated player JSON

### 3. Test the System

1. Do a test run with a few bids
2. Use "Undo" to reverse test sales
3. Or use "Reset All Data" to start fresh

## Running the Live Auction

### Setup

1. **Main Screen**: Open `/admin` on your laptop
2. **Display Screen**: Open `/live` on the projector/TV
3. The live page auto-refreshes every 5 seconds

### Starting the Auction

1. Go to **Admin → Auction** tab
2. Click **"Start Auction"** button
3. Phase changes from `NOT_STARTED` to `IDLE`

### Selecting Players

#### Option A: Random Spinner (Recommended)
1. Click **"Spin"** on any position spinner (GK, DEF, MID, FWD)
2. Wait for spinner to stop
3. Click **"Select [Player Name]"** to confirm

#### Option B: Manual Selection
1. Scroll down to player list
2. Use category/position filters
3. Click **"Select"** next to desired player

### Placing Bids

1. Player card appears in **Active Bidding** section
2. See current bid and next bid amount
3. Click on team button to place bid for that team
4. Button shows:
   - Team emoji and name
   - Remaining budget
   - GK/Alumni counts
   - Disabled if constraints violated

### Understanding Bid Buttons

| Button State | Meaning |
|--------------|---------|
| Green | Leading team |
| Outline | Can place bid |
| Disabled/Gray | Cannot bid (see reason) |

### Selling a Player

1. When bidding stops, click **"Sell to [Team]"**
2. Player added to team roster
3. Budget updated automatically
4. Auction returns to `IDLE` state

### Marking Unsold

1. If no team wants player, click **"Mark Unsold"**
2. Player status becomes `UNSOLD`
3. Can be re-auctioned later

### Undoing a Sale

1. Find **"Undo Last Sale"** section
2. Shows the most recent sale
3. Click **"Undo Sale"** to reverse
4. Player returns to available pool
5. Team budget restored

### Pausing/Resuming

- Click **"Pause"** for breaks
- Click **"Resume"** to continue
- Live display shows paused state

### Ending Auction

1. When all players sold, click **"End Auction"**
2. Phase becomes `COMPLETED`
3. Proceed to league phase

## Understanding Bid Increments

The increment changes based on current bid:

| Current Bid | Next Bid |
|-------------|----------|
| ৳3,000 | ৳4,000 (+৳1,000) |
| ৳9,000 | ৳10,000 (+৳1,000) |
| ৳10,000 | ৳12,000 (+৳2,000) |
| ৳20,000 | ৳22,000 (+৳2,000) |

## Managing Team Budgets

### View Budgets
- Each team card shows remaining budget
- Updated in real-time after each sale

### Budget Constraints
- Teams cannot bid more than their remaining budget
- System automatically disables bid buttons

### If Budget Issues Arise
1. Go to **Admin → Teams** tab
2. Remove a player (emergency only)
3. Player returns to pool, budget restored

## Entering League Scores

### After Auction

1. Go to **Admin → League** tab
2. Find the match to score
3. Enter home goals and away goals
4. Match status changes to `COMPLETED`

### Editing Scores

- Simply change the numbers
- Standings update automatically
- Previous value logged

### The Final

1. Complete all 10 league matches
2. Final section appears
3. Enter final match score
4. Winner automatically determined

## Data Management

### Exporting Data

1. Go to **Admin → Data** tab
2. Click **"Export Full Backup (JSON)"**
3. Save file safely - this is your backup!

### Exporting Players CSV

1. Click **"Export Players (CSV)"**
2. Opens in Excel/Sheets
3. Good for printing player sheets

### Importing Data

1. Click the file input
2. Select previously exported JSON
3. All data replaced with imported data

### Resetting Data

1. Go to danger zone
2. Type "RESET" in the input
3. Click **"Reset All Data"**
4. ⚠️ This cannot be undone!

## Troubleshooting

### Live Page Not Updating

- Check both devices are on same network
- Refresh the live page manually
- Check browser console for errors

### Player Missing from List

- Check the status filter in Auction page
- Player might be marked SOLD or BIDDING

### Team Cannot Bid

Check these in order:
1. Squad size < 8?
2. If Alumni player: Team has < 1 Alumni?
3. If GK player: Team has < 1 GK?
4. Budget sufficient for next bid?

### Undo Not Working

- Only the most recent sale can be undone
- If you sold multiple, you can only undo the last one

### Wrong Score Entered

- Go back to League tab
- Simply edit the numbers
- Changes saved automatically

## Best Practices

1. **Always backup** before major events
2. **Test on projector** before auction
3. **Have a backup device** ready
4. **Take breaks** during long auctions (use Pause)
5. **Export data** after auction completes
6. **Document unusual decisions** (use team notes)

## Quick Reference Card

| Action | Button/Location |
|--------|-----------------|
| Start Auction | Auction tab → "Start Auction" |
| Select Player | Use Spinner or List |
| Place Bid | Click team button |
| Sell Player | "Sell to [Team]" |
| Mark Unsold | "Mark Unsold" |
| Undo Sale | "Undo Sale" section |
| Pause | "Pause" button |
| End Auction | "End Auction" |
| Enter Score | League tab → Match inputs |
| Backup Data | Data tab → Export |
