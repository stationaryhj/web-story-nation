'use client'

import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ReactNode } from 'react'

export type BadgeSize = 'sm' | 'md' | 'lg'
export type BadgeVariant = 'filled' | 'outlined' | 'subtle'
export type BadgeColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'

interface BadgeProps {
  children: ReactNode
  size?: BadgeSize
  variant?: BadgeVariant
  color?: BadgeColor
  icon?: IconDefinition
  onClick?: () => void
  className?: string
  removable?: boolean
  onRemove?: () => void
}

export default function Badge({
  children,
  size = 'md',
  variant = 'filled',
  color = 'primary',
  icon,
  onClick,
  className = '',
  removable = false,
  onRemove,
}: BadgeProps) {
  // 크기별 스타일
  const sizeStyles = {
    sm: 'text-xs py-0.5 px-2',
    md: 'text-sm py-1 px-2.5',
    lg: 'text-base py-1.5 px-3',
  }

  // 색상 스타일 매핑
  const colorStyles = {
    filled: {
      primary: 'bg-primary-500 text-white dark:bg-dark-primary-500',
      secondary: 'bg-secondary-500 text-white dark:bg-dark-secondary-500',
      success: 'bg-green-500 text-white dark:bg-green-600',
      warning: 'bg-yellow-500 text-white dark:bg-yellow-600',
      error: 'bg-red-500 text-white dark:bg-red-600',
      info: 'bg-blue-500 text-white dark:bg-blue-600',
      neutral: 'bg-gray-500 text-white dark:bg-gray-600',
    },
    outlined: {
      primary: 'border border-primary-500 text-primary-700 dark:border-dark-primary-500 dark:text-dark-primary-300',
      secondary:
        'border border-secondary-500 text-secondary-700 dark:border-dark-secondary-500 dark:text-dark-secondary-300',
      success: 'border border-green-500 text-green-700 dark:border-green-600 dark:text-green-300',
      warning: 'border border-yellow-500 text-yellow-700 dark:border-yellow-600 dark:text-yellow-300',
      error: 'border border-red-500 text-red-700 dark:border-red-600 dark:text-red-300',
      info: 'border border-blue-500 text-blue-700 dark:border-blue-600 dark:text-blue-300',
      neutral: 'border border-gray-500 text-gray-700 dark:border-gray-600 dark:text-gray-300',
    },
    subtle: {
      primary: 'bg-primary-50 text-primary-700 dark:bg-dark-primary-900/30 dark:text-dark-primary-300',
      secondary: 'bg-secondary-50 text-secondary-700 dark:bg-dark-secondary-900/30 dark:text-dark-secondary-300',
      success: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      warning: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      error: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      info: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      neutral: 'bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
    },
  }

  const badgeClasses = `
    inline-flex items-center rounded-full font-medium
    ${sizeStyles[size]}
    ${colorStyles[variant][color]}
    ${onClick ? 'cursor-pointer hover:opacity-90 active:opacity-80' : ''}
    ${className}
  `

  // 클릭 이벤트 핸들러
  const handleClick = onClick ? onClick : undefined

  // 삭제 클릭 핸들러
  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation() // 배지 클릭 이벤트가 발생하지 않도록 방지
    if (onRemove) {
      onRemove()
    }
  }

  return (
    <span
      className={badgeClasses}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {icon && (
        <FontAwesomeIcon
          icon={icon}
          className={`${children ? 'mr-1.5' : ''} ${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-3.5 w-3.5' : 'h-4 w-4'}`}
        />
      )}
      {children}
      {removable && (
        <button
          type="button"
          onClick={handleRemoveClick}
          className={`ml-1.5 rounded-full text-current opacity-70 hover:opacity-100 ${
            size === 'sm' ? 'h-3.5 w-3.5' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'
          }`}
          aria-label="배지 제거"
        >
          ×
        </button>
      )}
    </span>
  )
}
