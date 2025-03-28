'use client'

import { useEffect, useState, ReactNode } from 'react'
import { createPortal } from 'react-dom'

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

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) return null

  // DOM이 마운트된 후에 포털 생성
  const element = document.querySelector(selector) as HTMLElement

  // DOM에 포털 컨테이너가 없으면 생성
  let portalRoot = document.getElementById('portal-root')
  if (!portalRoot) {
    portalRoot = document.createElement('div')
    portalRoot.id = 'portal-root'
    portalRoot.style.position = 'relative'
    portalRoot.style.zIndex = '9999'
    element.appendChild(portalRoot)
  }

  return createPortal(children, portalRoot)
}
