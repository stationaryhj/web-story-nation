'use client'

import React, { useState, useRef, useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import cn from 'classnames'

export interface TabItem {
  id: string
  label: string
  shouldUpdateUrl?: boolean
}

interface HashTagItem {
  id: string
  label: string
}

interface ButtonTabsProps {
  tabs: TabItem[]
  defaultTabId?: string
  className?: string
  hashTags?: Record<string, HashTagItem[]>
  onTagSelect?: (tagIds: string[]) => void
  onTabChange?: (tabId: string) => void
  /** 'underline': 텍스트+하단 인디케이터(기본), 'chip': 알약형 칩(Figma 홈 Top 메뉴) */
  variant?: 'underline' | 'chip'
}

export default function ButtonTabs({
  tabs,
  defaultTabId,
  className = '',
  hashTags = {},
  onTagSelect,
  onTabChange,
  variant = 'underline',
}: ButtonTabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // URL 파라미터에서 현재 탭과 태그 가져오기
  const tabParam = searchParams?.get('tab')
  const tagsParam = searchParams?.get('tags')

  // 초기 상태 설정
  const initialTabId = tabParam || defaultTabId || tabs[0]?.id || ''
  const [activeTabId, setActiveTabId] = useState(initialTabId)
  const [selectedTags, setSelectedTags] = useState<string[]>(tagsParam ? tagsParam.split('&') : [])

  // 탭 컨테이너에 대한 ref 배열 생성 (React 19 호환)
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([])

  // ref 배열 초기화
  useEffect(() => {
    // 탭 개수만큼 배열 초기화
    tabsRef.current = tabsRef.current.slice(0, tabs.length)
  }, [tabs.length])

  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
  })

  // 활성 탭이 변경될 때 인디케이터 위치 업데이트 (chip variant는 인디케이터 없음)
  useEffect(() => {
    if (variant !== 'underline') return

    const updateIndicator = () => {
      const activeIndex = tabs.findIndex(tab => tab.id === activeTabId)
      if (activeIndex >= 0 && tabsRef.current[activeIndex]) {
        const activeTab = tabsRef.current[activeIndex]
        if (activeTab) {
          const { offsetLeft, offsetWidth } = activeTab
          // 텍스트 요소 찾기
          const textElement = activeTab.querySelector('span')

          // 텍스트 요소가 있으면 그 너비를 사용, 없으면, 버튼 전체 너비 사용
          const textWidth = textElement?.offsetWidth || offsetWidth

          // 텍스트 요소의 위치를 계산
          // 버튼 왼쪽 + ((버튼 너비 - 텍스트 너비) / 2)
          const textLeft = offsetLeft + (offsetWidth - textWidth) / 2

          setIndicatorStyle({
            left: textLeft,
            width: textWidth,
          })
        }
      }
    }

    updateIndicator()

    // 윈도우 크기가 변경될 때도 인디케이터 위치 업데이트
    window.addEventListener('resize', updateIndicator)
    return () => window.removeEventListener('resize', updateIndicator)
  }, [activeTabId, tabs, variant])

  // URL 파라미터 업데이트
  const updateUrlParams = (tabId: string, tags: string[]) => {
    const params = new URLSearchParams(searchParams?.toString())

    // 탭 ID가 있을 경우에만 URL 업데이트
    const activeTab = tabs.find(tab => tab.id === tabId)
    if (activeTab?.shouldUpdateUrl) {
      params.set('tab', tabId)
    } else {
      params.delete('tab')
    }

    // 태그가 있을 경우에만 URL 업데이트
    if (tags.length > 0) {
      params.set('tags', tags.join('&'))
    } else {
      params.delete('tags')
    }

    const newUrl = `${pathname}?${params.toString()}`
    router.push(newUrl, { scroll: false })
  }

  // 탭 클릭 핸들러
  const handleTabClick = (tabId: string) => {
    setActiveTabId(tabId)

    // 탭이 변경될 때 선택된 태그를 초기화
    setSelectedTags([])

    // URL 업데이트
    updateUrlParams(tabId, [])

    // 태그 선택 이벤트 핸들러 호출
    if (onTagSelect) {
      onTagSelect([])
    }

    if (onTabChange) {
      onTabChange(tabId)
    }
  }

  // 태그 클릭 핸들러
  const handleTagClick = (tagId: string) => {
    let newSelectedTags: string[]

    if (selectedTags.includes(tagId)) {
      // 이미 선택된 태그면 선택 해제
      newSelectedTags = selectedTags.filter(id => id !== tagId)
    } else {
      // 선택되지 않은 태그면 선택 추가
      newSelectedTags = [...selectedTags, tagId]
    }

    setSelectedTags(newSelectedTags)

    // URL 업데이트
    updateUrlParams(activeTabId, newSelectedTags)

    // 태그 선택 이벤트 핸들러 호출
    if (onTagSelect) {
      onTagSelect(newSelectedTags)
    }
  }

  // 현재 활성 탭에 대한 해시 태그
  const activeHashTags = hashTags[activeTabId] || []
  const showHashTags = activeHashTags.length > 0

  return (
    <div className={cn('', className)}>
      {/* 탭 네비게이션 */}
      <div className="relative flex overflow-x-auto hide-scrollbar">
        <div className={cn(variant === 'chip' ? 'flex gap-[14px]' : 'flex space-x-4 md:space-x-8')}>
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              ref={element => {
                // React 19 방식으로 ref 설정
                if (element) {
                  tabsRef.current[index] = element
                }
              }}
              className={cn(
                variant === 'chip'
                  ? [
                      'inline-flex h-[45px] min-w-[119px] shrink-0 items-center justify-center whitespace-nowrap rounded-full px-4 text-sm md:text-base font-medium transition-colors',
                      activeTabId === tab.id
                        ? 'bg-brand text-white'
                        : 'bg-surface-elevated text-text-muted hover:bg-surface-elevated-hover',
                    ]
                  : [
                      'py-2 px-1 text-sm sm:text-sm md:text-lg font-bold whitespace-nowrap transition-colors relative',
                      activeTabId === tab.id
                        ? 'text-brand'
                        : 'text-text-muted hover:text-brand',
                    ]
              )}
              aria-pressed={variant === 'chip' ? activeTabId === tab.id : undefined}
              onClick={() => handleTabClick(tab.id)}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        {/* 하단 인디케이터 애니메이션 (underline variant 전용) */}
        {variant === 'underline' && (
          <motion.div
            className="absolute bottom-0 h-0.5 bg-brand"
            initial={false}
            animate={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
      </div>

      {/* 해시태그 영역 */}
      {showHashTags && (
        <div className="flex flex-wrap gap-2 mb-6">
          {activeHashTags.map(tag => (
            <button
              key={tag.id}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                selectedTags.includes(tag.id)
                  ? 'bg-brand/10 text-brand'
                  : 'bg-surface-elevated text-text-muted hover:bg-surface-elevated-hover'
              )}
              onClick={() => handleTagClick(tag.id)}
            >
              #{tag.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
