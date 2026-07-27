# Q&A: API로 보내는 safety 값은? (2026-07-27)

## 질문
예전 Safety 옵션을 항상 무엇으로 세팅해서 API를 보내는가?

## 답
**항상 `safety: 0`** (0 = 필터 OFF/성인모드, 1 = 필터 ON).

## 근거
- `services/api/storyNationApi.ts` 목록·검색 계열 API ~9곳:
  `const safety = useSettingsStore.getState().isAdultModeEnabled ? 0 : 1`
- `store/useStoreSettings.ts` — 2026-07-15 전역 세이프티 필터 강제 OFF 정책으로 `isAdultModeEnabled`가 항상 `true` 잠금(모든 setter가 true 고정, 레거시 localStorage false 무력화, 서버 `POST /api/safety` 동기화 호출 제거). 따라서 삼항식의 `1` 분기는 죽은 코드.

## 관련 문서
- `docs/plan/plan-20260715-remove-safety-filter.md`
- `docs/q&a/qa-20260715-remove-safety-filter.md` (Q1 안 1 채택)
