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
import he from 'he';

// 네이버 인증 서비스
export class NaverAuthService extends BaseAuthService {
  constructor() {
    super('NAVER');
  }

  // 초기화 메소드 - REST API 방식에서는 간단하게 유지
  async init(): Promise<void> {
    // REST API 방식에서는 특별한 초기화가 필요 없음
    this.initialized = true;
  }

  // 네이버 로그인
  async login(params: LoginParams, callbacks: SocialLoginCallbacks): Promise<LoginResult> {
    try {
      // 상태 정보를 단순 객체로 생성하고 문자열화
      const stateStr = JSON.stringify({
        provider: 'NAVER',
        snsauth: params.snsauth,
        clientId: params.clientId,
        snstype: params.snstype
      });
      
      // 로컬 스토리지에 상태 저장
      localStorage.setItem('social_login_state', stateStr);
      localStorage.setItem('social_login_type', 'naver');
      
      // REST API 방식으로 OAuth URL 구성
      const authUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${params.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&state=${encodeURIComponent(stateStr)}`;
      
      // 팝업 창 열기
      const width = 500;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        authUrl,
        'naverLogin',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
      );
      
      if (!popup) {
        throw new Error('팝업 창이 차단되었습니다. 팝업 차단을 해제해주세요.');
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
    // 중복 호출 방지를 위한 처리 상태 확인
    const callbackProcessing = localStorage.getItem('naver_callback_processing');
    if (callbackProcessing === 'true') {
      console.log('네이버 콜백 처리가 이미 진행 중입니다.');
      return {
        success: false,
        error: '처리 중입니다. 잠시만 기다려주세요.'
      };
    }
    
    // 처리 상태 플래그 설정
    localStorage.setItem('naver_callback_processing', 'true');
    
    try {
      console.log('네이버 콜백 처리 시작 ::', params);
      
      // 타임아웃 클리어
      const timeoutId = localStorage.getItem('naver_login_timeout');
      if (timeoutId) {
        clearTimeout(parseInt(timeoutId));
        localStorage.removeItem('naver_login_timeout');
      }

      // 로컬 스토리지에서 state 정보 가져오기
      const savedState = localStorage.getItem('social_login_state');
      if (!savedState) {
        throw new Error('저장된 로그인 정보가 없습니다. 다시 로그인해주세요.');
      }
      
      // callback에서 전달된 state가 HTML entity로 인코딩되어 있는 경우 처리
      let state = params.state;
      if (state && state.includes('&quot;')) {
        try {
          // HTML entity 디코딩 (예: &quot; -> ")
          state = he.decode(state);
          console.log('he로 디코딩된 state:', state);
        } catch (decodeError) {
          console.error('he 디코딩 오류:', decodeError);
        }
      }
      
      // 상태 정보 파싱
      const { clientId, snsauth, snstype } = JSON.parse(savedState);
      
      console.log('네이버 OAuth 정보:', { snsauth, snstype });
      
      // 백엔드 API를 통해 액세스 토큰 획득
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
        localStorage.removeItem('social_login_state');
        localStorage.removeItem('social_login_type');
        localStorage.removeItem('naver_callback_processing'); // 처리 상태 플래그 제거
        
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
        localStorage.removeItem('naver_callback_processing'); // 처리 상태 플래그 제거
        
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
      localStorage.removeItem('naver_callback_processing'); // 처리 상태 플래그 제거
      
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