# StoryNation — 톤앤매너/테마 semantic 토큰화 구현 계획 (v2)

- **작성 일자**: 2026-07-06
- **대상 브랜치 / 커밋**: `red-main` / `531dc93`
- **목표 한 줄 요약**: 색상을 semantic 토큰 + CSS 변수로 단일화하고, **코드 상수 한 개**로 앱 전체를 라이트↔다크로 전환. 다크는 첨부 스크린샷 기반 핫핑크 무드로 확정 적용, 한글 폰트 Noto Sans KR 도입, 전체 일괄 릴리스.
- **선행 문서**: `docs/review/theming-tone-manner-20260706.md`, `docs/plan/plan-20260706-theming-semantic-tokens.md`(v1)

---

## v1 대비 변경점 (요약)

| 항목 | v1 | v2 (확정 반영) |
|---|---|---|
| 테마 전환 | 토글 UI 복구 여부 미결 | **토글 UI 없음.** 코드 레벨 상수(`APP_THEME`) 1개로 전환. 런타임 분기(localStorage/`prefers-color-scheme`/store 토글) **제거** |
| 다크 팔레트 값 | "확인 필요"로 보류 | **실제 HEX 확정** — semantic→`.dark` CSS 변수 매핑 표 추가 |
| 브랜드 hue | primary/v2 통일 미결 | 단일 `brand` 토큰. **라이트=#432df1(블루 유지)·다크=#FF2E7E** 모두 확정 |
| 한글 폰트 | 도입 여부 미결 | **Noto Sans KR 확정** — 구체 단계 추가 |
| 롤아웃 | 방식 미결 | **전체 일괄 릴리스** 확정(작업/검증은 계속 분할) |
| "확인 필요" | 5개 | 1개로 축소(성인모드 핑크 성격 육안확인만). 라이트 brand=블루 확정 |
| 단계 6 | "토글 UI 복구" | **"코드 레벨 스위치 + 런타임 테마 분기 제거"로 교체** |

---

## 목표

색을 palette-agnostic semantic 토큰(CSS 변수)으로 추상화하고, `:root`(라이트)/`.dark`(다크) 변수 세트를 두어 **단일 상수 `APP_THEME`로 전체 앱 톤을 스위칭**한다. 다크 무드는 확정된 핫핑크 팔레트로 구현한다.

---

## 남은 확인 필요 사항 (1개, 육안 확인 수준)

1. **다크 핑크(#FF2E7E)의 성격 — 대체로 해소, 육안 확인만 권장**
   - 코드 조사 결과: 성인모드(`store/useStoreSettings.ts`)는 `isAdultModeEnabled`로 **데이터 필터링/`updateSafetyMode`만** 제어하고 **스타일 분기가 없다**(`CharacterGridSection.tsx:85`도 데이터 reload 트리거로만 사용). → 핑크는 성인모드 전용이 아니라 **전역 다크 브랜드색**으로 판단됨.
   - 잔여 리스크: 스크린샷이 성인모드 상태였으므로, 비성인 화면에서도 동일 핑크가 브랜드로 쓰이는지 **육안 최종 확인** 권장(코드상 커플링은 없음).

### 해소된 결정
- **라이트 모드 `brand` = 현행 블루 `#432df1` 유지 (확정, 2026-07-06)**. 핑크 통일하지 않음. 즉 `brand` 토큰은 라이트=`#432df1`, 다크=`#FF2E7E`로 모드별 스왑.
- 카드 오렌지 실드 뱃지(#FF8A00)는 core 토큰으로 승격하지 않고 뱃지 국소 색으로 유지.

---

## 현황 파악 (실제 코드 근거, v1에서 검증분 + 추가)

### 테마 인프라 (전환 방식이 바뀌므로 제거/중립화 대상)
- `tailwind.config.ts:16` `darkMode:'class'`, 팔레트 `:44-151`(전부 하드코딩 HEX, 변수 간접참조 없음).
- `store/useStoreData.ts:657-677` `useThemeStore`(`isDarkMode:false`, `toggleDarkMode`, persist `theme-storage`, `skipHydration:true`) → **런타임 분기, v2에서 제거/중립화**.
- `app/layout.tsx:61-93` `beforeInteractive` 테마 초기화 스크립트(localStorage + `prefers-color-scheme`) → **제거 대상**.
- `app/providers.tsx:136-166` `isDarkMode`→`documentElement.classList` 동기화 effect → **제거 대상**. `:169-170` 스켈레톤 색 하드코딩(`#E5E7EB/#F3F4F6` 라이트, `#1E293B/#334155` 다크).
- 토글 UI 주석: `components/common/header.tsx:241-251`, `components/elements/sidebar/HeaderSidebar.tsx:77-85` → **복구하지 않음(삭제 유지)**.

### 색상 3중 분산
- A. Tailwind 토큰 `tailwind.config.ts:44-151`. B. CSS 변수 `app/globals.css:44-61`(Tailwind와 미연결=데드), `.dark` 블록 전체 주석(`:63-91`). C. 하드코딩 원시유틸 **425회/114파일**, HEX **55회/19파일(tsx)** + `app/globals.css` 내부 HEX.
- `app/layout.tsx:122` body `bg-white dark:bg-gray-900`. `app/globals.css:116-123` body `@apply`. `app/globals.css` HEX: `#6b7280`(228), `#e5e7eb`(219,222), `#4f46e5`/`#6366f1`(326-341).

### 다크 전략 혼재 (실측)
- 전용 팔레트(`dark:bg-dark-*`/`dark:text-dark-*`): 85파일(주류). 원시 그레이(`dark:bg-gray-*`/`dark:text-gray-*`): 22파일. → semantic 변수 스왑으로 색상 `dark:` 자체를 불필요화하며 통일.

### FSD / 기타
- `src/shared/config/`(apiRoute, animations) 존재 → **`APP_THEME` 상수를 여기 신설**(`src/shared/config/theme.ts`)하는 것이 컨벤션에 부합.
- `src/shared/lib/utils/cn.ts:5-12` `extendTailwindMerge` classGroup에 semantic 토큰 등록 필요.
- **`styles/globals.css`는 어디서도 import 안 됨 = 데드**. 실제 적용 전역 CSS는 `app/globals.css`(`app/layout.tsx:6`) 하나뿐 → 이번 범위는 `app/globals.css`만.
- 성인모드 `store/useStoreSettings.ts:11-63` = 데이터 필터 전용(스타일 무관).

---

## 접근 방식

### 색 추상화 (v1과 동일 채택): CSS 변수(RGB 채널) + Tailwind semantic 매핑
- `app/globals.css` `:root`(라이트)·`.dark`(다크)에 의미 기반 변수를 **`R G B` 채널 3값**으로 정의.
- `tailwind.config.ts`에서 `surface: 'rgb(var(--color-surface) / <alpha-value>)'` 식 매핑 → `bg-surface/50` alpha 유틸 정상 동작.
- 컴포넌트는 의미 클래스 1개만 사용 → 색상용 `dark:` 불필요(변수가 `.dark`에서 자동 스왑) → 다크 전략 혼재 자연 해소.

### 전환 메커니즘 (v2 신규 결정): 코드 레벨 상수 + `.dark` 클래스 고정

추천안: **`.dark` 클래스 스위치를 유지하되, 이를 런타임 상태가 아니라 빌드/모듈 상수로 고정**한다.

- `src/shared/config/theme.ts`에 `export const APP_THEME: 'light' | 'dark' = 'dark'` 하나만 둔다. **이 값 한 줄만 바꾸면 전체 전환.**
- `app/layout.tsx`(서버 컴포넌트)에서 `<html className={... APP_THEME === 'dark' ? 'dark' : ''}>`로 **정적 적용**. 서버에서 확정되므로 FOUC/하이드레이션 불일치 없음 → **초기화 스크립트 불필요**.
- 모든 기존 `.dark` CSS 선택자와 우리가 넣을 `.dark` 변수 세트가 그대로 적용됨 → 최소 변경.

대안 비교:

| 대안 | 장점 | 단점 | 판정 |
|---|---|---|---|
| **A. `.dark` 클래스 상수 고정 (추천)** | 기존 `.dark`/`dark:` 자산 그대로 재사용, layout 1곳 + 상수 1개만 수정, SSR 안전 | `.dark` 클래스 관례 잔존 | ✅ |
| B. `:root`에 선택 모드 변수 직접 주입(`.dark` 미사용) | 클래스 개념 제거로 순수함 | 잔존 `dark:` 유틸·`.dark` CSS 규칙 전부 재작성 필요(범위 폭증) | ✗ |

> 결론: A. "간단한 상수 한 줄 스위치" 요구에 가장 부합하고, 마이그레이션 과정에서 `.dark` 스왑을 그대로 활용 가능.

### 런타임 테마 분기 제거 (신규)
- `useThemeStore`(`store/useStoreData.ts:657-677`) 관련 참조 제거/중립화, `theme-storage` persist 및 `initializeTheme` 흐름 제거.
- `app/layout.tsx:61-93` 테마 초기화 Script 제거.
- `app/providers.tsx:136-166` 다크 동기화 effect 제거. 스켈레톤 색(`:169-170`)은 `APP_THEME`(또는 CSS var) 기준 상수로 단순화.

### 토큰/유틸 배치
- semantic 토큰: `tailwind.config.ts`(루트, content 글롭이 FSD·레거시 모두 커버).
- CSS 변수: `app/globals.css` `:root`/`.dark`.
- 전환 상수: `src/shared/config/theme.ts`(신규, FSD config 컨벤션).
- cn 등록: `src/shared/lib/utils/cn.ts`.
- 기존 `primary/secondary/v2.*`는 즉시 삭제하지 않고 유지(대량 참조 보호), 신규/치환분만 semantic으로. 통일 삭제는 확인필요 2 결정 후.

---

## 다크 팔레트 → semantic 토큰 → CSS 변수 매핑 (확정값)

`.dark` 블록에 아래 값을, `:root`(라이트)에는 현행값 유지(회귀 0). RGB 채널 표기.

| semantic 토큰 (Tailwind) | 역할 | 다크 HEX | `.dark` 변수 (`R G B`) | 라이트(`:root`) |
|---|---|---|---|---|
| `surface` | 페이지/콘텐츠 배경 | `#141414` | `20 20 20` | 현행 `#FFFFFF` = `255 255 255` |
| `surface-sunken` | 헤더/사이드바/푸터 등 짙은 크롬 면 | `#0F0F0F` | `15 15 15` | 현행 라이트 대응값 |
| `surface-elevated` | 카드/칩/비활성 pill | `#3A3A3A` | `58 58 58` | 현행 라이트 대응값 |
| `surface-elevated-hover` | elevated 호버 | `#4A4A4A` | `74 74 74` | 현행 |
| `border-default` | 라인/디바이더 | `#2A2A2A` | `42 42 42` | 현행 `border-gray-200` 대응 |
| `text-primary` | 제목/활성 본문 | `#FFFFFF` | `255 255 255` | 현행 `#101010`/`gray-900` |
| `text-muted` | 설명/비활성/카운트 | `#A8A8A8` | `168 168 168` | 현행 `gray-500` 대응 |
| `text-inverse` (=on-brand) | 브랜드 필 위 텍스트 | `#FFFFFF` | `255 255 255` | 현행 흰색 유지 |
| `brand` | 활성 pill/로고/활성 nav | `#FF2E7E` | `255 46 126` | **`#432df1` = `67 45 241`** (블루 유지, 확정) |
| `brand-hover` | 브랜드 호버 | `#FF4A90` | `255 74 144` | 현행 `#5a46fa` = `90 70 250` |
| `danger` | 경고/삭제 | 현행 `#FF4242`(v2.red) | `255 66 66` | 동일 |
| `overlay` | 모달 백드롭 | `rgba(0,0,0,.6)` | `0 0 0`(+alpha 유틸) | 동일 |

- **오렌지 실드 뱃지 `#FF8A00`**: core 토큰 승격 X 권장 — 콘텐츠 오버레이 국소 색. 필요 시 뱃지 컴포넌트 국소 상수로만 유지.
- **`brand-subtle`(옵션)**: 핑크 12% 틴트 배경이 필요하면 `bg-brand/10` alpha 유틸로 대체(별도 토큰 불필요).

---

## 실행 계획 (단계별)

### 1단계 — semantic 토큰 셋 & CSS 변수 스캐폴딩 (라이트=현행값, 다크=위 표)
- `tailwind.config.ts` `colors`에 semantic 토큰 추가(위 표), `app/globals.css` `:root`/`.dark`에 변수 정의.
- `.dark`는 위 확정 다크값, `:root`는 현행 라이트값과 동일하게 채워 넣어 **컴포넌트 미치환 상태에서 화면 무변화**(회귀 기준선).
- `src/shared/lib/utils/cn.ts` classGroup에 신규 토큰 등록.
- **검증**: `npm run build` + `tsc --noEmit` 통과. `.dark` 클래스 강제 부여 시 body 외 변화 없음(아직 토큰 미사용).

### 2단계 — 코드 레벨 스위치 도입 & 런타임 테마 분기 제거
- `src/shared/config/theme.ts` 신설: `export const APP_THEME: 'light' | 'dark' = 'dark'`.
- `app/layout.tsx`: `<html>` className에 `APP_THEME==='dark'?'dark':''` 정적 적용. 테마 초기화 Script(`:61-93`) 제거. body className(`:122`)은 3단계에서 토큰화.
- `app/providers.tsx`: 다크 동기화 effect(`:136-166`) 제거, 스켈레톤 색(`:169-170`)을 `APP_THEME` 기준 상수로.
- `store/useStoreData.ts:657-677` `useThemeStore` 참조 제거/중립화(안전하게 export는 남기되 사용처 정리, 또는 완전 제거 — 사용처 grep으로 확정).
- 헤더/사이드바 주석 토글은 그대로 삭제 유지.
- **검증**: `APP_THEME='dark'`로 앱 로드 시 `<html class="dark">` 정적 렌더(뷰 소스 확인), `APP_THEME='light'`로 바꾸면 클래스 사라짐. localStorage/`prefers-color-scheme` 무관하게 상수만 따르는지 확인.

### 3단계 — 전역/인프라 하드코딩 치환
- `app/globals.css:116-123` body `@apply bg-white text-gray-900` → `bg-surface text-text-primary`, `.dark body` 규칙 제거(변수 스왑 대체).
- `app/layout.tsx:122` body → `bg-surface font-sans`(색상 `dark:` 제거).
- `app/globals.css` HEX(`#6b7280`228, `#e5e7eb`219/222, `#4f46e5`/`#6366f1`326-341) → `var(--color-*)` 치환, 대응 `.dark` 규칙 제거.
- **검증**: `.dark` 상태에서 body 배경 `#141414`, 스와이퍼/네비버튼 색 정상. 변수 세트 임시 교체로 "한 곳→전체 반영" 확인.

### 4단계 — 공용 UI 치환 (`src/shared/ui`, `components/elements`, `components/modal`)
- 매핑 표 기준 semantic 치환 + 색상 `dark:` 제거. 배치(디렉토리) 단위 커밋.
- 대상: `src/shared/ui/{modal,form}/*`, `components/elements/{card,button,sidebar,modal,dropdown,filters,pagination}/*`, `components/modal/*`.
- **검증**: 배치별 대표 화면(모달/카드/폼) 다크 육안 QA + `git diff`로 `text-white`/`bg-white` 오매핑 검수.

### 5단계 — 레거시 `views/*` & 시각 비중 큰 페이지
- `views/*` 페이지 셸 치환. 리뷰 취약 페이지 우선: `views/main/home.tsx`, `views/my-characters/home.tsx`, `views/search/home.tsx`, `app/(routes)/payment/*`, **`views/chat/detail.tsx`(1600줄, 단독 배치)**.
- **검증**: 각 페이지 다크 진입 시 흰 배경 튐 0, 텍스트 대비 WCAG AA. 채팅 버블 대비 집중 검수.

### 6단계 — 색상 `dark:` 잔재 정리 & 전략 일원화
- 치환된 부분의 색상 `dark:` 유틸 제거 확인, 원시 그레이 방식(22파일) 흡수.
- **검증**: `grep -c "dark:(bg|text|border)-(gray|dark)-"` 잔량 추적(색상 아닌 `dark:`는 유지 가능).

### 7단계 — 한글 폰트 Noto Sans KR 도입 (확정)
- `app/layout.tsx`:
  ```ts
  import { Poppins, Noto_Sans_KR } from 'next/font/google'
  const notoSansKr = Noto_Sans_KR({
    subsets: ['latin'],          // korean 글리프는 unicode-range로 로드(프리로드 X, 용량 큼)
    weight: ['400', '500', '700'],
    variable: '--font-noto-sans-kr',
    display: 'swap',
  })
  ```
  `<html className={`${poppins.variable} ${notoSansKr.variable} ${darkClass}`}>`.
- `tailwind.config.ts:30-32` `fontFamily.sans`: `['var(--font-poppins)', 'var(--font-noto-sans-kr)', 'sans-serif']`.
  - 라틴은 Poppins 우선, 한글은 Poppins에 글리프가 없어 자동으로 Noto Sans KR로 폴백.
- **비용/주의**: Noto Sans KR 한글 글리프는 용량이 커 `subsets`에 `korean`을 강제 프리로드하면 초기 로드 부담↑ → `latin`만 subset 지정하고 한글은 `display:swap` + unicode-range 폴백으로 처리. FOUT 최소화 위해 weight는 실사용 3종으로 제한.
- **검증**: 한글 텍스트가 Noto Sans KR로 렌더되는지 DevTools 확인, CLS/폰트 로드 성능 측정, 굵기별 렌더 확인.

### 하드코딩 → semantic 매핑 표 (3~5단계 공통)

| 기존 | 치환 | 비고 |
|---|---|---|
| `bg-white` | `bg-surface` / 카드·모달 `bg-surface-elevated` | 문맥 구분 |
| `bg-gray-900`(다크 body) | 제거(변수 스왑) | |
| `text-gray-900`,`text-black` | `text-text-primary` | |
| `text-gray-500/600`, `#6b7280` | `text-text-muted` | |
| `text-white` | `text-text-inverse` | ⚠️ 브랜드 위/딥배경 위 **수동 판별** |
| `border-gray-200/300` | `border-border-default` | |
| `#432df1`,`#4f46e5`,`v2.purple` | `brand` | 라이트=#432df1(유지), 다크=#FF2E7E |
| `#FF4242`,`v2.red` | `danger` | |

---

## 안전한 대량 치환(425+55) 전략

- **codemod 1차 기계 치환 + `git diff` 수동 검수** 병행(스크립트는 일회성 도구, 소스 미커밋).
- `text-white`/`bg-white`는 문맥 의존 → 자동 일괄 금지, 파일별 검토.
- **배치 단위 커밋**(디렉토리/피처)으로 롤백 범위 최소화. 단, **릴리스는 전체 일괄**(브랜치 완성 후 한 번에 머지).
- **회귀 기준선**: 1단계 라이트 무변경 → 각 배치 diff는 "클래스명만 바뀌고 렌더 색 동일"이 정상(전/후 스크린샷 비교).
- **잔여 지표**: 원시유틸 425→0, HEX 55→0, 색상 `dark:` 감소 추세를 `grep -c`로 배치마다 기록.

---

## 영향 범위 & 리스크

- **파급**: 전역 CSS·layout·providers·store(인프라) + 114개 tsx + `tailwind.config.ts`. 전 화면.
- **다크 상시 적용 리스크**: `APP_THEME='dark'` 릴리스 시 **모든 사용자가 즉시 다크**. 치환 누락 페이지는 흰 배경 튐 → 5단계 취약 페이지·6단계 잔재 정리 완료가 릴리스 게이트.
- **핑크 성인모드 커플링**: 코드상 없음(데이터 필터 전용). 잔여는 비성인 화면 육안 확인만(확인필요 1).
- **결제 민감(`app/(routes)/payment/*`, TossPayments)**: className만 수정, 결제 로직/토큰/상태 불변 확인.
- **RGB 채널 규약**: 변수는 `R G B` 숫자만(단위/`#` 금지) — 어기면 alpha 유틸 붕괴. 1단계에서 고정.
- **런타임 분기 제거 부작용**: `useThemeStore`/`theme-storage` 참조처 누락 시 런타임 에러 → 제거 전 grep으로 사용처 전수 확인.
- **롤백**: 배치 커밋 revert. semantic 토큰·`APP_THEME`는 추가분이라 컴포넌트 치환만 되돌리면 기존 팔레트 복귀. 급하면 `APP_THEME='light'` 한 줄로 라이트 회귀(단, 치환 완료분은 라이트 변수로 정상 표시돼야 함).

---

## 검증 방법

- **빌드/타입**: 단계별 `npm run build` + `tsc --noEmit`.
- **스위치 스모크**: `APP_THEME` 값만 바꿔 앱 전체가 라이트↔다크로 일괄 전환되는지(목표 달성 판정 기준).
- **시각 회귀**: 라이트/다크 두 상태 대표 플로우(홈·검색·캐릭터·모달·채팅방·결제·설정) 육안 + 전/후 스크린샷.
- **다크 색 정합**: 배경 #141414 / 크롬 #0F0F0F / 카드 #3A3A3A / 브랜드 #FF2E7E / 텍스트 #FFFFFF·#A8A8A8 / 라인 #2A2A2A 렌더 확인.
- **폰트**: 한글 Noto Sans KR 렌더 + 성능(CLS) 확인.
- **잔여 카운트/접근성**: `grep -c` 잔량, 주요 텍스트/배경 WCAG AA 대비비.

---

## 범위 밖 (하지 않을 것)

- 사용자 대면 다크/라이트 토글 UI 제작(명시적으로 안 함).
- `primary`/`secondary`/`v2.*` 레거시 토큰의 완전 통합·삭제(치환 완료 후 별도 후속. 라이트 brand=#432df1은 확정됐으나 대량 참조 보호를 위해 즉시 삭제하지 않음).
- 데드 파일 `styles/globals.css` 정리(별도 이슈).
- 오렌지 실드 뱃지(#FF8A00) core 토큰 승격.
- 색상 외 레이아웃/애니메이션/간격 리팩터.
