'use client'

import { CardTransition } from '@/components/motion/PageTransition'
import { getImageUri } from '@/lib/utils/storyNationUtil'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faPen } from '@fortawesome/free-solid-svg-icons'
import Image from 'next/image'
import React from 'react'

interface Author {
  id: string
  name: string
  nickname: string
  description?: string
  profileImageUrl?: string | null
  characterCount: number // 생성한 캐릭터 수
  isVerified?: boolean // 인증된 작가 여부
  isSidebar?: boolean
}

interface AuthorCardProps {
  author: Author
  index?: number
  hasRank?: boolean
  rank?: number
  onClick?: () => void
  isSidebar?: boolean
}

export default function AuthorCard({
  author,
  index = 0,
  hasRank = false,
  rank,
  onClick,
  isSidebar = false,
}: AuthorCardProps) {
  const { name, nickname, description, profileImageUrl, characterCount, isVerified } = author
  const [imageError, setImageError] = React.useState(false)

  // 이미지 로드 에러 핸들러
  const handleImageError = () => {
    setImageError(true)
  }

  // 랭킹에 따른 배경색 설정
  const getRankBgColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500' // 1위: 금색
    if (rank === 2) return 'bg-gray-400' // 2위: 은색
    if (rank === 3) return 'bg-amber-600' // 3위: 동색
    return 'bg-primary-500' // 그 외
  }

  return (
    <CardTransition index={index}>
      <div
        className="flex flex-col relative rounded-xl shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-dark-background-light dark:border dark:border-dark-secondary-200/10 cursor-pointer"
        onClick={onClick}
      >
        <div className={`${isSidebar ? 'flex gap-2 p-2' : 'p-4'}`}>
          {/* 상단 이미지와 랭킹 */}
          <div className="relative mb-3">
            {/* 랭킹 표시 */}
            {hasRank && rank !== undefined && (
              <div
                className={`absolute top-[-10px] left-[-10px] z-10 w-6 h-6 ${getRankBgColor(index + 1)} text-white flex items-center justify-center font-bold shadow-md rounded-full`}
              >
                {rank}
              </div>
            )}

            <div
              className={`flex items-center justify-center ${isSidebar ? '' : 'border-b border-secondary-200 dark:border-dark-secondary-200 mb-3'}`}
            >
              {/* 프로필 이미지 */}
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-secondary-100 dark:bg-dark-secondary-800 mr-3 flex-shrink-0 mb-3">
                {profileImageUrl ? (
                  <Image
                    src="/images/placeholders/author_default_img.jpg"
                    alt={nickname || name}
                    fill
                    className="object-cover"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-secondary-400 dark:text-dark-secondary-500">
                    <FontAwesomeIcon icon={faUser} className="text-xl" />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div
            className={`${isSidebar ? 'flex flex-col justify-start w-full' : 'flex flex-col justify-center items-center text-center w-full'}`}
          >
            <div>
              {/* 작가 정보 */}
              <div className="flex-1 min-w-0">
                <div className={`flex items-center w-full mb-2 ${isSidebar ? '' : 'justify-center'}`}>
                  <div className="font-bold text-[12px] text-secondary-900 dark:text-dark-secondary-200 truncate group-hover:text-primary-600 dark:group-hover:text-dark-primary-400 transition-colors">
                    {nickname || name}
                  </div>
                </div>
              </div>
            </div>
            <div className={`flex items-center w-full ${isSidebar ? '' : 'justify-center'}`}>
              {/* 작가 소개 */}
              {description && (
                <p className="text-xs text-secondary-600 dark:text-dark-secondary-500 line-clamp-2 group-hover:text-secondary-800 dark:group-hover:text-dark-secondary-400 transition-colors">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </CardTransition>
  )
}
