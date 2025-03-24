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
}

export default function ButtonTabs({
  tabs,
  defaultTabId,
  className = '',
  hashTags = {},
  onTagSelect,
  onTabChange,
}: ButtonTabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // URL 파라미터에서 현재 탭과 태그 가져오기
  const tabParam = searchParams.get('tab')
  const tagsParam = searchParams.get('tags')

  // 초기 상태 설정
  const initialTabId = tabParam || defaultTabId || tabs[0]?.id || ''
  const [activeTabId, setActiveTabId] = useState(initialTabId)
  const [selectedTags, setSelectedTags] = useState<string[]>(tagsParam ? tagsParam.split('&') : [])

  // 탭 컨테이너에 대한 ref - 타입 수정
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([])
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
  })

  // 활성 탭이 변경될 때 인디케이터 위치 업데이트
  useEffect(() => {
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
  }, [activeTabId, tabs])

  // URL 파라미터 업데이트
  const updateUrlParams = (tabId: string, tags: string[]) => {
    const params = new URLSearchParams(searchParams.toString())

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
    <div className={cn('w-full', className)}>
      {/* 탭 네비게이션 */}
      <div className="relative mb-4 flex overflow-x-auto hide-scrollbar">
        <div className="flex space-x-8">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              ref={el => {
                tabsRef.current[index] = el
              }}
              className={cn(
                'py-2 px-1 text-sm font-medium whitespace-nowrap transition-colors relative',
                activeTabId === tab.id
                  ? 'text-primary-600 dark:text-dark-primary-500'
                  : 'text-secondary-600 hover:text-primary-500 dark:text-dark-secondary-400 dark:hover:text-dark-primary-400'
              )}
              onClick={() => handleTabClick(tab.id)}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        {/* 하단 인디케이터 애니메이션 */}
        <motion.div
          className="absolute bottom-0 h-0.5 bg-primary-500 dark:bg-dark-primary-500"
          initial={false}
          animate={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
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
                  ? 'bg-primary-100 text-primary-700 dark:bg-dark-primary-900/50 dark:text-dark-primary-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-secondary-800 dark:text-dark-secondary-300 dark:hover:bg-dark-secondary-700'
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
