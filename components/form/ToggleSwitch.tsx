'use client'

import { useEffect, useState } from 'react'
import { useSettingsStore } from '@/store/useStoreSettings'
import { useModalStore } from '@/store/useStoreModal'

interface ToggleSwitchProps {
  label?: string
  className?: string
}

export default function ToggleSwitch({ label = '짜릿모드', className = '' }: ToggleSwitchProps) {
  const { isAdultModeEnabled, toggleAdultMode } = useSettingsStore()
  const [mounted, setMounted] = useState(false)

  // hydration 오류 방지를 위한 마운트 체크
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleToggle = () => {
    // 테스트 목적으로 로그인 체크를 우회하고 항상 토글 성공 처리
    toggleAdultMode()

    // 실제 로직 (로그인 체크)
    // const success = toggleAdultMode()
    // if (!success) {
    //   openModal('login', {
    //     onLoginSuccess: () => {
    //       toggleAdultMode()
    //     },
    //   })
    // }
  }

  // hydration 문제를 피하기 위해 마운트 후에만 렌더링
  if (!mounted) return null

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center">
        {label && <span className="text-secondary-700 dark:text-dark-secondary-300 font-medium">{label}</span>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" checked={isAdultModeEnabled} onChange={handleToggle} />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-dark-primary-800 rounded-full peer dark:bg-dark-secondary-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600 dark:peer-checked:bg-dark-primary-600"></div>
      </label>
    </div>
  )
}
