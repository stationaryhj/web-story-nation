'use client';

import he from 'he';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

// 네이버 로그인 콜백 URL 파싱 함수
function parseNaverCallback(callbackUrl: string) {
  console.log('파싱할 URL:', callbackUrl);

  // code 파라미터 추출
  const codeMatch = callbackUrl.match(/code=([^&]+)/);
  const code = codeMatch ? codeMatch[1] : null;
  console.log('추출된 code:', code);

  // state 파라미터 추출 - code 이후의 &state= 다음 텍스트
  const stateStart = callbackUrl.indexOf('&state=') + 7; // '&state='.length

  if (stateStart > 6) {
    // state 파라미터가 발견된 경우
    // 원본 state 문자열 (인코딩된 상태)
    const encodedStateStr = callbackUrl.substring(stateStart);
    console.log('인코딩된 state:', encodedStateStr);

    // HTML 엔티티 디코딩 (&quot; -> " 등)
    let decodedStateStr;
    try {
      decodedStateStr = he.decode(encodedStateStr);
      console.log('HTML 엔티티 디코딩된 state:', decodedStateStr);
    } catch (error) {
      console.error('HTML 엔티티 디코딩 실패:', error);
      decodedStateStr = encodedStateStr;
    }

    // URL 디코딩
    try {
      decodedStateStr = decodeURIComponent(decodedStateStr);
      console.log('URL 디코딩된 state:', decodedStateStr);
    } catch (error) {
      console.error('URL 디코딩 실패:', error);
    }
    // alert(decodedStateStr)
    // 1. JSON 파싱 시도
    try {
      // 잘린 JSON을 복구하려고 시도 (끝에 }가 없는 경우)
      if (decodedStateStr.includes('{') && !decodedStateStr.includes('}')) {
        decodedStateStr += '"}}';
      }

      const stateObj = JSON.parse(decodedStateStr);

      console.log('JSON 파싱 성공:', stateObj);
      return {
        code,
        state: stateObj,
      };
    } catch (e) {
      console.error('JSON 파싱 오류:', e);

      // 2. 정규식으로 개별 필드 추출 시도
      const providerMatch = decodedStateStr.match(/"provider"[\s]*:[\s]*?"([^"]+)"/);
      const snsauthMatch = decodedStateStr.match(/"snsauth"[\s]*:[\s]*?"([^"]+)"/);
      const clientIdMatch = decodedStateStr.match(/"clientId"[\s]*:[\s]*?"([^"]+)"/);
      const snstypeMatch = decodedStateStr.match(/"snstype"[\s]*:[\s]*(\d+)/);

      const extractedState = {
        provider: providerMatch ? providerMatch[1] : 'NAVER',
        snsauth: snsauthMatch ? snsauthMatch[1] : null,
        clientId: clientIdMatch ? clientIdMatch[1] : null,
        snstype: snstypeMatch ? parseInt(snstypeMatch[1]) : 0,
      };

      console.log('정규식으로 추출된 state:', extractedState);

      // 추출 실패 시 하드코딩된 값 사용 (마지막 수단)
      if (!extractedState.snsauth || !extractedState.clientId) {
        // 로컬 스토리지에서 정보 가져오기 시도
        try {
          const savedState = localStorage.getItem('social_login_state');
          if (savedState) {
            const savedStateObj = JSON.parse(savedState);
            extractedState.snsauth = extractedState.snsauth || savedStateObj.snsauth;
            extractedState.clientId = extractedState.clientId || savedStateObj.clientId;
            extractedState.snstype = extractedState.snstype || savedStateObj.snstype;
            console.log('로컬 스토리지에서 복구한 state:', extractedState);
          }
        } catch (error) {
          console.error('로컬 스토리지 복구 실패:', error);
        }
      }

      return {
        code,
        state: extractedState,
      };
    }
  }

  return { code, state: null };
}

function parseAppleCallback(callbackUrl: string) {
  console.log('파싱할 URL:', callbackUrl);

  // code 파라미터 추출
  const codeMatch = callbackUrl.match(/code=([^&]+)/);
  const code = codeMatch ? codeMatch[1] : null;
  console.log('추출된 code:', code);

  return {
    code,
    state: null,
  };
}

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const processCallback = async () => {
      // 디버깅: window.opener 상태 확인
      console.log('=== CALLBACK DEBUG ===');
      console.log('window.opener 존재:', !!window.opener);
      console.log('window.location.origin:', window.location.origin);

      // 원본 URL 로깅
      console.log('Original URL:', window.location.href);

      // 중복 처리 방지 (이미 메시지를 보냈는지 확인)
      if (sessionStorage.getItem('callback_message_sent') === 'true') {
        console.log('이미 메시지가 전송되었습니다. 중복 처리 방지');
        return;
      }

      // 메시지 전송 헬퍼 함수 (postMessage 또는 localStorage 사용)
      const sendMessageToParent = (data: Record<string, unknown>) => {
        console.log('부모 창에 메시지 전송 시도:', data);

        if (window.opener) {
          // window.opener가 있으면 postMessage 사용
          console.log('postMessage로 전송');
          window.opener.postMessage(data, window.location.origin);
        } else {
          // window.opener가 없으면 localStorage 사용 (storage 이벤트 트리거)
          console.log('localStorage로 전송 (opener가 없음)');
          localStorage.setItem(
            'oauth_callback_data',
            JSON.stringify({
              ...data,
              timestamp: Date.now(),
            })
          );
        }
      };

      // 콜백 파라미터 가져오기
      const code = searchParams?.get('code');
      const error = searchParams?.get('error');
      const errorDescription = searchParams?.get('error_description');
      const idToken = searchParams?.get('id_token'); // Apple 로그인에서 사용되는 id_token

      // alert(code)

      // 디버깅을 위한 검색 파라미터 전체 로깅
      const allParams: Record<string, string> = {};
      searchParams?.forEach((value, key) => {
        allParams[key] = value;
      });
      console.log('모든 파라미터:', allParams);

      // 로그인 타입 파악 (state 파라미터에서 추출)
      let loginType = 'UNKNOWN';
      let stateObj = null;
      let parsedState = null;

      try {
        // 로컬 스토리지에서 로그인 타입 확인
        const socialLoginType = localStorage.getItem('social_login_type');

        if (socialLoginType === 'naver') {
          // 네이버 로그인인 경우 커스텀 파서 사용
          const result = parseNaverCallback(window.location.href);

          parsedState = JSON.stringify(result.state);
          stateObj = result.state;

          // 네이버는 여기서 리턴 (parsedState)
          sessionStorage.setItem('callback_message_sent', 'true');
          sendMessageToParent({
            code,
            state: parsedState || searchParams?.get('state'),
            login_type: loginType,
          });

          setTimeout(() => {
            console.log('콜백 창 닫기 시도');
            sessionStorage.removeItem('callback_message_sent');
            window.close();
          }, 3000);

          return;
        } else if (socialLoginType === 'apple') {
          const result = parseAppleCallback(window.location.href);

          sessionStorage.setItem('callback_message_sent', 'true');
          sendMessageToParent({
            code: result.code,
            login_type: loginType,
          });

          setTimeout(() => {
            console.log('콜백 창 닫기 시도');
            sessionStorage.removeItem('callback_message_sent');
            window.close();
          }, 3000);

          return;
        } else {
          // 기존 파싱 로직 (다른 소셜 로그인)
          const state = searchParams?.get('state');

          if (state) {
            console.log('State 파라미터 원본:', state);

            let decodedState = state;

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
        }
      } catch (e) {
        console.error('state 파싱 오류:', e);
      }

      // 부모 창에 메시지 전달
      console.log('부모 창에 메시지 전달 시작');

      // 중복 메시지 방지를 위해 플래그 설정
      sessionStorage.setItem('callback_message_sent', 'true');

      // 에러가 있는 경우
      if (error) {
        console.log('에러 메시지 전송:', error);
        sendMessageToParent({
          error,
          error_description: errorDescription,
          login_type: loginType,
        });
      }
      // 성공한 경우 - 파싱된 state 파라미터 추가
      else if (code) {
        console.log('성공 메시지 전송:', {
          code: code?.substring(0, 5) + '...',
          login_type: loginType,
        });

        sendMessageToParent({
          code,
          state: parsedState || searchParams?.get('state'),
          login_type: loginType,
        });
      }

      // 3초 후 창 닫기 (안전장치)
      setTimeout(() => {
        console.log('콜백 창 닫기 시도');
        sessionStorage.removeItem('callback_message_sent');
        window.close();
      }, 3000);
    };

    processCallback();
  }, [router, searchParams]);

  return (
    <div className='flex min-h-screen flex-col items-center justify-center'>
      <h1 className='text-xl font-bold'>로그인 처리 중...</h1>
      <p className='mt-2 text-gray-600'>잠시만 기다려주세요. 자동으로 창이 닫힙니다.</p>
      <button
        onClick={() => {
          // 세션 스토리지 정리
          sessionStorage.removeItem('callback_message_sent');
          window.close();
        }}
        className='mt-4 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
      >
        창 닫기
      </button>
    </div>
  );
}
