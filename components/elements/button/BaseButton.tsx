'use client'

import React from 'react'
import cn from 'classnames'

interface BaseButtonProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary' | 'tertiary'
  loading?: boolean
  disabled?: boolean
}

export const BaseButton = ({
  children,
  className,
  onClick,
  size = 'md',
  color = 'primary',
  loading = false,
  disabled = false,
}: BaseButtonProps) => {
  return (
    <button
      className={cn('flex items-center justify-center rounded-full font-medium transition-all duration-300', className)}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {children}
    </button>
  )
}
