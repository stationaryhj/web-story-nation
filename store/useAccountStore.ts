import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { LoginResponse, WriterInfoData } from '@/types/api'
import { OAuthProvider, OAuthState, OAuthResponse, OAuthUserInfo } from '@/types/login'
import { OAUTH_PROVIDERS } from '@/types/login'
import { contentApi, createApi } from '@/services/api'
import axios from 'axios'

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
  socialLogin: (type: OAuthProvider, onSignupRequired?: () => void, onLoginSuccess?: () => void) => Promise<void>
  handleCallback: (code: string, state: string, onSignupRequired?: () => void, onLoginSuccess?: () => void) => Promise<boolean>
  registerWithSocialData: (nickname: string, birthdate: string, marketingAgree: boolean, onSuccess?: () => void) => Promise<boolean>
  logout: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  initialize: () => Promise<void>
  updateAccountData: (coin_free: number, coin_free_dt: number | string, coin_register: number, coin_user: number) => void
  setPersona: (persona: string, persona_gender: number) => void
  setWriterInfo: (writerInfo: WriterInfoData | null) => void
  fetchWriterInfo: () => Promise<void>
  updateBankAccount: (bank: string, accountNumber: string, accountHolder: string) => Promise<{success: boolean, message: string}>
  updateWriterEmail: (email: string) => Promise<{success: boolean, message: string}>
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

      guestLogin: async (nickname: string): Promise<boolean> => {
        const { isInitialized } = get()
        if (!isInitialized) {
          await get().initialize()
        }

        set({ loading: true, error: null })
        try {
          const response = await contentApi.LoginGuest(nickname)
          if(response.data.result.err === 0) {
            set({
              isLogin: true,
              data: response.data,
              loading: false,
            })

            contentApi.userinfo(response.data.access_token)

            await get().fetchWriterInfo()
            return true
          }
          else {
            console.error('@@ guestLogin error :: ', response.data.result.msg)
            return false
          }
        } catch (error) {
          const errorMessage = handleNetworkError(error)
          set({ error: errorMessage, loading: false })
          return false
        }
      },

      socialLogin: async (type: OAuthProvider, onSignupRequired?: () => void, onLoginSuccess?: () => void) => {
        const { isInitialized } = get()
        if (!isInitialized) {
          await get().initialize()
        }

        set({ loading: true, error: null })
        
        try {
          const providerConfig = OAUTH_PROVIDERS[type.toUpperCase() as OAuthProvider]
          if (!providerConfig) {
            throw new Error('지원하지 않는 로그인 방식입니다.')
          }

          const response = await contentApi.getUuid(providerConfig.id)
          const { clientId, snsauth } = response.data
          
          const state: OAuthState = {
            provider: providerConfig.name as OAuthProvider,
            snsauth,
            clientId,
            snstype: providerConfig.id
          }

          const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: REDIRECT_URI,
            response_type: 'code',
            state: JSON.stringify(state)
          })

          if (type === 'APPLE') {
            params.append('response_mode', 'form_post')
          }

          const authUrl = `${providerConfig.endpoints.OAUTH_URL}?${params.toString()}`
          
          // 팝업 창 위치 및 크기 계산
          const { width, height, left, top } = calculatePopupPosition();
          
          // 팝업 창 열기
          const popup = window.open(
            authUrl,
            `${type}Login`,
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
          );
          
          if (!popup) {
            throw new Error('팝업 창이 차단되었습니다. 팝업 차단을 해제해주세요.');
          }
          
          // 팝업 창 메시지 수신 처리
          return new Promise<void>((resolve, reject) => {
            let isProcessing = false;
            
            const messageHandler: MessageHandler = async (event) => {
              // 메시지 출처 검증
              if (new URL(event.origin).hostname !== new URL(REDIRECT_URI).hostname) {
                return;
              }
              
              // 중복 처리 방지
              if (isProcessing) return;
              isProcessing = true;
              
              try {
                const { code, state: callbackState, error } = event.data;
                
                if (error) {
                  throw new Error(`로그인 실패: ${error}`);
                }
                
                if (!code || !callbackState) {
                  throw new Error('인증 정보가 올바르지 않습니다.');
                }
                
                // 콜백 처리
                const success = await get().handleCallback(code, callbackState, onSignupRequired, onLoginSuccess);
                
                if (success) {
                  // 로그인 성공 콜백 호출
                  if (onLoginSuccess) {
                    onLoginSuccess();
                  }
                  resolve();
                } else {
                  // handleCallback에서 이미 리다이렉션 처리된 경우 (회원가입 처리는 별도로 했으므로 여기서는 처리 완료)
                  set({ loading: false });
                  resolve();
                }
              } catch (error) {
                const errorMessage = handleNetworkError(error);
                set({ error: errorMessage, loading: false });
                reject(error);
              } finally {
                // 이벤트 리스너 제거
                window.removeEventListener('message', messageHandler);
                // 팝업 창 닫기 (아직 열려있는 경우)
                if (!popup.closed) {
                  popup.close();
                }
              }
            };
            
            // 메시지 이벤트 리스너 등록
            window.addEventListener('message', messageHandler);
            
            // 팝업 창 닫힘 감지
            const checkClosed = setInterval(() => {
              if (popup.closed) {
                clearInterval(checkClosed);
                if (!isProcessing) {
                  window.removeEventListener('message', messageHandler);
                  set({ loading: false, error: '로그인이 취소되었습니다.' });
                  reject(new Error('로그인이 취소되었습니다.'));
                }
              }
            }, 500);
          });
        } catch (error) {
          const errorMessage = handleNetworkError(error);
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      handleCallback: async (code: string, state: string, onSignupRequired?: () => void, onLoginSuccess?: () => void): Promise<boolean> => {
        const { isInitialized } = get()
        if (!isInitialized) {
          await get().initialize()
        }

        set({ loading: true, error: null })
        try {
          const parsedState = JSON.parse(decodeURIComponent(state)) as OAuthState
          const { provider, clientId, snsauth, snstype } = parsedState

          console.log('@@@@@@@@ provider', provider)

          // 액세스 토큰 요청
          const tokenResponse = await getAccessToken(code, provider, clientId)

          // 토큰 검증
          const isValid = await verifyToken(tokenResponse.access_token, provider)
          if (!isValid) throw new Error('토큰 검증 실패')

          // 로그인 처리
          const response = await contentApi.loginDcheckV2(snsauth, snstype, tokenResponse.access_token)
          
          if (response.data.result.err === 0) {
            // 기존 회원
            const { snsid, user_all } = response.data
            const kr_gb = user_all[0].kr_gb

            const loginResponse = await contentApi.login2(snsauth, Number(snstype), snsid, String(kr_gb))
            set({ isLogin: true, data: loginResponse.data, loading: false })
            
            // 작가 정보 가져오기
            // if (loginResponse.data.writerchk === 1) {
            //   await get().fetchWriterInfo()
            // }
            await get().fetchWriterInfo()
            
            // 로그인 성공 콜백 호출
            if (onLoginSuccess) {
              onLoginSuccess();
            }
            
            return true
          } else {
            // 신규 회원
            const { snsid, token } = response.data
            
            // 팝업 로그인인 경우 회원가입 모달 표시를 위한 콜백 호출
            if (onSignupRequired) {
              // 회원가입에 필요한 데이터 저장 
              // (실제 앱에서는 회원가입 과정에서 필요한 임시 데이터를 저장하는 별도 로직 추가 필요)
              localStorage.setItem('signup_data', JSON.stringify({ 
                snstype, 
                snsauth, 
                snsid, 
                accessToken: token 
              }));
              
              // 회원가입 모달 표시 요청
              onSignupRequired();
              set({ loading: false });
              return false;
            } else {
              // 기존 동작 유지 (리다이렉션 방식)
              const state = encodeURIComponent(JSON.stringify({ 
                snstype, 
                snsauth, 
                snsid, 
                accessToken: token 
              }))
              window.location.href = `/register?state=${state}`
              return false;
            }
          }
        } catch (error) {
          const errorMessage = handleNetworkError(error)
          set({ error: errorMessage, loading: false })
          throw error
        }
      },

      registerWithSocialData: async (nickname: string, birthdate: string, marketingAgree: boolean, onSuccess?: () => void): Promise<boolean> => {
        const { isInitialized } = get()
        if (!isInitialized) {
          await get().initialize()
        }

        set({ loading: true, error: null })
        try {
          // localStorage에서 소셜 로그인 정보 가져오기
          const signupDataStr = localStorage.getItem('signup_data')
          if (!signupDataStr) {
            throw new Error('회원가입 정보가 없습니다. 다시 로그인해주세요.')
          }

          const signupData = JSON.parse(signupDataStr)
          const { snstype, snsauth, snsid, accessToken } = signupData

          if (!snstype || !snsauth || !snsid || !accessToken) {
            throw new Error('필수 회원가입 정보가 부족합니다. 다시 로그인해주세요.')
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
          )

          if (response.data.result.err === 0) {
            // 회원가입 성공 후 바로 로그인
            const loginResponse = await contentApi.login2(snsauth, Number(snstype), snsid, "1") // 1은 kr_gb 값으로 가정
            
            // 로그인 정보 저장
            set({ 
              isLogin: true, 
              data: loginResponse.data, 
              loading: false 
            })
            
            await get().fetchWriterInfo()
            
            // 임시 데이터 삭제
            localStorage.removeItem('signup_data')
            
            // 성공 콜백 호출
            if (onSuccess) {
              onSuccess();
            }
            
            return true
          } else {
            // 회원가입 실패
            set({ 
              error: response.data.result.msg || '회원가입에 실패했습니다.', 
              loading: false 
            })
            return false
          }
        } catch (error) {
          const errorMessage = handleNetworkError(error)
          set({ error: errorMessage, loading: false })
          return false
        }
      },

      logout: () => {
        set({ isLogin: false, data: null, writerInfo: null, isInitialized: false })
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
    }),
    {
      name: 'account-storage',
      // skipHydration: true
    }
  )
)

