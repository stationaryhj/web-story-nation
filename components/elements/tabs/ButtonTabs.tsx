'use client'

import { ReactNode } from 'react'

export interface TabItem {
  id: string
  label: string | ReactNode
  icon?: ReactNode
  disabled?: boolean
}

interface ButtonTabsProps {
  tabs: TabItem[]
  activeTab: string
  onChange: (tabId: string) => void
  className?: string
  tabClassName?: string
  fullWidth?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'filled' | 'outlined' | 'subtle'
  color?: 'primary' | 'secondary'
}

export default function ButtonTabs({
  tabs,
  activeTab,
  onChange,
  className = '',
  tabClassName = '',
  fullWidth = false,
  size = 'md',
  variant = 'subtle',
  color = 'primary',
}: ButtonTabsProps) {
  // 사이즈 클래스
  const sizeClasses = {
    sm: 'text-xs py-1.5 px-3',
    md: 'text-sm py-2 px-4',
    lg: 'text-base py-2.5 px-5',
  }

  // 변형 및 색상 클래스
  const variantClasses = {
    filled: {
      primary: {
        active: 'bg-primary-500 text-white dark:bg-dark-primary-500',
        inactive:
          'bg-secondary-100 text-secondary-600 hover:bg-secondary-200 dark:bg-dark-secondary-800 dark:text-dark-secondary-300 dark:hover:bg-dark-secondary-700',
      },
      secondary: {
        active: 'bg-secondary-500 text-white dark:bg-dark-secondary-600',
        inactive:
          'bg-secondary-100 text-secondary-600 hover:bg-secondary-200 dark:bg-dark-secondary-800 dark:text-dark-secondary-300 dark:hover:bg-dark-secondary-700',
      },
    },
    outlined: {
      primary: {
        active:
          'bg-white border-2 border-primary-500 text-primary-700 dark:bg-dark-background dark:border-dark-primary-500 dark:text-dark-primary-300',
        inactive:
          'border-2 border-secondary-200 text-secondary-600 hover:border-secondary-300 dark:border-dark-secondary-700 dark:text-dark-secondary-300 dark:hover:border-dark-secondary-600',
      },
      secondary: {
        active:
          'bg-white border-2 border-secondary-500 text-secondary-700 dark:bg-dark-background dark:border-dark-secondary-500 dark:text-dark-secondary-300',
        inactive:
          'border-2 border-secondary-200 text-secondary-600 hover:border-secondary-300 dark:border-dark-secondary-700 dark:text-dark-secondary-300 dark:hover:border-dark-secondary-600',
      },
    },
    subtle: {
      primary: {
        active: 'bg-primary-50 text-primary-700 dark:bg-dark-primary-900/30 dark:text-dark-primary-300',
        inactive:
          'text-secondary-600 hover:bg-secondary-50 dark:text-dark-secondary-300 dark:hover:bg-dark-secondary-800/50',
      },
      secondary: {
        active: 'bg-secondary-50 text-secondary-700 dark:bg-dark-secondary-900/30 dark:text-dark-secondary-300',
        inactive:
          'text-secondary-600 hover:bg-secondary-50 dark:text-dark-secondary-300 dark:hover:bg-dark-secondary-800/50',
      },
    },
  }

  return (
    <div
      className={`flex space-x-2 rounded-lg ${fullWidth ? 'w-full' : 'inline-flex'} ${className}`}
      role="tablist"
      aria-orientation="horizontal"
    >
      {tabs.map(tab => {
        const isActive = tab.id === activeTab
        const tabStyle = isActive ? variantClasses[variant][color].active : variantClasses[variant][color].inactive

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            className={`
              rounded-full font-medium transition-colors ${sizeClasses[size]} ${tabStyle}
              ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${fullWidth ? 'flex-1' : ''}
              ${tabClassName}
            `}
            onClick={() => !tab.disabled && onChange(tab.id)}
            disabled={tab.disabled}
          >
            {tab.icon && <span className="mr-1.5">{tab.icon}</span>}
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
