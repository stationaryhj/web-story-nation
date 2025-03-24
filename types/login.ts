/*
    Login 타입 정의
*/

// OAuth Provider 타입 정의
export type OAuthProvider = 'GOOGLE' | 'KAKAO' | 'NAVER' | 'APPLE';

// OAuth Scope 타입 정의
export interface OAuthScopes {
  profile?: boolean;
  email?: boolean;
  birthday?: boolean;
  nickname?: boolean;
}

// OAuth Provider 설정 인터페이스
export interface OAuthProviderConfig {
  id: number;
  name: string;
  scopes: OAuthScopes;
  endpoints: {
    OAUTH_URL: string;
    RENEWAL_URL: string;
    USERINFO_URL: string;
    REMOVE_TOKEN_URL: string;
    CHECK_TOKEN_URL?: string;
    LOGOUT_URL?: string;
    OPEN_ID_URL?: string;
    REVOKE_URL?: string;
    USERINFO_JSON_URL?: string;
    CHECK_USERINFO_URL?: string;
  };
}

// OAuth Provider 설정
export const OAUTH_PROVIDERS: Record<OAuthProvider, OAuthProviderConfig> = {
  GOOGLE: {
    id: 3,
    name: 'google',
    scopes: {
      profile: true,
      email: true
    },
    endpoints: {
      OAUTH_URL: 'https://accounts.google.com/o/oauth2/v2/auth',
      RENEWAL_URL: 'https://oauth2.googleapis.com/token',
      RENEWAL_LEGACY_URL: 'https://www.googleapis.com/oauth2/v4/token',
      USERINFO_URL: 'https://www.googleapis.com/oauth2/v3/userinfo',
      USERINFO_LEGACY_URL: 'https://www.googleapis.com/oauth2/v2/userinfo',
      REMOVE_TOKEN_URL: 'https://oauth2.googleapis.com/revoke',
      CHECK_TOKEN_URL: 'https://oauth2.googleapis.com/tokeninfo',
      OPEN_ID_URL: 'https://accounts.google.com/.well-known/openid-configuration',
      GET_USERINFO_PROFILE_URL: 'https://www.googleapis.com/auth/userinfo.profile',
      GET_USERINFO_EMAIL_URL: 'https://www.googleapis.com/auth/userinfo.email'
    }
  },
  KAKAO: {
    id: 1,
    name: 'kakao',
    scopes: {
      profile: true,
      email: true,
      nickname: true
    },
    endpoints: {
      OAUTH_URL: 'https://kauth.kakao.com/oauth/authorize',
      RENEWAL_URL: 'https://kauth.kakao.com/oauth/token',
      USERINFO_URL: 'https://kapi.kakao.com/v2/user/me',
      REMOVE_TOKEN_URL: 'https://kapi.kakao.com/v1/user/unlink',
      CHECK_TOKEN_URL: 'https://kapi.kakao.com/v1/user/access_token_info',
      LOGOUT_URL: 'https://kapi.kakao.com/v1/user/logout'
    }
  },
  NAVER: {
    id: 2,
    name: 'naver',
    scopes: {
      profile: true,
      email: true,
      birthday: true,
      nickname: true
    },
    endpoints: {
      OAUTH_URL: 'https://nid.naver.com/oauth2.0/authorize',
      RENEWAL_URL: 'https://nid.naver.com/oauth2.0/token',
      USERINFO_URL: 'https://openapi.naver.com/v1/nid/me',
      REMOVE_TOKEN_URL: 'https://nid.naver.com/oauth2.0/token',
      RENEWAL_TOKEN_URL: 'https://nid.naver.com/oauth2.0/token'
    }
  },
  APPLE: {
    id: 4,
    name: 'apple',
    scopes: {
      profile: true,
      email: true,
      nickname: true
    },
    endpoints: {
      OAUTH_URL: 'https://appleid.apple.com/auth/authorize',
      RENEWAL_URL: 'https://appleid.apple.com/auth/token',
      USERINFO_URL: 'https://appleid.apple.com/auth/keys',
      USERINFO_JSON_URL: 'https://appleid.apple.com/.well-known/jwks.json',
      REVOKE_URL: 'https://appleid.apple.com/auth/revoke',
      CHECK_USERINFO_URL: 'https://appleid.apple.com'
    }
  },
//   FACEBOOK: {
//     id: 8,
//     name: 'facebook',
//     scopes: {
//       profile: true,
//       email: true
//     },
//     endpoints: {
//       OAUTH_URL: 'https://www.facebook.com/v18.0/dialog/oauth',
//       RENEWAL_URL: 'https://graph.facebook.com/v18.0/oauth/access_token',
//       USERINFO_URL: 'https://graph.facebook.com/v18.0/me',
//       REMOVE_TOKEN_URL: 'https://graph.facebook.com/v18.0/me/permissions'
//     }
//   }
};

// OAuth 응답 타입
export interface OAuthResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
  id_token?: string;
}

// OAuth 사용자 정보 타입
export interface OAuthUserInfo {
  id: string;
  email?: string;
  name?: string;
  nickname?: string;
  profile_image?: string;
  birthday?: string;
  gender?: string;
  phone?: string;
}

// OAuth 에러 타입
export interface OAuthError {
  error: string;
  error_description: string;
  error_code?: string;
}

// OAuth 설정 타입
export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: OAuthScopes;
}

// OAuth 상태 타입
export interface OAuthState {
  provider: OAuthProvider;
  snsauth: string;
  clientId: string;
  snstype: number;
}