# Mark's Production Tools — Full-Stack Setup Guide

## What's in this package

```
marks-production-tools/
├── server.js               ← Node/Express backend + SQLite API
├── package.json            ← dependencies list
├── .gitignore
├── db/                     ← auto-created on first run, holds shows.db
└── public/                 ← all your HTML apps (served by Express)
    ├── index.html
    ├── Run_Sheet_App.html
    ├── Master_Stage_Plot_Suite.html
    └── Script_Supervisor_App.html
```

---

## Step 1 — Install Node.js (if you haven't already)

Download and install from https://nodejs.org  
Choose the **LTS** version. This also installs `npm`.

To check it worked, open a terminal and run:
```
node --version
npm --version
```
Both should print version numbers.

---

## Step 2 — Put the files on your computer

Copy the entire `marks-production-tools/` folder somewhere on your computer,
for example your Desktop or Documents folder.

---

## Step 3 — Install dependencies

Open a terminal, navigate into the project folder, and run:

```bash
cd path/to/marks-production-tools
npm install
```

This downloads Express, better-sqlite3, and cors into a `node_modules/` folder.
It only needs to run once (or again after pulling updates).

---

## Step 4 — Start the server

```bash
node server.js
```

You should see:
```
✅ Database ready at db/shows.db
🎬 Mark's Production Tools running at http://localhost:3000
```

The `db/shows.db` SQLite file is created automatically on first launch.

---

## Step 5 — Open in your browser

Go to: **http://localhost:3000**

Your hub page loads. Click any tool — they're all served by Express now.

---

## How the Save/Load UI works (all three apps)

Each app now has a **Cloud Save / Load** panel instead of the old file buttons:

| Button | What it does |
|--------|--------------|
| **☁️ Save** | Creates a new entry in the database with the current show name |
| **🔄 Update** | Overwrites the currently-open project (same ID) |
| **📂 Open Selected** | Loads the project selected in the dropdown |
| **🗑️ Delete Selected** | Permanently removes a project from the database |

> **Tip:** Type a show name in the text field *before* hitting Save.
> After loading a project, "Update" will write back to the same row.

---

## API Endpoints (for reference / future use)

| Method | URL | Purpose |
|--------|-----|---------|
| GET | `/api/projects?app_type=runsheet` | List all run sheet projects |
| GET | `/api/projects?app_type=stageplot` | List all stage plot projects |
| GET | `/api/projects?app_type=script` | List all script projects |
| GET | `/api/projects/:id` | Fetch a single project + its full payload |
| POST | `/api/projects` | Create a new project |
| PUT | `/api/projects/:id` | Update an existing project |
| DELETE | `/api/projects/:id` | Delete a project |

`app_type` values: `runsheet` · `stageplot` · `script`

---

## Auto-restart during development (optional)

Install nodemon globally so the server restarts when you edit server.js:

```bash
npm install -g nodemon
nodemon server.js
```

---

## Stopping the server

Press `Ctrl + C` in the terminal window where it's running.

---

## Backing up your data

Your entire database is the single file `db/shows.db`.  
Copy it anywhere to back up all shows across all three apps.

---

## Troubleshooting

**Port 3000 already in use:**  
Change `const PORT = 3000;` in `server.js` to another number (e.g. `3001`).

**`better-sqlite3` fails to install on Windows:**  
Run `npm install --global windows-build-tools` first (requires admin terminal),
then `npm install` again.

**App shows "loading..." forever in the dropdown:**  
Make sure `node server.js` is running and you're visiting `http://localhost:3000`,
not opening the HTML files directly from Finder/Explorer (that bypasses the server).
