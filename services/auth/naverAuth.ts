import axios from 'axios';
import { BaseAuthService } from './baseAuth';
import { 
  LoginParams, 
  CallbackParams, 
  LoginResult,
  SocialLoginCallbacks,
} from './types';
import { contentApi } from '@/services/api';
import { OAuthResponse } from '@/types/login';

// 네이버 SDK 타입 정의
declare global {
  interface Window {
    naver: {
      LoginWithNaverId: {
        new(options: any): {
          getLoginStatus(callback: (status: boolean) => void): void;
          authorize(): void;
          logout(): void;
          getAccessToken(): string;
          accessToken: {
            accessToken: string;
            tokenType: string;
          };
          user: {
            id: string;
            email: string;
            name: string;
            nickname: string;
            profileImage: string;
            age: string;
            birthday: string;
            gender: string;
            mobile: string;
            getEmail(): string;
            getName(): string;
            getNickName(): string;
            getProfileImage(): string;
            getBirthday(): string;
            getAge(): string;
            getGender(): string;
            getMobile(): string;
            getId(): string;
          };
        };
      };
    };
  }
}

// 네이버 인증 서비스
export class NaverAuthService extends BaseAuthService {
  private naverLogin: any = null;

  constructor() {
    super('NAVER');
  }

  // SDK 초기화
  async init(): Promise<void> {
    // 이미 초기화되었다면 스킵
    if (this.initialized) {
      return;
    }

    try {
      // SDK 로드 확인
      if (!window.naver || !window.naver.LoginWithNaverId) {
        await this.loadNaverSDK();
        
        // 다시 확인
        if (!window.naver || !window.naver.LoginWithNaverId) {
          console.error('네이버 SDK 로드 실패');
          return;
        }
      }

      console.log('네이버 SDK 초기화 완료');
      this.initialized = true;
    } catch (error) {
      console.error('네이버 로그인 SDK 초기화 오류:', error);
    }
  }

  // SDK 동적 로딩
  private async loadNaverSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.naver && window.naver.LoginWithNaverId) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://static.nid.naver.com/js/naveridlogin_js_sdk_2.0.2.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('네이버 로그인 SDK 로드 실패'));
      document.head.appendChild(script);
    });
  }

  // 네이버 로그인
  async login(params: LoginParams, callbacks: SocialLoginCallbacks): Promise<LoginResult> {
    try {
      // SDK가 로드되었는지 확인
      if (!window.naver || !window.naver.LoginWithNaverId) {
        // SDK 동적 로딩 시도
        await this.loadNaverSDK();
        
        // 다시 확인
        if (!window.naver || !window.naver.LoginWithNaverId) {
          throw new Error('네이버 로그인 SDK를 로드할 수 없습니다.');
        }
      }

      // 상태 정보를 단순 객체로 생성하고 문자열화
      const stateStr = JSON.stringify({
        provider: 'NAVER',
        snsauth: params.snsauth,
        clientId: params.clientId,
        snstype: params.snstype
      });
      
      // 로컬 스토리지에 상태 저장
      localStorage.setItem('naver_login_state', stateStr);
      localStorage.setItem('social_login_state', stateStr);
      localStorage.setItem('social_login_type', 'naver');
      
      console.log('네이버 로그인 시작: 직접 URL로 인증 처리');
      
      // SDK 대신 직접 URL을 구성하여 팝업 띄우기
      const authUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${params.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&state=${encodeURIComponent(stateStr)}`;
      
      // 팝업 크기와 위치 계산
      const width = 500;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      // 팝업 창 열기
      const popup = window.open(
        authUrl,
        'naverLogin',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
      );
      
      // 팝업 창이 차단된 경우
      if (!popup) {
        return {
          success: false,
          error: '팝업 창이 차단되었습니다. 팝업 차단을 해제해주세요.'
        };
      }
      
      // 30초 타임아웃 설정
      const loginTimeout = setTimeout(() => {
        console.log('네이버 로그인 타임아웃 발생');
        if (popup && !popup.closed) {
          popup.close();
        }
        if (callbacks.onLoginTimeout) {
          callbacks.onLoginTimeout();
        }
      }, 30000);
      
      // 로컬 스토리지에 타임아웃 ID 저장
      localStorage.setItem('naver_login_timeout', loginTimeout.toString());

      return {
        success: false,
        error: '네이버 로그인이 진행 중입니다. 인증창에서 로그인을 완료해주세요.'
      };
    } catch (error) {
      console.error('네이버 로그인 시작 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '네이버 로그인 중 오류가 발생했습니다.'
      };
    }
  }

  // 콜백 처리
  async handleCallback(params: CallbackParams): Promise<LoginResult> {
    try {
      // 타임아웃 클리어
      const timeoutId = localStorage.getItem('naver_login_timeout');
      if (timeoutId) {
        clearTimeout(parseInt(timeoutId));
        localStorage.removeItem('naver_login_timeout');
      }
      
      console.log('네이버 콜백 처리 시작 ::', params);

      // 필수 파라미터 확인
      if (!params.code) {
        throw new Error('인증 코드가 없습니다.');
      }

      // 로컬 스토리지에서 저장된 state 정보 가져오기
      const savedState = localStorage.getItem('social_login_state');
      if (!savedState) {
        throw new Error('저장된 로그인 정보가 없습니다. 다시 로그인해주세요.');
      }
      
      // 상태 정보 파싱
      const { clientId, snsauth, snstype } = JSON.parse(savedState);
      
      console.log('네이버 OAuth 정보:', { snsauth, snstype });
      
      // OAuth 액세스 토큰 요청
      const tokenResponse = await this.getAccessToken(params.code, clientId);
      const accessToken = tokenResponse.access_token;
      
      // 토큰 검증
      const isValid = await this.verifyNaverToken(accessToken);
      if (!isValid) {
        throw new Error('네이버 액세스 토큰 검증 실패');
      }
      
      console.log('네이버 액세스 토큰 획득 및 검증 성공');
      
      // 로그인 처리
      const response = await contentApi.loginDcheckV2(snsauth, snstype, accessToken);
      
      if (response.data.result.err === 0) {
        // 기존 회원
        const { snsid, user_all } = response.data;
        const kr_gb = user_all[0].kr_gb;
        
        // 로그인 처리
        const loginResponse = await contentApi.login2(snsauth, Number(snstype), snsid, String(kr_gb));
        
        // 임시 데이터 삭제
        localStorage.removeItem('naver_login_timeout');
        localStorage.removeItem('naver_login_state');
        localStorage.removeItem('social_login_state');
        localStorage.removeItem('social_login_type');
        
        return {
          success: true,
          data: loginResponse.data
        };
      } else {
        // 신규 회원
        const { snsid, token } = response.data;
        
        // 회원가입에 필요한 데이터 저장
        localStorage.setItem('signup_data', JSON.stringify({
          snstype: snstype,
          snsauth: snsauth,
          snsid,
          accessToken: token
        }));
        
        // 임시 데이터 삭제
        localStorage.removeItem('naver_login_timeout');
        
        return {
          success: false,
          signupRequired: true,
          needSignup: true,
          error: '회원가입이 필요합니다.'
        };
      }
    } catch (error) {
      // 오류 발생 시 임시 데이터 정리
      localStorage.removeItem('naver_login_timeout');
      
      console.error('네이버 로그인 콜백 처리 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '네이버 로그인 콜백 처리 중 오류가 발생했습니다.'
      };
    }
  }

  // 액세스 토큰 요청
  protected async getAccessToken(code: string, clientId: string): Promise<OAuthResponse> {
    try {
      const response = await axios.post(
        'https://nid.naver.com/oauth2.0/token',
        null,
        {
          params: {
            grant_type: 'authorization_code',
            client_id: clientId,
            redirect_uri: this.redirectUri,
            code: code
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('네이버 액세스 토큰 요청 오류:', error);
      throw new Error('네이버 액세스 토큰을 가져오는데 실패했습니다.');
    }
  }

  // 네이버 로그인 프로필 검증 (토큰 유효성 확인용)
  private async verifyNaverToken(accessToken: string): Promise<boolean> {
    try {
      await axios.get('https://openapi.naver.com/v1/nid/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      return true;
    } catch (error) {
      console.error('네이버 토큰 검증 실패:', error);
      return false;
    }
  }
} 