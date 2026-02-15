# Meeting Action Items Tracker

A web app for turning meeting transcripts into actionable tasks. Paste a meeting transcript and get a structured list of action items with task, owner, and due date — then manage them with tags, completion status, and transcript history.

## Problem Statement (Original Task)

> Build a web app where I can:
> - Paste a meeting transcript (text is enough)
> - Get a list of action items (task + owner if possible + due date if found)
> - Edit, add, and delete action items
> - Mark items as done
> - See a simple history of the last 5 transcripts I processed


## Features

### Core (per requirements)

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Paste meeting transcript | ✓ | Textarea in **Workspace** with styled input |
| Get action items (task, owner, due date) | ✓ | POST transcript → API extracts and returns structured items |
| Edit, add, and delete action items | ✓ | Add via "+ Add item" form; delete via trash icon per item; **tags** editable (add/remove inline) |
| Mark items as done | ✓ | Checkbox toggles completion (strikethrough + status) |
| Transcript history | ✓ | **Recent Transcripts** card + expandable modal, loaded from API |

### Extended ("make it your own")

| Feature | Implementation |
|---------|----------------|
| **Tags (editable)** | Add and remove tags inline per action item — click tag ✕ to remove, type new tag + Enter to add. Tags persist via API. |
| **Filters (open/done)** | Filter chips: All, Open, Completed — filter action items by status |
| **Delete transcripts** | Trash icon on each transcript with confirmation modal |
| **Insights** | Dedicated tab with aggregate stats (Total Transcripts, Total Tasks, Completed, Open, Completion Rate) |
| **Polished UI** | Indigo/blue gradient theme, loaders, modals, improved transcript input |

## Tech Stack

- **React 19** + **TypeScript** + **Vite 7**
- **Tailwind CSS 4** for styling
- Backend API (URL configurable via `VITE_API_URL`)

## Project Structure

```
meeting/
├── src/
│   ├── App.tsx              # Shell, tabs (Workspace / Insights)
│   ├── main.tsx
│   ├── index.css            # Tailwind + bar-bounce keyframe
│   ├── types.ts             # ActionItem, Transcript
│   └── components/
│       ├── Workspace.tsx         # Orchestrates state, API calls, layout
│       ├── ActionItemsSection.tsx # Filters, add form, action item list
│       ├── ActionItemRow.tsx     # Single action item (task, tags, checkbox, delete)
│       ├── RecentTranscripts.tsx # History card with expand/delete
│       ├── TranscriptsModal.tsx  # Expandable transcripts modal
│       ├── DeleteTranscriptModal.tsx # Delete confirmation
│       ├── BarLoader.tsx         # Reusable bar-chart loader
│       └── Insights.tsx          # Aggregate stats across all transcripts
├── .env                  # VITE_API_URL (API base URL)
└── package.json
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- Backend API running (see API section)

### Install & Run

```bash
cd meeting
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Build

```bash
npm run build
npm run preview
```

## Environment

Create `.env` in the `meeting` directory:

```
VITE_API_URL=http://localhost:4000
```

Fallback: `http://localhost:4000` if not set.

## API

The frontend expects a backend with these endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/transcripts` | List all transcripts (history) |
| `POST` | `/api/transcripts` | Submit transcript, get extracted action items. Response should include `id` or `transcriptId` and `items`. |
| `DELETE` | `/api/transcripts/:id` | Delete a transcript |
| `GET` | `/api/items` | List items (optional; items come from transcript response) |
| `POST` | `/api/items` | Create item. Body: `{ task, transcriptId, owner?, dueDate? }` |
| `PUT` / `PATCH` | `/api/items/:id` | Update item (e.g. `completed`, `tags`) |
| `DELETE` | `/api/items/:id` | Delete an action item |

## Workspace UI

- **Stats** – Total tasks, open, completed
- **Meeting Transcript** – Paste area + "Extract Action Items" button
- **Recent Transcripts** – History list with expand icon (modal), delete icon (with confirmation)
- **Action Items** – Filter chips (All, Open, Completed), "+ Add item" button, each item: checkbox, task, owner, due date, tags (+ add inline), status, delete icon

## Insights Tab

Aggregates all transcripts and shows:

- Total Transcripts
- Total Tasks
- Completed Tasks
- Open Tasks
- Completion Rate (%)

Shows a bar-chart style loader while data is loading.
