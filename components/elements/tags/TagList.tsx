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
  categoryId: string | number
  tags: Tag[]
  isLoading?: boolean
  onTagSelect?: (tagIds: string[]) => void
  expanded?: boolean
}

export default function TagList({ categoryId, tags, isLoading = false, onTagSelect, expanded = false }: TagListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [selectedTags, setSelectedTags] = useState<string[]>(searchParams.get('tags')?.split('&') || [])
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [mouseMoved, setMouseMoved] = useState(false)
  const [moveDistance, setMoveDistance] = useState(0)
  const currentTab = searchParams.get('tab')
  const prevTabRef = useRef<string | null>(currentTab)

  // URL 파라미터가 변경될 때 태그 선택 상태 업데이트
  useEffect(() => {
    const currentTagsParam = searchParams.get('tags')

    // 탭이 변경되었는지 확인
    if (currentTab !== prevTabRef.current) {
      // 탭이 변경되었으면 태그 리스트 초기화
      setSelectedTags([])

      // 부모 컴포넌트에 빈 태그 배열 전달하여 카드 리스트 리셋 방지
      if (onTagSelect) {
        onTagSelect([])
      }

      // 태그 파라미터 제거
      if (currentTagsParam) {
        // URL에서 태그 파라미터 제거
        startTransition(() => {
          const params = new URLSearchParams(searchParams.toString())
          params.delete('tags')
          const newUrl = `${pathname}?${params.toString()}`
          router.push(newUrl, { scroll: false })
        })
      }
      // 현재 탭 저장
      prevTabRef.current = currentTab
    } else if (currentTagsParam) {
      // 탭이 변경되지 않았고 태그 파라미터가 있으면 선택된 태그 업데이트
      const newSelectedTags = currentTagsParam.split('&')
      setSelectedTags(newSelectedTags)

      // 부모 컴포넌트에 선택된 태그 전달
      if (onTagSelect) {
        onTagSelect(newSelectedTags)
      }
    } else {
      // 태그 파라미터가 없으면 선택된 태그 초기화
      setSelectedTags([])

      // 부모 컴포넌트에 빈 태그 배열 전달
      if (onTagSelect) {
        onTagSelect([])
      }
    }
  }, [searchParams, currentTab, pathname, router, onTagSelect])

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

        // 페이지 이동 없이 URL 업데이트 (replaceState)
        const newUrl = `${pathname}?${params.toString()}`
        window.history.replaceState(null, '', newUrl)
      })
    },
    [pathname, searchParams]
  )

  // 마우스 다운 이벤트 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    if (expanded || !scrollContainerRef.current) return

    setIsDragging(true)
    setMouseMoved(false)
    setMoveDistance(0)
    setStartX(e.pageX)
    setScrollLeft(scrollContainerRef.current.scrollLeft)
    document.body.style.userSelect = 'none' // 드래그 중 텍스트 선택 방지
  }

  // 마우스 무브 이벤트 핸들러
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return

    const x = e.pageX
    const distance = Math.abs(x - startX)

    if (distance > 5) {
      setMouseMoved(true)
      setMoveDistance(distance)
    }

    scrollContainerRef.current.scrollLeft = scrollLeft - (x - startX)
  }

  // 마우스 업 이벤트 핸들러
  const handleMouseUp = () => {
    setIsDragging(false)
    document.body.style.userSelect = '' // 텍스트 선택 다시 활성화
  }

  // 가로 스크롤 휠 이벤트 핸들러
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (expanded || !scrollContainerRef.current) return

    // Shift 키를 누르고 있으면 가로 스크롤, 아니면 휠 이벤트의 deltaX 사용
    const deltaX = e.shiftKey ? e.deltaY : e.deltaX
    if (deltaX !== 0) {
      e.preventDefault()
      scrollContainerRef.current.scrollLeft += deltaX
    }
  }, [])

  // 전역 마우스 이벤트 리스너 설정
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false)
        document.body.style.userSelect = ''
      }
    }

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging && scrollContainerRef.current) {
        const x = e.pageX
        const distance = Math.abs(x - startX)

        if (distance > 5) {
          setMouseMoved(true)
          setMoveDistance(distance)
        }

        scrollContainerRef.current.scrollLeft = scrollLeft - (x - startX)
      }
    }

    document.addEventListener('mouseup', handleGlobalMouseUp)
    document.addEventListener('mousemove', handleGlobalMouseMove)

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      document.removeEventListener('mousemove', handleGlobalMouseMove)
    }
  }, [isDragging, startX, scrollLeft])

  // 태그 클릭 핸들러
  const handleTagClick = useCallback(
    (tagId: string) => {
      // 드래그 중이거나 일정 거리 이상 움직였을 때는 클릭으로 처리하지 않음
      if (isDragging || mouseMoved || moveDistance > 5) return

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
    [selectedTags, updateUrlParams, onTagSelect, isDragging, mouseMoved, moveDistance]
  )

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
              className="h-7 px-3 sm:h-8 sm:px-3.5 md:h-9 md:px-4 rounded-full text-xs sm:text-sm whitespace-nowrap transition-colors bg-primary-100 text-primary-700 dark:bg-dark-primary-900/50 dark:text-dark-primary-300"
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
      {/* 태그 목록 */}
      <div className="w-full overflow-hidden">
        <div
          ref={scrollContainerRef}
          className={`${
            expanded
              ? 'flex flex-wrap gap-2 px-2'
              : 'flex flex-nowrap overflow-x-scroll space-x-2 px-2 scrollbar-hide cursor-grab touch-pan-x'
          }`}
          onMouseDown={expanded ? undefined : handleMouseDown}
          onMouseMove={expanded ? undefined : handleMouseMove}
          onMouseUp={expanded ? undefined : handleMouseUp}
          onWheel={handleWheel}
        >
          {tags.map(tag => (
            <button
              key={tag.c_chrbot_tag_key}
              className={`h-7 px-3 sm:h-8 sm:px-3.5 md:h-9 md:px-4 rounded-full text-xs sm:text-sm whitespace-nowrap transition-colors flex-shrink-0 ${
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
