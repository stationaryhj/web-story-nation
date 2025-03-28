import { InquiryData, InquiryListResponse } from '@/types/api'
import { create } from 'zustand'
import { contentApi } from '@/services/api'
import { QueryClient } from '@tanstack/react-query'
import { bridgeInquiryDataToNotification } from '@/lib/utils/storyNationUtil'

// 알림 타입 정의
type NotificationType = 'info' | 'success' | 'warning' | 'error'

// 알림 아이템 인터페이스
interface NotificationItem {
  id: string
  title: string
  message: string
  type: NotificationType
  isRead: boolean
  date: Date
  sort: number
}

// 싱글톤 queryClient 생성 (최초 한 번만 생성)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분 동안 데이터를 신선하게 유지
      gcTime: 1000 * 60 * 30, // 30분 동안 데이터 캐싱 (이전의 cacheTime)
      retry: 1, // 실패시 1번 재시도
      refetchOnWindowFocus: false, // 윈도우 포커스시 자동 리페치 비활성화
    },
  },
})

// 공지사항 데이터 스토어
interface NotificationStoreData {
  notifications: Array<NotificationItem>
  isLoading: boolean
  error: Error | null
  pagination: {
    page: number
    total: number
    hasMore: boolean
  }
  
  initialize: () => Promise<void>
  invalidateData: () => Promise<void>
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  deleteAllNotifications: () => void
  loadMore: () => Promise<void>
}

export const useNotificationStoreData = create<NotificationStoreData>((set, get) => ({
  notifications: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    total: 0,
    hasMore: false
  },

  // 초기 데이터 불러오기
  initialize: async () => {
    // 초기화 및 로딩 상태 설정
    set({ 
      isLoading: true, 
      error: null,
      pagination: {
        page: 1,
        total: 0,
        hasMore: false
      },
      notifications: []
    })
    
    try {
      // React Query를 통해 데이터 요청
      const data = await queryClient.fetchQuery({
        queryKey: ['notifications', 1],
        queryFn: async () => {
          const response = await contentApi.GetInquiryList(1, 10)
          return response?.data
        },
        staleTime: 1000 * 60 * 5 // 5분
      })
      
      if (data && data.notice) {
        // 데이터를 NotificationItem 형식으로 변환
        const notificationItems = data.notice.data.map((item: InquiryData) => {
          const notification = bridgeInquiryDataToNotification(item)
          return {
            ...notification,
            type: notification.type as NotificationType
          }
        })
        
        // Zustand 스토어 업데이트
        set({ 
          notifications: notificationItems,
          pagination: {
            page: 1,
            total: data.notice.total || 0,
            hasMore: data.notice.current_page < data.notice.last_page
          },
          isLoading: false
        })
      } else {
        set({ isLoading: false, error: new Error('데이터가 없습니다') })
      }
    } catch (error) {
      console.error("알림 데이터 로딩 중 오류 발생:", error)
      set({ isLoading: false, error: error as Error })
    }
  },
  
  // 데이터를 무효화하고 다시 가져오는 함수
  invalidateData: async () => {
    await queryClient.invalidateQueries({ queryKey: ['notifications'] })
    get().initialize()
  },

  // 더 많은 데이터 로드 (페이지네이션)
  loadMore: async () => {
    const { isLoading, pagination, notifications } = get()
    
    // 이미 로딩 중이거나 더 로드할 데이터가 없으면 리턴
    if (isLoading || !pagination.hasMore) return
    
    const nextPage = pagination.page + 1
    set({ isLoading: true })
    
    try {
      const response = await contentApi.GetInquiryList(nextPage, 10)
      const data = response?.data
      
      if (data && data.notice) {
        // 새로운 데이터를 NotificationItem 형식으로 변환
        const newNotificationItems = data.notice.data.map((item: InquiryData) => {
          const notification = bridgeInquiryDataToNotification(item)
          return {
            ...notification,
            type: notification.type as NotificationType
          }
        })
        
        // 기존 데이터와 병합
        set({
          notifications: [...notifications, ...newNotificationItems],
          pagination: {
            page: nextPage,
            total: data.notice.total || 0,
            hasMore: data.notice.current_page < data.notice.last_page
          },
          isLoading: false
        })
      } else {
        set({ isLoading: false })
      }
    } catch (error) {
      console.error("추가 데이터 로딩 중 오류 발생:", error)
      set({ isLoading: false, error: error as Error })
    }
  },

  // 알림 읽음 처리
  markAsRead: (id: string) => {
    set(state => ({
      notifications: state.notifications.map(item => 
        item.id === id ? { ...item, isRead: true } : item
      )
    }))
  },

  // 모든 알림 읽음 처리
  markAllAsRead: () => {
    set(state => ({
      notifications: state.notifications.map(item => ({ ...item, isRead: true }))
    }))
  },

  // 알림 삭제
  deleteNotification: (id: string) => {
    set(state => ({
      notifications: state.notifications.filter(item => item.id !== id)
    }))
  },

  // 모든 알림 삭제
  deleteAllNotifications: () => {
    set({ notifications: [] })
  }
})) 