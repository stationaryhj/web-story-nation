'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faCheckCircle, faUser } from '@fortawesome/free-solid-svg-icons'
import ButtonTabs, { TabItem } from '@/components/elements/tabs/ButtonTabs'
import { lockScroll, unlockScroll, resetScrollLock } from '@/lib/utils/scrollLock'
import Image from 'next/image'
import { useRecommendSectionStoreData } from '@/store/useMainStoreData'


// 작가 랭킹 탭 정의
const rankingTabs: TabItem[] = [
  { id: 'weekly', label: '주간' },
  { id: 'monthly', label: '월간' },
  { id: 'all', label: '전체' },
]

// 목업 작가 데이터
const generateMockAuthors = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `author-${i + 1}`,
    name: `작가${i + 1}`,
    nickname: `작가닉네임${i + 1}`,
    description: `${i + 1}번 작가의 간단한 소개입니다. 캐릭터 창작을 좋아하는 스토리텔러입니다.`,
    profileImageUrl: i % 5 === 0 ? null : `/images/profile/author${(i % 4) + 1}.jpg`,
    characterCount: Math.floor(Math.random() * 20) + 1,
    isVerified: i % 10 === 0, // 10번째마다 인증된 작가
  }))
}

interface AuthorRankingSidebarProps {
  isOpen: boolean
  onClose: () => void
  isSidebar?: boolean
}

export default function AuthorRankingSidebar({ isOpen, onClose, isSidebar = false }: AuthorRankingSidebarProps) {
  const [activeTab, setActiveTab] = useState('weekly')
  const [rankingData, setRankingData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { rankingCreaters } = useRecommendSectionStoreData()
  
  // 랭킹 데이터 가져오기
  useEffect(() => {
    const fetchRankingData = async () => {
      setIsLoading(true)
      try {
        // 실제 구현에서는 API를 호출해야 합니다.
        // 현재는 목업 데이터를 사용합니다.
        setTimeout(() => {
          // 목업 작가 데이터 생성
          // const mockAuthors = generateMockAuthors(200)

          const mockAuthors = rankingCreaters.map(character => ({
            id: character.id,
            name: character.name,
            nickname: character.creator?.nickname || character.name,
            description: character.description || '',
            profileImageUrl: character.imageUrl,
            characterCount: 0, // 기본값 설정
            isVerified: true,  // 기본값 설정
          }));

          // 탭에 따라 다른 정렬 적용
          let sortedAuthors = [...mockAuthors]
          if (activeTab === 'weekly') {
            // 주간 랭킹 - 캐릭터 수 기준 정렬
            sortedAuthors.sort((a, b) => b.characterCount - a.characterCount)
          } else if (activeTab === 'monthly') {
            // 월간 랭킹 - 인증 여부 우선, 그 다음 캐릭터 수
            sortedAuthors.sort((a, b) => {
              if (a.isVerified !== b.isVerified) return b.isVerified ? 1 : -1
              return b.characterCount - a.characterCount
            })
          } else {
            // 전체 랭킹 - 이름 알파벳 순
            sortedAuthors.sort((a, b) => a.nickname.localeCompare(b.nickname))
          }

          setRankingData(sortedAuthors)
          console.log('sortedAuthors', sortedAuthors)
          setIsLoading(false)
        }, 500)
      } catch (error) {
        console.error('작가 랭킹 데이터 로드 실패:', error)
        setIsLoading(false)
      }
    }

    if (isOpen) {
      fetchRankingData()
    }
  }, [isOpen, activeTab])

  // 탭 변경 핸들러
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
  }

  // 작가 클릭 핸들러
  const handleAuthorClick = (author: any) => {
    console.log('작가 선택:', author)
    // 작가 프로필 페이지 이동 또는 추가 정보 표시 로직
  }

  // 모달이 열릴 때 배경 스크롤 방지
  useEffect(() => {
    // 이전 사이드바의 스크롤 락 상태 확인
    console.log('AuthorRankingSidebar - isOpen 변경됨:', isOpen)

    if (isOpen) {
      try {
        lockScroll()
        console.log('AuthorRankingSidebar - 스크롤 락 적용됨')
      } catch (error) {
        console.error('AuthorRankingSidebar - 스크롤 락 적용 실패:', error)
      }
    } else {
      try {
        unlockScroll()
        console.log('AuthorRankingSidebar - 스크롤 락 해제됨')
      } catch (error) {
        console.error('AuthorRankingSidebar - 스크롤 락 해제 실패:', error)
      }
    }

    return () => {
      console.log('AuthorRankingSidebar - 컴포넌트 언마운트')
      try {
        resetScrollLock()
        console.log('AuthorRankingSidebar - 스크롤 락 초기화됨')
      } catch (error) {
        console.error('AuthorRankingSidebar - 스크롤 락 초기화 실패:', error)
      }
    }
  }, [isOpen])

  // Framer Motion 변수
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  const sidebarVariants = {
    hidden: { x: '100%' },
    visible: { x: 0 },
  }

  // 랭킹 배경색 결정
  const getRankBgColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500' // 1위: 금색
    if (rank === 2) return 'bg-gray-400' // 2위: 은색
    if (rank === 3) return 'bg-amber-600' // 3위: 동색
    return 'bg-primary-500' // 그 외
  }

  // 스켈레톤 로더 렌더링
  const renderSkeletons = () => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <div key={`skeleton-${index}`} className="border dark:border-dark-secondary-200/10 rounded-lg mb-4 p-4">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-md bg-secondary-100 dark:bg-dark-secondary-800 animate-pulse"></div>
            <div className="w-16 h-16 rounded-full bg-secondary-100 dark:bg-dark-secondary-800 animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 w-24 bg-secondary-100 dark:bg-dark-secondary-800 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-secondary-100 dark:bg-dark-secondary-800 rounded animate-pulse w-full"></div>
            </div>
          </div>
        </div>
      ))
  }

  // 작가 카드 렌더링
  const renderAuthorCards = () => {
    return rankingData.map((author, index) => (
      <div
        key={author.id}
        className="border dark:border-dark-secondary-200/10 rounded-lg mb-4 p-4 cursor-pointer hover:bg-secondary-50 dark:hover:bg-dark-secondary-900/30 transition-colors"
        onClick={() => handleAuthorClick(author)}
      >
        <div className="flex items-center">
          {/* 프로필 이미지와 랭킹 표시 */}
          <div className="relative flex-shrink-0">
            {/* 프로필 이미지 */}
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-secondary-100 dark:bg-dark-secondary-800">
              {author.profileImageUrl ? (
                <Image
                  src="/images/placeholders/author_default_img.jpg"
                  alt={author.nickname || author.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-secondary-400 dark:text-dark-secondary-500">
                  <FontAwesomeIcon icon={faUser} className="text-xl" />
                </div>
              )}
            </div>

            {/* 랭킹 표시 - 이미지 좌측 상단에 겹쳐서 표시 */}
            <div
              className={`absolute -top-2 -left-2 w-7 h-7 ${getRankBgColor(index + 1)} text-white flex items-center justify-center font-bold rounded-full shadow-md z-10`}
            >
              {index + 1}
            </div>
          </div>

          {/* 작가 정보 */}
          <div className="ml-4 flex-1 overflow-hidden">
            <h3 className="font-bold text-secondary-900 dark:text-dark-secondary-200 text-sm">
              {author.nickname || author.name}
            </h3>
            <p className="text-xs text-secondary-600 dark:text-dark-secondary-500 mt-1 line-clamp-2">
              {author.description}
            </p>
          </div>
        </div>
      </div>
    ))
  }

  return (
    <>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-50"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={overlayVariants}
          onClick={onClose}
        >
          <motion.div
            className="fixed top-0 right-0 h-full w-[600px] bg-white dark:bg-dark-background-DEFAULT overflow-y-auto z-50"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={sidebarVariants}
            transition={{ type: 'tween', duration: 0.3 }}
            onClick={e => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="sticky top-0 bg-white dark:bg-dark-background-DEFAULT z-20 px-6 py-4 border-b dark:border-dark-secondary-200/10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-secondary-900 dark:text-dark-secondary-200">작가 랭킹</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-secondary-500 hover:bg-secondary-100 dark:text-dark-secondary-400 dark:hover:bg-dark-secondary-800"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            {/* 필터 영역 */}
            <div className="px-6 py-4 border-b dark:border-dark-secondary-200/10 space-y-4">
              {/* 탭 */}
              <div>
                <ButtonTabs tabs={rankingTabs} defaultTabId={activeTab} onTabChange={handleTabChange} />
              </div>
            </div>

            {/* 컨텐츠 영역 */}
            <div className="px-6 py-4">{isLoading ? renderSkeletons() : renderAuthorCards()}</div>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}
