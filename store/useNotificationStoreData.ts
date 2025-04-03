import { InquiryData, InquiryListResponse } from '@/types/api'
import { create } from 'zustand'
import { contentApi } from '@/services/api'
import { QueryClient } from '@tanstack/react-query'
import { bridgeInquiryDataToNotification } from '@/lib/utils/storyNationUtil'
import { useAccountStore } from '@/store/useAccountStore'

// API 응답 타입 임시 정의 (실제 타입은 types/api에 추가 필요)
interface NoticeData {
  content: string; // JSON 문자열: { "body": string, "click": string, "title": string }
  send_type: number;
  create_dt: string;
}

interface NoticeContent {
  body: string;
  click: string;
  title: string;
}

interface NoticeResponse {
  result: {
    err: number;
    msg: string;
  };
  notif: NoticeData[];
}

// 브릿지 함수 임시 정의 (실제 함수는 lib/utils/storyNationUtil에 추가 필요)
function bridgeNoticeDataToNotification(data: NoticeData): NotificationItem {
  // content 문자열을 파싱하여 객체로 변환
  let content: NoticeContent;
  try {
    content = JSON.parse(data.content);
  } catch (error) {
    // 파싱 실패 시 기본값 설정
    content = {
      title: "알림",
      body: "내용을 불러올 수 없습니다.",
      click: "notice"
    };
  }

  // 알림 타입 결정 (기본값 'info')
  const type: NotificationType = 'info';

  // send_type에 따른 읽음 상태 결정
  // send_type이 1이면 새 알림(읽지 않음), 그 외의 값은 읽은 알림으로 처리
  const isRead = data.send_type !== 1;

  return {
    id: data.create_dt, // ID로 생성 날짜 사용
    title: content.title,
    message: content.body,
    type: type,
    isRead: isRead, // send_type 값에 따라 읽음 상태 설정
    date: new Date(data.create_dt),
    sort: 0 // API에서 정렬 값을 제공하지 않으므로 기본값 설정
  };
}

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

// 공지사항 아이템 인터페이스
interface AnnouncementItem {
  id: string
  title: string
  message: string
  isImportant: boolean
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

// 알림 및 공지사항 데이터 스토어
interface NotificationStoreData {
  // 알림 데이터
  notifications: Array<NotificationItem>
  hasNewNotification: boolean

  // 공지사항 데이터
  announcements: Array<AnnouncementItem>
  
  // 공통 상태
  isLoading: boolean
  error: Error | null
  notificationPagination: {
    page: number
    total: number
    hasMore: boolean
  }
  announcementPagination: {
    page: number
    total: number
    hasMore: boolean
  }
  
  // 초기화 함수들
  initialize: () => Promise<void>
  initializeNotifications: () => Promise<void>
  initializeAnnouncements: () => Promise<void>
  
  // 데이터 갱신 함수
  invalidateData: () => Promise<void>
  checkNewNotifications: () => Promise<boolean>
  
  // 알림 관련 함수
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  deleteAllNotifications: () => void
  
  // 페이지네이션 함수
  loadMoreNotifications: () => Promise<void>
  loadMoreAnnouncements: () => Promise<void>
}

export const useNotificationStoreData = create<NotificationStoreData>((set, get) => ({
  notifications: [],
  announcements: [],
  hasNewNotification: false,
  isLoading: false,
  error: null,
  notificationPagination: {
    page: 1,
    total: 0,
    hasMore: false
  },
  announcementPagination: {
    page: 1,
    total: 0,
    hasMore: false
  },

  // 전체 초기 데이터 불러오기
  initialize: async () => {
    try {
      // 로그인 상태 확인
      const isLogin = useAccountStore.getState().isLogin;
      
      // 공지사항 불러오기 (로그인 여부 상관없이)
      await get().initializeAnnouncements();
      
      // 알림은 로그인 했을 때만 초기화 - 이미 최적화된 함수 호출
      if (isLogin) {
        await get().initializeNotifications();
      } else {
        // 로그인하지 않은 경우 알림 데이터 삭제
        set({ 
          notifications: [],
          hasNewNotification: false,
          notificationPagination: {
            page: 1,
            total: 0,
            hasMore: false
          }
        });
      }
    } catch (error) {
      console.error("데이터 초기화 중 오류 발생:", error);
      set({ error: error as Error });
    }
  },
  
  // 알림 데이터 초기화
  initializeNotifications: async () => {
    // 초기화 및 로딩 상태 설정
    set({ 
      isLoading: true, 
      error: null
    });
    
    try {
      // 1. 먼저 새 알림이 있는지 확인
      const newNoticeResponse = await contentApi.NewNotice();
      const hasNewNotifications = newNoticeResponse.data?.new_notif === true;
      
      // 현재 상태 가져오기
      const { notifications } = get();
      const hasExistingData = notifications.length > 0;
      
      // 새 알림 상태 업데이트
      set({ hasNewNotification: hasNewNotifications });
      
      // 2. 새 알림이 있거나 기존 데이터가 없는 경우에만 GetNotice 호출
      if (hasNewNotifications || !hasExistingData) {
        // React Query를 통해 알림 데이터 요청
        const data = await queryClient.fetchQuery({
          queryKey: ['notifications', 1],
          queryFn: async () => {
            // API 호출 시 필요한 경우에만 인자 전달
            const response = await contentApi.GetNotice();
            return response?.data;
          },
          staleTime: 1000 * 60 * 5 // 5분
        });
        
        if (data && data.notif && Array.isArray(data.notif)) {
          // 데이터를 NotificationItem 형식으로 변환
          const notificationItems = data.notif.map((item: NoticeData) => {
            return bridgeNoticeDataToNotification(item);
          });
          
          // 읽지 않은 알림 개수 계산
          const unreadCount = notificationItems.filter((item: NotificationItem) => !item.isRead).length;
          
          // Zustand 스토어 업데이트
          set({ 
            notifications: notificationItems,
            notificationPagination: {
              page: 1,
              total: notificationItems.length,
              hasMore: false // 페이지네이션 정보가 없으므로 false로 설정
            },
            isLoading: false
          });
        } else {
          set({ 
            notifications: [],
            isLoading: false 
          });
        }
      } else {
        // 3. 새 알림도 없고 기존 데이터가 있으면 기존 데이터 유지
        set({ isLoading: false });
        console.log("새 알림이 없고 기존 데이터가 있어 API 호출을 생략합니다.");
      }
    } catch (error) {
      console.error("알림 데이터 로딩 중 오류 발생:", error);
      set({ isLoading: false, error: error as Error });
    }
  },

  // 공지사항 데이터 초기화
  initializeAnnouncements: async () => {
    // 로딩 상태 설정
    set({ 
      isLoading: true, 
      error: null,
      announcementPagination: {
        page: 1,
        total: 0,
        hasMore: false
      }
    });
    
    try {
      // React Query를 통해 공지사항 데이터 요청
      const data = await queryClient.fetchQuery({
        queryKey: ['announcements', 1],
        queryFn: async () => {
          const response = await contentApi.GetInquiryList(1, 10);
          return response?.data;
        },
        staleTime: 1000 * 60 * 5 // 5분
      });
      
      if (data && data.notice) {
        // 데이터를 AnnouncementItem 형식으로 변환
        const announcementItems = data.notice.data.map((item: InquiryData) => {
          const notification = bridgeInquiryDataToNotification(item);
          return {
            id: notification.id,
            title: notification.title,
            message: notification.message,
            isImportant: notification.type === 'error' || notification.type === 'warning',
            date: notification.date,
            sort: notification.sort
          };
        });
        
        // Zustand 스토어 업데이트
        set({ 
          announcements: announcementItems,
          announcementPagination: {
            page: 1,
            total: data.notice.total || 0,
            hasMore: data.notice.current_page < data.notice.last_page
          },
          isLoading: false
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("공지사항 데이터 로딩 중 오류 발생:", error);
      set({ isLoading: false, error: error as Error });
    }
  },
  
  // 새 알림이 있는지 확인
  checkNewNotifications: async () => {
    try {
      const response = await contentApi.NewNotice();
      // 실제 API 응답의 new_notif 필드로 새 알림 여부 확인
      const hasNew = response.data?.new_notif === true;
      
      set({ hasNewNotification: hasNew });
      return hasNew;
    } catch (error) {
      console.error("새 알림 확인 중 오류 발생:", error);
      return false;
    }
  },
  
  // 데이터를 무효화하고 다시 가져오는 함수
  invalidateData: async () => {
    await queryClient.invalidateQueries({ queryKey: ['notifications'] });
    await queryClient.invalidateQueries({ queryKey: ['announcements'] });
    get().initialize();
  },

  // 더 많은 알림 데이터 로드
  loadMoreNotifications: async () => {
    const { isLoading, notificationPagination, notifications } = get();
    
    // 이미 로딩 중이거나 더 로드할 데이터가 없으면 리턴
    if (isLoading || !notificationPagination.hasMore) return;
    
    // API에 페이지네이션 기능이 없으므로 더 이상 데이터를 가져올 수 없음
    // 현재 구현에서는 이 함수는 실제로 동작하지 않을 것
    console.log("페이지네이션 기능이 없습니다.");
  },

  // 더 많은 공지사항 데이터 로드
  loadMoreAnnouncements: async () => {
    const { isLoading, announcementPagination, announcements } = get();
    
    // 이미 로딩 중이거나 더 로드할 데이터가 없으면 리턴
    if (isLoading || !announcementPagination.hasMore) return;
    
    const nextPage = announcementPagination.page + 1;
    set({ isLoading: true });
    
    try {
      const response = await contentApi.GetInquiryList(nextPage, 10);
      const data = response?.data;
      
      if (data && data.notice) {
        // 새로운 데이터를 AnnouncementItem 형식으로 변환
        const newAnnouncementItems = data.notice.data.map((item: InquiryData) => {
          const notification = bridgeInquiryDataToNotification(item);
          return {
            id: notification.id,
            title: notification.title,
            message: notification.message,
            isImportant: notification.type === 'error' || notification.type === 'warning',
            date: notification.date,
            sort: notification.sort
          };
        });
        
        // 기존 데이터와 병합
        set({
          announcements: [...announcements, ...newAnnouncementItems],
          announcementPagination: {
            page: nextPage,
            total: data.notice.total || 0,
            hasMore: data.notice.current_page < data.notice.last_page
          },
          isLoading: false
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("추가 공지사항 데이터 로딩 중 오류 발생:", error);
      set({ isLoading: false, error: error as Error });
    }
  },

  // 알림 읽음 처리
  markAsRead: async (id: string) => {
    try {
      // 로컬 상태 먼저 업데이트
      set(state => ({
        notifications: state.notifications.map(item => 
          item.id === id ? { ...item, isRead: true } : item
        )
      }));
      
      // 서버에 읽음 상태 전송 (API가 지원하는 경우)
      // await contentApi.MarkNoticeAsRead(id); // 이 API가 존재하는 경우 주석 해제
      
      // 새 알림 상태 다시 확인
      get().checkNewNotifications();
    } catch (error) {
      console.error("알림 읽음 처리 중 오류 발생:", error);
    }
  },

  // 모든 알림 읽음 처리
  markAllAsRead: async () => {
    try {
      // 로컬 상태 먼저 업데이트
      set(state => ({
        notifications: state.notifications.map(item => ({ ...item, isRead: true })),
        hasNewNotification: false
      }));
      
      // 서버에 모든 알림 읽음 상태 전송 (API가 지원하는 경우)
      // await contentApi.MarkAllNoticesAsRead(); // 이 API가 존재하는 경우 주석 해제
      
      // 새 알림 상태 다시 확인
      get().checkNewNotifications();
    } catch (error) {
      console.error("모든 알림 읽음 처리 중 오류 발생:", error);
    }
  },

  // 알림 삭제
  deleteNotification: (id: string) => {
    set(state => ({
      notifications: state.notifications.filter(item => item.id !== id)
    }));
  },

  // 모든 알림 삭제
  deleteAllNotifications: () => {
    set({ notifications: [] });
  }
})) 