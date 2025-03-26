'use client'

import PageTransition from '@/components/motion/PageTransition'
import React, { useState, useEffect } from 'react'
import Header from '@/components/common/header'
import SearchBar from '@/components/elements/searchBar/SearchBar'
import CardGrid from '@/components/elements/card/CardGrid'
import Dropdown from '@/components/elements/dropdown/Dropdown'
import Pagination from '@/components/elements/pagination/Pagination'
import { Character } from '@/store/useStoreData'
import { useRouter, useSearchParams } from 'next/navigation'

type Props = {}

export default function searchPage({}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // URL 쿼리 파라미터 가져오기
  const initialQuery = searchParams.get('query') || ''
  const initialOption = searchParams.get('option') || 'character'

  const [sortType, setSortType] = useState('popularity')
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [searchOption, setSearchOption] = useState(initialOption)

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(100) // 총 아이템 수 (API에서 받아와야 함)
  const itemsPerPage = 30 // 페이지당 30개 아이템

  // 목 데이터 - 실제 구현에서는 API에서 데이터를 가져와야 함
  const [allItems, setAllItems] = useState<Character[]>([])
  const [displayItems, setDisplayItems] = useState<Character[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // URL 쿼리 파라미터 변경 함수
  const updateUrlParams = (query: string, option: string, page = 1) => {
    // URL 쿼리 파라미터 구성
    const params = new URLSearchParams()
    if (query) params.set('query', query)
    if (option) params.set('option', option)
    if (page > 1) params.set('page', page.toString())

    // URL 업데이트
    router.push(`/search?${params.toString()}`)
  }

  // 검색 핸들러
  const handleSearch = (query: string, option?: string) => {
    console.log('@@ query :: ', query)
    console.log('@@ option :: ', option)

    const searchOpt = option || 'character'
    setSearchQuery(query)
    setSearchOption(searchOpt)
    setCurrentPage(1) // 검색 시 첫 페이지로 리셋

    // URL 쿼리 파라미터 업데이트
    updateUrlParams(query, searchOpt)

    // 데이터 가져오기
    fetchItems(query, searchOpt, 1)
  }

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page)

    // URL 쿼리 파라미터 업데이트
    updateUrlParams(searchQuery, searchOption, page)

    // 데이터 가져오기
    const startIndex = (page - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    setDisplayItems(allItems.slice(startIndex, endIndex))

    // 페이지 변경 시 스크롤을 상단으로 이동
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 정렬 타입 변경 핸들러
  const handleSortTypeChange = (type: string) => {
    setSortType(type)
    // 정렬 타입에 따라 아이템 재정렬
    let sortedItems = [...allItems]

    if (type === 'popularity') {
      // 인기순 정렬 로직
      sortedItems.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
    } else if (type === 'latest') {
      // 최신순 정렬 로직
      sortedItems.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return dateB - dateA
      })
    }

    setAllItems(sortedItems)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    setDisplayItems(sortedItems.slice(startIndex, endIndex))
  }

  // 목 데이터 생성 함수
  const generateMockData = (count: number): Character[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `character-${i + 1}`,
      name: `캐릭터 ${i + 1}`,
      description: `${i + 1}번째 캐릭터입니다. 검색 결과입니다.`,
      imageUrl:
        i % 5 === 0 ? '/images/placeholders/default-character.jpg' : `/images/placeholders/char${(i % 6) + 1}.jpg`,
      likeCount: Math.floor(Math.random() * 100),
      commentCount: Math.floor(Math.random() * 30),
      hashtags: [`태그${(i % 10) + 1}`, `카테고리${(i % 5) + 1}`],
      createdAt: new Date(Date.now() - i * 86400000).toISOString(), // 현재부터 i일 전
      isAdult: i % 10 === 0, // 10번째마다 성인용 콘텐츠
      creator: {
        id: `author-${(i % 10) + 1}`,
        nickname: `작가${(i % 10) + 1}`,
        username: `author${(i % 10) + 1}`,
        profileImageUrl: null,
        isActive: true,
      },
      category: i % 3 === 0 ? 'male' : i % 3 === 1 ? 'female' : 'unspecified',
    }))
  }

  // 아이템 가져오기 (목 구현)
  const fetchItems = (query = '', option = 'character', page = 1) => {
    setIsLoading(true)

    // 실제 구현에서는 API 호출
    setTimeout(() => {
      // 목 데이터 생성
      const mockData = generateMockData(120) // 120개 테스트 데이터

      // 검색어로 필터링
      let filteredData = mockData
      if (query) {
        // 검색 옵션에 따라 다른 필터링 적용
        if (option === 'character') {
          filteredData = mockData.filter(
            item =>
              item.name.toLowerCase().includes(query.toLowerCase()) ||
              item.description.toLowerCase().includes(query.toLowerCase()) ||
              (item.hashtags && item.hashtags.some(tag => tag.toLowerCase().includes(query.toLowerCase())))
          )
        } else if (option === 'creator') {
          filteredData = mockData.filter(
            item =>
              item.creator &&
              (item.creator.nickname.toLowerCase().includes(query.toLowerCase()) ||
                item.creator.username.toLowerCase().includes(query.toLowerCase()))
          )
        }
      }

      // 정렬
      let sortedData = [...filteredData]
      if (sortType === 'popularity') {
        sortedData.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
      } else if (sortType === 'latest') {
        sortedData.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return dateB - dateA
        })
      }

      setAllItems(sortedData)
      setTotalItems(sortedData.length)

      // 페이지에 해당하는 데이터만 추출
      const startIndex = (page - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      setDisplayItems(sortedData.slice(startIndex, endIndex))

      setIsLoading(false)
    }, 500)
  }

  // URL 쿼리 파라미터가 변경될 때 검색 실행
  useEffect(() => {
    // URL에서 페이지 번호 가져오기
    const pageParam = searchParams.get('page')
    const page = pageParam ? parseInt(pageParam, 10) : 1

    setSearchQuery(initialQuery)
    setSearchOption(initialOption)
    setCurrentPage(page)

    fetchItems(initialQuery, initialOption, page)
  }, [initialQuery, initialOption, searchParams])

  // 총 페이지 수 계산
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <PageTransition>
      <Header />

      <div className="container mx-auto px-4 pt-6 relative">
        <div>
          <SearchBar onSearch={handleSearch} placeholder="캐릭터나 작가를 검색해보세요" initialValue={searchQuery} />
        </div>
        <div className="flex justify-between items-center py-4">
          <div className="text-xl text-gray-700 font-bold dark:text-dark-gray-300">
            {searchQuery && <span className="text-primary-600 dark:text-dark-primary-400 mr-1">'{searchQuery}'</span>}
            {searchOption === 'creator' && searchQuery && <span className="mr-1">작가</span>}
            {totalItems > 0 ? `${totalItems}개의 검색결과` : '검색 결과가 없습니다'}
          </div>
          <div>
            <Dropdown
              value={sortType}
              onChange={handleSortTypeChange}
              options={[
                { label: '인기순', value: 'popularity' },
                { label: '최신순', value: 'latest' },
              ]}
            />
          </div>
        </div>
        <div>
          <CardGrid useSwiper={false} customData={displayItems} isLoading={isLoading} cardsPerRow={6} />

          {!isLoading && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              className="mb-6"
            />
          )}
        </div>
      </div>
    </PageTransition>
  )
}
