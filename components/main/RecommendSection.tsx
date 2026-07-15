// 'use client'

import { DivideCircle } from 'lucide-react';
import Image from 'next/image';
import { useEffect } from 'react';
import { useRecommendSectionStoreData } from '@/store/useMainStoreData';
import { useSettingsStore } from '@/store/useStoreSettings';
import AuthorRankingSection from './recommend/AuthorRankingSection';
// 분리된 컴포넌트 임포트
import CharacterRankingSection from './recommend/CharacterRankingSection';
import CreateCharacterSection from './recommend/CreateCharacterSection';
import EtcCharactersSection from './recommend/EtcCharactersSection';
import LatestCharactersSection from './recommend/LatestCharactersSection';

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
      {/* 각 섹션을 별도의 컴포넌트로 분리하고 고유 ID 추가 */}
      <div id='character-ranking-section'>
        <CharacterRankingSection />
      </div>
      <div id='author-ranking-section'>
        <AuthorRankingSection />
      </div>

      {/* 앱 다운로드 섹션 */}
      <div className='bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-dark-primary-900/50 dark:to-dark-secondary-900/50 py-12 md:py-16'>
        {/* home 전용 콘텐츠 폭(캐브덕 참조) — docs/publish/publish-20260710-home-margins-logo.md */}
        <div className='mx-auto w-full max-w-[2200px] px-4 2xl:px-[100px]'>
          <div className='flex flex-col items-center text-center'>
            <h2 className='text-2xl md:text-3xl font-bold text-text-primary mb-4'>
              스토리네이션 앱 설치하기
            </h2>
            <div className='text-text-muted mb-8 max-w-2xl text-center text-sm md:text-lg'>
              <div className='mb-2'>스토리네이션을 모바일에서도 편리하게 이용해보세요.</div>
              <div>더 많은 캐릭터들은 물론 그들의 이야기와 세계관까지 함께 만날 수 있습니다.</div>
            </div>
            <div className='flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center'>
              <a
                href='https://play.google.com/store/search?q=%EC%8A%A4%ED%86%A0%EB%A6%AC%EB%84%A4%EC%9D%B4%EC%85%98&c=apps&hl=ko-KR'
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center justify-center bg-overlay text-text-inverse px-6 py-3 rounded-lg hover:bg-overlay/90 transition-colors'
              >
                <Image
                  src='/images/social_logo/google_btn.png'
                  alt='Android 앱 다운로드'
                  width={24}
                  height={24}
                  className='w-6 h-6 mr-2'
                />
                Android 앱 다운로드
              </a>
              <a
                href='https://apps.apple.com/kr/app/%EC%8A%A4%EB%84%A4-%ED%95%A8%EA%BB%98-%EB%A7%8C%EB%93%9C%EB%8A%94-%EC%84%B8%EA%B3%84%EA%B4%80-%EC%BA%90%EB%A6%AD%ED%84%B0/id6478522400'
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center justify-center bg-overlay text-text-inverse px-6 py-3 rounded-lg hover:bg-overlay/90 transition-colors'
              >
                <svg className='w-6 h-6 mr-2' viewBox='0 0 24 24' fill='currentColor'>
                  <path d='M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.02.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z' />
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
  );
}
