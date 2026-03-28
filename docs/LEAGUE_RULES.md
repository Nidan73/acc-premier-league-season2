# 🏆 League Rules

## Format

**5-Team Single Round-Robin**

- Each team plays every other team once
- Total: 10 matches
- Top 2 teams qualify for the Final

## Points System

| Result | Points |
|--------|--------|
| Win | 3 |
| Draw | 1 |
| Loss | 0 |

## Fixture Schedule

### Round 1 (Bye: Team Crazy)
- Team Rabies vs Meow - meoW FC
- Team Nazi vs Goal Diggers

### Round 2 (Bye: Goal Diggers)
- Team Crazy vs Team Rabies
- Meow - meoW FC vs Team Nazi

### Round 3 (Bye: Meow - meoW FC)
- Goal Diggers vs Team Crazy
- Team Rabies vs Team Nazi

### Round 4 (Bye: Team Rabies)
- Meow - meoW FC vs Goal Diggers
- Team Nazi vs Team Crazy

### Round 5 (Bye: Team Nazi)
- Team Crazy vs Meow - meoW FC
- Goal Diggers vs Team Rabies

## Bye System

With 5 teams in a round-robin, one team gets a "bye" (rest) each round:

| Round | Bye Team |
|-------|----------|
| 1 | Team Crazy 🤪 |
| 2 | Goal Diggers ⛏️ |
| 3 | Meow - meoW FC 🐱 |
| 4 | Team Rabies 🦊 |
| 5 | Team Nazi ⚡ |

## Standings Calculation

After each match, standings are recalculated:

1. **Played (P)**: Increment for both teams
2. **Goals For (GF)**: Add scored goals
3. **Goals Against (GA)**: Add conceded goals
4. **Result**: Determine Win/Draw/Loss
5. **Points**: Add based on result
6. **Goal Difference (GD)**: GF - GA
7. **Form**: Update last 5 results

## Tiebreaker Rules

When teams have equal points, apply in order:

### Priority 1: Points
Higher points = higher position

### Priority 2: Goal Difference
Higher GD = higher position

### Priority 3: Goals For
More goals scored = higher position

### Priority 4: Head-to-Head Points
If still tied, check direct match between tied teams

### Priority 5: Head-to-Head Goal Difference
GD in direct match between tied teams

### Priority 6: Coin Toss
If all above are equal, admin decides by coin toss

## Example Standings Table

```
╔════╤════════════════════╤═══╤═══╤═══╤═══╤════╤════╤═════╤═════╤══════╗
║ #  │ TEAM               │ P │ W │ D │ L │ GF │ GA │ GD  │ PTS │ FORM ║
╠════╪════════════════════╪═══╪═══╪═══╪═══╪════╪════╪═════╪═════╪══════╣
║ 1  │ 🦊 Team Rabies     │ 4 │ 3 │ 1 │ 0 │ 12 │ 4  │ +8  │ 10  │ WWWD ║
║ 2  │ 🐱 Meow - meoW FC  │ 4 │ 3 │ 0 │ 1 │ 9  │ 5  │ +4  │ 9   │ WWWL ║
╟────┼────────────────────┼───┼───┼───┼───┼────┼────┼─────┼─────┼──────╢
║ 3  │ ⚡ Team Nazi       │ 4 │ 2 │ 0 │ 2 │ 7  │ 7  │ 0   │ 6   │ LWWL ║
║ 4  │ ⛏️ Goal Diggers    │ 4 │ 1 │ 0 │ 3 │ 4  │ 9  │ -5  │ 3   │ LLLW ║
║ 5  │ 🤪 Team Crazy      │ 4 │ 0 │ 1 │ 3 │ 3  │ 10 │ -7  │ 1   │ DLLL ║
╚════╧════════════════════╧═══╧═══╧═══╧═══╧════╧════╧═════╧═════╧══════╝
```

## Form Guide

Shows last 5 match results (most recent first):

- 🟢 **W** = Win
- 🟡 **D** = Draw
- 🔴 **L** = Loss

## Final Match Qualification

| Position | Team | Status |
|----------|------|--------|
| 1st | Highest points | **Final Slot A** |
| 2nd | Second highest | **Final Slot B** |
| 3rd-5th | Others | Eliminated |

## The Final

### Setup
- 1st Place vs 2nd Place
- Single match showdown

### Determining Champion
- Higher score wins
- If draw after regulation: Penalty shootout (managed offline)

### Display
- Winner shown with 🏆 CHAMPIONS banner
- Final score recorded in system

## Score Entry

### Requirements
- Both home and away goals must be entered
- Scores must be non-negative integers (0, 1, 2, ...)
- Match marked COMPLETED only when both scores entered

### Score Updates
- Admin can edit scores even after initial entry
- Changes logged in audit trail
- Standings automatically recalculate

## Match Status

| Status | Description |
|--------|-------------|
| `SCHEDULED` | Match not yet played |
| `LIVE` | Match in progress (optional) |
| `COMPLETED` | Final score entered |
