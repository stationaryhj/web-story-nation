'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import ButtonTabs, { TabItem } from '@/components/elements/tabs/ButtonTabs'
import { BaseSelectBox } from '@/components/elements/selectbox/BaseSelectBox'
import { Character, useStoreData } from '@/store/useStoreData'
import CardGrid from '@/components/elements/card/CardGrid'
import { lockScroll, unlockScroll, resetScrollLock } from '@/lib/utils/scrollLock'
import { useRecommendSectionStoreData } from '@/store/useMainStoreData'
import { bridgeTop10DataToModuleCharacter } from '@/lib/utils/storyNationUtil'

// 캐릭터 랭킹 탭 정의
const rankingTabs: TabItem[] = [
  { id: 'realtime', label: '실시간' },
  { id: 'daily', label: '일간' },
  { id: 'weekly', label: '주간' },
  { id: 'monthly', label: '월간' },
]

// 성별 옵션
const genderOptions = [
  { value: 'all', label: '전체' },
  { value: 'male', label: '남자' },
  { value: 'female', label: '여자' },
  { value: 'unknown', label: '성별모름' },
]

interface CharacterRankingSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function CharacterRankingSidebar({ isOpen, onClose }: CharacterRankingSidebarProps) {
  const [activeTab, setActiveTab] = useState('realtime')
  const [selectedGender, setSelectedGender] = useState(genderOptions[0])
  // const { characters } = useStoreData()
  const [rankingData, setRankingData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const { rankingCharacters } = useRecommendSectionStoreData()

  // 랭킹 데이터 가져오기
  useEffect(() => {
    const fetchRankingData = async () => {
      setIsLoading(true)
      try {
        // 실제 구현에서는 API를 호출해야 합니다.
        // 현재는 목업으로 characters 데이터를 사용합니다.
        setTimeout(() => {
          const characters = rankingCharacters

          // 성별에 따라 필터링
          const filtered =
            selectedGender.value === 'all'
              ? characters
              : characters.filter(char => {
                  if (selectedGender.value === 'male') return char.gender === 'male'
                  if (selectedGender.value === 'female') return char.gender === 'female'
                  if (selectedGender.value === 'unknown') return !char.gender || char.gender === 'unknown'
                  return true
                })

          // 랭킹 정렬 (실제로는 백엔드에서 정렬된 데이터가 올 것입니다)
          const sorted = [...filtered].sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0))

          // 최대 50개까지만 표시
          setRankingData(sorted.slice(0, 50))
          setIsLoading(false)
        }, 500)
      } catch (error) {
        console.error('랭킹 데이터 로드 실패:', error)
        setIsLoading(false)
      }
    }

    if (isOpen) {
      fetchRankingData()
    }
  }, [isOpen, activeTab, selectedGender, rankingCharacters])

  // 탭 변경 핸들러
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
  }

  // 성별 선택 핸들러
  const handleGenderChange = (option: any) => {
    setSelectedGender(option)
  }

  // Framer Motion 변수
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  const sidebarVariants = {
    hidden: { x: '100%' },
    visible: { x: 0 },
  }

  // 모달이 열릴 때 배경 스크롤 방지
  useEffect(() => {
    // 이전 사이드바의 스크롤 락 상태 확인
    console.log('CharacterRankingSidebar - isOpen 변경됨:', isOpen)

    if (isOpen) {
      try {
        lockScroll()
        console.log('CharacterRankingSidebar - 스크롤 락 적용됨')
      } catch (error) {
        console.error('CharacterRankingSidebar - 스크롤 락 적용 실패:', error)
      }
    } else {
      try {
        unlockScroll()
        console.log('CharacterRankingSidebar - 스크롤 락 해제됨')
      } catch (error) {
        console.error('CharacterRankingSidebar - 스크롤 락 해제 실패:', error)
      }
    }

    return () => {
      console.log('CharacterRankingSidebar - 컴포넌트 언마운트')
      try {
        resetScrollLock()
        console.log('CharacterRankingSidebar - 스크롤 락 초기화됨')
      } catch (error) {
        console.error('CharacterRankingSidebar - 스크롤 락 초기화 실패:', error)
      }
    }
  }, [isOpen])

  return (
    <>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-50"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={overlayVariants}
          onClick={onClose}
        >
          <motion.div
            className="fixed top-0 right-0 h-full w-[600px] bg-white dark:bg-dark-background-DEFAULT overflow-y-auto z-50"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={sidebarVariants}
            transition={{ type: 'tween', duration: 0.3 }}
            onClick={e => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="sticky top-0 bg-white dark:bg-dark-background-DEFAULT z-50 px-6 py-4 border-b dark:border-dark-secondary-200/10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-secondary-900 dark:text-dark-secondary-200">캐릭터 랭킹</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-secondary-500 hover:bg-secondary-100 dark:text-dark-secondary-400 dark:hover:bg-dark-secondary-800"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            {/* 필터 영역 */}
            <div className="px-6 py-4 border-b dark:border-dark-secondary-200/10 space-y-4">
              {/* 탭 */}
              <div>
                <ButtonTabs tabs={rankingTabs} defaultTabId={activeTab} onTabChange={handleTabChange} />
              </div>

              {/* 성별 필터 */}
              <div className="flex items-center space-x-3">
                <span className="text-sm text-secondary-700 dark:text-dark-secondary-300 min-w-20">성별 필터:</span>
                <div className="flex-1">
                  <BaseSelectBox
                    options={genderOptions}
                    selectedOption={selectedGender}
                    onChange={handleGenderChange}
                    placeholder="성별 선택"
                  />
                </div>
              </div>
            </div>

            {/* 컨텐츠 영역 */}
            <div className="px-4 py-6">
              <CardGrid
                customData={rankingData}
                cardsPerRow={1}
                hasRanking={true}
                isLoading={isLoading}
                subtitle={`${selectedGender.label} · ${rankingTabs.find(tab => tab.id === activeTab)?.label || ''} 랭킹`}
                useSwiper={false}
                variant="horizontal"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}
