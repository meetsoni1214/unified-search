
import { useState, useCallback } from "react";
import SearchBar from "@/components/SearchBar";
import SearchResult from "@/components/SearchResult";
import type { SearchResultProps } from "@/components/SearchResult";
import { Skeleton } from "@/components/ui/skeleton";

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

const Index = () => {
  const [results, setResults] = useState<SearchResultProps[]>(mockResults);
  const [isSearching, setIsSearching] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = useCallback((query: string) => {
    // Clear search state when query is empty
    if (!query.trim()) {
      setResults(mockResults);
      setIsSearching(false);
      return;
    }

    // Set searching state
    setIsSearching(true);
    
    // Simulate search delay
    setTimeout(() => {
      const filteredResults = mockResults.filter(
        result =>
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.preview.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filteredResults);
      setIsSearching(false);
      setSearchPerformed(true);
    }, 300);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center gradient-bg">
      <div className="w-full max-w-4xl px-4 py-8">
        <h1 className="font-jakarta text-5xl font-bold text-center mb-8 text-white tracking-wide">
          <span className="bg-gradient-to-r from-white/90 to-white/70 bg-clip-text text-transparent">
            Unified Search
          </span>
        </h1>
        <SearchBar onSearch={handleSearch} isSearching={isSearching} />
        
        <div className="mt-8 space-y-4">
          {isSearching ? (
            // Loading skeletons
            Array(3).fill(null).map((_, index) => (
              <div key={index} className="glass-effect rounded-lg p-4">
                <div className="flex gap-3">
                  <Skeleton className="h-5 w-5" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              </div>
            ))
          ) : results.length > 0 ? (
            results.map((result, index) => (
              <SearchResult key={index} {...result} />
            ))
          ) : (
            <div className="text-center text-white/70">No results found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
