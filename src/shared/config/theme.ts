// src/shared/config/theme.ts
//
// 앱 전체 톤앤매너를 결정하는 단일 스위치.
// 이 값 한 줄만 바꾸면 전체 앱이 라이트↔다크로 전환된다.
// (런타임 localStorage / prefers-color-scheme / 사용자 토글 분기 없음)
export const APP_THEME: 'light' | 'dark' = 'dark';

/** `.dark` 클래스 적용 여부. layout에서 <html>에 정적으로 반영한다. */
export const IS_DARK_THEME = APP_THEME === 'dark';
