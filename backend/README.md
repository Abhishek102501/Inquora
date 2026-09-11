# Inqora Backend

FastAPI backend for **Inqora** — an AI document intelligence platform. Users upload PDFs, the
backend extracts and chunks their text page-by-page, embeds the chunks with Gemini, stores them
in MongoDB, and answers questions with **MongoDB Atlas Vector Search** retrieval + a **Gemini**
LLM — every answer carries page-accurate citations pulled from the retrieved chunks, never from
the model's free text.

This is a separate, standalone service from the Next.js frontend in the repository root. It does
not share code, dependencies, or a runtime with the frontend.

## 1. What this backend does

- Accepts PDF uploads, validates them, and stores them safely.
- Extracts text page-by-page with PyMuPDF, chunks it (page-aware, configurable size/overlap),
  and embeds each chunk with Gemini's embedding API.
- Stores chunks + embeddings in MongoDB and indexes them for **real** Atlas Vector Search
  (a native `$vectorSearch` aggregation stage — not a Python-side cosine similarity fallback).
- Answers user questions with retrieval-augmented generation: embed the question, vector-search
  the user's own chunks (optionally scoped to specific documents), assemble context, call
  Gemini, and return an answer with page/document citations sourced from the retrieved chunks.
- Enforces per-user data isolation everywhere: JWT auth, and every document/chunk/conversation
  query is filtered by `userId` at the database layer.
- Supports multi-document and follow-up (conversational) chat with a bounded history window.

## 2. Architecture

```
                        ┌──────────────────────────────────────────┐
                        │              FastAPI app                 │
                        │  (app/main.py — CORS, logging, errors)    │
                        └───────────────────┬────────────────────--┘
                                            │
                 ┌──────────────┬───────────┼────────────┬───────────────┐
                 ▼              ▼            ▼            ▼               ▼
              /auth        /documents      /chat     /conversations   /health
           (app/api/*.py — request/response schemas only, no business logic)
                 │              │            │            │
                 └──────────────┴─────┬──────┴────────────┘
                                       ▼
                          app/services/*  (business logic)
        auth_service · document_service · chunking_service · pdf_service
        retrieval_service · vector_search_service · rag_service · conversation_service
                                       │
                     ┌─────────────────┼───────────────────┐
                     ▼                 ▼                   ▼
          app/providers/llm/*  app/providers/embeddings/*  app/services/storage.py
             (Gemini today,      (Gemini today,             (local disk today,
              swappable)          swappable)                 S3-ready interface)
                                       │
                                       ▼
                          app/db/repositories/*  (only layer touching ObjectId)
                                       │
                                       ▼
                              MongoDB Atlas
                    users · documents · chunks (+ Vector Search index) ·
                              conversations · messages
```

Layering rules this codebase follows:

- **`api/`** only parses requests, calls one service method, and maps the result to a response
  schema. No MongoDB or provider calls live here.
- **`services/`** hold all business logic and are composed by dependency injection
  (`app/dependencies.py`) — nothing instantiates its own collaborators.
- **`providers/`** are the only place that know about Gemini specifically. Swapping to
  OpenAI/Anthropic/a local model means adding one new class that implements `LLMProvider` or
  `EmbeddingProvider` — no other file changes.
- **`db/repositories/`** are the only files allowed to import `bson.ObjectId`. Everything above
  works with plain string ids, so a raw MongoDB document is never handed to a client.

## 3. Setup

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env   # then fill in real values — see section 4
```

## 4. Environment variables

All variables live in `backend/.env` (never committed — see `.gitignore`). See
`backend/.env.example` for the full annotated list. The important ones:

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | Atlas connection string. |
| `MONGODB_DATABASE` | Database name (e.g. `inqora`). |
| `MONGODB_CHUNKS_COLLECTION` | Collection chunks are stored in (default `chunks`). |
| `MONGODB_VECTOR_INDEX` | Name of the Atlas Search vector index on that collection (section 6). |
| `JWT_SECRET_KEY` | Random secret for signing access tokens. Generate with `python -c "import secrets; print(secrets.token_urlsafe(48))"`. |
| `GEMINI_API_KEY` | Your Gemini API key. |
| `GEMINI_MODEL` | Chat/generation model. Availability varies by key/account — verify against `GET /v1beta/models?key=...` rather than assuming a name works. |
| `GEMINI_EMBEDDING_MODEL` | Embedding model, e.g. `gemini-embedding-001` (supports configurable output size). |
| `GEMINI_EMBEDDING_DIMENSIONS` | **Must match** the real output size of the embedding model above (see warning below). |
| `CORS_ORIGINS` | Comma-separated allowed origins, e.g. `http://localhost:3000`. |
| `CHUNK_SIZE` / `CHUNK_OVERLAP` | Chunking tuning, in characters. |
| `RETRIEVAL_TOP_K` / `RETRIEVAL_MAX_CONTEXT_CHUNKS` / `RETRIEVAL_SIMILARITY_THRESHOLD` | Retrieval tuning. |
| `CONVERSATION_HISTORY_MESSAGES` | How many recent messages are sent to the LLM as context. |

> **⚠️ Embedding dimensions are not guessed.** `GEMINI_EMBEDDING_DIMENSIONS` is read from
> configuration everywhere (the embedding provider, and the Atlas Vector Search index
> definition below) instead of being hardcoded. If you change `GEMINI_EMBEDDING_MODEL`, check
> that model's actual output dimensionality (call the API and inspect a real response — don't
> assume from docs, which can be stale) and update `GEMINI_EMBEDDING_DIMENSIONS` to match —
> then **recreate** the Atlas Vector Search index, since an existing index's `numDimensions`
> cannot be changed in place. The shipped default pairs `gemini-embedding-001` with
> `outputDimensionality: 1536`, verified working against a live Atlas M0 cluster.

## 5. MongoDB Atlas setup

1. Create a free or paid Atlas cluster. Vector Search has historically required an M10+
   dedicated cluster or a Search-enabled Serverless/Flex tier — but Atlas's tier support
   changes over time and region, so verify directly in your project rather than assuming; this
   project has been run successfully against a free M0 tier with Vector Search enabled.
2. Create a database user and allow-list your IP under **Network Access** (or `0.0.0.0/0` for
   local development only — never in production). Atlas rejects connections from non-allow-listed
   IPs at the TLS layer with a generic handshake error, which can look like a credentials problem
   — check Network Access first if you see `SSL: TLSV1_ALERT_INTERNAL_ERROR`.
3. Database users authenticate against the `admin` database regardless of which database they
   have data access to. Include `authSource=admin` explicitly in `MONGODB_URI`, or authentication
   will fail with a generic `bad auth` error even with correct credentials.
4. Copy the connection string into `MONGODB_URI`.
5. Collections (`users`, `documents`, `chunks`/your configured chunks collection, `conversations`,
   `messages`) and their standard indexes are created automatically at application startup — see
   `app/db/indexes.py`. Nothing manual is required for those. The Vector Search index (section 6)
   is the one thing you provision yourself.

## 6. Vector Search index setup

The Atlas **Search** index (a different kind of object from a regular MongoDB index) on
`<chunks collection>.embedding` is what powers real vector retrieval. This app **never**
creates, modifies, or deletes a search index programmatically — `app/db/indexes.py::
ensure_vector_search_index` only checks at startup that the configured index exists and logs
its status. Provisioning is a one-time, deliberate step you do via the Atlas UI/CLI.

Minimal definition (Atlas → your cluster → **Search** → **Create Search Index** → **Vector
Search** → JSON editor):

```json
{
  "name": "chunks_vector_index",
  "type": "vectorSearch",
  "definition": {
    "fields": [
      {
        "type": "vector",
        "path": "embedding",
        "numDimensions": 1536,
        "similarity": "cosine"
      }
    ]
  }
}
```

- `numDimensions` **must** equal `GEMINI_EMBEDDING_DIMENSIONS`, and the collection/index names
  must equal `MONGODB_CHUNKS_COLLECTION` / `MONGODB_VECTOR_INDEX`.
- **Optional but recommended**: add `{ "type": "filter", "path": "userId" }` and
  `{ "type": "filter", "path": "documentId" }` so `$vectorSearch` can restrict results to the
  authenticated user *inside* the vector search itself (best recall and performance). If your
  index does **not** declare those filter fields (as is the case if you provisioned it with only
  the `vector` field above), `ChunksRepository.vector_search` still enforces per-user isolation
  correctly — it applies `userId`/`documentId` as a `$match` stage immediately after
  `$vectorSearch`, over-fetching candidates (`numCandidates`/internal limit inflated well beyond
  `top_k`) so a user's own results aren't crowded out by other users' data before that filter
  runs. Either index shape is supported; declaring the filter fields is simply more efficient at
  large scale.

## 7. Gemini API configuration

1. Get an API key from Google AI Studio.
2. Set `GEMINI_API_KEY` in `.env`.
3. `GEMINI_MODEL` and `GEMINI_EMBEDDING_MODEL` are read from config everywhere — see
   `app/providers/llm/gemini.py` and `app/providers/embeddings/gemini.py`. Both call the plain
   Gemini REST API via `httpx` (no SDK dependency) and retry transient failures (timeouts, 429,
   5xx) up to 3 times with exponential backoff — never indefinitely.

## 8. Running locally

```bash
uvicorn app.main:app --reload --port 8000
```

The app starts even without `MONGODB_URI`/`GEMINI_API_KEY` configured (useful for exploring
`/docs`), but anything touching the database or an LLM/embedding call will return a clean 5xx
until they're set — nothing is faked.

## 9. Testing

```bash
pytest
```

Tests never require a live MongoDB Atlas cluster or a real `GEMINI_API_KEY`:

- MongoDB is replaced with [`mongomock`](https://github.com/mongomock/mongomock) via a
  dependency override (`tests/conftest.py`).
- Gemini's LLM and embedding providers are replaced with deterministic fakes
  (`tests/fakes.py`) — patched at their factory-function source so both request-time
  dependency injection *and* the background document-processing worker use them.
- `mongomock` cannot execute Atlas's `$vectorSearch` aggregation stage (it's an Atlas-only
  server feature), so vector-search *tests* verify two things separately: (1) the query
  structure/filters your code sends to `$vectorSearch` (`tests/test_retrieval.py`, by
  intercepting `collection.aggregate`), and (2) the retrieval/RAG pipeline's behavior given
  realistic result sets. This is intentionally not a simulated cosine-similarity search — the
  production code path is always the real Atlas aggregation.

## 10. API documentation

With the app running: **http://localhost:8000/docs** (Swagger UI) or **/redoc**. The raw OpenAPI
schema is at **/openapi.json**.

### Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/health` | Liveness + DB connectivity. |
| POST | `/api/v1/auth/register` | Create an account, returns a JWT. |
| POST | `/api/v1/auth/login` | Exchange credentials for a JWT. |
| GET | `/api/v1/auth/me` | Current user's profile. |
| POST | `/api/v1/documents/upload` | Upload a PDF (multipart/form-data). |
| GET | `/api/v1/documents` | List the caller's documents. |
| GET | `/api/v1/documents/{id}` | Get one document. |
| GET | `/api/v1/documents/{id}/status` | Poll processing status. |
| DELETE | `/api/v1/documents/{id}` | Delete a document and its chunks. |
| POST | `/api/v1/chat` | Ask a question; creates a conversation if none given. |
| POST | `/api/v1/chat/{conversation_id}/messages` | Ask a follow-up in an existing conversation. |
| GET | `/api/v1/conversations` | List conversations. |
| POST | `/api/v1/conversations` | Create a conversation. |
| GET | `/api/v1/conversations/{id}` | Get one conversation. |
| DELETE | `/api/v1/conversations/{id}` | Delete a conversation. |
| GET | `/api/v1/conversations/{id}/messages` | List a conversation's messages (with citations). |

All routes except `/health`, `/auth/register`, and `/auth/login` require
`Authorization: Bearer <token>`.

## 11. RAG pipeline

**Ingestion** (`DocumentService.process_document`, invoked from a FastAPI `BackgroundTask` right
after upload so the request returns immediately):

```
PDF bytes → PyMuPDF (page-aware extraction) → clean text
          → chunking_service (recursive, page-bounded, size/overlap configurable)
          → GeminiEmbeddingProvider.embed_texts (batched)
          → chunks collection (text + pageNumber + embedding + metadata)
```

If a PDF has zero extractable text on every page (e.g. a scanned/image-only PDF), the document
is marked `failed` with a clear message that OCR would be required — this backend does not
perform OCR and does not claim to.

**Query** (`RagService.answer`, orchestrated by `ConversationService.ask`):

```
question → GeminiEmbeddingProvider.embed_query
         → ChunksRepository.vector_search ($vectorSearch, filtered by userId [+ documentId])
         → RetrievalService (threshold filter, near-duplicate dedup, cap to N chunks)
         → prompt assembly (system prompt + bounded conversation history + context blocks)
         → GeminiLLMProvider.generate
         → answer + sources (page numbers/excerpts taken verbatim from retrieved chunks)
```

If retrieval finds nothing above `RETRIEVAL_SIMILARITY_THRESHOLD`, the LLM is **not called** —
the API returns a fixed, honest response ("I couldn't find enough information in the uploaded
documents to answer that reliably.") instead of letting the model guess from general knowledge.

## 12. Storage architecture

`app/services/storage.py` defines a `StorageProvider` interface. `LocalStorageProvider` (files
under `backend/uploads/`, gitignored) is the only implementation shipped. To add S3-compatible
storage, implement a new `StorageProvider` subclass and branch on `STORAGE_PROVIDER` in
`get_storage_provider()` — no other file needs to change.

## 13. Production considerations

- **Background processing**: document processing currently runs as an in-process
  `BackgroundTask`. This is fine for a single-instance deployment but does not survive a process
  restart mid-job and doesn't scale across multiple API instances. `app/workers/` is deliberately
  isolated so it can be replaced with a real queue (RQ/arq/Celery) later without touching the API
  or `DocumentService`.
- **Rate limiting**: not implemented in-process. Put a rate limiter in front of `/auth/login`,
  document upload, and `/chat` (e.g. at a reverse proxy, or add `slowapi`) before exposing this
  publicly — those are the expensive/abusable endpoints.
- **CORS**: `CORS_ORIGINS` must be an explicit list in production; never `*`.
- **Secrets**: everything sensitive is read from environment variables; nothing is hardcoded.
  Rotate `JWT_SECRET_KEY` and `GEMINI_API_KEY` via your deployment platform's secret manager.
- **Logging**: structured, single-line logs with a request id; passwords, tokens, API keys, and
  full document content are never logged (see `app/core/logging.py`).
- **Horizontal scaling**: the app holds no in-process state beyond a cached MongoDB client and
  provider instances, so it can run as multiple stateless replicas behind a load balancer.
