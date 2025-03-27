'use client'

import { faCheckCircle, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { AnimatePresence, motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useModalStore } from '@/store/useStoreModal'
import { lockScroll, unlockScroll, resetScrollLock } from '@/lib/utils/scrollLock'
import { useNotificationStoreData } from '@/store/useNotificationStoreData'

// 알림 타입 정의
type NotificationType = 'info' | 'success' | 'warning' | 'error'

export default function NotificationSidebar() {
  const { isOpen, modalType, closeModal } = useModalStore()
  const { 
    notifications, 
    isLoading, 
    error,
    initialize,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    loadMore,
    pagination
  } = useNotificationStoreData()

  // 모달이 열릴 때 데이터 로드
  useEffect(() => {
    if (isOpen && modalType === 'notification') {
      initialize()
    }
  }, [isOpen, modalType, initialize])

  // 모달이 열릴 때 배경 스크롤 방지
  useEffect(() => {
    if (isOpen && modalType === 'notification') {
      try {
        lockScroll()
      } catch (error) {
        console.error('NotificationSidebar - 스크롤 락 적용 실패:', error)
      }
    } else {
      try {
        unlockScroll()
      } catch (error) {
        console.error('NotificationSidebar - 스크롤 락 해제 실패:', error)
      }
    }

    return () => {
      try {
        resetScrollLock()
      } catch (error) {
        console.error('NotificationSidebar - 스크롤 락 초기화 실패:', error)
      }
    }
  }, [isOpen, modalType])

  // 모달이 열려있고, 타입이 notification인 경우에만 렌더링
  if (!isOpen || modalType !== 'notification') {
    return null
  }

  // 읽지 않은 알림 개수
  const unreadCount = notifications.filter(item => !item.isRead).length

  // 알림 날짜 포맷팅
  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `${days}일 전`
    } else if (hours > 0) {
      return `${hours}시간 전`
    } else if (minutes > 0) {
      return `${minutes}분 전`
    } else {
      return '방금 전'
    }
  }

  // 알림 유형별 색상 클래스
  const getTypeColorClass = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'info':
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    }
  }

  if (isLoading) {
    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 bg-black/50 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
        />
        <motion.div
          className="fixed top-0 right-0 h-full min-w-[600px] bg-white dark:bg-dark-background-light shadow-xl z-50 overflow-hidden flex flex-col"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        </motion.div>
      </AnimatePresence>
    )
  }

  if (error) {
    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 bg-black/50 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
        />
        <motion.div
          className="fixed top-0 right-0 h-full min-w-[600px] bg-white dark:bg-dark-background-light shadow-xl z-50 overflow-hidden flex flex-col"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <div className="flex items-center justify-center h-full text-red-500">
            <p>알림을 불러오는데 실패했습니다.</p>
          </div>
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      {/* 오버레이 */}
      <motion.div
        className="fixed inset-0 bg-black/50 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeModal}
      />

      {/* 사이드바 */}
      <motion.div
        className="fixed top-0 right-0 h-full min-w-[600px] bg-white dark:bg-dark-background-light shadow-xl z-50 overflow-hidden flex flex-col"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        {/* 헤더 */}
        <div className="p-4 border-b border-secondary-200 dark:border-dark-secondary-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-dark-secondary-200">
              알림
              {unreadCount > 0 && (
                <span className="ml-2 text-sm font-medium text-primary-600 dark:text-dark-primary-400">
                  {unreadCount}개 안 읽음
                </span>
              )}
            </h2>
          </div>
          <button
            className="rounded-full p-1 text-secondary-500 hover:bg-secondary-100 hover:text-secondary-700 dark:text-dark-secondary-400 dark:hover:bg-dark-secondary-800 dark:hover:text-dark-secondary-300"
            onClick={closeModal}
          >
            <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
          </button>
        </div>

        {/* 알림 관리 버튼 */}
        <div className="flex justify-end space-x-2 p-2 border-b border-secondary-100 dark:border-dark-secondary-800">
          <button
            className="text-xs text-primary-600 hover:text-primary-700 dark:text-dark-primary-400 dark:hover:text-dark-primary-300 px-2 py-1"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            모두 읽음
          </button>
          <button
            className="text-xs text-secondary-600 hover:text-secondary-700 dark:text-dark-secondary-400 dark:hover:text-dark-secondary-300 px-2 py-1"
            onClick={deleteAllNotifications}
            disabled={notifications.length === 0}
          >
            모두 삭제
          </button>
        </div>

        {/* 알림 목록 */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-secondary-500 dark:text-dark-secondary-400 p-6">
              <FontAwesomeIcon icon={faCheckCircle} className="text-3xl mb-2" />
              <p className="text-center">새로운 알림이 없습니다.</p>
            </div>
          ) : (
            <>
              <ul>
                {notifications.map((item, index) => (
                  <motion.li
                    key={item.id + index.toString()}
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: 100 }}
                    className={`border-b border-secondary-100 dark:border-dark-secondary-800 ${
                      !item.isRead ? 'bg-primary-50 dark:bg-dark-primary-900/20' : ''
                    }`}
                  >
                    <div className="p-4 relative">
                      {/* 읽지 않은 표시 */}
                      {!item.isRead && (
                        <div className="absolute left-0 top-0 w-1 h-full bg-primary-500 dark:bg-dark-primary-500"></div>
                      )}
                      <div className="flex justify-between">
                        <div className="ml-0.5">
                          {/* 유형 태그 */}
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${getTypeColorClass(item.type)} inline-block`}
                          >
                            {item.type === 'info' && '정보'}
                            {item.type === 'success' && '성공'}
                            {item.type === 'warning' && '주의'}
                            {item.type === 'error' && '오류'}
                          </span>
                          {/* 제목 */}
                          <h3 className="text-sm font-medium text-secondary-900 dark:text-dark-secondary-200 mt-1">
                            {item.title}
                          </h3>
                        </div>
                        <div className="flex space-x-1">
                          {/* 읽음 버튼 */}
                          {!item.isRead && (
                            <button
                              className="text-secondary-400 hover:text-secondary-600 dark:text-dark-secondary-500 dark:hover:text-dark-secondary-300 p-1"
                              onClick={() => markAsRead(item.id)}
                              aria-label="읽음 표시"
                            >
                              <FontAwesomeIcon icon={faCheckCircle} className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {/* 삭제 버튼 */}
                          <button
                            className="text-secondary-400 hover:text-secondary-600 dark:text-dark-secondary-500 dark:hover:text-dark-secondary-300 p-1"
                            onClick={() => deleteNotification(item.id)}
                            aria-label="알림 삭제"
                          >
                            <FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      {/* 메시지 내용 */}
                      <p className="text-sm text-secondary-600 dark:text-dark-secondary-400 mt-1">{item.message}</p>
                      {/* 날짜 */}
                      <p className="text-xs text-secondary-400 dark:text-dark-secondary-500 mt-1">
                        {formatDate(item.date)}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </ul>
              
              {/* 더 보기 버튼 */}
              {pagination.hasMore && (
                <div className="flex justify-center p-4">
                  <button
                    onClick={loadMore}
                    disabled={isLoading}
                    className={`px-6 py-2 rounded-full text-white bg-primary-500 hover:bg-primary-600 ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? '로딩 중...' : '더 보기'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
