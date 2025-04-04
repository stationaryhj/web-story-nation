'use client'

import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faClock } from '@fortawesome/free-solid-svg-icons'
import BaseModal from './BaseModal'
import { BaseButton } from '@/components/elements/button/BaseButton'
import { useAccountStore } from '@/store/useAccountStore'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface RewardModalProps {
  isOpen: boolean
  onClose: () => void
  isAfterSignup?: boolean // 회원가입 후 표시되는지 여부
}

export default function RewardModal({ isOpen, onClose, isAfterSignup = false }: RewardModalProps) {
  const router = useRouter()
  const { UpdateFreePen, data } = useAccountStore()
  const [isGetFreePen, setIsGetFreePen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [remainingTime, setRemainingTime] = useState('00:00:00')

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      UpdateFreePen().then(isSuccess => {
        setIsGetFreePen(isSuccess)
        setIsLoading(false)
        console.log('isSuccess', isSuccess)
      })
    }
  }, [isOpen, UpdateFreePen])

  // 남은 시간 계산 로직
  useEffect(() => {
    if (!isGetFreePen) {
      const calculateRemainingTime = () => {
        const targetDate = new Date(data?.coin_free_dt || '')
        const now = new Date()

        // 시간 차이 계산 (밀리초)
        let diff = targetDate.getTime() - now.getTime()

        // 시간이 이미 지났으면 0으로 설정
        if (diff < 0) {
          setRemainingTime('00:00:00')
          return
        }

        // 시간, 분, 초 계산
        const hours = Math.floor(diff / (1000 * 60 * 60))
        diff -= hours * (1000 * 60 * 60)

        const mins = Math.floor(diff / (1000 * 60))
        diff -= mins * (1000 * 60)

        const secs = Math.floor(diff / 1000)

        // 형식에 맞게 포맷팅
        setRemainingTime(
          `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        )
      }

      // 최초 계산
      calculateRemainingTime()

      // 1초마다 업데이트
      const timer = setInterval(calculateRemainingTime, 1000)

      return () => clearInterval(timer)
    }
  }, [isGetFreePen, data?.coin_free_dt])

  const handleConfirm = () => {
    onClose()

    // 회원가입 완료 후에만 로그인 페이지로 이동
    if (isAfterSignup) {
      router.push('/')
    }
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="md"
      animation="fade"
      backdropColor="bg-black/70 backdrop-blur-sm"
      showCloseButton={false}
      preventBackdropClose={true}
      footerContent={
        <div className="flex justify-center">
          <BaseButton color="gradient" onClick={handleConfirm}>
            {isGetFreePen ? '확인' : '출석 체크 완료'}
          </BaseButton>
        </div>
      }
    >
      <div className="flex flex-col items-center py-6 space-y-6">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center space-y-4"
            >
              <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
              <p className="text-gray-500 dark:text-gray-400">로딩 중...</p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center space-y-6"
            >
              {/* 제목 - isGetFreePen에 따라 다른 제목 표시 */}
              <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
                {isGetFreePen ? (
                  <>
                    보상 지급!
                    <br />
                    30펜을 지급해 드렸어요
                  </>
                ) : (
                  <>출석체크!</>
                )}
              </h1>

              {/* 아이콘 - isGetFreePen에 따라 다른 아이콘 표시 */}
              <div className="w-24 h-24 flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900">
                {isGetFreePen ? (
                  <FontAwesomeIcon icon={faPen} className="h-12 w-12 text-primary-500 dark:text-primary-400" />
                ) : (
                  <FontAwesomeIcon icon={faClock} className="h-12 w-12 text-primary-500 dark:text-primary-400" />
                )}
              </div>

              {/* 안내 메시지 - isGetFreePen에 따라 다른 메시지 표시 */}
              <div className="text-center text-gray-600 dark:text-gray-300">
                {isGetFreePen ? (
                  <p>
                    {isAfterSignup ? (
                      <>
                        스토리네이션에 오신 것을 환영합니다!
                        <br />
                        지급된 펜으로 캐릭터를 만들어보세요.
                      </>
                    ) : (
                      <>
                        소중한 의견 감사합니다!
                        <br />
                        지급된 펜으로 더 많은 이야기를 만들어보세요.
                      </>
                    )}
                  </p>
                ) : (
                  <>
                    <p className="mb-2">다음 출석까지</p>
                    <p className="text-2xl font-mono font-bold text-primary-600 dark:text-primary-400">
                      {remainingTime}
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </BaseModal>
  )
}
