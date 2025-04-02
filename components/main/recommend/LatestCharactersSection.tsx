import { useState, memo } from 'react'
import CardGrid from '@/components/elements/card/CardGrid'
import { SectionTransition } from '@/components/motion/PageTransition'
import { useRecommendSectionStoreData } from '@/store/useMainStoreData'
import LatestCharacterSidebar from '@/components/elements/sidebar/LatestCharacterSidebar'

// 최신 캐릭터 섹션 컴포넌트
const LatestCharactersSection = memo(() => {
  const [isNewCharacterSidebarOpen, setIsNewCharacterSidebarOpen] = useState(false)
  const { latestCharacters: characterList } = useRecommendSectionStoreData()

  
  // 최신 캐릭터 데이터
  const latestCharacters = characterList

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
            sectionId="latest-characters-section" // 고유 ID 추가
            useSwiper={true}
          />
        </SectionTransition>
      </div>

      <LatestCharacterSidebar isOpen={isNewCharacterSidebarOpen} onClose={() => setIsNewCharacterSidebarOpen(false)} moduleId={8} />
    </section>
  )
})

LatestCharactersSection.displayName = 'LatestCharactersSection'

export default LatestCharactersSection
