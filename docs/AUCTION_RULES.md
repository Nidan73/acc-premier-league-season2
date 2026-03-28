# 🎯 Auction Rules

## Overview

The ACC Futsal League uses a **controlled auction** system where an admin/auctioneer manages the bidding process on behalf of team owners.

## Auction Phases

```
NOT_STARTED → IDLE → BIDDING → IDLE → ... → COMPLETED
                 ↓       ↓
              PAUSED ←───┘
```

| Phase | Description |
|-------|-------------|
| `NOT_STARTED` | Auction hasn't begun yet |
| `IDLE` | Waiting for admin to select next player |
| `BIDDING` | Active bidding on a player |
| `PAUSED` | Temporarily halted |
| `COMPLETED` | All players auctioned |

## Squad Constraints

Each team must follow these rules:

| Constraint | Value |
|------------|-------|
| **Maximum Squad Size** | 8 players |
| **Minimum Squad Size** | 6 players |
| **Maximum Alumni** | 1 per team |
| **Minimum Alumni** | 1 per team (required) |
| **Maximum Goalkeepers** | 1 per team |
| **Team Budget** | ৳150,000 |

### Constraint Enforcement

- Teams **cannot bid** if they already have 8 players
- Teams **cannot bid on Alumni** if they already have 1
- Teams **cannot bid on GK** if they already have 1
- Teams **cannot bid** if the bid amount exceeds remaining budget

## Dynamic Bid Increments

Bid increments are calculated based on the current bid:

| Current Bid Range | Increment |
|-------------------|-----------|
| Below ৳10,000 | +৳1,000 |
| ৳10,000 and above | +৳2,000 |

### Example Progression

```
Base Price: ৳3,000
Bid 1: ৳4,000 (+৳1,000)
Bid 2: ৳5,000 (+৳1,000)
...
Bid 7: ৳10,000 (+৳1,000)
Bid 8: ৳12,000 (+৳2,000)  ← Increment changes!
Bid 9: ৳14,000 (+৳2,000)
...
Sold: ৳36,000
```

## How Bidding Works

### Step 1: Admin Selects Player
- Admin uses random spinner OR manual selection
- Player status changes to `BIDDING`
- Base price becomes the starting bid

### Step 2: Admin Places Bids
- Admin clicks team buttons to place bids
- Each bid = current bid + increment
- System validates team can afford and meets constraints

### Step 3: Selling
- When bidding stops, admin clicks "Sell"
- Player joins leading team's roster
- Team budget reduced by sold price

### Step 4: Unsold
- If no bids received, admin marks "Unsold"
- Player status becomes `UNSOLD`
- Can be re-auctioned later

## Re-Auction

Unsold players can be put up for auction again:

1. Find player in available list (marked UNSOLD)
2. Select for bidding
3. New bidding round begins at base price

## Undo Functionality

Admin can undo the **last sale only**:

1. Click "Undo Sale" button
2. Player returns to AVAILABLE status
3. Team budget restored
4. Player removed from roster

> ⚠️ Only the most recent sale can be undone

## Budget Management

### Starting Budget
Each team starts with **৳150,000**

### Budget Calculation
```
Remaining = ৳150,000 - Σ(Sold Player Prices)
```

### Budget Validation
Before each bid:
```typescript
if (nextBidAmount > team.remainingBudget) {
  // Block bid - show "Insufficient budget"
}
```

## Random Spinner

The auction includes a random selection spinner for each position:

- **GK Spinner**: Randomly selects from available goalkeepers
- **DEF Spinner**: Randomly selects from available defenders
- **MID Spinner**: Randomly selects from available midfielders
- **FWD Spinner**: Randomly selects from available forwards

This adds excitement and fairness to player selection!

## Finalizing Auction

When all players are processed:

1. Admin clicks "End Auction"
2. Phase becomes `COMPLETED`
3. No more bidding allowed
4. Teams proceed to league phase

## Summary Checklist

✅ Each team must have 6-8 players
✅ Each team must have exactly 1 Alumni
✅ Each team must have exactly 1 Goalkeeper
✅ Total spending ≤ ৳150,000 per team
✅ All bids follow dynamic increment rules
