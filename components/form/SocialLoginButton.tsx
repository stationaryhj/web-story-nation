'use client'

import Image from 'next/image'
import { MouseEvent } from 'react'
import { OAuthProvider } from '@/types/login'


const buttonStyles = {
  GOOGLE: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
  NAVER: 'bg-[#03C75A] text-white hover:bg-[#02b350]',
  KAKAO: 'bg-[#FEE500] text-[#191600] hover:bg-[#f0d900]',
  APPLE: 'bg-black text-white hover:bg-gray-800',
}

interface SocialLoginButtonProps {
  type: OAuthProvider
  onClick: (type: OAuthProvider) => void
  disabled?: boolean
}

export default function SocialLoginButton({ type, onClick, disabled = false }: SocialLoginButtonProps) {
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!disabled) {
      onClick(type)
    }
  }

  // 소셜 로그인 타입별 텍스트
  const buttonText = {
    GOOGLE: 'Google로 로그인',
    NAVER: '네이버로 로그인',
    KAKAO: '카카오로 로그인',
    APPLE: 'Apple로 로그인',
  }

  return (
    <button
      className={`flex items-center justify-center gap-3 w-full py-3 px-4 rounded-md font-medium transition-colors ${buttonStyles[type]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      onClick={handleClick}
      disabled={disabled}
      aria-label={`${buttonText[type]}`}
    >
      <div className="relative w-6 h-6">
        <Image
          src={`/images/symbol/${type}.svg`}
          alt={`${type} 로고`}
          width={24}
          height={24}
        />
      </div>
      <span>{buttonText[type]}</span>
    </button>
  )
} 