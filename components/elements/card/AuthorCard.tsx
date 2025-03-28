'use client'

import { CardTransition } from '@/components/motion/PageTransition'
import { getImageUri } from '@/lib/utils/storyNationUtil'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faPen, faCheckCircle } from '@fortawesome/free-solid-svg-icons'
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
  variant?: 'default' | 'horizontal'
}

export default function AuthorCard({
  author,
  index = 0,
  hasRank = false,
  rank,
  onClick,
  isSidebar = false,
  variant = 'default',
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

  // 가로형 카드 레이아웃
  if (variant === 'horizontal') {
    return (
      <CardTransition index={index}>
        <div
          className="group relative overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-dark-background-light dark:border dark:border-dark-secondary-200/10 cursor-pointer flex mb-2"
          onClick={onClick}
        >
          {/* 프로필 이미지 영역 */}
          <div className="relative w-28 h-24 overflow-hidden">
            {/* 랭킹 표시 */}
            {hasRank && rank !== undefined && (
              <div
                className={`absolute top-0 left-0 z-10 w-5 h-5 ${getRankBgColor(
                  rank
                )} text-white flex items-center justify-center font-bold shadow-md text-xs`}
              >
                {rank}
              </div>
            )}

            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              {profileImageUrl ? (
                <Image
                  src="/images/placeholders/author_default_img.jpg"
                  alt={nickname || name}
                  fill
                  className="object-cover object-center"
                  onError={handleImageError}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-secondary-400 dark:text-dark-secondary-500">
                  <FontAwesomeIcon icon={faUser} className="text-2xl" />
                </div>
              )}
            </div>

            {/* 캐릭터 수 표시 - 이미지 우측 하단으로 이동 */}
            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center backdrop-blur-sm">
              <FontAwesomeIcon icon={faUser} className="mr-1 text-xs" />
              <span>{characterCount}</span>
            </div>
          </div>

          {/* 콘텐츠 영역 */}
          <div className="flex-1 p-3">
            <div className="flex items-center">
              <h3 className="font-semibold text-secondary-900 dark:text-dark-secondary-700 text-sm truncate">
                {nickname || name}
              </h3>
              {isVerified && (
                <span className="ml-1 text-primary-500 dark:text-dark-primary-500">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                </span>
              )}
            </div>

            {/* 작가 설명 */}
            {description && (
              <p className="mt-1 text-xs text-secondary-600 dark:text-dark-secondary-500 line-clamp-2 max-h-10 overflow-hidden">
                {description}
              </p>
            )}

            {/* 태그 */}
            <div className="flex flex-wrap gap-1 mt-2">
              <span className="text-[10px] text-primary-500 dark:text-dark-primary-600 bg-primary-50 dark:bg-dark-primary-100/10 px-1.5 py-0.5 rounded-full">
                작가
              </span>
              {isVerified && (
                <span className="text-[10px] text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 px-1.5 py-0.5 rounded-full">
                  인증
                </span>
              )}
            </div>
          </div>
        </div>
      </CardTransition>
    )
  }

  // 기존 세로형 카드 레이아웃
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
              <div className="relative w-[60px] h-[60px] rounded-full overflow-hidden flex-shrink-0 mb-3">
                {profileImageUrl ? (
                  <Image
                    src="/images/placeholders/author_default_img.jpg"
                    alt={nickname || name}
                    fill
                    className="object-cover object-center"
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
