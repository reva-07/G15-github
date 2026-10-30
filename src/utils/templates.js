/**
 * Document Starter Templates
 * High-value extra feature for Google Docs Lite
 */
export const TEMPLATES = [
  {
    id: "blank",
    name: "Blank document",
    icon: "📄",
    description: "Start fresh with a clean white page.",
    defaultTitle: "Untitled document",
    content: "<p>Start typing your thoughts here...</p>",
  },
  {
    id: "meeting-notes",
    name: "Meeting Notes",
    icon: "🗓️",
    description: "Structure meeting attendees, agenda, discussion, and action items.",
    defaultTitle: "Meeting Notes: Team Sync",
    content: `
      <h1>Team Sync Meeting</h1>
      <p><strong>Date:</strong> ${new Date().toLocaleDateString(undefined, { dateStyle: "long" })}</p>
      <p><strong>Attendees:</strong> [List attendees here]</p>
      <hr />
      <h2>Agenda</h2>
      <ul>
        <li>Review key metrics and deliverable milestones</li>
        <li>Identify blockers and resource dependencies</li>
        <li>Assign next sprint action items</li>
      </ul>
      <h2>Discussion & Decisions</h2>
      <p>Notes on key discussion points discussed during the sync...</p>
      <h2>Action Items</h2>
      <ul>
        <li><strong>[Name]:</strong> Implement review feedback by Wednesday</li>
        <li><strong>[Name]:</strong> Coordinate API deployment and documentation</li>
      </ul>
    `,
  },
  {
    id: "project-report",
    name: "Project Report",
    icon: "📊",
    description: "Academic or professional project report outline.",
    defaultTitle: "Project Report: System Evaluation",
    content: `
      <h1>Project Report: System Design & Evaluation</h1>
      <p><em>Author: Engineering Team</em></p>
      <hr />
      <h2>1. Executive Summary</h2>
      <p>Provide a high-level summary of the system architecture, motivation, and evaluated outcomes.</p>
      <h2>2. Problem Statement & Scope</h2>
      <p>Define the challenge being addressed and the functional requirements.</p>
      <h2>3. Technical Architecture</h2>
      <ul>
        <li><strong>Frontend SPA:</strong> React 19 + React Router v7</li>
        <li><strong>State Management:</strong> Context API + Zustand</li>
        <li><strong>Backend & Security:</strong> Supabase PostgreSQL + Row Level Security</li>
      </ul>
      <h2>4. Results & Key Learnings</h2>
      <p>Detail testing observations, performance measurements, and conclusions.</p>
    `,
  },
  {
    id: "study-notes",
    name: "Study Notes",
    icon: "📚",
    description: "Course lectures, key formulas, concepts, and review questions.",
    defaultTitle: "Course Notes: Module 1",
    content: `
      <h1>Course Lecture Notes</h1>
      <p><strong>Subject:</strong> Front End Engineering-II</p>
      <p><strong>Topic:</strong> Modern React SPA Architecture & State Patterns</p>
      <hr />
      <h2>Key Theoretical Concepts</h2>
      <ul>
        <li><strong>Declarative UI:</strong> State drives the view hierarchy.</li>
        <li><strong>Unidirectional Data Flow:</strong> Props flow down, events bubble up.</li>
        <li><strong>Memoization:</strong> useMemo and useCallback avoid costly redundant computations.</li>
      </ul>
      <h2>Exam Review Questions</h2>
      <ol>
        <li>Explain the difference between Context API and dedicated state stores like Zustand.</li>
        <li>How does Row Level Security (RLS) protect multi-tenant database records?</li>
      </ol>
    `,
  },
];
