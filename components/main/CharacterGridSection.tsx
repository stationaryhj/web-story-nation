'use client'

import { SectionTransition } from '@/components/motion/PageTransition'
import CardGrid from '@/components/elements/card/CardGrid'
import FilterControls from '@/components/elements/filters/FilterControls'
import { CategoryId, CATEGORIES } from '@/services/hooks/DataListManager'
import { useEffect } from 'react'
import { useSettingsStore } from '@/store/useStoreSettings'
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
  const { isAdultModeEnabled } = useSettingsStore()

  // 캐릭터 그리드 스토어 가져오기
  const { characters, filter, isLoading, error, initialize, updateFilter, loadMore, invalidateData } =
    useCharacterGridStoreData()

  // 카테고리 정보 가져오기
  const categoryInfo = CATEGORIES.find(cat => cat.id === categoryId)
  const categoryName = categoryInfo?.name || '캐릭터'
  const categoryIdNumber = Number(categoryInfo?.type || 0)

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (categoryId === 'all') return // all 카테고리는 처리하지 않음

    console.log('CharacterGridSection - 초기 데이터 로드:', categoryId, selectedTags)
    initialize(categoryId, selectedTags)
  }, [categoryId, selectedTags, initialize])

  // 성인 모드 상태 변경 시 데이터 다시 로드
  useEffect(() => {
    if (categoryId === 'all') return

    console.log('CharacterGridSection - 성인 모드 상태 변경됨:', isAdultModeEnabled)

    // 성인 모드 상태에 따라 nsfw 필터 설정 변경
    // 짜릿모드 켜짐: nsfw=1 (짜릿모드 가능), 꺼짐: nsfw=2 (전체 이용가)
    updateFilter({ nsfw: isAdultModeEnabled ? 1 : 2 })
  }, [isAdultModeEnabled, updateFilter, categoryId])

  // 필터 변경 핸들러
  const handleOrderChange = (newOrder: number) => {
    updateFilter({ order: newOrder })
  }

  const handleNsfwChange = (newNsfw: number) => {
    updateFilter({ nsfw: newNsfw })
  }

  // 태그 변경 핸들러
  const handleTagsChange = (tags: string[]) => {
    console.log('CharacterGridSection - 태그 변경:', tags)
    // 태그 변경 시 기존 선택된 태그와 비교하여 변경된 경우에만 초기화
    if (JSON.stringify(tags) !== JSON.stringify(selectedTags)) {
      initialize(categoryId, tags)
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
