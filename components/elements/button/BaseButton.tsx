'use client'

import React from 'react'
import cn from 'classnames'

interface BaseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary' | 'tertiary' | 'gradient'
  loading?: boolean
}

export const BaseButton = ({
  children,
  className,
  onClick,
  size = 'md',
  color = 'primary',
  loading = false,
  disabled = false,
  type = 'button',
  ...props
}: BaseButtonProps) => {
  // 기본 스타일 클래스
  const baseStyles = 'flex items-center justify-center rounded-full font-medium transition-all duration-300'

  // 크기에 따른 스타일
  const sizeStyles = {
    sm: 'py-1.5 px-3 text-sm',
    md: 'py-2 px-4 text-base',
    lg: 'py-2.5 px-5 text-lg',
  }

  // 색상에 따른 스타일
  const colorStyles = {
    primary:
      'bg-white text-gray-700 border border-gray-300 hover:bg-violet-700 hover:text-white hover:border-violet-700 focus:bg-violet-600 focus:text-white focus:border-violet-600 shadow-sm focus:ring-2 focus:ring-violet-400 focus:ring-offset-2',
    secondary:
      'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:bg-gray-200 shadow-sm focus:ring-2 focus:ring-gray-400 focus:ring-offset-2',
    tertiary:
      'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 focus:bg-gray-50 shadow-sm focus:ring-2 focus:ring-gray-300 focus:ring-offset-2',
    gradient:
      'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:bg-gradient-to-r focus:from-violet-500 focus:to-fuchsia-500 focus:text-white focus:border-violet-500 shadow-sm focus:ring-2 focus:ring-fuchsia-400 focus:ring-offset-2',
  }

  // 비활성화 스타일
  const disabledStyles = 'opacity-60 cursor-not-allowed focus:ring-0 bg-gray-100 text-gray-400 border border-gray-200'

  return (
    <button
      type={type}
      className={cn(
        baseStyles,
        sizeStyles[size],
        !disabled && colorStyles[color],
        disabled && disabledStyles,
        className
      )}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
      ) : (
        children
      )}
    </button>
  )
}
