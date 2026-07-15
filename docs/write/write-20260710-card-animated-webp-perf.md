# Write 산출물 — 카드 애니메이션 WebP 성능 최적화 · 2단계(resize 리스너 / isMobile state 통합)

- 작성 일자: 2026-07-10
- 근거 계획: `docs/plan/plan-20260710-card-animated-webp-perf.md` (2단계 `2a`, `[담당: writer]`)
- 구현 범위: **2단계(2a)만** 구현. 1단계(content-visibility, publisher)는 이미 완료된 상태였고 3·4단계는 이번 범위 아님(미구현).

## 구현 요약
`components/elements/card/Card.tsx`, `components/elements/card/CardGrid.tsx`의 수동 `isMobile` state + `window resize` 이벤트 리스너 useEffect를 기존 공용 훅 `hooks/useMediaQuery.ts` 호출로 교체했다. 순수 로직/훅 배선만 변경했으며 className/마크업은 건드리지 않았다(1단계에서 이미 적용된 `cv-card`/`cv-card-h` 등 publisher 작업물 유지).

## 변경 파일
- `components/elements/card/Card.tsx:16` — `import { useCallback, useEffect, useState } from 'react'` → `import { useCallback } from 'react'` (isMobile 관련 `useEffect`/`useState` 사용처 제거로 불필요해짐. `imageError`는 `React.useState`로 별도 사용 중이라 named `useState` import와는 무관해 영향 없음 확인).
- `components/elements/card/Card.tsx:18` — `import { useMediaQuery } from '@/hooks/useMediaQuery';` 추가.
- `components/elements/card/Card.tsx:53` — `const [isMobile, setIsMobile] = useState(false);` → `const isMobile = useMediaQuery('(max-width: 768px)');`
- `components/elements/card/Card.tsx:85-99`(원본 라인 기준) — `checkMobile` + `window.addEventListener('resize', ...)` useEffect 블록 제거.
- `components/elements/card/CardGrid.tsx:11` — `import { useMediaQuery } from '@/hooks/useMediaQuery';` 추가.
- `components/elements/card/CardGrid.tsx:82` — `const [isMobile, setIsMobile] = useState(false);` → `const isMobile = useMediaQuery('(max-width: 768px)');` (`shouldShowNavigation` 등 기존 사용처는 그대로 유지).
- `components/elements/card/CardGrid.tsx:85-99`(원본 라인 기준) — 동일한 resize 리스너 useEffect 블록 제거. `useEffect`/`useState` import는 `localLoading`/`reachedEnd`/`reachedBeginning` state와 `customData` 로딩용 `useEffect`(원본 109행)가 계속 사용 중이라 유지.

## Before / After 요약
- Before: 컴포넌트마다 `useState(false)` + `useEffect`로 `window.innerWidth <= 768` 체크 및 `resize` 리스너를 개별 등록/해제 → 카드 N개 렌더 시 리스너 N개, resize마다 각 카드가 개별 setState.
- After: `useMediaQuery('(max-width: 768px)')` 훅 호출로 대체. 훅 내부는 `matchMedia`의 `change` 이벤트 리스너 1종으로 동작(리스너 등록은 훅을 호출한 컴포넌트별로 유지되나, `matchMedia`/`change` 기반이라 `resize` 이벤트보다 가볍고 로직이 공용화됨). 경계값은 `max-width: 768px`(≤768px)로 기존 `<= 768`과 동치, 초기값도 기존과 동일하게 `false`(SSR/첫 렌더) → 마운트 후 보정.

## 검증 결과
- `npx tsc --noEmit`: 에러 없음(정상 종료, 출력 없음).
- `npm run lint`(전체 프로젝트): 다수의 pre-existing 에러/경고 존재(319 errors, 334 warnings) — 이번 작업 범위와 무관하게 이미 커밋된 코드에 존재하던 항목들(a11y `useButtonType`, `noDoubleEquals`, `noArrayIndexKey` 등). 아래에서 대상 2개 파일만 별도 확인.
- `npx biome lint components/elements/card/Card.tsx components/elements/card/CardGrid.tsx`: 9 errors / 5 warnings 검출. 전수 확인 결과 **이번 변경으로 새로 발생한 항목 없음** — 모두 `git show HEAD`(변경 전 커밋 버전)에도 이미 존재하던 pre-existing 이슈:
  - `Card.tsx`: `faFire`/`faImages` 미사용 import, `imageError`/`router` 미사용 변수, `finish_yn == 0`/`show_yn == 0`(`noDoubleEquals`), 버튼 `type` 미지정(`useButtonType`), `key`에 index 사용(`noArrayIndexKey`) — 모두 커밋된 베이스 코드에 이미 존재.
  - `CardGrid.tsx`: `useRouter`/`Pagination` 미사용 import, skeleton `key`에 index 사용 — 커밋된 베이스 코드에 이미 존재.
  - 즉, 이번 2단계 변경(`isMobile`/resize 리스너 교체)으로 인한 새로운 lint 위반은 없음.
- 표시 결과 동치성: `useMediaQuery`가 반환하는 `isMobile` 값의 사용처(아이콘 width/height 삼항, `CardGrid.tsx`의 `shouldShowNavigation`)는 변경하지 않았으므로 로직상 동일하게 동작해야 함(브라우저 실측/수동 QA는 별도 필요 — 아래 "미완" 참조).

## 계획과 달라진 점 / 미완 · 후속 필요
- 계획과 다른 점: 없음. 계획에 기술된 대상 라인·교체 방식대로 정확히 구현.
- 미완/후속 필요:
  - 실제 브라우저(360/768/1280px)에서의 수동 리사이즈 동작 확인은 이번 세션에서 수행하지 못함(코드 레벨 동치성만 확인). 계획의 §검증 방법에 명시된 "React DevTools Profiler로 리렌더 횟수 감소 확인"도 별도 수동 검증 필요.
  - `Card.tsx`/`CardGrid.tsx`에 남아있는 pre-existing lint 이슈(미사용 import/변수, `==` 비교, 버튼 type 등)는 이번 작업 범위(2단계) 밖이라 손대지 않음. 필요 시 별도 planner 승인 후 정리 권장.
  - 3단계(group-hover scale 분리, publisher)·4단계(Swiper Virtual, writer/publisher)는 이번 범위 아님 — 미구현 상태 유지.
