'use client';

import { useState } from 'react';

// 필터 컨트롤 컴포넌트 타입 정의
export interface FilterControlsProps {
  order: number;
  setOrder: (order: number) => void;
  nsfw: number;
  setNsfw: (nsfw: number) => void;
}

/**
 * 캐릭터 필터링을 위한 컨트롤 컴포넌트
 * - 정렬 옵션 (인기순/최신순)
 * - 이용등급 필터 (전체 이용가/짜릿모드/이용등급 전체)
 */
export default function FilterControls({ order, setOrder, nsfw, setNsfw }: FilterControlsProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <>
      {/* 필터링 컨트롤 */}
      <div className="flex justify-between items-center mb-6">
        {/* 왼쪽: 정렬 탭 버튼 */}
        <div className="flex border rounded-lg overflow-hidden">
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              order === 1 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white dark:bg-dark-background-lighter text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-dark-background-lighter/80'
            }`}
            onClick={() => setOrder(1)}
          >
            인기순
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              order === 2 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white dark:bg-dark-background-lighter text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-dark-background-lighter/80'
            }`}
            onClick={() => setOrder(2)}
          >
            최신순
          </button>
        </div>
        
        {/* 오른쪽: 등급 드롭다운 */}
        <div className="relative">
          <button 
            className={`flex items-center px-4 py-2 border rounded-lg bg-white dark:bg-dark-background-lighter text-sm ${
              nsfw === 1 
                ? 'border-red-500 text-red-600 dark:text-red-400' 
                : nsfw === 2 
                  ? 'border-green-500 text-green-600 dark:text-green-400' 
                  : 'border-blue-500 text-blue-600 dark:text-blue-400'
            }`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {nsfw === 1 ? '짜릿모드 가능' : nsfw === 2 ? '전체 이용가' : '이용등급 전체'}
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-background-light rounded-lg shadow-lg z-10 border overflow-hidden">
              <button 
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-dark-background-lighter ${
                  nsfw === 2 
                    ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                    : ''
                }`}
                onClick={() => { setNsfw(2); setIsDropdownOpen(false); }}
              >
                전체 이용가
              </button>
              <button 
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-dark-background-lighter ${
                  nsfw === 1 
                    ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' 
                    : ''
                }`}
                onClick={() => { setNsfw(1); setIsDropdownOpen(false); }}
              >
                <span className="inline-flex items-center">
                  짜릿모드 가능
                  <span className="ml-1 w-2 h-2 rounded-full bg-red-500"></span>
                </span>
              </button>
              <button 
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-dark-background-lighter ${
                  nsfw === 3 
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' 
                    : ''
                }`}
                onClick={() => { setNsfw(3); setIsDropdownOpen(false); }}
              >
                이용등급 전체
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 