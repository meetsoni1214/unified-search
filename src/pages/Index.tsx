
import { useState } from "react";
import { useSearch } from "@/hooks/useSearch";
import { useApiHealth } from "@/hooks/useApiHealth";
import { SearchFeatures } from "@/components/SearchFeatures";
import { SearchResults } from "@/components/SearchResults";
import SearchBar from "@/components/SearchBar";
import SearchResultDialog from "@/components/SearchResultDialog";
import { BrainCircuit, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const { results, isSearching, searchPerformed, handleSearch } = useSearch();
  const isSemanticEnabled = useApiHealth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedResult, setSelectedResult] = useState<{ title: string; content: string } | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      // Fix the URL by using the API_BASE_URL from the semanticSearchApi service
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      const response = await fetch(`${API_URL}/search/process-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to process data');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to process data');
      }
      
      toast({
        title: "Processing Complete",
        description: `Successfully processed and updated search data. ${data.steps?.fileCopy || ''}`,
      });
    } catch (error) {
      console.error('Processing error:', error);
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "Failed to process data",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center gradient-bg">
      <div className="w-full max-w-4xl px-4 py-8 relative">
        <h1 className="font-jakarta text-5xl font-bold text-center mb-8 text-white tracking-wide">
          <span className="bg-gradient-to-r from-white/90 to-white/70 bg-clip-text text-transparent">
            Unified Search
          </span>
        </h1>
        
        <div className="flex items-center justify-center gap-4 mb-2">
          {isSemanticEnabled && (
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <BrainCircuit className="h-4 w-4" />
              <span>Semantic Search Enabled</span>
            </div>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSync}
            disabled={isSyncing}
            className="text-white/70 hover:text-white border-white/20 hover:bg-white/5"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Data'}
          </Button>
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
