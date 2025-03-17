'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SectionTransition } from '@/components/ui/motion/PageTransition'
import { Character } from '@/store/useStoreData'

interface EditCharacterPageProps {
  params: {
    id: string
  }
}

export default function EditCharacterPage({ params }: EditCharacterPageProps) {
  const router = useRouter()
  const { id } = params
  const [character, setCharacter] = useState<Character | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 캐릭터 정보 로드 (실제 구현 시 API 호출로 대체)
  useEffect(() => {
    const loadCharacter = async () => {
      setIsLoading(true)
      try {
        // 실제 API 연동 시 아래 코드를 사용
        // const response = await fetch(`/api/characters/${id}`)
        // const data = await response.json()
        // setCharacter(data)

        // 임시 데이터
        setCharacter({
          id,
          name: `캐릭터 ${id}`,
          description: '이것은 수정할 캐릭터입니다. 다양한 대화를 나눠보세요.',
          imageUrl: '/images/character1.jpg',
          commentCount: Math.floor(Math.random() * 200),
          hashtags: ['#판타지', '#로맨스', '#모험'],
          isAdult: false,
          creator: {
            id: 'user-1',
            nickname: '내 닉네임',
            username: 'myusername',
            profileImageUrl: null,
            isActive: true,
          },
          category: 'male',
        })
      } catch (error) {
        console.error('캐릭터 로딩 실패:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCharacter()
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-background flex items-center justify-center">
        <div className="animate-pulse text-secondary-500 dark:text-dark-secondary-500">
          캐릭터 정보를 불러오는 중...
        </div>
      </div>
    )
  }

  if (!character) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-background flex items-center justify-center">
        <div className="text-red-500 dark:text-red-400">캐릭터를 찾을 수 없습니다.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-background pb-20">
      <SectionTransition>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-dark-secondary-700 mb-8">캐릭터 수정</h1>

          {/* 캐릭터 수정 폼 (실제 구현 시 추가) */}
          <div className="bg-white dark:bg-dark-background-light p-6 rounded-xl shadow-sm">
            <p className="text-secondary-600 dark:text-dark-secondary-500">
              캐릭터 ID: {character.id}
              <br />
              캐릭터 이름: {character.name}
              <br />
              캐릭터 수정 폼이 이곳에 구현될 예정입니다.
            </p>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => router.back()}
                className="py-2 px-4 bg-secondary-100 hover:bg-secondary-200 text-secondary-700 rounded-lg mr-2 transition-colors dark:bg-dark-secondary-100/10 dark:hover:bg-dark-secondary-100/20 dark:text-dark-secondary-500"
              >
                취소
              </button>
              <button
                onClick={() => router.push('/MyCharacter')}
                className="py-2 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors dark:bg-dark-primary-500 dark:hover:bg-dark-primary-600"
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
      </SectionTransition>
    </div>
  )
}
