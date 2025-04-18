
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { query } = await req.json()
    
    const pineconeApiKey = Deno.env.get('PINECONE_API_KEY')
    const pineconeIndexName = Deno.env.get('PINECONE_INDEX_NAME')
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')

    if (!pineconeApiKey || !pineconeIndexName || !openaiApiKey) {
      throw new Error('Missing required API keys')
    }

    console.log("Starting semantic search with query:", query)
    console.log("Using index:", pineconeIndexName)

    // First, generate embeddings using OpenAI directly with fetch API instead of the SDK
    console.log("Generating embeddings with OpenAI...")
    const embeddingResponse = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "text-embedding-ada-002",
        input: query
      })
    });

    if (!embeddingResponse.ok) {
      const errorData = await embeddingResponse.text();
      console.error("OpenAI API error:", errorData);
      throw new Error(`Failed to generate embeddings: ${embeddingResponse.status} ${errorData}`);
    }

    const embeddingData = await embeddingResponse.json();
    
    if (!embeddingData.data || !embeddingData.data[0] || !embeddingData.data[0].embedding) {
      console.error("Unexpected OpenAI response format:", JSON.stringify(embeddingData));
      throw new Error('Invalid embedding response format from OpenAI');
    }

    console.log("Generated embeddings successfully");
    const queryEmbedding = embeddingData.data[0].embedding;

    // Query Pinecone with the embedding
    console.log("Querying Pinecone API...");
    const pineconeResponse = await fetch(`https://api.pinecone.io/v1/indexes/${pineconeIndexName}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': pineconeApiKey
      },
      body: JSON.stringify({
        vector: queryEmbedding,
        topK: 10,
        includeMetadata: true
      })
    });

    if (!pineconeResponse.ok) {
      const errorText = await pineconeResponse.text();
      console.error('Pinecone API error:', errorText);
      throw new Error(`Failed to query Pinecone: ${pineconeResponse.status} ${errorText}`);
    }

    const results = await pineconeResponse.json();
    
    if (!results.matches) {
      console.error('Unexpected Pinecone response format:', JSON.stringify(results));
      throw new Error('Invalid response format from Pinecone');
    }
    
    console.log("Pinecone query successful, matches found:", results.matches?.length || 0);
    
    // Transform results to match the frontend's expected format
    const transformedResults = results.matches.map((match) => ({
      platform: match.metadata?.platform || 'unknown',
      title: match.metadata?.title || 'Untitled',
      preview: match.metadata?.content || 'No preview available',
      timestamp: match.metadata?.timestamp || 'Unknown time',
      link: match.metadata?.link || '#',
      score: match.score
    }));

    return new Response(JSON.stringify(transformedResults), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in semantic-search function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
