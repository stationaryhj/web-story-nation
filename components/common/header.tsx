// components/ui/header/Header.tsx
'use client'

import { FadeIn } from '@/components/motion/PageTransition'
import { useThemeStore, useAccountStore } from '@/store/useStoreData'
import { useModalStore } from '@/store/useStoreModal'
import { faBell, faShoppingBag, faCog, faMoon, faSun, faBars, faTimes, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { motion, AnimatePresence } from 'framer-motion'
import NotificationButton from '@/components/elements/sidebar/NotificationButton'
import CreditButton from '@/components/elements/sidebar/CreditButton'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useSettingsStore } from '../../store/useStoreSettings'
import ToggleSwitch from '../form/ToggleSwitch'

// 토글 스위치 컴포넌트 추가 (이름 변경)
const SimpleToggle = ({ isOn, onToggle }: { isOn: boolean; onToggle: () => void }) => {
  return (
    <div className="flex items-center">
      <span className="mr-2 text-sm text-secondary-600 dark:text-dark-secondary-400">짜릿모드</span>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
          isOn ? 'bg-primary-500 dark:bg-dark-primary-500' : 'bg-secondary-200 dark:bg-dark-secondary-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isOn ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

export default function Header() {
  const { isDarkMode, toggleDarkMode } = useThemeStore()
  const [mounted, setMounted] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()
  const [activeLink, setActiveLink] = useState('/')
  const { openModal } = useModalStore()
  const { isAdultModeEnabled, toggleAdultMode } = useSettingsStore()
  const { isLogin, logout } = useAccountStore()

  // 짜릿모드 토글 핸들러
  const handleAdultModeToggle = () => {
    if (!isAdultModeEnabled) {
      // 성인 모드가 꺼져 있을 때는 먼저 성인 인증 모달 표시
      openModal('adultVerification')
    } else {
      // 성인 모드가 켜져 있을 때는 바로 토글
      toggleAdultMode()
    }
  }

  // 네비게이션 링크
  const navLinks = [
    { href: '/', label: '홈', requireLogin: false },
    { href: '/chat-list', label: '대화', requireLogin: true },
    { href: '/my-characters', label: '나의 캐릭터', requireLogin: true },
    { href: '/live', label: 'Live', requireLogin: true },
    { href: '/shop-recharge', label: '수익 관리', requireLogin: true },
    { href: '/my-page', label: '마이페이지', requireLogin: true },
  ]

  // 로그인 필요한 링크 체크 핸들러
  const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, link: typeof navLinks[0]) => {
    if (link.requireLogin && !isLogin) {
      e.preventDefault();
      openModal('login');
    }
  }

  // 컴포넌트가 마운트되었는지 확인
  useEffect(() => {
    setMounted(true)

    // 현재 경로 확인 - usePathname 훅 사용으로 대체
    if (pathname) {
      setActiveLink(pathname)
    }
  }, [pathname])

  // 다크모드 변경 시 HTML에 클래스 추가/제거
  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (!mounted) return

    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode, mounted])

  // 사이드바가 열렸을 때 스크롤 방지
  useEffect(() => {
    if (!mounted) return

    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isSidebarOpen, mounted])

  // 클라이언트 사이드 렌더링 전에는 아이콘 표시하지 않음
  const themeIcon = mounted ? (isDarkMode ? faSun : faMoon) : null
  const themeText = mounted ? (isDarkMode ? '라이트 모드' : '다크 모드') : '테마 모드'

  return (
    <motion.header
      className="sticky top-0 z-[50] bg-white dark:bg-dark-background-light shadow-sm dark:shadow-dark-primary-300/20"
      initial={{ y: 0 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold text-primary-600 dark:text-dark-primary-600 mr-10">
            스토리네이션
          </Link>

          {/* 데스크탑 네비게이션 - 태블릿 이상에서는 숨김 */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavLinkClick(e, link)}
                className={`text-sm font-medium transition-colors hover:text-primary-500 dark:hover:text-dark-primary-500 ${
                  activeLink === link.href
                    ? 'text-primary-500 dark:text-dark-primary-500'
                    : 'text-secondary-700 dark:text-dark-secondary-400'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {/* 짜릿모드 토글 */}
          {mounted && (
            <div className="hidden md:block">
              <SimpleToggle isOn={isAdultModeEnabled} onToggle={handleAdultModeToggle} />
            </div>
          )}

          {/* 햄버거 메뉴 버튼 - 태블릿 이하에서만 표시 */}
          <motion.button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-2 text-secondary-700 hover:text-primary-600 dark:text-dark-secondary-400 dark:hover:text-dark-primary-600 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <FontAwesomeIcon icon={faBars} className="text-2xl" />
          </motion.button>

          {mounted && (
            <motion.button
              onClick={toggleDarkMode}
              className="p-2 text-secondary-500 hover:text-primary-500 dark:text-dark-secondary-500 dark:hover:text-dark-primary-600 transition-colors"
              aria-label={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon icon={themeIcon || faMoon} className="text-lg" />
              <span className="ml-2 text-sm hidden md:inline">{themeText}</span>
            </motion.button>
          )}

          <div className="h-5 w-px bg-secondary-200 dark:bg-dark-secondary-300 hidden md:block"></div>

          <motion.div
            className="p-2 text-secondary-500 hover:text-primary-500 dark:text-dark-secondary-500 dark:hover:text-dark-primary-600 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <NotificationButton count={3} />
          </motion.div>

          <motion.div
            className="ml-1 text-secondary-500 hover:text-primary-500 dark:text-dark-secondary-500 dark:hover:text-dark-primary-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <CreditButton credits={1000} />
            {/* <FontAwesomeIcon icon={faShoppingBag} className="text-lg" /> */}
          </motion.div>

          <Link href="/settings">
            <motion.button
              className="p-2 text-secondary-500 hover:text-primary-500 dark:text-dark-secondary-500 dark:hover:text-dark-primary-600 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon icon={faCog} className="text-lg" />
            </motion.button>
          </Link>

          <FadeIn>
            {mounted && (
              <button
                onClick={isLogin ? logout : () => openModal('login')}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-full text-sm font-medium transition-colors dark:bg-dark-primary-600 dark:hover:bg-dark-primary-700 flex items-center gap-2"
              >
                {isLogin ? (
                  <>
                    <FontAwesomeIcon icon={faSignOutAlt} className="text-sm" />
                    로그아웃
                  </>
                ) : (
                  '로그인'
                )}
              </button>
            )}
          </FadeIn>
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
                        onClick={(e) => {
                          if (link.requireLogin && !isLogin) {
                            e.preventDefault();
                            setIsSidebarOpen(false);
                            openModal('login');
                          } else {
                            setActiveLink(link.href);
                            setIsSidebarOpen(false);
                          }
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
                      <div className="flex items-center py-2">
                        <SimpleToggle isOn={isAdultModeEnabled} onToggle={handleAdultModeToggle} />
                      </div>
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
