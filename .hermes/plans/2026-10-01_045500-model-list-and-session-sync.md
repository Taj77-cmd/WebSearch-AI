# Plan: Backend-driven model list + session sync from searchAI.db

**Date:** 2026-10-01  
**Status:** Draft

---

## Goal

Make the frontend model list and session list come from the backend (FastAPI + searchAI.db) instead of being hardcoded / stored separately in browser localStorage.

---

## Current context / assumptions

### What we know from codebase inspection

**Backend (`searchAI.py`):**
- Single hardcoded model: `ModelId = "nvidia/nemotron-3-ultra-550b-a55b:free"` (line 31).
- `AgentDetails.model` field exists (line 50) but is **never used** — every agent creation path uses `ModelId` or a hardcoded `"gemini-2.0-flash-001"` string.
- Session data lives in `localdb/searchAI.db` via Agno's `SqliteDb`. Sessions are keyed by `session_id` + `user_id`.
- Two existing endpoints: `POST /chatModel` (HTTP) and `WS /ws/chat` (WebSocket). Both accept `model` in their payload but ignore it.
- No endpoint exists to list models or list sessions.

**Frontend model list (`src/lib/utils.ts`):**
- `AVAILABLE_MODELS` is a hardcoded `as const` array of 3 Gemini models (lines 119-123).
- `DEFAULT_MODEL = 'gemini-2.0-flash-001'` (line 118).
- `createSession()` in `storage.ts` hardcodes `model: 'gemini-2.0-flash-001'` (line 50).
- Components that render model selection: `Header.tsx`, `NewSessionModal.tsx` — both import `DEFAULT_MODEL` from utils.

**Frontend session storage (`src/lib/storage.ts` + `src/stores/useSessionStore.ts`):**
- Sessions are kept in browser `localStorage` under key `searchai_sessions`.
- Messages are kept in `localStorage` under key `searchai_msgs_{sessionId}`.
- `createSession`, `updateSession`, `deleteSession`, `getMessages`, `saveMessages` all read/write localStorage.
- The frontend and backend have **completely separate** session data stores — frontend never asks the backend for session history.

**Frontend session types (`src/types/session.ts`):**
```ts
interface Session {
  id: string;
  user_id: number;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  model: string;
  best_toggle: boolean;
}
interface Message {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  sources: SourceLink[] | null;
  created_at: string;
  is_streaming?: boolean;
}
```

### Assumptions / open questions

- The exact schema of `searchAI.db` (Agno's SqliteDb tables) is not inspected here. The plan assumes Agno stores messages per session in a queryable way. **Task 1 includes a DB schema inspection step.**
- User ID: frontend defaults to `1` (stored in localStorage `searchai_user_id`). We keep this convention.
- The `best_toggle` field in `Session` is `boolean`; the backend `AgentDetails.best_toggle` is `Literal[0, 1]`. The plan normalizes: backend API returns `best_toggle` as `boolean` for the frontend.

---

## Architecture / proposed approach

### Track A — Backend-driven model list

1. Add a `GET /models` endpoint that returns the canonical list of available models.
2. Fix the backend agent creation paths to **actually use** the `model` field from the request payload (both HTTP and WebSocket).
3. Add a frontend React hook (`useModels`) that fetches from `GET /models` and caches with react-query.
4. Replace the hardcoded `AVAILABLE_MODELS` / `DEFAULT_MODEL` exports from `utils.ts` with values driven by the hook. Components pick up the list via props/context.
5. The model list lives in one place: backend code. The frontend is purely a consumer.

### Track B — Session data from searchAI.db

1. Add `GET /sessions` — returns all sessions for the authenticated user (by `user_id` query param).
2. Add `GET /sessions/{session_id}/messages` — returns message history for a session.
3. Replace frontend `useSessions`'s `loadSessions()` to call `GET /sessions` instead of reading localStorage.
4. Replace frontend `useMessages`'s `loadMessages()` to call `GET /sessions/{id}/messages` instead of reading localStorage.
5. Keep localStorage as an optional offline cache (write-through) but make the source of truth the backend API. For now, we go straight to API (no cache layer) to keep the change minimal.

### What the session API response should look like

`GET /sessions?user_id=1` →
```json
[
  {
    "id": "abc-123",
    "user_id": 1,
    "title": "New Research Session",
    "created_at": "2026-09-30T10:00:00Z",
    "updated_at": "2026-09-30T11:00:00Z",
    "message_count": 5,
    "model": "gemini-2.0-flash-001",
    "best_toggle": false
  }
]
```

`GET /sessions/abc-123/messages` →
```json
[
  {
    "id": "msg-1",
    "session_id": "abc-123",
    "role": "user",
    "content": "What is Rust?",
    "sources": null,
    "created_at": "2026-09-30T10:01:00Z",
    "is_streaming": false
  },
  {
    "id": "msg-2",
    "session_id": "abc-123",
    "role": "assistant",
    "content": "Rust is a systems programming language...",
    "sources": [{"title": "Rust Book", "url": "https://rust-lang.org"}],
    "created_at": "2026-09-30T10:01:05Z",
    "is_streaming": false
  }
]
```

### Data flow after the change

```
Frontend Mount
  └─ useSessions().loadSessions()
       └─ GET /sessions?user_id=1  ← backend queries searchAI.db
            └─ populates useSessionStore.sessions

Frontend Session Select
  └─ useMessages(sessionId).loadMessages()
       └─ GET /sessions/{sessionId}/messages
            └─ populates useSessionStore.messages[sessionId]
```

---

## Step-by-step tasks

### Track A: Model list from backend

---

### Task A1 — Inspect searchAI.db schema

**Files touched:** none (read-only)  
**Estimated time:** 3 min

We need to know what Agno's `SqliteDb` creates so we can write correct session/message queries later (Track B). Run this in the repo root where `localdb/searchAI.db` lives:

```bash
cd /c/Users/Tejas\ Mittal/WebSearch-AI  # or D:/WebSearch-AI
python3 -c "
import sqlite3
conn = sqlite3.connect('localdb/searchAI.db')
cur = conn.cursor()
cur.execute(\"SELECT name FROM sqlite_master WHERE type='table'\")
tables = cur.fetchall()
print('Tables:', tables)
for (table,) in tables:
    cur.execute(f'PRAGMA table_info({table})')
    cols = cur.fetchall()
    print(f'\n--- {table} ---')
    for c in cols:
        print(c)
    cur.execute(f'SELECT COUNT(*) FROM {table}')
    print(f'Row count: {cur.fetchone()[0]}')
    cur.execute(f'SELECT * FROM {table} LIMIT 2')
    for row in cur.fetchall():
        print(row)
conn.close()
"
```

**Expected output:** A list of table names, their columns, row counts, and 2 sample rows each. This tells us which tables hold sessions and messages.

If the DB doesn't exist yet or is empty, create a test session via the API first, then re-run.

**Verification:** Command exits 0 and prints at least one table with columns.

---

### Task A2 — Add `GET /models` endpoint to backend

**Files touched:** `searchAI.py`  
**Estimated time:** 5 min

Add a Pydantic model for the response and a new endpoint. Insert after the existing endpoint definitions (after `/health`, around line 449).

```python
# In searchAI.py, add near the top with other Pydantic models (after line 67):

class ModelInfo(BaseModel):
    id: str
    name: str
    provider: str

class ModelsResponse(BaseModel):
    models: list[ModelInfo]

# Add this list as a module-level constant (near line 31, after ModelId):

AVAILABLE_BACKEND_MODELS = [
    ModelInfo(id="gemini-2.0-flash-001", name="Gemini 2.0 Flash", provider="Google"),
    ModelInfo(id="gemini-1.5-pro", name="Gemini 1.5 Pro", provider="Google"),
    ModelInfo(id="gemini-1.5-flash", name="Gemini 1.5 Flash", provider="Google"),
    ModelInfo(id="nvidia/nemotron-3-ultra-550b-a55b:free", name="Nemotron 3 Ultra", provider="OpenRouter"),
]

# Add the endpoint after /health (after line 449):

@app.get("/models", response_model=ModelsResponse)
def list_models():
    return ModelsResponse(models=AVAILABLE_BACKEND_MODELS)
```

**Why:** A single source of truth for the model list. The frontend asks once and renders whatever the backend says.

**Verification:**
```bash
curl -s http://localhost:8000/models | python3 -m json.tool
```
Expected: JSON array of 4 model objects with `id`, `name`, `provider`.

**Commit:** `feat: add GET /models endpoint`

---

### Task A3 — Actually use the `model` field in backend agent creation

**Files touched:** `searchAI.py`  
**Estimated time:** 8 min

Currently `AgentDetails.model` is accepted but ignored — every agent uses `ModelId` or a hardcoded string. Fix both the HTTP and WebSocket paths.

**HTTP path (`/chatModel`, lines 87-165):**  
Replace every occurrence of the hardcoded model ID in the agent constructors with `agent_details.model`. Specifically:

- Line 89: `model=OpenRouter(id=ModelId, ...)` → `model=OpenRouter(id=agent_details.model, ...)`
- Lines 108, 115, 123, 131, 139, 147 (the `best_toggle == 1` branch): all use `Gemini(id=ModelId)` or `Gemini(id="gemini-2.0-flash-001")` → use `Gemini(id=agent_details.model)`

**WebSocket path (`/ws/chat`, lines 262-343):**  
Same replacements:
- Line 264: `model=OpenRouter(id=ModelId, ...)` → `model=OpenRouter(id=model, ...)` (note: `model` is already the local variable from line 255)
- Lines 281, 289, 298, 307, 316, 325: all `Gemini(id="gemini-2.0-flash-001")` → `Gemini(id=model)`

**Verification:**
```bash
# Send a chat request with a different model and confirm the agent uses it
curl -s -X POST http://localhost:8000/chatModel \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "session_id": "0", "model": "gemini-1.5-flash", "prompt": "Say hello in one word", "best_toggle": 0}'
```
Expected: 200 response with `"response"` containing the agent's reply. (We can't easily verify *which* model was used from the outside, but the code path is now correct — a follow-up integration test could confirm.)

**Commit:** `fix: actually use request model field in agent creation`

---

### Task A4 — Add `useModels` hook on frontend

**Files touched:** `src/hooks/useModels.ts` (new), `src/hooks/index.ts`  
**Estimated time:** 5 min

Create a new hook that fetches the model list from the backend using react-query.

```ts
// src/hooks/useModels.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface BackendModel {
  id: string;
  name: string;
  provider: string;
}

export function useModels() {
  return useQuery<BackendModel[]>({
    queryKey: ['models'],
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_API_URL || ''}/models`);
      if (!resp.ok) throw new Error('Failed to fetch models');
      const data = await resp.json();
      return data.models;
    },
  });
}
```

Wire it into the hooks barrel:

```ts
// src/hooks/index.ts — add this line:
export { useModels, type BackendModel } from './useModels';
```

**Verification:** Start the dev server and the backend, then in the browser console:
```ts
const { data: models } = useModels();
console.log(models);
```
Expected: array of 4 model objects matching the backend response.

**Commit:** `feat: add useModels hook to fetch model list from backend`

---

### Task A5 — Replace hardcoded model list in frontend components

**Files touched:** `src/lib/utils.ts`, `src/components/layout/Header.tsx`, `src/components/sessions/NewSessionModal.tsx`, `src/App.tsx`  
**Estimated time:** 10 min

**Step 1 — `src/lib/utils.ts`:** Remove or deprecate `AVAILABLE_MODELS` and `DEFAULT_MODEL`. Keep `DEFAULT_MODEL` as a fallback constant that mirrors the backend's first model, but source it from the hook at the component level instead.

Actually — keep `utils.ts` focused on pure utilities. Remove model constants from it entirely:

```ts
// REMOVE these lines from src/lib/utils.ts (lines 118-123):
// export const DEFAULT_MODEL = 'gemini-2.0-flash-001';
// export const AVAILABLE_MODELS = [...]
```

**Step 2 — `src/App.tsx`:** Use `useModels` to drive `activeModel` initial state.

```tsx
// src/App.tsx — replace line 29:
// Before: const [activeModel, setActiveModel] = useState<string>(DEFAULT_MODEL);
// After:
const { data: models } = useModels();
const [activeModel, setActiveModel] = useState<string>(
  models?.[0]?.id || 'gemini-2.0-flash-001'  // fallback if backend unreachable
);
```

**Step 3 — `src/components/layout/Header.tsx`:** Accept `models` prop and pass to the model selector. Currently `Header` receives `activeModel` and `onChangeModel`. Add a `models: BackendModel[]` prop and use it in the dropdown.

**Step 4 — `src/components/sessions/NewSessionModal.tsx`:** Same treatment — accept `models` prop instead of reading `DEFAULT_MODEL` directly.

**Step 5 — Wire the prop through `AppShell` → `Header` / `NewSessionModal`.** Since `AppShell` already receives `activeModel` and `onChangeModel`, add `models` to its props and pass down.

**Verification:**
- Backend running with `/models` endpoint.
- Frontend dev server running.
- In the browser, the model dropdown in Header and NewSessionModal should show the 4 models from the backend.
- Changing the model in the dropdown should call `onChangeModel` with the selected model ID.

**Commit:** `feat: drive model list from backend via useModels hook`

---

### Track B: Session data from searchAI.db

---

### Task B1 — Add `GET /sessions` endpoint

**Files touched:** `searchAI.py`  
**Estimated time:** 5 min

This endpoint queries `searchAI.db` for sessions. The exact query depends on Task B1 (DB schema inspection). Assuming Agno stores session data in a table we can query:

```python
# In searchAI.py, add after the /models endpoint:

class SessionInfo(BaseModel):
    id: str
    user_id: int
    title: str
    created_at: str
    updated_at: str
    message_count: int
    model: str
    best_toggle: bool

class SessionsResponse(BaseModel):
    sessions: list[SessionInfo]

@app.get("/sessions", response_model=SessionsResponse)
def list_sessions(user_id: int = 1):
    # TODO: replace with actual query against searchAI.db
    # Placeholder until DB schema is known from Task B1
    return SessionsResponse(sessions=[])
```

**Important:** The actual implementation of this endpoint depends on the DB schema discovered in Task A1. The placeholder above lets us add the endpoint now; the query is filled in after schema inspection.

**Verification:**
```bash
curl -s "http://localhost:8000/sessions?user_id=1" | python3 -m json.tool
```
Expected: `{"sessions": []}` (empty until we have real data and the query is implemented).

**Commit:** `feat: add GET /sessions endpoint (stub)`

---

### Task B2 — Add `GET /sessions/{session_id}/messages` endpoint

**Files touched:** `searchAI.py`  
**Estimated time:** 5 min

```python
# In searchAI.py, add after the /sessions endpoint:

class MessageInfo(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    sources: list[dict[str, str]] | None
    created_at: str
    is_streaming: bool

class MessagesResponse(BaseModel):
    messages: list[MessageInfo]

@app.get("/sessions/{session_id}/messages", response_model=MessagesResponse)
def get_session_messages(session_id: str, user_id: int = 1):
    # TODO: replace with actual query against searchAI.db
    return MessagesResponse(messages=[])
```

**Again:** The actual query depends on the DB schema. The endpoint signature and response shape are correct; the body is filled in after Task A1.

**Verification:**
```bash
curl -s "http://localhost:8000/sessions/test-session-id/messages?user_id=1" | python3 -m json.tool
```
Expected: `{"messages": []}`.

**Commit:** `feat: add GET /sessions/{id}/messages endpoint (stub)`

---

### Task B3 — Implement the DB queries for sessions and messages

**Files touched:** `searchAI.py`  
**Estimated time:** 10 min

**Prerequisite:** Task A1 (DB schema inspection) must be done first.

Based on the schema found, fill in the actual queries for both endpoints from Tasks B1 and B2. Typical Agno SqliteDb schema has tables for agents, runs, messages, etc. The query should:

- For `/sessions`: select distinct sessions by `session_id` + `user_id`, with metadata (title, created_at, updated_at, message_count, model, best_toggle).
- For `/sessions/{id}/messages`: select all messages for that session, ordered by creation time.

If Agno's schema doesn't store `title`, `model`, or `best_toggle` directly, we may need to:
- Store those fields in a separate table we create, OR
- Derive them from what Agno stores, OR
- Keep a lightweight `sessions` metadata table in `searchAI.db` that the backend manages.

**Decision point:** If Agno's schema is insufficient, add a `session_metadata` table to `searchAI.db`:

```sql
CREATE TABLE IF NOT EXISTS session_metadata (
    session_id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL DEFAULT 'New Chat',
    model TEXT NOT NULL,
    best_toggle INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    message_count INTEGER NOT NULL DEFAULT 0
);
```

The backend writes to this table on session create/update. The frontend reads from it.

**Verification:** After implementing, seed a session via the API, then:
```bash
curl -s "http://localhost:8000/sessions?user_id=1" | python3 -m json.tool
curl -s "http://localhost:8000/sessions/<real-session-id>/messages?user_id=1" | python3 -m json.tool
```
Both should return non-empty data matching what was created.

**Commit:** `feat: implement DB queries for sessions and messages endpoints`

---

### Task B4 — Add `ApiClient` methods for sessions and messages

**Files touched:** `src/lib/api.ts`  
**Estimated time:** 3 min

Add methods to the `ApiClient` class:

```ts
// src/lib/api.ts — add to the ApiClient class:

async getSessions(userId: number): Promise<Session[]> {
  const resp = await this.request<{ sessions: Session[] }>(
    `/sessions?user_id=${userId}`
  );
  return resp.sessions;
}

async getSessionMessages(sessionId: string, userId: number): Promise<Message[]> {
  const resp = await this.request<{ messages: Message[] }>(
    `/sessions/${sessionId}/messages?user_id=${userId}`
  );
  return resp.messages;
}
```

Also add the types to `src/types/api.ts`:

```ts
// src/types/api.ts — these types already exist in session.ts;
// re-export or duplicate as needed. Prefer re-export:
export type { Session, Message } from '@/types/session';
```

**Verification:**
```ts
// In a component or test:
const sessions = await api.getSessions(1);
console.log(sessions); // array of Session objects
const messages = await api.getSessionMessages('abc-123', 1);
console.log(messages); // array of Message objects
```

**Commit:** `feat: add ApiClient methods for sessions and messages`

---

### Task B5 — Replace frontend session loading with API calls

**Files touched:** `src/hooks/useSessions.ts`, `src/hooks/useMessages` (inside `useSessions.ts`)  
**Estimated time:** 10 min

**`useSessions.ts` — `loadSessions`:**
```ts
// Before:
const loadSessions = useCallback(() => {
  const stored = getSessions();  // reads localStorage
  setSessions(stored);
  return stored;
}, [setSessions]);

// After:
const loadSessions = useCallback(async () => {
  const userId = getUserId();
  try {
    const sessions = await api.getSessions(userId);
    setSessions(sessions);
    return sessions;
  } catch (err) {
    console.error('Failed to load sessions from backend:', err);
    // Fallback: return whatever is in localStorage (graceful degradation)
    const stored = getSessions();
    setSessions(stored);
    return stored;
  }
}, [setSessions]);
```

**`useMessages` — `loadMessages`:**
```ts
// Before:
const loadMessages = useCallback(async () => {
  if (!sessionId) return [];
  setIsLoading(true);
  try {
    const stored = getMessages(sessionId);  // reads localStorage
    setMessages(sessionId, stored);
    return stored;
  } finally {
    setIsLoading(false);
  }
}, [sessionId, setMessages]);

// After:
const loadMessages = useCallback(async () => {
  if (!sessionId) return [];
  setIsLoading(true);
  try {
    const userId = getUserId();
    const messages = await api.getSessionMessages(sessionId, userId);
    setMessages(sessionId, messages);
    return messages;
  } catch (err) {
    console.error('Failed to load messages from backend:', err);
    const stored = getMessages(sessionId);
    setMessages(sessionId, stored);
    return stored;
  } finally {
    setIsLoading(false);
  }
}, [sessionId, setMessages]);
```

**Note:** The `useMessages` function is defined in the same file (`useSessions.ts`). The above replaces its body.

**Verification:**
1. Start backend with the `/sessions` and `/messages` endpoints implemented (Tasks B1-B3).
2. Start frontend dev server.
3. Open the app in the browser. The sidebar should show sessions from the backend, not from localStorage.
4. Select a session. The message list should populate from the backend.
5. Clear localStorage (`localStorage.clear()`) and reload — sessions and messages should still appear (fetched from backend).

**Commit:** `feat: load sessions and messages from backend API instead of localStorage`

---

### Task B6 — Keep localStorage as write-through cache (optional, Phase 2)

**Files touched:** `src/lib/storage.ts`, `src/hooks/useSessions.ts`  
**Estimated time:** 5 min (optional)

After Task B5, the frontend reads from the backend but still writes to localStorage on `createSession`, `updateSession`, `addMessage`, etc. Decide: keep localStorage as a cache or remove it.

**Option A (keep as cache):** On `createSession`, call a new `POST /sessions` endpoint to persist on the backend, then also write to localStorage as a fast-access cache. On `updateSession`/`addMessage`, do the same: backend first, then localStorage.

**Option B (backend only):** Remove all localStorage session/message writes. The backend is the sole source of truth. This is simpler but means offline usage loses data.

For the initial implementation, **Option B** is recommended — remove the localStorage writes for sessions/messages and rely entirely on the backend. The `getSessions()` / `getMessages()` functions in `storage.ts` can stay as fallbacks for the graceful degradation in Task B5.

If the user wants offline support, that becomes a follow-up task.

**Commit (if Option B):** `refactor: remove localStorage session writes, backend is source of truth`

---

## Tests / validation

### Backend tests (pytest)

Add a `tests/` directory with:

```python
# tests/test_models_endpoint.py
from searchAI import app, AVAILABLE_BACKEND_MODELS

def test_models_endpoint():
    client = app.test_client()
    resp = client.get("/models")
    assert resp.status_code == 200
    data = resp.json()
    assert "models" in data
    assert len(data["models"]) == len(AVAILABLE_BACKEND_MODELS)
    assert data["models"][0]["id"] == AVAILABLE_BACKEND_MODELS[0].id

def test_models_endpoint_returns_correct_schema():
    client = app.test_client()
    resp = client.get("/models")
    data = resp.json()
    for m in data["models"]:
        assert "id" in m
        assert "name" in m
        assert "provider" in m
```

```python
# tests/test_sessions_endpoint.py  (after DB is wired up)
def test_sessions_endpoint_returns_sessions():
    client = app.test_client()
    resp = client.get("/sessions?user_id=1")
    assert resp.status_code == 200
    data = resp.json()
    assert "sessions" in data
    assert isinstance(data["sessions"], list)

def test_messages_endpoint_returns_messages():
    client = app.test_client()
    resp = client.get("/sessions/test-id/messages?user_id=1")
    assert resp.status_code == 200
    data = resp.json()
    assert "messages" in data
    assert isinstance(data["messages"], list)
```

Run with:
```bash
cd /c/Users/Tejas\ Mittal/WebSearch-AI
python3 -m pytest tests/ -v
```

### Frontend tests

```bash
cd searchai-frontend
npm test  # or npx vitest run, depending on test setup
```

Specific assertions:
- `useModels` returns data matching the backend `/models` response.
- `useSessions().loadSessions()` calls `GET /sessions` and populates the store.
- `useMessages(sessionId).loadMessages()` calls `GET /sessions/{id}/messages`.

### Manual verification checklist

1. Backend `/models` returns 4 models.
2. Backend `/sessions?user_id=1` returns sessions from `searchAI.db`.
3. Backend `/sessions/{id}/messages` returns messages from `searchAI.db`.
4. Frontend sidebar shows sessions from the backend (not localStorage).
5. Frontend message list shows messages from the backend when a session is selected.
6. Changing the model in the Header dropdown sends the correct model to the backend.
7. The backend agent actually uses the requested model (Task A3).

---

## Risks, tradeoffs, and open questions

### Risks

1. **Agno DB schema unknown.** Task A1 must be completed before Tasks B1-B3 can be implemented correctly. If Agno's schema doesn't expose sessions/messages in a queryable way, we need to add our own `session_metadata` table. This is a design decision that affects how much the backend couples to Agno's internals.

2. **Breaking change for existing localStorage data.** When we switch from localStorage to backend API, existing sessions stored in browser localStorage will be orphaned unless we migrate them. Consider:
   - One-time migration: on first load after the change, read localStorage sessions and upsert them into `searchAI.db` via a new `POST /sessions/migrate` endpoint.
   - Or: accept the loss and let users start fresh. The user should decide.

3. **WebSocket sessions.** The WebSocket path (`/ws/chat`) creates sessions on the fly. These need to be persisted to `searchAI.db` in a way that the new `GET /sessions` endpoint can find them. Currently the WebSocket handler creates a session implicitly via Agno's `session_id` parameter. We need to ensure the session metadata (title, model, best_toggle) is also written to our metadata store.

4. **`best_toggle` type mismatch.** Frontend `Session.best_toggle` is `boolean`. Backend `AgentDetails.best_toggle` is `Literal[0, 1]`. The API layer must convert: `True` → `1`, `False` → `0` on write; `1` → `True`, `0` → `False` on read.

### Tradeoffs

| Decision | Option A | Option B |
|---|---|---|
| Model list source | Backend `GET /models` (single source of truth) | Frontend hardcoded (current) |
| Session source | Backend `searchAI.db` via API | Frontend localStorage (current) |
| Offline support | Not in scope (Phase 2) | localStorage as cache |
| Existing data migration | Migrate localStorage → DB on first load | Start fresh |

The plan chooses **Option A** for both rows above. This is the right call because: the backend already owns the data (it's in `searchAI.db`), the frontend is a client, and having two copies of session data is the current bug.

### Open questions for the implementer

1. What is the exact schema of `searchAI.db`? (Task A1.)
2. Does the user want existing localStorage sessions migrated to the backend, or is starting fresh acceptable?
3. Should `POST /sessions` (create session on backend) be part of this plan, or is that a follow-up? Currently `createSession` in `storage.ts` only writes to localStorage. Without a backend create endpoint, new sessions created in the frontend won't appear in the backend's session list. **This is a gap** — the plan should include a `POST /sessions` endpoint.
4. How does the user want to handle the model list — is the 4-model list in Task A2 sufficient, or should models be configurable (e.g., from environment variables or a config file)?

---

## Missing piece: `POST /sessions` (create session on backend)

The plan above covers reading sessions from the backend but not writing them. When the user creates a new session in the frontend, it currently only goes to localStorage. To make the backend the full source of truth, we need:

```python
# searchAI.py
class CreateSessionRequest(BaseModel):
    user_id: int
    title: str = "New Chat"
    model: str = "gemini-2.0-flash-001"
    best_toggle: bool = False

class CreateSessionResponse(BaseModel):
    id: str
    user_id: int
    title: str
    created_at: str
    updated_at: str
    message_count: int
    model: str
    best_toggle: bool

@app.post("/sessions", response_model=CreateSessionResponse)
def create_session(req: CreateSessionRequest):
    session_id = str(uuid4())
    now = datetime.utcnow().isoformat() + "Z"
    # Insert into session_metadata table (or Agno's equivalent)
    # ...
    return CreateSessionResponse(
        id=session_id,
        user_id=req.user_id,
        title=req.title,
        created_at=now,
        updated_at=now,
        message_count=0,
        model=req.model,
        best_toggle=req.best_toggle,
    )
```

And on the frontend, `createSession` in `storage.ts` should call `POST /sessions` instead of (or in addition to) writing localStorage.

This is **not yet scheduled as a task** above — it should be added as Task B7 between B3 and B4, or folded into B5. The implementer should include it.
