'use client'

import PageTransition from '@/components/motion/PageTransition'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import Header from '@/components/common/header'
import SearchBar from '@/components/elements/searchBar/SearchBar'
import CardGrid from '@/components/elements/card/CardGrid'
import Dropdown from '@/components/elements/dropdown/Dropdown'
import Pagination from '@/components/elements/pagination/Pagination'
import { Character } from '@/store/useStoreData'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAccountStore } from '@/store/useAccountStore'
import { useModalStore } from '@/store/useStoreModal'

type Props = {}

export default function searchPage({}: Props) {
  const router = useRouter()
  const { isLogin } = useAccountStore()
  const { openModal, setSelectedCharacter } = useModalStore()
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

  // 모바일 모드 감지
  const [isMobile, setIsMobile] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMoreItems, setHasMoreItems] = useState(true)

  // 무한 스크롤을 위한 옵저버 ref
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  // 화면 크기 감지하여 모바일/PC 모드 설정
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // 초기 실행
    handleResize()

    // 리사이즈 이벤트 리스너 추가
    window.addEventListener('resize', handleResize)

    // 클린업
    return () => {
      window.removeEventListener('resize', handleResize)
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  // URL 쿼리 파라미터 변경 함수
  const updateUrlParams = (query: string, option: string, page = 1) => {
    // 모바일 무한 스크롤에서는 URL에 페이지 정보를 포함하지 않음
    if (isMobile) {
      const params = new URLSearchParams()
      if (query) params.set('query', query)
      if (option) params.set('option', option)
      router.push(`/search?${params.toString()}`)
      return
    }

    // PC 페이지네이션 URL 업데이트
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

    // 모바일 무한 스크롤 상태 초기화
    if (isMobile) {
      setDisplayItems([])
      setHasMoreItems(true)
    }

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

    if (isMobile) {
      // 모바일에서는 처음부터 다시 표시
      setDisplayItems(sortedItems.slice(0, itemsPerPage))
      setCurrentPage(1)
      setHasMoreItems(sortedItems.length > itemsPerPage)
    } else {
      // PC에서는 현재 페이지 유지
      const startIndex = (currentPage - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      setDisplayItems(sortedItems.slice(startIndex, endIndex))
    }
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
  const fetchItems = (query = '', option = 'character', page = 1, isLoadMore = false) => {
    if (!isLoadMore) {
      setIsLoading(true)
    } else {
      setIsLoadingMore(true)
    }

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

      // 페이지에 해당하는 데이터 추출
      if (isMobile) {
        if (isLoadMore) {
          // 더 불러오기일 경우 기존 데이터에 추가
          const newItems = sortedData.slice((page - 1) * itemsPerPage, page * itemsPerPage)
          setDisplayItems(prev => [...prev, ...newItems])
          setHasMoreItems(page * itemsPerPage < sortedData.length)
          setIsLoadingMore(false)
        } else {
          // 새로운 검색일 경우 첫 페이지만 표시
          setDisplayItems(sortedData.slice(0, itemsPerPage))
          setHasMoreItems(itemsPerPage < sortedData.length)
        }
      } else {
        // PC 모드: 페이지네이션 전용
        const startIndex = (page - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        setDisplayItems(sortedData.slice(startIndex, endIndex))
      }

      setIsLoading(false)
      setIsLoadingMore(false)
    }, 500)
  }

  // 더 불러오기 함수 (무한 스크롤용)
  const loadMoreItems = useCallback(() => {
    if (!hasMoreItems || isLoadingMore || isLoading) return

    const nextPage = currentPage + 1
    setCurrentPage(nextPage)
    fetchItems(searchQuery, searchOption, nextPage, true)
  }, [currentPage, fetchItems, hasMoreItems, isLoading, isLoadingMore, searchOption, searchQuery])

  // 무한 스크롤 옵저버 설정
  useEffect(() => {
    if (!isMobile || !loadMoreRef.current) return

    observerRef.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMoreItems && !isLoading && !isLoadingMore) {
          loadMoreItems()
        }
      },
      { threshold: 0.5 }
    )

    observerRef.current.observe(loadMoreRef.current)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [isMobile, loadMoreItems, hasMoreItems, isLoading, isLoadingMore])

  // URL 쿼리 파라미터가 변경될 때 검색 실행
  useEffect(() => {
    // URL에서 페이지 번호 가져오기
    const pageParam = searchParams.get('page')
    const page = pageParam && !isMobile ? parseInt(pageParam, 10) : 1

    setSearchQuery(initialQuery)
    setSearchOption(initialOption)
    setCurrentPage(page)

    // 모바일 모드에서는 초기화
    if (isMobile) {
      setDisplayItems([])
      setHasMoreItems(true)
    }

    fetchItems(initialQuery, initialOption, page)
  }, [initialQuery, initialOption, searchParams, isMobile])

  // 총 페이지 수 계산
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // 캐릭터 생성 페이지로 이동하는 핸들러
  const handleCreateCharacter = () => {
    if (!isLogin) {
      openModal('login')
      return
    }
    router.push('/my-characters/create')
  }

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
          {totalItems === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-gray-200 mb-4">검색된 캐릭터가 없어요</h2>
              <p className="text-gray-600 dark:text-dark-gray-400 mb-8">내가 원하는 캐릭터를 직접 만들어 보세요!</p>
              <button
                onClick={handleCreateCharacter}
                className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                캐릭터 만들기
              </button>
            </div>
          ) : (
            <>
              <CardGrid useSwiper={false} customData={displayItems} isLoading={isLoading} cardsPerRow={6} />

              {/* 모바일: 무한 스크롤 로딩 표시 */}
              {isMobile && !isLoading && (
                <div ref={loadMoreRef} className="py-4 text-center">
                  {isLoadingMore && (
                    <div className="flex justify-center items-center py-4">
                      <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin"></div>
                    </div>
                  )}
                  {!hasMoreItems && displayItems.length > 0 && (
                    <p className="text-gray-500 dark:text-dark-gray-400 py-4">더 이상 결과가 없습니다</p>
                  )}
                </div>
              )}

              {/* PC: 페이지네이션 */}
              {!isMobile && !isLoading && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  className="mb-6"
                />
              )}
            </>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
