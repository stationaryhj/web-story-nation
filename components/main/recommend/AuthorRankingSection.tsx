'use client'

import { useState, memo } from 'react'
import ButtonTabs, { TabItem } from '@/components/elements/tabs/ButtonTabs'
import AuthorGrid from '@/components/elements/card/AuthorGrid'
import { SectionTransition } from '@/components/motion/PageTransition'
import AuthorRankingSidebar from '@/components/elements/sidebar/AuthorRankingSidebar'
import { useRecommendSectionStoreData } from '@/store/useMainStoreData'

// 작가 랭킹 탭 정의
const authorRankingTabs: TabItem[] = [
  { id: 'weekly', label: '주간' },
  { id: 'monthly', label: '월간' },
  { id: 'all', label: '전체' },
]

// 랭킹 탭에 따른 업데이트 문구
const getRankingUpdateMessage = (tabId: string) => {
  switch (tabId) {
    case 'realtime':
      return `${Math.floor(Math.random() * 60)}분 전 업데이트`
    case 'daily':
      return '매일 밤 12시 업데이트'
    case 'weekly':
      return '매주 월요일 00시 업데이트'
    case 'monthly':
      return '매월 1일 00시 업데이트'
    default:
      return ''
  }
}

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
    name: 'SF작가',
    nickname: 'SF작가',
    description: '미래 세계와 과학적 상상력을 기반으로 한 캐릭터를 만듭니다.',
    profileImageUrl: '/images/profile/author5.jpg',
    characterCount: 7,
    isVerified: true,
  },
  {
    id: '6',
    name: '역사전문가',
    nickname: '역사전문가',
    description: '역사적 배경을 가진 캐릭터와 스토리를 만듭니다.',
    profileImageUrl: '/images/profile/author6.jpg',
    characterCount: 9,
    isVerified: true,
  },
  {
    id: '7',
    name: '호러작가',
    nickname: '호러작가',
    description: '공포와 스릴을 주는 캐릭터 전문 작가입니다.',
    profileImageUrl: null,
    characterCount: 4,
    isVerified: false,
  },
  {
    id: '8',
    name: '판타지히어로',
    nickname: '판타지히어로',
    description: '영웅적 요소를 가진 캐릭터를 전문적으로 만듭니다.',
    profileImageUrl: '/images/profile/author8.jpg',
    characterCount: 11,
    isVerified: true,
  },
  {
    id: '9',
    name: '일상작가',
    nickname: '일상작가',
    description: '일상의 소소한 이야기를 가진 캐릭터를 만듭니다.',
    profileImageUrl: '/images/profile/author9.jpg',
    characterCount: 6,
    isVerified: false,
  },
  {
    id: '10',
    name: '판타지메이커',
    nickname: '판타지메이커',
    description: '독특한 판타지 세계관의 캐릭터를 창작합니다.',
    profileImageUrl: '/images/profile/author10.jpg',
    characterCount: 14,
    isVerified: true,
  },
  // 추가 작가 데이터
  {
    id: '11',
    name: '우주탐험가',
    nickname: '우주탐험가',
    description: '우주를 배경으로 한 서사적 캐릭터와 이야기를 만듭니다.',
    profileImageUrl: '/images/profile/author11.jpg',
    characterCount: 18,
    isVerified: true,
  },
  {
    id: '12',
    name: '판타지마법사',
    nickname: '판타지마법사',
    description: '마법의 세계를 탐험하는 독특한 캐릭터를 창작하는 전문가입니다.',
    profileImageUrl: '/images/profile/author12.jpg',
    characterCount: 13,
    isVerified: true,
  },
  {
    id: '13',
    name: '모험가이야기',
    nickname: '모험가이야기',
    description: '모험심 넘치는 캐릭터들의 여정을 그립니다.',
    profileImageUrl: '/images/profile/author13.jpg',
    characterCount: 9,
    isVerified: false,
  },
  {
    id: '14',
    name: '사이버펑크',
    nickname: '사이버펑크',
    description: '미래의 디스토피아 세계관에서 살아가는 캐릭터를 창작합니다.',
    profileImageUrl: '/images/profile/author14.jpg',
    characterCount: 11,
    isVerified: true,
  },
  {
    id: '15',
    name: '판타지드래곤',
    nickname: '판타지드래곤',
    description: '드래곤과 마법이 공존하는 세계의 이야기를 만듭니다.',
    profileImageUrl: '/images/profile/author15.jpg',
    characterCount: 16,
    isVerified: true,
  },
]

// 작가 랭킹 섹션 컴포넌트
const AuthorRankingSection = memo(() => {
  const [authorActiveTab, setAuthorActiveTab] = useState('weekly')
  const [isAuthorRankingSidebarOpen, setIsAuthorRankingSidebarOpen] = useState(false)
  const { rankingCreaters } = useRecommendSectionStoreData()

  const handleAuthorRankingTabChange = (tabId: string) => {
    setAuthorActiveTab(tabId)
    // 여기서 실제로는 해당 탭에 맞는 데이터를 가져오는 API 호출이 필요합니다.
  }

  const getAuthorRankingData = () => {
    // 실제로는 탭에 따라 다른 데이터를 반환하는 로직이 필요함
    return rankingCreaters
  }

  const handleAuthorClick = (author: any) => {
    console.log('작가 선택:', author)
    // 작가 프로필 페이지로 이동 또는 모달 표시
  }

  return (
    <section className="py-10 bg-secondary-50 dark:bg-dark-secondary-900/30">
      <div className="container mx-auto px-4">
        {/* 작가 랭킹 탭 */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-dark-secondary-700 relative inline-block">
              작가 랭킹
              <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-primary-500 dark:bg-dark-primary-500 rounded-full"></span>
            </h2>
            <button
              onClick={() => setIsAuthorRankingSidebarOpen(true)}
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-dark-primary-400 dark:hover:text-dark-primary-300 flex items-center"
            >
              랭킹 더보기
            </button>
          </div>
          <p className="text-xs text-secondary-500 dark:text-dark-secondary-500 mb-4">
            {getRankingUpdateMessage(authorActiveTab)}
          </p>
          <ButtonTabs tabs={authorRankingTabs} defaultTabId="weekly" onTabChange={handleAuthorRankingTabChange} />
        </div>

        {/* 작가 랭킹 그리드 */}
        <SectionTransition>
          <div className="w-full">
            <AuthorGrid
              customData={getAuthorRankingData()}
              cardsPerRow={8}
              hasRanking={true}
              onAuthorClick={handleAuthorClick}
              useSwiper={true}
              sectionId="author-ranking-section"
            />
          </div>
        </SectionTransition>
      </div>
      <AuthorRankingSidebar isOpen={isAuthorRankingSidebarOpen} onClose={() => setIsAuthorRankingSidebarOpen(false)} />
    </section>
  )
})

AuthorRankingSection.displayName = 'AuthorRankingSection'

export default AuthorRankingSection
