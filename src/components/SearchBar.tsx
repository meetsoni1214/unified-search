
import { Search } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="search-bar-glass relative flex items-center p-2 rounded-xl">
        <Search className="w-5 h-5 text-gray-400 ml-3" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search across all platforms..."
          className="w-full px-4 py-3 bg-transparent text-white placeholder-gray-400 focus:outline-none"
        />
      </div>
    </form>
  );
};

export default SearchBar;
