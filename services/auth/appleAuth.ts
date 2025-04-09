import { OAUTH_PROVIDERS, OAuthProvider, OAuthState } from '@/types/login';
import { BaseAuthService } from './baseAuth';
import { 
  LoginParams, 
  CallbackParams, 
  LoginResult,
  SocialLoginCallbacks
} from './types';
import { contentApi } from '../api/storyNationApi';

// 'JWT' 타입 정의
interface AppleJwtPayload {
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: {
    firstName?: string;
    lastName?: string;
  };
}

// Apple 인증 서비스
export class AppleAuthService extends BaseAuthService {
  constructor() {
    super('APPLE');
  }

  // SDK 초기화
  async init(): Promise<void> {
    if (!this.initialized) {
      this.initialized = true;
    }
  }

  // Apple 로그인
  async login(params: LoginParams, callbacks: SocialLoginCallbacks): Promise<LoginResult> {
    try {
      const providerConfig = OAUTH_PROVIDERS[params.provider.toUpperCase() as OAuthProvider]
      
      console.log('애플 로그인 시작');

      // 난수 생성 - 상태 확인용 (Apple은 CSRF 방지에 더 엄격)
      const nonceValue = this.generateNonce();
      
      // 상태 정보를 단순 객체로 생성하고 문자열화
      const stateStr = JSON.stringify({
        provider: 'APPLE',
        // snsauth: params.snsauth,
        // clientId: params.clientId,
        // snstype: params.snstype,
        // nonce: nonceValue
      });

      // 로컬 스토리지에 정보 저장
      localStorage.setItem('apple_auth_nonce', nonceValue);
    //   localStorage.setItem('social_login_state', stateStr);
      localStorage.setItem('social_login_type', 'apple');

      console.log('애플 로그인 정보 설정:', { 
        clientId: params.clientId, 
        snsauth: params.snsauth, 
        snstype: params.snstype 
      });

      const queryParams = new URLSearchParams({
        client_id: params.clientId,
        redirect_uri: this.redirectUri,     // 변경해야함
        response_type: 'code',
        state: stateStr,
      });

      // 로그인 URL 생성
      const authUrl = `${providerConfig.endpoints.OAUTH_URL}?${queryParams.toString()}`;
      console.log('애플 로그인 URL 생성:', authUrl);

      // 팝업 창 열기
      const popup = this.openPopup(authUrl, 'Apple Login');
      
      if (!popup) {
        throw new Error('팝업 창이 차단되었습니다. 팝업 차단을 해제해주세요.');
      }

      // 팝업 모니터링 설정
      const checkPopupClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopupClosed);
          console.log('애플 로그인 팝업이 닫혔습니다.');
          
          // 팝업이 닫혔을 때 처리 중인지 확인
          const processing = localStorage.getItem('apple_callback_processing');
          if (processing !== 'true') {
            console.log('애플 로그인 팝업이 닫혔지만 콜백이 처리되지 않았습니다.');
            // 콜백이 처리되지 않은 경우 (사용자가 취소하거나 오류 발생)
            localStorage.removeItem('apple_callback_processing');
          }
        }
      }, 1000);

      // 콜백에서 처리되므로 여기서는 진행 중임을 알림
      return {
        success: false,
        error: '애플 로그인이 진행 중입니다. 로그인 창에서 인증을 완료해주세요.'
      };
    } catch (error) {
      console.error('애플 로그인 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '애플 로그인 중 오류가 발생했습니다.'
      };
    }
  }

  // Apple 콜백 처리 (특별한 처리 필요)
  async handleCallback(params: CallbackParams): Promise<LoginResult> {
    console.log('애플 콜백 처리 시작: ', params);
    
    // 중복 호출 방지를 위한 처리 상태 확인
    const callbackProcessing = localStorage.getItem('apple_callback_processing');
    if (callbackProcessing === 'true') {
      console.log('애플 콜백 처리가 이미 진행 중입니다.');
      return {
        success: false,
        error: '처리 중입니다. 잠시만 기다려주세요.'
      };
    }
    
    // 처리 상태 플래그 설정
    localStorage.setItem('apple_callback_processing', 'true');
    
    try {
      console.log('애플 로그인 콜백 처리 시작');

      // 오류 처리
      if (params.error) {
        throw new Error(`애플 로그인 오류: ${params.error}`);
      }

      // 필수 파라미터 확인
      if (!params.code) {
        throw new Error('인증 코드가 없습니다.');
      }

      // Apple은 id_token도 함께 받습니다
    //   const idToken = (params as any).id_token;
    //   if (!idToken) {
    //     console.warn('ID 토큰이 없습니다. 사용자 정보가 제한될 수 있습니다.');
    //   } else {
    //     console.log('Apple ID 토큰 확인됨: ', idToken.substring(0, 20) + '...');
    //   }

      // 상태 정보 확인
      let stateData: Record<string, any> = {};
      if (params.state) {
        try {
          // 타입 변환
          const stateStr = typeof params.state === 'string' 
            ? params.state 
            : JSON.stringify(params.state);
          console.log('애플 콜백 상태 문자열: ', stateStr);
          stateData = JSON.parse(stateStr);
        } catch (e) {
          console.error('상태 정보 파싱 오류:', e);
        }
      }
      
      // 로그인 상태 정보 가져오기 (파싱 실패 또는 상태 정보가 없을 경우)
    //   if (!stateData || Object.keys(stateData).length === 0) {
    //     const savedState = localStorage.getItem('social_login_state');
    //     console.log('저장된 소셜 로그인 상태: ', savedState);
    //     if (!savedState) {
    //       throw new Error('저장된 로그인 정보가 없습니다. 다시 로그인해주세요.');
    //     }
    //     try {
    //       stateData = JSON.parse(savedState) as Record<string, any>;
    //       console.log('저장된 상태에서 복구된 데이터: ', stateData);
    //     } catch (e) {
    //       console.error('저장된 상태 정보 파싱 오류:', e);
    //       throw new Error('저장된 로그인 정보가 올바르지 않습니다. 다시 로그인해주세요.');
    //     }
    //   }

      // nonce 검증 (선택적)
    //   if (idToken && stateData.nonce) {
    //     const savedNonce = localStorage.getItem('apple_auth_nonce');
    //     if (savedNonce !== stateData.nonce) {
    //       console.warn('nonce 불일치: 보안 위험 가능성 있음');
    //     }
    //   }

      // 필수 정보 확인
    //   const { clientId, snsauth, snstype } = stateData;
    //   console.log('애플 로그인 필수 정보: ', { clientId, snsauth, snstype });

    //   if (!clientId || !snsauth || snstype === undefined) {
    //     console.error('필수 로그인 정보 누락: ', { clientId, snsauth, snstype });
    //     throw new Error('필수 로그인 정보가 누락되었습니다. 다시 로그인해주세요.');
    //   }

      // id_token에서 사용자 정보 추출 (첫 로그인 시 필요)
    //   let userInfo: Partial<AppleJwtPayload> = {};
    //   if (idToken) {
    //     try {
    //       userInfo = this.parseJwt(idToken);
    //       console.log('JWT에서 파싱된 사용자 정보: ', {
    //         sub: userInfo.sub,
    //         email: userInfo.email,
    //         hasName: !!userInfo.name
    //       });
          
    //       // 사용자 정보가 있으면 로컬 스토리지에 저장 (재인증 시 필요)
    //       if (userInfo.sub) {
    //         localStorage.setItem(`apple_user_${userInfo.sub}`, JSON.stringify({
    //           email: userInfo.email,
    //           name: userInfo.name
    //         }));
    //       }
    //     } catch (e) {
    //       console.error('ID 토큰 파싱 오류:', e);
    //     }
    //   }

      // 액세스 토큰 요청
      const tokenResponse = await contentApi.GetAppleToken(params.code, this.redirectUri);
      if (!tokenResponse.data || tokenResponse.data.result?.err !== 0) {
        console.error('애플 토큰 요청 실패:', tokenResponse.data);
        throw new Error('애플 인증 처리 중 오류가 발생했습니다.');
      }

      let accessToken;
      try {
        const responseData = JSON.parse(tokenResponse.data.response);
        accessToken = responseData;
        
        if (!accessToken) {
          throw new Error('액세스 토큰이 없습니다');
        }
      } catch (error) {
        console.error('애플 토큰 응답 파싱 실패:', error);
        console.error('원본 응답:', tokenResponse.data.response);
        throw new Error('구글 인증 응답을 처리할 수 없습니다.');
      }
      
      console.log('애플 액세스 토큰 획득 성공 :: ', accessToken);
      
      const socialLoginState = JSON.parse(localStorage.getItem('social_login_state') || '{}');
      console.log('애플 로그인 저장된 상태: ', socialLoginState);

      if (!socialLoginState) {
        throw new Error('저장된 로그인 정보가 없습니다. 다시 로그인해주세요.');
      }

      // 로그인 처리
      const loginParams: LoginParams = {
        provider: 'APPLE',
        clientId: socialLoginState.clientId,
        snsauth: socialLoginState.snsauth,
        snstype: socialLoginState.snstype
      };

      console.log('애플 로그인 파라미터: ', loginParams);

      // 공통 로그인 처리 로직 호출
      const result = await this.processLogin(accessToken, loginParams);
      
      // 회원가입 필요 시 signupRequired 플래그 명시적 설정
      if (!result.success && result.error?.includes('회원가입이 필요합니다')) {
        result.signupRequired = true;
        
        // 사용자 정보가 있으면 회원가입 데이터에 추가
        // if (userInfo.email || userInfo.name) {
        //   const signupData = JSON.parse(localStorage.getItem('signup_data') || '{}');
        //   signupData.userInfo = userInfo;
        //   localStorage.setItem('signup_data', JSON.stringify(signupData));
        //   console.log('회원가입 데이터에 사용자 정보 추가됨');
        // }
      }
      
      // 처리 상태 플래그 제거
      localStorage.removeItem('apple_callback_processing');
      localStorage.removeItem('apple_auth_nonce');

      return result;
    } catch (error) {
      // 처리 상태 플래그 제거
      localStorage.removeItem('apple_callback_processing');
      localStorage.removeItem('apple_auth_nonce');
      
      console.error('애플 로그인 콜백 처리 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '애플 로그인 콜백 처리 중 오류가 발생했습니다.'
      };
    }
  }

  // 유틸리티: JWT 토큰 파싱
//   private parseJwt(token: string): AppleJwtPayload {
//     try {
//       const base64Url = token.split('.')[1];
//       const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//       const jsonPayload = decodeURIComponent(
//         atob(base64).split('').map(c => {
//           return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
//         }).join('')
//       );
//       return JSON.parse(jsonPayload);
//     } catch (e) {
//       console.error('JWT 파싱 오류:', e);
//       return {} as AppleJwtPayload;
//     }
//   }

  // 유틸리티: nonce 생성 (Apple 인증용)
  private generateNonce(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Apple 특화 토큰 요청 메소드
//   private async getAppleToken(code: string, clientId: string): Promise<any> {
//     try {
//       const params = new URLSearchParams({
//         client_id: clientId,
//         client_secret: this.createClientSecret(clientId),
//         code: code,
//         grant_type: 'authorization_code',
//         redirect_uri: this.redirectUri
//       });

//       const response = await fetch('https://appleid.apple.com/auth/token', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded'
//         },
//         body: params.toString()
//       });

//       const data = await response.json();
//       return data;
//     } catch (error) {
//       console.error('애플 토큰 요청 오류:', error);
//       throw new Error('애플 액세스 토큰을 가져오는데 실패했습니다.');
//     }
//   }

  // Apple 클라이언트 시크릿 생성 (JWT 기반)
  // 참고: 실제 구현에서는 서버에서 처리하는 것이 안전합니다
//   private createClientSecret(clientId: string): string {
//     // 여기서는 서버에서 생성된 클라이언트 시크릿을 사용한다고 가정합니다
//     // 실제 애플리케이션에서는 보안상의 이유로 서버 측에서 처리해야 합니다
//     console.log('Apple 클라이언트 시크릿 요청 - 실제 구현에서는 서버에서 생성해야 합니다');
    
//     // 프론트엔드에서는 이 값을 서버에서 가져오거나, 임시로 하드코딩된 값을 사용할 수 있습니다
//     // return 'server_generated_client_secret';
    
//     // 이 부분은 실제 서비스에서 서버에서 구현해야 함을 알립니다
//     throw new Error('Apple 로그인의 client_secret은 서버에서 생성되어야 합니다. 백엔드 API를 사용하세요.');
//   }
} 