'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'

interface Tag {
  c_chrbot_tag_key: number
  tag: string
  group: number
  sort: number
}

interface TagListProps {
  categoryId?: string | number // categoryId를 선택적으로 변경
  tags: Tag[]
  isLoading?: boolean
  onTagSelect?: (tagIds: string[]) => void
  expanded?: boolean
  selectedTags?: string[]
}

export default function TagList({ 
  tags, 
  isLoading = false, 
  onTagSelect, 
  expanded = false,
  selectedTags: propSelectedTags = []
}: TagListProps) {
  // 내부 상태 대신 prop에서 가져온 selectedTags 사용
  const [selectedTags, setSelectedTags] = useState<string[]>(propSelectedTags)
  
  // propSelectedTags가 변경될 때마다 내부 상태 업데이트
  useEffect(() => {
    if (propSelectedTags) {
      setSelectedTags(propSelectedTags);
    }
  }, [propSelectedTags]);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [mouseMoved, setMouseMoved] = useState(false)
  const [moveDistance, setMoveDistance] = useState(0)

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
  }, [expanded])

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

      // 내부 상태도 업데이트 (부모로부터 prop이 다시 오기 전에 UI 반영)
      setSelectedTags(newSelectedTags)
      
      // 부모 컴포넌트에 선택된 태그 전달
      if (onTagSelect) {
        onTagSelect(newSelectedTags)
      }
    },
    [selectedTags, onTagSelect, isDragging, mouseMoved, moveDistance]
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
