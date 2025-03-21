'use client'

import { FadeIn } from '@/components/motion/PageTransition'
import { CATEGORIES } from '@/services/hooks/DataListManager'
import { motion } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import cn from 'classnames'

interface NavigationTabsProps {
  onCategoryChange: (categoryId: string) => void
  onSearch?: (query: string) => void
  className?: string
}

export default function NavigationTabs({ onCategoryChange, onSearch, className = '' }: NavigationTabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // URL 파라미터에서 현재 탭 가져오기
  const tabParam = searchParams.get('tab')

  // 초기 상태 설정
  const initialTabId = tabParam || 'all'
  const [activeCategory, setActiveCategory] = useState(initialTabId)

  // URL 파라미터 업데이트
  const updateUrlParams = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (tabId !== 'all') {
      params.set('tab', tabId)
    } else {
      params.delete('tab')
    }

    // 태그 파라미터는 유지
    const tagsParam = searchParams.get('tags')
    if (tagsParam) {
      params.set('tags', tagsParam)
    }

    const newUrl = `${pathname}?${params.toString()}`
    router.push(newUrl, { scroll: false })
  }

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId)
    onCategoryChange(categoryId)
    updateUrlParams(categoryId)
  }

  return (
    <FadeIn delay={0.1}>
      <nav
        className={`bg-white dark:bg-dark-background-light shadow-sm dark:shadow-dark-primary-300/10 py-2 sticky top-16 z-40 ${className}`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <motion.div
              className="relative flex space-x-6 overflow-x-auto hide-scrollbar"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              {CATEGORIES.map(category => (
                <motion.button
                  key={category.id}
                  className={cn(
                    'py-2 px-1 text-sm font-medium whitespace-nowrap transition-colors relative',
                    activeCategory === category.id
                      ? 'text-primary-600 dark:text-dark-primary-500 border-b-2 border-primary-500 dark:border-dark-primary-500'
                      : 'text-secondary-600 hover:text-primary-500 dark:text-dark-secondary-500 dark:hover:text-dark-primary-600'
                  )}
                  onClick={() => handleCategoryClick(category.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category.name}
                </motion.button>
              ))}
            </motion.div>
          </div>
        </div>
      </nav>
    </FadeIn>
  )
}
