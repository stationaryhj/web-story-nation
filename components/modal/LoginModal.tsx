'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import BaseModal from './BaseModal'
import SignupModal from './SignupModal'
import { useAccountStore } from '@/store/useAccountStore'
import { OAuthProvider } from '@/types/login'
import GuestLoginForm from '@/components/form/GuestLoginForm'
import { toast } from 'react-toastify'
import { authService } from '@/services/auth'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

// 네이버 SDK 로드
const loadNaverSDK = () => {
  return new Promise<void>((resolve) => {
    if (window.naver && window.naver.LoginWithNaverId) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://static.nid.naver.com/js/naveridlogin_js_sdk_2.0.2.js';
    script.async = true;
    script.onload = () => {
      console.log('네이버 SDK 로드 완료');
      resolve();
    };
    script.onerror = () => {
      console.error('네이버 SDK 로드 실패');
      resolve(); // 실패해도 계속 진행
    };
    document.head.appendChild(script);
  });
};

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
  const [showSignup, setShowSignup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sdkLoaded, setSdkLoaded] = useState(false)

  // SDK 초기 로드
  useEffect(() => {
    const initSDK = async () => {
      try {
        await loadNaverSDK();
        setSdkLoaded(true);
      } catch (err) {
        console.error('SDK 로드 오류:', err);
      }
    };
    
    initSDK();
  }, []);

  // 모달이 열리면 authService 초기화
  useEffect(() => {
    if (isOpen && sdkLoaded) {
      authService.init().catch(err => {
        console.error('인증 서비스 초기화 오류:', err);
      });
    }
  }, [isOpen, sdkLoaded]);

  // 로그인 타임아웃 핸들러
  const handleLoginTimeout = useCallback(() => {
    setLoading(false);
    toast.error('로그인 시간이 초과되었습니다. 다시 시도해주세요.');
    
    // 타임아웃 관련 데이터 정리
    const timeoutId = localStorage.getItem('naver_login_timeout');
    if (timeoutId) {
      clearTimeout(parseInt(timeoutId));
      localStorage.removeItem('naver_login_timeout');
    }
    localStorage.removeItem('social_login_state');
    localStorage.removeItem('naver_login_state');
    localStorage.removeItem('social_login_type');
  }, []);

  // 소셜 로그인 콜백 메시지 처리 함수
  useEffect(() => {
    if (!isOpen) return;

    const handleCallbackMessage = async (event: MessageEvent) => {
      // 출처 확인 (보안)
      if (event.origin !== window.location.origin) {
        console.warn('알 수 없는 출처의 메시지 무시됨:', event.origin);
        return;
      }

      // 메시지 데이터 확인
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      // 소셜 로그인 데이터 확인
      if (data.type === 'social_login_callback' && (data.code || data.error)) {
        // 에러 처리
        if (data.error) {
          setLoading(false);
          toast.error(`로그인 중 오류가 발생했습니다: ${data.error}`);
          return;
        }

        // 콜백 처리
        try {
          setLoading(true);
          
          // 타임아웃 클리어
          const timeoutId = localStorage.getItem('naver_login_timeout');
          if (timeoutId) {
            clearTimeout(parseInt(timeoutId));
            localStorage.removeItem('naver_login_timeout');
          }
          
          // authService.handleCallback 호출
          const result = await authService.handleCallback({
            code: data.code,
            state: data.state
          });
          
          if (result.success) {
            // 로그인 성공 시 상태 업데이트 (useAccountStore)
            if (result.data) {
              useAccountStore.getState().setLoginState(true, result.data);
              await useAccountStore.getState().updateUserInfoFromUserInfo2();
              await useAccountStore.getState().fetchWriterInfo();
              
              // 성공 시에만 모달 닫기
              onClose();
            }
          } else if (result.signupRequired || result.needSignup) {
            // 회원가입 필요 - 모달 닫지 않고 회원가입 모달로 전환
            setShowSignup(true);
          } else {
            // 기타 오류
            toast.error(result.error || '로그인에 실패했습니다.');
          }
        } catch (error) {
          console.error('콜백 처리 중 오류 발생:', error);
          toast.error('로그인 처리 중 오류가 발생했습니다.');
        } finally {
          setLoading(false);
        }
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener('message', handleCallbackMessage);
    
    // cleanup 함수
    return () => {
      window.removeEventListener('message', handleCallbackMessage);
    };
  }, [isOpen, onClose]);

  const handleSignupClick = () => {
    setShowSignup(true)
  }

  const handleSignupClose = () => {
    setShowSignup(false)
  }

  const { guestLogin } = useAccountStore()

  // 통합된 소셜 로그인 처리 함수
  const handleSocialLogin = async (provider: OAuthProvider) => {
    try {
      setLoading(true);
      
      // 네이버 로그인의 경우 SDK 로드 확인
      if (provider === 'NAVER' && !window.naver) {
        await loadNaverSDK();
      }
      
      const result = await authService.socialLogin(
        provider,
        {
          onLoginTimeout: handleLoginTimeout
        }
      );
      
      if (!result.success && result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('소셜 로그인 오류:', error);
      toast.error('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async (nickname: string) => {
    try {
      setLoading(true)
      let isSuccess = await guestLogin(nickname)
      if (isSuccess) {
        onClose()
        router.push('/')
      }
    } catch (err) {
      console.error('게스트 로그인 오류:', err)
    } finally {
      setLoading(false)
    }
  }

  // 회원가입 성공 시 모달 닫기
  const handleSignupSuccess = () => {
    // 임시 저장 데이터 정리
    localStorage.removeItem('social_login_state');
    localStorage.removeItem('social_login_type');
    localStorage.removeItem('naver_login_state');
    
    setShowSignup(false)
    onClose()
  }

  return (
    <>
      {/* 로그인 모달 - 회원가입 모달이 표시 중일 때 숨김 */}
      <BaseModal
        isOpen={isOpen && !showSignup}
        onClose={onClose}
        title="로그인"
        size="md"
        animation="fade"
        backdropColor="bg-black/70 backdrop-blur-sm"
      >
        <div className="flex flex-col space-y-6 py-4">
          <div className="space-y-4">
            <button
              onClick={() => handleSocialLogin('KAKAO')}
              disabled={loading}
              className="flex w-full items-center justify-center rounded-full bg-yellow-400 py-3 px-4 font-medium text-yellow-900 shadow transition-colors hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>카카오로 시작하기</span>
            </button>
            <button
              onClick={() => handleSocialLogin('NAVER')}
              disabled={loading}
              className="flex w-full items-center justify-center rounded-full bg-green-500 py-3 px-4 font-medium text-white shadow transition-colors hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>네이버로 시작하기</span>
            </button>
            <button
              onClick={() => handleSocialLogin('APPLE')}
              disabled={loading}
              className="flex w-full items-center justify-center rounded-full bg-black py-3 px-4 font-medium text-white shadow transition-colors hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>애플로 시작하기</span>
            </button>
            <button
              onClick={() => handleSocialLogin('GOOGLE')}
              disabled={loading}
              className="flex w-full items-center justify-center rounded-full bg-blue-500 py-3 px-4 font-medium text-white shadow transition-colors hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>구글로 시작하기</span>
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-dark-background text-gray-500">또는</span>
            </div>
          </div>

          <GuestLoginForm onSubmit={handleGuestLogin} disabled={loading} />

          <div className="space-y-4">
            <button
              className="flex w-full items-center justify-center rounded-full border border-gray-300 bg-white py-3 px-4 font-medium text-gray-700 shadow transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-dark-background dark:text-gray-300 dark:hover:bg-dark-background-light"
              onClick={handleSignupClick}
            >
              신규 가입하기
            </button>
          </div>

          <div className="text-center text-xs text-gray-500 dark:text-gray-400">
            <p>계속 진행하면 이용약관 및 개인정보 처리방침에 동의하는 것으로 간주됩니다.</p>
          </div>
        </div>
      </BaseModal>

      {/* 회원가입 모달 - isOpen 조건만 체크하여 로그인 모달과 독립적으로 표시 */}
      {showSignup && (
        <SignupModal isOpen={isOpen} onClose={handleSignupClose} onSuccess={handleSignupSuccess} />
      )}
    </>
  )
}
