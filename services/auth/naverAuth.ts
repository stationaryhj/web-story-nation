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

// 네이버 콜백 URL 파싱 함수
function parseNaverCallback(callbackUrl: string) {
  console.log('파싱할 URL:', callbackUrl);

  // code 파라미터 추출
  const codeMatch = callbackUrl.match(/code=([^&]+)/);
  const code = codeMatch ? codeMatch[1] : null;
  console.log('추출된 code:', code);
  
  // state 파라미터 추출 - code 이후의 &state= 다음 텍스트
  const stateStart = callbackUrl.indexOf('&state=') + 7; // '&state='.length
  
  if (stateStart > 6) { // state 파라미터가 발견된 경우
    // 원본 state 문자열 (인코딩된 상태)
    const encodedStateStr = callbackUrl.substring(stateStart);
    console.log('인코딩된 state:', encodedStateStr);
    
    // HTML 엔티티 디코딩 (&quot; -> " 등)
    let decodedStateStr;
    try {
      decodedStateStr = he.decode(encodedStateStr);
      console.log('HTML 엔티티 디코딩된 state:', decodedStateStr);
    } catch (error) {
      console.error('HTML 엔티티 디코딩 실패:', error);
      decodedStateStr = encodedStateStr;
    }
    
    // URL 디코딩
    try {
      decodedStateStr = decodeURIComponent(decodedStateStr);
      console.log('URL 디코딩된 state:', decodedStateStr);
    } catch (error) {
      console.error('URL 디코딩 실패:', error);
    }
    
    // 1. JSON 파싱 시도
    try {
      // 잘린 JSON을 복구하려고 시도 (끝에 }가 없는 경우)
      if (decodedStateStr.includes('{') && !decodedStateStr.includes('}')) {
        decodedStateStr += '"}}'
      }
      
      const stateObj = JSON.parse(decodedStateStr);
      console.log('JSON 파싱 성공:', stateObj);
      return {
        code,
        state: stateObj
      };
    } catch (e) {
      console.error('JSON 파싱 오류:', e);
      
      // 2. 정규식으로 개별 필드 추출 시도
      const providerMatch = decodedStateStr.match(/"provider"[\s]*:[\s]*"([^"]+)"/);
      const snsauthMatch = decodedStateStr.match(/"snsauth"[\s]*:[\s]*"([^"]+)"/);
      const clientIdMatch = decodedStateStr.match(/"clientId"[\s]*:[\s]*"([^"]+)"/);
      const snstypeMatch = decodedStateStr.match(/"snstype"[\s]*:[\s]*(\d+)/);
      
      const extractedState = {
        provider: providerMatch ? providerMatch[1] : 'NAVER',
        snsauth: snsauthMatch ? snsauthMatch[1] : null,
        clientId: clientIdMatch ? clientIdMatch[1] : null,
        snstype: snstypeMatch ? parseInt(snstypeMatch[1]) : 0
      };
      
      console.log('정규식으로 추출된 state:', extractedState);
      
      // 추출 실패 시 하드코딩된 값 사용 (마지막 수단)
      if (!extractedState.snsauth || !extractedState.clientId) {
        // 로컬 스토리지에서 정보 가져오기 시도
        try {
          const savedState = localStorage.getItem('social_login_state');
          if (savedState) {
            const savedStateObj = JSON.parse(savedState);
            extractedState.snsauth = extractedState.snsauth || savedStateObj.snsauth;
            extractedState.clientId = extractedState.clientId || savedStateObj.clientId;
            extractedState.snstype = extractedState.snstype || savedStateObj.snstype;
            console.log('로컬 스토리지에서 복구한 state:', extractedState);
          }
        } catch (error) {
          console.error('로컬 스토리지 복구 실패:', error);
        }
      }
      
      return {
        code,
        state: extractedState
      };
    }
  }
  
  return { code, state: null };
}

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
    console.log('네이버 콜백 처리 시작 ::', params);

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
      console.log('네이버 콜백 처리 시작 - 상세 ::', params);
      
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

      // 파싱된 상태 정보 추출
      let stateInfo: any = null;
      
      // 1. params.state에서 파싱 시도
      try {
        if (typeof params.state === 'string') {
          // state 값이 잘렸는지 확인
          const isTruncated = 
            params.state.includes('{') && 
            !params.state.includes('}') && 
            params.state.includes('&quot;');
          
          if (isTruncated) {
            console.log('잘린 state 문자열 감지');
            
            // HTML 엔티티 디코딩
            const decodedState = he.decode(params.state);
            console.log('디코딩된 state:', decodedState);
            
            // 필드 추출
            const providerMatch = decodedState.match(/"provider"[\s]*:[\s]*"([^"]+)"/);
            const snsauthMatch = decodedState.match(/"snsauth"[\s]*:[\s]*"([^"]+)"/);
            const clientIdMatch = decodedState.match(/"clientId"[\s]*:[\s]*"([^"]+)"/);
            const snstypeMatch = decodedState.match(/"snstype"[\s]*:[\s]*(\d+)/);
            
            stateInfo = {
              provider: providerMatch ? providerMatch[1] : 'NAVER',
              snsauth: snsauthMatch ? snsauthMatch[1] : null,
              clientId: clientIdMatch ? clientIdMatch[1] : null,
              snstype: snstypeMatch ? parseInt(snstypeMatch[1]) : null
            };
            
            console.log('정규식으로 추출된 stateInfo:', stateInfo);
          } else {
            // 정상적인 state 문자열 파싱 시도
            stateInfo = JSON.parse(params.state);
            console.log('정상 파싱된 stateInfo:', stateInfo);
          }
        } else if (params.state && typeof params.state === 'object') {
          // 이미 객체인 경우 그대로 사용
          stateInfo = params.state;
          console.log('객체 형태의 stateInfo:', stateInfo);
        }
      } catch (e) {
        console.error('state 파싱 실패:', e);
      }
      
      // 2. params.state에서 파싱에 실패한 경우 localStorage에서 복구
      if (!stateInfo || !stateInfo.snsauth || !stateInfo.clientId) {
        console.log('localStorage에서 state 복구 시도');
        try {
          stateInfo = JSON.parse(savedState);
          console.log('localStorage에서 복구된 stateInfo:', stateInfo);
        } catch (e) {
          console.error('localStorage 파싱 실패:', e);
          throw new Error('저장된 로그인 정보 형식이 올바르지 않습니다.');
        }
      }
      
      // 필수 정보 확인
      const { clientId, snsauth, snstype } = stateInfo;
      
      if (!clientId || !snsauth || snstype === undefined) {
        throw new Error('필수 로그인 정보가 없습니다. 다시 로그인해주세요.');
      }
      
      console.log('네이버 OAuth 정보:', { snsauth, snstype });

      console.log('params.code :: ', params.code)
      console.log('stateInfo :: ', JSON.stringify(stateInfo))
      
      // 백엔드 API를 통해 액세스 토큰 획득
      const tokenResponse = await contentApi.GetNaverToken(params.code || '', JSON.stringify(stateInfo));
      
      // 응답 유효성 검사
      if (!tokenResponse.data || tokenResponse.data.result?.err !== 0) {
        console.error('네이버 토큰 요청 실패:', tokenResponse.data);
        throw new Error('네이버 인증 처리 중 오류가 발생했습니다.');
      }
      
      // response 필드는 문자열로 된 JSON이므로 파싱 필요
      let accessToken;
      try {
        const responseData = JSON.parse(tokenResponse.data.response);
        accessToken = responseData.access_token;
        
        if (!accessToken) {
          throw new Error('액세스 토큰이 없습니다');
        }
      } catch (error) {
        console.error('네이버 토큰 응답 파싱 실패:', error);
        console.error('원본 응답:', tokenResponse.data.response);
        throw new Error('네이버 인증 응답을 처리할 수 없습니다.');
      }
      
      console.log('네이버 액세스 토큰 획득 성공');
      
      // 토큰 검증 (주석 해제 여부는 개발자 판단에 맡김)
    //   const isValid = await this.verifyNaverToken(accessToken);
    //   if (!isValid) {
    //     throw new Error('네이버 액세스 토큰 검증 실패');
    //   }
      
      // 로그인 처리
      const response = await contentApi.loginDcheckV2(snsauth, snstype, accessToken, '');
      
      if (response.data.result.err === 0) {
        // 기존 회원
        const { snsid, user_all } = response.data;
        const kr_gb = user_all[0].kr_gb;
        
        // 로그인 처리
        const loginResponse = await contentApi.login2(snsauth, Number(snstype), snsid, String(kr_gb));
        
        // 임시 데이터 삭제
        localStorage.removeItem('naver_login_timeout');
        // localStorage.removeItem('social_login_state');
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