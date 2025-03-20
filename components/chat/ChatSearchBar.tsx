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
          className="w-full py-2 px-4 pr-10 bg-secondary-50 dark:bg-dark-secondary-100/10 text-secondary-900 dark:text-dark-secondary-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-primary-500"
          aria-label="검색어 입력"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-500 dark:text-dark-secondary-500 hover:text-primary-500 dark:hover:text-dark-primary-500 transition-colors"
          aria-label="검색"
        >
          <FontAwesomeIcon icon={faSearch} />
        </button>
      </div>
    </form>
  );
} 