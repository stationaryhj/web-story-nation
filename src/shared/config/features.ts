// src/shared/config/features.ts
//
// .env 기반 기능 플래그 모음. 클라이언트에서 읽으려면 반드시 NEXT_PUBLIC_ 접두사가 필요하다.
// 값은 문자열이므로 'true' 문자열과 정확히 비교한다(그 외 값·미설정은 모두 off).

/**
 * 닉네임(게스트) 로그인 폼 노출 여부.
 * `.env`에 `NEXT_PUBLIC_ENABLE_GUEST_LOGIN=true`일 때만 활성화된다.
 */
export const GUEST_LOGIN_ENABLED = process.env.NEXT_PUBLIC_ENABLE_GUEST_LOGIN === 'true';
