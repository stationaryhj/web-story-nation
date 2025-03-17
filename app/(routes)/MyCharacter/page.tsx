'use client'

import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { Character } from '@/store/useStoreData'
import { FadeIn, SectionTransition } from '@/components/ui/motion/PageTransition'
import MyCharacterCard from './components/MyCharacterCard'
import CardSkeleton from '@/components/ui/features/card/CardSkeleton'

// 페이지당 캐릭터 수
const ITEMS_PER_PAGE = 10

export default function MyCharacterPage() {
  const router = useRouter()
  const [myCharacters, setMyCharacters] = useState<Character[]>([])

  // 무한 스크롤을 위한 Intersection Observer 설정
  const { ref, inView } = useInView()

  // 내 캐릭터 목록을 가져오는 무한 쿼리
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['my-characters'],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      // 실제 API 연동 시 아래 코드를 사용
      // const response = await fetch(`/api/my-characters?page=${pageParam}&limit=${ITEMS_PER_PAGE}`)
      // const data = await response.json()
      // return data

      // 임시 데이터 (실제 구현 시 API 호출로 대체)
      return getMockCharacters(pageParam as number)
    },
    getNextPageParam: (lastPage, allPages) => {
      // 마지막 페이지가 가득 차있으면 다음 페이지 존재
      return lastPage.characters.length === ITEMS_PER_PAGE ? allPages.length + 1 : undefined
    },
  })

  // 스크롤이 감지되면 다음 페이지 데이터 로드
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  // 캐릭터 생성 페이지로 이동
  const handleCreateCharacter = () => {
    router.push('/MyCharacter/create')
  }

  // 캐릭터 수정 처리
  const handleEditCharacter = (characterId: string) => {
    router.push(`/MyCharacter/edit/${characterId}`)
  }

  // 캐릭터 삭제 처리
  const handleDeleteCharacter = async (characterId: string) => {
    if (window.confirm('정말로 이 캐릭터를 삭제하시겠습니까?')) {
      try {
        // 실제 API 연동 시 아래 코드를 사용
        // await fetch(`/api/characters/${characterId}`, {
        //   method: 'DELETE',
        // })

        // 임시 처리 (UI에서만 삭제)
        setMyCharacters(prev => prev.filter(char => char.id !== characterId))

        alert('캐릭터가 삭제되었습니다.')
      } catch (error) {
        console.error('캐릭터 삭제 실패:', error)
        alert('캐릭터 삭제에 실패했습니다.')
      }
    }
  }

  // 캐릭터 클릭 시 대화방으로 이동
  const handleCardClick = (characterId: string) => {
    router.push(`/chat/${characterId}`)
  }

  // 모든 페이지의 캐릭터 데이터를 하나의 배열로 변환
  const allCharacters = data?.pages.flatMap(page => page.characters) || []

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-background pb-20">
      <SectionTransition>
        <div className="container mx-auto px-4 py-8">
          {/* 헤더 섹션 */}
          <div className="mb-8">
            <FadeIn direction="up" delay={0.1}>
              <h1 className="text-3xl font-bold text-secondary-900 dark:text-dark-secondary-700">내 캐릭터</h1>
              <p className="mt-2 text-secondary-600 dark:text-dark-secondary-500">
                내가 만든 캐릭터를 대화하고 싶은 캐릭터를 만들어 보세요!
                <br />
                확실한 보상! 채팅 수익은 현금으로 정산해 드립니다.
              </p>
            </FadeIn>
          </div>

          {/* 캐릭터 만들기 버튼 */}
          <FadeIn direction="up" delay={0.2}>
            <button
              onClick={handleCreateCharacter}
              className="w-full mb-8 py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center justify-center transition-colors duration-300 dark:bg-dark-primary-500 dark:hover:bg-dark-primary-600"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              캐릭터 만들기
            </button>
          </FadeIn>

          {/* 캐릭터 그리드 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {isLoading ? (
              // 로딩 중 스켈레톤 UI 표시
              Array(10)
                .fill(0)
                .map((_, index) => <CardSkeleton key={index} />)
            ) : allCharacters.length > 0 ? (
              // 캐릭터 카드 표시
              allCharacters.map((character, index) => (
                <MyCharacterCard
                  key={character.id}
                  character={character}
                  index={index}
                  onCardClick={() => handleCardClick(character.id)}
                  onEdit={() => handleEditCharacter(character.id)}
                  onDelete={() => handleDeleteCharacter(character.id)}
                />
              ))
            ) : (
              // 캐릭터가 없을 때 메시지 표시
              <div className="col-span-full text-center py-12">
                <p className="text-secondary-600 dark:text-dark-secondary-500 mb-4">아직 만든 캐릭터가 없습니다.</p>
                <button
                  onClick={handleCreateCharacter}
                  className="py-2 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg inline-flex items-center transition-colors duration-300 dark:bg-dark-primary-500 dark:hover:bg-dark-primary-600"
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />첫 캐릭터 만들기
                </button>
              </div>
            )}
          </div>

          {/* 무한 스크롤 트리거 */}
          {(hasNextPage || isFetchingNextPage) && (
            <div ref={ref} className="h-20 flex items-center justify-center mt-4">
              {isFetchingNextPage && (
                <div className="animate-pulse text-secondary-500 dark:text-dark-secondary-500">
                  캐릭터 불러오는 중...
                </div>
              )}
            </div>
          )}
        </div>
      </SectionTransition>
    </div>
  )
}

// 임시 데이터 생성 함수 (실제 구현 시 API 호출로 대체)
function getMockCharacters(page: number) {
  const startIdx = (page - 1) * ITEMS_PER_PAGE
  const characters: Character[] = Array(ITEMS_PER_PAGE)
    .fill(0)
    .map((_, idx) => ({
      id: `my-char-${startIdx + idx}`,
      name: `내 캐릭터 ${startIdx + idx + 1}`,
      description: `이것은 내가 만든 ${startIdx + idx + 1}번째 캐릭터입니다. 다양한 대화를 나눠보세요.`,
      imageUrl: '/images/character1.jpg',
      commentCount: Math.floor(Math.random() * 200),
      hashtags: ['#판타지', '#로맨스', '#모험'],
      isAdult: Math.random() > 0.7, // 30% 확률로 성인용 컨텐츠
      creator: {
        id: 'user-1',
        nickname: '내 닉네임',
        username: 'myusername',
        profileImageUrl: null,
        isActive: true,
      },
      category: Math.random() > 0.5 ? 'male' : 'female',
    }))

  return {
    characters,
    total: 100, // 임시 총 개수
  }
}
