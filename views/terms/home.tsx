'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { GetApiUrl } from '@/services/api/storyNationApi';
import { useTermsStore } from '@/store/useGlobalStore';

const tabs = [
  { id: 'terms', name: '서비스 이용약관', index: 0 },
  { id: 'privacy', name: '개인정보 처리방침', index: 2 },
  { id: 'paid', name: '유료 서비스 이용약관', index: 1 },
  { id: 'policy', name: '운영 정책', index: 3 },
];

export default function TermsPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'paid' | 'policy'>('terms');
  const { getTermsUrl, isLoading, error } = useTermsStore();
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [termsUrl, setTermsUrl] = useState<string | null>(null);

  // URL 쿼리에서 탭 파라미터 읽기
  useEffect(() => {
    const tabParam = searchParams?.get('tab');
    if (tabParam && ['terms', 'privacy', 'paid', 'policy'].includes(tabParam)) {
      setActiveTab(tabParam as 'terms' | 'privacy' | 'paid' | 'policy');
    }
  }, [searchParams]);

  // 현재 탭에 해당하는 약관 URL 가져오기
  useEffect(() => {
    const fetchTermsUrl = async () => {
      const tabIndex = tabs.find((tab) => tab.id === activeTab)?.index;
      if (tabIndex !== undefined) {
        try {
          setIsLoadingUrl(true);
          await getTermsUrl(tabIndex);
          // URL 설정
          const url = await getCurrentTermsUrl();
          setTermsUrl(url);
        } catch (error) {
          console.error(`약관 URL을 가져오는 중 에러 발생: ${error}`);
          setTermsUrl(null);
        } finally {
          setIsLoadingUrl(false);
        }
      }
    };

    fetchTermsUrl();
  }, [activeTab, getTermsUrl]);

  // 탭 변경 핸들러
  const handleTabChange = (tab: 'terms' | 'privacy' | 'paid' | 'policy') => {
    setActiveTab(tab);
    // URL 업데이트 (새로고침 없이)
    window.history.pushState({}, '', `/terms?tab=${tab}`);
  };

  // 현재 선택된 약관의 URL 가져오기
  const getCurrentTermsUrl = async (): Promise<string | null> => {
    const tabIndex = tabs.find((tab) => tab.id === activeTab)?.index;
    if (tabIndex !== undefined && (await getTermsUrl(tabIndex))) {
      return `${GetApiUrl()}/${await getTermsUrl(tabIndex)}`;
    }
    return null;
  };

  return (
    <div className='mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8'>
      <h1 className='mb-8 text-center text-3xl font-bold text-text-primary'>러브챗 약관</h1>

      <div className='mb-6 flex space-x-1 rounded-lg bg-surface-elevated-hover p-1'>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id as 'terms' | 'privacy' | 'paid' | 'policy')}
            className={`flex-1 rounded-md py-2.5 px-3 text-sm font-medium ${
              activeTab === tab.id
                ? 'bg-surface-elevated text-brand shadow'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className='rounded-lg border border-border-default bg-surface-elevated p-6 shadow-sm'>
        <div className='space-y-4'>
          <h2 className='text-xl font-bold text-text-primary'>
            {tabs.find((tab) => tab.id === activeTab)?.name}
          </h2>
          <p className='text-text-muted'>최종 수정일: 2024년 6월 1일</p>

          <div className='space-y-4 text-text-muted'>
            {isLoadingUrl || isLoading ? (
              <div className='flex h-96 items-center justify-center'>
                <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-brand'></div>
                <span className='ml-2'>약관을 불러오는 중...</span>
              </div>
            ) : error ? (
              <div className='rounded-md bg-danger/10 p-4 text-danger'>
                <p>약관을 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.</p>
              </div>
            ) : (
              termsUrl && (
                <div className='h-[600px] w-full overflow-hidden rounded border border-border-default'>
                  <iframe
                    src={termsUrl}
                    className='h-full w-full'
                    frameBorder='0'
                    title={`${tabs.find((tab) => tab.id === activeTab)?.name} 약관`}
                  ></iframe>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
