import { DocumentChunk } from './types';

export const INITIAL_CORPUS: DocumentChunk[] = [
  // 1. Python List Operations & IndexError (Matches user prompt example!)
  {
    id: 'py-list-01',
    docId: 'doc-py-stdlib',
    docTitle: 'Python Data Structures & Sequence Protocols',
    category: 'Programming',
    section: 'List Mutation & Duplicate Removal',
    page: 42,
    sourceUrl: 'https://docs.python.org/3/tutorial/datastructures.html',
    date: 'March 2026',
    tokens: [
      'python', 'list', 'operations', 'duplicate', 'removal', 'set', 'order', 'dict', 'fromkeys', 'indexing'
    ],
    content:
      'To remove duplicates from a Python list while maintaining original insertion order, use `list(dict.fromkeys(sequence))`. If ordering is not required, converting directly via `set(sequence)` delivers O(1) amortized deduplication. When performing in-place modifications during iteration, slicing a copy `sequence[:]` prevents index skipping bugs.',
    codeSnippet: 'clean_items = list(dict.fromkeys(raw_items))  # Preserves O(N) order',
  },
  {
    id: 'py-index-error-02',
    docId: 'doc-py-errors',
    docTitle: 'Python Exception Handling & Traceback Diagnostics',
    category: 'Debugging',
    section: 'IndexError: list index out of range',
    page: 15,
    sourceUrl: 'https://docs.python.org/3/library/exceptions.html#IndexError',
    date: 'January 2026',
    tokens: [
      'how', 'fix', 'python', 'indexerror', 'list', 'index', 'out', 'range', 'boundary', 'bounds', 'len', 'off-by-one'
    ],
    content:
      'The Python IndexError: list index out of range occurs when attempting to access a subscript index outside sequence boundaries `[0, len(seq) - 1]`. Common causes include off-by-one errors in while loops, accessing index `len(seq)` instead of `len(seq) - 1`, and modifying a list while iterating over its indices.',
    codeSnippet: '# Fix: Guard bounds or use safe retrieval\nitem = my_list[idx] if 0 <= idx < len(my_list) else default_val',
  },

  // 2. Machine Learning Normalization (Matches user prompt example!)
  {
    id: 'ml-norm-01',
    docId: 'doc-ml-foundations',
    docTitle: 'Principles of Deep Learning & Feature Representation',
    category: 'Machine Learning',
    section: 'Feature Normalization & Standardization',
    page: 88,
    sourceUrl: 'https://arxiv.org/abs/ml-normalization-foundations',
    date: 'February 2026',
    tokens: [
      'what', 'is', 'normalization', 'machine', 'learning', 'standardization', 'min-max', 'z-score', 'gradient', 'descent'
    ],
    content:
      'Normalization in machine learning refers to scaling input features or internal layer representations to a standardized numerical range (typically [0, 1] for Min-Max or zero mean with unit variance for Z-score). Normalization eliminates scale bias across disparate features, conditions the loss surface, prevents exploding or vanishing gradients, and accelerates gradient descent convergence.',
    codeSnippet: 'X_norm = (X - X.mean(axis=0)) / (X.std(axis=0) + 1e-8)',
  },
  {
    id: 'ml-batch-norm-02',
    docId: 'doc-ml-architectures',
    docTitle: 'Deep Neural Network Architectures',
    category: 'Machine Learning',
    section: 'Batch Normalization vs Layer Normalization',
    page: 104,
    sourceUrl: 'https://papers.nips.cc/paper/batch-norm',
    date: '2025',
    tokens: [
      'batch', 'normalization', 'layer', 'normalization', 'internal', 'covariate', 'shift', 'transformer', 'cnn'
    ],
    content:
      'Batch Normalization standardizes activations across the mini-batch dimension for each feature channel, proving optimal for convolutional networks with fixed batch sizes. In contrast, Layer Normalization standardizes activations across the hidden features for each individual token or sample, making it the industry standard for Transformers and sequence models where sequence lengths vary.',
  },

  // 3. Network & System Error Codes (Matches user prompt example!)
  {
    id: 'net-err-reset-01',
    docId: 'doc-tcp-diagnostics',
    docTitle: 'TCP/IP Socket Diagnostics & HTTP Transport Failures',
    category: 'Networking',
    section: 'ERR_CONNECTION_RESET Protocol Analysis',
    page: 29,
    sourceUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status',
    date: '2026',
    tokens: [
      'err_connection_reset', 'connection', 'reset', 'tcp', 'rst', 'socket', 'handshake', 'firewall', 'packet', 'proxy'
    ],
    content:
      'ERR_CONNECTION_RESET indicates an unexpected TCP RST (reset) packet transmitted by the peer server or intermediate network firewall during socket communication. Unlike graceful FIN handshakes, an RST immediately tears down socket state. Diagnostics: inspect MTU packet fragmentation, verify TLS cipher negotiation, test proxy keep-alive timeouts, and inspect server-side process crashes.',
    codeSnippet: '# Shell verification:\ncurl -Iv --trace-time https://target-host.internal',
  },
  {
    id: 'net-cors-02',
    docId: 'doc-web-security',
    docTitle: 'Browser Cross-Origin Resource Sharing Architecture',
    category: 'Web Security',
    section: 'CORS header Access-Control-Allow-Origin missing',
    page: 12,
    sourceUrl: 'https://fetch.spec.whatwg.org/#http-cors-protocol',
    date: '2026',
    tokens: [
      'cors', 'cross-origin', 'access-control-allow-origin', 'preflight', 'options', 'credentials', 'origin', 'headers'
    ],
    content:
      'The browser error "CORS header Access-Control-Allow-Origin missing" occurs when a script on origin A makes an XMLHttpRequest or fetch to origin B without the target server responding with matching CORS permissions. For requests with non-simple methods or custom authorization headers, the server must also respond successfully to an HTTP OPTIONS preflight request with HTTP 200 or 204.',
    codeSnippet: '// Express server CORS headers\napp.use((req, res, next) => {\n  res.setHeader("Access-Control-Allow-Origin", "https://trusted-app.com");\n  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");\n  next();\n});',
  },

  // 4. Hybrid Search, BM25 & Semantic Retrieval (Search Engine Core)
  {
    id: 'search-bm25-01',
    docId: 'doc-ir-foundations',
    docTitle: 'Information Retrieval & Probabilistic Ranking Models',
    category: 'Search Engine',
    section: 'BM25 Scoring & Document Length Normalization',
    page: 63,
    sourceUrl: 'https://en.wikipedia.org/wiki/Okapi_BM25',
    date: '2025',
    tokens: [
      'bm25', 'okapi', 'keyword', 'lexical', 'tf-idf', 'term', 'frequency', 'inverse', 'document', 'ranking'
    ],
    content:
      'Okapi BM25 is a non-linear ranking function used by search engines to score document relevance against keyword queries. It modifies standard TF-IDF by introducing term frequency saturation via parameter k1 (typically 1.2–2.0) and document length penalization via parameter b (typically 0.75), preventing long documents from receiving unfair advantage purely due to word repetition.',
    codeSnippet: 'Score(D, Q) = ∑ IDF(q_i) · [TF · (k1 + 1)] / [TF + k1 · (1 - b + b · (|D| / avgdl))]',
  },
  {
    id: 'search-rrf-02',
    docId: 'doc-ir-fusion',
    docTitle: 'Hybrid Search Systems: Vector & Lexical Fusion',
    category: 'Search Engine',
    section: 'Reciprocal Rank Fusion (RRF) & Reranking',
    page: 77,
    sourceUrl: 'https://dl.acm.org/doi/10.1145/1571941.1572114',
    date: '2026',
    tokens: [
      'reciprocal', 'rank', 'fusion', 'rrf', 'hybrid', 'search', 'vector', 'semantic', 'lexical', 'reranking', 'score'
    ],
    content:
      'Reciprocal Rank Fusion (RRF) combines retrieval rankings from disparate retrieval algorithms—such as dense vector embeddings and sparse BM25 indices—without requiring score calibration across incompatible scales. The RRF formula assigns each document score RRF(d) = ∑ 1 / (k + rank_i(d)), where k = 60 is an empirical smoothing constant mitigating outlier dominance.',
    codeSnippet: 'def rrf_score(ranks, k=60):\n    return sum(1.0 / (k + r) for r in ranks)',
  },

  // 5. Database Indexes & High-Performance Storage
  {
    id: 'db-pg-hnsw-01',
    docId: 'doc-postgres-vectors',
    docTitle: 'PostgreSQL Vector Search & Index Optimization',
    category: 'Databases',
    section: 'HNSW vs IVFFlat Vector Indexes in pgvector',
    page: 54,
    sourceUrl: 'https://github.com/pgvector/pgvector',
    date: '2026',
    tokens: [
      'postgresql', 'pgvector', 'hnsw', 'ivfflat', 'vector', 'index', 'cosine', 'recall', 'latency', 'm', 'ef_construction'
    ],
    content:
      'In pgvector, HNSW (Hierarchical Navigable Small World) constructs a multi-layer graph index delivering superior recall (98%+) and ultra-low search latencies compared to IVFFlat, without requiring preliminary training clustering. Parameter `m` governs maximum bidirectional connections per node, while `ef_construction` dictates exploration breadth during index creation.',
    codeSnippet: 'CREATE INDEX ON embeddings USING hnsw (vector_col vector_cosine_ops) WITH (m = 16, ef_construction = 64);',
  },

  // 6. Technology & Flight / Observation (VIEWTEX Brand Identity themes)
  {
    id: 'aero-soaring-01',
    docId: 'doc-aero-nature',
    docTitle: 'Bio-Inspired Aerodynamics & Thermal Soaring Dynamics',
    category: 'Aeronautics',
    section: 'Avian Soaring Dynamics: Eagles and Vultures',
    page: 38,
    sourceUrl: 'https://nature-aero.org/thermal-soaring-avians',
    date: '2025',
    tokens: [
      'aerodynamics', 'soaring', 'eagle', 'vulture', 'thermal', 'gliding', 'flight', 'observation', 'aspect', 'ratio'
    ],
    content:
      'Large soaring raptors such as golden eagles and vultures exploit atmospheric thermals through slotted primary feathers and high-camber wing geometry. Slotted wingtips diffuse induced drag vortices, enabling tight turning radii at minimum sink speed within rising thermal cores. Autonomous gliders mimic these sensory cues to achieve energy-neutral continuous flight.',
  },
  {
    id: 'astro-jwst-02',
    docId: 'doc-space-telescopes',
    docTitle: 'Infrared Astronomical Observatories',
    category: 'Science',
    section: 'Cryogenic Infrared Deep-Field Spectroscopy',
    page: 119,
    sourceUrl: 'https://webbtelescope.org/science',
    date: '2026',
    tokens: [
      'space', 'observation', 'infrared', 'deep-field', 'telescope', 'spectroscopy', 'optics', 'cryogenic', 'discovery'
    ],
    content:
      'Deep space astronomical observation relies on beryllium primary mirror segments coated in vapor-deposited gold, maximizing reflectance across near- and mid-infrared wavelengths (0.6 to 28 microns). Operating at L2 Lagrange point temperatures below 50 Kelvin prevents telescope thermal self-emission from drowning faint cosmological redshift signals.',
  },

  // 7. Software Architecture & Event Loop
  {
    id: 'arch-event-loop-01',
    docId: 'doc-runtime-engines',
    docTitle: 'Modern JavaScript Engine Execution Model',
    category: 'Architecture',
    section: 'MacroTasks, MicroTasks and Render Pipeline',
    page: 24,
    sourceUrl: 'https://html.spec.whatwg.org/multipage/webappapis.html#event-loops',
    date: '2026',
    tokens: [
      'javascript', 'event', 'loop', 'microtask', 'macrotask', 'promise', 'settimeout', 'queue', 'callstack'
    ],
    content:
      'The browser and Node.js event loop prioritizes the Microtask Queue (comprising `Promise.then`, `queueMicrotask`, and `MutationObserver` callbacks) over the Macrotask Queue (`setTimeout`, `setInterval`, I/O). The runtime will continuously drain all pending microtasks until empty before picking the next macrotask or yielding to the render tree layout phase.',
    codeSnippet: 'console.log(1);\nsetTimeout(() => console.log(4), 0);\nPromise.resolve().then(() => console.log(3));\nconsole.log(2);\n// Outputs: 1, 2, 3, 4',
  },
  {
    id: 'auth-pkce-02',
    docId: 'doc-oauth-security',
    docTitle: 'Modern OAuth 2.0 & OpenID Connect Protocols',
    category: 'Security',
    section: 'Authorization Code Flow with PKCE',
    page: 47,
    sourceUrl: 'https://datatracker.ietf.org/doc/html/rfc7636',
    date: '2025',
    tokens: [
      'oauth', 'pkce', 'proof', 'key', 'code', 'verifier', 'challenge', 'token', 'security', 'spa', 'authentication'
    ],
    content:
      'Proof Key for Code Exchange (PKCE, RFC 7636) mitigates authorization code interception attacks in single-page applications and public mobile clients that cannot securely store client secrets. The client generates a high-entropy cryptographically random `code_verifier`, derives `code_challenge = BASE64URL(SHA256(verifier))`, and passes it to the auth endpoint; the raw verifier is exchanged only at the token endpoint.',
  },
];
