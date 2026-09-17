
// A lightweight RAG (Retrieval-Augmented Generation) engine
// In production, swap this keyword-based search with an actual Vector DB (e.g., Pinecone) and OpenAI Embeddings.

export interface RAGDocument {
  id: string;
  title: string;
  content: string;
}

export const KNOWLEDGE_BASE: RAGDocument[] = [
  { 
    id: 'doc_001', 
    title: 'Enterprise Liability Policy (Legal)', 
    content: 'Vendors must accept a minimum liability cap of 3x the contract value. Under no circumstances can liability be capped at 1x or limited to fees paid. Indemnification must survive termination.' 
  },
  { 
    id: 'doc_002', 
    title: 'IT Hardware Procurement Guidelines', 
    content: 'All laptops must be purchased through approved vendors (Dell, Apple). Standard employee issue is MacBook Pro 14-inch or Dell XPS 15. Maximum budget is $2500 per device. Delivery SLA must be within 5 business days.' 
  },
  { 
    id: 'doc_003', 
    title: 'Auto-Renewal & Termination', 
    content: 'Auto-renewal clauses are strictly prohibited unless they allow cancellation with a minimum of 90 days written notice prior to renewal, with price increases capped at a maximum of 3% YoY.' 
  },
  { 
    id: 'doc_004', 
    title: 'Standard Payment Terms (Finance)', 
    content: 'Standard payment terms for all enterprise contractors and software suppliers are Net 60. Net 30 is only permitted for small businesses with an approved exemption from the VP of Finance.' 
  }
];

export async function retrieveContext(query: string): Promise<RAGDocument[]> {
  // SIMULATED VECTOR SEARCH: Using keyword overlap scoring
  // Production Architecture: 
  // 1. const queryVector = await openai.embeddings.create({ model: 'text-embedding-3-small', input: query });
  // 2. const matches = await pinecone.index('procurement').query({ vector: queryVector, topK: 2 });
  
  const terms = query.toLowerCase().split(/\W+/).filter(t => t.length > 2);
  
  let scoredDocs = KNOWLEDGE_BASE.map(doc => {
    let score = 0;
    const docText = (doc.title + " " + doc.content).toLowerCase();
    terms.forEach(term => {
      if (docText.includes(term)) {
        score += 1;
      }
    });
    return { ...doc, score };
  });

  // Sort by highest relevance, return top 2 matches
  scoredDocs.sort((a, b) => b.score - a.score);
  return scoredDocs.filter(d => d.score > 0).slice(0, 2);
}
