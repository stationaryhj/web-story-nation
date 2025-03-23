'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import PageTransition from '@/components/motion/PageTransition'
import { OAuthProvider, OAuthResponse, OAuthState, OAuthUserInfo } from '@/types/login'
import { getSnsTypeNumber } from '@/lib/utils/storyNationUtil'
import { OAUTH_PROVIDERS } from '@/types/login'
import axios from 'axios'
import { contentApi } from '@/services/api'
import { LoginResponse } from '@/types/api'
import { useAccountStore } from '@/store/useStoreData'

// snstype에 따른 provider 매핑
const SNS_TYPE_TO_PROVIDER: Record<number, OAuthProvider> = {
  1: 'KAKAO',
  2: 'NAVER',
  3: 'GOOGLE',
  4: 'APPLE'
};


// 사용자 정보 요청 및 검증
const getUserInfo = async (accessToken: string, snstype: string): Promise<OAuthUserInfo> => {
  const config = OAUTH_PROVIDERS[snstype.toUpperCase() as OAuthProvider];
  if (!config) throw new Error('지원하지 않는 로그인 방식입니다.');

  const response = await axios.get(config.endpoints.USERINFO_URL, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  // 각 제공자별 응답 데이터 검증 및 변환
  let userInfo: OAuthUserInfo;
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
      };
      break;
    case 'NAVER':
      userInfo = {
        id: response.data.response.id,
        email: response.data.response.email,
        nickname: response.data.response.nickname,
        profile_image: response.data.response.profile_image,
        birthday: response.data.response.birthday,
        gender: response.data.response.gender,
        phone: response.data.response.mobile
      };
      break;
    case 'GOOGLE':
      userInfo = {
        id: response.data.sub,
        email: response.data.email,
        name: response.data.name,
        profile_image: response.data.picture
      };
      break;
    case 'APPLE':
      // Apple의 경우 JWT 토큰을 디코딩하여 사용자 정보를 얻습니다
      const idToken = response.data.id_token;
      const payload = JSON.parse(atob(idToken.split('.')[1]));
      userInfo = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        profile_image: undefined // null 대신 undefined 사용
      };
      break;
    default:
      throw new Error('지원하지 않는 로그인 방식입니다.');
  }

  // 필수 정보 검증
  if (!userInfo.id) {
    throw new Error('사용자 ID를 찾을 수 없습니다.');
  }

  // 스코프에 따른 정보 검증
  const scopes = config.scopes;
  if (scopes.email && !userInfo.email) {
    throw new Error('이메일 정보가 필요합니다.');
  }
  if (scopes.profile && !userInfo.name && !userInfo.nickname) {
    throw new Error('프로필 정보가 필요합니다.');
  }

  return userInfo;
};

// 실제 콜백 로직을 처리하는 컴포넌트
function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  // token 검증
  const verifyToken = async (accessToken: string, snstype: string): Promise<boolean> => {
    const config = OAUTH_PROVIDERS[snstype.toUpperCase() as OAuthProvider];
    if (!config) throw new Error('지원하지 않는 로그인 방식입니다.');
    if(!config.endpoints.CHECK_TOKEN_URL){
      return true;
    }

    const response = await axios.get(config.endpoints.CHECK_TOKEN_URL, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log('verifyToken ::: ' , response);

    return response.status === 200;  
  };

  // 액세스 토큰 요청
  const getAccessToken = async (code: string, snstype: string, clientId: string): Promise<OAuthResponse> => {
    const config = OAUTH_PROVIDERS[snstype.toUpperCase() as OAuthProvider];
    if (!config) throw new Error('지원하지 않는 로그인 방식입니다.');

    const response = await axios.post(
      config.endpoints.RENEWAL_URL,
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        redirect_uri: 'http://npt.iptime.org:3100/callback',
        code: code
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return response.data;
  };
  
  // 로그인 처리
  const handleLogin = async (snsauth: string, snstype: number, accessToken: string) => {
    try {
      const response = await contentApi.loginDcheckV2(snsauth, snstype, accessToken);
      
      if (response.data.result.err === 0) {
        // 기존 회원
        const { snsid, user_all } = response.data;
        const kr_gb = user_all[0].kr_gb;

        // 다른 국가도 있을경우 처리해야함.
        
        const loginResponse = await contentApi.login2(snsauth, snstype, snsid, kr_gb);
        const loginData = loginResponse.data as LoginResponse;
        
        useAccountStore.setState({
          isLogin: true,
          data: loginData,
        });
        
        router.back();
      } else {
        // 신규 회원
        const { snsid, token } = response.data;
        const state = encodeURIComponent(JSON.stringify({ 
          snstype, 
          snsauth, 
          snsid, 
          accessToken: token 
        }));
        router.push(`/register?state=${state}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('로그인 처리 중 오류가 발생했습니다.');
    }
  };


  useEffect(() => {
    const processAuth = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        console.log('code ::: ' , code);
        console.log('state ::: ' , state);

        if (!code || !state) {
          throw new Error('필수 인증 정보가 누락되었습니다.');
        }

        // state 파라미터 파싱
        const parsedState = JSON.parse(decodeURIComponent(state)) as OAuthState;
        const { provider, clientId, snsauth, snstype } = parsedState;

        // 액세스 토큰 요청
        const tokenResponse = await getAccessToken(code, provider, clientId);
        console.log('tokenResponse ::: ' , tokenResponse);

        alert('!!')

        // 토큰 검증
        const isValid = await verifyToken(tokenResponse.access_token, provider);
        if(!isValid) throw new Error('토큰 검증 실패');

        // 사용자 정보 요청 및 검증
        // const userInfo = await getUserInfo(tokenResponse.access_token, provider);
        // console.log('Validated User Info:', userInfo);

        // 로그인 처리
        await handleLogin(snsauth, snstype, tokenResponse.access_token);

      } catch (err) {
        console.error('Authentication error:', err);
        setError('인증 처리 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    processAuth();
  }, [searchParams, router]);

  
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="text-red-500 text-lg font-medium">{error}</div>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            로그인 페이지로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="text-xl font-medium">로그인 처리 중...</div>
        <div className="relative w-20 h-20 mx-auto">
          <div className="w-full h-full rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin"></div>
        </div>
      </div>
    </div>
  )
}

// 메인 컴포넌트
export default function CallbackPage() {
  return (
    <PageTransition>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
          <div className="w-full max-w-md text-center space-y-6">
            <div className="text-xl font-medium">로딩 중...</div>
            <div className="relative w-20 h-20 mx-auto">
              <div className="w-full h-full rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin"></div>
            </div>
          </div>
        </div>
      }>
        <CallbackContent />
      </Suspense>
    </PageTransition>
  )
} 