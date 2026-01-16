// components/ui/header/Header.tsx
'use client'

import { FadeIn } from '@/components/motion/PageTransition'
import { useThemeStore, useAccountStore } from '@/store/useStoreData'
import { useModalStore } from '@/store/useStoreModal'
import {
  faBell,
  faShoppingBag,
  faCog,
  faMoon,
  faSun,
  faBars,
  faTimes,
  faSignOutAlt,
  faHome,
  faComment,
  faUser,
  faVideo,
  faChartLine,
  faStore,
  faFire,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { motion, AnimatePresence } from 'framer-motion'
import NotificationButton from '@/components/elements/sidebar/NotificationButton'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useSettingsStore } from '../../store/useStoreSettings'
import Image from 'next/image'
import HeaderSidebar from '@/components/elements/sidebar/HeaderSidebar'
import { useRouter } from 'next/navigation'
import { SocialLoginProvider } from '@/services/auth/types'

// 토글 스위치 컴포넌트 수정
const SimpleToggle = ({
  isOn,
  onToggle,
  isSidebar = false,
}: {
  isOn: boolean
  onToggle: () => void
  isSidebar?: boolean
}) => {
  return (
    <div className="flex items-center">
      <span className="hidden md:flex items-center py-2 text-secondary-700 hover:text-primary-600 dark:text-dark-secondary-400 dark:hover:text-dark-primary-600 font-medium transition-colors mr-2">
        세이프티 필터
      </span>
      <button
        onClick={onToggle}
        className={`w-20 relative flex items-center justify-between rounded-full bg-black transition-colors focus:outline-none p-1`}
      >
        {!isOn ? (
          <>
            <span className="text-white font-bold text-md mr-2 ml-2">ON</span>
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
              <img src="/images/sft_icon_on.png" alt="Safety On" className="w-4 h-4" />
            </div>
          </>
        ) : (
          <>
            <div className="w-6 h-6 rounded-full bg-[#636363] flex items-center justify-center">
              <img src="/images/sft_icon_off.png" alt="Safety Off" className="w-4 h-4" />
            </div>
            <span className="text-[#636363] font-bold text-md mr-2 ml-2">OFF</span>
          </>
        )}
      </button>
    </div>
  )
}

export default function Header() {
  const { isDarkMode, toggleDarkMode } = useThemeStore()
  const { isAdultModeEnabled, changeAdultMode } = useSettingsStore()
  const [mounted, setMounted] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()
  const [activeLink, setActiveLink] = useState('/')
  const { openModal } = useModalStore()
  const { isLogin, logout, isAdult, loginType } = useAccountStore()
  const router = useRouter()

  // 네비게이션 링크 (아이콘 추가)
  const navLinks = [
    { href: '/', label: '홈', requireLogin: false, icon: faHome, loginTypeCheck: false },
    { href: '/chat-list', label: '대화', requireLogin: true, icon: faComment, loginTypeCheck: false },
    { href: '/my-characters', label: '캐릭터 만들기', requireLogin: true, icon: faUser, loginTypeCheck: true },
    // { href: '/live', label: 'Live', requireLogin: true, icon: faVideo },
    { href: '/my-account', label: '수익 관리', requireLogin: true, icon: faChartLine, loginTypeCheck: true },
    { href: '/shop-recharge', label: '상점', requireLogin: true, icon: faStore, loginTypeCheck: false },
  ]

  // 로그인 필요한 링크 체크 핸들러
  const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, link: (typeof navLinks)[0]) => {
    if (link.requireLogin && !isLogin) {
      e.preventDefault()
      openModal('login')
    }

    if(link.loginTypeCheck) {
      if(!loginType || loginType === 'Guest' as SocialLoginProvider) {
        e.preventDefault()
        openModal('login')
      }
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

  const onClickSettingLink = () => {
    if (isLogin) {
      router.push('/settings')
    } else {
      openModal('login')
    }
  }

  const handleAdultModeToggle = async () => {
    if(isLogin) {
      if(!loginType || loginType === 'Guest' as SocialLoginProvider) {
        openModal('login')
        return;
      }

      if(isAdult()) {
        await changeAdultMode()
      } else {
        openModal('adultVerification')
      }
    }
    else {
      openModal('login')
    }
  }

  return (
    <>
      <motion.header
        className="sticky top-0 left-0 right-0 z-[50] bg-white dark:bg-dark-background-light shadow-sm dark:shadow-dark-primary-300/20"
        initial={{ y: 0 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl font-bold text-primary-600 dark:text-dark-primary-600 mr-10"
              onClick={e => {
                // 메인 페이지로 이동 시 URL에서 tab 파라미터를 삭제하여 추천 탭으로 강제 이동
                e.preventDefault()
                router.push('/')
              }}
            >
              <Image
                src={`${isDarkMode ? '/images/logo.png' : '/images/logo.png'}`}
                alt="스토리네이션"
                width={143}
                height={100}
              />
            </Link>

            {/* 데스크탑 네비게이션 - 태블릿 이상에서는 숨김 */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={e => handleNavLinkClick(e, link)}
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

          <div className="flex items-center md:space-x-4 gap-1">
            {/* 짜릿모드 토글 - 모든 화면에서 표시 */}
            {mounted && (
              <div>
                <SimpleToggle isOn={isAdultModeEnabled} onToggle={handleAdultModeToggle} />
              </div>
            )}

            {/* 다크모드 토글 버튼 - 모바일에서는 숨김 */}
            {/* {mounted && (
              <motion.button
                onClick={toggleDarkMode}
                className="hidden md:block text-secondary-500 hover:text-primary-500 dark:text-dark-secondary-500 dark:hover:text-dark-primary-600 transition-colors"
                aria-label={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FontAwesomeIcon icon={themeIcon!} className="text-xl" />
              </motion.button>
            )} */}

            {/* 알림 버튼 - 모든 화면 크기에서 표시 */}
            <div>
              <NotificationButton />
            </div>

            {/* 내 정보 버튼 - PC에서만 표시 */}

            <div className="hidden md:block">
              <motion.button
                onClick={onClickSettingLink}
                className="text-secondary-700 hover:text-primary-600 dark:text-dark-secondary-400 dark:hover:text-dark-primary-600 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FontAwesomeIcon icon={faUser} className="text-xl" />
              </motion.button>
            </div>

            {/* 장바구니 버튼 */}
            <Link href="/cart">
              <motion.button
                className="hidden sm:visible text-secondary-700 hover:text-primary-600 dark:text-dark-secondary-400 dark:hover:text-dark-primary-600 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FontAwesomeIcon icon={faShoppingBag} className="text-xl hidden sm:block" />
              </motion.button>
            </Link>

            <motion.button
              onClick={(e) => {
                setIsSidebarOpen(true)
              }}
              className="md:hidden text-secondary-700 hover:text-primary-600 dark:text-dark-secondary-400 dark:hover:text-dark-primary-600 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon icon={faBars} className="text-2xl" />
            </motion.button>
          </div>
          {/* 햄버거 메뉴 버튼 - 태블릿 이하에서만 표시 */}
        </div>
      </motion.header>

      {/* 모바일 사이드바 */}
      <HeaderSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        navLinks={navLinks}
        activeLink={activeLink}
        isLogin={isLogin}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        openModal={openModal}
        setActiveLink={setActiveLink}
        logout={logout}
      />
    </>
  )
}
