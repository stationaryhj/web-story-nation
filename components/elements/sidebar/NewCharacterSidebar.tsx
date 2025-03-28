'use client'

import React, { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp, faRotate } from '@fortawesome/free-solid-svg-icons'
import { useStoreData } from '@/store/useStoreData'
import CardGrid from '@/components/elements/card/CardGrid'
import BaseSidebar from './BaseSidebar'
import { useRecommendSectionStoreData } from '@/store/useMainStoreData'
import { bridgeTop10DataToModuleCharacter } from '@/lib/utils/storyNationUtil'

interface NewCharacterSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function NewCharacterSidebar({ isOpen, onClose }: NewCharacterSidebarProps) {
  // const { characters } = useStoreData()
  const [newCharacters, setNewCharacters] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const contentRef = useRef<HTMLDivElement>(null)
  const { modules_1, modules_2, modules_3 } = useRecommendSectionStoreData()

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
      // 실제 구현에서는 API를 호출해야 합니다.
      // 현재는 목업으로 characters 데이터를 사용합니다.
      setTimeout(() => {
        // 최신순 정렬 (실제로는 백엔드에서 정렬된 데이터가 올 것입니다)
        // 여기서는 임의로 가정하여 전체 캐릭터를 최대 50개까지 표시
        const combinedModules = [...modules_1, ...modules_2, ...modules_3]
        const characters = combinedModules

        const sorted = [...characters]
          .sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
            return dateB - dateA // 최신순 정렬
          })
          .slice(0, 50)

        setNewCharacters(sorted)
        setLastUpdate(formatTime())
        setIsLoading(false)

        // 리스트 최상단으로 스크롤
        if (contentRef.current) {
          contentRef.current.scrollTop = 0
        }
      }, 500)
    } catch (error) {
      console.error('신규 캐릭터 로드 실패:', error)
      setIsLoading(false)
    }
  }

  // 처음 사이드바가 열릴 때 데이터 로드
  useEffect(() => {
    if (isOpen) {
      loadNewCharacters()
    }
  }, [isOpen, modules_1, modules_2, modules_3])

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
      title="최신 캐릭터"
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
          customData={newCharacters}
          cardsPerRow={1}
          subtitle="최신 등록순"
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
