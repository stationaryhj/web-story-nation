'use client'

import PageTransition from '@/components/motion/PageTransition'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import Header from '@/components/common/header'
import SearchBar from '@/components/elements/searchBar/SearchBar'
import CardGrid from '@/components/elements/card/CardGrid'
import Dropdown from '@/components/elements/dropdown/Dropdown'
import Pagination from '@/components/elements/pagination/Pagination'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAccountStore } from '@/store/useAccountStore'
import { useModalStore } from '@/store/useStoreModal'
import { useSearchStore } from '@/store/useSearchStore'

type Props = {}

export default function searchPage({}: Props) {
  const router = useRouter()
  const { isLogin } = useAccountStore()
  const { openModal } = useModalStore()
  const searchParams = useSearchParams()

  // URL 쿼리 파라미터 가져오기
  const initialQuery = searchParams?.get('query') || ''
  const initialOption = searchParams?.get('option') || 'character'
  const initialPage = searchParams?.get('page') ? parseInt(searchParams.get('page') as string, 10) : 1

  // 스토어에서 필요한 상태와 메서드들 가져오기
  const {
    characters,
    searchQuery,
    searchOption,
    sortType,
    pagination,
    isLoading,
    error,
    setSearchQuery,
    setSearchOption,
    setSortType,
    setCurrentPage,
    search,
    loadMore,
    reset,
  } = useSearchStore()

  // 모바일 모드 감지
  const [isMobile, setIsMobile] = useState(false)

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

  // URL 쿼리 파라미터 초기화 및 변경 시 스토어 상태 업데이트
  useEffect(() => {
    setSearchQuery(initialQuery)
    setSearchOption(initialOption as 'character' | 'creator')
    setCurrentPage(initialPage)

    // 초기 검색 쿼리가 있는 경우 검색 실행
    if (initialQuery) {
      search()
    }
  }, [initialQuery, initialOption, initialPage, setSearchQuery, setSearchOption, setCurrentPage, search])

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
    const searchOpt = option || 'character'
    setSearchQuery(query)
    setSearchOption(searchOpt as 'character' | 'creator')
    setCurrentPage(1) // 검색 시 첫 페이지로 리셋

    // URL 쿼리 파라미터 업데이트
    updateUrlParams(query, searchOpt)

    // 스토어의 검색 메서드 호출
    search()
  }

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    // 스토어의 페이지 업데이트
    setCurrentPage(page)

    // URL 쿼리 파라미터 업데이트
    updateUrlParams(searchQuery, searchOption, page)

    // 스토어의 검색 메서드 호출하여 데이터 업데이트
    search()

    // 페이지 변경 시 스크롤을 상단으로 이동
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 정렬 타입 변경 핸들러
  const handleSortTypeChange = (type: string) => {
    // 스토어의 정렬 타입 업데이트
    setSortType(type === 'popularity' ? 1 : 2)

    // 검색 실행하여 정렬된 데이터 가져오기
    search()
  }

  // 무한 스크롤을 위한 더 불러오기 함수
  const loadMoreItems = useCallback(() => {
    if (isLoading || !pagination.hasMore) return

    // 스토어의 더 불러오기 메서드 호출
    loadMore()
  }, [isLoading, pagination.hasMore, loadMore])

  // 무한 스크롤 옵저버 설정
  useEffect(() => {
    if (!isMobile || !loadMoreRef.current) return

    observerRef.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && pagination.hasMore && !isLoading) {
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
  }, [isMobile, loadMoreItems, pagination.hasMore, isLoading])

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
        <div className="flex justify-end items-center py-4">
          <div>
            <Dropdown
              value={sortType === 1 ? 'popularity' : 'latest'}
              onChange={handleSortTypeChange}
              options={[
                { label: '인기순', value: 'popularity' },
                { label: '최신순', value: 'latest' },
              ]}
            />
          </div>
        </div>
        <div className="text-md md:text-2xl text-gray-700 font-bold dark:text-dark-gray-300 mt-2 mb-6 w-full flex items-center justify-center">
          <div className="flex items-center text-gray-500 dark:text-dark-gray-500">
            {searchQuery && (
              <span className="text-primary-600 dark:text-dark-primary-400 mr-1 truncate inline-block max-w-[150px] md:max-w-[200px]">
                '{searchQuery}'{searchOption === 'creator' && ' 작가'}
              </span>
            )}
            {pagination.totalItems > 0 ? `${pagination.totalItems}개의 검색결과` : '검색 결과가 없습니다'}
          </div>
        </div>
        <div>
          {pagination.totalItems === 0 ? (
            <div className="flex flex-col items-center justify-center text-center h-[calc(100vh-300px)] min-h-[400px]">
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
              <CardGrid useSwiper={false} customData={characters} isLoading={isLoading} cardsPerRow={6} />

              {/* 모바일: 무한 스크롤 로딩 표시 */}
              {isMobile && !isLoading && (
                <div ref={loadMoreRef} className="py-4 text-center">
                  {isLoading && (
                    <div className="flex justify-center items-center py-4">
                      <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin"></div>
                    </div>
                  )}
                  {!pagination.hasMore && characters.length > 0 && (
                    <p className="text-gray-500 dark:text-dark-gray-400 py-4">더 이상 결과가 없습니다</p>
                  )}
                </div>
              )}

              {/* PC: 페이지네이션 */}
              {!isMobile && !isLoading && (
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
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
