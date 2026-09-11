# Inqora

Inqora is an AI document intelligence platform: upload PDFs, ask questions, and get grounded
answers with page-level citations.

## Repository structure

```
Inqora/
│
├── frontend/     Next.js application (UI, chat workspace, document library)
├── backend/      FastAPI RAG backend (PDF processing, MongoDB Atlas Vector Search, Gemini)
│
├── .gitignore
└── README.md
```

Each project is independent — its own dependencies, its own lockfile, its own `.gitignore` — and
is documented in full in its own README:

- [`frontend/`](./frontend) — see the Next.js app itself for its component/design-system docs.
- [`backend/README.md`](./backend/README.md) — architecture, environment variables, MongoDB
  Atlas + Vector Search setup, Gemini configuration, RAG pipeline, and testing.

## Architecture

```
Next.js (frontend)
      │  HTTP (fetch to NEXT_PUBLIC_API_URL, e.g. http://localhost:8000/api/v1)
      ▼
FastAPI (backend)
      │
      ├─ PDF upload → PyMuPDF extraction → chunking → Gemini embeddings
      │
      ▼
MongoDB Atlas + Vector Search  (chunks stored with embeddings; $vectorSearch retrieval)
      │
      ▼
Retrieval-Augmented Generation
      │  question → embed → vector search → relevant chunks → context assembly
      ▼
Gemini LLM
      │  generates an answer grounded only in the retrieved context
      ▼
Grounded answer + page/document citations
      │
      ▼
Frontend (renders the answer with clickable source citations)
```

## Development

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Runs at http://localhost:3000.

**Backend:**

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate   |   macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in MongoDB Atlas / Gemini credentials — see backend/README.md
uvicorn app.main:app --reload --port 8000
```

Runs at http://localhost:8000 (`/docs` for interactive API documentation).

## Deployment

- **Frontend**: deploy on Vercel with **Root Directory** set to `frontend` and framework preset
  **Next.js**. No other configuration is required for the frontend build itself.
- **Backend**: deploy `backend/` to any Python host that can run `uvicorn`/`gunicorn` (Render,
  Railway, Fly.io, a container, etc.) — see `backend/README.md` for production considerations.
