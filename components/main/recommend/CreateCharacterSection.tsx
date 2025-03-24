'use client'

import { memo } from 'react'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'

// 캐릭터 생성 유도 섹션 컴포넌트
const CreateCharacterSection = memo(() => {
  return (
    <section className="py-12 bg-primary-50 dark:bg-dark-primary-900/30">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-secondary-900 dark:text-dark-secondary-200 mb-4">
          내가 원하는 캐릭터를 만들어 보세요!
        </h2>
        <p className="text-secondary-600 dark:text-dark-secondary-400 max-w-2xl mx-auto mb-8">
          당신만의 독특한 캐릭터를 만들고 다른 사용자들과 공유해보세요. 스토리네이션은 당신의 창의력을 펼칠 수 있는
          완벽한 공간입니다.
        </p>
        <Link
          href="/my-characters/create"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors dark:bg-dark-primary-600 dark:hover:bg-dark-primary-700 font-medium"
        >
          캐릭터 만들기
          <FontAwesomeIcon icon={faArrowRight} />
        </Link>
      </div>
    </section>
  )
})

CreateCharacterSection.displayName = 'CreateCharacterSection'

export default CreateCharacterSection
