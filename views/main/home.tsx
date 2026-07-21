'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Footer from '@/components/common/footer';
import SearchBar from '@/components/elements/searchBar/SearchBar';
import AuthorRankingSidebar from '@/components/elements/sidebar/AuthorRankingSidebar';
import CharacterRankingSidebar from '@/components/elements/sidebar/CharacterRankingSidebar';
import NewCharacterSidebar from '@/components/elements/sidebar/NewCharacterSidebar';
import ButtonTabs, { TabItem } from '@/components/elements/tabs/ButtonTabs';
import CharacterGridSection from '@/components/main/CharacterGridSection';
import RecommendSection from '@/components/main/RecommendSection';
import ModalManager from '@/components/modal/ModalManager';
import PageTransition from '@/components/motion/PageTransition';
import useModalStore from '@/shared/model/stores/useModalStore';
import { useStoreData } from '@/store/useStoreData';
import { useSettingsStore } from '@/store/useStoreSettings';

// 네비게이션 탭 정의
const navigationTabs: TabItem[] = [
  { id: 'all', label: '추천', shouldUpdateUrl: true },
  { id: 'male', label: '남자', shouldUpdateUrl: true },
  { id: 'female', label: '여자', shouldUpdateUrl: true },
  { id: 'unknown', label: '성별모름', shouldUpdateUrl: true },
];

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { fetchCharacters, characters } = useStoreData();

  // URL 파라미터에서 현재 탭 가져오기
  const tabParam = searchParams?.get('tab') || 'all';

  // 상태 관리
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // 사이드바 상태
  const [isCharacterRankingSidebarOpen, setIsCharacterRankingSidebarOpen] = useState(false);
  const [isAuthorRankingSidebarOpen, setIsAuthorRankingSidebarOpen] = useState(false);
  const [isNewCharacterSidebarOpen, setIsNewCharacterSidebarOpen] = useState(false);

  useEffect(() => {
    // 페이지 로드 시 모든 캐릭터 데이터 미리 로드
    fetchCharacters();
  }, [fetchCharacters]);

  // 네비게이션 핸들러
  const handleCategoryChange = (categoryId: string) => {
    // 페이지 이동
    const params = new URLSearchParams(searchParams?.toString() || '');

    if (categoryId !== 'all') {
      params.set('tab', categoryId);
    } else {
      params.delete('tab');
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  // 검색 핸들러
  const handleSearch = (query: string, option: string = 'character') => {
    // 검색 기능 구현
    console.log('검색어:', query, '검색 옵션:', option);
  };

  return (
    <PageTransition>
      {/* 2xl 이상: 셸의 레일 오프셋(md:pl-20)을 상쇄해 콘텐츠를 뷰포트 기준 중앙 정렬(caveduck식 대칭 여백). 그 이하 폭·다른 페이지는 영향 없음. */}
      <main className='min-h-screen pb-24 md:pb-20 bg-surface 2xl:-ml-20 2xl:w-[calc(100%+5rem)]'>
        {/* 검색바 */}
        {/* home 전용 콘텐츠 폭(캐브덕 참조): 1920px≈좌우 100px, 2560px≈좌우 270px 마진.
            전역 `.container`(tailwind.config container.screens, 다른 페이지 공용) 대신
            홈 전용 max-width+padding 조합을 직접 사용해 다른 페이지에 영향 없이 스코프.
            근거: docs/plan/plan-20260710-caveduck-shell-layout.md, docs/publish/publish-20260710-home-margins-logo.md */}
        <div className='md:hidden mx-auto w-full max-w-[2200px] px-4 2xl:px-[100px] pt-6 relative'>
          <SearchBar onSearch={handleSearch} placeholder='캐릭터나 작가를 검색해보세요' />
        </div>

        {/* 네비게이션 탭 — Figma 홈 Top 메뉴 칩 형태 (docs/publish/publish-20260709-home-demo.md) */}
        <div className='mx-auto w-full max-w-[2200px] px-4 2xl:px-[100px] mt-8 flex justify-center'>
          <ButtonTabs
            tabs={navigationTabs}
            defaultTabId={tabParam}
            onTabChange={handleCategoryChange}
            variant='chip'
            className='max-w-full'
          />
        </div>

        {/* 카테고리별 콘텐츠 */}
        {tabParam === 'all' ? (
          // 추천 섹션
          <RecommendSection onSearchTrigger={handleSearch} />
        ) : (
          // 카테고리별 섹션
          <CharacterGridSection
            categoryId={tabParam as any}
            selectedTags={selectedTagIds}
            onSearchTrigger={handleSearch}
          />
        )}

        <Footer />
        <ModalManager />

        {/* 사이드바 컴포넌트 */}
        <CharacterRankingSidebar
          isOpen={isCharacterRankingSidebarOpen}
          onClose={() => setIsCharacterRankingSidebarOpen(false)}
        />

        <AuthorRankingSidebar
          isOpen={isAuthorRankingSidebarOpen}
          onClose={() => setIsAuthorRankingSidebarOpen(false)}
        />

        <NewCharacterSidebar
          isOpen={isNewCharacterSidebarOpen}
          onClose={() => setIsNewCharacterSidebarOpen(false)}
        />
      </main>
    </PageTransition>
  );
}
