'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function Page() {
  const searchParams = useSearchParams()
  const processedRef = useRef(false)
  const [error, setError] = useState<string | null>(null)
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
        const errorParam = searchParams.get('error')

        if (errorParam) {
          // 오류 메시지를 부모 창에 전달
          window.opener?.postMessage({ error: errorParam }, window.location.origin)
          window.close()
          return
        }

        if (!code || !state) {
          throw new Error('필수 파라미터가 누락되었습니다.')
        }

        // 인증 정보를 부모 창에 전달
        window.opener?.postMessage({ code, state }, window.location.origin)
        
        // 팝업 창 닫기
        if (isMounted && window.opener) {
          window.close()
        }
      } catch (err) {
        console.error('OAuth 콜백 처리 오류:', err)
        
        // 오류 정보를 부모 창에 전달
        if (window.opener) {
          window.opener.postMessage(
            { error: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.' }, 
            window.location.origin
          )
          window.close()
        } else {
          setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
        }
      } finally {
        if (isMounted) {
          setIsProcessing(false)
        }
      }
    }

    // 약간의 지연을 줘서 창이 완전히 로드된 후 처리하도록 함
    const timeoutId = setTimeout(() => {
      processCallback()
    }, 500)

    // cleanup 함수
    return () => {
      clearTimeout(timeoutId)
      isMounted = false
      processedRef.current = false
      setIsProcessing(false)
    }
  }, [searchParams]) // searchParams가 변경될 경우 재실행

  // window.opener가 없는 경우 (직접 URL 접근) 메시지 표시
  return (
    <div className="min-h-screen flex items-center justify-center">
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="text-red-700 mb-4">{error}</div>
          <div className="text-gray-600 mt-4">
            이 페이지는 소셜 로그인 콜백을 처리하기 위한 페이지입니다.
            <br />
            로그인 페이지로 이동해주세요.
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-gray-600">로그인 처리 중...</div>
          <div className="text-gray-400 text-sm mt-2">잠시만 기다려주세요. 곧 창이 닫힙니다.</div>
        </div>
      )}
    </div>
  )
}
