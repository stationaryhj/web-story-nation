'use client'

import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  // 로컬 스토리지에서 값을 가져오는 함수
  const readValue = (): T => {
    // 브라우저 환경인지 확인
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      // 로컬 스토리지에서 값을 읽음
      const item = window.localStorage.getItem(key)
      // 값이 있으면 JSON으로 파싱하여 반환, 없으면 초기값 반환
      return item ? (JSON.parse(item) as T) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  }

  // 로컬 스토리지에 값을 저장
  const [storedValue, setStoredValue] = useState<T>(readValue)

  // 값을 업데이트하는 함수
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // React 함수형 업데이트와 새로운 값 모두 허용
      const valueToStore = value instanceof Function ? value(storedValue) : value

      // 상태 업데이트
      setStoredValue(valueToStore)

      // 브라우저 환경인지 확인
      if (typeof window !== 'undefined') {
        // 로컬 스토리지에 값을 저장
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  // 마운트 시와 키 변경 시 로컬 스토리지와 동기화
  useEffect(() => {
    setStoredValue(readValue())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  // 다른 탭/창에서 로컬 스토리지 변경 시 동기화
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        setStoredValue(JSON.parse(event.newValue))
      }
    }

    // 이벤트 리스너 등록
    window.addEventListener('storage', handleStorageChange)

    // 컴포넌트 언마운트 시 리스너 정리
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [key])

  return [storedValue, setValue] as const
}
