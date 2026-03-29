# ⚽ ACC Futsal League - Auction & League Manager

Live link : [text](https://accpls2-nidan.netlify.app/)

![React](https://img.shields.io/badge/React-18.2+-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4+-38B2AC?logo=tailwindcss)
![DaisyUI](https://img.shields.io/badge/DaisyUI-4.0+-5A0EF8)

A real-time tournament management web application for **ACC Community Futsal League Season 2**. Built for live auction management, league standings, and match tracking.

## 🎯 Features

### Auction Module

- 🎰 Random player spinner for each position (GK, DEF, MID, FWD)
- 💰 Dynamic bid increments (৳1,000 under ৳10K, ৳2,000 above)
- 👥 Team budget tracking (৳150,000 per team)
- 📋 Squad constraints (Max 8 players, 1 GK, 1 Alumni)
- ↩️ Undo last sale functionality
- 📺 Live display page optimized for projectors

### League Module

- 📊 Auto-calculated standings with tiebreakers
- 📅 5-team round-robin schedule (10 matches)
- 🏆 Final match between top 2 teams
- 📈 Form tracking (last 5 results)

### Admin Panel

- 🔐 Passcode-protected access
- 📝 Full control over auction flow
- ⚡ Real-time score entry
- 💾 Data export/import functionality
- 🗑️ Reset capability with confirmation

## 📋 Prerequisites

- Node.js 18+
- npm or yarn

## 🚀 Installation

```bash
# Clone the repository
git clone <repository-url>
cd acc-futsal-league

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔧 Environment Variables

Create a `.env` file in the root directory (optional - has default):

```env

```

> **Default Admin Passcode:** `847291`

## 📜 Available Scripts

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start development server |
| `npm run build`   | Build for production     |
| `npm run preview` | Preview production build |

## 🗺️ Routes

| Route            | Description                        | Access    |
| ---------------- | ---------------------------------- | --------- |
| `/`              | Home page with overview            | Public    |
| `/live`          | Live auction display for projector | Public    |
| `/auction`       | Player pool and team rosters       | Public    |
| `/league`        | Standings and schedule             | Public    |
| `/teams/:teamId` | Individual team details            | Public    |
| `/admin`         | Admin control panel                | Protected |

## 🔑 Admin Access

1. Navigate to `/admin`
2. Enter the 6-digit passcode (check `.env` file or ask the administrator)
3. Session lasts 24 hours

> **Default passcode:** `847291` (change this in production!)

### Pre-configured Team Owners:

| Team              | Owner          |
| ----------------- | -------------- |
| Team Rabies 🦊    | Sami           |
| Meow - meoW FC 🐱 | Ashik          |
| Team Nazi ⚡      | Bkash (Khalid) |
| Goal Diggers ⛏️   | Sadid          |
| Team Crazy 🤪     | Fardin         |

### Admin Capabilities

- Start/Pause/End auction
- Select players for bidding
- Place bids on behalf of teams
- Sell players or mark as unsold
- Undo last sale
- Enter match scores
- Update team owner names
- Export/Import data

## 🎨 Theme

The app uses DaisyUI with custom ACC Futsal themes:

- Light mode: `accfutsal`
- Dark mode: `accfutsaldark`

## 💾 Data Backup

### Export Data

1. Go to Admin Panel → Data tab
2. Click "Export Full Backup (JSON)"
3. Save the downloaded file

### Import Data

1. Go to Admin Panel → Data tab
2. Click the file input under "Import Data"
3. Select a previously exported JSON file

## 🏆 Teams

| Team           | Emoji | Color  |
| -------------- | ----- | ------ |
| Team Rabies    | 🦊    | Red    |
| Meow - meoW FC | 🐱    | Purple |
| Team Nazi      | ⚡    | Green  |
| Goal Diggers   | ⛏️    | Amber  |
| Team Crazy     | 🤪    | Blue   |

## 📖 Documentation

- [Architecture Guide](./docs/ARCHITECTURE.md)
- [Auction Rules](./docs/AUCTION_RULES.md)
- [League Rules](./docs/LEAGUE_RULES.md)
- [Admin Guide](./docs/ADMIN_GUIDE.md)
- [Firebase Setup Guide](./docs/FIREBASE_SETUP_GUIDE.md) ⭐ NEW - Step by step!
- [Firebase Migration Plan](./docs/PHASE2_FIREBASE_PLAN.md)

## 🛠️ Tech Stack

- **Frontend:** React 18 with TypeScript
- **Build Tool:** Vite 5
- **Styling:** Tailwind CSS 3.4 + DaisyUI 4
- **Routing:** React Router 6
- **Date Handling:** date-fns
- **Icons:** Lucide React
- **State:** React Context + useReducer

## 📝 License

MIT License - Built for ACC Community

## ❤️ Credits

Made with love for the ACC Community Futsal League Season 2.
