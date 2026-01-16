import axios from 'axios';
import { contentApi } from '@/services/api';
import { OAUTH_PROVIDERS, OAuthProvider, OAuthResponse, OAuthState } from '@/types/login';
import { 
  AuthService, 
  LoginParams, 
  CallbackParams, 
  LoginResult, 
  SocialLoginCallbacks,
  ErrorHandler 
} from './types';

import { useAccountStore } from '@/store/useAccountStore'
import { SocialLoginProvider } from './types'

// 리다이렉트 URI 가져오기
const getRedirectUri = () => {
  const callback = process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI || '';
  return typeof window !== 'undefined' ? `${window.location.origin}${callback}` : '';
};

// 네트워크 에러 메시지 매핑
const NETWORK_ERROR_MESSAGES: Record<string, string> = {
  'ECONNABORTED': '서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.',
  'ERR_NETWORK': '인터넷 연결을 확인해주세요.',
  'ERR_BAD_REQUEST': '잘못된 요청입니다. 다시 시도해주세요.',
  'ERR_BAD_RESPONSE': '서버 응답에 문제가 있습니다. 잠시 후 다시 시도해주세요.',
  'ERR_CANCELED': '요청이 취소되었습니다.',
  'ERR_TIMEOUT': '요청 시간이 초과되었습니다. 다시 시도해주세요.',
  'ERR_SERVER': '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
};

// 팝업 창 크기 및 위치 계산 함수
export const calculatePopupPosition = () => {
  const width = 500;
  const height = 700;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;
  return { width, height, left, top };
};

// 네트워크 에러 처리 함수
export const handleNetworkError: ErrorHandler = (error) => {
  if (axios.isAxiosError(error)) {
    const errorCode = error.code || 'ERR_SERVER';
    const status = error.response?.status;
    
    // HTTP 상태 코드별 메시지
    if (status) {
      switch (status) {
        case 400:
          return '잘못된 요청입니다. 입력값을 확인해주세요.';
        case 401:
          return '인증이 필요합니다. 다시 로그인해주세요.';
        case 403:
          return '접근 권한이 없습니다.';
        case 404:
          return '요청한 리소스를 찾을 수 없습니다.';
        case 429:
          return '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.';
        case 500:
          return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        default:
          return NETWORK_ERROR_MESSAGES[errorCode] || '알 수 없는 오류가 발생했습니다.';
      }
    }
    
    return NETWORK_ERROR_MESSAGES[errorCode] || '알 수 없는 오류가 발생했습니다.';
  }
  
  return '알 수 없는 오류가 발생했습니다.';
};

// 기본 인증 서비스 클래스
export abstract class BaseAuthService implements AuthService {
  readonly name: string;
  protected provider: OAuthProvider;
  protected redirectUri: string;
  initialized: boolean = false;
  
  constructor(provider: OAuthProvider) {
    this.provider = provider;
    this.name = provider;
    this.redirectUri = getRedirectUri();
  }
  
  // 초기화 함수
  public async init(): Promise<void> {
    // 필요한 경우 자식 클래스에서 오버라이드
  }
  
  // 로그인 함수 (자식 클래스에서 구현)
  public abstract login(params: LoginParams, callbacks: SocialLoginCallbacks): Promise<LoginResult>;
  
  // 콜백 처리 함수 (자식 클래스에서 구현)
  public abstract handleCallback(params: CallbackParams): Promise<LoginResult>;
  
  // 유틸리티 메소드: 팝업 창 열기
  protected openPopup(url: string, title: string): Window | null {
    const { width, height, left, top } = calculatePopupPosition();
    return window.open(
      url,
      title,
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  }
  
  // 유틸리티 메소드: URL 쿼리 파라미터 생성
  protected createQueryParams(params: Record<string, string>): string {
    return Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
  }
  
  // 유틸리티 메소드: 액세스 토큰 요청
  protected async getAccessToken(code: string, clientId: string): Promise<OAuthResponse> {
    const config = OAUTH_PROVIDERS[this.provider];
    if (!config) throw new Error('지원하지 않는 로그인 방식입니다.');

    try {
      const response = await axios.post(
        config.endpoints.RENEWAL_URL,
        new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: clientId,
          redirect_uri: this.redirectUri,
          code: code
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('액세스 토큰 요청 중 오류 발생:', error);
      throw error;
    }
  }
  
  // 유틸리티 메소드: 토큰 검증
  protected async verifyToken(accessToken: string): Promise<boolean> {
    const config = OAUTH_PROVIDERS[this.provider];
    if (!config) throw new Error('지원하지 않는 로그인 방식입니다.');
    
    if (!config.endpoints.CHECK_TOKEN_URL) {
      return true; // 검증 URL이 없으면 유효하다고 간주
    }

    try {
      const response = await axios.get(config.endpoints.CHECK_TOKEN_URL, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      return response.status === 200;
    } catch (error) {
      console.error('토큰 검증 중 오류 발생:', error);
      return false;
    }
  }
  
  // 공통 로그인 처리 로직
  protected async processLogin(tokenResponse: OAuthResponse, params: LoginParams): Promise<LoginResult> {
    try {
      const { loginType, isLogin } = useAccountStore.getState()

      const accessToken = params.snstype === 4 ? tokenResponse.id_token : tokenResponse.access_token;
      const idToken = params.snstype === 4 ? tokenResponse.access_token : '';

      // 로그인 처리
      const response = await contentApi.loginDcheckV2(
        params.snsauth, 
        params.snstype, 
        accessToken || '',
        idToken || '',
      );

      if (response.data.result.err === 0) {

        // 기존 회원
        const { snsid, user_all } = response.data;
        const kr_gb = user_all[0].kr_gb;

        const isGuestLogin = loginType === 'Guest' as SocialLoginProvider && isLogin
        
        // Guest 로그인이 되어있고, 소셜 계정이 있으면 팝업 //
        if(isGuestLogin) {

          localStorage.setItem('duplicate_login_data', JSON.stringify({
            snstype: params.snstype,
            snsauth: params.snsauth,
            snsid: snsid,
            kr_gb: String(kr_gb),
          }));

          return {
            success: false,
            isDuplicateLogin: true,
            error: '선택'
          }
        }

        // 로그인 처리
        const loginResponse = await contentApi.login2(
          params.snsauth, 
          params.snstype, 
          snsid, 
          String(kr_gb),
        );

        // 로그인 상태 저장
        return {
          success: true,
          data: loginResponse.data
        };
      } else {
        // 신규 회원
        const { snsid, token } = response.data;
        
        // 회원가입에 필요한 데이터 저장
        localStorage.setItem('signup_data', JSON.stringify({
          snstype: params.snstype,
          snsauth: params.snsauth,
          snsid,
          accessToken: token
        }));
        
        // 회원가입 필요 알림
        return {
          success: false,
          signupRequired: true,
          needSignup: true,
          error: '회원가입이 필요합니다.'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      };
    }
  }
} 