'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import TagList from '@/components/elements/tags/TagList'
import { useCharacterGridStoreData } from '@/store/useCharacterGridStoreData'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRotate, faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { Clock, Flame } from 'lucide-react'

// 필터 컨트롤 컴포넌트 타입 정의
interface FilterControlsProps {
  categoryId?: number | string
}

/**
 * 캐릭터 필터링을 위한 컨트롤 컴포넌트
 * - 정렬 옵션 (인기순/최신순)
 * - 이용등급 필터 (전체 이용가/짜릿모드/이용등급 전체)
 * - 태그 필터
 */
export default function FilterControls({ categoryId }: FilterControlsProps) {
  // 초기화 여부를 추적하는 ref
  const isInitialized = useRef(false)

  // 드롭다운 UI 상태
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // 태그 목록 확장 상태 관리 (localStorage에 저장)
  const [isTagListExpanded, setIsTagListExpanded] = useState(() => {
    // 브라우저 환경에서만 localStorage 접근
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tagListExpanded')
      return saved ? JSON.parse(saved) : false
    }
    return false
  })

  // 중앙 스토어에서 상태와 액션 가져오기
  const { filter, tags, isTagsLoading, currentTags, isLoading, updateFilter, updateTags, changeCategory } =
    useCharacterGridStoreData()

  // URL 파라미터 가져오기 (초기 로드시에만 사용)
  const searchParams = useSearchParams()

  // isTagListExpanded 상태 변경 시 localStorage에 저장
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tagListExpanded', JSON.stringify(isTagListExpanded))
    }
  }, [isTagListExpanded])

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    if (!isInitialized.current && categoryId) {
      // URL에서 파라미터 가져오기 (초기 로드시에만)
      const orderFromUrl = searchParams?.get('order') ? parseInt(searchParams.get('order') as string, 10) : null
      const nsfwFromUrl = searchParams?.get('nsfw') ? parseInt(searchParams.get('nsfw') as string, 10) : null
      const tagsFromUrl = searchParams?.get('tags') ? searchParams.get('tags')?.split('&') || [] : []

      // 필터 설정
      if (orderFromUrl || nsfwFromUrl) {
        updateFilter({
          order: orderFromUrl || filter.order,
          nsfw: nsfwFromUrl || filter.nsfw,
        })
      } else {
        // 카테고리 변경 (태그가 있는 경우 태그도 같이 설정됨)
        if (tagsFromUrl.length > 0) {
          // 카테고리 변경 후 태그 설정
          changeCategory(categoryId.toString()).then(() => {
            updateTags(tagsFromUrl)
          })
        } else {
          // 카테고리만 변경
          changeCategory(categoryId.toString())
        }
      }

      isInitialized.current = true
    }
  }, [categoryId, filter.order, filter.nsfw, searchParams, updateFilter, changeCategory, updateTags])

  // categoryId가 변경될 때 데이터 초기화 및 재로드
  useEffect(() => {
    if (isInitialized.current && categoryId) {
      // 카테고리 변경
      changeCategory(categoryId.toString())
    }
  }, [categoryId, changeCategory])

  // 정렬 변경 핸들러
  const handleOrderChange = useCallback(
    (newOrder: number) => {
      // 이미 같은 값이면 무시
      if (filter.order === newOrder) return

      // 스토어 업데이트
      updateFilter({ order: newOrder })
    },
    [filter.order, updateFilter]
  )

  // NSFW 필터 변경 핸들러
  const handleNsfwChange = useCallback(
    (newNsfw: number) => {
      // 이미 같은 값이면 무시
      if (filter.nsfw === newNsfw) return

      // 스토어 업데이트
      updateFilter({ nsfw: newNsfw })

      // 드롭다운 닫기
      setIsDropdownOpen(false)
    },
    [filter.nsfw, updateFilter]
  )

  // 태그 핸들러
  const handleTagSelect = useCallback(
    (tagIds: string[]) => {
      // 이미 같은 값이면 무시 (깊은 비교)
      if (JSON.stringify(currentTags) === JSON.stringify(tagIds)) return

      // 스토어 업데이트
      updateTags(tagIds)
    },
    [currentTags, updateTags]
  )

  // 태그 필터 초기화
  const handleTagRefresh = useCallback(() => {
    // 이미 태그가 없으면 무시
    if (currentTags.length === 0) return

    // 선택된 태그 초기화
    updateTags([])
  }, [currentTags, updateTags])

  // 태그 목록 토글
  const toggleTagList = useCallback(() => {
    setIsTagListExpanded((prev: boolean) => !prev)
  }, [])

  return (
    <>
      {/* 필터링 컨트롤 */}
      <div className="flex flex-col justify-between items-start mb-6">
        <div className="flex justify-between items-center w-full">
          {/* 왼쪽: 정렬 탭 버튼 */}
          <div className="flex border rounded-lg overflow-hidden">
            <button
              className={`px-2 md:px-4 py-2 text-sm font-medium transition-colors ${
                filter.order === 2
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-dark-background-lighter text-gray-800 dark:text-black hover:bg-gray-100 dark:hover:bg-dark-background-lighter/80'
              }`}
              onClick={() => handleOrderChange(2)}
              disabled={isLoading}
            >
              <Clock className="w-4 h-4 block md:hidden" />
              <span className="hidden md:block">최신순</span>
            </button>
            <button
              className={`px-2 md:px-4 py-2 text-sm font-medium transition-colors ${
                filter.order === 1
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-dark-background-lighter text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-dark-background-lighter/80'
              }`}
              onClick={() => handleOrderChange(1)}
              disabled={isLoading}
            >
              <Flame className="w-4 h-4 block md:hidden" />
              <span className="hidden md:block">인기순</span>
            </button>
          </div>

          {/* 오른쪽: 이용등급 드롭다운과 태그 컨트롤 */}
          <div className="flex items-center gap-2">
            {/* 태그 컨트롤 버튼들 */}
            <div className="flex gap-2">
              {/* 태그 필터 초기화 버튼 */}
              <button
                className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-dark-secondary-800 dark:hover:bg-dark-secondary-700 flex items-center justify-center"
                onClick={handleTagRefresh}
                aria-label="태그 필터 초기화"
                disabled={isLoading || currentTags.length === 0}
              >
                <FontAwesomeIcon
                  icon={faRotate}
                  className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600 dark:text-dark-secondary-300"
                />
              </button>

              {/* 태그 목록 토글 버튼 */}
              <button
                className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-dark-secondary-800 dark:hover:bg-dark-secondary-700 flex items-center justify-center"
                onClick={toggleTagList}
                aria-label={isTagListExpanded ? '태그 목록 접기' : '태그 목록 펼치기'}
                disabled={isLoading}
              >
                <FontAwesomeIcon
                  icon={isTagListExpanded ? faChevronUp : faChevronDown}
                  className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600 dark:text-dark-secondary-300"
                />
              </button>
            </div>

            {/* 이용등급 드롭다운 */}
            <div className="relative">
              <button
                className="px-2.5 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium border rounded-lg dark-background-lighter dark:bg-dark-background-lighter text-black dark:text-white dark:hover:bg-dark-background-lighter/80 flex items-center gap-1.5 md:gap-2"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                disabled={isLoading}
              >
                {filter.nsfw === 1 ? (
                  <>
                    <span className="inline-flex items-center">
                      짜릿모드 가능
                      <span className="ml-1 w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-red-500"></span>
                    </span>
                  </>
                ) : filter.nsfw === 2 ? (
                  '전체 이용가'
                ) : (
                  '이용등급 전체'
                )}
                <svg
                  className={`w-3.5 md:w-4 h-3.5 md:h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-1 md:mt-2 w-40 md:w-48 bg-white dark:bg-dark-background-light rounded-lg shadow-lg z-10 border overflow-hidden">
                  <button
                    className={`block w-full text-left px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm hover:bg-gray-100 dark:hover:bg-dark-background-lighter ${
                      filter.nsfw === 2 ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : ''
                    }`}
                    onClick={() => handleNsfwChange(2)}
                    disabled={isLoading}
                  >
                    전체 이용가
                  </button>
                  <button
                    className={`block w-full text-left px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm hover:bg-gray-100 dark:hover:bg-dark-background-lighter ${
                      filter.nsfw === 1 ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' : ''
                    }`}
                    onClick={() => handleNsfwChange(1)}
                    disabled={isLoading}
                  >
                    <span className="inline-flex items-center">짜릿모드 가능</span>
                  </button>
                  <button
                    className={`block w-full text-left px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm hover:bg-gray-100 dark:hover:bg-dark-background-lighter ${
                      filter.nsfw === 3 ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : ''
                    }`}
                    onClick={() => handleNsfwChange(3)}
                    disabled={isLoading}
                  >
                    이용등급 전체
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 태그 목록 */}
        {tags && tags.length > 0 && (
          <div className="w-full mt-4">
            {categoryId && (
              <TagList
                tags={tags}
                isLoading={isTagsLoading}
                onTagSelect={handleTagSelect}
                expanded={isTagListExpanded}
                selectedTags={currentTags}
              />
            )}
          </div>
        )}
      </div>
    </>
  )
}
