'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort } from '@fortawesome/free-solid-svg-icons';

export type ChatTabType = 'all' | 'favorites';

interface ChatTabsProps {
  activeTab: ChatTabType;
  onTabChange: (tab: ChatTabType) => void;
  onSortClick?: () => void;
}

export default function ChatTabs({ activeTab, onTabChange, onSortClick }: ChatTabsProps) {
  return (
    <div className="flex mb-4 border-b border-border-default">
      <button
        className={`py-2 px-4 font-medium text-sm transition-colors ${
          activeTab === 'all'
            ? 'text-brand border-b-2 border-brand'
            : 'text-text-muted hover:text-text-primary'
        }`}
        onClick={() => onTabChange('all')}
        aria-pressed={activeTab === 'all'}
      >
        모든 대화
      </button>
      <button
        className={`py-2 px-4 font-medium text-sm transition-colors ${
          activeTab === 'favorites'
            ? 'text-brand border-b-2 border-brand'
            : 'text-text-muted hover:text-text-primary'
        }`}
        onClick={() => onTabChange('favorites')}
        aria-pressed={activeTab === 'favorites'}
      >
        즐겨찾기
      </button>

      <div className="ml-auto">
        <button
          className="p-2 text-text-muted hover:text-brand transition-colors"
          onClick={onSortClick}
          aria-label="정렬 옵션"
        >
          <FontAwesomeIcon icon={faSort} />
        </button>
      </div>
    </div>
  );
} 