'use client'

import { faPen } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useModalStore } from '@/store/useStoreModal'

interface CreditButtonProps {
  credits?: number
  className?: string
}

export default function CreditButton({ credits = 0, className = '' }: CreditButtonProps) {
  const { openModal } = useModalStore()

  const handleClick = () => {
    openModal('credit')
  }

  return (
    <button
      className={`flex items-center rounded-full bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-100 dark:bg-dark-primary-900 dark:text-dark-primary-300 dark:hover:bg-dark-primary-800 ${className}`}
      onClick={handleClick}
      aria-label="펜 충전"
    >
      <FontAwesomeIcon icon={faPen} className="mr-1.5 h-3.5 w-3.5" />
      <span>{credits.toLocaleString()}</span>
      <span className="ml-1 text-xs text-primary-500 dark:text-dark-primary-400">펜</span>
      <span className="ml-2 text-xs text-primary-600 dark:text-dark-primary-400">+</span>
    </button>
  )
}
