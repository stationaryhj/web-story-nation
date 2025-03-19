'use client'

import Image from 'next/image'
import { MouseEvent } from 'react'

type SocialType = 'google' | 'naver' | 'kakao' | 'apple'

const buttonStyles = {
  google: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
  naver: 'bg-[#03C75A] text-white hover:bg-[#02b350]',
  kakao: 'bg-[#FEE500] text-[#191600] hover:bg-[#f0d900]',
  apple: 'bg-black text-white hover:bg-gray-800',
}

interface SocialLoginButtonProps {
  type: SocialType
  onClick: (type: SocialType) => void
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
    google: 'Google로 로그인',
    naver: '네이버로 로그인',
    kakao: '카카오로 로그인',
    apple: 'Apple로 로그인',
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