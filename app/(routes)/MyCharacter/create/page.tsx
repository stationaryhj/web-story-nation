'use client'

import { useRouter } from 'next/navigation'
import { SectionTransition } from '@/components/ui/motion/PageTransition'

export default function CreateCharacterPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-background pb-20">
      <SectionTransition>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-dark-secondary-700 mb-8">캐릭터 만들기</h1>

          {/* 캐릭터 생성 폼 (실제 구현 시 추가) */}
          <div className="bg-white dark:bg-dark-background-light p-6 rounded-xl shadow-sm">
            <p className="text-secondary-600 dark:text-dark-secondary-500">
              캐릭터 생성 폼이 이곳에 구현될 예정입니다.
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
                생성하기
              </button>
            </div>
          </div>
        </div>
      </SectionTransition>
    </div>
  )
}
