import axios from 'axios';
import { BaseAuthService } from './baseAuth';
import { 
  LoginParams, 
  CallbackParams, 
  LoginResult,
  SocialLoginCallbacks,
} from './types';

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
        console.log('네이버 SDK가 로드되지 않았습니다. 인증 시 자동으로 로드됩니다.');
        return;
      }

      console.log('네이버 SDK 초기화 완료');
      this.initialized = true;
    } catch (error) {
      console.error('네이버 로그인 SDK 초기화 오류:', error);
    }
  }

  // 네이버 로그인
  async login(params: LoginParams, callbacks: SocialLoginCallbacks): Promise<LoginResult> {
    try {
      console.log('네이버 로그인 시작');

      // SDK가 로드되었는지 확인
      if (!window.naver || !window.naver.LoginWithNaverId) {
        throw new Error('네이버 로그인 SDK가 로드되지 않았습니다.');
      }

      // 네이버 로그인 인스턴스 생성
      this.naverLogin = new window.naver.LoginWithNaverId({
        clientId: params.clientId,
        callbackUrl: this.redirectUri,
        isPopup: true,
        loginButton: { color: 'green', type: 3, height: 60 }
      });

      // 팝업 방식으로 로그인 창 열기
      this.naverLogin.authorize();

      // 콜백에서 처리되므로 여기서는 진행 중임을 알림
      return {
        success: false,
        error: '네이버 로그인이 진행 중입니다. 로그인 창에서 인증을 완료해주세요.'
      };
    } catch (error) {
      console.error('네이버 로그인 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '네이버 로그인 중 오류가 발생했습니다.'
      };
    }
  }

  // 콜백 처리
  async handleCallback(params: CallbackParams): Promise<LoginResult> {
    try {
      console.log('네이버 로그인 콜백 처리 시작');

      // 오류 처리
      if (params.error) {
        throw new Error(`네이버 로그인 오류: ${params.error}`);
      }

      // 필수 파라미터 확인
      if (!params.code) {
        throw new Error('인증 코드가 없습니다.');
      }

      // 로그인 상태 정보 가져오기
      const savedState = localStorage.getItem('social_login_state');
      if (!savedState) {
        throw new Error('저장된 로그인 정보가 없습니다. 다시 로그인해주세요.');
      }

      // 상태 정보 파싱
      const { clientId, snsauth, snstype } = JSON.parse(savedState);

      // 액세스 토큰 요청
      const tokenResponse = await this.getAccessToken(params.code, clientId);

      // 로그인 처리
      const loginParams: LoginParams = {
        provider: 'NAVER',
        clientId,
        snsauth,
        snstype
      };

      // 공통 로그인 처리 로직 호출
      const result = await this.processLogin(tokenResponse, loginParams);

      // 성공적으로 처리되면 임시 데이터 삭제
      if (result.success) {
        localStorage.removeItem('social_login_state');
      }

      return result;
    } catch (error) {
      console.error('네이버 로그인 콜백 처리 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '네이버 로그인 콜백 처리 중 오류가 발생했습니다.'
      };
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