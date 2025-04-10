'use client'

import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import ButtonTabs, { TabItem } from '@/components/elements/tabs/ButtonTabs'
import Image from 'next/image'
import BaseSidebar from './BaseSidebar'
import { useRecommendSectionStoreData } from '@/store/useMainStoreData'
import { getValidImageUrl } from '@/lib/utils/storyNationUtil'
import { useRouter } from 'next/navigation'

// 작가 랭킹 탭 정의
const rankingTabs: TabItem[] = [
  { id: 'weekly', label: '주간' },
  { id: 'monthly', label: '월간' },
  { id: 'all', label: '전체' },
]

interface AuthorRankingSidebarProps {
  isOpen: boolean
  onClose: () => void
  isSidebar?: boolean
}

export default function AuthorRankingSidebar({ isOpen, onClose, isSidebar = false }: AuthorRankingSidebarProps) {
  const [activeTab, setActiveTab] = useState('weekly')
  const [rankingData, setRankingData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { rankingCreatersSlide, UpdateRankingTopCreater } = useRecommendSectionStoreData()
  const router = useRouter()

  useEffect(() => {
    // 주간
    UpdateRankingTopCreater('KR', 2, true)
  }, [])

  // 랭킹 데이터 가져오기
  useEffect(() => {
    const fetchRankingData = async () => {
      setIsLoading(true)
      try {
        // 실제 구현에서는 API를 호출해야 합니다.
        // 현재는 목업 데이터를 사용합니다.

        // const mockAuthors = {
        //   weekly: Array.from({ length: 100 }, (_, index) => ({
        //     id: index + 1,
        //     nickname: `작가${index + 1}`,
        //     profileImage: `/images/profile/author${(index % 10) + 1}.jpg`,
        //     introduction: `안녕하세요! 저는 ${index + 1}번째 작가입니다. 다양한 장르의 캐릭터를 만들고 있어요.`,
        //     penIncome: Math.floor(Math.random() * 100000) + 50000,
        //     rank: index + 1,
        //     characterCount: Math.floor(Math.random() * 50) + 1,
        //     likeCount: Math.floor(Math.random() * 1000) + 100,
        //     isFollowing: Math.random() > 0.5,
        //     isVerified: Math.random() > 0.7, // 30%의 확률로 인증된 작가
        //     badges: [
        //       Math.random() > 0.7 ? '인기작가' : null,
        //       Math.random() > 0.8 ? '신인상' : null,
        //       Math.random() > 0.9 ? '베스트작가' : null,
        //     ].filter(Boolean),
        //     tags: ['로맨스', '판타지', 'SF', '일상', '코미디', '드라마', '미스터리', '호러']
        //       .sort(() => Math.random() - 0.5)
        //       .slice(0, Math.floor(Math.random() * 3) + 1),
        //   })).sort((a, b) => b.penIncome - a.penIncome), // 펜 수익 기준으로 정렬
        // }

        const mockAuthors = rankingCreatersSlide.map(character => ({
          id: character.id,
          name: character.name,
          nickname: character.creator?.nickname || character.name,
          description: character.description || '',
          profileImageUrl: getValidImageUrl(character.imageUrl),
          characterCount: 0, // 기본값 설정
          isVerified: true, // 기본값 설정
          isSidebar: true,
        }))

        // 탭에 따라 다른 정렬 적용
        // let sortedAuthors = [...mockAuthors]
        // if (activeTab === 'weekly') {
        //   // 주간 랭킹 - 캐릭터 수 기준 정렬
        //   sortedAuthors.sort((a, b) => b.characterCount - a.characterCount)
        // } else if (activeTab === 'monthly') {
        //   // 월간 랭킹 - 인증 여부 우선, 그 다음 캐릭터 수
        //   sortedAuthors.sort((a, b) => {
        //     if (a.isVerified !== b.isVerified) return b.isVerified ? 1 : -1
        //     return b.characterCount - a.characterCount
        //   })
        // } else {
        //   // 전체 랭킹 - 이름 알파벳 순
        //   sortedAuthors.sort((a, b) => a.nickname.localeCompare(b.nickname))
        // }

        setRankingData(mockAuthors)
        console.log('sortedAuthors', mockAuthors)
        setIsLoading(false)
      } catch (error) {
        console.error('작가 랭킹 데이터 로드 실패:', error)
        setIsLoading(false)
      }
    }

    if (isOpen) {
      fetchRankingData()
    }
  }, [isOpen, activeTab, rankingCreatersSlide])

  // 탭 변경 핸들러
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    const topid = tabId === 'weekly' ? 2 : tabId === 'monthly' ? 3 : tabId === 'all' ? 5 : 2
    UpdateRankingTopCreater('KR', topid, true)
  }

  // 작가 클릭 핸들러
  const handleAuthorClick = (author: any) => {
    console.log('작가 선택:', author)
    router.push(`/author/${encodeURIComponent(author.nickname)}`)

    // 작가 프로필 페이지 이동 또는 추가 정보 표시 로직
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
    return rankingData.map((author, index) => {
      // 8위까지는 상세 정보 표시
      if (index < 20) {
        return (
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
                      src={author.profileImageUrl}
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
        )
      }

      // 9위 이상은 간단한 정보만 표시
      return (
        <div
          key={author.id}
          className="flex items-center px-4 py-2 cursor-pointer hover:bg-secondary-50 dark:hover:bg-dark-secondary-900/30 transition-colors rounded-lg"
          onClick={() => handleAuthorClick(author)}
        >
          <div
            className={`w-6 h-6 ${getRankBgColor(index + 1)} text-white flex items-center justify-center font-medium rounded-md text-sm mr-3`}
          >
            {index + 1}
          </div>
          <span className="text-sm text-secondary-900 dark:text-dark-secondary-200 font-medium">
            {author.nickname || author.name}
          </span>
        </div>
      )
    })
  }

  return (
    <BaseSidebar isOpen={isOpen} onClose={onClose} title="작가 랭킹">
      {/* 필터 영역 */}
      <div className="px-6 py-4 border-b dark:border-dark-secondary-200/10 space-y-4">
        {/* 탭 */}
        <div>
          <ButtonTabs tabs={rankingTabs} defaultTabId={activeTab} onTabChange={handleTabChange} />
        </div>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="px-6 py-4">{isLoading ? renderSkeletons() : renderAuthorCards()}</div>
    </BaseSidebar>
  )
}
