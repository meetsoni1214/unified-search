
import { toast } from "@/hooks/use-toast";

// Interface for Pinecone query response
export interface PineconeResult {
  id: string;
  score: number;
  metadata: {
    title: string;
    content: string;
    platform: string;
    timestamp: string;
    link: string;
  };
}

// Interface for searchParams
interface SearchParams {
  apiKey: string;
  indexName: string;
  namespace?: string;
  topK?: number;
  filter?: Record<string, any>;
}

/**
 * Query Pinecone with a text query
 */
export const queryPinecone = async (
  query: string,
  { apiKey, indexName, namespace, topK = 10, filter }: SearchParams
): Promise<PineconeResult[]> => {
  if (!query.trim() || !apiKey || !indexName) {
    return [];
  }

  try {
    // First, we need to generate embeddings for the query
    const embeddingResponse = await fetch(`https://api.openai.com/v1/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('openai_api_key') || ''}`
      },
      body: JSON.stringify({
        input: query,
        model: "text-embedding-ada-002"
      })
    });

    if (!embeddingResponse.ok) {
      throw new Error('Failed to generate embeddings');
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    // Now query Pinecone with the embedding
    const pineconeResponse = await fetch(`https://api.pinecone.io/v1/indexes/${indexName}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': apiKey
      },
      body: JSON.stringify({
        vector: queryEmbedding,
        topK,
        namespace,
        includeMetadata: true,
        filter
      })
    });

    if (!pineconeResponse.ok) {
      throw new Error('Failed to query Pinecone');
    }

    const results = await pineconeResponse.json();
    return results.matches.map((match: any) => ({
      id: match.id,
      score: match.score,
      metadata: match.metadata
    }));
  } catch (error) {
    console.error('Error querying Pinecone:', error);
    toast({
      title: "Search Error",
      description: error instanceof Error ? error.message : "Failed to perform semantic search",
      variant: "destructive"
    });
    return [];
  }
};
