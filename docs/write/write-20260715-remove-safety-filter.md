# Write 산출물 — 세이프티 필터 전역 강제 OFF · 1~2단계(스토어 잠금)

- 작성 일자: 2026-07-15
- 근거 계획: `docs/plan/plan-20260715-remove-safety-filter.md` (1단계 · 2단계, `[담당: writer]`)
- 근거 정책 결정: `docs/q&a/qa-20260715-remove-safety-filter.md` Q1 — "전역 강제 OFF(안 1)" 채택
- 구현 범위: **1단계(스토어를 성인모드 ON으로 잠금)·2단계(스토어 잠금 검증)만** 구현. 3단계(톱바 토글 제거, publisher)·4단계(헤더 반응형 검증, publisher)·5단계(오펀 정리, main)는 이번 범위 아님(미구현).

## 구현 요약
`store/useStoreSettings.ts` 단독 수정으로 `isAdultModeEnabled`를 항상 `true`로 잠갔다. 초기값·모든 세터(`setAdlultMode`/`toggleAdultMode`/`changeAdultMode`)를 무력화하고, `changeAdultMode`의 서버 동기화(`updateSafetyMode`) 호출을 제거했으며, persist `merge` 옵션으로 레거시 localStorage(`isAdultModeEnabled:false`)까지 강제 무력화했다. 이 한 파일 변경만으로 `services/api/storyNationApi.ts` 8곳이 자동으로 `safety=0`을 전송하게 되고, 다른 소비처(검색/필터/추천 등)도 일관되게 "성인모드 ON"으로 동작한다(계획에 따라 무편집).

## 변경 파일
- `store/useStoreSettings.ts:1-3` — 미사용이 된 `useAccountStore` import 제거 (`changeAdultMode`에서 `updateSafetyMode` 호출을 없애 사용처가 사라짐).
- `store/useStoreSettings.ts:24-26` — 잠금 정책·근거 문서 경로를 남기는 주석 추가(2026-07-15, 전역 세이프티 필터 OFF).
- `store/useStoreSettings.ts:31` — `isAdultModeEnabled` 초기값 `false` → `true`.
- `store/useStoreSettings.ts:29,34-36` — `create` 콜백에서 미사용 `get` 파라미터 제거, `setAdlultMode`: 파라미터(`_isAdultModeValue`) 무시하고 항상 `set({ isAdultModeEnabled: true })`(시그니처 `(isAdultModeValue: number) => void` 유지, 호출부인 `useAccountStore.ts` 3곳 무변경).
- `store/useStoreSettings.ts:39-43` — `enableAdultMode`는 계획 범위상 변경 대상 아님(원래도 항상 true 세팅) — 그대로 유지.
- `store/useStoreSettings.ts:45-49` — `toggleAdultMode`: 반전 로직 제거, 항상 `set({ isAdultModeEnabled: true })` 후 `return true`로 무력화.
- `store/useStoreSettings.ts:51-54` — `changeAdultMode`: `useAccountStore.getState().updateSafetyMode(...)` 서버 호출 제거, 반전 로직 제거, `set({ isAdultModeEnabled: true })`로 무력화(async → sync, 인터페이스 반환형 `void`는 그대로 호환).
- `store/useStoreSettings.ts:59-64` — persist 옵션에 `merge` 추가: `merge: (persisted, current) => ({ ...current, ...(persisted as object), isAdultModeEnabled: true })`. `settings`(언어) 등 다른 필드는 `...persisted`로 보존되고 `isAdultModeEnabled`만 마지막에 강제 true.

## 검증 결과
- `npx tsc --noEmit`: 에러 없음(정상 종료, 출력 없음). `setAdlultMode`/`changeAdultMode` 등 시그니처 유지로 호출부(`useAccountStore.ts`) 타입 충돌 없음.
- `git status --porcelain store/useStoreSettings.ts`로 이 파일 단독 수정됨을 확인. 다른 파일(특히 `components/common/header.tsx`)은 손대지 않음.
- 런타임/네트워크 탭 확인(로그아웃→재로그인 시 `safety:0` 유지, 레거시 localStorage `false`에서도 새로고침 후 ON 유지)은 이번 세션에서 브라우저 실행 검증까지는 수행하지 못함 — 코드 레벨로는 `merge`가 `isAdultModeEnabled`를 항상 `true`로 덮어쓰므로 요구사항을 충족.

## 계획과 달라진 점 / 미완 · 후속 필요
- 계획과 다른 점: `create` 콜백의 `(set, get)` 중 `get`이 `changeAdultMode` 내부(서버 safety 값 조회용)에서만 쓰였는데, 해당 로직을 제거하면서 `get`이 완전히 미사용이 되어 파라미터에서 제거했다(계획에 명시되지 않은 세부 정리이나, 미사용 변수로 인한 lint 경고를 막기 위한 최소 부수 변경). 그 외 계획 1단계 지시사항(초기값/세터 무력화/merge)은 그대로 구현.
- 미완/후속 필요:
  - 3단계(톱바 `SimpleToggle` 및 `handleAdultModeToggle` 제거, `components/common/header.tsx`)는 publisher 담당이라 이번 범위에서 미구현.
  - 4단계(헤더 360/768/1280px 반응형 검증)도 publisher 담당, 미구현.
  - 5단계(오펀 `components/form/ToggleSwitch.tsx` 정리)는 main 담당 선택 사항, 계획대로 보류.
  - `npm run lint`(Biome) 전체 실행은 이번 세션에서 수행하지 않음(계획 2단계 검증 항목은 `tsc --noEmit`만 명시). 필요 시 추가 확인 권장.
