// 'use client'

import { useSettingsStore } from '@/store/useStoreSettings'
import { useEffect } from 'react'
import { useRecommendSectionStoreData } from '@/store/useMainStoreData'

// 분리된 컴포넌트 임포트
import CharacterRankingSection from './recommend/CharacterRankingSection'
import AuthorRankingSection from './recommend/AuthorRankingSection'
import LatestCharactersSection from './recommend/LatestCharactersSection'
import CreateCharacterSection from './recommend/CreateCharacterSection'
import EtcCharactersSection from './recommend/EtcCharactersSection'

interface RecommendSectionProps {
  onSearchTrigger?: (query: string) => void
}

export default function RecommendSection({ onSearchTrigger }: RecommendSectionProps) {
  // 짜릿모드 상태 가져오기
  const { isAdultModeEnabled } = useSettingsStore()
  const { initialize } = useRecommendSectionStoreData()

  // 짜릿모드 변경 시 데이터 다시 로드
  useEffect(() => {
    // 실시간, 전체
    // UpdateRankingTopCharacter('KR', 4, 4, false)

    // 주간
    // UpdateRankingTopCreater('KR', 2, false)

    // 일간, 전체
    // UpdateLatestCharacters(1, 4, false)

    initialize()
  }, [isAdultModeEnabled])

  return (
    <div>
      {/* 각 섹션을 별도의 컴포넌트로 분리하고 고유 ID 추가 */}
      <div id="character-ranking-section">
        <CharacterRankingSection />
      </div>
      <div id="author-ranking-section">
        <AuthorRankingSection />
      </div>

      {/* 앱 다운로드 섹션 */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-dark-primary-900/50 dark:to-dark-secondary-900/50 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 dark:text-dark-secondary-100 mb-4">
              스토리네이션 앱 설치하기
            </h2>
            <p className="text-secondary-600 dark:text-dark-secondary-400 mb-8 max-w-2xl">
              스토리네이션을 모바일에서도 편리하게 이용해보세요.
              더 많은 캐릭터들과 함께 이야기를 나눌 수 있습니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
              <a
                href="https://play.google.com/store/search?q=%EC%8A%A4%ED%86%A0%EB%A6%AC%EB%84%A4%EC%9D%B4%EC%85%98&c=apps&hl=ko-KR"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center bg-secondary-900 dark:bg-dark-secondary-800 text-white px-6 py-3 rounded-lg hover:bg-secondary-800 dark:hover:bg-dark-secondary-700 transition-colors"
              >
                <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.9 5c.1 0 .2.1.3.2v13.5c0 .2-.1.3-.3.3H6.1c-.2 0-.3-.1-.3-.3V5.2c0-.1.1-.2.3-.2h11.8zm-4.7 14.2c.4 0 .7-.3.7-.7s-.3-.7-.7-.7-.7.3-.7.7.3.7.7.7zM16.4 17H7.6V6h8.8v11z"/>
                </svg>
                Android 앱 다운로드
              </a>
              <a
                href="https://apps.apple.com/kr/app/%EC%8A%A4%EB%84%A4-%ED%95%A8%EA%BB%98-%EB%A7%8C%EB%93%9C%EB%8A%94-%EC%84%B8%EA%B3%84%EA%B4%80-%EC%BA%90%EB%A6%AD%ED%84%B0/id6478522400"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center bg-secondary-900 dark:bg-dark-secondary-800 text-white px-6 py-3 rounded-lg hover:bg-secondary-800 dark:hover:bg-dark-secondary-700 transition-colors"
              >
                <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.02.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                iOS 앱 다운로드
              </a>
            </div>
          </div>
        </div>
      </div>

      <LatestCharactersSection />
      <EtcCharactersSection />

      <CreateCharacterSection />
    </div>
  )
}
