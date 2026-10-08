# VIEWTEX Architecture & Mathematical Specifications

## 1. Probabilistic Lexical Retrieval (Okapi BM25)

The BM25 retrieval module scores documents $D$ against query $Q = \{q_1, q_2, \dots, q_n\}$ using:

$$\text{Score}(D, Q) = \sum_{i=1}^{n} \text{IDF}(q_i) \cdot \frac{f(q_i, D) \cdot (k_1 + 1)}{f(q_i, D) + k_1 \cdot \left(1 - b + b \cdot \frac{|D|}{\text{avgdl}}\right)}$$

Where:
- $k_1 = 1.5$: Governs term frequency saturation.
- $b = 0.75$: Controls document length penalization against average document length $\text{avgdl}$.
- $\text{IDF}(q_i) = \ln\left(1 + \frac{N - n(q_i) + 0.5}{n(q_i) + 0.5}\right)$ with Robertson-Spärck Jones add-1 smoothing.

---

## 2. Dense Semantic Vector Embeddings & Cosine Distance

Document passages and query intents are embedded into a normalized 64-dimensional semantic space:

$$\mathbf{u} = \frac{\mathbf{v}}{\|\mathbf{v}\|_2}$$

Cosine similarity between query vector $\mathbf{q}$ and document vector $\mathbf{d}$:

$$\text{CosineSim}(\mathbf{q}, \mathbf{d}) = \mathbf{q} \cdot \mathbf{d} = \sum_{j=1}^{64} q_j \cdot d_j$$

Vector distance is derived as:

$$\text{VectorDistance}(\mathbf{q}, \mathbf{d}) = 1 - \text{CosineSim}(\mathbf{q}, \mathbf{d})$$

---

## 3. Adaptive Reciprocal Rank Fusion (RRF)

Results retrieved independently via sparse lexical and dense semantic models are merged without requiring calibrated score normalization:

$$\text{RRF}(d) = \frac{w_{\text{lexical}}}{k + \text{rank}_{\text{BM25}}(d)} + \frac{w_{\text{semantic}}}{k + \text{rank}_{\text{vector}}(d)}$$

Where:
- $k = 60$: Mitigates outlier domination from high ranks.
- $w_{\text{lexical}}, w_{\text{semantic}}$: Weights dynamically calibrated by the Adaptive Retrieval engine based on query intent classification.

---

## 4. The VIEWTEX Reason Layer

For each retrieved result, the Reason Layer computes a four-part decomposition:
1. **Semantic Relevance**: Proximity in conceptual cosine space ($0\% - 100\%$).
2. **Keyword Relevance**: Exact token and substring frequency saturation ($0\% - 100\%$).
3. **Context Relevance**: Alignment with conversation history and referents ($0\% - 100\%$).
4. **Final Retrieval Relevance**: Weighted composite confidence score.
