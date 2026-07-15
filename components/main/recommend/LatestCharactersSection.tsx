import { memo, useState } from 'react';
import CardGrid from '@/components/elements/card/CardGrid';
import LatestCharacterSidebar from '@/components/elements/sidebar/LatestCharacterSidebar';
import { SectionTransition } from '@/components/motion/PageTransition';
import { useRecommendSectionStoreData } from '@/store/useMainStoreData';

// 최신 캐릭터 섹션 컴포넌트
const LatestCharactersSection = memo(() => {
  const [isNewCharacterSidebarOpen, setIsNewCharacterSidebarOpen] = useState(false);
  const { latestCharacters: characterList } = useRecommendSectionStoreData();

  // 최신 캐릭터 데이터
  const latestCharacters = characterList;

  return (
    <section className='pt-20 sm:py-20'>
      {/* home 전용 콘텐츠 폭(캐브덕 참조) — docs/publish/publish-20260710-home-margins-logo.md */}
      <div className='mx-auto w-full max-w-[2200px] px-4 2xl:px-[100px]'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-2xl font-bold text-text-primary relative inline-block'>
            🌱지금 막 올라온 캐릭터🌱
          </h2>
          <button
            onClick={() => setIsNewCharacterSidebarOpen(true)}
            className='text-sm text-brand hover:text-brand-hover flex items-center'
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
            sectionId='latest-characters-section' // 고유 ID 추가
            useSwiper={true}
          />
        </SectionTransition>
      </div>

      <LatestCharacterSidebar
        isOpen={isNewCharacterSidebarOpen}
        onClose={() => setIsNewCharacterSidebarOpen(false)}
        moduleId={8}
      />
    </section>
  );
});

LatestCharactersSection.displayName = 'LatestCharactersSection';

export default LatestCharactersSection;
