'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTermsStore } from '@/store/useGlobalStore'
import { GetApiUrl } from '@/services/api/storyNationApi'
const tabs = [
  { id: 'terms', name: '서비스 이용약관', index: 0 },
  { id: 'privacy', name: '개인정보 처리방침', index: 2 },
  { id: 'paid', name: '유료 서비스 이용약관', index: 1 },
  { id: 'policy', name: '운영 정책', index: 3 },
]


export default function TermsPage() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'paid' | 'policy'>('terms')
  const { termsUrls, getTermsUrl, isLoading, error } = useTermsStore()
  const [isLoadingUrl, setIsLoadingUrl] = useState(false)

  // URL 쿼리에서 탭 파라미터 읽기
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && ['terms', 'privacy', 'paid', 'policy'].includes(tabParam)) {
      setActiveTab(tabParam as 'terms' | 'privacy' | 'paid' | 'policy')
    }
  }, [searchParams])

  // 현재 탭에 해당하는 약관 URL 가져오기
  useEffect(() => {
    const fetchTermsUrl = async () => {
      const tabIndex = tabs.find(tab => tab.id === activeTab)?.index
      if (tabIndex !== undefined) {
        try {
          setIsLoadingUrl(true)
          await getTermsUrl(tabIndex)
        } catch (error) {
          console.error(`약관 URL을 가져오는 중 에러 발생: ${error}`)
        } finally {
          setIsLoadingUrl(false)
        }
      }
    }

    fetchTermsUrl()
  }, [activeTab, getTermsUrl])

  // 탭 변경 핸들러
  const handleTabChange = (tab: 'terms' | 'privacy' | 'paid' | 'policy') => {
    setActiveTab(tab)
    // URL 업데이트 (새로고침 없이)
    window.history.pushState({}, '', `/terms?tab=${tab}`)
  }

  // 현재 선택된 약관의 URL 가져오기
  const getCurrentTermsUrl = () => {
    const tabIndex = tabs.find(tab => tab.id === activeTab)?.index
    if (tabIndex !== undefined && termsUrls[tabIndex]) {
      return `${GetApiUrl()}/${termsUrls[tabIndex]}`
    }
    return null
  }

  const termsUrl = getCurrentTermsUrl()

  return (
    <div className="mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-center text-3xl font-bold text-gray-900 dark:text-white">스토리네이션 약관</h1>

      <div className="mb-6 flex space-x-1 rounded-lg bg-gray-100 p-1 dark:bg-dark-background">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id as 'terms' | 'privacy' | 'paid' | 'policy')}
            className={`flex-1 rounded-md py-2.5 px-3 text-sm font-medium ${
              activeTab === tab.id
                ? 'bg-white text-primary-600 shadow dark:bg-dark-background-light dark:text-primary-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-dark-background-light">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {tabs.find(tab => tab.id === activeTab)?.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">최종 수정일: 2024년 6월 1일</p>

          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            {isLoadingUrl || isLoading ? (
              <div className="flex h-96 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-500"></div>
                <span className="ml-2">약관을 불러오는 중...</span>
              </div>
            ) : error ? (
              <div className="rounded-md bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                <p>약관을 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.</p>
              </div>
            ) : termsUrl && (
              <div className="h-[600px] w-full overflow-hidden rounded border border-gray-200 dark:border-gray-700">
                <iframe
                  src={termsUrl}
                  className="h-full w-full"
                  frameBorder="0"
                  title={`${tabs.find(tab => tab.id === activeTab)?.name} 약관`}
                ></iframe>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
