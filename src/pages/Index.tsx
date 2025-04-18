
import SearchBar from "@/components/SearchBar";
import SearchResult from "@/components/SearchResult";
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

const Index = () => {
  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
    // Will be implemented in later phases
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="w-full max-w-4xl px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-white">Unified Search</h1>
        <SearchBar onSearch={handleSearch} />
        
        <div className="mt-8 space-y-4">
          {mockResults.map((result, index) => (
            <SearchResult key={index} {...result} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
