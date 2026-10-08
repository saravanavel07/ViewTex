# VIEWTEX

## Intelligent Hybrid Semantic Search Engine

VIEWTEX is a human-centered intelligent search engine combining exact keyword retrieval, semantic understanding, adaptive retrieval, hybrid ranking, reranking and evidence-based explanations.

Core pipeline:

**Query → Understand → Retrieve → Rank → Explain**

---

### Brand Identity & Character

- **Name**: VIEWTEX
- **Signature Mascot**: A small, curious, intelligent alien sitting naturally on a rock and laughing.
- **Visual Aesthetic**: Premium, minimal, editorial, intelligent, technical. Warm biscuit white palette (`#FAF8F5`, `#F5F2EB`) with dark graphite typography and zero-pill layout discipline.
- **Atmospheric Motifs**: Extremely subtle abstract soaring silhouettes of distant eagles and vultures along the sky edges, symbolizing observation, thermal flight, and patient exploration.

---

### Key Features

- **Hybrid Search**: Combines sparse lexical keyword retrieval (Okapi BM25) with dense vector embeddings using Reciprocal Rank Fusion (RRF, $k=60$) and cross-attention passage reranking.
- **Adaptive Retrieval**: Dynamically calibrates weighting between exact keyword matching and semantic vector similarity based on query intent (e.g., 90% Exact for system error codes like `ERR_CONNECTION_RESET`, 85% Semantic for abstract questions like `What is normalization in machine learning?`).
- **VIEWTEX Reason Layer**: Signature explainable search feature displaying exact calibrated retrieval relevance metrics for every result (Semantic Relevance, Keyword Relevance, Context Relevance, Final Retrieval Score) with natural language explanations.
- **Evidence-First Search & Verification**: Inspect verbatim source passages, page numbers, section headers, matching lexical tokens, and embedding vector distances.
- **VIEWTEX Evidence Map**: Deterministic visual pipeline trace showing:
  `User Query` → `Detected Concepts` → `Matched Documents` → `Relevant Passages` → `Ranking` → `Final Result`.
- **Voice-to-Text Search**: Speech-to-text with real-time waveform visualizer, editable transcripts, auto-submit controls, and seamless fallback.
- **Document Indexing**: Upload and index custom research files (PDF, TXT, DOCX, CSV, Markdown, Code) into the live vector index.
- **Context-Aware Follow-up Queries**: Automatically resolves anaphoric referents across search queries (e.g. "Tell me about Python" → "What are its advantages?" resolves `its = Python`).
- **Query Correction ("Did You Mean")**: Proposes spelling corrections without silently modifying the user's intent.
- **Developer Search Comparison**: Side-by-side benchmark comparing Keyword vs Semantic vs Hybrid pipelines with latency, ranking, and Jaccard overlap metrics.
- **Search Quality & Health Analytics**: Real-time evaluation of Precision@K, Recall@K, MRR, NDCG@10, and latency profiles (p50/p95).
- **Curated Collections & Search History**: Save and organize research evidence into categorized folders with Markdown export.
- **Optional Grounded AI Answer Mode**: Strictly separated "Generated Summary" and "Retrieved Evidence" with inline bracket citations and hard anti-hallucination guardrails.

---

### Architecture & Innovation

```
USER QUERY
    │
    ▼
QUERY NORMALIZATION (Typo Correction & Stopword Awareness)
    │
    ▼
QUERY UNDERSTANDING & INTENT DETECTION
    │
    ▼
ADAPTIVE RETRIEVAL WEIGHTING (Dynamic Exact / Semantic Ratio)
    │
    ├──► BM25 LEXICAL RETRIEVAL (Robertson-Spärck Jones Okapi k1=1.5, b=0.75)
    │
    └──► DENSE SEMANTIC RETRIEVAL (64-dim Concept Projection & Cosine Distance)
    │
    ▼
HYBRID RECIPROCAL RANK FUSION (RRF k=60)
    │
    ▼
PASSAGE CO-OCCURRENCE RERANKING
    │
    ▼
VIEWTEX REASON LAYER (Attribution & Relevance Decomposition)
    │
    ▼
EVIDENCE MAP & VERIFIED RESULTS FEED
```

---

### Getting Started

#### Prerequisites
- Node.js >= 20.x or Docker

#### Running Locally
```bash
# Install dependencies
npm install

# Start full-stack development server (Port 3000)
npm run dev

# Build production bundle
npm run build
npm start
```

#### Running with Docker
```bash
docker-compose up --build
```

---

### Human-First Search Guarantee

VIEWTEX adheres strictly to the Human-First Principle:
1. Search results are never replaced by unprompted AI chatbot text.
2. The user always remains in control of retrieval strategy.
3. If insufficient evidence exists, VIEWTEX never fabricates answers or sources.
