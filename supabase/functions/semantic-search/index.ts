
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.3.0"

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

    // First, generate embeddings using OpenAI
    const configuration = new Configuration({ apiKey: openaiApiKey })
    const openai = new OpenAIApi(configuration)

    const embeddingResponse = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: query,
    })

    const queryEmbedding = embeddingResponse.data.data[0].embedding

    // Query Pinecone with the embedding
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
    })

    if (!pineconeResponse.ok) {
      throw new Error('Failed to query Pinecone')
    }

    const results = await pineconeResponse.json()
    
    // Transform results to match the frontend's expected format
    const transformedResults = results.matches.map((match: any) => ({
      platform: match.metadata.platform || 'unknown',
      title: match.metadata.title || 'Untitled',
      preview: match.metadata.content || 'No preview available',
      timestamp: match.metadata.timestamp || 'Unknown time',
      link: match.metadata.link || '#',
      score: match.score
    }))

    return new Response(JSON.stringify(transformedResults), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in semantic-search function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
