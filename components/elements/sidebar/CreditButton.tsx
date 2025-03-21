'use client'

import { faPen } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/navigation'

interface CreditButtonProps {
  credits?: number
  className?: string
}

export default function CreditButton({ credits = 0, className = '' }: CreditButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()

  const handleClick = () => {
    router.push('/shop-recharge')
  }

  return (
    <button
      className={`relative rounded-full p-2 text-secondary-500 transition-colors hover:bg-secondary-100 hover:text-secondary-700 dark:text-dark-secondary-400 dark:hover:bg-dark-secondary-800 dark:hover:text-dark-secondary-300 ${className}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="펜 충전"
    >
      <FontAwesomeIcon icon={faPen} className={`h-5 w-5 ${isHovered ? 'animate-wiggle' : ''}`} />
    </button>
  )
}
