'use client';

import { bridgeCharacterDataToCharacter } from '@/lib/utils/storyNationUtil';
import { ReqGetCharacterList, CATEGORIES } from '@/services/hooks/DataListManager';
import { SectionTransition } from '@/components/motion/PageTransition';
import CardGrid from '@/components/elements/card/CardGrid';
import FilterControls from '@/components/elements/filters/FilterControls';
import Tags from '@/components/elements/tags';
import { CategoryId } from '@/services/hooks/DataListManager';
import { Character } from '@/store/useStoreData';
import { CharbotData, ModuleCharacter } from '@/types/api';
import { useState, useEffect } from 'react';

interface CharacterGridSectionProps {
  categoryId: CategoryId;
  onSearchTrigger?: (query: string) => void;
}

// CharbotData를 ModuleCharacter 형식으로 변환하는 함수
const mapToModuleCharacter = (data: CharbotData[]): ModuleCharacter[] => {
  return data.map(item => ({
    world_list_detail_chrbot_key: item.world_list_detail_chrbot_key,
    title: item.title,
    intro: item.intro,
    img_url: item.img_url,
    lv: item.lv,
    tags: item.tags,
    chat_cnt: item.chat_cnt,
    msg_cnt: item.msg_cnt,
    like_cnt: item.like_cnt,
    create_dt: item.create_dt,
    nick_nm: item.nick_nm,
    nsfw: item.nsfw,
    module_id: 0, // 기본값 설정
    sort: 0 // 기본값 설정
  }));
};

export default function CharacterGridSection({ 
  categoryId,
  onSearchTrigger 
}: CharacterGridSectionProps) {
  // 필터링 상태 관리
  const [order, setOrder] = useState<number>(1); // 1: 인기순(기본값), 2: 최신순
  const [nsfw, setNsfw] = useState<number>(2); // 2: 전체 이용가(기본값), 1: 짜릿모드 가능, 3: 이용등급 전체
  const [selectedTag, setSelectedTag] = useState<string>('');

  // 카테고리 정보 가져오기
  const categoryInfo = CATEGORIES.find(cat => cat.id === categoryId);
  const categoryName = categoryInfo?.name || '캐릭터';
  const categoryType = categoryInfo?.type || '';

  // 컴포넌트 내부에서 직접 데이터 로드
  const {
    data: categoryData,
    isLoading,
    error,
    refetch
  } = ReqGetCharacterList(
    categoryId,
    nsfw, // nsfw
    1, // page
    10, // paginate
    order, // order
    selectedTag // tag 검색어
  );

  // 필터 값이 변경될 때 데이터 다시 로드
  useEffect(() => {
    refetch();
  }, [order, nsfw, selectedTag, refetch]);

  if (categoryId === 'all') {
    return null; // all 카테고리는 RecommendSection에서 처리
  }

  if (isLoading) {
    return (
      <SectionTransition className="py-12 bg-white dark:bg-dark-background-light">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Loading {categoryName} data...</h2>
        </div>
      </SectionTransition>
    );
  }

  if (error) {
    return (
      <SectionTransition className="py-12 bg-white dark:bg-dark-background-light">
        <div className="container mx-auto px-4 text-red-500">
          <h2 className="text-2xl font-bold mb-6">Error loading {categoryName}</h2>
          <p>{error.message}</p>
        </div>
      </SectionTransition>
    );
  }

  // categoryData가 없는 경우
  if (!categoryData || !categoryData.chrbotList || !categoryData.chrbotList.data || categoryData.chrbotList.data.length === 0) {
    return (
      <SectionTransition className="py-12 bg-white dark:bg-dark-background-light">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">{categoryName}</h2>
          <p>데이터가 없습니다.</p>
        </div>
      </SectionTransition>
    );
  }

  // 데이터 변환 과정 간소화
  // 1. CharbotData를 ModuleCharacter로 변환
  const moduleData = mapToModuleCharacter(categoryData.chrbotList.data);
  
  // 2. 새로 추가한 브릿지 함수로 ModuleCharacter를 Character로 바로 변환
  const characterData = bridgeCharacterDataToCharacter(moduleData);

  return (
    <SectionTransition className="py-12 bg-white dark:bg-dark-background-light">
      <div className="container mx-auto px-4">
        {/* 태그 필터 */}
        <Tags 
          categoryType={categoryType} 
          selectedTag={selectedTag} 
          setSelectedTag={setSelectedTag} 
        />

        {/* 공통 필터 컴포넌트 적용 */}
        <FilterControls
          order={order}
          setOrder={setOrder}
          nsfw={nsfw}
          setNsfw={setNsfw}
        />
        
        <CardGrid 
          categoryId={categoryId}
          customData={characterData as Character[]}
        />
      </div>
    </SectionTransition>
  );
}
