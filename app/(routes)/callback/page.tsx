'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import he from 'he'

export default function CallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const processCallback = async () => {
      // 원본 URL 로깅
      console.log('Original URL:', window.location.href)
      
      // 중복 처리 방지 (이미 메시지를 보냈는지 확인)
      if (sessionStorage.getItem('callback_message_sent') === 'true') {
        console.log('이미 메시지가 전송되었습니다. 중복 처리 방지');
        return;
      }

      // 콜백 파라미터 가져오기
      const code = searchParams?.get('code')
      const error = searchParams?.get('error')
      const errorDescription = searchParams?.get('error_description')
      const state = searchParams?.get('state')

      // 디버깅을 위한 검색 파라미터 전체 로깅
      const allParams: Record<string, string> = {};
      searchParams?.forEach((value, key) => {
        allParams[key] = value;
      });
      console.log('모든 파라미터:', allParams);

      // 로그인 타입 파악 (state 파라미터에서 추출)
      let loginType = 'UNKNOWN';
      let stateObj = null;
      
      try {
        if (state) {
          console.log('State 파라미터 원본:', state);
          
          // 네이버의 경우 HTML entity로 인코딩된 state 값 처리
          let decodedState = state;
          
          // 로컬 스토리지에서 로그인 타입 확인
          const socialLoginType = localStorage.getItem('social_login_type');
          
          // 네이버 로그인인 경우 he 라이브러리로 디코딩 추가 처리
          if (socialLoginType === 'naver') {
            try {
              // HTML entity 디코딩 (예: &quot; -> ")
              decodedState = he.decode(state);
              console.log('he로 디코딩된 state:', decodedState);
            } catch (decodeError) {
              console.error('he 디코딩 오류:', decodeError);
            }
          }
          
          // JSON 파싱 시도
          try {
            stateObj = JSON.parse(decodedState);
          } catch (parseError) {
            // URL 디코딩 후 다시 시도
            try {
              stateObj = JSON.parse(decodeURIComponent(decodedState));
            } catch (e) {
              console.error('State 파싱 모든 시도 실패');
            }
          }
          
          if (stateObj) {
            console.log('파싱된 State:', stateObj);
            loginType = stateObj.provider || 'UNKNOWN';
          }
        }
      } catch (e) {
        console.error('state 파싱 오류:', e)
      }

      // 부모 창에 메시지 전달 
      if (window.opener) {
        console.log('부모 창에 메시지 전달 시작');
        
        // 중복 메시지 방지를 위해 플래그 설정
        sessionStorage.setItem('callback_message_sent', 'true');
        
        // 에러가 있는 경우
        if (error) {
          console.log('에러 메시지 전송:', error);
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
          console.log('성공 메시지 전송:', { code: code?.substring(0, 5) + '...', login_type: loginType });
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
          console.log('콜백 창 닫기 시도');
          // 세션 스토리지 정리
          sessionStorage.removeItem('callback_message_sent');
          window.close()
        }, 5000)
      } else {
        // opener가 없는 경우 (직접 접근한 경우) 홈으로 이동
        console.log('팝업이 아닌 직접 접근, 홈으로 리다이렉트');
        router.push('/')
      }
    };
    
    processCallback();
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-xl font-bold">로그인 처리 중...</h1>
      <p className="mt-2 text-gray-600">잠시만 기다려주세요. 자동으로 창이 닫힙니다.</p>
      <button
        onClick={() => {
          // 세션 스토리지 정리
          sessionStorage.removeItem('callback_message_sent');
          window.close();
        }}
        className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        창 닫기
      </button>
    </div>
  )
}
