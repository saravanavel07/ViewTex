# VIEWTEX

A human-centered hybrid search engine that blends exact keyword matching, semantic retrieval, adaptive ranking, and explainable evidence-based results.

VIEWTEX is built as a full-stack TypeScript application with a React frontend and an Express search backend. It is designed for research-heavy queries where users want more than a generic AI answer—they want verified evidence, ranked results, and transparent retrieval logic.

## Why VIEWTEX

Traditional search tools often optimize for either:
- exact matches,
- semantic similarity,
- or chat-style summaries.

VIEWTEX combines all three while keeping the user in control. It surfaces the retrieval pipeline, exposes evidence, and avoids hallucinated answers by grounding output in retrieved passages.

---

## Core Experience

VIEWTEX follows this flow:

Query → Understand → Retrieve → Rank → Explain

This means users can:
- search by exact token or identifier,
- search by meaning and concept,
- compare different search modes,
- inspect evidence passages,
- review a deterministic retrieval pipeline,
- save research to collections,
- and ask for grounded summaries using retrieved context.

---

## Features

### Hybrid retrieval
- Keyword search using exact token matching and BM25-style lexical relevance
- Semantic search using dense vector similarity
- Hybrid mode for combined ranking
- Adaptive weighting between exact and semantic retrieval based on query intent

### Explainable search
- Evidence modal for each result
- Relevance decomposition by metrics
- Evidence map showing the search trace
- Search health dashboard for latency and precision metrics

### Research workflows
- Voice-to-text search input
- Document upload and chunking for custom corpora
- Collection saving and export in Markdown
- Search history tracking
- Optional grounded summary generation from verified evidence

### UX and design
- Editorial, minimal interface inspired by research tooling
- Focused search-first experience
- Clear separation between generated summary and retrieved evidence

---

## Architecture

```text
Frontend (React + Vite)
  │
  ▼
Search UI and Modals
  │
  ▼
Express API Server
  │
  ├── Exact Search
  ├── Semantic Search
  ├── Hybrid Search
  ├── Document Indexing
  ├── Collections + History
  └── Grounded Summary Generator
  │
  ▼
In-memory search engine + chunk store
  │
  └── Indexed documents, evidence, ranking metadata
```

---

## Tech Stack

- React 19
- TypeScript
- Vite
- Express
- Tailwind CSS
- Lucide icons
- Google GenAI SDK

---

## Project Structure

```text
ViewTex/
├─ src/
│  ├─ components/
│  ├─ documents/
│  ├─ mascot/
│  ├─ search_engine/
│  ├─ server_engine/
│  ├─ services/
│  ├─ voice/
│  ├─ App.tsx
│  └─ main.tsx
├─ server.ts
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
├─ README.md
└─ .env.example (if added locally)
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Optional: Docker

### Install dependencies

```bash
npm install
```

### Run the app in development mode

```bash
npm run dev
```

This starts the full stack development server.

### Build for production

```bash
npm run build
npm start
```

### Run with Docker

```bash
docker-compose up --build
```

---

## Environment Variables

If you want to enable grounded summaries through Gemini, create a local environment file:

```bash
GEMINI_API_KEY=your_api_key_here
```

The server reads this value in `server.ts` for the `/api/summary` endpoint.

---

## Search API Overview

The backend exposes search and document endpoints such as:

```text
POST /api/search
POST /api/search/keyword
POST /api/search/semantic
POST /api/search/hybrid
GET /api/search/:id/evidence
GET /api/search/:id/reason
POST /api/documents/upload
GET /api/documents
DELETE /api/documents/:id
GET /api/analytics
GET /api/health
POST /api/summary
```

Example search request:

```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is normalization in machine learning?",
    "mode": "smart",
    "activeContext": "Machine Learning"
  }'
```

---

## Search Modes

### Exact
Best for:
- error codes,
- identifiers,
- technical strings,
- deterministic keyword matches.

### Semantic
Best for:
- abstract concepts,
- research questions,
- conceptual exploration,
- meaning-based retrieval.

### Hybrid
Best for:
- balanced relevance,
- technical research,
- comparison queries,
- general-purpose retrieval.

---

## Human-First Design Principle

VIEWTEX prioritizes evidence integrity over chat-style persuasion:

1. Search results are not silently replaced by AI-generated text.
2. Users stay in control of the retrieval strategy.
3. If there is not enough evidence, the system does not fabricate answers.

---

## License

This project is currently distributed without a formal license declaration in the repository metadata. If you plan to reuse or commercialize it, confirm the intended licensing terms with the project owner.

---

## Notes

This project is designed as a research and product prototype for explainable hybrid search. It is especially useful for:
- technical documentation search,
- concept discovery,
- evidence-grounded answer generation,
- knowledge exploration workflows.

---

## Roadmap Ideas

- Better persistent storage for documents and collections
- Weighted relevance tuning and benchmark evaluation
- Multi-index search support
- Improved citation UX and result comparisons
- Expanded file ingestion support for additional document types

---

Built for thoughtful search, transparent reasoning, and evidence-first discovery.
