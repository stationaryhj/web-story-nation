'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import PageTransition from '@/components/motion/PageTransition'

// 실제 콜백 로직을 처리하는 컴포넌트
function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loginType = searchParams.get('type')
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    async function processOAuthCallback() {
      // 오류 처리
      if (error) {
        setError(`인증 오류: ${error}`)
        setLoading(false)
        return
      }

      // 필수 파라미터 확인
      if (!loginType || !code) {
        setError('인증 정보가 올바르지 않습니다.')
        setLoading(false)
        return
      }

      try {
        // 실제 구현 시 OAuth 토큰 교환 API 호출
        console.log(`${loginType} 인증코드: ${code}`)
        
        // 기존 회원인지 확인 필요
        const isNewUser = false // 임시 값, 실제로는 API 응답으로 판단

        if (isNewUser) {
          // 신규 회원: 회원가입 페이지로 이동
          router.push('/login/signup')
        } else {
          // 기존 회원: 홈페이지로 이동
          router.push('/')
        }
      } catch (err) {
        console.error('OAuth 처리 중 오류:', err)
        setError('로그인 처리 중 오류가 발생했습니다.')
        setLoading(false)
      }
    }

    processOAuthCallback()
  }, [router, searchParams])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="text-red-500 text-lg font-medium">{error}</div>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            로그인 페이지로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="text-xl font-medium">로그인 처리 중...</div>
        <div className="relative w-20 h-20 mx-auto">
          <div className="w-full h-full rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin"></div>
        </div>
      </div>
    </div>
  )
}

// 메인 컴포넌트
export default function CallbackPage() {
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