import { OAuthProvider, OAuthState, OAuthResponse } from '@/types/login';
import { LoginResponse } from '@/types/api';

// 로그인 결과 타입
export interface LoginResult {
  success: boolean;
  data?: LoginResponse;
  redirectUrl?: string;
  needSignup?: boolean;
  error?: string;
  signupRequired?: boolean;
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

// 소셜 로그인 콜백 핸들러 타입
export interface SocialLoginCallbacks {
  onSignupRequired?: () => void;
  onLoginSuccess?: () => void;
}

// 로그인 서비스 인터페이스
export interface AuthServiceInterface {
  init(): Promise<void>;
  login(params: LoginParams, callbacks?: SocialLoginCallbacks): Promise<LoginResult>;
  handleCallback(params: CallbackParams, callbacks?: SocialLoginCallbacks): Promise<LoginResult>;
}

// 로그인 파라미터 타입
export interface LoginParams {
  provider: OAuthProvider;
  clientId: string;
  snsauth: string;
  snstype: number;
}

// 콜백 파라미터 타입
export interface CallbackParams {
  code: string;
  accessToken?: string;
  state?: OAuthState;
  error?: string;
}

// 공통 SDK 로그인 파라미터
export interface SDKLoginParams {
  clientId: string;
  callbackUrl: string;
}

// 에러 처리 유틸리티 타입
export type ErrorHandler = (error: any) => string; 