'use client'

import { faBell } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import { useModalStore } from '@/store/useStoreModal'

interface NotificationButtonProps {
  count?: number
  className?: string
}

export default function NotificationButton({ count = 0, className = '' }: NotificationButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { openModal } = useModalStore()

  const handleClick = () => {
    openModal('notification') // 알림 사이드바 모달 열기
  }

  return (
    <button
      className={`relative rounded-full p-2 text-secondary-500 transition-colors hover:bg-secondary-100 hover:text-secondary-700 dark:text-dark-secondary-400 dark:hover:bg-dark-secondary-800 dark:hover:text-dark-secondary-300 ${className}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="알림"
    >
      <FontAwesomeIcon icon={faBell} className={`h-5 w-5 ${isHovered ? 'animate-wiggle' : ''}`} />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  )
}

// 애니메이션 정의를 tailwind.config.js에 추가:
// extend: {
//   keyframes: {
//     wiggle: {
//       '0%, 100%': { transform: 'rotate(-3deg)' },
//       '50%': { transform: 'rotate(3deg)' },
//     },
//   },
//   animation: {
//     wiggle: 'wiggle 0.3s ease-in-out',
//   },
// },
