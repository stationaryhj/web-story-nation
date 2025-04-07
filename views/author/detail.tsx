'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/navigation'
import CardGrid from '@/components/elements/card/CardGrid'
import { faArrowLeft, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { useAuthorStore } from '@/store/useAuthorStore'

interface AuthorDetailPageProps {
  params: {
    id: string // 이 id는 실제로 작가의 nickname입니다
  }
}

export default function AuthorDetailPage({ params }: AuthorDetailPageProps) {
  const router = useRouter()
  const { author, characters, isLoading, error, fetchAuthorByNickname } = useAuthorStore()
  const [bio, setBio] = useState('작가 소개가 없습니다.')

  // 페이지 진입 시 작가 정보 조회
  useEffect(() => {
    // 현재 스토어 상태 확인
    const currentAuthor = useAuthorStore.getState().author;
    const nickname = decodeURIComponent(params.id);
    
    // 이미 저장된 정보가 있고, 같은 작가의 정보인 경우
    if (currentAuthor && currentAuthor.nickname === nickname) {
      // 작가의 캐릭터 목록만 로드 (상세 정보는 이미 있음)
      fetchAuthorByNickname(nickname);
    } else {
      // 작가 정보가 없거나 다른 작가의 정보인 경우 전체 정보 로드
      useAuthorStore.getState().reset(); // 기존 데이터 초기화
      fetchAuthorByNickname(nickname);
    }

    setBio(author?.bio || '작가 소개가 없습니다.')

    // 컴포넌트 언마운트 시 스토어 초기화
    return () => {
      // 언마운트 시에는 데이터 유지 (페이지 간 이동 시 데이터 보존)
      // 필요한 경우에만 reset 사용: useAuthorStore.getState().reset()
    }
  }, [params.id, fetchAuthorByNickname])

  // 컴포넌트가 마운트될 때 스크롤을 맨 위로 이동
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

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
            <FontAwesomeIcon icon={faArrowLeft} className="text-gray-600 dark:text-dark-gray-400" />
          </button>
          <h1 className="text-xl font-bold text-gray-600 dark:text-dark-gray-200">작가정보</h1>
        </div>

        {/* 로딩 중 */}
        {isLoading && !author && (
          <div className="flex justify-center items-center h-64">
            <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 text-primary-500 dark:text-dark-primary-400 animate-spin" />
          </div>
        )}

        {/* 에러 발생 */}
        {error && (
          <div className="mt-8 p-4 bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
            {error.message || '작가 정보를 불러오는 중 오류가 발생했습니다.'}
          </div>
        )}

        {/* 데이터 로드 완료 */}
        {author && !isLoading && (
          <div className="flex flex-col gap-8">
            {/* 작가 프로필 섹션 */}
            <div>
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-dark-gray-700 py-8">
                <div className="flex items-center gap-4 ">
                  <Image
                    src={author.profileImage || '/images/default-profile.jpg'}
                    alt={author.nickname}
                    width={80}
                    height={80}
                    className="rounded-full w-20 h-20 object-cover aspect-square"
                  />
                  <div className="flex flex-col gap-2">
                    <div>
                      <h1 className="text-2xl font-bold dark:text-dark-gray-100">{author.nickname}</h1>
                    </div>
                    <div>
                      <div className="text-lg text-gray-500 dark:text-dark-gray-400">
                        {bio}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 캐릭터 그리드 섹션 */}
            <div>
              <h2 className="text-xl font-bold mb-6 dark:text-dark-gray-200">캐릭터 목록</h2>
              {characters.length > 0 ? (
                <CardGrid customData={characters} variant="default" cardsPerRow={5} useSwiper={false} />
              ) : (
                <div className="text-center py-10 text-gray-500 dark:text-dark-gray-400">
                  {isLoading ? '캐릭터를 불러오는 중입니다...' : '작가가 생성한 캐릭터가 없습니다.'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 작가 정보가 없는 경우 */}
        {!author && !isLoading && !error && (
          <div className="mt-8 p-4 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-lg">
            해당 작가를 찾을 수 없습니다.
          </div>
        )}
      </div>
    </main>
  )
}
