'use client'

import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ButtonTabs, { TabItem } from '@/components/elements/tabs/ButtonTabs'
import { BaseSelectBox } from '@/components/elements/selectbox/BaseSelectBox'
import { Character, useStoreData } from '@/store/useStoreData'
import CardGrid from '@/components/elements/card/CardGrid'
import BaseSidebar from './BaseSidebar'
import { useRecommendSectionStoreData } from '@/store/useMainStoreData'
import { bridgeTop10DataToModuleCharacter } from '@/lib/utils/storyNationUtil'
import { SidebarSelectBox } from '@/components/elements/selectbox/SidebarSelectBox'

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

  return (
    <BaseSidebar isOpen={isOpen} onClose={onClose} title="캐릭터 랭킹" width="600px">
      {/* 필터 영역 */}
      <div className="px-6 py-4 border-b dark:border-dark-secondary-200/10 space-y-4">
        {/* 탭 */}
        <div>
          <ButtonTabs tabs={rankingTabs} defaultTabId={activeTab} onTabChange={handleTabChange} />
        </div>

        {/* 성별 필터 */}
        <div className="w-full flex items-center justify-between">
          <span className="text-sm text-secondary-700 dark:text-dark-secondary-300 min-w-20">성별 필터:</span>
          <div>
            <SidebarSelectBox
              options={genderOptions}
              selectedOption={selectedGender}
              onChange={handleGenderChange}
              placeholder="성별 선택"
              isSidebar={true}
              className="w-[100px]"
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
    </BaseSidebar>
  )
}
