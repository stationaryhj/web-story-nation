'use client'

import Footer from '@/components/common/footer'
import Header from '@/components/common/header'
import PageTransition, { SectionTransition } from '@/components/motion/PageTransition'
import { CATEGORIES, ReqGetTags, ReqGetCharacterList } from '@/services/hooks/DataListManager'
import { useStoreData } from '@/store/useStoreData'
import { useState, useEffect, useCallback } from 'react'
import RecommendSection from '@/components/main/RecommendSection'
import CharacterGridSection from '@/components/main/CharacterGridSection'
import CardGrid from '@/components/elements/card/CardGrid'
import SearchBar from '@/components/elements/search/SearchBar'
import NavigationTabs from '@/components/elements/navigation/NavigationTabs'
import TagList from '@/components/elements/tags/TagList'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // URL 파라미터에서 현재 탭과 태그 가져오기
  const tabParam = searchParams.get('tab')
  const tagsParam = searchParams.get('tags')

  // 초기 상태 설정
  const initialCategory = tabParam || 'all'
  const initialTagIds = tagsParam ? tagsParam.split('&') : []
  const [activeCategory, setActiveCategory] = useState(initialCategory)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initialTagIds)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOption, setSearchOption] = useState('character')
  const { fetchCharacters } = useStoreData()

  // URL 쿼리 매개변수가 변경될 때 상태 업데이트
  useEffect(() => {
    const currentTabParam = searchParams.get('tab') || 'all'
    const currentTagsParam = searchParams.get('tags')

    setActiveCategory(currentTabParam)

    if (currentTagsParam) {
      setSelectedTagIds(currentTagsParam.split('&'))
    } else {
      setSelectedTagIds([])
    }
  }, [searchParams])

  // 카테고리 유형을 숫자로 변환하는 함수
  const getCategoryTypeNumber = (categoryId: string) => {
    const category = CATEGORIES.find(cat => cat.id === categoryId)
    return category ? parseInt(category.type) || 0 : 0
  }

  // 태그 데이터 가져오기 (추천 탭이 아닌 경우만)
  const categoryTypeNumber = getCategoryTypeNumber(activeCategory)
  const { data: tagData, isLoading: isTagLoading } = ReqGetTags(activeCategory === 'all' ? 0 : categoryTypeNumber)

  // 태그를 기반으로 캐릭터 데이터 가져오기
  const {
    data: characterData,
    isLoading: isCharacterLoading,
    refetch: refetchCharacters,
  } = ReqGetCharacterList(
    activeCategory as any, // CategoryId 타입으로 형변환
    0, // nsfw
    1, // page
    10, // paginate
    0, // order
    selectedTagIds.join(',')
  )

  useEffect(() => {
    // 페이지 로드 시 모든 캐릭터 데이터 미리 로드
    fetchCharacters()
  }, [fetchCharacters])

  // 태그 선택 처리
  const handleTagSelect = useCallback(
    (tagIds: string[]) => {
      setSelectedTagIds(tagIds)

      // 태그 ID를 쉼표로 구분하여 합집합 기반으로 필터링
      // 여러 태그 중 하나라도 포함된 캐릭터를 모두 표시 (OR 연산)
      console.log('선택된 태그 IDs (합집합):', tagIds)

      // 필요한 경우 강제로 데이터 다시 가져오기
      refetchCharacters()
    },
    [refetchCharacters]
  )

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId)
    // 카테고리가 변경되어도 태그 선택 상태 유지
    // URL을 업데이트하고 필요시 새 카테고리의 데이터 로드
    const params = new URLSearchParams(searchParams.toString())

    if (categoryId !== 'all') {
      params.set('tab', categoryId)
    } else {
      params.delete('tab')
    }

    // 태그 파라미터는 유지
    if (selectedTagIds.length > 0) {
      params.set('tags', selectedTagIds.join('&'))
    }

    const newUrl = `${pathname}?${params.toString()}`
    router.push(newUrl, { scroll: false })
  }

  const handleSearch = (query: string, option: string = 'character') => {
    setSearchQuery(query)
    setSearchOption(option)
    // 여기서 검색 로직 구현
    console.log('검색어:', query, '검색 옵션:', option)
  }

  // 검색 중일 때는 검색 결과만 표시
  if (searchQuery) {
    return (
      <PageTransition>
        <main className="min-h-screen pb-20">
          <Header />
          <div className="container mx-auto px-4 pt-6 bg-white dark:bg-dark-background-light relative">
            <SearchBar onSearch={handleSearch} initialValue={searchQuery} autoFocus={true} />
          </div>
          <NavigationTabs onCategoryChange={handleCategoryChange} onSearch={handleSearch} />
          <SectionTransition className="py-10 bg-gradient-to-b from-white via-background-light to-white dark:from-dark-background-light dark:via-dark-background-DEFAULT dark:to-dark-background-light">
            <CardGrid
              title={`'${searchQuery}'에 대한 ${searchOption === 'character' ? '캐릭터명' : '작가명'} 검색 결과`}
              categoryId={activeCategory as any}
            />
          </SectionTransition>
          <Footer />
        </main>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <main className="min-h-screen pb-20 bg-white dark:bg-dark-background-light">
        <Header />
        <div className="container mx-auto px-4 pt-6 relative">
          <SearchBar onSearch={handleSearch} placeholder="캐릭터나 작가를 검색해보세요" />
        </div>

        {/* 카테고리 네비게이션 */}
        <NavigationTabs onCategoryChange={handleCategoryChange} onSearch={handleSearch} />

        {/* 태그 목록 - 추천 탭에서는 표시하지 않음 */}
        {activeCategory !== 'all' && (
          <div className="container mx-auto px-4 mt-4">
            <TagList
              categoryId={activeCategory}
              tags={tagData?.charbot_tag || []}
              isLoading={isTagLoading}
              onTagSelect={handleTagSelect}
            />
          </div>
        )}

        {/* 활성 카테고리에 따라 적절한 섹션 표시 */}
        {activeCategory === 'all' ? (
          // 추천 섹션 (자체적으로 데이터 관리)
          <RecommendSection onSearchTrigger={handleSearch} />
        ) : (
          // 카테고리 섹션 (자체적으로 데이터 관리)
          <CharacterGridSection
            categoryId={activeCategory as any}
            selectedTags={selectedTagIds}
            onSearchTrigger={handleSearch}
          />
        )}

        <Footer />
      </main>
    </PageTransition>
  )
}
