// components/common/HeaderSearch.tsx
'use client';

import SearchBar from '@/components/elements/searchBar/SearchBar';

/**
 * 헤더 중앙 슬롯 전용 표시 래퍼.
 * - 데스크톱(md 이상)에서만 노출되고, 모바일에서는 완전히 숨겨진다(콘텐츠 영역 SearchBar가 대신 노출).
 * - SearchBar가 라우팅을 자체적으로 처리하므로 이 컴포넌트는 로직을 갖지 않는다(props 없음).
 * 근거: docs/plan/plan-20260715-header-searchbar.md (1단계, 담당: publisher)
 */
export default function HeaderSearch() {
  return (
    <search
      aria-label='헤더 검색'
      className='hidden md:flex md:flex-1 min-w-0 justify-center px-2'
    >
      <div className='w-full max-w-[560px] min-w-0'>
        <SearchBar placeholder='캐릭터나 작가를 검색해보세요' />
      </div>
    </search>
  );
}
