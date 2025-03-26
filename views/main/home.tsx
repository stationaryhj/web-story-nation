'use client'

import Footer from '@/components/common/footer'
import Header from '@/components/common/header'
import PageTransition, { SectionTransition } from '@/components/motion/PageTransition'
import { useStoreData } from '@/store/useStoreData'
import { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import CardGrid from '@/components/elements/card/CardGrid'
import SearchBar from '@/components/elements/searchBar/SearchBar'
import ButtonTabs, { TabItem } from '@/components/elements/tabs/ButtonTabs'
import { useModalStore } from '@/store/useStoreModal'
import ModalManager from '@/components/modal/ModalManager'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import CharacterRankingSidebar from '@/components/elements/sidebar/CharacterRankingSidebar'
import AuthorRankingSidebar from '@/components/elements/sidebar/AuthorRankingSidebar'
import NewCharacterSidebar from '@/components/elements/sidebar/NewCharacterSidebar'
import CharacterGridSection from '@/components/main/CharacterGridSection'
import RecommendSection from '@/components/main/RecommendSection'

// 네비게이션 탭 정의
const navigationTabs: TabItem[] = [
  { id: 'all', label: '추천', shouldUpdateUrl: true },
  { id: 'male', label: '남자', shouldUpdateUrl: true },
  { id: 'female', label: '여자', shouldUpdateUrl: true },
  { id: 'unknown', label: '성별모름', shouldUpdateUrl: true },
]

export default function Home() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { fetchCharacters, characters } = useStoreData()
  const { openModal, setSelectedCharacter } = useModalStore()

  // URL 파라미터에서 현재 탭 가져오기
  const tabParam = searchParams.get('tab') || 'all'

  // 상태 관리
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

  // 사이드바 상태
  const [isCharacterRankingSidebarOpen, setIsCharacterRankingSidebarOpen] = useState(false)
  const [isAuthorRankingSidebarOpen, setIsAuthorRankingSidebarOpen] = useState(false)
  const [isNewCharacterSidebarOpen, setIsNewCharacterSidebarOpen] = useState(false)

  useEffect(() => {
    // 페이지 로드 시 모든 캐릭터 데이터 미리 로드
    fetchCharacters()
  }, [fetchCharacters])

  // 네비게이션 핸들러
  const handleCategoryChange = (categoryId: string) => {
    // 페이지 이동
    const params = new URLSearchParams(searchParams.toString())

    if (categoryId !== 'all') {
      params.set('tab', categoryId)
    } else {
      params.delete('tab')
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  // 검색 핸들러
  const handleSearch = (query: string, option: string = 'character') => {
    // 검색 기능 구현
    console.log('검색어:', query, '검색 옵션:', option)
  }

  // 태그 선택 처리
  const handleTagSelect = (tagIds: string[]) => {
    setSelectedTagIds(tagIds)
  }

  return (
    <PageTransition>
      <main className="min-h-screen pb-20 bg-white dark:bg-dark-background-light">
        <Header />

        {/* 검색바 */}
        <div className="container mx-auto px-4 pt-6 relative">
          <SearchBar onSearch={handleSearch} placeholder="캐릭터나 작가를 검색해보세요" />
        </div>

        {/* 네비게이션 탭 */}
        <div className="container px-4 mt-8 mx-auto flex justify-center w-full">
          <ButtonTabs tabs={navigationTabs} defaultTabId={tabParam} onTabChange={handleCategoryChange} />
        </div>

        {/* 카테고리별 콘텐츠 */}
        {tabParam === 'all' ? (
          // 추천 섹션
          <RecommendSection onSearchTrigger={handleSearch} />
        ) : (
          // 카테고리별 섹션
          <CharacterGridSection
            categoryId={tabParam as any}
            selectedTags={selectedTagIds}
            onSearchTrigger={handleSearch}
          />
        )}

        <Footer />
        <ModalManager />

        {/* 사이드바 컴포넌트 */}
        <CharacterRankingSidebar
          isOpen={isCharacterRankingSidebarOpen}
          onClose={() => setIsCharacterRankingSidebarOpen(false)}
        />

        <AuthorRankingSidebar
          isOpen={isAuthorRankingSidebarOpen}
          onClose={() => setIsAuthorRankingSidebarOpen(false)}
        />

        <NewCharacterSidebar isOpen={isNewCharacterSidebarOpen} onClose={() => setIsNewCharacterSidebarOpen(false)} />
      </main>
    </PageTransition>
  )
}
