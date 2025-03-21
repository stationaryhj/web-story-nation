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
    primary: 'bg-violet-500 hover:bg-violet-600 text-white shadow-sm',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 shadow-sm',
    tertiary: 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 shadow-sm',
    gradient:
      'bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white shadow-sm',
  }

  // 비활성화 스타일
  const disabledStyles = 'opacity-60 cursor-not-allowed'

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
