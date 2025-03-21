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
    <div className="flex mb-4 border-b border-secondary-100 dark:border-dark-secondary-200">
      <button
        className={`py-2 px-4 font-medium text-sm transition-colors ${
          activeTab === 'all'
            ? 'text-primary-600 dark:text-dark-primary-600 border-b-2 border-primary-500 dark:border-dark-primary-500'
            : 'text-secondary-500 dark:text-dark-secondary-500 hover:text-secondary-700 dark:hover:text-dark-secondary-300'
        }`}
        onClick={() => onTabChange('all')}
        aria-pressed={activeTab === 'all'}
      >
        모든 대화
      </button>
      <button
        className={`py-2 px-4 font-medium text-sm transition-colors ${
          activeTab === 'favorites'
            ? 'text-primary-600 dark:text-dark-primary-600 border-b-2 border-primary-500 dark:border-dark-primary-500'
            : 'text-secondary-500 dark:text-dark-secondary-500 hover:text-secondary-700 dark:hover:text-dark-secondary-300'
        }`}
        onClick={() => onTabChange('favorites')}
        aria-pressed={activeTab === 'favorites'}
      >
        즐겨찾기
      </button>

      <div className="ml-auto">
        <button 
          className="p-2 text-secondary-500 dark:text-dark-secondary-500 hover:text-primary-500 dark:hover:text-dark-primary-600 transition-colors"
          onClick={onSortClick}
          aria-label="정렬 옵션"
        >
          <FontAwesomeIcon icon={faSort} />
        </button>
      </div>
    </div>
  );
} 