'use client'

import { ReactNode } from 'react'

export interface ListItem {
  id: string | number
  content: ReactNode
  secondaryContent?: ReactNode
  leading?: ReactNode
  trailing?: ReactNode
  onClick?: () => void
  disabled?: boolean
  divider?: boolean
}

interface ListProps {
  items: ListItem[]
  className?: string
  itemClassName?: string
  size?: 'sm' | 'md' | 'lg'
  bordered?: boolean
  rounded?: boolean
  hoverable?: boolean
  divided?: boolean
}

export default function List({
  items,
  className = '',
  itemClassName = '',
  size = 'md',
  bordered = false,
  rounded = true,
  hoverable = true,
  divided = true,
}: ListProps) {
  // 사이즈별 스타일
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  // 아이템 패딩
  const paddingClasses = {
    sm: 'py-2 px-3',
    md: 'py-3 px-4',
    lg: 'py-4 px-5',
  }

  const listClasses = `
    overflow-hidden
    ${bordered ? 'border border-border-default' : ''}
    ${rounded ? 'rounded-lg' : ''}
    ${sizeClasses[size]}
    ${className}
  `

  return (
    <ul className={listClasses}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        // 아이템별 클래스
        const itemClasses = `
          flex items-center justify-between
          ${paddingClasses[size]}
          ${hoverable && !item.disabled ? 'hover:bg-surface-elevated-hover cursor-pointer' : ''}
          ${item.disabled ? 'opacity-60 cursor-not-allowed' : ''}
          ${divided && !isLast && item.divider !== false ? 'border-b border-border-default' : ''}
          ${itemClassName}
        `

        return (
          <li key={item.id} className={itemClasses} onClick={!item.disabled && item.onClick ? item.onClick : undefined}>
            <div className="flex items-center flex-1">
              {item.leading && <div className="mr-3 flex-shrink-0">{item.leading}</div>}
              <div className="flex-1 min-w-0">
                <div className="text-text-primary truncate">{item.content}</div>
                {item.secondaryContent && (
                  <div className="text-text-muted text-sm mt-0.5">
                    {item.secondaryContent}
                  </div>
                )}
              </div>
            </div>
            {item.trailing && <div className="ml-3 flex-shrink-0">{item.trailing}</div>}
          </li>
        )
      })}
    </ul>
  )
}
