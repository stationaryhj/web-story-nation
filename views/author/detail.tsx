'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Siren } from 'lucide-react'
import { useRouter } from 'next/navigation'
import CardGrid from '@/components/elements/card/CardGrid'
import ReportModal from '@/components/modal/ReportModal'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'

interface AuthorDetailPageProps {
  params: {
    id: string
  }
}

export default function AuthorDetailPage({ params }: AuthorDetailPageProps) {
  const router = useRouter()
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // 컴포넌트가 마운트될 때 스크롤을 맨 위로 이동
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // 임시 데이터 - API 연동 시 실제 데이터로 교체
  const writerData = {
    nickname: '작가의 닉네임',
    profileImage: '/images/character1.jpg',
    isBlocked: false,
    characters: Array(5)
      .fill(null)
      .map((_, index) => ({
        id: String(index + 1),
        name: `캐릭터 이름 ${index + 1}`,
        description: '캐릭터 설명이 들어갑니다.',
        imageUrl: '/images/character1.jpg',
        commentCount: 0,
        likeCount: 0,
        chatCount: 0,
        creator: {
          id: '1',
          nickname: '작가의 닉네임',
          username: '작가의 유저네임',
          profileImageUrl: '/images/character1.jpg',
          isActive: true,
        },
        category: 'unspecified' as const,
        isAdult: false,
        hashtags: [],
        level: 1,
        finish_yn: 1,
      })),
  }

  const handleSubmitReport = async (reason: string, description: string) => {
    try {
      // TODO: API 연동
      // const response = await reportWriter(params.id, reason, description);
      console.log('Report submitted:', { writerId: params.id, reason, description })
      setIsSubmitted(true)

      // 3초 후 모달 닫기
      setTimeout(() => {
        setIsReportModalOpen(false)
        setIsSubmitted(false)
      }, 3000)
    } catch (error) {
      console.error('Failed to submit report:', error)
      // TODO: 에러 처리
    }
  }

  return (
    <main className="flex-1">
      {/* 메인 컨텐츠 */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              router.back()
            }}
            className="mr-3"
            aria-label="뒤로 가기"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-600">작가정보</h1>
        </div>
        <div className="flex flex-col gap-8">
          {/* 작가 프로필 섹션 */}
          <div>
            <div className="flex items-center justify-between border-b border-gray-200 py-8">
              <div className="flex items-center gap-4 ">
                <Image
                  src={writerData.profileImage}
                  alt={writerData.nickname}
                  width={80}
                  height={80}
                  className="rounded-full w-20 h-20 object-cover aspect-square"
                />
                <div className="flex flex-col gap-2">
                  <div>
                    <h1 className="text-2xl font-bold">{writerData.nickname}</h1>
                  </div>
                  <div>
                    <div className="text-lg text-gray-500">작가 한마디</div>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsReportModalOpen(true)} className="text-red-500 hover:text-red-600">
                <Siren />
              </button>
            </div>
          </div>

          {/* 캐릭터 그리드 섹션 */}
          <div>
            <h2 className="text-xl font-bold mb-6">캐릭터 목록</h2>
            <CardGrid customData={writerData.characters} variant="default" cardsPerRow={5} useSwiper={false} />
          </div>
        </div>
      </div>

      {/* 신고 모달 */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleSubmitReport}
        submitted={isSubmitted}
        reportType="writer"
      />
    </main>
  )
}
