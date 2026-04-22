'use client';

import { useState, useEffect, FormEvent, KeyboardEvent } from 'react';

interface SearchInputProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  defaultValue?: string;
}

export default function SearchInput({ onSearch, isLoading = false, defaultValue = '' }: SearchInputProps) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onSearch(trimmed);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const trimmed = value.trim();
      if (trimmed) onSearch(trimmed);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative flex items-center">
        <div className="absolute left-4 text-faceit-muted pointer-events-none">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Steam ID, Steam URL, or FACEIT nickname…"
          disabled={isLoading}
          className="w-full bg-faceit-card border border-faceit-border rounded-xl pl-12 pr-36 py-4 text-white placeholder-gray-500 text-base focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all disabled:opacity-50"
          autoFocus
        />

        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          className="absolute right-2 bg-orange-500 hover:bg-faceit-orange-hover disabled:bg-faceit-disabled-bg disabled:text-faceit-disabled-text text-white font-semibold px-5 py-2.5 rounded-lg transition-all text-sm cursor-pointer disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Searching
            </span>
          ) : (
            'Search'
          )}
        </button>
      </div>

      <p className="text-center text-gray-500 text-xs mt-3">
        Accepts: <span className="text-faceit-muted">76561198…</span> · <span className="text-faceit-muted">steamcommunity.com/id/…</span> · <span className="text-faceit-muted">FACEIT nickname</span>
      </p>
    </form>
  );
}
