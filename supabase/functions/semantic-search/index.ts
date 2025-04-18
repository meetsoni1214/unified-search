
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
    const { query, tenantId = 'default' } = await req.json()
    
    const pineconeApiKey = Deno.env.get('PINECONE_API_KEY')
    const pineconeIndexName = Deno.env.get('PINECONE_INDEX_NAME')
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')

    if (!pineconeApiKey || !pineconeIndexName || !openaiApiKey) {
      console.error('Missing required API keys:', {
        pineconeApiKey: !!pineconeApiKey,
        pineconeIndexName: !!pineconeIndexName,
        openaiApiKey: !!openaiApiKey
      });
      throw new Error('Missing required configuration. Please check Supabase secrets.')
    }
    
    console.log("Starting semantic search with query:", query)
    console.log("Using index:", pineconeIndexName)
    console.log("Tenant ID:", tenantId)

    // Set up LangChain embeddings
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: openaiApiKey,
      batchSize: 1,
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
    console.log("Querying Pinecone API with index:", pineconeIndexName);
    
    try {
      const pineconeResponse = await fetch(`https://api.pinecone.io/v1/indexes/${pineconeIndexName}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': pineconeApiKey
        },
        body: JSON.stringify({
          vector: queryEmbedding,
          topK: 10,
          includeMetadata: true,
          namespace: tenantId !== 'default' ? tenantId : undefined
        })
      });

      if (!pineconeResponse.ok) {
        const errorText = await pineconeResponse.text();
        console.error('Pinecone API error:', errorText);
        
        // Detailed error handling for different status codes
        if (pineconeResponse.status === 404) {
          throw new Error(`Pinecone index "${pineconeIndexName}" not found. Verify the index name.`);
        } else if (pineconeResponse.status === 401) {
          throw new Error('Invalid Pinecone API key. Please check your credentials.');
        } else {
          throw new Error(`Pinecone query failed: ${pineconeResponse.status} ${errorText}`);
        }
      }

      const results = await pineconeResponse.json();
      
      if (!results.matches) {
        console.warn('No matches found for the query');
        return new Response(JSON.stringify([]), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
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
    } catch (pineconeError) {
      console.error("Pinecone query error:", pineconeError);
      
      // Return an error response
      return new Response(
        JSON.stringify({ 
          error: pineconeError.message,
          message: "Failed to perform semantic search" 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Error in semantic-search function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        message: "There was an error with the semantic search." 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

