'use client';

import GetListGridSection from '@/components/main/list-grid/GetListGridSection';

// 인기 탭: GetList type=0, order=1(인기순), nsfw=1 — 최신과 동일 API·형태, order만 다름
export default function PopularGridSection() {
  return (
    <GetListGridSection
      order={1}
      title='🔥 인기 캐릭터 🔥'
      description='지금 가장 인기 있는 캐릭터를 만나보세요!'
      emptyTitle='인기 캐릭터를 불러올 수 없어요'
    />
  );
}
