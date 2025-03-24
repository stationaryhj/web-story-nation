'use client'

import Footer from '@/components/common/footer'
import Header from '@/components/common/header'
import PageTransition, { SectionTransition } from '@/components/motion/PageTransition'
import { useStoreData } from '@/store/useStoreData'
import { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import CardGrid from '@/components/elements/card/CardGrid'
import SearchBar from '@/components/elements/search/SearchBar'
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
  { id: 'unspecified', label: '성별모름', shouldUpdateUrl: true },
]

// 작가 목업 데이터
const mockAuthors = [
  {
    id: '1',
    name: '스토리텔러',
    nickname: '스토리텔러',
    description: '다양한 장르의 캐릭터를 만드는 창작자입니다. 판타지부터 현대물까지 다양한 스토리를 다룹니다.',
    profileImageUrl: '/images/profile/author1.jpg',
    characterCount: 15,
    isVerified: true,
  },
  {
    id: '2',
    name: '판타지작가',
    nickname: '판타지작가',
    description: '판타지 세계관에 특화된 작가입니다. 마법과 모험이 가득한 캐릭터를 주로 창작합니다.',
    profileImageUrl: '/images/profile/author2.jpg',
    characterCount: 8,
    isVerified: false,
  },
  {
    id: '3',
    name: '로맨스퀸',
    nickname: '로맨스퀸',
    description: '로맨스 전문 작가입니다. 달콤하고 설레는 캐릭터를 만듭니다.',
    profileImageUrl: '/images/profile/author3.jpg',
    characterCount: 12,
    isVerified: true,
  },
  {
    id: '4',
    name: '미스터리마스터',
    nickname: '미스터리마스터',
    description: '추리와 미스터리를 좋아하는 작가입니다. 복잡한 사건과 캐릭터를 다룹니다.',
    profileImageUrl: null,
    characterCount: 5,
    isVerified: false,
  },
  {
    id: '5',
    name: '판타지원더',
    nickname: '판타지원더',
    description: '판타지 세계를 창조하는 작가입니다. 독특한 세계관과 캐릭터를 선보입니다.',
    profileImageUrl: '/images/profile/author2.jpg',
    characterCount: 18,
    isVerified: true,
  },
  {
    id: '6',
    name: 'SF마스터',
    nickname: 'SF마스터',
    description: 'SF와 미래 세계를 다루는 작가입니다. 과학적 상상력이 돋보이는 작품을 만듭니다.',
    profileImageUrl: '/images/profile/author1.jpg',
    characterCount: 9,
    isVerified: false,
  },
  {
    id: '7',
    name: '호러킹',
    nickname: '호러킹',
    description: '공포와 스릴러를 전문으로 다루는 작가입니다. 긴장감 넘치는 캐릭터를 창작합니다.',
    profileImageUrl: '/images/profile/author3.jpg',
    characterCount: 14,
    isVerified: true,
  },
  {
    id: '8',
    name: '역사탐험가',
    nickname: '역사탐험가',
    description: '역사적 배경을 바탕으로 한 캐릭터를 만드는 작가입니다. 시대를 아우르는 이야기를 만듭니다.',
    profileImageUrl: null,
    characterCount: 7,
    isVerified: false,
  },
  {
    id: '9',
    name: '판타지퀸',
    nickname: '판타지퀸',
    description: '마법과 환상의 세계를 그리는 작가입니다. 화려한 상상력으로 캐릭터를 창조합니다.',
    profileImageUrl: '/images/profile/author2.jpg',
    characterCount: 11,
    isVerified: true,
  },
  {
    id: '10',
    name: '드라마작가',
    nickname: '드라마작가',
    description: '현실적인 인간 드라마를 다루는 작가입니다. 공감가는 캐릭터 스토리를 만듭니다.',
    profileImageUrl: '/images/profile/author1.jpg',
    characterCount: 6,
    isVerified: false,
  },
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
        <div className="container px-4 mt-8 flex justify-center">
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
