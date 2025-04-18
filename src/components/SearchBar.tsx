
import { Search, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
}

const SearchBar = ({ onSearch, isSearching }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Use debounce effect to update the debounced query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // Only trigger search when debounced query changes
  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="w-full max-w-3xl mx-auto">
      <div 
        className={`
          search-bar-glass
          relative 
          flex 
          items-center 
          p-2 
          rounded-2xl
          transition-all 
          duration-300 
          ${isFocused 
            ? 'ring-2 ring-white/20 border-white/20' 
            : 'border-white/10'
          }
        `}
      >
        {isSearching ? (
          <Loader2 className="w-5 h-5 text-white/50 ml-3 animate-spin" />
        ) : (
          <Search className="w-5 h-5 text-white/50 ml-3" />
        )}
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Ask me anything..."
          className="
            w-full 
            px-4 
            py-3 
            bg-transparent 
            text-white 
            placeholder-white/40
            focus:outline-none
            text-lg
          "
        />
      </div>
    </form>
  );
};

export default SearchBar;
