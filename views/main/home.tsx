'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Footer from '@/components/common/footer';
import SearchBar from '@/components/elements/searchBar/SearchBar';
import ButtonTabs, { TabItem } from '@/components/elements/tabs/ButtonTabs';
import CharacterGridSection from '@/components/main/CharacterGridSection';
import LatestGridSection from '@/components/main/latest/LatestGridSection';
import PopularGridSection from '@/components/main/popular/PopularGridSection';
import RecommendSection from '@/components/main/RecommendSection';
import RankingGridSection from '@/components/main/ranking/RankingGridSection';
import TagGridSection from '@/components/main/tag/TagGridSection';
import ModalManager from '@/components/modal/ModalManager';
import PageTransition from '@/components/motion/PageTransition';
import { ReqTagRankingTabs } from '@/services/hooks/DataListManager';
import { useStoreData } from '@/store/useStoreData';

// 네비게이션 탭 정의
const navigationTabs: TabItem[] = [
  { id: 'all', label: '추천', shouldUpdateUrl: true },
  { id: 'ranking', label: '랭킹', shouldUpdateUrl: true },
  { id: 'latest', label: '최신', shouldUpdateUrl: true },
  { id: 'popular', label: '인기', shouldUpdateUrl: true },
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

  // 태그 랭킹 탭 — type:0, count:10 (docs/plan/plan-20260722-home-tag-ranking-tabs.md)
  // 로딩/실패 시 tagTabs=[]로 폴백되어 정적 탭만 노출된다.
  const { data: tagRankingData } = ReqTagRankingTabs();
  const tagTabs: TabItem[] = (tagRankingData?.charbot_tag ?? []).map((tag) => ({
    id: `tag-${tag.c_chrbot_tag_key}`,
    label: tag.tag,
    shouldUpdateUrl: true,
  }));
  const tabs: TabItem[] = [...navigationTabs, ...tagTabs];
  const activeTagTab = tabParam.startsWith('tag-')
    ? tagTabs.find((tag) => tag.id === tabParam)
    : undefined;

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
      <main className='min-h-screen pb-24 md:pb-20 bg-surface'>
        {/* 검색바 — 전역 container 방식(다른 페이지와 동일) */}
        <div className='md:hidden container mx-auto px-4 pt-6 relative'>
          <SearchBar onSearch={handleSearch} placeholder='캐릭터나 작가를 검색해보세요' />
        </div>

        {/* 네비게이션 탭 — Figma 홈 Top 메뉴 칩 형태 (docs/publish/publish-20260709-home-demo.md) */}
        <div className='container mx-auto px-4 mt-8 flex justify-start'>
          <ButtonTabs
            tabs={tabs}
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
        ) : tabParam === 'ranking' ? (
          // 랭킹 섹션 (기간 서브탭 + 순위 카드 그리드)
          <RankingGridSection />
        ) : tabParam === 'latest' ? (
          // 최신 섹션 (GetList order=2)
          <LatestGridSection />
        ) : tabParam === 'popular' ? (
          // 인기 섹션 (GetList order=1 — 최신과 동일 형태)
          <PopularGridSection />
        ) : tabParam.startsWith('tag-') ? (
          // 태그 랭킹 탭 (GetList type=0, chrbot_tag_keys, order=1, nsfw=1)
          <TagGridSection
            tagKey={Number(tabParam.slice(4))}
            tagLabel={activeTagTab?.label ?? ''}
          />
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
      </main>
    </PageTransition>
  );
}
