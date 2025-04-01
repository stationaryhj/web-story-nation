'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function CallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // 원본 URL 로깅
    console.log('Original URL:', window.location.href)

    // 콜백 파라미터 가져오기
    const code = searchParams?.get('code')
    const error = searchParams?.get('error')
    const errorDescription = searchParams?.get('error_description')
    const state = searchParams?.get('state')
    
    // 로그인 타입 파악 (state 파라미터에서 추출)
    let loginType = 'UNKNOWN'
    
    try {
      if (state) {
        const stateObj = JSON.parse(state)
        loginType = stateObj.provider || 'UNKNOWN'
      }
    } catch (e) {
      console.error('state 파싱 오류:', e)
    }

    // 부모 창에 메시지 전달 
    if (window.opener) {
      // 에러가 있는 경우
      if (error) {
        window.opener.postMessage(
          {
            error,
            error_description: errorDescription,
            login_type: loginType
          },
          window.location.origin
        )
      }
      // 성공한 경우 - state 파라미터 추가
      else if (code) {
        window.opener.postMessage(
          {
            code,
            state, // state 파라미터 추가
            login_type: loginType
          },
          window.location.origin
        )
      }

      // 5초 후 창 닫기 (안전장치)
      setTimeout(() => {
        window.close()
      }, 5000)
    } else {
      // opener가 없는 경우 (직접 접근한 경우) 홈으로 이동
      router.push('/')
    }
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-xl font-bold">로그인 처리 중...</h1>
      <p className="mt-2 text-gray-600">잠시만 기다려주세요. 자동으로 창이 닫힙니다.</p>
      <button
        onClick={() => window.close()}
        className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        창 닫기
      </button>
    </div>
  )
}
