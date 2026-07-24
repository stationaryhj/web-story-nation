// 'use client'

import { useEffect } from 'react';
import { useRecommendSectionStoreData } from '@/store/useMainStoreData';
import { useSettingsStore } from '@/store/useStoreSettings';
// 분리된 컴포넌트 임포트
import CreateCharacterSection from './recommend/CreateCharacterSection';
import EtcCharactersSection from './recommend/EtcCharactersSection';

interface RecommendSectionProps {
  onSearchTrigger?: (query: string) => void;
}

export default function RecommendSection({ onSearchTrigger }: RecommendSectionProps) {
  // 짜릿모드 상태 가져오기
  const { isAdultModeEnabled } = useSettingsStore();
  const { invalidateData } = useRecommendSectionStoreData();

  // 짜릿모드 변경 시 데이터 다시 로드
  useEffect(() => {
    invalidateData();
  }, [isAdultModeEnabled]);

  return (
    <div>
      <EtcCharactersSection />

      <CreateCharacterSection />
    </div>
  );
}
