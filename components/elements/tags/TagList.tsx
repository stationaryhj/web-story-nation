'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useRef, useTransition, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronUp, faRotate } from '@fortawesome/free-solid-svg-icons'

interface Tag {
  c_chrbot_tag_key: number
  tag: string
  group: number
  sort: number
}

interface TagListProps {
  categoryId: string
  tags: Tag[]
  isLoading?: boolean
  onTagSelect?: (tagIds: string[]) => void
}

export default function TagList({ categoryId, tags, isLoading = false, onTagSelect }: TagListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [selectedTags, setSelectedTags] = useState<string[]>(searchParams.get('tags')?.split('&') || [])
  const [expanded, setExpanded] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // URL 파라미터가 변경될 때 태그 선택 상태 업데이트
  useEffect(() => {
    const currentTagsParam = searchParams.get('tags')
    if (currentTagsParam) {
      setSelectedTags(currentTagsParam.split('&'))
    } else {
      setSelectedTags([])
    }
  }, [searchParams])

  // URL 파라미터 업데이트
  const updateUrlParams = useCallback(
    (tagIds: string[]) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString())

        // 탭 파라미터 유지
        const tabParam = searchParams.get('tab')
        if (tabParam) {
          params.set('tab', tabParam)
        }

        // 태그 파라미터 업데이트
        if (tagIds.length > 0) {
          params.set('tags', tagIds.join('&'))
        } else {
          params.delete('tags')
        }

        const newUrl = `${pathname}?${params.toString()}`
        router.push(newUrl, { scroll: false })
      })
    },
    [pathname, router, searchParams]
  )

  // 가로 스크롤 호리젠탈 휠 이벤트 핸들러
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (expanded || !scrollContainerRef.current) return

      // Shift 키를 누르고 있으면 가로 스크롤, 아니면 휠 이벤트의 deltaX 사용
      const deltaX = e.shiftKey ? e.deltaY : e.deltaX
      if (deltaX !== 0) {
        e.preventDefault()
        scrollContainerRef.current.scrollLeft += deltaX
      }
    },
    [expanded]
  )

  // 태그 클릭 핸들러
  const handleTagClick = useCallback(
    (tagId: string) => {
      let newSelectedTags: string[]

      if (selectedTags.includes(tagId)) {
        // 이미 선택된 태그면 선택 해제
        newSelectedTags = selectedTags.filter(id => id !== tagId)
      } else {
        // 선택되지 않은 태그면 선택 추가
        newSelectedTags = [...selectedTags, tagId]
      }

      setSelectedTags(newSelectedTags)
      updateUrlParams(newSelectedTags)

      // 부모 컴포넌트에 선택된 태그 전달
      if (onTagSelect) {
        onTagSelect(newSelectedTags)
      }
    },
    [selectedTags, updateUrlParams, onTagSelect]
  )

  // 모든 태그 필터 초기화
  const handleRefresh = useCallback(() => {
    setSelectedTags([])
    updateUrlParams([])

    if (onTagSelect) {
      onTagSelect([])
    }
  }, [updateUrlParams, onTagSelect])

  // 태그 확장/축소 토글
  const toggleExpand = useCallback(() => {
    setExpanded(prev => !prev)
  }, [])

  // 로딩 중이거나 태그가 없는 경우
  if (isLoading || !tags || tags.length === 0) {
    return (
      <div className="flex flex-col pb-2">
        <div className="flex space-x-2 px-2">
          {isLoading &&
            Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="px-4 py-2 rounded-full bg-gray-200 dark:bg-dark-secondary-800 animate-pulse h-8 w-20"
              />
            ))}
        </div>
      </div>
    )
  }

  // 선택된 태그 버튼 렌더링
  const renderSelectedTags = () => {
    if (selectedTags.length === 0) return null

    return (
      <div className="flex flex-wrap gap-2 px-2 mt-2">
        {selectedTags.map(tagId => {
          const tag = tags.find(t => t.c_chrbot_tag_key.toString() === tagId)
          if (!tag) return null
          return (
            <button
              key={tag.c_chrbot_tag_key}
              className="px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors bg-primary-100 text-primary-700 dark:bg-dark-primary-900/50 dark:text-dark-primary-300"
              onClick={() => handleTagClick(tag.c_chrbot_tag_key.toString())}
              disabled={isPending}
            >
              #{tag.tag}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex flex-col mb-2">
      {/* 컨트롤 버튼 영역 */}
      <div className="flex justify-end space-x-2 px-2 mb-2">
        <button
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-dark-secondary-800 dark:hover:bg-dark-secondary-700"
          onClick={handleRefresh}
          aria-label="태그 필터 초기화"
          disabled={isPending}
        >
          <FontAwesomeIcon icon={faRotate} className="text-gray-600 dark:text-dark-secondary-300" />
        </button>

        <button
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-dark-secondary-800 dark:hover:bg-dark-secondary-700"
          onClick={toggleExpand}
          aria-label={expanded ? '태그 목록 접기' : '태그 목록 펼치기'}
          disabled={isPending}
        >
          <FontAwesomeIcon
            icon={expanded ? faChevronUp : faChevronDown}
            className="text-gray-600 dark:text-dark-secondary-300"
          />
        </button>
      </div>

      {/* 태그 목록 */}
      <div className="w-full overflow-hidden">
        <div
          ref={scrollContainerRef}
          className={`${
            expanded ? 'flex flex-wrap gap-2 px-2' : 'flex flex-nowrap overflow-x-scroll space-x-2 px-2 scrollbar-hide'
          }`}
          onWheel={handleWheel}
        >
          {tags.map(tag => (
            <button
              key={tag.c_chrbot_tag_key}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors flex-shrink-0 ${
                selectedTags.includes(tag.c_chrbot_tag_key.toString())
                  ? 'bg-primary-100 text-primary-700 dark:bg-dark-primary-900/50 dark:text-dark-primary-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-secondary-800 dark:text-dark-secondary-300 dark:hover:bg-dark-secondary-700'
              }`}
              onClick={() => handleTagClick(tag.c_chrbot_tag_key.toString())}
              disabled={isPending}
            >
              #{tag.tag}
            </button>
          ))}
        </div>
      </div>

      {/* 선택된 태그 목록 */}
      {renderSelectedTags()}
    </div>
  )
}
