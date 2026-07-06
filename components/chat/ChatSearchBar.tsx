'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FormEvent, useState } from 'react';

interface ChatSearchBarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
}

export default function ChatSearchBar({ onSearch, initialQuery = '' }: ChatSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <form onSubmit={handleSearch} className="mb-4">
      <div className="relative">
        <input
          type="text"
          placeholder="캐릭터 이름으로 검색"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full py-2 px-4 pr-10 bg-surface-elevated text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
          aria-label="검색어 입력"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-brand transition-colors"
          aria-label="검색"
        >
          <FontAwesomeIcon icon={faSearch} />
        </button>
      </div>
    </form>
  );
} 