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

  // 상태 변경 디버깅 로그
  useEffect(() => {
    console.log('CharacterGridSection - isAdultModeEnabled 변경됨:', isAdultModeEnabled)

    // 성인 모드 상태가 변경되면 강제로 페이지 새로고침
    // 주의: 개발 환경에서는 두 번 실행될 수 있으므로 실제 사용 시 조건을 추가하는 것이 좋습니다
    /* 
    이 코드는 테스트 후 제거하세요!
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
    */
  }, [isAdultModeEnabled])

  // 필터링 상태 관리
  const [order, setOrder] = useState<number>(1) // 1: 인기순(기본값), 2: 최신순
  const [nsfw, setNsfw] = useState<number>(2) // 2: 전체 이용가(기본값), 1: 짜릿모드 가능, 3: 이용등급 전체

  // 캐릭터 데이터 관리
  const [characters, setCharacters] = useState<Character[]>([])

  // 카테고리 정보 가져오기
  const categoryInfo = CATEGORIES.find(cat => cat.id === categoryId)
  const categoryName = categoryInfo?.name || '캐릭터'
  const categoryType = categoryInfo?.type || ''
  const categoryIdNumber = Number(categoryInfo?.type || 0)

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
    10, // paginate - 한 번에 50개 로드
    order, // order
    selectedTags.join(',') // tag 검색어 - 쉼표로 구분된 합집합 형태로 전달
  )

  // 데이터 로드 시 characters 업데이트
  useEffect(() => {
    if (!isLoading && categoryData?.chrbotList?.data) {
      console.log('데이터 로드 완료 - 성인 모드 상태:', isAdultModeEnabled)

      const moduleData = mapToModuleCharacter(categoryData.chrbotList.data)
      const newCharacters = bridgeCharacterDataToCharacter(moduleData)

      console.log('필터링 전 캐릭터 수:', newCharacters.length)
      console.log('성인 컨텐츠 캐릭터 수:', newCharacters.filter(character => character.isAdult).length)

      // 성인 컨텐츠 필터링을 위한 현재 설정 상태 직접 확인
      const currentAdultMode = useSettingsStore.getState().isAdultModeEnabled
      console.log('스토어에서 직접 확인한 성인 모드 상태:', currentAdultMode)

      // 짜릿모드 필터링 - 성인 모드가 활성화되어 있지 않으면 성인 컨텐츠 필터링
      let filteredCharacters = [...newCharacters] // 배열 복사

      // 성인 모드가 비활성화된 경우 성인 컨텐츠 제거
      if (!currentAdultMode) {
        filteredCharacters = filteredCharacters.filter(character => !character.isAdult)
        console.log('성인 컨텐츠 필터링 적용됨')
      } else {
        console.log('모든 컨텐츠 표시')
      }

      console.log('필터링 후 캐릭터 수:', filteredCharacters.length)

      // category 속성 추가
      const charactersWithCategory = filteredCharacters.map(character => ({
        ...character,
        category: 'unspecified' as 'male' | 'female' | 'unspecified',
      }))

      setCharacters(charactersWithCategory as Character[])
    }
  }, [categoryData, isLoading, isAdultModeEnabled])

  // 성인 모드 상태나 필터 변경 시 데이터 다시 로드
  useEffect(() => {
    console.log('필터 변경으로 데이터 다시 로드 - 성인 모드 상태:', isAdultModeEnabled)
    setCharacters([])
    refetch()
  }, [categoryId, order, nsfw, selectedTags, isAdultModeEnabled, refetch])

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
          <FilterControls
            categoryId={categoryIdNumber}
            order={order}
            setOrder={setOrder}
            nsfw={nsfw}
            setNsfw={setNsfw}
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
        <FilterControls categoryId={categoryIdNumber} order={order} setOrder={setOrder} nsfw={nsfw} setNsfw={setNsfw} />

        {/* 카드 그리드 */}
        <CardGrid categoryId={categoryId} customData={characters} useSwiper={false} />
      </div>
    </SectionTransition>
  )
}
