'use client'

import { useState } from 'react'
import BaseModal from './BaseModal'
import SignupModal from './SignupModal'
import { useAccountStore } from '@/store/useAccountStore'
import { OAuthProvider } from '@/types/login'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [showSignup, setShowSignup] = useState(false)

  const handleSignupClick = () => {
    setShowSignup(true)
  }

  const handleSignupClose = () => {
    setShowSignup(false)
  }

  const { socialLogin, loading } = useAccountStore()

  const handleSocialLogin = async (provider: OAuthProvider) => {
    try {
      await socialLogin(provider)
    } catch (error) {
      console.error('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', error)
      // toast.error('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  return (
    <>
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
              {loading ? '로그인 중...' : '카카오로 로그인'}
            </button>
            <button
              onClick={() => handleSocialLogin('NAVER')}
              disabled={loading}
              className="flex w-full items-center justify-center rounded-full bg-green-500 py-3 px-4 font-medium text-white shadow transition-colors hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '로그인 중...' : '네이버로 로그인'}
            </button>
            <button
              onClick={() => handleSocialLogin('APPLE')}
              disabled={loading}
              className="flex w-full items-center justify-center rounded-full bg-black py-3 px-4 font-medium text-white shadow transition-colors hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '로그인 중...' : '애플로 로그인'}
            </button>
            <button
              onClick={() => handleSocialLogin('GOOGLE')}
              disabled={loading}
              className="flex w-full items-center justify-center rounded-full bg-blue-500 py-3 px-4 font-medium text-white shadow transition-colors hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '로그인 중...' : '구글로 로그인'}
            </button>
          </div>

          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>또는</p>
          </div>

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

      {showSignup && <SignupModal isOpen={isOpen && showSignup} onClose={handleSignupClose} />}
    </>
  )
}
