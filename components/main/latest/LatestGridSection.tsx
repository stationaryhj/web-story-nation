'use client';

import GetListGridSection from '@/components/main/list-grid/GetListGridSection';

// 최신 탭: GetList type=0, order=2(생성순), nsfw=1
export default function LatestGridSection() {
  return (
    <GetListGridSection
      order={2}
      title='🌱 지금 막 올라온 캐릭터 🌱'
      description='방금 등록된 따끈따끈한 캐릭터를 만나보세요!'
      emptyTitle='최신 캐릭터를 불러올 수 없어요'
    />
  );
}
