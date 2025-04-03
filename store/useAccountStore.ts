import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { LoginResponse, WriterInfoData } from '@/types/api'
import { OAuthProvider, OAuthResponse, OAuthUserInfo } from '@/types/login'
import { OAUTH_PROVIDERS } from '@/types/login'
import { contentApi, createApi } from '@/services/api'
import axios from 'axios'
import { authService } from '@/services/auth'

// 환경 변수에서 리다이렉트 URI 가져오기
const REDIRECT_URI = process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI

if (!REDIRECT_URI) {
  throw new Error('NEXT_PUBLIC_OAUTH_REDIRECT_URI 환경 변수가 설정되지 않았습니다.')
}

interface AccountState {
  isLogin: boolean
  data: LoginResponse | null
  writerInfo: WriterInfoData | null
  loading: boolean
  error: string | null
  isInitialized: boolean
  // Actions
  setLoginState: (isLogin: boolean, data: LoginResponse | null) => void
  guestLogin: (nickname: string) => Promise<boolean>
  socialLogin: (type: OAuthProvider, onSignupRequired?: () => void, onLoginSuccess?: () => void) => Promise<boolean>
  handleCallback: (code: string, state?: string, onSignupRequired?: () => void, onLoginSuccess?: () => void) => Promise<boolean>
  registerWithSocialData: (nickname: string, birthdate: string, marketingAgree: boolean, onSuccess?: () => void) => Promise<boolean>
  logout: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  initialize: () => Promise<void>
  updateAccountData: (coin_free: number, coin_free_dt: number | string, coin_register: number, coin_user: number) => void
  updateNicknameAndCoin: (nick_nm: string, coin_user: number) => void
  setPersona: (persona: string, persona_gender: number) => void
  setWriterInfo: (writerInfo: WriterInfoData | null) => void
  fetchWriterInfo: () => Promise<void>
  updateBankAccount: (bank: string, accountNumber: string, accountHolder: string) => Promise<{success: boolean, message: string}>
  updateWriterEmail: (email: string) => Promise<{success: boolean, message: string}>
  verifyIdentity: () => Promise<{success: boolean, message: string}>
  updateIntro: (intro: string) => Promise<{success: boolean, message: string}>
  updateUserInfoFromUserInfo2: () => Promise<boolean>
  isAdult: () => boolean

  editNickname: (nick_nm: string) => Promise<boolean>
  getCoinSum: () => number
}

// 네트워크 에러 타입 정의
type NetworkError = {
  message: string;
  code?: string;
  status?: number;
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

// 네트워크 에러 처리 함수
const handleNetworkError = (error: any): string => {
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

// 사용자 정보 요청 및 검증
const getUserInfo = async (accessToken: string, snstype: string): Promise<OAuthUserInfo> => {
  const config = OAUTH_PROVIDERS[snstype.toUpperCase() as OAuthProvider]
  if (!config) throw new Error('지원하지 않는 로그인 방식입니다.')

  const response = await axios.get(config.endpoints.USERINFO_URL, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })

  let userInfo: OAuthUserInfo
  switch (snstype.toUpperCase()) {
    case 'KAKAO':
      userInfo = {
        id: response.data.id.toString(),
        email: response.data.kakao_account?.email,
        nickname: response.data.properties?.nickname,
        profile_image: response.data.properties?.profile_image,
        birthday: response.data.kakao_account?.birthday,
        gender: response.data.kakao_account?.gender,
        phone: response.data.kakao_account?.phone_number
      }
      break
    case 'NAVER':
      userInfo = {
        id: response.data.response.id,
        email: response.data.response.email,
        nickname: response.data.response.nickname,
        profile_image: response.data.response.profile_image,
        birthday: response.data.response.birthday,
        gender: response.data.response.gender,
        phone: response.data.response.mobile
      }
      break
    case 'GOOGLE':
      userInfo = {
        id: response.data.sub,
        email: response.data.email,
        name: response.data.name,
        profile_image: response.data.picture
      }
      break
    case 'APPLE':
      const idToken = response.data.id_token
      const payload = JSON.parse(atob(idToken.split('.')[1]))
      userInfo = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        profile_image: undefined
      }
      break
    default:
      throw new Error('지원하지 않는 로그인 방식입니다.')
  }

  if (!userInfo.id) {
    throw new Error('사용자 ID를 찾을 수 없습니다.')
  }

  const scopes = config.scopes
  if (scopes.email && !userInfo.email) {
    throw new Error('이메일 정보가 필요합니다.')
  }
  if (scopes.profile && !userInfo.name && !userInfo.nickname) {
    throw new Error('프로필 정보가 필요합니다.')
  }

  return userInfo
}

// 토큰 검증
const verifyToken = async (accessToken: string, snstype: string): Promise<boolean> => {
  const config = OAUTH_PROVIDERS[snstype.toUpperCase() as OAuthProvider]
  if (!config) throw new Error('지원하지 않는 로그인 방식입니다.')
  if (!config.endpoints.CHECK_TOKEN_URL) {
    return true
  }

  const response = await axios.get(config.endpoints.CHECK_TOKEN_URL, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })

  return response.status === 200
}

// 액세스 토큰 요청
const getAccessToken = async (code: string, snstype: string, clientId: string): Promise<OAuthResponse> => {
  const config = OAUTH_PROVIDERS[snstype.toUpperCase() as OAuthProvider]
  if (!config) throw new Error('지원하지 않는 로그인 방식입니다.')

  const response = await axios.post(
    config.endpoints.RENEWAL_URL,
    new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      redirect_uri: REDIRECT_URI,
      code: code
    }).toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  )

  return response.data
}

// 팝업 창 크기 및 위치 계산 함수 추가
const calculatePopupPosition = () => {
  const width = 500;
  const height = 700;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;
  return { width, height, left, top };
};

// 팝업 창에서 메시지 수신하는 함수 타입 정의
type MessageHandler = (event: MessageEvent) => void;

export const useAccountStore = create<AccountState>()(
  persist(
    (set, get) => ({
      isLogin: false,
      data: null,
      writerInfo: null,
      loading: false,
      error: null,
      isInitialized: false,

      editNickname: async (nick_nm: string) => {
        // check nickname
        const responseCheck = await contentApi.NicknmCheck(nick_nm)
        if (responseCheck.data.result.err !== 0) {
          return false
        }

        const response = await contentApi.NicknmChange(nick_nm)
        if (response.data && response.data.result && response.data.result.err === 0) {
          // update nickname and coin
          get().updateNicknameAndCoin(nick_nm, response.data.coin_user)
          return true
        }
        return false
      },

      isAdult: () => {
        return !!(get().data && (get().data?.minor ?? 0) > 1)
      },

      setWriterInfo: (writerInfo) => {
        set({ writerInfo })
      },

      fetchWriterInfo: async () => {
        const { data } = get()
        if (!data || !data.writerchk || data.writerchk !== 1) {
          set({ writerInfo: null })
          return
        }

        try {
          const response = await createApi.GetWriterInfo()
          if (response.data && response.data.result && response.data.result.err === 0) {
            set({ writerInfo: response.data.book_writer })
          } else {
            console.error('작가 정보 가져오기 실패:', response.data?.result?.msg)
          }
        } catch (error) {
          console.error('작가 정보 요청 중 오류 발생:', error)
        }
      },

      setPersona: (persona: string, persona_gender: number) => {
        set((state) => {
          if (!state.data) return state
          return {
            ...state,
            data: {
              ...state.data,
              persona,
              persona_gender,
            }
          }
        })
      },

      setLoginState: (isLogin, data) => {
        set({ isLogin, data })
      },

      setLoading: (loading) => {
        set({ loading })
      },

      setError: (error) => {
        set({ error })
      },

      updateAccountData: (
        coin_free: number,
        coin_free_dt: number | string,
        coin_register: number,
        coin_user: number
      ) => {
        set((state) => {
          if (!state.data) return state
          
          const newState = {
            ...state,
            data: {
              ...state.data,
              coin_free,
              coin_free_dt: String(coin_free_dt),
              coin_register,
              coin_user,
            }
          }
          
          // 작가 정보 업데이트
          get().fetchWriterInfo()
          
          return newState
        })
      },

      initialize: async () => {
        const { isInitialized } = get()
        if (isInitialized) return

        set({ loading: true, error: null })
        try {
          // 여기에 초기화 로직 추가
          // 예: 세션 체크, 토큰 검증 등
          
          // 로그인 상태이고 작가면 작가 정보 가져오기
          if (get().isLogin) {
            await get().fetchWriterInfo()
          }
          
          set({ isInitialized: true, loading: false })
        } catch (error) {
          const errorMessage = handleNetworkError(error)
          set({ error: errorMessage, loading: false })
        }
      },

      updateUserInfoFromUserInfo2: async () => {
        try {
          const userInfoResponse = await contentApi.userinfo2(get().data?.access_token || '')
          
          if (userInfoResponse) {
            const currentData = get().data
            if (currentData) {
              set({
                data: {
                  ...currentData,
                  intro: userInfoResponse.data.intro,
                  profile_url: userInfoResponse.data.profile_url,
                  image_url: userInfoResponse.data.image_url
                }
              })
            }
            return true
          }
          return false
        } catch (error) {
          console.error('userinfo2 업데이트 중 오류 발생:', error)
          return false
        }
      },

      guestLogin: async (nickname: string): Promise<boolean> => {
        const { isInitialized } = get()
        if (!isInitialized) {
          await get().initialize()
        }

        set({ loading: true, error: null })
        try {
          const result = await authService.guestLogin(nickname);
          
          if(result.success && result.data) {
            set({
              isLogin: true,
              data: result.data,
              loading: false,
            })

            // userinfo2 데이터 업데이트
            await get().updateUserInfoFromUserInfo2()
            await get().fetchWriterInfo()
            return true
          }
          else {
            console.error('@@ guestLogin error :: ', result.error)
            set({ error: result.error || '로그인 실패', loading: false })
            return false
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
          set({ error: errorMessage, loading: false })
          return false
        }
      },

      socialLogin: async (type: OAuthProvider, onSignupRequired?: () => void, onLoginSuccess?: () => void): Promise<boolean> => {
        const { isInitialized } = get()
        if (!isInitialized) {
          await get().initialize()
        }

        set({ loading: true, error: null })
        
        try {
          // 인증 서비스를 사용하여 로그인
          const result = await authService.socialLogin(
            type,
            {
              onSignupRequired,
              onSuccess: onLoginSuccess,
              onLoginTimeout: () => {
                set({ loading: false });
                set({ error: "로그인 시간이 초과되었습니다. 다시 시도해주세요." });
              }
            }
          );
          
          if (result.success && result.data) {
            // 로그인 성공
            set({ 
              isLogin: true, 
              data: result.data, 
              loading: false 
            });
            
            // 사용자 정보 업데이트
            await get().updateUserInfoFromUserInfo2();
            await get().fetchWriterInfo();
            
            // 성공 콜백 호출
            if (onLoginSuccess) {
              onLoginSuccess();
            }
            return true;
          } else if (result.needSignup || result.signupRequired) {
            // 회원가입 필요
            set({ loading: false });
            
            // 회원가입 모달 표시
            if (onSignupRequired) {
              onSignupRequired();
            }
            return false;
          } else {
            // 에러 처리
            set({ 
              error: result.error || '로그인 중 오류가 발생했습니다.', 
              loading: false 
            });
            return false;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
          set({ error: errorMessage, loading: false });
          return false;
        }
      },

      handleCallback: async (code: string, state?: string, onSignupRequired?: () => void, onLoginSuccess?: () => void): Promise<boolean> => {
        const { isInitialized } = get()
        if (!isInitialized) {
          await get().initialize()
        }

        set({ loading: true, error: null })
        try {
          // localStorage에서 저장한 소셜 로그인 정보 가져오기
          const savedState = localStorage.getItem('social_login_state');
          if (!savedState) {
            throw new Error('저장된 소셜 로그인 정보가 없습니다. 다시 로그인해주세요.');
          }
          
          // localStorage에서 파싱한 정보 사용
          const parsedState = JSON.parse(savedState);
          const { provider, clientId, snsauth, snstype } = parsedState;

          console.log('OAuth 인증 정보:', { provider, snstype });

          // 액세스 토큰 요청
          const tokenResponse = await getAccessToken(code, provider, clientId);
          
          // 토큰 검증
          const isValid = await verifyToken(tokenResponse.access_token, provider);
          if (!isValid) throw new Error('토큰 검증 실패');

          // 로그인 처리
          const response = await contentApi.loginDcheckV2(snsauth, snstype, tokenResponse.access_token);
          
          if (response.data.result.err === 0) {
            // 기존 회원
            const { snsid, user_all } = response.data;
            const kr_gb = user_all[0].kr_gb;

            const loginResponse = await contentApi.login2(snsauth, Number(snstype), snsid, String(kr_gb));
            
            // 로그인 상태 저장
            set({ isLogin: true, data: loginResponse.data, loading: false });
            
            // userinfo2 데이터 업데이트
            await get().updateUserInfoFromUserInfo2();
            await get().fetchWriterInfo();
            
            // 로그인 성공 시 임시 데이터 삭제
            localStorage.removeItem('social_login_state');
            
            // 로그인 성공 콜백 호출
            if (onLoginSuccess) {
              onLoginSuccess();
            }
            
            return true;
          } else {
            // 신규 회원
            const { snsid, token } = response.data;
            
            // 팝업 로그인인 경우 회원가입 모달 표시를 위한 콜백 호출
            if (onSignupRequired) {
              // 회원가입에 필요한 데이터 저장
              localStorage.setItem('signup_data', JSON.stringify({ 
                snstype, 
                snsauth, 
                snsid, 
                accessToken: token 
              }));
              
              // 로그인용 임시 데이터는 삭제 (회원가입에 필요한 데이터만 유지)
              localStorage.removeItem('social_login_state');
              
              // 회원가입 모달 표시 요청
              onSignupRequired();
              set({ loading: false });
              return false;
            } else {
              // 기존 동작 유지 (리다이렉션 방식)
              const stateParam = encodeURIComponent(JSON.stringify({ 
                snstype, 
                snsauth, 
                snsid, 
                accessToken: token 
              }));
              
              // 로그인용 임시 데이터는 삭제 (회원가입에 필요한 데이터만 유지)
              localStorage.removeItem('social_login_state');
              
              window.location.href = `/register?state=${stateParam}`;
              return false;
            }
          }
        } catch (error) {
          // 에러 발생 시 임시 데이터 정리
          localStorage.removeItem('social_login_state');
          
          const errorMessage = handleNetworkError(error);
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      registerWithSocialData: async (nickname: string, birthdate: string, marketingAgree: boolean, onSuccess?: () => void): Promise<boolean> => {
        const { isInitialized } = get()
        if (!isInitialized) {
          await get().initialize()
        }

        set({ loading: true, error: null })
        try {
          // 인증 서비스를 사용하여 회원가입
          const result = await authService.registerWithSocialData(nickname, birthdate, marketingAgree);
          
          if (result.success && result.data) {
            // 회원가입 및 로그인 성공
            set({ 
              isLogin: true, 
              data: result.data, 
              loading: false 
            });
            
            await get().fetchWriterInfo();
            
            // 성공 콜백 호출
            if (onSuccess) {
              onSuccess();
            }
            
            return true;
          } else {
            // 회원가입 실패
            set({ 
              error: result.error || '회원가입에 실패했습니다.', 
              loading: false 
            });
            return false;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
          set({ error: errorMessage, loading: false });
          return false;
        }
      },

      logout: () => {
        // 인증 서비스를 사용하여 로그아웃
        authService.logout();
        set({ isLogin: false, data: null, writerInfo: null, isInitialized: false });
      },

      updateBankAccount: async (bank: string, accountNumber: string, accountHolder: string) => {
        set({ loading: true, error: null })
        try {
          // 은행 리스트에서 은행명으로 bank_key 찾기
          const { useBankStore } = await import('@/store/useGlobalStore')
          const bankList = useBankStore.getState().bankList
          
          const selectedBank = bankList.find(b => b.bank_nm === bank)
          if (!selectedBank) {
            set({ loading: false })
            return { 
              success: false, 
              message: '유효한 은행을 선택해주세요' 
            }
          }
          
          // 계좌 정보 API 저장
          const response = await contentApi.WriteRebankAccountEdit(
            selectedBank.bank_key,
            accountNumber,
            accountHolder
          )
          
          if (response.data && response.data.result && response.data.result.err === 0) {
            // 성공 시 writerInfo 업데이트
            if (get().writerInfo) {
              set((state) => ({
                ...state,
                writerInfo: state.writerInfo ? {
                  ...state.writerInfo,
                  bank_nm: bank,
                  account_no: accountNumber,
                  user_nm: accountHolder
                } : null,
                loading: false
              }))
            }
            
            return { 
              success: true, 
              message: '계좌 정보가 성공적으로 저장되었습니다.' 
            }
          } else {
            set({ loading: false })
            return { 
              success: false, 
              message: response.data?.result?.msg || '계좌 정보 저장에 실패했습니다.' 
            }
          }
        } catch (error) {
          console.error('계좌 정보 저장 중 오류 발생:', error)
          set({ loading: false, error: '계좌 정보 저장 중 오류가 발생했습니다.' })
          return { 
            success: false, 
            message: '계좌 정보 저장 중 오류가 발생했습니다.' 
          }
        }
      },

      updateWriterEmail: async (email: string) => {
        set({ loading: true, error: null })
        try {
          // 현재 writerInfo가 있는지 확인
          const writerInfo = get().writerInfo
          if (!writerInfo) {
            set({ loading: false })
            return { 
              success: false, 
              message: '작가 정보를 찾을 수 없습니다.' 
            }
          }
          
          // 이메일 저장 API 호출
          const response = await contentApi.WriteRemailEdit(email)
          
          if (response.data && response.data.result && response.data.result.err === 0) {
            // 성공 시 writerInfo 업데이트
            set((state) => ({
              ...state,
              writerInfo: state.writerInfo ? {
                ...state.writerInfo,
                email
              } : null,
              loading: false
            }))
            
            return { 
              success: true, 
              message: '이메일이 성공적으로 저장되었습니다.' 
            }
          } else {
            set({ loading: false })
            return { 
              success: false, 
              message: response.data?.result?.msg || '이메일 저장에 실패했습니다.' 
            }
          }
        } catch (error) {
          console.error('이메일 저장 중 오류 발생:', error)
          set({ loading: false, error: '이메일 저장 중 오류가 발생했습니다.' })
          return { 
            success: false, 
            message: '이메일 저장 중 오류가 발생했습니다.' 
          }
        }
      },

      verifyIdentity: async (): Promise<{success: boolean, message: string}> => {
        try {
          // 현재 창의 URL 호스트를 기반으로 콜백 URL 구성
          const host = window.location.origin;
          const successUrl = `${host}/pass/pass_success`;
          const failedUrl = `${host}/pass/pass_failed`;
          
          // 본인인증 정보 요청
          const response = await contentApi.GetPassInfo(successUrl, failedUrl, 1);
          
          if (response.data && response.data.result && response.data.result.err === 0) {
            const encData = response.data.enc_data;
            
            if (!encData) {
              return { 
                success: false, 
                message: '본인인증 정보를 가져오는데 실패했습니다.' 
              };
            }
            
            // 팝업 창 위치 및 크기 계산
            const { width, height, left, top } = calculatePopupPosition();
            
            // 폼과 팝업 생성을 위한 HTML - beforeunload 이벤트 제거
            const formHtml = `
              <html>
              <head>
                <title>본인인증</title>
                <script>
                  function fnSubmit() {
                    document.form_chk.action = "https://nice.checkplus.co.kr/CheckPlusSafeModel/checkplus.cb";
                    document.form_chk.submit();
                  }
                </script>
              </head>
              <body onload="fnSubmit()">
                <form name="form_chk" method="post">
                  <input type="hidden" name="m" value="checkplusService">
                  <input type="hidden" name="EncodeData" value="${encData}">
                </form>
              </body>
              </html>
            `;
            
            // 데이터 URL 생성
            const blob = new Blob([formHtml], { type: 'text/html' });
            const dataUrl = URL.createObjectURL(blob);
            
            // 팝업 창 열기
            const popup = window.open(
              dataUrl,
              'popupChk',
              `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
            );
            
            if (!popup) {
              URL.revokeObjectURL(dataUrl);
              return { 
                success: false, 
                message: '팝업 창이 차단되었습니다. 팝업 차단을 해제해주세요.' 
              };
            }
            
            // 메시지 이벤트 처리를 위한 Promise
            return new Promise((resolve) => {
              let isProcessing = false;
              
              // 30초 타임아웃 설정
              const timeout = setTimeout(() => {
                if (!isProcessing) {
                  isProcessing = true;
                  clearInterval(checkClosed);
                  window.removeEventListener('message', messageHandler);
                  URL.revokeObjectURL(dataUrl);
                  if (!popup.closed) popup.close();
                  resolve({ 
                    success: false, 
                    message: '본인인증 시간이 초과되었습니다.' 
                  });
                }
              }, 30000); // 30초 타임아웃
              
              const messageHandler = async (event: MessageEvent) => {
                // 메시지 출처 검증 (같은 도메인에서 온 메시지만 처리)
                if (event.origin !== window.location.origin) {
                  return;
                }
                
                // 중복 처리 방지
                if (isProcessing) return;
                
                // 타임아웃 클리어
                clearTimeout(timeout);
                
                const { type, encData, message } = event.data;
                
                // PASS_CLOSED 타입 처리 추가
                if (type === 'PASS_CLOSED') {
                  isProcessing = true;
                  window.removeEventListener('message', messageHandler);
                  URL.revokeObjectURL(dataUrl);
                  if (!popup.closed) popup.close();
                  resolve({ 
                    success: false, 
                    message: message || '본인인증이 취소되었습니다.' 
                  });
                  return;
                }
                
                if (type === 'PASS_SUCCESS' && encData) {
                  isProcessing = true;
                  try {
                    // 성공 처리
                    await contentApi.PassSuccess(encData);
                    window.removeEventListener('message', messageHandler);
                    URL.revokeObjectURL(dataUrl);
                    if (!popup.closed) popup.close();
                    resolve({ 
                      success: true, 
                      message: '본인인증이 성공적으로 완료되었습니다.' 
                    });
                  } catch (error) {
                    console.error('본인인증 성공 처리 중 오류:', error);
                    window.removeEventListener('message', messageHandler);
                    URL.revokeObjectURL(dataUrl);
                    if (!popup.closed) popup.close();
                    resolve({ 
                      success: false, 
                      message: '본인인증 처리 중 오류가 발생했습니다.' 
                    });
                  }
                } else if (type === 'PASS_FAILED' && encData) {
                  isProcessing = true;
                  try {
                    // 실패 처리
                    await contentApi.PassFailed(encData);
                    window.removeEventListener('message', messageHandler);
                    URL.revokeObjectURL(dataUrl);
                    if (!popup.closed) popup.close();
                    resolve({ 
                      success: false, 
                      message: '본인인증에 실패했습니다.' 
                    });
                  } catch (error) {
                    console.error('본인인증 실패 처리 중 오류:', error);
                    window.removeEventListener('message', messageHandler);
                    URL.revokeObjectURL(dataUrl);
                    if (!popup.closed) popup.close();
                    resolve({ 
                      success: false, 
                      message: '본인인증 처리 중 오류가 발생했습니다.' 
                    });
                  }
                }
              };
              
              // 메시지 이벤트 리스너 등록
              window.addEventListener('message', messageHandler);
              
              // 팝업 창 닫힘 감지 (폴링 방식으로만 처리)
              const checkClosed = setInterval(() => {
                // 팝업이 유효하지 않거나 닫혔는지 확인
                if (!popup || popup.closed) {
                  clearInterval(checkClosed);
                  clearTimeout(timeout); // 타임아웃 클리어 추가
                  
                  // 아직 처리되지 않은 경우만 처리
                  if (!isProcessing) {
                    isProcessing = true;
                    window.removeEventListener('message', messageHandler);
                    URL.revokeObjectURL(dataUrl);
                    resolve({ 
                      success: false, 
                      message: '본인인증이 취소되었습니다.' 
                    });
                  }
                }
              }, 500);
            });
          } else {
            return { 
              success: false, 
              message: response.data?.result?.msg || '본인인증 정보를 가져오는데 실패했습니다.' 
            };
          }
        } catch (error) {
          console.error('본인인증 요청 중 오류 발생:', error);
          return { 
            success: false, 
            message: '본인인증 요청 중 오류가 발생했습니다.' 
          };
        }
      },

      updateIntro: async (intro: string) => {
        try {
          const response = await contentApi.myintroupdate(intro)
          
          if (response.data.result.err === 0) {
            // userinfo2 데이터 업데이트
            const success = await get().updateUserInfoFromUserInfo2()
            
            if (success) {
              return { success: true, message: '한줄 소개가 저장되었습니다.' }
            }
            return { success: false, message: '사용자 정보 업데이트에 실패했습니다.' }
          } else {
            return { success: false, message: response.data.result.msg || '한줄 소개 저장에 실패했습니다.' }
          }
        } catch (error) {
          console.error('한줄 소개 업데이트 중 오류 발생:', error)
          return { success: false, message: '한줄 소개 저장 중 오류가 발생했습니다.' }
        }
      },

      updateNicknameAndCoin: (nick_nm: string, coin_user: number) => {
        set((state) => {
          if (!state.data) return state
          return {
            ...state,
            data: {
              ...state.data,
              nick_nm,
              coin_user,
            }
          }
        })
      },

      getCoinSum: () => {
        return (get().data?.coin_free ?? 0) + (get().data?.coin_user ?? 0) + (get().data?.coin_register ?? 0)
      },
    }),
    {
      name: 'account-storage',
      // skipHydration: true
    }
  )
)

