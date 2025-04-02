'use client'

import { useState, useTransition, useCallback, useEffect, useRef } from 'react'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import TagList from '@/components/elements/tags/TagList'
import { useCharacterGridStoreData } from '@/store/useCharacterGridStoreData'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRotate, faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons'

// 필터 컨트롤 컴포넌트 타입 정의
interface FilterControlsProps {
  categoryId?: number | string
  initialOrder?: number // 초기 정렬 값 추가
  initialNsfw?: number // 초기 nsfw 값 추가
  onOrderChange?: (order: number) => void
  onTagsChange?: (tagIds: string[]) => void
  onNsfwChange?: (nsfw: number) => void
}

/**
 * 캐릭터 필터링을 위한 컨트롤 컴포넌트
 * - 정렬 옵션 (인기순/최신순)
 * - 이용등급 필터 (전체 이용가/짜릿모드/이용등급 전체)
 */
export default function FilterControls({ 
  categoryId, 
  initialOrder = 1, 
  initialNsfw = 3,
  onOrderChange, 
  onTagsChange, 
  onNsfwChange 
}: FilterControlsProps) {
  // 초기화 여부를 추적하는 ref
  const isInitialized = useRef(false);
  
  // URL에서 값을 가져오기
  const searchParams = useSearchParams();
  const orderFromUrl = searchParams?.get('order') ? parseInt(searchParams.get('order') as string, 10) : null;
  const nsfwFromUrl = searchParams?.get('nsfw') ? parseInt(searchParams.get('nsfw') as string, 10) : null;
  
  // 초기값 설정 (URL > props > 기본값 순서로 우선순위)
  const defaultOrder = orderFromUrl || initialOrder || 1;
  const defaultNsfw = nsfwFromUrl || initialNsfw || 3;
  
  const [order, setOrder] = useState<number>(defaultOrder);
  const [nsfw, setNsfw] = useState<number>(defaultNsfw);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isTagListExpanded, setIsTagListExpanded] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const router = useRouter()
  const pathname = usePathname()

  // useCharacterGridStoreData에서 태그 데이터 가져오기
  const { tags, isTagsLoading, tagsError, loadTags, filter } = useCharacterGridStoreData()

  // 스토어의 값과 내부 상태의 동기화
  useEffect(() => {
    // 스토어의 필터 값이 있고, 이미 초기화된 경우에만 상태 업데이트
    if (filter && isInitialized.current) {
      if (filter.order !== order) {
        setOrder(filter.order);
      }
      if (filter.nsfw !== nsfw) {
        setNsfw(filter.nsfw);
      }
    }
  }, [filter]);

  // 컴포넌트 마운트 시 태그 데이터 로드
  useEffect(() => {
    if (categoryId) {
      // 문자열인 경우 숫자로 변환
      const categoryIdNum = typeof categoryId === 'string' ? parseInt(categoryId, 10) : categoryId
      loadTags(categoryIdNum)
    }
    
    // 컴포넌트가 마운트되었음을 표시
    if (!isInitialized.current) {
      isInitialized.current = true;
    }
  }, [categoryId, loadTags])

  // 태그 파라미터에서 초기 선택된 태그 로드
  useEffect(() => {
    if (!searchParams) return;
    
    const tagsParam = searchParams.get('tags');
    if (tagsParam) {
      const tagIds = tagsParam.split('&');
      setSelectedTags(tagIds);
      
      // 초기 로드 시 부모에게 알림
      if (onTagsChange && !isInitialized.current) {
        onTagsChange(tagIds);
      }
    }
    
    isInitialized.current = true;
  }, []);

  // 정렬 변경 핸들러
  const handleOrderChange = (newOrder: number) => {
    setOrder(newOrder)
    if (onOrderChange) {
      onOrderChange(newOrder)
    }

    // URL 파라미터 업데이트 - 페이지 이동 없이 상태만 업데이트
    startTransition(() => {
      const params = new URLSearchParams(searchParams?.toString())
      params.set('order', newOrder.toString())

      // 페이지 이동 없이 URL 업데이트 (replaceState)
      const newUrl = `${pathname}?${params.toString()}`
      window.history.replaceState(null, '', newUrl)
    })
  }

  // NSFW 필터 변경 핸들러
  const handleNsfwChange = (newNsfw: number) => {
    setNsfw(newNsfw)
    setIsDropdownOpen(false)
    if (onNsfwChange) {
      onNsfwChange(newNsfw)
    }

    // URL 파라미터 업데이트 - 페이지 이동 없이 상태만 업데이트
    startTransition(() => {
      const params = new URLSearchParams(searchParams?.toString())
      params.set('nsfw', newNsfw.toString())

      // 페이지 이동 없이 URL 업데이트 (replaceState)
      const newUrl = `${pathname}?${params.toString()}`
      window.history.replaceState(null, '', newUrl)
    })
  }

  // 태그 핸들러
  const handleTagSelect = useCallback(
    (tagIds: string[]) => {
      // 상태 업데이트
      setSelectedTags(tagIds)

      // 부모 컴포넌트에 선택된 태그 전달
      if (onTagsChange) {
        onTagsChange(tagIds)
      }

      // URL 파라미터 업데이트 - 페이지 이동 없이 상태만 업데이트
      startTransition(() => {
        const params = new URLSearchParams(searchParams?.toString())
        if (categoryId) {
          params.set('category', categoryId.toString())
        }
        if (order) {
          params.set('order', order.toString())
        }
        if (nsfw) {
          params.set('nsfw', nsfw.toString())
        }
        if (tagIds.length > 0) {
          params.set('tags', tagIds.join('&'))
        } else {
          params.delete('tags')
        }

        // 페이지 이동 없이 URL 업데이트 (replaceState)
        const newUrl = `${pathname}?${params.toString()}`
        window.history.replaceState(null, '', newUrl)
      })
    },
    [onTagsChange, pathname, searchParams, categoryId, order, nsfw]
  )

  // 태그 필터 초기화
  const handleTagRefresh = useCallback(() => {
    // 선택된 태그 초기화
    setSelectedTags([])

    // 부모 컴포넌트에 빈 태그 배열 전달
    if (onTagsChange) {
      onTagsChange([])
    }

    // URL에서 태그 파라미터 제거 - 페이지 이동 없이 상태만 업데이트
    startTransition(() => {
      const params = new URLSearchParams(searchParams?.toString())
      params.delete('tags')

      // 페이지 이동 없이 URL 업데이트 (replaceState)
      const newUrl = `${pathname}?${params.toString()}`
      window.history.replaceState(null, '', newUrl)
    })
  }, [onTagsChange, pathname, searchParams])

  const toggleTagList = useCallback(() => {
    setIsTagListExpanded(prev => !prev)
  }, [])

  return (
    <>
      {/* 필터링 컨트롤 */}
      <div className="flex flex-col justify-between items-start mb-6">
        {/* 상단: 태그 리스트 */}

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
                  : 'bg-white dark:bg-dark-background-lighter text-gray-800 dark:text-black hover:bg-gray-100 dark:hover:bg-dark-background-lighter/80'
              }`}
              onClick={() => handleOrderChange(2)}
              disabled={isPending}
            >
              최신순
            </button>
          </div>

          {/* 오른쪽: 태그 컨트롤 버튼과 드롭다운 */}
          <div className="flex space-x-2">
            {/* 태그 필터 초기화 버튼 */}
            <button
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-dark-secondary-800 dark:hover:bg-dark-secondary-700 flex items-center justify-center"
              onClick={handleTagRefresh}
              aria-label="태그 필터 초기화"
              disabled={isPending}
            >
              <FontAwesomeIcon icon={faRotate} className="text-gray-600 dark:text-dark-secondary-300" />
            </button>

            {/* 태그 목록 토글 버튼 */}
            <button
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-dark-secondary-800 dark:hover:bg-dark-secondary-700 flex items-center justify-center"
              onClick={toggleTagList}
              aria-label={isTagListExpanded ? '태그 목록 접기' : '태그 목록 펼치기'}
              disabled={isPending}
            >
              <FontAwesomeIcon
                icon={isTagListExpanded ? faChevronUp : faChevronDown}
                className="text-gray-600 dark:text-dark-secondary-300"
              />
            </button>

            {/* 이용등급 드롭다운 */}
            {/* <div className="relative">
              <button
                className="px-4 py-2 text-sm font-medium border rounded-lg dark-background-lighter dark:bg-dark-background-lighter text-black dark:text-white dark:hover:bg-dark-background-lighter/80 flex items-center gap-2"
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
            </div> */}
          </div>
        </div>

        {/* 태그 목록 항상 표시 */}
        {tags && tags.length > 0 && (
          <div className="w-full mt-4">
            {categoryId && (
              <TagList
                categoryId={categoryId}
                tags={tags}
                isLoading={isTagsLoading}
                onTagSelect={handleTagSelect}
                expanded={isTagListExpanded}
              />
            )}
          </div>
        )}
      </div>
    </>
  )
}
