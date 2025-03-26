'use client'

import { bridgeTop10DataToModuleCharacter } from '@/lib/utils/storyNationUtil'
import { Character } from '@/store/useStoreData'
import { ReqTop10Characters } from '@/services/hooks/DataListManager'
import { useSettingsStore } from '@/store/useStoreSettings'
import { useStoreData } from '@/store/useStoreData'
import { useEffect } from 'react'

// 분리된 컴포넌트 임포트
import CharacterRankingSection from './recommend/CharacterRankingSection'
import AuthorRankingSection from './recommend/AuthorRankingSection'
import LatestCharactersSection from './recommend/LatestCharactersSection'
import CreateCharacterSection from './recommend/CreateCharacterSection'

interface RecommendSectionProps {
  onSearchTrigger?: (query: string) => void
}

// ModuleCharacter 데이터를 Character 타입에 맞게 변환하는 함수
const transformToCharacter = (data: ReturnType<typeof bridgeTop10DataToModuleCharacter>): Character[] => {
  return data.map(item => ({
    ...item,
    creator: {
      ...item.creator,
      nickname: '',
      username: '',
      profileImageUrl: null,
      isActive: true,
    },
    category: 'unspecified', // 기본값 설정
  }))
}

export default function RecommendSection({ onSearchTrigger }: RecommendSectionProps) {
  // 짜릿모드 상태 가져오기
  const { isAdultModeEnabled } = useSettingsStore()
  const { fetchCharacters } = useStoreData()

  // 컴포넌트 내부에서 직접 데이터 로드
  const { data: top10Data, isLoading, error, refetch } = ReqTop10Characters()

  useEffect(() => {
    // 페이지 로드 시 모든 캐릭터 데이터 미리 로드
    fetchCharacters()
  }, [fetchCharacters])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  if (!top10Data) {
    return <div>No data available</div>
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
