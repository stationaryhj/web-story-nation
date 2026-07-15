# write-20260715-breakpoint-scroll-restore

페이지 중간에서 뷰포트가 768px 경계를 넘나들면(데스크톱 ↔ 모바일 반응형) 스크롤이 맨 위로 튀는 문제 수정.

## 원인

768px 경계에서 **스크롤 컨테이너의 주체가 교체**된다:

- **데스크톱(≥768px)**: `globals.css`의 `html, body { height: 100vh }` 때문에 `body`가 스크롤러 (window 스크롤 아님).
- **모바일(<768px)**: `@media (max-width: 767px)`가 `app/providers.tsx`의 `.mobile-scroll-container`에 `height:100% !important; overflow-y:auto !important`를 적용해 이 내부 div가 스크롤러가 됨.

경계를 넘는 순간 이전 스크롤러는 콘텐츠가 넘치지 않게 되어 `scrollTop`이 0으로 클램프되고, 새 스크롤러는 0에서 시작 → 위치 완전 소실. devtools 반응형 모드뿐 아니라 태블릿/폴더블 화면 회전에서도 발생 가능.

## 수정 내용 — `app/providers.tsx`

`Providers`에 스크롤 위치 이관 effect 추가:

1. `window`에 캡처 단계 `scroll` 리스너(passive)를 걸어 **페이지 스크롤러(body/documentElement/.mobile-scroll-container)의 마지막 scrollTop을 상시 추적**. 모달·스와이퍼 등 내부 스크롤은 `e.target` 필터로 제외.
   - 경계 통과 시점에는 이전 스크롤러의 scrollTop이 이미 0으로 클램프된 뒤라, change 이벤트에서 읽으면 늦다 → 상시 추적이 필요.
2. `matchMedia('(max-width: 767px)')`의 `change` 이벤트에서 rAF 2회 대기(레이아웃 안정화) 후 **새 스크롤러에 마지막 위치 복원**: 모바일 진입 시 `.mobile-scroll-container.scrollTo(0, y)`, 데스크톱 복귀 시 `body/documentElement.scrollTop = y`.

## 검증 (Playwright, `C:\temp\pw-qa\scroll-jump2.js`)

| 시나리오 | before | after |
|---|---|---|
| 1280px 중간(3428px) → 767px | 0 (맨 위로 점프) | `.mobile-scroll-container` 3428, 같은 섹션 유지 |
| → 491px 계속 축소 | 0 | 3428 유지 |
| 491px 중간(3042px) → 1280px | 0 (맨 위로 점프) | `body` 3042 |

- `npx tsc --noEmit` 통과.

## 한계

픽셀 단위 보존이라, 폭 변경으로 콘텐츠 높이가 재배치되면 같은 px 위치가 한 섹션 정도 어긋날 수 있다(맨 위 점프 대비 허용 수준). 완벽하게 하려면 앵커 요소 기반 복원이 필요.

## 관련 파일

- `app/providers.tsx` — 스크롤 이관 effect
- (원인 참고) `app/globals.css` 101-148행 — html/body 100vh + 모바일 전용 `.mobile-scroll-container` 스크롤 규칙 (미수정)
