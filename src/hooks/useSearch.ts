
import { useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { performSemanticSearch } from "@/services/semanticSearchApi";
import type { SearchResultProps } from "@/components/SearchResult";

const mockResults: SearchResultProps[] = [
  {
    platform: "slack",
    title: "Team Discussion: Q1 Planning",
    preview: "Let's align on our key objectives for Q1. I think we should focus on...",
    timestamp: "2 hours ago",
    link: "#"
  },
  {
    platform: "jira",
    title: "PROJ-123: Implement Search Functionality",
    preview: "Add unified search capability across all connected platforms...",
    timestamp: "1 day ago",
    link: "#"
  },
  {
    platform: "confluence",
    title: "Project Documentation: Search Engine",
    preview: "Technical documentation for the unified search engine implementation...",
    timestamp: "3 days ago",
    link: "#"
  },
  {
    platform: "drive",
    title: "Q1 2025 Strategy Deck.pdf",
    preview: "Quarterly strategy presentation including market analysis...",
    timestamp: "1 week ago",
    link: "#"
  }
];

export function useSearch() {
  const [results, setResults] = useState<SearchResultProps[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      setSearchPerformed(false);
      return;
    }

    setIsSearching(true);
    
    try {
      const searchResults = await performSemanticSearch(query);
      
      const transformedResults = searchResults.map(result => ({
        platform: result.metadata.source as 'slack' | 'jira' | 'confluence' | 'drive',
        title: result.title || 'Document',
        preview: result.content.length > 150 
          ? result.content.substring(0, 150) + '...' 
          : result.content,
        timestamp: result.metadata.date || 'Recent',
        link: '#',
        score: result.score,
        content: result.content
      }));
      
      setResults(transformedResults);
    } catch (error) {
      console.error("Error performing semantic search:", error);
      toast({
        title: "Search Error",
        description: error.message || "Failed to perform semantic search",
        variant: "destructive"
      });
      
      const filteredResults = mockResults
        .filter(
          result =>
            result.title.toLowerCase().includes(query.toLowerCase()) ||
            result.preview.toLowerCase().includes(query.toLowerCase())
        );
      
      setResults(filteredResults);
    }
    
    setIsSearching(false);
    setSearchPerformed(true);
  }, []);

  return {
    results,
    isSearching,
    searchPerformed,
    handleSearch
  };
}
