'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useRef, useTransition, useCallback, useMemo } from 'react'
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
  const containerRef = useRef<HTMLDivElement>(null)
  const tagsRowRef = useRef<HTMLDivElement>(null)
  const tagsRef = useRef<HTMLButtonElement[]>([])
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  // URL에서 태그 파라미터 가져오기
  const tagsParam = searchParams.get('tags')
  const [selectedTags, setSelectedTags] = useState<string[]>(tagsParam ? tagsParam.split('&') : [])
  const [expanded, setExpanded] = useState(false)
  const [visibleTags, setVisibleTags] = useState<Tag[]>([])
  const [overflowTags, setOverflowTags] = useState<Tag[]>(tags || [])
  const [calculatedOverflow, setCalculatedOverflow] = useState(false)
  const [containerWidth, setContainerWidth] = useState<number>(0)

  // 모든 태그를 초기화
  const resetTags = useCallback(() => {
    if (tags) {
      setVisibleTags([])
      setOverflowTags(tags)
      setCalculatedOverflow(false)
    }
  }, [tags])

  // 카테고리가 변경되면 expanded 상태와 태그 초기화
  useEffect(() => {
    setExpanded(false)
    setCalculatedOverflow(false)
    resetTags()
  }, [categoryId, resetTags])

  // 태그 배열이 변경될 때 태그 초기화
  useEffect(() => {
    resetTags()
  }, [tags, resetTags])

  // URL 파라미터가 변경될 때 태그 선택 상태만 업데이트
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

  // 오버플로우 계산 로직
  const calculateVisibleTags = useCallback(() => {
    if (!tags || tags.length === 0 || !containerRef.current) return

    // 태그 버튼 요소 참조 초기화
    tagsRef.current = []

    // 일단 모든 태그를 표시한 후 계산
    setVisibleTags(tags)
    setOverflowTags([])

    // 태그 요소가 렌더링될 때까지 대기 후 계산 실행
    setTimeout(() => {
      const container = containerRef.current
      const tagsRow = tagsRowRef.current
      if (!container || !tagsRow) return

      // 컨트롤 버튼 너비 (새로고침 + 드롭다운 + 여백)
      const controlButtonsWidth = 100

      // 컨테이너 너비에서 컨트롤 버튼 너비를 뺀 값이 태그들이 사용할 수 있는 최대 너비
      const maxTagsWidth = container.offsetWidth - controlButtonsWidth

      // 태그 요소 수집
      const tagButtons = tagsRow.querySelectorAll('.tag-button')
      if (tagButtons.length === 0) return

      let currentWidth = 0
      let visibleCount = 0

      // 실제 렌더링된 태그의 너비를 기반으로 계산
      for (let i = 0; i < tagButtons.length; i++) {
        const tagElement = tagButtons[i] as HTMLElement
        // 태그 너비 + 마진
        const tagWidth = tagElement.offsetWidth + 8

        if (currentWidth + tagWidth > maxTagsWidth) {
          break
        }

        currentWidth += tagWidth
        visibleCount = i + 1
      }

      // 최소 1개의 태그는 보이도록 설정
      visibleCount = Math.max(visibleCount, 1)

      // 보이는 태그와 숨겨진 태그 분리
      if (visibleCount < tags.length) {
        setVisibleTags(tags.slice(0, visibleCount))
        setOverflowTags(tags.slice(visibleCount))
      } else {
        setVisibleTags(tags)
        setOverflowTags([])
      }

      setCalculatedOverflow(true)
    }, 100)
  }, [tags])

  // 컨테이너 너비 변경 감지
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // 초기 너비 설정
    setContainerWidth(container.offsetWidth)

    // ResizeObserver 설정
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          setContainerWidth(entry.contentRect.width)
        }
      })

      resizeObserver.observe(container)
      resizeObserverRef.current = resizeObserver

      return () => {
        if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect()
        }
      }
    }

    // ResizeObserver가 지원되지 않는 환경에서는 resize 이벤트 사용
    const handleResize = () => {
      if (container) {
        setContainerWidth(container.offsetWidth)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // 컨테이너 너비가 변경되면 태그 계산
  useEffect(() => {
    if (containerWidth > 0) {
      calculateVisibleTags()
    }
  }, [containerWidth, calculateVisibleTags])

  // 태그 클릭 핸들러
  const handleTagClick = useCallback(
    (tagId: string) => {
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
    setExpanded(!expanded)
  }, [expanded])

  // 드롭다운 버튼 표시 여부
  const shouldShowDropdown = useMemo(() => {
    return !calculatedOverflow || overflowTags.length > 0 || tags.length > visibleTags.length
  }, [calculatedOverflow, overflowTags.length, tags.length, visibleTags.length])

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

  return (
    <div className="flex flex-col mb-2" ref={containerRef}>
      <div className="flex items-center mb-2 w-full">
        {/* 태그 컨테이너 - 한 줄에 표시할 태그들 */}
        <div ref={tagsRowRef} className="flex-1 flex flex-nowrap overflow-hidden space-x-2 px-2">
          {visibleTags.map((tag, index) => (
            <button
              key={tag.c_chrbot_tag_key}
              ref={el => {
                if (el) tagsRef.current[index] = el
              }}
              className={`tag-button px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
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

        {/* 컨트롤 버튼 영역 - 항상 첫번째 줄에 표시 */}
        <div className="flex-shrink-0 flex space-x-2 ml-2">
          <button
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-dark-secondary-800 dark:hover:bg-dark-secondary-700"
            onClick={handleRefresh}
            aria-label="태그 필터 초기화"
            disabled={isPending}
          >
            <FontAwesomeIcon icon={faRotate} className="text-gray-600 dark:text-dark-secondary-300" />
          </button>

          {shouldShowDropdown && (
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
          )}
        </div>
      </div>

      {/* 펼쳐진 태그 목록 */}
      {expanded && (
        <div className="px-2 flex flex-wrap gap-2 mt-2 animate-fadeIn">
          {/* 항상 모든 태그를 보여주되, 첫 줄에 이미 표시된 태그를 제외하고 보여줌 */}
          {tags
            .filter(tag => !visibleTags.some(vTag => vTag.c_chrbot_tag_key === tag.c_chrbot_tag_key))
            .map(tag => (
              <button
                key={tag.c_chrbot_tag_key.toString() + tag.group.toString()}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
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
      )}
    </div>
  )
}
