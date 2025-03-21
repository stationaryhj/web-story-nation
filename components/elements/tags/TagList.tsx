'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronUp, faRotate } from '@fortawesome/free-solid-svg-icons'

interface Tag {
  c_chrbot_tag_key: number
  tag: string
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
  const containerRef = useRef<HTMLDivElement>(null)
  const tagsRowRef = useRef<HTMLDivElement>(null)

  // URL에서 태그 파라미터 가져오기
  const tagsParam = searchParams.get('tags')
  const [selectedTags, setSelectedTags] = useState<string[]>(tagsParam ? tagsParam.split('&') : [])
  const [expanded, setExpanded] = useState(false)
  const [overflowingTags, setOverflowingTags] = useState<Tag[]>([])
  const [hasOverflow, setHasOverflow] = useState(false)

  // URL 파라미터가 변경될 때 태그 선택 상태 업데이트
  useEffect(() => {
    const currentTagsParam = searchParams.get('tags')
    if (currentTagsParam) {
      setSelectedTags(currentTagsParam.split('&'))
    } else {
      setSelectedTags([])
    }
  }, [searchParams])

  // 카테고리가 변경되면 expanded 상태만 초기화
  useEffect(() => {
    setExpanded(false)
  }, [categoryId])

  // 화면 크기에 따라 오버플로우 태그 계산
  useEffect(() => {
    if (!tags || tags.length === 0) return

    // 처음에는 모든 태그를 표시
    setOverflowingTags([])
    setHasOverflow(false)

    // DOM이 렌더링된 후 오버플로우 계산을 위한 타이머 설정
    const timer = setTimeout(() => {
      checkOverflow()
    }, 100)

    function checkOverflow() {
      const tagsRow = tagsRowRef.current
      const container = containerRef.current
      if (!tagsRow || !container) return

      // 컨테이너 너비
      const containerWidth = container.offsetWidth
      // 태그 행의 실제 너비 (스크롤 너비)
      const tagsWidth = tagsRow.scrollWidth
      // 리프레시 버튼을 위한 공간 (약 50px)
      const buttonSpace = 50

      // 태그 행이 컨테이너 너비를 초과하는지 확인
      if (tagsWidth + buttonSpace > containerWidth) {
        setHasOverflow(true)

        // 오버플로우된 태그 식별
        const tagElements = Array.from(tagsRow.querySelectorAll('.tag-button'))
        let visibleWidth = 0
        let lastVisibleIndex = -1

        for (let i = 0; i < tagElements.length; i++) {
          const tag = tagElements[i] as HTMLElement
          visibleWidth += tag.offsetWidth + 8 // 여백 포함

          if (visibleWidth + buttonSpace > containerWidth) {
            lastVisibleIndex = i - 1
            break
          }
        }

        if (lastVisibleIndex >= 0) {
          // 마지막으로 온전히 보이는 태그의 인덱스가 0 이상인 경우만 처리
          // 잘리는 태그도 collapse 영역으로 포함시키기 위해 잘리는 태그부터 시작하도록 인덱스 조정
          setOverflowingTags(tags.slice(lastVisibleIndex))
        }
      } else {
        setHasOverflow(false)
        setOverflowingTags([])
      }
    }

    // 리사이즈 이벤트 리스너
    window.addEventListener('resize', checkOverflow)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', checkOverflow)
    }
  }, [tags])

  // URL 파라미터 업데이트
  const updateUrlParams = (tagIds: string[]) => {
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
  }

  const handleTagClick = (tagId: string) => {
    let newSelectedTags: string[]

    if (selectedTags.includes(tagId)) {
      // 이미 선택된 태그면 선택 해제
      newSelectedTags = selectedTags.filter(id => id !== tagId)
    } else {
      // 선택되지 않은 태그면 선택 추가 (합집합)
      newSelectedTags = [...selectedTags, tagId]
    }

    setSelectedTags(newSelectedTags)
    updateUrlParams(newSelectedTags)

    // 부모 컴포넌트에 선택된 태그 전달
    if (onTagSelect) {
      onTagSelect(newSelectedTags)
    }
  }

  // 모든 태그 필터 초기화
  const handleRefresh = () => {
    setSelectedTags([])
    updateUrlParams([])

    if (onTagSelect) {
      onTagSelect([])
    }
  }

  // 태그 확장/축소 토글
  const toggleExpand = () => {
    setExpanded(!expanded)
  }

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

  // 한 줄에 표시할 태그와 나머지 태그 구분
  const visibleTags = hasOverflow ? tags.slice(0, tags.length - overflowingTags.length) : tags

  return (
    <div className="flex flex-col mb-2" ref={containerRef}>
      <div className="flex items-center justify-between mb-2">
        {/* 태그 컨테이너 - 한 줄에 표시할 태그들 */}
        <div ref={tagsRowRef} className="flex flex-nowrap overflow-x-hidden space-x-2 px-2 flex-grow">
          {visibleTags.map(tag => (
            <button
              key={tag.c_chrbot_tag_key}
              className={`tag-button px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
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

        {/* 컨트롤 버튼 영역 */}
        <div className="flex space-x-2 ml-2 shrink-0">
          <button
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-dark-secondary-800 dark:hover:bg-dark-secondary-700"
            onClick={handleRefresh}
            aria-label="태그 필터 초기화"
          >
            <FontAwesomeIcon icon={faRotate} className="text-gray-600 dark:text-dark-secondary-300" />
          </button>

          {hasOverflow && (
            <button
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-dark-secondary-800 dark:hover:bg-dark-secondary-700"
              onClick={toggleExpand}
              aria-label={expanded ? '태그 목록 접기' : '태그 목록 펼치기'}
            >
              <FontAwesomeIcon
                icon={expanded ? faChevronUp : faChevronDown}
                className="text-gray-600 dark:text-dark-secondary-300"
              />
            </button>
          )}
        </div>
      </div>

      {/* 펼쳐진 태그 목록 - 오버플로우된 태그만 표시 */}
      {expanded && hasOverflow && overflowingTags.length > 0 && (
        <div className="px-2 flex flex-wrap gap-2 mt-2 animate-fadeIn">
          {overflowingTags.map(tag => (
            <button
              key={tag.c_chrbot_tag_key}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
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
      )}
    </div>
  )
}
