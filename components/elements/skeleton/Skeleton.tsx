'use client'

import React from 'react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

// 기본 스켈레톤 컴포넌트
export const BaseSkeleton = ({ count = 1, height, width, className, ...rest }: {
  count?: number
  height?: number | string
  width?: number | string
  className?: string
  [key: string]: any
}) => {
  return (
    <Skeleton
      count={count}
      height={height}
      width={width}
      className={className}
      {...rest}
    />
  )
}

// 텍스트 스켈레톤 컴포넌트
export const TextSkeleton = ({ lines = 3, ...rest }: {
  lines?: number
  [key: string]: any
}) => {
  return (
    <div className="space-y-2">
      {Array(lines).fill(0).map((_, i) => (
        <BaseSkeleton 
          key={i} 
          height={16} 
          width={i === lines - 1 ? '80%' : '100%'} 
          {...rest} 
        />
      ))}
    </div>
  )
}

// 카드 스켈레톤 컴포넌트
export const CardSkeleton = ({ imageHeight = 200, ...rest }: {
  imageHeight?: number
  [key: string]: any
}) => {
  return (
    <div className="rounded-lg overflow-hidden shadow-sm border border-gray-200">
      <BaseSkeleton height={imageHeight} {...rest} />
      <div className="p-4 space-y-3">
        <BaseSkeleton height={24} width="70%" {...rest} />
        <BaseSkeleton count={2} height={16} {...rest} />
        <div className="flex justify-between pt-2">
          <BaseSkeleton height={30} width={80} {...rest} />
          <BaseSkeleton height={30} width={80} {...rest} />
        </div>
      </div>
    </div>
  )
}

// 리스트 아이템 스켈레톤 컴포넌트
export const ListItemSkeleton = ({ hasImage = true, ...rest }: {
  hasImage?: boolean
  [key: string]: any
}) => {
  return (
    <div className="flex items-center space-x-4 py-3">
      {hasImage && (
        <div className="flex-shrink-0">
          <BaseSkeleton circle width={50} height={50} {...rest} />
        </div>
      )}
      <div className="flex-1 space-y-2">
        <BaseSkeleton height={20} width="60%" {...rest} />
        <BaseSkeleton height={16} width="40%" {...rest} />
      </div>
      <div className="flex-shrink-0">
        <BaseSkeleton height={24} width={60} {...rest} />
      </div>
    </div>
  )
}

// 테이블 스켈레톤 컴포넌트
export const TableSkeleton = ({ rows = 5, columns = 4, ...rest }: {
  rows?: number
  columns?: number
  [key: string]: any
}) => {
  return (
    <div className="w-full">
      {/* 테이블 헤더 */}
      <div className="flex border-b border-gray-200 pb-2 mb-2">
        {Array(columns).fill(0).map((_, i) => (
          <div key={i} className="flex-1 px-2">
            <BaseSkeleton height={24} {...rest} />
          </div>
        ))}
      </div>
      
      {/* 테이블 바디 */}
      {Array(rows).fill(0).map((_, rowIndex) => (
        <div key={rowIndex} className="flex py-3 border-b border-gray-100">
          {Array(columns).fill(0).map((_, colIndex) => (
            <div key={colIndex} className="flex-1 px-2">
              <BaseSkeleton height={16} {...rest} />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

// 프로필 스켈레톤 컴포넌트
export const ProfileSkeleton = ({ ...rest }) => {
  return (
    <div className="flex flex-col items-center space-y-4">
      <BaseSkeleton circle width={100} height={100} {...rest} />
      <BaseSkeleton height={24} width={150} {...rest} />
      <BaseSkeleton height={16} width={100} {...rest} />
      <div className="w-full max-w-md space-y-2 mt-4">
        <BaseSkeleton height={16} {...rest} />
        <BaseSkeleton height={16} {...rest} />
        <BaseSkeleton height={16} width="80%" {...rest} />
      </div>
    </div>
  )
}

// 그리드 스켈레톤 컴포넌트
export const GridSkeleton = ({ items = 6, columns = 3, ...rest }: {
  items?: number
  columns?: number
  [key: string]: any
}) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${columns} gap-4`}>
      {Array(items).fill(0).map((_, i) => (
        <CardSkeleton key={i} {...rest} />
      ))}
    </div>
  )
}

// 스켈레톤 프로바이더 컴포넌트
export const SkeletonProvider = ({ children, ...rest }: {
  children: React.ReactNode
  [key: string]: any
}) => {
  return (
    <div {...rest}>
      {children}
    </div>
  )
}

export default {
  Base: BaseSkeleton,
  Text: TextSkeleton,
  Card: CardSkeleton,
  ListItem: ListItemSkeleton,
  Table: TableSkeleton,
  Profile: ProfileSkeleton,
  Grid: GridSkeleton,
  Provider: SkeletonProvider
} 