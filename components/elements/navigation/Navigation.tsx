// components/ui/navigation/Navigation.tsx
'use client'

import { FadeIn } from '@/components/motion/PageTransition'
import { CATEGORIES } from '@/services/hooks/DataListManager'
import { motion } from 'framer-motion'
import { useState } from 'react'

interface NavigationProps {
  onCategoryChange: (categoryId: string) => void
  onSearch?: (query: string) => void // 선택적으로 변경
}

export default function Navigation({ onCategoryChange, onSearch }: NavigationProps) {
  const [activeCategory, setActiveCategory] = useState('all')

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId)
    onCategoryChange(categoryId)
  }

  return (
    <FadeIn delay={0.1}>
      <nav className="bg-surface-sunken shadow-sm dark:shadow-dark-primary-300/10 py-2 sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <motion.div
              className="flex space-x-6 overflow-x-auto hide-scrollbar"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              {CATEGORIES.map(category => (
                <motion.button
                  key={category.id}
                  className={`py-2 px-1 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeCategory === category.id
                      ? 'border-brand text-brand'
                      : 'border-transparent text-text-muted hover:text-brand'
                  }`}
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
