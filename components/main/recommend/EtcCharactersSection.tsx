import { useState, memo } from 'react'
import CardGrid from '@/components/elements/card/CardGrid'
import { SectionTransition } from '@/components/motion/PageTransition'
import { useRecommendSectionStoreData, moduleForTitleData } from '@/store/useMainStoreData'
import EtcCharacterSidebar from '@/components/elements/sidebar/EtcCharacterSidebar'

// 최신 캐릭터 섹션 컴포넌트
const EtcCharactersSection = memo(() => {
  const [isNewCharacterSidebarOpen, setIsNewCharacterSidebarOpen] = useState(false)
  const [selectedModuleId, setSelectedModuleId] = useState<number>(0)
  const { modules_sum } = useRecommendSectionStoreData()

  return (
    <div>
      {modules_sum.map((module, idx) => (
        <section className="pt-10 sm:py-20" key={idx}>
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-secondary-900 dark:text-dark-secondary-700 relative inline-block">
                {moduleForTitleData[module.module_id].title}
                <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-primary-500 dark:bg-dark-primary-500 rounded-full"></span>
              </h2>
              <button
                onClick={() => {
                  setSelectedModuleId(module.module_id)
                  setIsNewCharacterSidebarOpen(true)
                }}
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-dark-primary-400 dark:hover:text-dark-primary-300 flex items-center"
              >
                더 보기
              </button>
            </div>
            <p className="text-xs text-secondary-500 dark:text-dark-secondary-500 mb-4">
              {moduleForTitleData[module.module_id].subTitle}
            </p>

            {/* 최신 캐릭터 그리드 */}
            <SectionTransition>
              <CardGrid
                customData={module.characters}
                cardsPerRow={5}
                hasRanking={false}
                sectionId="latest-characters-section"
                useSwiper={true}
              />
            </SectionTransition>
          </div>
        </section>
      ))}

      <EtcCharacterSidebar
        isOpen={isNewCharacterSidebarOpen}
        onClose={() => setIsNewCharacterSidebarOpen(false)}
        moduleId={selectedModuleId}
      />
    </div>
  )
})

EtcCharactersSection.displayName = 'EtcCharactersSection'

export default EtcCharactersSection
