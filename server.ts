import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { serverSearchService } from './src/server_engine/service';
import { engineDb } from './src/server_engine/db';
import { DocumentChunker } from './src/server_engine/chunker';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// ==========================================
// 1. SEARCH APIS (Section 27)
// ==========================================

// Unified Smart Search
app.post('/api/search', (req, res) => {
  try {
    const { query, mode, collectionId, weights, activeContext } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Field "query" is required as a string.' });
    }

    const result = serverSearchService.executeSearch({
      query,
      mode: mode || 'smart',
      collectionId,
      weights,
      activeContext,
    });

    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Search execution failed', details: err.message });
  }
});

// Dedicated Keyword Search
app.post('/api/search/keyword', (req, res) => {
  try {
    const { query, collectionId, activeContext } = req.body;
    if (!query) return res.status(400).json({ error: 'Field "query" is required.' });

    const result = serverSearchService.executeSearch({
      query,
      mode: 'exact',
      collectionId,
      activeContext,
    });

    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Keyword search failed', details: err.message });
  }
});

// Dedicated Semantic Search
app.post('/api/search/semantic', (req, res) => {
  try {
    const { query, collectionId, activeContext } = req.body;
    if (!query) return res.status(400).json({ error: 'Field "query" is required.' });

    const result = serverSearchService.executeSearch({
      query,
      mode: 'semantic',
      collectionId,
      activeContext,
    });

    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Semantic search failed', details: err.message });
  }
});

// Dedicated Hybrid Search
app.post('/api/search/hybrid', (req, res) => {
  try {
    const { query, collectionId, weights, activeContext } = req.body;
    if (!query) return res.status(400).json({ error: 'Field "query" is required.' });

    const result = serverSearchService.executeSearch({
      query,
      mode: 'hybrid',
      collectionId,
      weights,
      activeContext,
    });

    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Hybrid search failed', details: err.message });
  }
});

// Specific Result Evidence Lookup
app.get('/api/search/:id/evidence', (req, res) => {
  const { id } = req.params;
  const evidence = serverSearchService.getEvidenceById(id);
  if (!evidence) {
    return res.status(404).json({ error: `Evidence for result ID ${id} not found.` });
  }
  return res.json(evidence);
});

// Specific Result Reason Layer Lookup
app.get('/api/search/:id/reason', (req, res) => {
  const { id } = req.params;
  const reason = serverSearchService.getReasonById(id);
  if (!reason) {
    return res.status(404).json({ error: `Reason layer for result ID ${id} not found.` });
  }
  return res.json(reason);
});

// ==========================================
// 2. DOCUMENT MANAGEMENT & INDEXING APIS (Section 4 & 27)
// ==========================================

// Document Upload & Chunking Indexing
app.post('/api/documents/upload', (req, res) => {
  try {
    const { title, source, content, fileType, chunkSize, chunkOverlap, strategy } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Both "title" and "content" are required.' });
    }

    const docId = `doc_${Date.now()}`;
    const chunks = DocumentChunker.chunkDocument(docId, title, source || title, content, {
      chunkSize: chunkSize || 500,
      chunkOverlap: chunkOverlap || 80,
      strategy: strategy || 'section',
    });

    const storedDoc = {
      id: docId,
      title,
      source: source || title,
      file_type: fileType || 'txt',
      total_chunks: chunks.length,
      created_at: new Date().toISOString(),
      is_demo: false,
    };

    engineDb.addDocument(storedDoc, chunks);
    serverSearchService.refreshIndexes();

    return res.status(201).json({
      message: 'Document successfully indexed into active vector and keyword stores.',
      document: storedDoc,
      chunks_count: chunks.length,
      chunks_preview: chunks.slice(0, 3),
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Document upload and chunking failed', details: err.message });
  }
});

// List Indexed Documents
app.get('/api/documents', (req, res) => {
  const docs = engineDb.getDocuments();
  const totalChunks = engineDb.getAllChunks().length;
  return res.json({
    total_documents: docs.length,
    total_chunks: totalChunks,
    is_demo_active: engineDb.isDemoActive(),
    documents: docs,
  });
});

// Delete Document
app.delete('/api/documents/:id', (req, res) => {
  const { id } = req.params;
  const deleted = engineDb.deleteDocument(id);
  if (!deleted) {
    return res.status(404).json({ error: `Document ${id} not found.` });
  }
  serverSearchService.refreshIndexes();
  return res.json({ message: `Document ${id} and all associated vector chunks removed.` });
});

// Demo Dataset Controls (Section 45)
app.post('/api/demo/clear', (req, res) => {
  engineDb.clearDemoDataset();
  serverSearchService.refreshIndexes();
  return res.json({ message: 'Demo dataset cleared. Search index now contains user documents only.' });
});

app.post('/api/demo/seed', (req, res) => {
  engineDb.seedDemoDataset();
  serverSearchService.refreshIndexes();
  return res.json({ message: 'Demo dataset restored.' });
});

// ==========================================
// 3. COLLECTIONS APIS (Section 23 & 27)
// ==========================================

app.get('/api/collections', (req, res) => {
  return res.json(engineDb.getCollections());
});

app.post('/api/collections', (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Collection "name" is required.' });

  const col = engineDb.createCollection(name, description || '');
  return res.status(201).json(col);
});

app.post('/api/collections/:id/items', (req, res) => {
  const { id } = req.params;
  const { resultId, title, source, snippet } = req.body;
  if (!resultId || !title) {
    return res.status(400).json({ error: 'Fields "resultId" and "title" are required.' });
  }

  const success = engineDb.addItemToCollection(id, { resultId, title, source: source || '', snippet: snippet || '' });
  if (!success) return res.status(404).json({ error: `Collection ${id} not found.` });

  return res.json({ message: 'Result saved to collection.', collection: engineDb.getCollection(id) });
});

app.delete('/api/collections/:id/items/:itemId', (req, res) => {
  const { id, itemId } = req.params;
  const success = engineDb.removeItemFromCollection(id, itemId);
  if (!success) return res.status(404).json({ error: 'Collection or item not found.' });

  return res.json({ message: 'Item removed from collection.' });
});

// ==========================================
// 4. HISTORY APIS (Section 24 & 27)
// ==========================================

app.get('/api/search/history', (req, res) => {
  return res.json(engineDb.getHistory());
});

app.delete('/api/search/history', (req, res) => {
  engineDb.clearHistory();
  return res.json({ message: 'Search history cleared.' });
});

app.delete('/api/search/history/:id', (req, res) => {
  const { id } = req.params;
  engineDb.deleteHistoryItem(id);
  return res.json({ message: `History item ${id} deleted.` });
});

// ==========================================
// 5. SEARCH ANALYTICS & HEALTH (Section 29 & 30)
// ==========================================

app.get('/api/analytics', (req, res) => {
  return res.json(engineDb.getAnalytics());
});

app.get('/api/health', (req, res) => {
  return res.json({
    engine: 'VIEWTEX Intelligent Hybrid Search',
    version: '1.0.0',
    philosophy: 'SEARCH -> UNDERSTAND -> RETRIEVE -> RANK -> EXPLAIN',
    status: 'Healthy',
    components: serverSearchService.getHealthStatus(),
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// 6. GROUNDED SUMMARY API (Section 25 & 26)
// ==========================================

app.post('/api/summary', async (req, res) => {
  const { query, evidence } = req.body;

  if (!query || !Array.isArray(evidence) || evidence.length === 0) {
    return res.status(400).json({ error: 'Query and array of evidence items are required.' });
  }

  // Anti-hallucination check (Section 26)
  if (evidence.length === 0) {
    return res.json({
      summary: 'VIEWTEX could not find enough evidence to provide a reliable answer.',
      isGrounded: false,
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI();
      const evidenceContext = evidence
        .map(
          (e: { index: number; source: string; passage: string }) =>
            `[${e.index}] Source: ${e.source}\nPassage: ${e.passage}`
        )
        .join('\n\n');

      const prompt = `You are the VIEWTEX Grounded Synthesis Engine.
Synthesize a concise, direct, factual summary answering the following user inquiry:
"${query}"

STRICT ANTI-HALLUCINATION RULES:
1. Ground your statements solely on the retrieved evidence below.
2. Every major claim must include an inline bracket citation matching the evidence index, e.g. [1], [2].
3. Do NOT invent facts, outside knowledge, or uncited assertions.
4. Keep the summary under 120 words.

RETRIEVED EVIDENCE:
${evidenceContext}

SUMMARY:`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      if (response && response.text) {
        return res.json({
          summary: response.text.trim(),
          isGrounded: true,
          method: 'gemini-3.8-flash',
        });
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to deterministic synthesis:', err);
    }
  }

  // High-fidelity fallback deterministic synthesizer
  const parts = evidence.map((e: { index: number; passage: string }) => {
    const firstSentence = e.passage.split(/(?<=[.!?])\s+/)[0] || e.passage;
    return `${firstSentence} [${e.index}]`;
  });

  return res.json({
    summary: `Based on verified retrieved documents for "${query}": ${parts.join(' Furthermore, ')}`,
    isGrounded: true,
    method: 'extractive-synthesizer',
  });
});

// ==========================================
// VITE / STATIC SERVING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VIEWTEX Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
