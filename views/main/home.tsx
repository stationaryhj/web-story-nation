'use client'

import Navigation from '@/components/elements/navigation/Navigation'
import Footer from '@/components/common/footer'
import Header from '@/components/common/header'
import PageTransition, { SectionTransition } from '@/components/motion/PageTransition'
import { CATEGORIES } from '@/services/hooks/DataListManager'
import { useStoreData } from '@/store/useStoreData'
import { useState, useEffect } from 'react'
import RecommendSection from '@/components/main/RecommendSection'
import CharacterGridSection from '@/components/main/CharacterGridSection'
import CardGrid from '@/components/elements/card/CardGrid'

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const { fetchCharacters } = useStoreData()

  useEffect(() => {
    // 페이지 로드 시 모든 캐릭터 데이터 미리 로드
    fetchCharacters()
  }, [fetchCharacters])

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // 여기서 검색 로직 구현
    console.log('검색어:', query)
  }

  // 검색 중일 때는 검색 결과만 표시
  if (searchQuery) {
    return (
      <PageTransition>
        <main className="min-h-screen pb-20">
          <Header />
          <Navigation onCategoryChange={handleCategoryChange} onSearch={handleSearch} />
          <SectionTransition className="py-10 bg-gradient-to-b from-white via-background-light to-white dark:from-dark-background-light dark:via-dark-background-DEFAULT dark:to-dark-background-light">
            <CardGrid title={`'${searchQuery}' 검색 결과`} categoryId={activeCategory} />
          </SectionTransition>
          <Footer />
        </main>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <main className="min-h-screen pb-20">
        <Header />
        <Navigation onCategoryChange={handleCategoryChange} onSearch={handleSearch} />

        {/* 활성 카테고리에 따라 적절한 섹션 표시 */}
        {activeCategory === 'all' ? (
          // 추천 섹션 (자체적으로 데이터 관리)
          <RecommendSection onSearchTrigger={handleSearch} />
        ) : (
          // 카테고리 섹션 (자체적으로 데이터 관리)
          <CharacterGridSection categoryId={activeCategory as any} onSearchTrigger={handleSearch} />
        )}

        <Footer />
      </main>
    </PageTransition>
  )
}
