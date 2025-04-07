'use client'

import { faCheckCircle, faTrash, faExclamationCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useModalStore } from '@/store/useStoreModal'
import BaseSidebar from '@/components/elements/sidebar/BaseSidebar'
import { useNotificationStoreData } from '@/store/useNotificationStoreData'
import { useAccountStore } from '@/store/useAccountStore'

// 알림 타입 정의
type NotificationType = 'info' | 'success' | 'warning' | 'error'
// 활성화 탭 타입 정의
type ActiveTabType = 'notification' | 'announcement'

// 공지사항 목록 컴포넌트
const AnnouncementTab = () => {
  const { announcements, loadMoreAnnouncements, announcementPagination, isLoading, error, initialize } =
    useNotificationStoreData()

  // 날짜 포맷팅 함수
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }

  // 스크롤 이벤트 처리 함수 (무한 스크롤)
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    // 스크롤이 90% 이상 내려갔고, 더 불러올 데이터가 있을 때
    if (scrollTop + clientHeight >= scrollHeight * 0.9 && announcementPagination.hasMore && !isLoading) {
      loadMoreAnnouncements()
    }
  }

  // 로딩 중일 때 스켈레톤 UI 표시
  if (isLoading && announcements.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto">
        {Array(5)
          .fill(0)
          .map((_, index) => (
            <div key={`skeleton-${index}`} className="border-b border-secondary-100 dark:border-dark-secondary-800 p-4">
              <div className="w-16 h-5 bg-secondary-100 dark:bg-dark-secondary-800 rounded-full animate-pulse mb-2"></div>
              <div className="w-3/4 h-5 bg-secondary-100 dark:bg-dark-secondary-800 rounded animate-pulse mb-2"></div>
              <div className="w-full h-4 bg-secondary-100 dark:bg-dark-secondary-800 rounded animate-pulse mb-2"></div>
              <div className="w-32 h-3 bg-secondary-100 dark:bg-dark-secondary-800 rounded animate-pulse"></div>
            </div>
          ))}
      </div>
    )
  }

  // 에러 발생 시 에러 메시지 표시
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="text-center space-y-4">
          <FontAwesomeIcon icon={faExclamationCircle} className="text-4xl text-red-500 dark:text-red-400 mb-2" />
          <p className="text-secondary-700 dark:text-dark-secondary-300 text-base">
            공지사항 불러오기 중 오류가 발생했습니다. 다시 시도해주세요.
          </p>
          <button
            onClick={() => initialize()}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  // 공지사항이 없는 경우
  if (announcements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-secondary-500 dark:text-dark-secondary-400 p-6">
        <FontAwesomeIcon icon={faCheckCircle} className="text-3xl mb-2" />
        <p className="text-center">등록된 공지사항이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
      <ul>
        {announcements.map(item => (
          <motion.li
            key={item.id}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            className="border-b border-secondary-100 dark:border-dark-secondary-800"
          >
            <div className="p-4 relative">
              {/* 중요 공지사항 표시 */}
              {item.isImportant && <div className="absolute left-0 top-0 w-1 h-full bg-red-500 dark:bg-red-600"></div>}
              <div className="flex justify-between items-start">
                <div className="ml-0.5 flex-1">
                  {/* 중요 표시 */}
                  {item.isImportant && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 inline-block mb-1">
                      중요
                    </span>
                  )}
                  {/* 제목 */}
                  <h3 className="text-sm font-medium text-secondary-900 dark:text-dark-secondary-200">{item.title}</h3>
                  {/* 메시지 내용 */}
                  <p className="text-sm text-secondary-600 dark:text-dark-secondary-400 mt-1">{item.message}</p>
                  {/* 날짜 */}
                  <p className="text-xs text-secondary-400 dark:text-dark-secondary-500 mt-1">
                    {formatDate(item.date)}
                  </p>
                </div>
              </div>
            </div>
          </motion.li>
        ))}
      </ul>

      {/* 추가 로딩 중 표시 */}
      {isLoading && announcements.length > 0 && (
        <div className="p-4 flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
        </div>
      )}
    </div>
  )
}

// 알림 목록 컴포넌트
const NotificationTab = () => {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    isLoading,
    error,
    initialize,
  } = useNotificationStoreData()
  const { isLogin } = useAccountStore()
  const { openModal } = useModalStore()

  // 로그인되지 않은 경우 로그인 유도 메시지 표시
  if (!isLogin) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="text-center space-y-4">
          <FontAwesomeIcon
            icon={faCheckCircle}
            className="text-4xl text-secondary-400 dark:text-dark-secondary-500 mb-2"
          />
          <p className="text-secondary-700 dark:text-dark-secondary-300 text-base">
            알림 기능을 이용하려면 로그인이 필요합니다.
          </p>
          <button
            onClick={() => openModal('login')}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md transition-colors"
          >
            로그인하기
          </button>
        </div>
      </div>
    )
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

  // 로딩 중일 때 스켈레톤 UI 표시
  if (isLoading) {
    return (
      <>
        {/* 알림 관리 버튼 스켈레톤 */}
        <div className="flex justify-end space-x-2 p-2 border-b border-secondary-100 dark:border-dark-secondary-800">
          <div className="w-16 h-6 bg-secondary-100 dark:bg-dark-secondary-800 rounded animate-pulse"></div>
          <div className="w-16 h-6 bg-secondary-100 dark:bg-dark-secondary-800 rounded animate-pulse"></div>
        </div>

        {/* 알림 목록 스켈레톤 */}
        <div className="flex-1 overflow-y-auto">
          {Array(5)
            .fill(0)
            .map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="border-b border-secondary-100 dark:border-dark-secondary-800 p-4"
              >
                <div className="flex justify-between">
                  <div className="ml-0.5">
                    <div className="w-16 h-5 bg-secondary-100 dark:bg-dark-secondary-800 rounded-full animate-pulse mb-2"></div>
                    <div className="w-32 h-5 bg-secondary-100 dark:bg-dark-secondary-800 rounded animate-pulse mb-2"></div>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-6 h-6 bg-secondary-100 dark:bg-dark-secondary-800 rounded animate-pulse"></div>
                    <div className="w-6 h-6 bg-secondary-100 dark:bg-dark-secondary-800 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="w-full h-4 bg-secondary-100 dark:bg-dark-secondary-800 rounded animate-pulse mt-2"></div>
                <div className="w-24 h-3 bg-secondary-100 dark:bg-dark-secondary-800 rounded animate-pulse mt-2"></div>
              </div>
            ))}
        </div>
      </>
    )
  }

  // 에러 발생 시 에러 메시지 표시
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="text-center space-y-4">
          <FontAwesomeIcon icon={faExclamationCircle} className="text-4xl text-red-500 dark:text-red-400 mb-2" />
          <p className="text-secondary-700 dark:text-dark-secondary-300 text-base">
            알림 불러오기 중 오류가 발생했습니다. 다시 시도해주세요.
          </p>
          <button
            onClick={() => initialize()}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
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
          <ul>
            {notifications.map(item => (
              <motion.li
                key={item.id}
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
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColorClass(item.type)} inline-block`}>
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
        )}
      </div>
    </>
  )
}

export default function NotificationSidebar() {
  const { isOpen, modalType, closeModal } = useModalStore()
  const { notifications, hasNewNotification, isLoading, error, initialize, deleteAllNotifications } =
    useNotificationStoreData()
  const { isLogin } = useAccountStore()
  const [activeTab, setActiveTab] = useState<ActiveTabType>('notification')

  // 모달이 열릴 때 데이터 로드 및 로그인 상태 확인
  useEffect(() => {
    if (isOpen && modalType === 'notification') {
      // 로그인 상태에 따라 처리
      if (isLogin) {
        initialize() // 알림과 공지사항 모두 불러오기
      } else {
        // 로그인되지 않은 경우 알림 데이터 삭제
        deleteAllNotifications()
        // 공지사항만 불러오기
        initialize()
      }
    }
  }, [isOpen, modalType, initialize, isLogin, deleteAllNotifications])

  // 로그인 상태가 변경될 때도 처리
  useEffect(() => {
    if (!isLogin) {
      // 로그아웃된 경우 알림 데이터 삭제
      deleteAllNotifications()
    }
  }, [isLogin, deleteAllNotifications])

  // 모달이 열려있고, 타입이 notification인 경우에만 렌더링
  if (!isOpen || modalType !== 'notification') {
    return null
  }

  // 읽지 않은 알림 개수
  const unreadCount = notifications.filter(item => !item.isRead).length

  // 헤더에 표시할 제목
  const sidebarTitle = activeTab === 'notification' ? '알림' : '공지사항'

  // 헤더에 표시할 추가 요소 (알림 개수)
  const headerExtra =
    activeTab === 'notification' && unreadCount > 0 ? (
      <div className="flex items-center">
        <span className="text-sm font-medium text-primary-600 dark:text-dark-primary-400">{unreadCount}개 안 읽음</span>
      </div>
    ) : null

  return (
    <BaseSidebar
      isOpen={isOpen && modalType === 'notification'}
      onClose={closeModal}
      title={sidebarTitle}
      headerExtra={headerExtra}
    >
      {/* 탭 메뉴 */}
      <div className="flex border-b border-secondary-100 dark:border-dark-secondary-800">
        <button
          className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'notification'
              ? 'text-primary-600 dark:text-dark-primary-400'
              : 'text-secondary-500 dark:text-dark-secondary-400 hover:text-secondary-700 dark:hover:text-dark-secondary-300'
          }`}
          onClick={() => setActiveTab('notification')}
        >
          알림
          {(unreadCount > 0 || hasNewNotification) && (
            <span className="ml-1 px-1.5 py-0.5 text-xs font-medium rounded-full bg-primary-500 text-white">
              {unreadCount > 0 ? unreadCount : '새 알림'}
            </span>
          )}
          {activeTab === 'notification' && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 dark:bg-dark-primary-500"
              layoutId="tab-indicator"
            />
          )}
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'announcement'
              ? 'text-primary-600 dark:text-dark-primary-400'
              : 'text-secondary-500 dark:text-dark-secondary-400 hover:text-secondary-700 dark:hover:text-dark-secondary-300'
          }`}
          onClick={() => setActiveTab('announcement')}
        >
          공지사항
          {activeTab === 'announcement' && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 dark:bg-dark-primary-500"
              layoutId="tab-indicator"
            />
          )}
        </button>
      </div>

      {/* 탭 내용 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col flex-1"
        >
          {activeTab === 'notification' ? <NotificationTab /> : <AnnouncementTab />}
        </motion.div>
      </AnimatePresence>
    </BaseSidebar>
  )
}
