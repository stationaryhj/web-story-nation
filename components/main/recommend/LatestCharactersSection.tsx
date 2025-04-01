import { useState, memo } from 'react'
import CardGrid from '@/components/elements/card/CardGrid'
import { SectionTransition } from '@/components/motion/PageTransition'
import NewCharacterSidebar from '@/components/elements/sidebar/NewCharacterSidebar'
import { useRecommendSectionStoreData } from '@/store/useMainStoreData'

// 최신 캐릭터 섹션 컴포넌트
const LatestCharactersSection = memo(() => {
  const [isNewCharacterSidebarOpen, setIsNewCharacterSidebarOpen] = useState(false)
  const { modules_sum, UpdateLatestCharacters } = useRecommendSectionStoreData()

  const getLatestCharactersData = () => {
    const combinedModules = modules_sum

    // 상위 5개만 추출
    const latestModules = combinedModules.slice(0, 10)

    // Character 타입으로 변환하여 반환
    return latestModules
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
            sectionId="latest-characters-section" // 고유 ID 추가
            useSwiper={true}
          />
        </SectionTransition>
      </div>

      <NewCharacterSidebar isOpen={isNewCharacterSidebarOpen} onClose={() => setIsNewCharacterSidebarOpen(false)} />
    </section>
  )
})

LatestCharactersSection.displayName = 'LatestCharactersSection'

export default LatestCharactersSection
