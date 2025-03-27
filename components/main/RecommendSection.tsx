// 'use client'

import { useSettingsStore } from '@/store/useStoreSettings'
import { useEffect } from 'react'
import { useRecommendSectionStoreData } from '@/store/useMainStoreData'

// 분리된 컴포넌트 임포트
import CharacterRankingSection from './recommend/CharacterRankingSection'
import AuthorRankingSection from './recommend/AuthorRankingSection'
import LatestCharactersSection from './recommend/LatestCharactersSection'
import CreateCharacterSection from './recommend/CreateCharacterSection'

interface RecommendSectionProps {
  onSearchTrigger?: (query: string) => void
}

export default function RecommendSection({ onSearchTrigger }: RecommendSectionProps) {
  // 짜릿모드 상태 가져오기
  const { isAdultModeEnabled } = useSettingsStore()
  const { initialize, isLoading, error } = useRecommendSectionStoreData()
  
  useEffect(() => {
    initialize();
  }, []);

  // 짜릿모드 변경 시 데이터 다시 로드
  useEffect(() => {
  }, [isAdultModeEnabled])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }
  
  return (
    <div>
      {/* 각 섹션을 별도의 컴포넌트로 분리하고 고유 ID 추가 */}
      <div id="character-ranking-section">
        <CharacterRankingSection />
      </div>
      <div id="author-ranking-section">
        <AuthorRankingSection />
      </div>
      <LatestCharactersSection />
      <CreateCharacterSection />
    </div>
  )
}
