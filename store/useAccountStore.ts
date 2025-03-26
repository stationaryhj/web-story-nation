import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { LoginResponse } from '@/types/api'
import { OAuthProvider, OAuthState, OAuthResponse, OAuthUserInfo } from '@/types/login'
import { OAUTH_PROVIDERS } from '@/types/login'
import { contentApi } from '@/services/api'
import axios from 'axios'

// 환경 변수에서 리다이렉트 URI 가져오기
const REDIRECT_URI = process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI

if (!REDIRECT_URI) {
  throw new Error('NEXT_PUBLIC_OAUTH_REDIRECT_URI 환경 변수가 설정되지 않았습니다.')
}

interface AccountState {
  isLogin: boolean
  data: LoginResponse | null
  loading: boolean
  error: string | null
  isInitialized: boolean
  // Actions
  setLoginState: (isLogin: boolean, data: LoginResponse | null) => void
  guestLogin: (nickname: string) => Promise<boolean>
  socialLogin: (type: OAuthProvider) => Promise<void>
  handleCallback: (code: string, state: string) => Promise<boolean>
  logout: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  initialize: () => Promise<void>
  updateAccountData: (coin_free: number, coin_free_dt: number | string, coin_register: number, coin_user: number) => void
  setPersona: (persona: string, persona_gender: number) => void
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

export const useAccountStore = create<AccountState>()(
  persist(
    (set, get) => ({
      isLogin: false,
      data: null,
      loading: false,
      error: null,
      isInitialized: false,

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
          return {
            ...state,
            data: {
              ...state.data,
              coin_free,
              coin_free_dt: String(coin_free_dt),
              coin_register,
              coin_user,
            }
          }
        })
      },

      initialize: async () => {
        const { isInitialized } = get()
        if (isInitialized) return

        set({ loading: true, error: null })
        try {
          // 여기에 초기화 로직 추가
          // 예: 세션 체크, 토큰 검증 등
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

      socialLogin: async (type: OAuthProvider) => {
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
          console.log('@@@@@@@@ clientId', clientId)
          console.log('@@@@@@@@ snsauth', snsauth)

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
          window.location.href = authUrl
        } catch (error) {
          const errorMessage = handleNetworkError(error)
          set({ error: errorMessage, loading: false })
          throw error
        }
      },

      handleCallback: async (code: string, state: string): Promise<boolean> => {
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

            const loginResponse = await contentApi.login2(snsauth, snstype, snsid, kr_gb)
            set({ isLogin: true, data: loginResponse.data, loading: false })
            return true
          } else {
            // 신규 회원
            const { snsid, token } = response.data
            const state = encodeURIComponent(JSON.stringify({ 
              snstype, 
              snsauth, 
              snsid, 
              accessToken: token 
            }))
            window.location.href = `/register?state=${state}`
            return false
          }
        } catch (error) {
          const errorMessage = handleNetworkError(error)
          set({ error: errorMessage, loading: false })
          throw error
        }
      },

      logout: () => {
        set({ isLogin: false, data: null, isInitialized: false })
      }
    }),
    {
      name: 'account-storage',
      // skipHydration: true
    }
  )
)

