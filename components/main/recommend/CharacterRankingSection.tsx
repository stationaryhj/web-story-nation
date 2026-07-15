'use client';

import { memo, useState } from 'react';
import CardGrid from '@/components/elements/card/CardGrid';
import { BaseSelectBox } from '@/components/elements/selectbox/BaseSelectBox';
import CharacterRankingSidebar from '@/components/elements/sidebar/CharacterRankingSidebar';
import ButtonTabs, { TabItem } from '@/components/elements/tabs/ButtonTabs';
import { SectionTransition } from '@/components/motion/PageTransition';
import { useRecommendSectionStoreData } from '@/store/useMainStoreData';

// 캐릭터 랭킹 탭 정의
const characterRankingTabs: TabItem[] = [
  { id: 'realtime', label: '실시간' },
  { id: 'daily', label: '일간' },
  { id: 'weekly', label: '주간' },
  { id: 'monthly', label: '월간' },
];

// 성별 필터 옵션 정의
const genderOptions = [
  { value: 4, label: '전체' },
  { value: 1, label: '남자' },
  { value: 2, label: '여자' },
  { value: 3, label: '모름' },
];

// 랭킹 탭에 따른 업데이트 문구
const getRankingUpdateMessage = (tabId: string) => {
  switch (tabId) {
    case 'realtime':
      return '지금 인기 있는 캐릭터를 만나보세요!';
    case 'daily':
      return '매일 밤 00시 업데이트';
    case 'weekly':
      return '매주 월요일 업데이트';
    case 'monthly':
      return '매월 1일 업데이트';
    default:
      return '';
  }
};

// 캐릭터 랭킹 섹션 컴포넌트
const CharacterRankingSection = memo(() => {
  const [characterActiveTab, setCharacterActiveTab] = useState('realtime');
  const [selectedGender, setSelectedGender] = useState(genderOptions[0]);
  const [isCharacterRankingSidebarOpen, setIsCharacterRankingSidebarOpen] = useState(false);

  const { rankingCharacters, UpdateRankingTopCharacter } = useRecommendSectionStoreData();

  const handleCharacterRankingTabChange = (tabId: string) => {
    const topid = tabId === 'realtime' ? 4 : tabId === 'daily' ? 1 : tabId === 'weekly' ? 2 : 3;
    UpdateRankingTopCharacter('KR', topid, Number(selectedGender.value), false);
    setCharacterActiveTab(tabId);
  };

  const handleGenderChange = (option: { value: number; label: string }) => {
    const topid =
      characterActiveTab === 'realtime'
        ? 4
        : characterActiveTab === 'daily'
          ? 1
          : characterActiveTab === 'weekly'
            ? 2
            : 3;
    UpdateRankingTopCharacter('KR', topid, option.value, false);
    setSelectedGender(option);
  };

  const getCharacterRankingData = () => {
    return rankingCharacters;
  };

  return (
    <section className='pt-10 pb-20'>
      {/* 제목과 탭 영역 - 좌우 여백 유지 */}
      {/* home 전용 콘텐츠 폭(캐브덕 참조) — docs/publish/publish-20260710-home-margins-logo.md */}
      <div className='mx-auto w-full max-w-[2200px] px-4 2xl:px-[100px]'>
        {/* 캐릭터 랭킹 탭 */}
        <div className='mb-6'>
          <div className='flex justify-between items-center mb-4 z-[1000]'>
            <h2 className='text-2xl font-bold text-text-primary relative inline-block'>
              🏆캐릭터 랭킹
            </h2>
            <button
              onClick={() => setIsCharacterRankingSidebarOpen(true)}
              className='text-sm text-brand hover:text-brand-hover flex items-center'
            >
              랭킹 더보기
            </button>
          </div>
          <p className='text-xs text-text-muted mb-4'>
            {getRankingUpdateMessage(characterActiveTab)}
          </p>
          <div className='flex justify-between items-center'>
            <ButtonTabs
              tabs={characterRankingTabs}
              defaultTabId='realtime'
              onTabChange={handleCharacterRankingTabChange}
            />
            <BaseSelectBox
              options={genderOptions}
              selectedOption={selectedGender}
              onChange={handleGenderChange}
              placeholder='성별 선택'
              className='w-[100px]'
            />
          </div>
        </div>
      </div>

      {/* 카드 그리드 영역 - 오른쪽 여백 제거(스와이퍼가 우측으로 자연스럽게 벗어나도록 pr-0 유지) */}
      <div className='mx-auto w-full max-w-[2200px] pl-4 2xl:pl-[100px] pr-0'>
        <SectionTransition>
          <div className='w-full'>
            <CardGrid
              customData={getCharacterRankingData()}
              cardsPerRow={5}
              hasRanking={true}
              useSwiper={true}
              sectionId='character-ranking-section'
              isCharacterRankingSidebar={true}
            />
          </div>
        </SectionTransition>
      </div>

      <CharacterRankingSidebar
        isOpen={isCharacterRankingSidebarOpen}
        onClose={() => setIsCharacterRankingSidebarOpen(false)}
      />
    </section>
  );
});

CharacterRankingSection.displayName = 'CharacterRankingSection';

export default CharacterRankingSection;
