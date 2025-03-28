'use client'

import { useEffect, useState, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useThemeStore } from '@/store/useStoreData'
import { usePathname } from 'next/navigation'

interface PortalProps {
  children: ReactNode
  selector?: string
}

// 포털 인스턴스 카운터를 위한 전역 변수
let portalInstanceCounter = 0

/**
 * DOM의 다른 부분에 컴포넌트를 렌더링하기 위한 Portal 컴포넌트
 * @param children 렌더링할 컴포넌트
 * @param selector 렌더링할 DOM 요소의 선택자 (기본값: body)
 */
export default function Portal({ children, selector = 'body' }: PortalProps) {
  const [mounted, setMounted] = useState(false)
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null)
  const { isDarkMode } = useThemeStore()
  const pathname = usePathname() // 현재 경로 가져오기

  // 컴포넌트 마운트 시 처리
  useEffect(() => {
    // 포털 인스턴스 카운터 증가
    portalInstanceCounter++

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
      portalRoot.style.zIndex = '9999'

      // 다크모드 상태에 따라 초기 스타일 설정
      if (isDarkMode) {
        portalRoot.classList.add('dark-portal')
        portalRoot.style.backgroundColor = 'rgba(0, 0, 0, 0.1)'
      }

      // body에 추가
      const element = document.querySelector(selector) as HTMLElement
      element.appendChild(portalRoot)
    }

    setPortalElement(portalRoot)
    setMounted(true)

    // 정리 함수: 컴포넌트가 언마운트될 때 실행
    return () => {
      portalInstanceCounter--

      // 모든 Portal 인스턴스가 언마운트되면 portal-root 요소 제거
      if (portalInstanceCounter === 0) {
        const root = document.getElementById('portal-root')
        if (root && root.parentNode) {
          root.parentNode.removeChild(root)
        }
      }

      setMounted(false)
      setPortalElement(null)
    }
  }, [selector, isDarkMode])

  // 페이지 이동 감지 및 처리
  useEffect(() => {
    // 페이지 변경 시 portal-root 요소 확인 및 정리
    const checkPortalRoot = () => {
      if (portalInstanceCounter === 0) {
        const root = document.getElementById('portal-root')
        if (root && root.parentNode) {
          root.parentNode.removeChild(root)
        }
      }
    }

    // 페이지 변경 시 정리 함수 호출
    checkPortalRoot()
  }, [pathname]) // 경로가 변경될 때마다 실행

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

  // 마운트되지 않았거나 portalElement가 없으면 아무것도 렌더링하지 않음
  if (!mounted || !portalElement) return null

  // createPortal을 사용하여 children을 portalElement에 렌더링
  return createPortal(children, portalElement)
}
