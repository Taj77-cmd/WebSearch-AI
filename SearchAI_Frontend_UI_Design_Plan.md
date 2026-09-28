# SearchAI Frontend --- UI Design Plan Summary

## 🎨 Design Vision: "Terminal-Native Research Interface"

A coder/hacker-themed interface that feels like a powerful CLI tool with
a modern GUI --- dark, technical, impressive, and uniquely
**developer-first**.

------------------------------------------------------------------------

## 📋 Core Requirements Addressed

  -----------------------------------------------------------------------
  Requirement                         Solution
  ----------------------------------- -----------------------------------
  **Sources as clickable links**      `SourceLinks` component renders
                                      extracted `[Title](URL)` pairs as
                                      clickable cards with external-link
                                      icons and hover previews.

  **Sessions area with UUID**         Sidebar with collapsible session
                                      list; each session gets UUID v4 on
                                      creation, passed as `session_id` to
                                      API.

  **Smooth, interactive, unique**     Typewriter streaming, matrix rain
                                      background, glitch effects,
                                      scanlines, command palette
                                      (`Cmd+K`), keyboard shortcuts.

  **Coder theme**                     CSS variable-based terminal theme
                                      (green-on-dark), JetBrains Mono,
                                      Monokai syntax highlighting, sharp
                                      borders.
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 🛠️ Tech Stack

  Layer           Choice
  --------------- ----------------------------------------------------
  **Framework**   React 18 + TypeScript
  **Build**       Vite
  **Styling**     Tailwind CSS + CSS Variables (theme tokens)
  **State**       Zustand (UI) + React Query/TanStack Query (server)
  **Markdown**    react-markdown + remark-gfm + rehype-highlight
  **Animation**   Framer Motion + custom CSS keyframes
  **Icons**       lucide-react

------------------------------------------------------------------------

## 🧱 Component Architecture

``` text
src/
├── components/
│   ├── layout/       # AppShell, Sidebar, Header, TerminalFrame
│   ├── chat/         # ChatView, MessageList, MessageBubble, MessageContent,
│   │                 # SourceLinks, InputArea, StreamingResponse
│   ├── sessions/     # SessionList, SessionItem, NewSessionModal, ContextMenu
│   ├── prompt/       # PromptRephraser, RephraserOverlay, PromptHistory
│   └── ui/           # TerminalButton, TerminalInput, Scanlines, Cursor,
│                     # GlitchText, MatrixRain
├── hooks/            # useSessions, useChat, usePromptRephraser,
│                     # useKeyboardShortcuts
├── services/         # api.ts (Axios), endpoints.ts, sessionStorage.ts
├── stores/           # useSessionStore, useUIStore, usePromptStore (Zustand)
└── types/            # API, Session, Message, SourceLink types
```

------------------------------------------------------------------------

## 🔄 Key Data Flows

### Session Creation

``` text
New Chat
   ↓
Generate UUID v4
   ↓
Create Session Object
   ↓
Persist localStorage
   ↓
Set Active
   ↓
Render
```

### Chat Response with Sources

``` text
User Input
   ↓
Optimistic UI
   ↓
POST /chatModel (with session_id)
   ↓
Stream/Receive Response
   ↓
Parse content + extract [Title](URL) sources
   ↓
Render MessageContent + SourceLinks
   ↓
Persist to session
```

------------------------------------------------------------------------

## ⚡ Impressive UX Features

  -----------------------------------------------------------------------
  Feature                             Description
  ----------------------------------- -----------------------------------
  **Terminal Boot Animation**         Simulated boot sequence on first
                                      load

  **Typewriter Streaming**            Character-by-character response
                                      with variable speed

  **Matrix Rain Background**          Subtle, toggleable, respects
                                      `prefers-reduced-motion`

  **Command Palette**                 `Cmd+K` --- searchable actions,
                                      sessions, settings

  **Glitch Header**                   `"SearchAI"` logo glitches on hover

  **Scanlines**                       Animated CRT overlay (15% opacity)

  **Source Hover Preview**            Hover link → tooltip with favicon,
                                      domain, meta

  **Keyboard-First**                  10+ shortcuts (`Cmd+N`, `Cmd+B`,
                                      `Cmd+Shift+R`, etc.)
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 📦 Implementation Phases (3--4 weeks)

  -----------------------------------------------------------------------
  Phase                   Focus                   Duration
  ----------------------- ----------------------- -----------------------
  **1. Foundation**       Vite + React + TS +     Week 1
                          Tailwind, theme system, 
                          terminal components,    
                          API layer               

  **2. Core Chat**        Message rendering,      Week 1--2
                          markdown, syntax        
                          highlighting,           
                          typewriter, source      
                          links                   

  **3. Sessions**         Sidebar, persistence,   Week 2
                          CRUD, search, keyboard  
                          nav, context menus      

  **4. Prompt Rephraser** Rephrase button, modal, Week 2
                          diff view, "Use         
                          Rephrased", prompt      
                          history                 

  **5. Polish**           Boot animation, matrix  Week 3
                          rain, glitch, command   
                          palette, settings, PWA  

  **6. Advanced**         Streaming (if backend   Week 3--4
                          adds SSE), branching,   
                          export/share, analytics 
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 🔑 Critical Integration Points with Your Backend

### API Payload

Matches your `AgentDetails`:

``` typescript
interface ChatPayload {
  user_id: number;           // From session/user context
  session_id: string;        // UUID v4 from frontend session
  model: string;             // e.g., "gemini-2.0-flash-001"
  prompt: string;            // User input (or rephrased)
  best_toggle: 0 | 1;        // Single agent vs Team mode
}
```

### Response Handling

``` typescript
interface ChatResponse {
  response: string;          // Full markdown + sources section
  session_id: string;        // Echo back
  user_id: number;
  Links: Array<{
    title: string;
    url: string;
  }>;                        // Pre-parsed sources
}
```

### Source Extraction

The plan includes a `parseAgentResponse()` utility that:

1.  Splits the response on `"Sources and references:"` or
    `"📚 Sources"`.
2.  Parses `[Title](URL) | [Title2](URL2)` format.
3.  Matches your backend's exact output format.

------------------------------------------------------------------------

## ❓ Before I Start --- Quick Confirmations

1.  **Framework:** React + TypeScript + Vite + Tailwind OK? (Best for
    this design)
2.  **API Base URL:** `http://localhost:8000` (or should I use an
    environment variable)?
3.  **User ID:** Hardcode for now (e.g., `1`) or add simple auth later?
4.  **Streaming:** Your backend currently returns the full response.
    Want me to prepare for SSE/WebSocket streaming later?
5.  **Fonts:** Self-host JetBrains Mono + IBM Plex Sans, or use Google
    Fonts CDN?
6.  **PWA/Offline:** Include service worker for offline session viewing?

------------------------------------------------------------------------

## 🚀 Overall Design Direction

The interface should feel less like a conventional chatbot and more like
a **developer-grade research terminal**:

-   **Dark-first visual language**
-   **Terminal-inspired interactions**
-   **Research-oriented source presentation**
-   **Keyboard-first navigation**
-   **Highly responsive micro-interactions**
-   **Modern GUI layered over a CLI aesthetic**
-   **Persistent session-based workflow**
-   **Future-ready streaming architecture**

The goal is a distinctive SearchAI experience rather than another
conventional chat interface.
