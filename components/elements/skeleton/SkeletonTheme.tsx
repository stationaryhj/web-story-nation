'use client'

import React from 'react'
import { SkeletonTheme } from 'react-loading-skeleton'

interface SkeletonThemeProviderProps {
  children: React.ReactNode
  baseColor?: string
  highlightColor?: string
  borderRadius?: string | number
  duration?: number
  direction?: 'ltr' | 'rtl'
  enableAnimation?: boolean
}

/**
 * 스켈레톤 UI의 테마를 설정하는 컴포넌트
 * 
 * @param baseColor - 스켈레톤의 기본 색상
 * @param highlightColor - 스켈레톤의 하이라이트 색상
 * @param borderRadius - 스켈레톤의 테두리 반경
 * @param duration - 애니메이션 지속 시간(초)
 * @param direction - 애니메이션 방향
 * @param enableAnimation - 애니메이션 활성화 여부
 */
export default function SkeletonThemeProvider({
  children,
  baseColor = '#E5E7EB', // Tailwind gray-200
  highlightColor = '#F3F4F6', // Tailwind gray-100
  borderRadius = '0.25rem',
  duration = 1.5,
  direction = 'ltr',
  enableAnimation = true
}: SkeletonThemeProviderProps) {
  return (
    <SkeletonTheme
      baseColor={baseColor}
      highlightColor={highlightColor}
      borderRadius={borderRadius}
      duration={duration}
      direction={direction}
      enableAnimation={enableAnimation}
    >
      {children}
    </SkeletonTheme>
  )
} 