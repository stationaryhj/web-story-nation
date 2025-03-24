'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useAccountStore } from '@/store/useAccountStore'

export default function Page() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { handleCallback, error, loading } = useAccountStore()
  const processedRef = useRef(false)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    let isMounted = true

    const processCallback = async () => {
      // 이미 처리 중이거나 완료된 경우 중복 실행 방지
      if (processedRef.current || isProcessing) return
      
      try {
        setIsProcessing(true)
        processedRef.current = true

        const code = searchParams.get('code')
        const state = searchParams.get('state')

        if (!code || !state) {
          throw new Error('필수 파라미터가 누락되었습니다.')
        }

        // 직접 콜백 처리
        await handleCallback(code, state)
        
        // 컴포넌트가 마운트된 상태일 때만 리다이렉트
        if (isMounted) {
          router.replace('/')
        }
      } catch (err) {
        console.error('OAuth 콜백 처리 오류:', err)
        // 컴포넌트가 마운트된 상태일 때만 리다이렉트
        if (isMounted) {
          router.replace('/login')
        }
      } finally {
        if (isMounted) {
          setIsProcessing(false)
        }
      }
    }

    processCallback()

    // cleanup 함수
    return () => {
      isMounted = false
      processedRef.current = false
      setIsProcessing(false)
    }
  }, []) // 의존성 배열을 비워서 마운트 시에만 실행

  // 로딩 상태 표시
  return (
    <div className="min-h-screen flex items-center justify-center">
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="text-red-700 mb-4">{error}</div>
          <button
            onClick={() => router.replace('/login')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            로그인 페이지로 돌아가기
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-gray-600">로그인 처리 중...</div>
        </div>
      )}
    </div>
  )
}
