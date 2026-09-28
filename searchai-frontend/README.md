# SearchAI - Developer-Grade Research Terminal

A modern, terminal-themed research interface powered by **Gemini 2.0** and **Agno multi-agent teams** with real-time WebSocket streaming.

## 🎯 Overview

SearchAI is a developer-focused research tool that combines multiple AI agents (DuckDuckGo, HackerNews, ArXiv, SerpAPI, YFinance) into a collaborative team for comprehensive research. The frontend is a React/TypeScript SPA with a terminal aesthetic, built for speed and keyboard-driven workflows.

## 🏗️ Architecture

```
┌─────────────────────┐     ┌─────────────────────┐
│   FRONTEND          │     │   BACKEND           │
│   (React + Vite)    │◀───▶│   (FastAPI + Agno)  │
│   Port: 5173        │     │   Port: 8000        │
└─────────────────────┘     └─────────────────────┘
```

- **Frontend**: Single-page application with WebSocket streaming
- **Backend**: FastAPI server orchestrating Agno agents/teams
- **Storage**: localStorage (frontend) + SQLite (backend sessions)

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Multi-Agent Team Mode** | 5 specialized agents collaborate on research |
| **Real-time Streaming** | Token-by-token WebSocket responses |
| **Session Management** | Create, rename, delete, search sessions |
| **Command Palette** | ⌘K for quick actions (like VS Code) |
| **Keyboard Shortcuts** | ⌘N new session, ⌘B sidebar, ⌘K palette |
| **Terminal Aesthetic** | Matrix rain, scanlines, green-on-dark theme |
| **Delete All Sessions** | One-click bulk deletion with confirmation |
| **Prompt Rephraser** | Optimize queries for better results |
| **Citations & Sources** | Grounded responses with clickable links |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Gemini API key (Google AI Studio)
- SerpAPI key (optional, for SerpAPI agent)

### Backend Setup
```bash
cd searchai-frontend/..  # project root
python -m venv env
source env/bin/activate  # or env\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env  # add your API keys
python -m uvicorn searchAI:app --reload --port 8000
```

### Frontend Setup
```bash
cd searchai-frontend
npm install
npm run dev
```

Open **http://localhost:5173** — Vite proxies API calls to `localhost:8000`.

## 🎮 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` | Open Command Palette |
| `⌘N` | New Research Session |
| `⌘B` | Toggle Sidebar |
| `⌘⇧⌫` | Delete All Sessions |
| `⌘Enter` | Send message (in textarea) |
| `Esc` | Cancel streaming / Close modals |

## 📁 Project Structure

```
searchai-frontend/
├── src/
│   ├── main.tsx              # Entry point
│   ├── App.tsx               # Root component & logic
│   ├── components/
│   │   ├── layout/           # AppShell, Header, Sidebar, Footer
│   │   ├── chat/             # ChatView, MessageList, InputArea
│   │   ├── sessions/         # SessionList, SessionItem, NewSessionModal
│   │   ├── ui/               # Button, CommandPalette, MatrixRain, etc.
│   │   └── prompt/           # PromptRephraser, PromptHistory
│   ├── hooks/                # useSessions, useChat, useKeyboardShortcuts
│   ├── stores/               # Zustand stores (useSessionStore, useUIStore)
│   ├── lib/                  # api.ts, websocket.ts, storage.ts, utils.ts
│   ├── types/                # TypeScript interfaces
│   └── styles/               # Tailwind + tokens.css (design system)
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🔧 Configuration

### Environment Variables (Backend)
```bash
# .env
GEMINI_API_KEY=your_gemini_key
SERPAPI_API_KEY=your_serpapi_key  # optional
```

### Frontend Proxy (vite.config.ts)
```ts
server: {
  proxy: {
    '/chatModel': 'http://localhost:8000',
    '/ws': 'http://localhost:8000',
    '/health': 'http://localhost:8000',
    '/prompt-rephraser-v3': 'http://localhost:8000',
  }
}
```

## 🧪 Tech Stack & Rationale

| Category | Choice | Why |
|----------|--------|-----|
| **Framework** | React 18 | Mature, huge ecosystem, concurrent features |
| **Language** | TypeScript | Type safety for complex state (sessions, messages) |
| **Build Tool** | Vite | Instant HMR, fast builds, native ESM |
| **Styling** | Tailwind CSS | Design-system-driven, no context-switching |
| **State** | Zustand | Minimal boilerplate, no Context API hell |
| **Server State** | TanStack Query | Caching, deduping, optimistic updates |
| **Icons** | Lucide React | Tree-shakeable, consistent, 1000+ icons |
| **Animations** | Framer Motion | Declarative, performant, gesture support |
| **Toasts** | Sonner | Accessible, promise-based, stackable |
| **Markdown** | react-markdown + rehype-pretty-code | Syntax highlighting, GFM support |

## 🔐 Security Notes

- API keys only in backend `.env` (never in frontend)
- CORS configured for localhost development
- No authentication in current version — add auth for production

## 📦 Building for Production

```bash
# Frontend
cd searchai-frontend
npm run build  # outputs to dist/

# Backend
# Use a process manager (pm2, systemd) + reverse proxy (nginx)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with proper TypeScript types
4. Run `npm run lint` and `npx tsc --noEmit`
5. Submit a PR

## 📄 License

MIT License — feel free to use and modify.

---

**Built with** ❤️ **using** React, TypeScript, Vite, Tailwind, Zustand, Agno, and Gemini 2.0