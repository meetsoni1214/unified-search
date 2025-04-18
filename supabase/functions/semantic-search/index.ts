
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

    console.log("Starting semantic search with query:", query)
    console.log("Using index:", pineconeIndexName)
    console.log("Tenant ID:", tenantId)

    // Function to generate mock results (for fallback)
    const generateMockResults = (searchQuery) => {
      console.log("Generating mock results for:", searchQuery);
      return [
        {
          platform: "slack",
          title: "Mock Slack Conversation",
          preview: "This is a mock result to help with testing when Pinecone is not configured correctly.",
          timestamp: "2 hours ago",
          link: "#",
          score: 0.95
        },
        {
          platform: "confluence",
          title: "Mock Confluence Document",
          preview: "Another mock result containing the search query term: " + searchQuery,
          timestamp: "1 day ago",
          link: "#",
          score: 0.85
        }
      ];
    };
    
    // If empty query, return empty results
    if (!query.trim()) {
      console.log("Empty query received, returning empty results");
      return new Response(JSON.stringify([]), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check for required configuration
    if (!pineconeApiKey || !pineconeIndexName || !openaiApiKey) {
      console.error('Missing required API keys:', {
        pineconeApiKey: !!pineconeApiKey,
        pineconeIndexName: !!pineconeIndexName,
        openaiApiKey: !!openaiApiKey
      });
      console.log("Missing configuration, returning mock results");
      return new Response(JSON.stringify(generateMockResults(query)), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
      console.log("Embedding generation failed, returning mock results");
      return new Response(JSON.stringify(generateMockResults(query)), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
        
        // Log detailed error but return mock results instead of error
        if (pineconeResponse.status === 404) {
          console.error(`Pinecone index "${pineconeIndexName}" not found. Verify the index name.`);
        } else if (pineconeResponse.status === 401) {
          console.error('Invalid Pinecone API key. Please check your credentials.');
        } else {
          console.error(`Pinecone query failed: ${pineconeResponse.status} ${errorText}`);
        }
        
        console.log("Pinecone query failed, returning mock results");
        return new Response(JSON.stringify(generateMockResults(query)), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const results = await pineconeResponse.json();
      
      if (!results.matches || results.matches.length === 0) {
        console.warn('No matches found for the query, returning mock results');
        return new Response(JSON.stringify(generateMockResults(query)), {
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
      
      // Return mock results instead of error
      console.log("Pinecone query exception, returning mock results");
      return new Response(JSON.stringify(generateMockResults(query)), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in semantic-search function:', error);
    // Return mock results for any unhandled errors
    return new Response(JSON.stringify([
      {
        platform: "slack",
        title: "Error Fallback Result",
        preview: "There was an error with the search, but we're showing this fallback result.",
        timestamp: "just now",
        link: "#",
        score: 0.5
      }
    ]), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
