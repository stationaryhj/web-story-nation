'use client'

import React from 'react'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSun, faMoon, faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import BaseSidebar from './BaseSidebar'

interface NavLink {
  href: string
  label: string
  requireLogin?: boolean
}

// useStoreModal에서 사용되는 ModalType 직접 정의
type ModalType =
  | 'wallet'
  | 'token'
  | 'network'
  | 'provider'
  | 'slippage'
  | 'liquidity'
  | 'character'
  | 'login'
  | 'signup'
  | 'confirmAction'
  | 'notification'
  | 'credit'
  | 'adultVerification'
  | 'chatMode'
  | 'report'
  | 'bankInfo'

interface HeaderSidebarProps {
  isOpen: boolean
  onClose: () => void
  navLinks: NavLink[]
  activeLink: string
  isLogin: boolean
  isDarkMode: boolean
  toggleDarkMode: () => void
  openModal: (modalType: ModalType, props?: Record<string, any>) => void
  setActiveLink: (href: string) => void
  logout?: () => void
}

export default function HeaderSidebar({
  isOpen,
  onClose,
  navLinks,
  activeLink,
  isLogin,
  isDarkMode,
  toggleDarkMode,
  openModal,
  setActiveLink,
  logout,
}: HeaderSidebarProps) {
  const sidebarContent = (
    <>
      <nav className="p-5">
        <div className="">
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
            {/* <li>
              <div className="flex items-center py-2">
                <SimpleToggle isOn={isAdultModeEnabled} onToggle={handleAdultModeToggle} isSidebar={true} />
              </div>
            </li> */}
            <li>
              <Link
                href="/settings"
                className="flex items-center py-2 text-secondary-700 hover:text-primary-600 dark:text-dark-secondary-400 dark:hover:text-dark-primary-600 font-medium transition-colors"
                onClick={() => onClose()}
              >
                <FontAwesomeIcon icon={faCog} className="text-lg mr-3" />
                설정
              </Link>
            </li>
            <li>
              {isLogin ? (
                <button
                  onClick={() => {
                    if (logout) logout()
                    onClose()
                  }}
                  className="flex items-center w-full py-2 text-secondary-700 hover:text-primary-600 dark:text-dark-secondary-400 dark:hover:text-dark-primary-600 font-medium transition-colors"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="text-lg mr-3" />
                  로그아웃
                </button>
              ) : (
                <button
                  onClick={() => {
                    openModal('login')
                    onClose()
                  }}
                  className="flex items-center w-full py-2 text-secondary-700 hover:text-primary-600 dark:text-dark-secondary-400 dark:hover:text-dark-primary-600 font-medium transition-colors"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="text-lg mr-3" />
                  로그인
                </button>
              )}
            </li>
          </ul>
        </div>
      </nav>
    </>
  )

  return (
    <BaseSidebar isOpen={isOpen} onClose={onClose} title="메뉴" width="" side="right">
      {sidebarContent}
    </BaseSidebar>
  )
}
