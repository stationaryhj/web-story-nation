import { OAuthProvider, OAuthState, OAuthResponse } from '@/types/login';
import { LoginResponse } from '@/types/api';

// 로그인 결과 타입
export interface LoginResult {
  success: boolean;
  data?: any;
  error?: string;
  signupRequired?: boolean;
  needSignup?: boolean;
  isDuplicateLogin?: boolean;
}

// 소셜 로그인 응답 데이터 타입
export interface SocialLoginResponse {
  snsid: string;
  snsauth: string;
  snstype: number;
  token?: string;
  user_all?: Array<{ kr_gb: string }>;
  result: {
    err: number;
    msg?: string;
  };
}

// 소셜 로그인 유형 
export type SocialLoginProvider = 'NAVER' | 'KAKAO' | 'GOOGLE' | 'APPLE';

// 인증 서비스 인터페이스
export interface AuthService {
  readonly name: string;
  readonly initialized: boolean;
  
  // 초기화
  init(): Promise<void>;
  
  // 로그인
  login(params: LoginParams, callbacks: SocialLoginCallbacks): Promise<LoginResult>;
  
  // 콜백 처리
  handleCallback(params: CallbackParams): Promise<LoginResult>;
}

// 소셜 로그인 파라미터
export interface LoginParams {
  provider: SocialLoginProvider;
  clientId: string;
  redirectUri?: string;
  snsauth: string;
  snstype: number;
}

// 콜백 파라미터
export interface CallbackParams {
  code: string;
  state?: string;
  error?: string;
}

// 공통 SDK 로그인 파라미터
export interface SDKLoginParams {
  clientId: string;
  callbackUrl: string;
}

// 에러 처리 유틸리티 타입
export type ErrorHandler = (error: any) => string;

// 소셜 로그인 콜백 함수들
export interface SocialLoginCallbacks {
  onSuccess?: (data: any) => void;
  onFailure?: (error: string) => void;
  onSignupRequired?: () => void;
  onLoginTimeout?: () => void;
} 