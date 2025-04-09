import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent, Analytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// 애널리틱스는 클라이언트 사이드에서만 초기화
let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Auth 초기화
const auth = getAuth(app);

/**
 * 트래킹 이벤트를 기록하는 함수
 * @param eventName 트래킹할 이벤트 이름
 * @param eventParams 이벤트와 함께 전송할 파라미터 (선택 사항)
 * 
 * @example
 * // 기본 이벤트 로깅
 * trackEvent('page_view');
 * 
 * // 파라미터가 있는 이벤트 로깅
 * trackEvent('button_click', { button_name: 'login', source: 'main_page' });
 * 
 * // 사용자 액션 트래킹
 * trackEvent('user_action', { action_type: 'profile_update' });
 */
export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  // 클라이언트 사이드에서만 실행 및 analytics가 초기화된 경우에만 실행
  if (typeof window !== 'undefined' && analytics) {
    logEvent(analytics, eventName, eventParams);
    
    // 개발 모드에서는 콘솔에 로깅 (선택 사항)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] Event: ${eventName}`, eventParams);
    }
  }
};

// 기본 애널리틱스는 자동으로 page_view, first_visit 등의 이벤트를 추적합니다.
// 추가적인 이벤트는 trackEvent 함수를 사용하여 명시적으로 로깅해야 합니다.

export { analytics, auth };
export default app;