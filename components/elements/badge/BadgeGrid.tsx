'use client'

import { ReactNode } from 'react'

interface BadgeGridProps {
  children: ReactNode
  className?: string
  gap?: 'xs' | 'sm' | 'md' | 'lg'
  columns?: number
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
}

export default function BadgeGrid({
  children,
  className = '',
  gap = 'sm',
  columns = 0, // 0은 auto-fill을 의미
  justifyContent = 'start',
}: BadgeGridProps) {
  // gap 크기 설정
  const gapSizes = {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4',
  }

  // justify-content 설정
  const justifyContentClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  }

  // 컬럼 설정 (0이면 flex-wrap, 그 외에는 grid)
  const columnsClasses = columns
    ? `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${Math.min(columns, 6)}`
    : `flex flex-wrap ${justifyContentClasses[justifyContent]}`

  return <div className={`${columnsClasses} ${gapSizes[gap]} ${className}`}>{children}</div>
}
