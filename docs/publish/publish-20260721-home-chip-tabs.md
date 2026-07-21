# 홈 네비게이션 탭 칩(Top 메뉴) 형태 적용 — 퍼블리싱 결과

- 작성일: 2026-07-21
- 대상 브랜치: `red-main`
- 담당: main Agent
- 근거: [docs/publish/publish-20260709-home-demo.md](publish-20260709-home-demo.md) (데모 `/demo/home`의 Top 메뉴 칩 스타일)

---

## 요약
데모 페이지(`/demo/home`)의 Top 메뉴 칩 형태를 메인 페이지의 네비게이션 탭 **추천 / 남자 / 여자 / 성별모름**에 적용했다. 공용 컴포넌트 `ButtonTabs`에 `variant` prop을 신설해 홈에서만 칩 형태를 쓰고, 기존 사용처(랭킹 섹션·사이드바 4곳)는 기본 `underline` 형태를 유지한다. 색은 데모의 HEX 하드코딩 대신 semantic 토큰으로 매핑했다.

## 변경 파일

### `components/elements/tabs/ButtonTabs.tsx`
- `ButtonTabsProps`에 `variant?: 'underline' | 'chip'` 추가 (기본값 `'underline'` → 기존 사용처 무영향).
- **chip variant 스타일** (데모 `page.tsx:146` 기준):
  - `inline-flex h-[45px] min-w-[119px] shrink-0 items-center justify-center whitespace-nowrap rounded-full px-4 text-sm md:text-base font-medium transition-colors`
  - 활성: `bg-brand text-white` / 비활성: `bg-surface-elevated text-text-muted hover:bg-surface-elevated-hover`
  - 칩 간격: `gap-[14px]` (underline은 기존 `space-x-4 md:space-x-8` 유지)
- 밑줄 인디케이터(framer-motion `motion.div`)와 위치 측정 `useEffect`는 `variant === 'underline'`일 때만 동작/렌더.
- 접근성: chip 모드에서 `aria-pressed` 부여.
- 탭 로직(URL `?tab=`·`?tags=` 동기화, `onTabChange`/`onTagSelect`)은 무변경.

### `views/main/home.tsx`
- 네비게이션 탭 `ButtonTabs`에 `variant='chip'` + `className='max-w-full'` 전달.
- `max-w-full`: 중앙 정렬 래퍼(`flex justify-center`) 안에서 flex item의 `min-width:auto`로 인한 잘림을 방지 — 폭이 부족하면 내부 `overflow-x-auto`로 가로 스크롤 처리.

## 색 토큰 매핑 (데모 → 정식)
| 데모 (HEX 하드코딩) | 정식 (semantic 토큰) | 다크 모드 실제 값 |
|---|---|---|
| `#FF0750` (활성 액센트) | `bg-brand` | `#FF2E7E` |
| `#555555` (비활성 칩) | `bg-surface-elevated` | `#3A3A3A` |
| — | `hover:bg-surface-elevated-hover` | `#4A4A4A` |

> 데모 문서 결정③(토큰을 Figma 값으로 갱신)은 cross-cutting 별건으로 미착수. 토큰 값이 갱신되면 이 칩도 자동 반영된다.

## 반응형 / 웹뷰 점검
- **터치 타깃**: `h-[45px]` ≥ 44px 충족.
- **360px(모바일)**: 4칩 = 119×4 + 14×3 ≈ 518px > 뷰포트 → `max-w-full` + `overflow-x-auto`(hide-scrollbar)로 가로 스크롤, 페이지 레벨 가로 스크롤 없음.
- **768px 이상**: 전체 폭 수용 → `justify-center`로 중앙 정렬.
- **hover 의존 없음**: 활성/비활성이 배경색으로 구분되어 터치 환경에서도 상태 인지 가능.
- 폰트: 모바일 `text-sm` → `md:text-base` (데모는 `text-base` 고정이나 360px 4칩 수용성 위해 모바일만 축소).

## 검증 결과
- `npx tsc --noEmit` 통과.
- `npx biome check` — **이번 변경으로 새로 발생한 이슈 없음**. 보고된 항목(미사용 import `useModalStore`/`useSettingsStore`/`characters`/`setSelectedTagIds`, `React` import, import 정렬, 포맷 드리프트)은 전부 기존 이슈로 이번 범위에서 미수정.

## 한계 / 후속
1. `views/main/home.tsx`·`ButtonTabs.tsx`의 기존 lint 이슈(미사용 import/변수, 포맷)는 별건 정리 필요.
2. 데모의 나머지 요소(좌측 사이드바, 카테고리 칩 16종, 카드 그리드 재구성)는 이번 범위 아님 — 데모 문서 "후속 필요" 참조.
3. 360/768/1280px 실기기·웹뷰 육안 검증은 dev 서버에서 확인 권장.
