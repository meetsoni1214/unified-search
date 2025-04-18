
import { Search } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
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
        <Search className="w-5 h-5 text-white/50 ml-3" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
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
