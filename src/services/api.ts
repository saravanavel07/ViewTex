import { SearchMode, SearchResult, AdaptiveWeights, Collection, HistoryItem } from '../search_engine/types';
import { viewtexEngine } from '../search_engine/engine';

export interface SearchApiRequest {
  query: string;
  mode?: SearchMode;
  collectionId?: string;
  weights?: { keyword: number; semantic: number };
  activeContext?: string;
}

export interface SearchApiResponse {
  query: string;
  normalizedQuery: string;
  mode: SearchMode;
  results: SearchResult[];
  totalResults: number;
  latencyMs: number;
  retrievalStrategy: string;
  adaptiveWeights: AdaptiveWeights;
  evidenceMap: any;
  typoCorrection: string | null;
  serviceNotice?: string;
}

export const searchApi = {
  // Execute Search via Backend REST API
  async search(req: SearchApiRequest): Promise<SearchApiResponse> {
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Graceful fallback to client-side in-memory engine if server network is interrupted
    }

    // In-memory fallback
    const local = viewtexEngine.search(req.query, req.mode, req.activeContext);
    return {
      query: req.query,
      normalizedQuery: req.query,
      mode: req.mode || 'smart',
      results: local.results,
      totalResults: local.results.length,
      latencyMs: local.metrics.totalLatencyMs,
      retrievalStrategy: local.metrics.adaptiveWeights.rationale,
      adaptiveWeights: local.metrics.adaptiveWeights,
      evidenceMap: local.evidenceMap,
      typoCorrection: local.typoCorrection,
    };
  },

  // Document Upload & Chunking
  async uploadDocument(data: {
    title: string;
    content: string;
    source?: string;
    fileType?: string;
    chunkSize?: number;
    chunkOverlap?: number;
    strategy?: string;
  }) {
    const res = await fetch('/api/documents/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Upload failed');
    return await res.json();
  },

  // List Documents
  async getDocuments() {
    const res = await fetch('/api/documents');
    if (!res.ok) throw new Error('Failed to fetch documents');
    return await res.json();
  },

  // Delete Document
  async deleteDocument(id: string) {
    const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete document');
    return await res.json();
  },

  // Demo Dataset Controls
  async clearDemoData() {
    const res = await fetch('/api/demo/clear', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to clear demo data');
    return await res.json();
  },

  async seedDemoData() {
    const res = await fetch('/api/demo/seed', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to seed demo data');
    return await res.json();
  },

  // Collections
  async getCollections(): Promise<Collection[]> {
    try {
      const res = await fetch('/api/collections');
      if (res.ok) return await res.json();
    } catch {}
    return [];
  },

  async createCollection(name: string, description: string): Promise<Collection> {
    const res = await fetch('/api/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    });
    if (!res.ok) throw new Error('Failed to create collection');
    return await res.json();
  },

  async addItemToCollection(colId: string, item: { resultId: string; title: string; source: string; snippet: string }) {
    const res = await fetch(`/api/collections/${colId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to save item to collection');
    return await res.json();
  },

  async removeItemFromCollection(colId: string, itemId: string) {
    const res = await fetch(`/api/collections/${colId}/items/${itemId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to remove item');
    return await res.json();
  },

  // Search History
  async getHistory(): Promise<HistoryItem[]> {
    try {
      const res = await fetch('/api/search/history');
      if (res.ok) return await res.json();
    } catch {}
    return [];
  },

  async clearHistory() {
    await fetch('/api/search/history', { method: 'DELETE' });
  },

  // Search Analytics & Health
  async getAnalytics() {
    const res = await fetch('/api/analytics');
    if (!res.ok) throw new Error('Failed to load analytics');
    return await res.json();
  },

  async getHealth() {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Failed to load health status');
    return await res.json();
  },

  // Evidence & Reason Direct Lookup
  async getEvidence(resultId: string) {
    const res = await fetch(`/api/search/${resultId}/evidence`);
    if (!res.ok) throw new Error('Evidence not found');
    return await res.json();
  },

  async getReason(resultId: string) {
    const res = await fetch(`/api/search/${resultId}/reason`);
    if (!res.ok) throw new Error('Reason not found');
    return await res.json();
  },
};
