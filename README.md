# MySafar — Track Your Journey

Your Personal Competition & Internship Tracker.

Manually track every opportunity you apply to — competitions, hackathons, internships, and more. See what's pending, what you've applied to, and what's done — all in one place.

## Quick Start

### Prerequisites
- Node.js 18+ installed ([nodejs.org](https://nodejs.org))
- A MongoDB Atlas account (free)

### Step 1: Get MongoDB Atlas (Free)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Click **"Try Free"** → Sign up with Google or email
3. Choose the **FREE "M0"** cluster
4. Create a database user and **save the password**
5. Set up network access (add your IP or `0.0.0.0/0` for dev)
6. Copy the connection string

### Step 2: Configure Environment

Edit `server/.env`:

```env
MONGODB_URI=mongodb+srv://your_user:YOUR_PASSWORD@cluster.xxxxx.mongodb.net/mysafar-db?retryWrites=true&w=majority
PORT=5000
```

### Step 3: Start the App

**Terminal 1 — Backend:**
```bash
cd server
npm start
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Features

### 📊 Kanban Dashboard
Two tabs — **Competitions** and **Internships** — each with three sections:
- **Yet to Apply** — sorted by deadline urgency
- **Applied** — track applications, referrals, and OA status
- **Completed** — selected, rejected, or done

### 🖱️ Drag & Drop
Move entries between sections by dragging. Status updates automatically.

### ✍️ Manual Entry
Add opportunities with: name, link, deadline, notes, resume version, type, and status.

### 📎 Resume Manager
Upload and manage different resume versions. Link them to specific applications.

### 👤 Profile
Keep your profile info for reference.

## Tech Stack

- **Frontend:** React 19 + Vite
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas
- **Styling:** Vanilla CSS (premium dark theme)
