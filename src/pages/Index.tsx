
import { useState } from "react";
import { useSearch } from "@/hooks/useSearch";
import { useApiHealth } from "@/hooks/useApiHealth";
import { SearchFeatures } from "@/components/SearchFeatures";
import { SearchResults } from "@/components/SearchResults";
import SearchBar from "@/components/SearchBar";
import SearchResultDialog from "@/components/SearchResultDialog";
import { BrainCircuit } from "lucide-react";

const Index = () => {
  const { results, isSearching, searchPerformed, handleSearch } = useSearch();
  const isSemanticEnabled = useApiHealth();
  const [selectedResult, setSelectedResult] = useState<{ title: string; content: string } | null>(null);

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
          <SearchResults 
            isSearching={isSearching}
            searchPerformed={searchPerformed}
            results={results}
            onResultClick={setSelectedResult}
          />
          
          {!searchPerformed && <SearchFeatures />}
        </div>
      </div>

      {selectedResult && (
        <SearchResultDialog
          isOpen={!!selectedResult}
          onClose={() => setSelectedResult(null)}
          title={selectedResult.title}
          content={selectedResult.content}
        />
      )}
    </div>
  );
};

export default Index;
