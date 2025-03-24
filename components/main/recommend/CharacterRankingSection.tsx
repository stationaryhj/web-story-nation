'use client'

import { useState, memo } from 'react'
import { useStoreData } from '@/store/useStoreData'
import ButtonTabs, { TabItem } from '@/components/elements/tabs/ButtonTabs'
import CardGrid from '@/components/elements/card/CardGrid'
import { SectionTransition } from '@/components/motion/PageTransition'
import CharacterRankingSidebar from '@/components/elements/sidebar/CharacterRankingSidebar'

// 캐릭터 랭킹 탭 정의
const characterRankingTabs: TabItem[] = [
  { id: 'realtime', label: '실시간' },
  { id: 'daily', label: '일간' },
  { id: 'weekly', label: '주간' },
  { id: 'monthly', label: '월간' },
]

// 랭킹 탭에 따른 업데이트 문구
const getRankingUpdateMessage = (tabId: string) => {
  switch (tabId) {
    case 'realtime':
      return `${Math.floor(Math.random() * 60)}분 전 업데이트`
    case 'daily':
      return '매일 밤 12시 업데이트'
    case 'weekly':
      return '매주 월요일 00시 업데이트'
    case 'monthly':
      return '매월 1일 00시 업데이트'
    default:
      return ''
  }
}

// 캐릭터 랭킹 섹션 컴포넌트
const CharacterRankingSection = memo(() => {
  const { characters } = useStoreData()
  const [characterActiveTab, setCharacterActiveTab] = useState('realtime')
  const [isCharacterRankingSidebarOpen, setIsCharacterRankingSidebarOpen] = useState(false)

  const handleCharacterRankingTabChange = (tabId: string) => {
    setCharacterActiveTab(tabId)
    // 여기서 실제로는 해당 탭에 맞는 데이터를 가져오는 API 호출이 필요합니다.
  }

  const getCharacterRankingData = () => {
    // 실제로는 탭에 따라 다른 데이터를 반환하는 로직이 필요함
    // 현재는 목업으로 characters 데이터 사용
    return characters.slice(0, 5)
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        {/* 캐릭터 랭킹 탭 */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-dark-secondary-700 relative inline-block">
              캐릭터 랭킹
              <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-primary-500 dark:bg-dark-primary-500 rounded-full"></span>
            </h2>
            <button
              onClick={() => setIsCharacterRankingSidebarOpen(true)}
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-dark-primary-400 dark:hover:text-dark-primary-300 flex items-center"
            >
              랭킹 더보기
            </button>
          </div>
          <p className="text-xs text-secondary-500 dark:text-dark-secondary-500 mb-4">
            {getRankingUpdateMessage(characterActiveTab)}
          </p>
          <ButtonTabs
            tabs={characterRankingTabs}
            defaultTabId="realtime"
            onTabChange={handleCharacterRankingTabChange}
          />
        </div>

        {/* 캐릭터 랭킹 그리드 */}
        <SectionTransition>
          <CardGrid customData={getCharacterRankingData()} cardsPerRow={5} hasRanking={true} />
        </SectionTransition>
      </div>

      <CharacterRankingSidebar
        isOpen={isCharacterRankingSidebarOpen}
        onClose={() => setIsCharacterRankingSidebarOpen(false)}
      />
    </section>
  )
})

CharacterRankingSection.displayName = 'CharacterRankingSection'

export default CharacterRankingSection
