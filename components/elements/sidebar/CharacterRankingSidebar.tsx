'use client'

import React, { useState, useEffect } from 'react'
import ButtonTabs, { TabItem } from '@/components/elements/tabs/ButtonTabs'
import CardGrid from '@/components/elements/card/CardGrid'
import BaseSidebar from './BaseSidebar'
import { useRecommendSectionStoreData } from '@/store/useMainStoreData'
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
  { value: 4, label: '전체' },
  { value: 1, label: '남자' },
  { value: 2, label: '여자' },
  { value: 3, label: '성별모름' },
]

interface CharacterRankingSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function CharacterRankingSidebar({ isOpen, onClose }: CharacterRankingSidebarProps) {
  const [activeTab, setActiveTab] = useState('realtime')
  const [selectedGender, setSelectedGender] = useState(genderOptions[0])
  const [rankingData, setRankingData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const { rankingCharactersSlide, UpdateRankingTopCharacter } = useRecommendSectionStoreData()

  useEffect(() => {
    UpdateRankingTopCharacter('KR', 4, 4, true)
  }, [])

  // 랭킹 데이터 가져오기
  useEffect(() => {
    const fetchRankingData = async () => {
      setIsLoading(true)
      try {
        // 실제 구현에서는 API를 호출해야 합니다.
        // 현재는 목업으로 characters 데이터를 사용합니다.
        setTimeout(() => {
          // 최대 50개까지만 표시
          setRankingData(rankingCharactersSlide.slice(0, 50))
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
  }, [isOpen, activeTab, selectedGender, rankingCharactersSlide])

  // 탭 변경 핸들러
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    const topid = tabId === 'realtime' ? 4 : tabId === 'daily' ? 1 : tabId === 'weekly' ? 2 : 3
    UpdateRankingTopCharacter('KR', topid, Number(selectedGender.value), true)
  }

  // 성별 선택 핸들러
  const handleGenderChange = (option: any) => {
    setSelectedGender(option)
    const topid = activeTab === 'realtime' ? 4 : activeTab === 'daily' ? 1 : activeTab === 'weekly' ? 2 : 3
    UpdateRankingTopCharacter('KR', topid, option.value, true)
  }

  return (
    <BaseSidebar isOpen={isOpen} onClose={onClose} title="캐릭터 랭킹" width="600px">
      {/* 필터 영역 */}
      <div className="px-6 py-4 border-b dark:border-dark-secondary-200/10 space-y-4">
        <div className="w-full flex items-center justify-between">

          {/* 탭 */}
          <div className="flex items-center justify-between">
            <ButtonTabs tabs={rankingTabs} defaultTabId={activeTab} onTabChange={handleTabChange} />
          </div>
          
          {/* 성별 필터 */}
          <div className='flex items-center justify-end'>
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
          customData={rankingCharactersSlide.slice(0, 50)}
          cardsPerRow={1}
          hasRanking={true}
          isLoading={isLoading}
          subtitle={`${selectedGender.label} · ${rankingTabs.find(tab => tab.id === activeTab)?.label || ''} 랭킹`}
          useSwiper={false}
          variant="horizontal"
          isCharacterRankingSidebar={true}
        />
      </div>
    </BaseSidebar>
  )
}
