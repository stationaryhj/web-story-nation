'use client'

import { useState, memo } from 'react'
import { useStoreData } from '@/store/useStoreData'
import CardGrid from '@/components/elements/card/CardGrid'
import { SectionTransition } from '@/components/motion/PageTransition'
import NewCharacterSidebar from '@/components/elements/sidebar/NewCharacterSidebar'

// 목업 업데이트 시간
const getUpdateTime = () => {
  const now = new Date()
  const minutes = Math.floor(Math.random() * 60)
  return `${minutes}분 전`
}

// 최신 캐릭터 섹션 컴포넌트
const LatestCharactersSection = memo(() => {
  const { characters } = useStoreData()
  const [isNewCharacterSidebarOpen, setIsNewCharacterSidebarOpen] = useState(false)
  const [updateTime, setUpdateTime] = useState(getUpdateTime())

  const getLatestCharactersData = () => {
    // 실제로는 최신 캐릭터 데이터를 반환하는 로직이 필요함
    // 현재는 목업으로 characters 데이터 사용
    return characters
  }

  // 최신 캐릭터 데이터
  const latestCharacters = getLatestCharactersData()
  // 카드 수가 캐럿셀 사용이 필요한지 확인 (카드가 5개 이하면 스와이퍼 사용 안함)
  const shouldUseSwiper = latestCharacters.length > 5

  console.log('최신 캐릭터 수:', latestCharacters.length, '스와이퍼 사용:', shouldUseSwiper)

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-dark-secondary-700 relative inline-block">
            지금 막 올라온 캐릭터
            <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-primary-500 dark:bg-dark-primary-500 rounded-full"></span>
          </h2>
          <button
            onClick={() => setIsNewCharacterSidebarOpen(true)}
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-dark-primary-400 dark:hover:text-dark-primary-300 flex items-center"
          >
            더 보기
          </button>
        </div>

        {/* 최신 캐릭터 그리드 */}
        <SectionTransition>
          <CardGrid
            customData={latestCharacters}
            cardsPerRow={5}
            hasRanking={false}
            useSwiper={shouldUseSwiper} // 5개 이하면 스와이퍼 사용 안함
            sectionId="latest-characters-section" // 고유 ID 추가
          />
        </SectionTransition>
      </div>

      <NewCharacterSidebar isOpen={isNewCharacterSidebarOpen} onClose={() => setIsNewCharacterSidebarOpen(false)} />
    </section>
  )
})

LatestCharactersSection.displayName = 'LatestCharactersSection'

export default LatestCharactersSection
