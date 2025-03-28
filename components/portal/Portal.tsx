'use client'

import { useEffect, useState, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useThemeStore } from '@/store/useStoreData'

interface PortalProps {
  children: ReactNode
  selector?: string
}

/**
 * DOM의 다른 부분에 컴포넌트를 렌더링하기 위한 Portal 컴포넌트
 * @param children 렌더링할 컴포넌트
 * @param selector 렌더링할 DOM 요소의 선택자 (기본값: body)
 */
export default function Portal({ children, selector = 'body' }: PortalProps) {
  const [mounted, setMounted] = useState(false)
  const { isDarkMode } = useThemeStore()

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // 다크모드 상태가 변경될 때마다 portal-root의 스타일 업데이트
  useEffect(() => {
    if (!mounted) return

    const portalRoot = document.getElementById('portal-root')
    if (portalRoot) {
      if (isDarkMode) {
        portalRoot.classList.add('dark-portal')
        portalRoot.style.backgroundColor = 'rgba(0, 0, 0, 0.1)'
      } else {
        portalRoot.classList.remove('dark-portal')
        portalRoot.style.backgroundColor = 'transparent'
      }
    }
  }, [isDarkMode, mounted])

  if (!mounted) return null

  // DOM이 마운트된 후에 포털 생성
  const element = document.querySelector(selector) as HTMLElement

  // DOM에 포털 컨테이너가 없으면 생성
  let portalRoot = document.getElementById('portal-root')
  if (!portalRoot) {
    portalRoot = document.createElement('div')
    portalRoot.id = 'portal-root'

    // 포지셔닝을 fixed로 변경하여 스크롤에 관계없이 항상 뷰포트를 기준으로 고정
    portalRoot.style.position = 'fixed'
    portalRoot.style.top = '0'
    portalRoot.style.left = '0'
    portalRoot.style.width = '100%'
    portalRoot.style.height = '100%'
    portalRoot.style.pointerEvents = 'none' // 포인터 이벤트 무시 (자식 요소에서는 별도로 제어)
    portalRoot.style.zIndex = '9999'

    // 다크모드 상태에 따라 초기 스타일 설정
    if (isDarkMode) {
      portalRoot.classList.add('dark-portal')
      portalRoot.style.backgroundColor = 'rgba(0, 0, 0, 0.1)'
    }

    element.appendChild(portalRoot)
  }

  return createPortal(children, portalRoot)
}
