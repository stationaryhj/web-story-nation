'use client'

import React, { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp, faRotate } from '@fortawesome/free-solid-svg-icons'
import CardGrid from '@/components/elements/card/CardGrid'
import BaseSidebar from './BaseSidebar'
import { useRecommendSectionStoreData, moduleForTitleData } from '@/store/useMainStoreData'

interface NewCharacterSidebarProps {
  isOpen: boolean
  onClose: () => void
  moduleId: number
}

export default function EtcCharacterSidebar({ isOpen, onClose, moduleId }: NewCharacterSidebarProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const contentRef = useRef<HTMLDivElement>(null)
  const { etcCharactersSlide, UpdateEtcCharactersPaging, ClearEtcCharactersSlide } = useRecommendSectionStoreData()

  useEffect(() => {
    if (isOpen && moduleId) {
      UpdateEtcCharactersPaging(moduleId, 1, 1, 50)
    }
    else {
      ClearEtcCharactersSlide()
    }
  }, [isOpen, moduleId])

  // 시간 포맷 함수
  const formatTime = () => {
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  // 데이터 로드 함수
  const loadNewCharacters = async () => {
    setIsLoading(true)
    try {
      await UpdateEtcCharactersPaging(moduleId, 1, 1, 50)
      setLastUpdate(formatTime())
      setIsLoading(false)

      // 리스트 최상단으로 스크롤
      if (contentRef.current) {
        contentRef.current.scrollTop = 0
      }
    } catch (error) {
      console.error('캐릭터 로드 실패:', error)
      setIsLoading(false)
    }
  }

  // 스크롤 맨 위로 이동
  const scrollToTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  }

  // 새로고침 버튼 클릭 핸들러
  const handleRefresh = () => {
    loadNewCharacters()
  }

  // 헤더에 표시할 추가 요소
  const headerExtra = lastUpdate ? (
    <p className="text-xs text-secondary-500 dark:text-dark-secondary-500">{lastUpdate} 업데이트</p>
  ) : null

  return (
    <BaseSidebar
      isOpen={isOpen}
      onClose={onClose}
      title={moduleForTitleData[moduleId]?.title}
      headerExtra={
        <div className="flex items-center space-x-4">
          {headerExtra}
          <button
            onClick={handleRefresh}
            className="w-8 h-8 rounded-full flex items-center justify-center text-secondary-500 hover:bg-secondary-100 dark:text-dark-secondary-400 dark:hover:bg-dark-secondary-800"
            title="새로고침"
          >
            <FontAwesomeIcon icon={faRotate} />
          </button>
        </div>
      }
    >
      <div ref={contentRef} className="h-full overflow-y-auto px-4 py-6">
        <CardGrid
          customData={etcCharactersSlide}
          cardsPerRow={1}
          useSwiper={false}
          variant="horizontal"
        />
      </div>

      {/* 맨 위로 스크롤 버튼 */}
      <button
        className="fixed bottom-6 right-6 w-10 h-10 rounded-full bg-primary-500 dark:bg-dark-primary-600 text-white flex items-center justify-center shadow-md hover:bg-primary-600 dark:hover:bg-dark-primary-700 transition-colors"
        onClick={scrollToTop}
      >
        <FontAwesomeIcon icon={faArrowUp} />
      </button>
    </BaseSidebar>
  )
}
