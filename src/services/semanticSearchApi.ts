
interface SearchResult {
  id: string;
  score: number;
  content: string;
  title?: string; // Add title property as optional
  metadata: {
    document_id?: string;
    file_name?: string;
    file_type?: string;
    source?: string;
    topic?: string;
    date?: string;
    [key: string]: any;
  };
}

const API_BASE_URL = 'http://localhost:3000';

export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/search/health`);
    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}

export async function performSemanticSearch(query: string, topK: number = 5): Promise<SearchResult[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/search/semantic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, topK }),
    });

    if (!response.ok) {
      throw new Error(`Search failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Semantic search error:', error);
    throw error;
  }
}

export async function storeDocuments(documents: Array<{ text: string; metadata: any }>) {
  try {
    const response = await fetch(`${API_BASE_URL}/search/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ documents }),
    });

    if (!response.ok) {
      throw new Error(`Failed to store documents: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Store documents error:', error);
    throw error;
  }
}

export async function deleteDocuments(ids: string[]) {
  try {
    const response = await fetch(`${API_BASE_URL}/search/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete documents: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Delete documents error:', error);
    throw error;
  }
}
