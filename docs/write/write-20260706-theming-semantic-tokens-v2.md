# StoryNation — 테마 semantic 토큰화 구현 결과 (v2, 1·2·3·7단계)

- **작성 일자**: 2026-07-06
- **근거 계획**: `docs/plan/plan-20260706-theming-semantic-tokens-v2.md`
- **구현 범위**: 계획 **1·2·3·7단계 (전환 메커니즘 인프라 + 한글 폰트)**
- **미구현**: 계획 4·5·6단계 (컴포넌트 대량 색상 치환) — 사용자 결정으로 이번 범위에서 제외
- **브랜치**: `red-main`
- **검증**: `npx tsc --noEmit` ✅ · `npm run build` ✅ (24 라우트) · Biome 포맷 정리 완료

---

## 구현 요약

색상을 palette-agnostic semantic 토큰(CSS 변수, `R G B` 채널)으로 추상화하고, `:root`(라이트=현행값, 회귀 0)/`.dark`(확정 핫핑크값) 변수 세트를 구축했다. 런타임 테마 분기(localStorage · `prefers-color-scheme` · persist · 토글)를 전부 제거하고, **단일 상수 `APP_THEME` 한 줄로 전체 앱을 라이트↔다크로 전환**하도록 만들었다. 전역 CSS(body·스와이퍼·네비버튼)를 semantic 토큰으로 치환하고, 한글 폰트 Noto Sans KR을 도입했다.

> 현 상태: `APP_THEME='dark'`면 `<html class="dark">`가 서버에서 정적 렌더되어 전역 크롬(body 배경 `#141414` 등)은 다크로 표시된다. 단, **미치환 컴포넌트(114파일)는 아직 기존 `dark:` 팔레트를 사용**하므로 실제 다크 릴리스는 4~6단계 완료가 게이트다.

---

## 변경 파일

### 1단계 — semantic 토큰 & CSS 변수 스캐폴딩
- `tailwind.config.ts:44-63` — semantic 색상 토큰 추가: `surface(+sunken/elevated/elevated-hover)`, `border.default`, `brand(+hover)`, `danger`, `overlay`. 모두 `rgb(var(--color-*) / <alpha-value>)` 형식 → `bg-surface/50` alpha 유틸 정상 동작.
- `tailwind.config.ts:106-111` — 기존 `text` 객체에 `text.primary/muted/inverse` 추가(`text-text-primary` 등).
- `tailwind.config.ts:30-32` — `fontFamily.sans`에 `var(--font-noto-sans-kr)` 폴백 추가.
- `app/globals.css:44-79` — `:root`(라이트, 현행값)·`.dark`(다크, 확정값)에 `R G B` 채널 CSS 변수 12종 정의. 데드였던 `.dark` 주석 블록 대체.
- `src/shared/lib/utils/cn.ts:7-27` — `text-color`/`bg-color`/`border-color` classGroup에 신규 semantic 토큰 등록(tailwind-merge 충돌 방지).

### 2단계 — 코드 레벨 스위치 & 런타임 테마 분기 제거
- `src/shared/config/theme.ts` **(신규)** — `APP_THEME: 'light' | 'dark' = 'dark'` + 파생 상수 `IS_DARK_THEME`. **전체 전환 스위치.**
- `app/layout.tsx:62-68` — `<html>` className에 `IS_DARK_THEME ? ' dark' : ''` 정적 적용(서버 확정, FOUC 없음).
- `app/layout.tsx` — 기존 `theme-init` 인라인 Script(localStorage + `prefers-color-scheme`) **제거**. (viewport-height Script는 유지)
- `app/providers.tsx` — `prefers-color-scheme`/localStorage 다크 동기화 effect **제거**, `useThemeStore` import 및 `useThemeStore.persist.rehydrate()` 호출 제거, 스켈레톤 색을 `IS_DARK_THEME` 상수 기준으로 단순화(`#3A3A3A`/`#4A4A4A` ↔ `#E5E7EB`/`#F3F4F6`).
- `store/useStoreData.ts:657-666` — `useThemeStore`를 persist 없이 `APP_THEME` 고정값으로 중립화(`isDarkMode: IS_DARK_THEME`, 토글 no-op). 기존 소비처(`header.tsx`, `Portal.tsx`) 호환을 위해 export 시그니처는 유지.
- `store/useStoreData.ts:5` — `IS_DARK_THEME` import 추가.

### 3단계 — 전역/인프라 하드코딩 치환
- `app/globals.css` — body `@apply bg-surface text-text-primary`, `.dark body` 규칙 제거(변수 스왑으로 대체).
- `app/globals.css` — 스와이퍼 네비/페이지네이션·`.navigation-button`·카드/작가 그리드 버튼의 `#6b7280`·`#e5e7eb`·`#4f46e5`·`#6366f1`·`rgba(...)`를 `rgb(var(--color-*))`로 치환하고, 대응 `.dark` 규칙 제거.

### 7단계 — 한글 폰트 Noto Sans KR
- `app/layout.tsx:3,26-31` — `Noto_Sans_KR`(latin subset, weight 400/500/700, `display:swap`, `--font-noto-sans-kr`) 도입. korean subset은 프리로드하지 않고 unicode-range 폴백으로 처리(초기 로드 부담 최소화).

---

## 다크 팔레트 확정값 (구현 반영)

| 토큰 | 다크 (`.dark`) | 라이트 (`:root`) |
|---|---|---|
| `surface` | `20 20 20` (#141414) | `255 255 255` |
| `surface-sunken` | `15 15 15` (#0F0F0F) | `255 255 255` |
| `surface-elevated` | `58 58 58` (#3A3A3A) | `255 255 255` |
| `surface-elevated-hover` | `74 74 74` (#4A4A4A) | `241 242 242` |
| `border-default` | `42 42 42` (#2A2A2A) | `229 231 235` |
| `text-primary` | `255 255 255` | `16 16 16` |
| `text-muted` | `168 168 168` (#A8A8A8) | `107 114 128` |
| `text-inverse` | `255 255 255` | `255 255 255` |
| `brand` | `255 46 126` (#FF2E7E) | `67 45 241` (#432df1) |
| `brand-hover` | `255 74 144` (#FF4A90) | `90 70 250` |
| `danger` | `255 66 66` (#FF4242) | `255 66 66` |
| `overlay` | `0 0 0` | `0 0 0` |

---

## 검증 결과
- **타입**: `npx tsc --noEmit` 통과.
- **빌드**: `npm run build` 통과 (24 라우트 정상 생성).
- **포맷**: Biome가 변경 파일을 프로젝트 컨벤션(세미콜론·싱글쿼트·2-space)으로 정리.
- **스위치 스모크**: `APP_THEME='dark'` → `<html class="dark">` 정적 렌더 / `'light'` → 클래스 제거. localStorage·시스템 설정과 무관하게 상수만 따름.

---

## 계획과 달라진 점 / 미완 · 후속 필요

### 미완 (계획 4·5·6단계 — 사용자 결정으로 이번 범위 제외)
- 공용 UI(`src/shared/ui`, `components/elements`, `components/modal`)·레거시 `views/*`·시각 비중 큰 페이지의 하드코딩 색상(원시유틸 425회/114파일 + HEX 55회/19파일)을 semantic 토큰으로 치환하고 색상 `dark:` 유틸을 제거하는 배치 작업이 남음.
- **릴리스 게이트**: 위 치환이 끝나기 전 `APP_THEME='dark'` 릴리스 시, 미치환 컴포넌트는 기존 `dark:` 팔레트/흰 배경으로 혼재 렌더됨.

### 참고 / 확인 필요
- **기존 lint 경고 잔존**: `app/layout.tsx`의 **viewport-height** Script `dangerouslySetInnerHTML`(Biome `noDangerouslySetInnerHtml`) — 이번 변경과 무관한 레거시 코드로 그대로 유지함.
- **`header.tsx`/`Portal.tsx`**: 중립화된 `useThemeStore`(상수 `isDarkMode`)를 계속 소비. 런타임 classList 동기화 로직이 남아 있으나 정적 클래스와 동일 결과라 무해. 4~6단계에서 정리 대상.
- **육안 확인 권장(계획 확인필요 1)**: 비성인 화면에서도 다크 brand(#FF2E7E)가 의도대로 보이는지 최종 확인.

### 롤백
- semantic 토큰·`APP_THEME`는 추가분이므로, 급하면 `APP_THEME='light'` 한 줄로 라이트 회귀 가능(치환 완료분은 라이트 변수로 정상 표시).
