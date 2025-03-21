'use client'

import { bridgeCharacterDataToCharacter } from '@/lib/utils/storyNationUtil'
import { ReqGetCharacterList, CATEGORIES } from '@/services/hooks/DataListManager'
import { SectionTransition } from '@/components/motion/PageTransition'
import CardGrid from '@/components/elements/card/CardGrid'
import FilterControls from '@/components/elements/filters/FilterControls'
import { CategoryId } from '@/services/hooks/DataListManager'
import { Character } from '@/store/useStoreData'
import { CharbotData, ModuleCharacter } from '@/types/api'
import { useState, useEffect } from 'react'
import { useSettingsStore } from '@/store/useStoreSettings'

interface CharacterGridSectionProps {
  categoryId: CategoryId
  selectedTags?: string[] // 선택된 태그 ID 목록 추가
  onSearchTrigger?: (query: string) => void
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
    sort: 0, // 기본값 설정
  }))
}

export default function CharacterGridSection({
  categoryId,
  selectedTags = [],
  onSearchTrigger,
}: CharacterGridSectionProps) {
  // 짜릿모드 상태 가져오기
  const { isAdultModeEnabled } = useSettingsStore()

  // 필터링 상태 관리
  const [order, setOrder] = useState<number>(1) // 1: 인기순(기본값), 2: 최신순
  const [nsfw, setNsfw] = useState<number>(2) // 2: 전체 이용가(기본값), 1: 짜릿모드 가능, 3: 이용등급 전체

  // 캐릭터 데이터 관리
  const [characters, setCharacters] = useState<Character[]>([])

  // 카테고리 정보 가져오기
  const categoryInfo = CATEGORIES.find(cat => cat.id === categoryId)
  const categoryName = categoryInfo?.name || '캐릭터'
  const categoryType = categoryInfo?.type || ''

  // 컴포넌트 내부에서 직접 데이터 로드
  const {
    data: categoryData,
    isLoading,
    error,
    refetch,
  } = ReqGetCharacterList(
    categoryId,
    nsfw, // nsfw
    1, // page (항상 1)
    50, // paginate - 한 번에 50개 로드
    order, // order
    selectedTags.join(',') // tag 검색어 - 쉼표로 구분된 합집합 형태로 전달
  )

  // 카테고리나 필터 값이 변경될 때 상태 리셋 및 데이터 다시 로드
  useEffect(() => {
    setCharacters([])
    refetch()
  }, [categoryId, order, nsfw, selectedTags, refetch])

  // 데이터 로드 시 characters 업데이트
  useEffect(() => {
    if (!isLoading && categoryData?.chrbotList?.data) {
      const moduleData = mapToModuleCharacter(categoryData.chrbotList.data)
      const newCharacters = bridgeCharacterDataToCharacter(moduleData)

      // 짜릿모드 필터링
      const filteredCharacters = isAdultModeEnabled
        ? newCharacters
        : newCharacters.filter(character => !character.isAdult)

      setCharacters(filteredCharacters as Character[])
    }
  }, [categoryData, isLoading, isAdultModeEnabled])

  if (categoryId === 'all') {
    return null // all 카테고리는 RecommendSection에서 처리
  }

  if (isLoading) {
    return (
      <SectionTransition className="py-12 bg-white dark:bg-dark-background-light">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Loading {categoryName} data...</h2>
        </div>
      </SectionTransition>
    )
  }

  if (error) {
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
          <FilterControls order={order} setOrder={setOrder} nsfw={nsfw} setNsfw={setNsfw} />
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
        <FilterControls order={order} setOrder={setOrder} nsfw={nsfw} setNsfw={setNsfw} />

        {/* 카드 그리드 */}
        <CardGrid categoryId={categoryId} customData={characters} />
      </div>
    </SectionTransition>
  )
}
