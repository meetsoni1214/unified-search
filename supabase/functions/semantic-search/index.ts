
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { OpenAIEmbeddings } from "npm:@langchain/openai@0.0.14"

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
    console.log("Using LangChain with index:", pineconeIndexName)

    // Set up LangChain embeddings
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: openaiApiKey,
      batchSize: 1, // Process one text at a time
      modelName: "text-embedding-ada-002"
    });

    console.log("Generating embeddings with LangChain...")
    
    // Generate embeddings using LangChain
    let queryEmbedding;
    try {
      queryEmbedding = await embeddings.embedQuery(query);
      console.log("Generated embeddings successfully");
    } catch (embeddingError) {
      console.error("LangChain embedding error:", embeddingError);
      throw new Error(`Failed to generate embeddings: ${embeddingError.message}`);
    }

    // Query Pinecone directly with the embedding from LangChain
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
      
      // If we got a 404, the index might not exist or be incorrectly named
      if (pineconeResponse.status === 404) {
        console.error('Index not found. Check the PINECONE_INDEX_NAME value.');
        throw new Error(`Pinecone index "${pineconeIndexName}" not found. Please verify the index name.`);
      } else {
        throw new Error(`Failed to query Pinecone: ${pineconeResponse.status} ${errorText}`);
      }
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
