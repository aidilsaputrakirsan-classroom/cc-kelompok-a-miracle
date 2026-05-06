import { Search, X } from 'lucide-react';

/**
 * SearchBar Component
 * A reusable search input with a clear button.
 */
export const SearchBar = ({ value, onChange, onClear, placeholder = "Cari..." }) => {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
      <input 
        type="text" 
        placeholder={placeholder} 
        aria-label="search-input"
        className="w-full pl-12 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-[#660000] dark:focus:ring-red-400 transition-all text-sm text-slate-900 dark:text-white outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button 
          onClick={onClear}
          aria-label="clear-search"
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400 dark:text-slate-500"
          title="Hapus pencarian"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;