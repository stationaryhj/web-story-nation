// components/ui/header/Header.tsx
'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faBell, 
  faShoppingBag, 
  faCog, 
  faMoon,
  faSun
} from '@fortawesome/free-solid-svg-icons'
import { useThemeStore } from '@/store/useStoreData'
import { motion } from 'framer-motion'
import { FadeIn } from '@/components/ui/motion/PageTransition'

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { isDarkMode, toggleDarkMode } = useThemeStore()
  const [mounted, setMounted] = useState(false)
  
  // 컴포넌트가 마운트되었는지 확인
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // 다크모드 변경 시 HTML에 클래스 추가/제거
  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window === 'undefined' || !mounted) return;
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode, mounted])
  
  // 클라이언트 사이드 렌더링 전에는 아이콘 표시하지 않음
  const themeIcon = mounted ? (isDarkMode ? faSun : faMoon) : null
  const themeText = mounted ? (isDarkMode ? '라이트 모드' : '다크 모드') : '테마 모드'
  
  return (
    <motion.header 
      className="sticky top-0 z-50 bg-white dark:bg-dark-background-light shadow-sm dark:shadow-dark-primary-300/20"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-primary-600 dark:text-dark-primary-600">
          스토리네이션
        </Link>
        
        <div className="flex items-center space-x-4">
          <motion.button 
            onClick={toggleDarkMode}
            className="p-2 text-secondary-500 hover:text-primary-500 dark:text-dark-secondary-500 dark:hover:text-dark-primary-600 transition-colors"
            aria-label={mounted ? (isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환') : '테마 모드 전환'}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {mounted && (
              <FontAwesomeIcon 
                icon={themeIcon || faMoon} 
                className="text-lg" 
              />
            )}
            <span className="ml-2 text-sm hidden md:inline">
              {themeText}
            </span>
          </motion.button>
          
          <div className="h-5 w-px bg-secondary-200 dark:bg-dark-secondary-300 hidden md:block"></div>
          
          <motion.button 
            className="p-2 text-secondary-500 hover:text-primary-500 dark:text-dark-secondary-500 dark:hover:text-dark-primary-600 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <FontAwesomeIcon icon={faBell} className="text-lg" />
          </motion.button>
          
          <motion.button 
            className="p-2 text-secondary-500 hover:text-primary-500 dark:text-dark-secondary-500 dark:hover:text-dark-primary-600 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <FontAwesomeIcon icon={faShoppingBag} className="text-lg" />
          </motion.button>
          
          {isLoggedIn ? (
            <motion.button 
              className="p-2 text-secondary-500 hover:text-primary-500 dark:text-dark-secondary-500 dark:hover:text-dark-primary-600 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon icon={faCog} className="text-lg" />
            </motion.button>
          ) : (
            <FadeIn>
              <Link 
                href="/login" 
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-full text-sm font-medium transition-colors dark:bg-dark-primary-600 dark:hover:bg-dark-primary-700"
              >
                로그인
              </Link>
            </FadeIn>
          )}
        </div>
      </div>
      
      <nav className="bg-white dark:bg-dark-background-light border-t border-b border-secondary-100 dark:border-dark-secondary-200">
        <div className="container mx-auto px-4">
          <ul className="flex items-center space-x-6 overflow-x-auto py-3 scrollbar-hide">
            <li>
              <Link href="/" className="text-primary-600 dark:text-dark-primary-600 font-medium">
                홈
              </Link>
            </li>
            <li>
              <Link href="/chat" className="text-secondary-500 hover:text-primary-500 dark:text-dark-secondary-500 dark:hover:text-dark-primary-600 transition-colors">
                대화
              </Link>
            </li>
            <li>
              <Link href="/my-characters" className="text-secondary-500 hover:text-primary-500 dark:text-dark-secondary-500 dark:hover:text-dark-primary-600 transition-colors">
                내 캐릭터
              </Link>
            </li>
            <li>
              <Link href="/my" className="text-secondary-500 hover:text-primary-500 dark:text-dark-secondary-500 dark:hover:text-dark-primary-600 transition-colors">
                My
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </motion.header>
  )
}