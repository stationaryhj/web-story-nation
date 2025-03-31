'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import he from 'he' // he 라이브러리 import

/**
 * 불완전한 JSON 문자열 수정 함수 (네이버 로그인용)
 * 네이버 state 형식: {"provider":"naver","snsauth":"7q36!53Yn?Xr
 * → 끝에 "} 추가 필요
 */
function fixNaverState(state: string): string {
  // 이미 올바른 JSON인지 확인
  if (state.startsWith('{') && state.endsWith('}')) {
    return state;
  }
  
  // 시작 중괄호가 있고 끝 중괄호가 없는 경우 (네이버 케이스)
  if (state.startsWith('{') && !state.endsWith('}')) {
    // 끝에 닫는 따옴표와 중괄호가 있는지 확인
    if (state.endsWith('"')) {
      return state + '}';
    } else {
      return state + '"}';
    }
  }
  
  return state;
}

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

        const code = searchParams?.get('code')
        let state = searchParams?.get('state')
        const errorParam = searchParams?.get('error')

        // 원본 URL 로그
        console.log('원본 URL:', window.location.search);
        console.log('디코딩된 URL:', he.decode(window.location.search));

        // state 파라미터 처리
        if (state) {
          // 디버깅용 로그
          console.log('원본 state:', state);
          
          // 1. 먼저 HTML 엔티티 디코딩 (필요한 경우)
          const decodedState = he.decode(state);
          if (decodedState !== state) {
            state = decodedState;
            console.log('디코딩된 state:', state);
          }
          
          // 2. 네이버 state 형식 수정 (잘린 JSON)
          // 네이버는 {"provider":"naver","snsauth":"7q36!53Yn?Xr 형식으로 오므로 "} 추가 필요
          if (state.includes('"provider":"naver"')) {
            state = fixNaverState(state);
            console.log('수정된 state:', state);
          }
        }
        
        // 로그인 타입 정보 가져오기
        let loginType = sessionStorage.getItem('social_login_type') || 'unknown';
        
        // state에서 provider 추출 시도
        if (state && state.startsWith('{')) {
          try {
            // JSON 형식이 올바른지 확인
            const stateObj = JSON.parse(state);
            if (stateObj.provider) {
              loginType = stateObj.provider.toLowerCase();
              console.log('state에서 추출한 로그인 타입:', loginType);
            }
          } catch (e) {
            console.error('state 파싱 실패:', e);
          }
        }

        if (errorParam) {
          // 오류 메시지에 로그인 타입 포함
          window.opener?.postMessage({ 
            error: errorParam,
            login_type: loginType 
          }, window.location.origin)
          window.close()
          return
        }

        if (!code || !state) {
          throw new Error('필수 파라미터가 누락되었습니다.')
        }

        // 인증 정보와 함께 로그인 타입도 전달
        console.log('인증 정보 부모창에 전달:', { code, state, login_type: loginType })
        window.opener?.postMessage({ 
          code, 
          state,
          login_type: loginType
        }, window.location.origin)
        
        // 팝업 창 닫기
        if (isMounted && window.opener) {
          window.close()
        }
      } catch (err) {
        console.error('OAuth 콜백 처리 오류:', err)
        
        // 오류 정보를 부모 창에 전달 (로그인 타입 포함)
        const loginType = sessionStorage.getItem('social_login_type') || 'unknown'
                          
        if (window.opener) {
          window.opener.postMessage({
            error: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.',
            login_type: loginType
          }, window.location.origin)
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
    }, 100) // 500ms에서 100ms로 줄임

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
