'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import SocialLoginButton from '@/components/form/SocialLoginButton'
import GuestLoginForm from '@/components/form/GuestLoginForm'
import PageTransition from '@/components/motion/PageTransition'

type SocialType = 'google' | 'naver' | 'kakao' | 'apple'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 소셜 로그인 핸들러
  const handleSocialLogin = (type: SocialType) => {
    setLoading(true)
    setError(null)
    
    // 실제 구현 시 각 소셜 로그인 API 호출
    console.log(`${type} 로그인 시도`)

    // 임시: 콜백 페이지로 리다이렉트
    router.push(`/login/callback?type=${type}`)
  }

  // 게스트 로그인 핸들러
  const handleGuestLogin = (nickname: string) => {
    setLoading(true)
    setError(null)
    
    // 실제 구현 시 게스트 로그인 API 호출
    console.log(`게스트 로그인 시도: ${nickname}`)

    // 임시: 목록 페이지로 리다이렉트
    router.push('/')
  }

  // 회원가입 페이지 이동
  const handleSignupClick = () => {
    router.push('/login/signup')
  }

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
                type="kakao" 
                onClick={handleSocialLogin} 
                disabled={loading} 
              />
              <SocialLoginButton 
                type="naver" 
                onClick={handleSocialLogin} 
                disabled={loading} 
              />
              <SocialLoginButton 
                type="google" 
                onClick={handleSocialLogin} 
                disabled={loading} 
              />
              <SocialLoginButton 
                type="apple" 
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