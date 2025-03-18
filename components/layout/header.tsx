// components/ui/header/Header.tsx
'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell, faShoppingBag, faCog, faMoon, faSun, faBars, faTimes } from '@fortawesome/free-solid-svg-icons'
import { useThemeStore } from '@/store/useStoreData'
import { motion, AnimatePresence } from 'framer-motion'
import { FadeIn } from '@/components/ui/motion/PageTransition'
import { useModalStore } from '@/store/useStoreModal'

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { isDarkMode, toggleDarkMode } = useThemeStore()
  const [mounted, setMounted] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()
  const [activeLink, setActiveLink] = useState('/')
<<<<<<< HEAD

=======
  const { openModal } = useModalStore()
  
>>>>>>> 24c00138d96f0184be09f46f55ccb384b06cf61e
  // 네비게이션 링크
  const navLinks = [
    { href: '/', label: '홈' },
    { href: '/chat-list', label: '대화' },
    { href: '/my-characters', label: '내 캐릭터' },
    { href: '/MyCharacter', label: 'my' },
  ]

  // 컴포넌트가 마운트되었는지 확인
  useEffect(() => {
    setMounted(true)
<<<<<<< HEAD

    // 현재 경로 확인
    if (typeof window !== 'undefined') {
      const path = window.location.pathname
      setActiveLink(path)
    }
  }, [])

  // 다크모드 변경 시 HTML에 클래스 추가/제거
  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window === 'undefined' || !mounted) return

=======
    
    // 현재 경로 확인 - usePathname 훅 사용으로 대체
    if (pathname) {
      setActiveLink(pathname)
    }
  }, [pathname])
  
  // 다크모드 변경 시 HTML에 클래스 추가/제거
  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (!mounted) return;
    
>>>>>>> 24c00138d96f0184be09f46f55ccb384b06cf61e
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode, mounted])

  // 사이드바가 열렸을 때 스크롤 방지
  useEffect(() => {
    if (!mounted) return;
    
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    return () => {
      document.body.style.overflow = 'auto'
    }
<<<<<<< HEAD
  }, [isSidebarOpen])

=======
  }, [isSidebarOpen, mounted])
  
>>>>>>> 24c00138d96f0184be09f46f55ccb384b06cf61e
  // 클라이언트 사이드 렌더링 전에는 아이콘 표시하지 않음
  const themeIcon = mounted ? (isDarkMode ? faSun : faMoon) : null
  const themeText = mounted ? (isDarkMode ? '라이트 모드' : '다크 모드') : '테마 모드'

  return (
    <motion.header
      className="sticky top-0 z-50 bg-white dark:bg-dark-background-light shadow-sm dark:shadow-dark-primary-300/20"
      initial={{ y:0 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold text-primary-600 dark:text-dark-primary-600 mr-10">
            스토리네이션
          </Link>

          {/* 데스크탑 네비게이션 - 태블릿 이상에서는 숨김 */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-base font-medium transition-colors relative ${
                  activeLink === link.href
                    ? 'text-primary-600 dark:text-dark-primary-600'
                    : 'text-secondary-700 hover:text-primary-600 dark:text-dark-secondary-400 dark:hover:text-dark-primary-600'
                }`}
                onClick={() => setActiveLink(link.href)}
              >
                {link.label}
                {activeLink === link.href && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary-500 dark:bg-dark-primary-500 rounded-full"></span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {/* 햄버거 메뉴 버튼 - 태블릿 이하에서만 표시 */}
          <motion.button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-2 text-secondary-700 hover:text-primary-600 dark:text-dark-secondary-400 dark:hover:text-dark-primary-600 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <FontAwesomeIcon icon={faBars} className="text-2xl" />
          </motion.button>
<<<<<<< HEAD

          <motion.button
            onClick={toggleDarkMode}
            className="p-2 text-secondary-500 hover:text-primary-500 dark:text-dark-secondary-500 dark:hover:text-dark-primary-600 transition-colors"
            aria-label={mounted ? (isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환') : '테마 모드 전환'}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {mounted && <FontAwesomeIcon icon={themeIcon || faMoon} className="text-lg" />}
            <span className="ml-2 text-sm hidden md:inline">{themeText}</span>
          </motion.button>

=======
          
          {mounted && (
            <motion.button 
              onClick={toggleDarkMode}
              className="p-2 text-secondary-500 hover:text-primary-500 dark:text-dark-secondary-500 dark:hover:text-dark-primary-600 transition-colors"
              aria-label={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon 
                icon={themeIcon || faMoon} 
                className="text-lg" 
              />
              <span className="ml-2 text-sm hidden md:inline">
                {themeText}
              </span>
            </motion.button>
          )}
          
>>>>>>> 24c00138d96f0184be09f46f55ccb384b06cf61e
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
<<<<<<< HEAD

=======
          
          <Link href="/settings">
            <motion.button 
              className="p-2 text-secondary-500 hover:text-primary-500 dark:text-dark-secondary-500 dark:hover:text-dark-primary-600 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon icon={faCog} className="text-lg" />
            </motion.button>
          </Link>
          
>>>>>>> 24c00138d96f0184be09f46f55ccb384b06cf61e
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
<<<<<<< HEAD
              <Link
                href="/login"
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-full text-sm font-medium transition-colors dark:bg-dark-primary-600 dark:hover:bg-dark-primary-700"
              >
                로그인
              </Link>
=======
              {mounted && (
                <button 
                  onClick={() => openModal('login')}
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-full text-sm font-medium transition-colors dark:bg-dark-primary-600 dark:hover:bg-dark-primary-700"
                >
                  로그인
                </button>
              )}
>>>>>>> 24c00138d96f0184be09f46f55ccb384b06cf61e
            </FadeIn>
          )}
        </div>
      </div>

      {/* 모바일 사이드바 */}
      <AnimatePresence>
        {isSidebarOpen && mounted && (
          <>
            {/* 배경 오버레이 */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
            />

            {/* 사이드바 */}
            <motion.div
              className="fixed top-0 right-0 h-full w-72 bg-white dark:bg-dark-background-light shadow-xl z-50 overflow-y-auto"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="p-5 flex justify-between items-center border-b border-secondary-100 dark:border-dark-secondary-200/20">
                <h2 className="text-xl font-bold text-primary-600 dark:text-dark-primary-600">메뉴</h2>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 text-secondary-500 hover:text-primary-500 dark:text-dark-secondary-500 dark:hover:text-dark-primary-600 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-xl" />
                </button>
              </div>

              <nav className="p-5">
                <ul className="space-y-5">
                  {navLinks.map(link => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={`block py-2 text-lg font-medium transition-colors ${
                          activeLink === link.href
                            ? 'text-primary-600 dark:text-dark-primary-600'
                            : 'text-secondary-700 hover:text-primary-600 dark:text-dark-secondary-400 dark:hover:text-dark-primary-600'
                        }`}
                        onClick={() => {
                          setActiveLink(link.href)
                          setIsSidebarOpen(false)
                        }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 pt-6 border-t border-secondary-100 dark:border-dark-secondary-200/20">
                  <h3 className="text-sm font-semibold text-secondary-500 dark:text-dark-secondary-500 mb-4">설정</h3>
                  <ul className="space-y-4">
                    <li>
                      <button
                        onClick={toggleDarkMode}
                        className="flex items-center w-full py-2 text-secondary-700 hover:text-primary-600 dark:text-dark-secondary-400 dark:hover:text-dark-primary-600 font-medium transition-colors"
                      >
                        <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} className="text-lg mr-3" />
                        {isDarkMode ? '라이트 모드' : '다크 모드'}
                      </button>
                    </li>
                    <li>
                      <Link
                        href="/settings"
                        className="flex items-center py-2 text-secondary-700 hover:text-primary-600 dark:text-dark-secondary-400 dark:hover:text-dark-primary-600 font-medium transition-colors"
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <FontAwesomeIcon icon={faCog} className="text-lg mr-3" />
                        설정
                      </Link>
                    </li>
                  </ul>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
