# Google Docs Lite — Front End Engineering-II Evaluation Project

A modern, responsive document management and rich text editing Single Page Application (SPA) built with React 19, React Router v7, Context API, Zustand, and Supabase PostgreSQL.

---

## 📋 Syllabus Topic-to-Feature Mapping (FEE-II)

| Syllabus Requirement | Implementation in Google Docs Lite | Key Source Files |
| :--- | :--- | :--- |
| **React Router / SPA Navigation** | Multi-route nested SPA architecture (`/dashboard`, `/my-documents`, `/shared`, `/trash`, `/settings`, `/documents/:id`, `/login`, `/register`, `*`). Responsive Sidebar & Top Navbar navigation with active state indicators. | [`App.jsx`](src/App.jsx), [`Sidebar.jsx`](src/components/Sidebar.jsx), [`Navbar.jsx`](src/components/Navbar.jsx) |
| **Protected Routes & Auth Guards** | Client-side route protection checking session readiness with loading spinner and redirect with state memory. | [`ProtectedRoute.jsx`](src/components/ProtectedRoute.jsx), [`useAuth.js`](src/hooks/useAuth.js) |
| **Context API & Global State** | Dedicated context providers for cross-cutting application concerns: Auth session (`AuthContext` + `useReducer`), Color Theme (`ThemeContext`), and Toast Notification Queue (`ToastContext`). | [`AuthProvider.jsx`](src/context/AuthProvider.jsx), [`ThemeProvider.jsx`](src/context/ThemeProvider.jsx), [`ToastProvider.jsx`](src/context/ToastProvider.jsx) |
| **Zustand State Store** | High-performance isolated store for active document editor session (dirty tracking, auto-save status, retry payload, word & character counters) without causing full-tree Context re-renders. | [`documentStore.js`](src/store/documentStore.js), [`Editor.jsx`](src/pages/Editor.jsx) |
| **Local vs Global State** | Rigorous architectural division: Context API for identity/theme, Zustand for editor runtime, and local `useState`/`useRef` for UI modals, dropdowns, and contentEditable DOM binding. | Codebase architectural design pattern |
| **Forms & Input Validation** | Reusable `InputField` with floating labels, required indicators, inline error alerts, and `aria-invalid`/`aria-describedby` accessibility attributes. Complete validation on Login and Registration. | [`InputField.jsx`](src/components/InputField.jsx), [`Login.jsx`](src/pages/Login.jsx), [`Register.jsx`](src/pages/Register.jsx) |
| **Interactive Modals & Menus** | Accessible modal dialogs with Escape key and backdrop dismissal (`CreateDocModal`, `ShareDocModal`, `ConfirmModal`, `VersionHistoryModal`), and keyboard-friendly action dropdowns. | [`Modal.jsx`](src/components/Modal.jsx), [`DropdownMenu.jsx`](src/components/DropdownMenu.jsx) |
| **Debounce & Search Optimization** | Custom `useDebounce` hook delaying search queries by 350ms to prevent redundant database queries and race conditions during rapid typing. | [`useDebounce.js`](src/hooks/useDebounce.js), [`useDocuments.js`](src/hooks/useDocuments.js) |
| **Filter, Sort & Pagination** | Filtering by view (All, Starred, Owned, Shared, Trash); multi-field sorting (Last Modified, Title A-Z); and server-ready pagination controls with page size selector. | [`useDocuments.js`](src/hooks/useDocuments.js), [`Pagination.jsx`](src/components/Pagination.jsx), [`Dashboard.jsx`](src/pages/Dashboard.jsx) |
| **REST APIs & Backend Integration** | Centralized API client (`api.js`) targeting Supabase PostgreSQL Cloud with Row Level Security (RLS) policies, with resilient, user-isolated local database emulation when offline. | [`api.js`](src/services/api.js), [`supabase.js`](src/services/supabase.js), [`supabase-schema.sql`](supabase-schema.sql) |
| **Async Loading & Error States** | CSS shimmer skeleton cards during loading, error banners with safe manual retry, and auto-save concurrency tracking to prevent stale request overwrites. | [`Dashboard.jsx`](src/pages/Dashboard.jsx), [`Editor.jsx`](src/pages/Editor.jsx), [`index.css`](src/index.css) |
| **Dark & Light Mode System** | Design token system with CSS custom properties (`--bg`, `--surface`, `--teal`, `--clay`), OS system theme detection (`prefers-color-scheme`), and persistent user toggle. | [`ThemeContext.js`](src/context/ThemeContext.js), [`index.css`](src/index.css) |
| **Document Starter Templates** | 4 pre-configured rich text templates: Blank Document, Meeting Notes, Project Report, and Study Notes. | [`templates.js`](src/utils/templates.js), [`CreateDocModal.jsx`](src/components/CreateDocModal.jsx) |
| **Version History & Restore** | Snapshot creation system allowing users to record revisions, view past states with timestamps, and restore historical snapshots into the live editor. | [`VersionHistoryModal.jsx`](src/components/VersionHistoryModal.jsx), [`api.js`](src/services/api.js) |

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open your browser to `http://localhost:5173`.

### 3. Build & Lint (0 Errors, 0 Warnings Verified)
```bash
npm run lint
npm run build
```

---

## 🔑 Authentication & Evaluation Demo Credentials

The application includes a pre-seeded evaluator account for fast, frictionless grading:

- **Email:** `demo@gdocs.lite`
- **Password:** `password123`
*(Or click the "Fill Demo" button on the login screen to autofill instantly).*

You can also register a new account on `/register` to test:
- Unique user ID generation
- User document isolation (User A cannot see or edit User B's documents)
- Password match and format validation

---

## 🗄️ Supabase PostgreSQL Setup (Optional Cloud Mode)

Google Docs Lite is built to run both **online with Supabase Cloud** and **offline with the built-in isolated database engine**. The app transparently indicates its connection mode in the sidebar and Settings tab.

To link your real Supabase project:

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open `supabase-schema.sql` from this repository, paste the contents, and click **Run**.
   - This sets up the `profiles`, `documents`, `document_shares`, and `document_versions` tables.
   - It enables **Row Level Security (RLS)** ensuring users only query documents they own or have shared access to.
4. Copy your **Project URL** and **Anon Public Key** from *Project Settings > API*.
5. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
6. Set your credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...
   ```
7. Restart the Vite server (`npm run dev`). The status badge in the sidebar will switch to **"Supabase Cloud"**.

---

## 🏗️ State Architecture & Design Rationale

During the evaluation, you may be asked why multiple state tools are used. Here is the architectural reasoning:

1. **Context API (`useReducer` / `useState`)**:
   - Used for **Application-Wide, Low-Frequency Concerns** (Authentication session, Color theme, Toast notification queue).
   - These values are needed by components across disparate subtrees, but they do not change on every keystroke.

2. **Zustand (`useDocumentStore`)**:
   - Used for **High-Frequency Document Editor Runtime State** (save status transitions, keystroke character/word count, dirty state tracking, failed retry queue).
   - In React, running high-frequency typing through a top-level Context would re-render the entire component tree. Zustand solves this by providing selector-based subscriptions so only the relevant status badges and footer metrics re-render.

3. **Local Component State (`useState`, `useRef`)**:
   - Used for ephemeral UI states: modal visibility, dropdown open/close toggles, search input values, and direct DOM binding (`useRef`) to the `contentEditable` paper canvas.

---

## 🎬 3-Minute Evaluation Presentation Script

Follow this demo sequence during your exam:

1. **Authentication & Validation (0:00 - 0:45)**
   - Show the `/login` screen. Click "Log in" with empty fields to show required validation errors.
   - Click the "Fill Demo" pill and log in as `demo@gdocs.lite`.
   - Explain how `AuthProvider` maintains session persistence across browser refreshes.

2. **Dashboard Navigation, Search & Pagination (0:45 - 1:30)**
   - Show the responsive sidebar (`All Documents`, `My Documents`, `Shared with Me`, `Starred`, `Trash`, `Settings`).
   - Type into the search bar to demonstrate **debounced filtering** (waits 350ms before filtering).
   - Demonstrate sorting by Title (A-Z) and Last Modified.
   - Show the pagination controls and items per page selector.

3. **Document Templates & CRUD (1:30 - 2:15)**
   - Click `+ New Document`. Select the **"Meeting Notes"** template.
   - Show the document opening in the Editor with pre-populated rich text.
   - Type in the title and body. Point out the live word & character counter.
   - Show the save status indicator smoothly transitioning from **"Saving..."** to **"Saved to cloud"**.

4. **Dark Mode, Version History & Sharing (2:15 - 3:00)**
   - Click the theme toggle icon (`🌙` / `☀️`) in the top navigation bar to demonstrate the high-contrast dark theme.
   - Click **"🕒 History"** in the editor toolbar, take a snapshot, and demonstrate revision inspection and restore.
   - Click **"👥 Share"** to show the collaborator invitation dialog and role management (Viewer / Editor).
   - Delete a document to show the **Trash bin** and **Restore** functionality.
