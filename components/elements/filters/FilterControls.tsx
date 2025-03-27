'use client'

import { useState, useTransition, useCallback, useEffect } from 'react'
import TagList from '@/components/elements/tags/TagList'
import { useCharacterGridStoreData } from '@/store/useCharacterGridStoreData'

// 필터 컨트롤 컴포넌트 타입 정의
export interface FilterControlsProps {
  categoryId: number
  order: number
  setOrder: (order: number) => void
  nsfw: number
  setNsfw: (nsfw: number) => void
  onTagsChange?: (tags: string[]) => void
}

/**
 * 캐릭터 필터링을 위한 컨트롤 컴포넌트
 * - 정렬 옵션 (인기순/최신순)
 * - 이용등급 필터 (전체 이용가/짜릿모드/이용등급 전체)
 */
export default function FilterControls({
  categoryId,
  order,
  setOrder,
  nsfw,
  setNsfw,
  onTagsChange,
}: FilterControlsProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // useCharacterGridStoreData에서 태그 데이터 가져오기
  const { tags, isTagsLoading, tagsError, loadTags } = useCharacterGridStoreData()

  // 컴포넌트 마운트 시 태그 데이터 로드
  useEffect(() => {
    if (categoryId > 0) {
      loadTags(categoryId)
    }
  }, [categoryId, loadTags])

  const handleOrderChange = useCallback(
    (newOrder: number) => {
      startTransition(() => {
        setOrder(newOrder)
      })
    },
    [setOrder]
  )

  const handleNsfwChange = useCallback(
    (newNsfw: number) => {
      startTransition(() => {
        setNsfw(newNsfw)
        setIsDropdownOpen(false)
      })
    },
    [setNsfw]
  )

  const handleTagSelect = useCallback(
    (tagIds: string[]) => {
      console.log('선택된 태그:', tagIds)
      // 상위 컴포넌트로 선택된 태그 전달
      if (onTagsChange) {
        onTagsChange(tagIds)
      }
    },
    [onTagsChange]
  )

  return (
    <>
      {/* 필터링 컨트롤 */}
      <div className="flex flex-col justify-between items-start mb-6">
        {/* 상단: 태그 리스트 */}
        <div className="w-full mb-10">
          <TagList
            tags={tags || []}
            categoryId={categoryId.toString()}
            isLoading={isTagsLoading}
            onTagSelect={handleTagSelect}
          />
        </div>
        <div className="flex justify-between items-center w-full">
          {/* 왼쪽: 정렬 탭 버튼 */}
          <div className="flex border rounded-lg overflow-hidden">
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                order === 1
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-dark-background-lighter text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-dark-background-lighter/80'
              }`}
              onClick={() => handleOrderChange(1)}
              disabled={isPending}
            >
              인기순
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                order === 2
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-dark-background-lighter text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-dark-background-lighter/80'
              }`}
              onClick={() => handleOrderChange(2)}
              disabled={isPending}
            >
              최신순
            </button>
          </div>

          {/* 오른쪽: 등급 드롭다운 */}
          <div className="relative">
            <button
              className="px-4 py-2 text-sm font-medium border rounded-lg bg-white dark:bg-dark-background-lighter text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-dark-background-lighter/80 flex items-center gap-2"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={isPending}
            >
              {nsfw === 1 ? (
                <>
                  <span className="inline-flex items-center">
                    짜릿모드 가능
                    <span className="ml-1 w-2 h-2 rounded-full bg-red-500"></span>
                  </span>
                </>
              ) : nsfw === 2 ? (
                '전체 이용가'
              ) : (
                '이용등급 전체'
              )}
              <svg
                className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-background-light rounded-lg shadow-lg z-10 border overflow-hidden">
                <button
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-dark-background-lighter ${
                    nsfw === 2 ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : ''
                  }`}
                  onClick={() => handleNsfwChange(2)}
                  disabled={isPending}
                >
                  전체 이용가
                </button>
                <button
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-dark-background-lighter ${
                    nsfw === 1 ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' : ''
                  }`}
                  onClick={() => handleNsfwChange(1)}
                  disabled={isPending}
                >
                  <span className="inline-flex items-center">
                    짜릿모드 가능
                    <span className="ml-1 w-2 h-2 rounded-full bg-red-500"></span>
                  </span>
                </button>
                <button
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-dark-background-lighter ${
                    nsfw === 3 ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : ''
                  }`}
                  onClick={() => handleNsfwChange(3)}
                  disabled={isPending}
                >
                  이용등급 전체
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
