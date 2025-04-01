import { NaverAuthService } from './naverAuth';
import { KakaoAuthService } from './kakaoAuth';
import { OAuthProvider, OAUTH_PROVIDERS } from '@/types/login';
import { LoginParams, CallbackParams, SocialLoginCallbacks, LoginResult } from './types';
import { contentApi } from '@/services/api';

// 네이버 로그인 서비스
const naverAuth = new NaverAuthService();

// 카카오 로그인 서비스
const kakaoAuth = new KakaoAuthService();

// API에서 가져온 소셜 로그인, 문자열로 통일
interface SocialAuthInfo {
  clientId: string;
  snsauth: string;
  uuid: string;
}

// 인증 서비스 관리자
export class AuthManager {
  private initialized = false;
  private socialAuthInfo: Record<OAuthProvider, SocialAuthInfo | null> = {
    NAVER: null,
    KAKAO: null,
    GOOGLE: null,
    APPLE: null
  };
  
  // 서비스 초기화
  async init() {
    try {
      // 각 서비스 초기화
      await Promise.all([
        naverAuth.init(),
        kakaoAuth.init()
      ]);
      
      // 소셜 인증 정보 초기화
      this.clearSocialAuthInfo();
      
      this.initialized = true;
    } catch (error) {
      console.error('로그인 서비스 초기화 실패:', error);
    }
  }
  
  // 소셜 인증 정보 초기화
  private clearSocialAuthInfo() {
    Object.keys(this.socialAuthInfo).forEach(key => {
      this.socialAuthInfo[key as OAuthProvider] = null;
    });
  }
  
  // 백엔드에서 소셜 인증 정보 가져오기
  private async getSocialAuthInfoFromBackend(provider: OAuthProvider): Promise<SocialAuthInfo> {
    try {
      // 이미 가져온 정보가 있으면 재사용
      if (this.socialAuthInfo[provider]) {
        return this.socialAuthInfo[provider]!;
      }
      
      // 플랫폼 ID 가져오기 (OAUTH_PROVIDERS에서 정의된 ID 사용)
      const snsTypeId = OAUTH_PROVIDERS[provider].id;
      
      // 백엔드 API 호출하여 소셜 인증 정보 가져오기
      const response = await contentApi.getUuid(snsTypeId);
      
      if (response.data.result.err === 0) {
        // 성공적으로 가져온 소셜 인증 정보 저장
        const authInfo: SocialAuthInfo = {
          clientId: response.data.clientId || '',
          snsauth: response.data.snsauth || '',
          uuid: response.data.uuid || ''
        };
        
        this.socialAuthInfo[provider] = authInfo;
        return authInfo;
      } else {
        throw new Error(`${provider} 인증 정보를 가져오는데 실패했습니다: ${response.data.result.msg}`);
      }
    } catch (error) {
      console.error(`백엔드에서 ${provider} 인증 정보 가져오기 실패:`, error);
      throw error;
    }
  }
  
  // 소셜 로그인
  async socialLogin(
    provider: OAuthProvider,
    callbacks: SocialLoginCallbacks = {}
  ): Promise<LoginResult> {
    try {
      // 초기화 확인
      if (!this.initialized) {
        await this.init();
      }
      
      // 로그인 진행 상태 저장
      localStorage.setItem('social_login_in_progress', '1');
      
      // 백엔드에서 소셜 인증 정보 가져오기
      const authInfo = await this.getSocialAuthInfoFromBackend(provider);
      
      console.log(`${provider} 로그인 시작`, { clientId: authInfo.clientId });
      
      // 플랫폼별 로그인 파라미터
      const params: LoginParams = {
        provider: provider,
        clientId: authInfo.clientId,
        snsauth: authInfo.snsauth || '',
        snstype: OAUTH_PROVIDERS[provider].id
      };
      
      // 로그인 상태 정보 저장
      localStorage.setItem('social_login_state', JSON.stringify({
        provider: provider,
        snsauth: params.snsauth,
        clientId: params.clientId,
        snstype: params.snstype,
        uuid: authInfo.uuid
      }));
      localStorage.setItem('social_login_type', provider.toLowerCase());
      
      // 플랫폼별 로그인 서비스 선택
      let result: LoginResult;
      switch (provider) {
        case 'NAVER':
          console.log('네이버 로그인 서비스 호출');
          result = await naverAuth.login(params, callbacks);
          break;
        case 'KAKAO':
          console.log('카카오 로그인 서비스 호출');
          result = await kakaoAuth.login(params, callbacks);
          break;
        case 'GOOGLE':
        case 'APPLE':
          console.log('아직 지원하지 않는 로그인 방식입니다:', provider);
          return {
            success: false,
            error: `아직 지원하지 않는 로그인 방식입니다: ${provider}`
          };
        default:
          throw new Error('지원하지 않는 로그인 방식입니다.');
      }

      // 로그인 완료 후 인증 정보 초기화 (성공 여부와 상관없이)
      this.clearSocialAuthInfo();
      
      // 팝업이 제대로 열렸으면 로그인 진행 중 상태 유지
      if (!result.success && !result.error?.includes('팝업 창이 차단되었습니다')) {
        return result;
      }
      
      // 오류 발생 시 로그인 진행 상태 제거
      localStorage.removeItem('social_login_in_progress');
      return result;
    } catch (error) {
      // 오류 발생 시 로컬 스토리지 정리 및 인증 정보 초기화
      localStorage.removeItem('social_login_state');
      localStorage.removeItem('social_login_type');
      localStorage.removeItem('social_login_in_progress');
      this.clearSocialAuthInfo();
      
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      };
    }
  }
  
  // 비회원 로그인
  async guestLogin(nickname: string): Promise<LoginResult> {
    try {
      const response = await contentApi.LoginGuest(nickname);
      if (response.data.result.err === 0) {
        return {
          success: true,
          data: response.data
        };
      } else {
        return {
          success: false,
          error: response.data.result.msg || '게스트 로그인에 실패했습니다.'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      };
    }
  }
  
  // 소셜 데이터로 회원가입
  async registerWithSocialData(
    nickname: string, 
    birthdate: string, 
    marketingAgree: boolean
  ): Promise<LoginResult> {
    try {
      // localStorage에서 소셜 로그인 정보 가져오기
      const signupDataStr = localStorage.getItem('signup_data');
      if (!signupDataStr) {
        throw new Error('회원가입 정보가 없습니다. 다시 로그인해주세요.');
      }

      const { snstype, snsauth, snsid, accessToken } = JSON.parse(signupDataStr);

      if (!snstype || !snsauth || !snsid || !accessToken) {
        throw new Error('필수 회원가입 정보가 부족합니다. 다시 로그인해주세요.');
      }

      // 회원가입 API 호출
      const response = await contentApi.register4(
        snsauth,
        Number(snstype),
        snsid,
        nickname,
        birthdate,
        accessToken,
        marketingAgree ? 1 : 0
      );

      if (response.data.result.err === 0) {
        // 회원가입 성공 후 데이터 변경
        const { access_token, nick_nm, snsaccesstoken, token_type } = response.data
        const loginResponse = await contentApi.userinfo2(access_token);
        
        // 모든 임시 데이터 삭제
        localStorage.removeItem('signup_data');
        localStorage.removeItem('social_login_state');
        localStorage.removeItem('social_login_type');
        this.clearSocialAuthInfo();
        
        // 성공 결과 반환 (토큰 정보 포함)
        return {
          success: true,
          data: {
            ...loginResponse.data,
            access_token,
            token_type,
            sns_access_token: snsaccesstoken
          }
        };
      } else {
        // 회원가입 실패
        return {
          success: false,
          error: response.data.result.msg || '회원가입에 실패했습니다.'
        };
      }
    } catch (error) {
      // 오류 시에도 임시 데이터 정리 (선택적)
      // localStorage.removeItem('signup_data');
      
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      };
    }
  }
  
  // 로그아웃
  logout(): void {
    localStorage.removeItem('social_login_state');
    localStorage.removeItem('social_login_type');
    localStorage.removeItem('signup_data');
    localStorage.removeItem('authorization');
    // 소셜 인증 정보 초기화
    this.clearSocialAuthInfo();
  }
  
  // 콜백 처리
  async handleCallback(params: CallbackParams): Promise<LoginResult> {
    try {
      // 로그인 타입 확인
      const loginType = localStorage.getItem('social_login_type');
      if (!loginType) {
        throw new Error('로그인 타입 정보가 없습니다.');
      }
      
      const provider = loginType.toUpperCase() as OAuthProvider;
      console.log('콜백 처리 시작 :: ', provider);
      
      let result: LoginResult;
      
      switch (provider) {
        case 'NAVER':
          result = await naverAuth.handleCallback(params);
          break;
        case 'KAKAO':
          result = await kakaoAuth.handleCallback(params);
          break;
        case 'GOOGLE':
        case 'APPLE':
          return {
            success: false,
            error: `아직 지원하지 않는 로그인 방식입니다: ${provider}`
          };
        default:
          throw new Error('지원하지 않는 로그인 타입입니다.');
      }
      
      // 로그인 성공 시에만 인증 정보와 로컬 스토리지 데이터 초기화
      if (result.success) {
        localStorage.removeItem('social_login_state');
        localStorage.removeItem('social_login_type');
        localStorage.removeItem('social_login_in_progress');
        this.clearSocialAuthInfo();
      } else if (result.signupRequired || result.needSignup) {
        // 회원가입이 필요한 경우 로그인 정보는 유지
        // 인증 정보만 초기화 (메모리 누수 방지)
        localStorage.removeItem('social_login_in_progress');
        this.clearSocialAuthInfo();
      }
      
      return result;
    } catch (error) {
      // 오류 발생 시 로컬 스토리지 정리 및 인증 정보 초기화
      localStorage.removeItem('social_login_state');
      localStorage.removeItem('social_login_type');
      localStorage.removeItem('social_login_in_progress');
      this.clearSocialAuthInfo();
      
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      };
    }
  }
}

// 인증 서비스 싱글톤 인스턴스
export const authService = new AuthManager(); 