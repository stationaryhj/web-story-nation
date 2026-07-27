# 전역 세이프티 필터 강제 ON — API safety: 1 고정 (2026-07-27)

## 요약
2026-07-15의 "전역 세이프티 필터 강제 OFF(safety: 0)" 정책을 반전. `store/useStoreSettings.ts`의 `isAdultModeEnabled`를 **항상 `false`로 잠금**하여 모든 API 요청이 `safety: 1`(필터 ON)로 나가게 했다.

## 변경 파일
- `store/useStoreSettings.ts` — 초기값·`setAdlultMode`·`enableAdultMode`·`toggleAdultMode`·`changeAdultMode`·persist `merge` 전부 `false` 고정으로 반전. 레거시 localStorage에 남은 `true`도 merge에서 무력화.

## 동작 원리
- API 호출부(`services/api/storyNationApi.ts` 9곳)는 수정 없음:
  `const safety = isAdultModeEnabled ? 0 : 1` → 항상 `1`.
- `useAccountStore`의 `setAdlultMode(서버 safety)` 호출은 no-op(항상 false 유지).

## UI 영향 (의도된 부수 효과)
- 짜릿모드 토글(ToggleSwitch, HeaderSidebar)은 항상 OFF 표시·조작 불가.
- FilterControls의 성인 태그 섹션 숨김.
- `[isAdultModeEnabled]` 의존 refetch 효과들은 false 기준으로 재조회.
- 캐릭터 생성의 adult 등급 게이트(RatingSelect/LastInfoForm)는 `isAdult()`(본인인증) 기반이라 무관.

## 검증
- `npx tsc --noEmit` — 해당 파일 에러 없음.
- 네트워크 캡처(Playwright)는 로그아웃 상태에서 홈이 API를 호출하지 않아 불가. 정적 확인으로 대체(삼항식 결과 확정적).

## 관련
- 반전 대상 정책: `docs/plan/plan-20260715-remove-safety-filter.md`, `docs/q&a/qa-20260715-remove-safety-filter.md`
- 직전 확인: `docs/q&a/qa-20260727-safety-api-value.md`
