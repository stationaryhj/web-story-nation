'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import PageTransition from '@/components/motion/PageTransition'
import { useAccountStore } from '@/store/useAccountStore'


// 에러 메시지 컴포넌트
function ErrorMessage({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
      <div className="text-red-700 mb-4">{message}</div>
      <div className="flex justify-center space-x-4">
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          다시 시도
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          돌아가기
        </button>
      </div>
    </div>
  )
}

// 실제 콜백 로직을 처리하는 컴포넌트
function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { handleCallback, error, setError } = useAccountStore()
  const [isRetrying, setIsRetrying] = useState(false)

  const processCallback = async () => {
    try {
      const code = searchParams.get('code')
      const state = searchParams.get('state')

      if (!code || !state) {
        throw new Error('필수 파라미터가 누락되었습니다.')
      }

      const isSuccess = await handleCallback(code, state)
      if(isSuccess) {
        router.back()
      }
    } catch (err) {
      console.error('OAuth 콜백 처리 오류:', err)
      setError('로그인 처리 중 오류가 발생했습니다.')
    }
  }

  useEffect(() => {
    processCallback()
  }, [searchParams, router, handleCallback, setError])

  const handleRetry = async () => {
    setIsRetrying(true)
    setError(null)
    await processCallback()
    setIsRetrying(false)
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          {error ? (
            <ErrorMessage 
              message={error} 
              onRetry={handleRetry}
            />
          ) : (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}

// 메인 컴포넌트
export default function OAuthCallbackPage() {
  return (
    <PageTransition>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
          <div className="w-full max-w-md text-center space-y-6">
            <div className="text-xl font-medium">로딩 중...</div>
            <div className="relative w-20 h-20 mx-auto">
              <div className="w-full h-full rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin"></div>
            </div>
          </div>
        </div>
      }>
        <CallbackContent />
      </Suspense>
    </PageTransition>
  )
} 