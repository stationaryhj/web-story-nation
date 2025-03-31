'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faComment, faUser, faVideo, faStore } from '@fortawesome/free-solid-svg-icons'
import { useModalStore } from '@/store/useStoreModal'
import { useAccountStore } from '@/store/useStoreData'

export default function MobileGNB() {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const [activeLink, setActiveLink] = useState('/')
  const { openModal } = useModalStore()
  const { isLogin } = useAccountStore()

  // 컴포넌트가 마운트되었는지 확인
  useEffect(() => {
    setMounted(true)

    // 현재 경로 확인
    if (pathname) {
      setActiveLink(pathname)
    }

    // 페이지 하단에 패딩 추가
    const addBottomPadding = () => {
      document.body.style.paddingBottom = '64px' // GNB 높이
    }

    addBottomPadding()

    return () => {
      document.body.style.paddingBottom = '0'
    }
  }, [pathname])

  // 마운트되지 않았거나 chat/[id] 페이지인 경우 렌더링하지 않음
  if (!mounted || (pathname && pathname.startsWith('/chat/') && pathname !== '/chat-list')) return null

  // 네비게이션 링크 (아이콘 추가)
  const navLinks = [
    { href: '/', label: '홈', requireLogin: false, icon: faHome },
    { href: '/chat-list', label: '대화', requireLogin: true, icon: faComment },
    { href: '/my-characters', label: '캐릭터 만들기', requireLogin: true, icon: faUser },
    { href: '/live', label: 'Live', requireLogin: true, icon: faVideo },
    { href: '/shop-recharge', label: '상점', requireLogin: true, icon: faStore },
  ]

  // 로그인 필요한 링크 체크 핸들러
  const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, link: (typeof navLinks)[0]) => {
    if (link.requireLogin && !isLogin) {
      e.preventDefault()
      openModal('login')
    }
  }

  return (
    <div
      className="md:hidden sticky bottom-0 left-0 right-0 bg-white dark:bg-dark-background-light border-t border-secondary-100 dark:border-dark-secondary-200/10 h-16"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        height: '64px',
        zIndex: 10000,
        boxShadow: '0 -2px 4px rgba(0,0,0,0.05)',
        margin: 0,
        padding: 0,
      }}
    >
      <div className="grid grid-cols-5 h-full">
        {navLinks
          .filter(link => link.href !== '/') // 홈 링크 제외
          .map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={e => handleNavLinkClick(e, link)}
              className={`flex flex-col items-center justify-center ${
                activeLink === link.href
                  ? 'text-primary-500 dark:text-dark-primary-500'
                  : 'text-secondary-600 dark:text-dark-secondary-400'
              }`}
            >
              <FontAwesomeIcon
                icon={link.icon}
                className={`text-2xl ${
                  activeLink === link.href
                    ? 'text-primary-500 dark:text-dark-primary-500'
                    : 'text-secondary-600 dark:text-dark-secondary-400'
                }`}
              />
            </Link>
          ))}
      </div>
    </div>
  )
}
