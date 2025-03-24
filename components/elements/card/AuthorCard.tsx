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
}

interface AuthorCardProps {
  author: Author
  index?: number
  hasRank?: boolean
  rank?: number
  onClick?: () => void
}

export default function AuthorCard({ author, index = 0, hasRank = false, rank, onClick }: AuthorCardProps) {
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
        className="flex flex-col relative overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-dark-background-light dark:border dark:border-dark-secondary-200/10 cursor-pointer"
        onClick={onClick}
      >
        <div className="block p-4">
          {/* 상단 이미지와 랭킹 */}
          <div className="relative mb-3">
            {/* 랭킹 표시 */}
            {hasRank && rank !== undefined && (
              <div
                className={`absolute top-0 left-0 z-10 w-6 h-6 ${getRankBgColor(index)} text-white flex items-center justify-center font-bold shadow-md rounded-full`}
              >
                {rank}
              </div>
            )}

            <div className="flex items-center">
              {/* 프로필 이미지 */}
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-secondary-100 dark:bg-dark-secondary-800 mr-3 flex-shrink-0">
                {profileImageUrl ? (
                  <Image
                    src={getImageUri(profileImageUrl)}
                    alt={nickname || name}
                    width={48}
                    height={48}
                    className="object-cover"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-secondary-400 dark:text-dark-secondary-500">
                    <FontAwesomeIcon icon={faUser} className="text-xl" />
                  </div>
                )}
              </div>

              {/* 작가 정보 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <h3 className="font-bold text-secondary-900 dark:text-dark-secondary-200 truncate group-hover:text-primary-600 dark:group-hover:text-dark-primary-400 transition-colors mr-1">
                    {nickname || name}
                  </h3>
                  {isVerified && (
                    <span className="inline-flex items-center justify-center w-4 h-4 bg-primary-500 text-white rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-3 h-3"
                      >
                        <path
                          fillRule="evenodd"
                          d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  )}
                </div>
                <div className="flex items-center text-xs text-secondary-500 dark:text-dark-secondary-400 mt-0.5">
                  <FontAwesomeIcon icon={faPen} className="mr-1" />
                  <span>{characterCount}개의 캐릭터</span>
                </div>
              </div>
            </div>
          </div>

          {/* 작가 소개 */}
          {description && (
            <p className="text-xs text-secondary-600 dark:text-dark-secondary-500 line-clamp-2 group-hover:text-secondary-800 dark:group-hover:text-dark-secondary-400 transition-colors">
              {description}
            </p>
          )}
        </div>
      </div>
    </CardTransition>
  )
}
