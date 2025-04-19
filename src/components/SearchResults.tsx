
import { Skeleton } from "@/components/ui/skeleton";
import SearchResult from "@/components/SearchResult";
import type { SearchResultProps } from "@/components/SearchResult";

interface SearchResultsProps {
  isSearching: boolean;
  searchPerformed: boolean;
  results: SearchResultProps[];
  onResultClick: (result: { title: string; content: string }) => void;
}

export const SearchResults = ({
  isSearching,
  searchPerformed,
  results,
  onResultClick
}: SearchResultsProps) => {
  if (isSearching) {
    return (
      <>
        {Array(3).fill(null).map((_, index) => (
          <div key={index} className="glass-effect rounded-lg p-4">
            <div className="flex gap-3">
              <Skeleton className="h-5 w-5" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          </div>
        ))}
      </>
    );
  }

  if (!searchPerformed) {
    return null;
  }

  if (results.length === 0) {
    return <div className="text-center text-white/70">No results found</div>;
  }

  return (
    <>
      {results.map((result, index) => (
        <SearchResult 
          key={index} 
          {...result} 
          onClick={() => onResultClick({ 
            title: result.title, 
            content: result.content || "" 
          })}
        />
      ))}
    </>
  );
};
