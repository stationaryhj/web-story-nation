'use client';

import GetListGridSection from '@/components/main/list-grid/GetListGridSection';

export interface TagGridSectionProps {
  tagKey: number;
  tagLabel: string;
}

// 태그 랭킹 탭: GetList type=0, chrbot_tag_keys=[tagKey], order=1(인기순), nsfw=1
// (docs/plan/plan-20260722-home-tag-ranking-tabs.md 확정값)
export default function TagGridSection({ tagKey, tagLabel }: TagGridSectionProps) {
  return (
    <GetListGridSection
      tagKeys={String(tagKey)}
      order={1}
      title={`#${tagLabel}`}
      description='이 태그의 인기 캐릭터를 만나보세요!'
      emptyTitle='해당 태그의 캐릭터가 없어요'
    />
  );
}
