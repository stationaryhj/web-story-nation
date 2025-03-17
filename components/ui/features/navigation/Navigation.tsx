// components/ui/navigation/Navigation.tsx
'use client'

import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons'
import { motion } from 'framer-motion'
import { FadeIn } from '@/components/ui/motion/PageTransition'

const categories = [
  { id: 'recommended', name: '추천' },
  { id: 'male', name: '남성' },
  { id: 'female', name: '여성' },
  { id: 'unspecified', name: '성별모름' },
]

interface NavigationProps {
  onCategoryChange: (categoryId: string) => void
  onSearch: (query: string) => void
}

export default function Navigation({ onCategoryChange, onSearch }: NavigationProps) {
  const [activeCategory, setActiveCategory] = useState('recommended')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  
  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId)
    onCategoryChange(categoryId)
  }
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim())
    }
  }
  
  const handleClearSearch = () => {
    setSearchQuery('')
    onSearch('')
    setIsSearchOpen(false)
  }
  
  return (
    <FadeIn delay={0.1}>
      <nav className="bg-white dark:bg-dark-background-light shadow-sm dark:shadow-dark-primary-300/10 py-2 sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex space-x-6 overflow-x-auto hide-scrollbar"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              {categories.map((category) => (
                <motion.button
                  key={category.id}
                  className={`py-2 px-1 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeCategory === category.id
                      ? 'border-primary-500 text-primary-600 dark:border-dark-primary-500 dark:text-dark-primary-600'
                      : 'border-transparent text-secondary-600 hover:text-primary-500 dark:text-dark-secondary-500 dark:hover:text-dark-primary-600'
                  }`}
                  onClick={() => handleCategoryClick(category.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category.name}
                </motion.button>
              ))}
            </motion.div>
            
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              {isSearchOpen ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center">
                  <motion.input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="캐릭터 검색..."
                    className="py-1 px-3 pr-8 text-sm border border-secondary-200 dark:border-dark-secondary-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-primary-500 dark:bg-dark-background-DEFAULT dark:text-dark-secondary-700"
                    autoFocus
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: '200px', opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2 text-secondary-400 hover:text-secondary-600 dark:text-dark-secondary-500 dark:hover:text-dark-secondary-400"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </motion.button>
                </form>
              ) : (
                <motion.button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 text-secondary-500 hover:text-primary-500 dark:text-dark-secondary-500 dark:hover:text-dark-primary-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FontAwesomeIcon icon={faSearch} />
                </motion.button>
              )}
            </motion.div>
          </div>
        </div>
      </nav>
    </FadeIn>
  )
}