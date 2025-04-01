'use client'

import { SectionTransition } from '@/components/motion/PageTransition'
import CardGrid from '@/components/elements/card/CardGrid'
import FilterControls from '@/components/elements/filters/FilterControls'
import { CategoryId, CATEGORIES } from '@/services/hooks/DataListManager'
import { useEffect, useRef } from 'react'
import { useCharacterGridStoreData } from '@/store/useCharacterGridStoreData'

interface CharacterGridSectionProps {
  categoryId: CategoryId
  selectedTags?: string[] // 선택된 태그 ID 목록 추가
  onSearchTrigger?: (query: string) => void
}

export default function CharacterGridSection({
  categoryId,
  selectedTags = [],
  onSearchTrigger,
}: CharacterGridSectionProps) {
  // 짜릿모드 상태 가져오기
  // const { isAdultModeEnabled } = useSettingsStore()

  // 태그 변경 추적을 위한 ref
  const isTagChanging = useRef(false);
  const prevTagsRef = useRef<string[]>([]);

  // 캐릭터 그리드 스토어 가져오기
  const { characters, filter, isLoading, error, initialize, updateFilter, loadMore, invalidateData, loadTags } =
    useCharacterGridStoreData()

  // 카테고리 정보 가져오기
  const categoryInfo = CATEGORIES.find(cat => cat.id === categoryId)
  const categoryName = categoryInfo?.name || '캐릭터'
  const categoryIdNumber = Number(categoryInfo?.type || 0)

  // 컴포넌트 초기 마운트나 카테고리 변경 시에만 초기화
  useEffect(() => {
    if (categoryId === 'all') return // all 카테고리는 처리하지 않음

    console.log('CharacterGridSection - 카테고리 변경으로 초기 데이터 로드:', categoryId, selectedTags)
    prevTagsRef.current = [...selectedTags]; // 태그 복사하여 저장
    initialize(categoryId, selectedTags)
  }, [categoryId]); // selectedTags 의존성 제거

  // 태그 변경 시 재초기화 (selectedTags prop이 변경될 때)
  useEffect(() => {
    if (categoryId === 'all') return
    
    // 처음 로드 시에는 건너뜀 (카테고리 변경 useEffect에서 처리)
    if (prevTagsRef.current.length === 0 && selectedTags.length === 0) return;
    
    // 태그가 실제로 변경되었는지 확인
    if (JSON.stringify(prevTagsRef.current) !== JSON.stringify(selectedTags)) {
      console.log('CharacterGridSection - 선택된 태그 변경으로 데이터 재로드:', selectedTags);
      prevTagsRef.current = [...selectedTags]; // 태그 업데이트
      initialize(categoryId, selectedTags);
    }
  }, [selectedTags, categoryId, initialize]);

  // 태그 데이터 로드 (카테고리 변경 시에만)
  useEffect(() => {
    if (categoryId === 'all') return
    
    console.log('CharacterGridSection - 태그 데이터 로드:', categoryIdNumber);
    loadTags(categoryIdNumber);
  }, [categoryId, categoryIdNumber, loadTags]);

  // 필터 변경 핸들러
  const handleOrderChange = (newOrder: number) => {
    updateFilter({ order: newOrder })
  }

  const handleNsfwChange = (newNsfw: number) => {
    updateFilter({ nsfw: newNsfw })
  }

  // 태그 변경 핸들러 (FilterControls에서 태그 선택 시)
  const handleTagsChange = (tags: string[]) => {
    // 이미 태그 변경 중이면 무한루프 방지를 위해 리턴
    if (isTagChanging.current) return;
    
    // 실제로 태그가 변경되었는지 확인
    if (JSON.stringify(tags) !== JSON.stringify(prevTagsRef.current)) {
      console.log('CharacterGridSection - handleTagsChange에서 태그 변경:', tags);
      isTagChanging.current = true; // 태그 변경 플래그 설정
      
      // 태그 복사하여 저장
      prevTagsRef.current = [...tags];
      
      // 직접 initialize 호출 (loadTags는 호출하지 않도록 변경)
      try {
        initialize(categoryId, tags);
      } finally {
        // 비동기 상황에서도 플래그를 해제하기 위해 setTimeout 사용
        setTimeout(() => {
          isTagChanging.current = false;
        }, 0);
      }
    }
  }

  if (categoryId === 'all') {
    return null // all 카테고리는 RecommendSection에서 처리
  }

  if (isLoading && characters.length === 0) {
    return (
      <SectionTransition className="py-12 bg-white dark:bg-dark-background-light">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Loading {categoryName} data...</h2>
        </div>
      </SectionTransition>
    )
  }

  if (error && characters.length === 0) {
    return (
      <SectionTransition className="py-12 bg-white dark:bg-dark-background-light">
        <div className="container mx-auto px-4 text-red-500">
          <h2 className="text-2xl font-bold mb-6">Error loading {categoryName}</h2>
          <p>{error.message}</p>
        </div>
      </SectionTransition>
    )
  }

  // 데이터가 없는 경우
  if (characters.length === 0 && !isLoading) {
    return (
      <SectionTransition className="py-12 bg-white dark:bg-dark-background-light">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">{categoryName}</h2>
          <FilterControls
            categoryId={categoryIdNumber}
            initialOrder={filter.order}
            initialNsfw={filter.nsfw}
            onOrderChange={handleOrderChange}
            onNsfwChange={handleNsfwChange}
            onTagsChange={handleTagsChange}
          />
          <p className="mt-8 text-center text-gray-500 dark:text-dark-secondary-400">
            {selectedTags.length > 0 ? '선택한 태그에 해당하는 캐릭터가 없습니다.' : '데이터가 없습니다.'}
          </p>
        </div>
      </SectionTransition>
    )
  }

  return (
    <SectionTransition className="py-12 bg-white dark:bg-dark-background-light">
      <div className="container mx-auto px-4">
        {/* 공통 필터 컴포넌트 적용 */}
        <FilterControls
          categoryId={categoryIdNumber}
          initialOrder={filter.order}
          initialNsfw={filter.nsfw}
          onOrderChange={handleOrderChange}
          onNsfwChange={handleNsfwChange}
          onTagsChange={handleTagsChange}
        />

        {/* 카드 그리드 */}
        <CardGrid categoryId={categoryId} customData={characters} useSwiper={false} />

        {/* 더 보기 버튼 */}
        {characters.length > 0 && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={loadMore}
              disabled={isLoading}
              className={`px-6 py-2 rounded-full text-white bg-primary-500 hover:bg-primary-600 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? '로딩 중...' : '더 보기'}
            </button>
          </div>
        )}
      </div>
    </SectionTransition>
  )
}
