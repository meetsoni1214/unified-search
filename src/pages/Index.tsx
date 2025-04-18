
import { useState, useCallback, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import SearchResult from "@/components/SearchResult";
import type { SearchResultProps } from "@/components/SearchResult";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, FileText, Database, BrainCircuit } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { checkApiHealth, performSemanticSearch } from "@/services/semanticSearchApi";

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
  const [results, setResults] = useState<SearchResultProps[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [isSemanticEnabled, setIsSemanticEnabled] = useState(false);

  useEffect(() => {
    const checkApiStatus = async () => {
      const isHealthy = await checkApiHealth();
      setIsSemanticEnabled(isHealthy);
      if (!isHealthy) {
        toast({
          title: "API Connection Error",
          description: "Could not connect to the semantic search API",
          variant: "destructive"
        });
      }
    };
    
    checkApiStatus();
  }, []);

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
      
      // Transform API results to match our UI format with the new response structure
      const transformedResults = searchResults
        // Sort results by score in descending order (highest first)
        .sort((a, b) => b.score - a.score)
        .map(result => ({
          platform: result.metadata.source as 'slack' | 'jira' | 'confluence' | 'drive',
          title: result.metadata.topic || result.metadata.file_name || 'Document',
          // Extract first 150 characters of content as preview
          preview: result.content.length > 150 
            ? result.content.substring(0, 150) + '...' 
            : result.content,
          timestamp: result.metadata.date || 'Recent',
          link: '#',
          score: result.score
        }));
      
      setResults(transformedResults);
    } catch (error) {
      console.error("Error performing semantic search:", error);
      toast({
        title: "Search Error",
        description: error.message || "Failed to perform semantic search",
        variant: "destructive"
      });
      
      // Fallback to mock results with basic filtering and sorting
      const filteredResults = mockResults
        .filter(
          result =>
            result.title.toLowerCase().includes(query.toLowerCase()) ||
            result.preview.toLowerCase().includes(query.toLowerCase())
        )
        // Sort mock results if needed (optional)
        .sort((a, b) => (b.score || 0) - (a.score || 0));
      
      setResults(filteredResults);
    }
    
    setIsSearching(false);
    setSearchPerformed(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center gradient-bg">
      <div className="w-full max-w-4xl px-4 py-8 relative">
        
        <h1 className="font-jakarta text-5xl font-bold text-center mb-8 text-white tracking-wide">
          <span className="bg-gradient-to-r from-white/90 to-white/70 bg-clip-text text-transparent">
            Unified Search
          </span>
        </h1>
        
        <div className="flex items-center justify-center mb-2">
          {isSemanticEnabled && (
            <div className="flex items-center gap-1 text-green-400 text-sm mb-2">
              <BrainCircuit className="h-4 w-4" />
              <span>Semantic Search Enabled</span>
            </div>
          )}
        </div>
        
        <SearchBar onSearch={handleSearch} isSearching={isSearching} />
        
        <div className="mt-8 space-y-4">
          {isSearching ? (
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
          ) : searchPerformed ? (
            results.length > 0 ? (
              results.map((result, index) => (
                <SearchResult key={index} {...result} />
              ))
            ) : (
              <div className="text-center text-white/70">No results found</div>
            )
          ) : (
            <div className="text-center space-y-8">
              <div className="text-white/70 max-w-2xl mx-auto space-y-6">
                <h2 className="text-3xl font-medium bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                  Search Across All Platforms
                </h2>
                <p className="text-lg text-white/50 leading-relaxed">
                  Find everything you need in one place. Access your team's knowledge instantly.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  {[
                    {
                      icon: MessageSquare,
                      title: "Conversations",
                      desc: "Search through Slack messages",
                      color: "from-[#4A154B]/20 to-[#4A154B]/10"
                    },
                    {
                      icon: FileText,
                      title: "Documentation",
                      desc: "Access Jira and Confluence",
                      color: "from-[#0052CC]/20 to-[#0052CC]/10"
                    },
                    {
                      icon: Database,
                      title: "Files",
                      desc: "Find documents in Drive",
                      color: "from-[#00AC47]/20 to-[#00AC47]/10"
                    }
                  ].map((item, i) => (
                    <div 
                      key={i} 
                      className="glass-effect p-6 rounded-xl relative overflow-hidden group hover:bg-white/5 transition-all duration-300"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                      <div className="relative z-10">
                        <item.icon className="w-8 h-8 mb-4 text-white/60" />
                        <h3 className="text-white font-medium mb-2">{item.title}</h3>
                        <p className="text-sm text-white/50">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;

