'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import SocialLoginButton from '@/components/form/SocialLoginButton'
import GuestLoginForm from '@/components/form/GuestLoginForm'
import PageTransition from '@/components/motion/PageTransition'

import { contentApi } from '@/services/api'
import { useAccountStore } from '@/store/useStoreData';
import { OAUTH_PROVIDERS } from '@/types/login'
import { OAuthState, OAuthProvider } from '@/types/login'

const REDIRECT_URI = 'http://npt.iptime.org:3100/callback'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 소셜 로그인 핸들러
  const handleSocialLogin = (type: OAuthProvider) => {
    setLoading(true)
    setError(null)
    
    // 실제 구현 시 각 소셜 로그인 API 호출
    console.log(`${type} 로그인 시도`)

    // 임시: 콜백 페이지로 리다이렉트
    // router.push(`/login/callback?type=${type}`)
    MoveOAuthUri(type);
  }

  // 게스트 로그인 핸들러
  const handleGuestLogin = async (nickname: string) => {
    setLoading(true)
    setError(null)
    
    try {
      // 실제 구현 시 게스트 로그인 API 호출
      console.log(`게스트 로그인 시도: ${nickname}`)
      
      // 직접 API 호출하고 상태 업데이트
      const response = await contentApi.LoginGuest(nickname);
      console.log('login response', response);
      
      // 계정 정보 상태 업데이트 - AccountStore 타입에 맞게 수정
      useAccountStore.setState({
        isLogin: true,
        data: response.data,
      });
      
      router.back();
    } catch (err) {
      console.error('로그인 오류:', err);
      setError('로그인 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  // 회원가입 페이지 이동
  const handleSignupClick = () => {
    router.push('/login/signup')
  }

  const MoveOAuthUri = async (provider: OAuthProvider) => {
    const providerConfig = OAUTH_PROVIDERS[provider.toUpperCase() as OAuthProvider];
    if (!providerConfig) {
      throw new Error('지원하지 않는 로그인 방식입니다.');
    }

    const response = await contentApi.getUuid(providerConfig.id);
    const { clientId, snsauth } = response.data;

    // state 파라미터 생성
    const state: OAuthState = {
      provider: providerConfig.name as OAuthProvider,
      snsauth,
      clientId,
      snstype: providerConfig.id
    };

    console.log('state ::: ', state);0

    // URL 파라미터 생성
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      state: JSON.stringify(state)
    });

    // Apple 로그인의 경우 추가 파라미터
    if (provider === 'APPLE') {
      params.append('response_mode', 'form_post');
    }

    // OAuth URL 생성
    const authUrl = `${providerConfig.endpoints.OAUTH_URL}?${params.toString()}`;

    console.log('authUrl ::: ', authUrl);
    window.location.href = authUrl;
  };
  

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold">로그인</h1>
            <p className="mt-2 text-sm text-gray-600">
              스토리네이션에 오신 것을 환영합니다
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="mt-8 space-y-6">
            <div className="space-y-3">
              <SocialLoginButton 
                type="KAKAO"
                onClick={handleSocialLogin} 
                disabled={loading} 
              />
              <SocialLoginButton 
                type="NAVER" 
                onClick={handleSocialLogin} 
                disabled={loading} 
              />
              <SocialLoginButton 
                type="GOOGLE" 
                onClick={handleSocialLogin} 
                disabled={loading} 
              />
              <SocialLoginButton 
                type="APPLE" 
                onClick={handleSocialLogin} 
                disabled={loading} 
              />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">또는</span>
              </div>
            </div>

            <GuestLoginForm onSubmit={handleGuestLogin} disabled={loading} />

            <div className="text-center">
              <p className="text-sm text-gray-600">
                아직 계정이 없으신가요?{' '}
                <button
                  type="button"
                  onClick={handleSignupClick}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  회원가입
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
} 