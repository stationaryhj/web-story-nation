# StoryNation — 톤앤매너/테마 변경 리뷰

- **리뷰 일자**: 2026-07-06
- **대상 브랜치 / 커밋**: `red-main` / `531dc93`
- **목적**: 전체 페이지의 톤앤매너(background / line / font / 컬러)를 바꿔 다크 모드 또는 전체 분위기 전환
- **스택**: Next.js 16 · React 19 · TypeScript · Tailwind 3 (`darkMode: 'class'`) · Zustand

---

## 결론 먼저

**다크 모드 인프라는 이미 80% 구축되어 있으나, ①토글 UI가 주석 처리되어 죽어 있고 ②색상 관리 방식이 3중으로 분산되어 있어 "한 곳만 바꾸면 전부 바뀌는" 구조가 아니다.** 톤앤매너를 바꾸려면 색상 정의처를 단일화하는 작업이 선행되어야 한다. 현재 상태로 색만 바꾸면 화면 곳곳에 라이트 모드 잔재(하드코딩된 `bg-white`, `#hex`)가 남는다.

---

## 1. 현재 테마 인프라 (이미 존재하는 것)

| 구성요소 | 위치 | 상태 |
|---|---|---|
| 다크모드 방식 | `tailwind.config.ts` → `darkMode: 'class'` | ✅ `<html class="dark">` 토글 방식 |
| 다크 색상 팔레트 | `tailwind.config.ts` → `colors.dark.{primary,secondary,background,accent}` | ✅ 정의됨 |
| 테마 상태 스토어 | `store/useStoreData.ts` → `useThemeStore` (`isDarkMode`, `toggleDarkMode`, localStorage `theme-storage`) | ✅ 동작 |
| 초기 테마 주입 스크립트 | `app/layout.tsx` (`beforeInteractive` 인라인 스크립트) | ✅ FOUC 방지용, 시스템 다크모드 감지 포함 |
| 클래스 동기화 | `app/providers.tsx:146-166` (`isDarkMode` → `documentElement.classList`) | ✅ 동작 |
| 스켈레톤 테마 연동 | `app/providers.tsx:169-170` (다크/라이트 색상 분기) | ✅ 동작 |
| 포탈/모달 다크 대응 | `components/portal/Portal.tsx` (`dark-portal` 클래스) | ✅ 동작 |
| `dark:` 유틸 사용 | 95개 파일 · 1019회 | 🟡 광범위하나 커버리지 불균일 |

### 핵심 발견 🔴 — 토글 UI가 죽어 있음
- `components/common/header.tsx:241-` 다크모드 토글 버튼이 **주석 처리**됨
- `components/elements/sidebar/HeaderSidebar.tsx:77-85` 사이드바 토글도 **주석 처리**됨
- `useThemeStore`의 기본값은 `isDarkMode: false`
- 즉, **인프라는 살아 있는데 사용자가 켤 방법이 없는 상태**. 시스템이 다크모드면 `prefers-color-scheme`로 자동 적용되긴 함(잔재 때문에 깨져 보일 가능성 큼).

---

## 2. 색상이 정의된 곳 — 3중 분산 (톤 변경의 최대 장애물)

톤앤매너를 바꾸려면 아래 **3개 계층을 모두** 손봐야 한다. 하나만 바꾸면 나머지가 어긋난다.

### 계층 A — Tailwind 토큰 (`tailwind.config.ts`)
- `primary`(#432df1 계열), `secondary`, `accent`, `background`, `button`, `text.black`, `icons.primary`
- `dark.primary` / `dark.secondary` / `dark.background` / `dark.accent` — 다크 전용 팔레트
- `v2.*` (신규 디자인 토큰: `v2.black`, `v2.gray`, `v2.red`, `v2.purple`) — FSD 이행 중 도입된 것으로 보이는 **또 다른 팔레트 세트**
- `backgroundImage.gradient-dark`

> ⚠️ `primary`/`secondary`와 `v2.*`가 **역할 중복**. 어떤 컴포넌트는 `primary-500`을, 신규 컴포넌트는 `v2.purple`을 쓴다. 톤 변경 시 두 세트를 함께 정의해야 함.

### 계층 B — CSS 변수 (`app/globals.css` `:root`)
- `--background`, `--primary`, `--secondary`, `--on-primary`, `--on-background` 등
- `.dark { ... }` 블록은 **전체 주석 처리**되어 있음(43~91줄) → CSS 변수 기반 다크 대응은 미완성
- 이 변수들이 실제로 얼마나 쓰이는지 별도 확인 필요(상당수가 레거시/데드일 가능성)

### 계층 C — 하드코딩 (컴포넌트 인라인)
- `bg-white` / `text-gray-900` / `text-black` / `text-white` 등 **원시 유틸 클래스: 114개 파일에 425회**
- `#RRGGBB` **하드코딩 hex: 다수 파일에 57회+** (tsx 기준), CSS에도 존재
  - 예: `app/layout.tsx:122` `<body class="... bg-white dark:bg-gray-900 ...">` — 하드코딩
  - `app/globals.css` navigation-button `#6b7280`, swiper `#4f46e5`, 스켈레톤 `#E5E7EB` 등
- 이것들이 **톤 변경 시 가장 많은 수작업을 유발하는 지점**

---

## 3. 다크 대응 전략이 혼재됨

같은 다크모드인데 두 가지 방식이 섞여 있다:

1. **원시 그레이 방식**: `bg-white dark:bg-gray-900`, `text-gray-900 dark:text-gray-200` — 대부분의 레거시 컴포넌트 + `globals.css` body
2. **전용 팔레트 방식**: `dark:bg-dark-background`, `dark:text-dark-secondary-500` — 헤더/사이드바 등 일부

→ 톤을 바꾸면 두 방식의 결과 색이 서로 안 맞아 **얼룩덜룩해진다**. 하나로 통일이 필요.

---

## 4. `dark:` 커버리지 불균일 (파일별 밀도)

리뷰 기준 밀도가 높은 곳(대응 잘 됨)과 거의 없는 곳(대응 누락)이 공존:

- **양호**: `components/modal/CharactorModal.tsx`(92), `CharactorOpenModal.tsx`(71), `BasicInfoForm.tsx`(55), `NotificationSidebar.tsx`(51)
- **취약(페이지 단위인데 `dark:` 1~3개)**: `views/main/home.tsx`(1), `views/my-characters/home.tsx`(3), `views/search/home.tsx`(7), 다수 `app/(routes)/payment/*`, `chat/[id]/page.tsx`(2)
- **거대 파일 주의**: `views/chat/detail.tsx`(1600+줄, `dark:` 23) — 채팅방은 시각 비중이 큰데 대응이 부족할 수 있음

→ 다크/신규 톤을 켜면 이 취약 페이지들이 흰 배경으로 튄다.

---

## 5. 폰트

- `app/layout.tsx` → `next/font/google`의 **Poppins**(라틴 전용, weight 400/500/600/700) → `--font-poppins` → `tailwind.config` `fontFamily.sans`
- ⚠️ **한글 폰트 미지정**: Poppins는 라틴 서브셋만 로드하므로 한글은 브라우저 기본 폰트로 폴백된다. 톤앤매너를 손보는 김에 한글 웹폰트(Pretendard, Noto Sans KR 등) 도입을 함께 검토 권장.

---

## 6. 권장 접근 (순서)

톤앤매너를 안전하게 바꾸기 위한 단계:

1. **색상 토큰 단일화(semantic token화)**
   - `tailwind.config.ts`에 의미 기반 토큰 정의: `surface`, `surface-elevated`, `border`, `text-primary`, `text-muted`, `brand` 등
   - 값을 CSS 변수로 뽑아 `:root`(라이트)와 `.dark`(다크/신규 톤)에서 스왑 → **한 곳에서 전체 분위기 전환** 가능
   - `primary` vs `v2.*` 중복 정리, 사용처 통일
2. **하드코딩 제거(마이그레이션)**
   - `bg-white`/`text-gray-900`/`#hex` 425+57회를 semantic 토큰으로 치환 (스크립트 + 리뷰 병행)
   - `app/layout.tsx:122`, `app/globals.css`의 하드코딩 색부터
3. **다크 전략 통일**: 원시 그레이 방식 → 전용 팔레트/토큰 방식으로 일원화
4. **토글 UI 복구**: `header.tsx` / `HeaderSidebar.tsx`의 주석 처리된 토글 되살리기 (또는 톤 전환이 상시 적용이면 스토어 기본값/스크립트만 조정)
5. **취약 페이지 보강**: `dark:` 밀도 낮은 `views/*` 페이지 개별 점검
6. **폰트**: 한글 웹폰트 도입 여부 결정

> **가장 깔끔한 방향**: CSS 변수 + Tailwind semantic 토큰으로 색을 추상화하면, 이후 "다크 모드"든 "완전히 다른 무드"든 변수 세트만 갈아끼워 전체 페이지를 한 번에 바꿀 수 있다. 지금의 3중 분산 구조에서는 그게 불가능하다.

---

## 관련 파일 인덱스

| 목적 | 파일 |
|---|---|
| 색 토큰 정의 | `tailwind.config.ts` |
| CSS 변수 / 전역 스타일 | `app/globals.css`, `styles/globals.css` |
| 테마 상태 | `store/useStoreData.ts` (`useThemeStore`) |
| 초기 주입/동기화 | `app/layout.tsx`, `app/providers.tsx` |
| 토글 UI (주석 상태) | `components/common/header.tsx`, `components/elements/sidebar/HeaderSidebar.tsx` |
| 포탈/모달 다크 | `components/portal/Portal.tsx` |
| 스켈레톤 테마 | `app/providers.tsx`, `components/elements/skeleton/SkeletonTheme.tsx` |
</content>
</invoke>
