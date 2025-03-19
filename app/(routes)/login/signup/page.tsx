'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

import SignupForm from '../../../../components/form/SignupForm'

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignup = (formData: {
    nickname: string
    birthday: string
    termsAgreed: boolean
    marketingAgreed: boolean
  }) => {
    setLoading(true)
    setError(null)
    
    // 실제 구현 시 회원가입 API 호출
    console.log('회원가입 시도:', formData)

    // 임시: 홈페이지로 리다이렉트
    setTimeout(() => {
      router.push('/')
    }, 1000)
  }

  const handleClose = () => {
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="닫기"
        >
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </button>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">회원가입</h1>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <SignupForm onSubmit={handleSignup} disabled={loading} />

        {loading && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-md shadow-md">
              <div className="text-center">
                <p className="mb-4">처리 중입니다...</p>
                <div className="relative w-16 h-16 mx-auto">
                  <div className="w-full h-full rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 