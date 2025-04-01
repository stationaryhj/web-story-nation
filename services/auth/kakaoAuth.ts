import { OAUTH_PROVIDERS, OAuthProvider } from '@/types/login';
import { BaseAuthService } from './baseAuth';
import { 
  LoginParams, 
  CallbackParams, 
  LoginResult,
  SocialLoginCallbacks
} from './types';

// 카카오 인증 서비스
export class KakaoAuthService extends BaseAuthService {
  constructor() {
    super('KAKAO');
  }

  // SDK 초기화
  async init(): Promise<void> {
    // SDK는 필요할 때 로드되므로 여기서는 초기화 상태만 체크합니다.
    if (!this.initialized) {
      this.initialized = true;
    }
  }

  // 카카오 로그인
  async login(params: LoginParams, callbacks: SocialLoginCallbacks): Promise<LoginResult> {
    try {
      const providerConfig = OAUTH_PROVIDERS[params.provider.toUpperCase() as OAuthProvider]
      
      console.log('카카오 로그인 시작');

      // 상태 정보를 단순 객체로 생성하고 문자열화
      const stateStr = JSON.stringify({
        provider: 'KAKAO',
        snsauth: params.snsauth,
        clientId: params.clientId,
        snstype: params.snstype
      });

      const queryParams = new URLSearchParams({
        client_id: params.clientId,
        redirect_uri: this.redirectUri,
        response_type: 'code',
        state: stateStr,
        // prompt: 'login'
      })

      // 로그인 URL 생성
      const authUrl = `${providerConfig.endpoints.OAUTH_URL}?${queryParams.toString()}`;

      // 팝업 창 열기
      const popup = this.openPopup(authUrl, 'Kakao Login');
      
      if (!popup) {
        throw new Error('팝업 창이 차단되었습니다. 팝업 차단을 해제해주세요.');
      }

      // 콜백에서 처리되므로 여기서는 진행 중임을 알림
      return {
        success: false,
        error: '카카오 로그인이 진행 중입니다. 로그인 창에서 인증을 완료해주세요.'
      };
    } catch (error) {
      console.error('카카오 로그인 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '카카오 로그인 중 오류가 발생했습니다.'
      };
    }
  }

  // 콜백 처리
  async handleCallback(params: CallbackParams): Promise<LoginResult> {
    try {
      console.log('카카오 로그인 콜백 처리 시작');

      // 오류 처리
      if (params.error) {
        throw new Error(`카카오 로그인 오류: ${params.error}`);
      }

      // 필수 파라미터 확인
      if (!params.code) {
        throw new Error('인증 코드가 없습니다.');
      }

      // 상태 정보 확인
      let stateData: Record<string, any> = {};
      if (params.state) {
        try {
          stateData = JSON.parse(params.state as unknown as string) as Record<string, any>;
        } catch (e) {
          console.error('상태 정보 파싱 오류:', e);
        }
      }
      
      // 로그인 상태 정보 가져오기 (파싱 실패 또는 상태 정보가 없을 경우)
      if (!stateData || Object.keys(stateData).length === 0) {
        const savedState = localStorage.getItem('social_login_state');
        if (!savedState) {
          throw new Error('저장된 로그인 정보가 없습니다. 다시 로그인해주세요.');
        }
        stateData = JSON.parse(savedState) as Record<string, any>;
      }

      // 필수 정보 확인
      const { clientId, snsauth, snstype } = stateData;

      // 액세스 토큰 요청
      const tokenResponse = await this.getAccessToken(params.code, clientId);

      // 로그인 처리
      const loginParams: LoginParams = {
        provider: 'KAKAO',
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
      console.error('카카오 로그인 콜백 처리 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '카카오 로그인 콜백 처리 중 오류가 발생했습니다.'
      };
    }
  }
} 