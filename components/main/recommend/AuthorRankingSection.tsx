'use client';

import { memo, useState } from 'react';
import AuthorGrid from '@/components/elements/card/AuthorGrid';
import AuthorRankingSidebar from '@/components/elements/sidebar/AuthorRankingSidebar';
import ButtonTabs, { TabItem } from '@/components/elements/tabs/ButtonTabs';
import { SectionTransition } from '@/components/motion/PageTransition';
import { getValidImageUrl } from '@/lib/utils/storyNationUtil';
import { useRecommendSectionStoreData } from '@/store/useMainStoreData';

// 작가 랭킹 탭 정의
const authorRankingTabs: TabItem[] = [
  { id: 'weekly', label: '주간' },
  { id: 'monthly', label: '월간' },
  { id: 'all', label: '전체' },
];

// 랭킹 탭에 따른 업데이트 문구
const getRankingUpdateMessage = (tabId: string) => {
  return '15,000원부터 출금 가능! 지금 바로 작품을 만들어보세요!';
};

// 작가 랭킹 섹션 컴포넌트
const AuthorRankingSection = memo(() => {
  const [authorActiveTab, setAuthorActiveTab] = useState('weekly');
  const [isAuthorRankingSidebarOpen, setIsAuthorRankingSidebarOpen] = useState(false);
  const { rankingCreaters, UpdateRankingTopCreater } = useRecommendSectionStoreData();

  const handleAuthorRankingTabChange = (tabId: string) => {
    setAuthorActiveTab(tabId);
    const topid = tabId === 'weekly' ? 2 : tabId === 'monthly' ? 3 : tabId === 'all' ? 5 : 2;
    UpdateRankingTopCreater('KR', topid, false);
    // 여기서 실제로는 해당 탭에 맞는 데이터를 가져오는 API 호출이 필요합니다.
  };

  const getAuthorRankingData = () => {
    // Character 타입을 Author 타입으로 변환
    return rankingCreaters.map((character) => {
      // 유효한 이미지 URL 체크 함수
      const getValidImageUrl = (url: string | null | undefined): string | null => {
        if (!url) return null;

        // 상대 경로는 그대로 통과, 절대 경로는 유효한 URL인지 확인
        if (url.startsWith('/')) return url;

        try {
          new URL(url); // URL 유효성 체크
          return url;
        } catch (e) {
          console.warn('Invalid image URL:', url);
          return null;
        }
      };

      return {
        id: character.id,
        name: character.name,
        nickname: character.creator?.nickname || character.name,
        description: character.description || '',
        profileImageUrl: getValidImageUrl(character.profileImageUrl || character.imageUrl),
        characterCount: 0, // 기본값 설정
        isVerified: true, // 기본값 설정
      };
    });
  };

  const handleAuthorClick = (author: any) => {
    console.log('작가 선택:', author);
    // 작가 프로필 페이지로 이동 또는 모달 표시
  };

  return (
    <section className='py-10 bg-surface'>
      <div className='container mx-auto px-4'>
        {/* 작가 랭킹 탭 */}
        <div className='mb-6'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-2xl font-bold text-text-primary relative inline-block'>
              🏆작가 랭킹: 수익의 10%를 매월 현금 정산!
            </h2>
            <button
              onClick={() => setIsAuthorRankingSidebarOpen(true)}
              className='text-sm text-brand hover:text-brand-hover flex items-center'
            >
              랭킹 더보기
            </button>
          </div>
          <p className='text-xs text-text-muted mb-4'>{getRankingUpdateMessage(authorActiveTab)}</p>
          <ButtonTabs
            tabs={authorRankingTabs}
            defaultTabId='weekly'
            onTabChange={handleAuthorRankingTabChange}
          />
        </div>

        {/* 작가 랭킹 그리드 */}
        <SectionTransition>
          <div className='w-full'>
            <AuthorGrid
              customData={getAuthorRankingData()}
              cardsPerRow={8}
              hasRanking={true}
              onAuthorClick={handleAuthorClick}
              useSwiper={true}
              sectionId='author-ranking-section'
            />
          </div>
        </SectionTransition>
      </div>
      <AuthorRankingSidebar
        isOpen={isAuthorRankingSidebarOpen}
        onClose={() => setIsAuthorRankingSidebarOpen(false)}
      />
    </section>
  );
});

AuthorRankingSection.displayName = 'AuthorRankingSection';

export default AuthorRankingSection;
