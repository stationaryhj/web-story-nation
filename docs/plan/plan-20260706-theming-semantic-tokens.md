# StoryNation — 톤앤매너/테마 semantic 토큰화 구현 계획

- **작성 일자**: 2026-07-06
- **대상 브랜치 / 커밋**: `red-main` / `531dc93`
- **목표 한 줄 요약**: 색상 정의를 semantic 토큰 + CSS 변수로 단일화해, 이후 변수 세트만 갈아끼우면 전체 페이지 톤(다크/신규 무드)이 한 번에 바뀌는 구조로 전환한다.
- **선행 리뷰**: `docs/review/theming-tone-manner-20260706.md`

---

## 목표

색상을 **palette-agnostic semantic 토큰(CSS 변수 기반)** 으로 추상화하여, `:root` / `.dark`(또는 임의 무드) 변수 세트 교체만으로 전체 페이지 톤앤매너(배경·라인·텍스트·브랜드색)를 한 곳에서 전환할 수 있게 만든다. 실제 색상 값은 후속 결정.

---

## 확인 필요 사항 (계획 확정 전)

1. **무드 전환 성격**: 사용자가 토글하는 "다크/라이트 2모드"인가, 아니면 브랜드 리뉴얼처럼 **단일 신규 무드로 상시 교체**(라이트 대체)인가?
   - 전자면 토글 UI 복구(5단계)가 필수, 후자면 스토어 기본값/초기 스크립트만 조정하고 토글은 생략 가능.
2. **실제 팔레트 값**: 라이트/다크(또는 신규 무드)의 구체적 색상 HEX 세트. 본 계획은 값에 비의존적으로 토큰 "구조"만 설계하며, 값 확정은 디자인 결정 대기.
3. **`primary` vs `v2.*` 브랜드색 통일**: 현재 브랜드 계열이 `primary`(#432df1)와 `v2.purple`(#7665FF)로 이원화됨(`tailwind.config.ts:45-57, 147-149`). 최종 브랜드 hue를 무엇으로 통일할지 디자인 확정 필요.
4. **한글 웹폰트 도입 여부**: Pretendard / Noto Sans KR 등. 라이선스·성능(용량) 검토 포함.
5. **롤아웃 방식**: 전체 일괄 전환인지, 플래그/브랜치로 단계 배포인지.

---

## 현황 파악 (실제 코드 근거)

### 테마 인프라 (동작 중)
- `tailwind.config.ts:16` `darkMode: 'class'`, 색상 팔레트 `tailwind.config.ts:44-151` — **전부 하드코딩 HEX, CSS 변수 간접참조 없음**.
- `store/useStoreData.ts:657-677` `useThemeStore` — `isDarkMode:false` 기본, `persist('theme-storage')`, `skipHydration:true`.
- `app/layout.tsx:61-93` FOUC 방지 초기 주입 스크립트(시스템 다크 감지 포함). `app/providers.tsx:136-166` `isDarkMode` → `documentElement.classList` 동기화.
- 토글 UI **주석 처리**: `components/common/header.tsx:241-251`, `components/elements/sidebar/HeaderSidebar.tsx:77-85`.

### 색상 3중 분산 (핵심 장애물)
- **A. Tailwind 토큰**: `tailwind.config.ts:44-151` — `primary/secondary/accent/background/button/text/icons` + `dark.*` + `v2.*`. `primary`와 `v2.purple` 역할 중복.
- **B. CSS 변수**: `app/globals.css:44-61` `:root`에 `--background/--primary/--secondary/...` 정의되어 있으나 **Tailwind 토큰과 연결되어 있지 않아 사실상 데드**. `.dark` 블록은 전체 주석(`app/globals.css:63-91`).
- **C. 하드코딩**: 원시 유틸 `bg-white/text-gray-900/text-black/text-white/bg-gray-900` — **425회 / 114파일**(실측). HEX `#RRGGBB` — **55회 / 19파일**(tsx 실측, CSS 별도).
  - `app/layout.tsx:122` body `bg-white dark:bg-gray-900` 하드코딩.
  - `app/globals.css:116-123` body `@apply bg-white text-gray-900` / `.dark body bg-gray-900`.
  - `app/globals.css` HEX: navigation-button `#6b7280`(228), 스와이퍼 `#e5e7eb`(219,222), 카드/작가 그리드 `#4f46e5`/`#6366f1`(326,330,336,341), rgba 흰/회색 다수.
  - `app/providers.tsx:169-170` 스켈레톤 색 `#E5E7EB/#1E293B/#334155/#F3F4F6` 하드코딩.

### 다크 대응 전략 혼재 (실측)
- 전용 팔레트 방식(`dark:bg-dark-*`, `dark:text-dark-*`): **85파일** — 다수(주류).
- 원시 그레이 방식(`dark:bg-gray-*`, `dark:text-gray-*`): **22파일** — 소수. body 포함.
- → 두 방식이 톤 변경 시 결과색 불일치 유발.

### FSD / 레거시 구조
- FSD `src/shared` 존재: `config/`(apiRoute, animations), `lib/utils/`(cn.ts 등), `model/stores/`, `ui/`.
- `src/shared/lib/utils/cn.ts:5-12` — `extendTailwindMerge` 커스텀 classGroup에 이미 `text-primary` 등 semantic-스러운 그룹 존재(토큰 확장 시 여기 등록 필요).
- **주의**: `styles/globals.css`는 어디서도 import 안 됨(리뷰 문서에서만 참조) → **데드 파일**. 실제 적용되는 전역 CSS는 `app/globals.css`(import: `app/layout.tsx:6`) 하나뿐. 이번 작업은 `app/globals.css`만 대상.

---

## 접근 방식

### 추천안: CSS 변수(RGB 채널) + Tailwind semantic 토큰 매핑, 단일 스왑 지점

핵심 메커니즘:
1. `app/globals.css`의 `:root`(기본 무드)와 `.dark`(다크/신규 무드)에 **의미 기반 CSS 변수**를 RGB 채널 3값(`R G B`) 형태로 정의. 예: `--color-surface: 255 255 255;`
2. `tailwind.config.ts`에서 semantic 토큰이 이 변수를 참조하도록 매핑: `surface: 'rgb(var(--color-surface) / <alpha-value>)'`. RGB 채널 방식이라 `bg-surface/50` 같은 alpha 유틸도 정상 동작.
3. 컴포넌트는 `bg-surface`, `text-primary`, `border-default`처럼 **의미 클래스 하나만** 사용. 라이트/다크 분기(`dark:`)는 CSS 변수가 `.dark`에서 자동 스왑되므로 **색상용 `dark:` 유틸이 원칙적으로 불필요**해짐 → 다크 전략 혼재(3단계)가 자연 해소.

이 방식의 이점:
- "한 곳(변수 세트)만 갈아끼우면 전체 톤 전환"이라는 목표에 정확히 부합.
- 향후 제3의 무드도 `.theme-xxx { --color-*: ... }` 클래스 추가만으로 확장 가능.
- 대부분의 color `dark:` 중복 제거 → 코드량·불일치 감소.

### 대안 비교

| 대안 | 장점 | 단점 | 판정 |
|---|---|---|---|
| **A. CSS변수+Tailwind매핑 (추천)** | 단일 스왑, `dark:` 제거, 무드 확장 용이 | 초기 매핑·마이그레이션 비용 | ✅ 채택 |
| B. `dark:` 유지 + 토큰만 정리 | 마이그레이션 범위 축소 | 여전히 색이 두 벌(라이트/다크) 하드 분기, 무드 추가마다 클래스 폭증, 목표(단일 스왑) 미달 | ✗ |
| C. HSL 채널 변수 | 명도 계산 유연 | 기존 값이 전부 HEX라 변환 오차·재정의 부담, RGB 대비 이점 적음 | ✗ |

> 결론: **A 채택**. 단, 마이그레이션은 전면 일괄이 아니라 **인프라 → 공용 UI → 레거시 → 취약 페이지** 순의 배치 단위로 안전하게 진행한다.

### 토큰/유틸 배치 결정
- **Tailwind semantic 토큰**: `tailwind.config.ts`(루트). content 글롭이 FSD·레거시 양쪽을 이미 커버(`tailwind.config.ts:8-15`)하므로 여기 두면 두 아키텍처 모두 사용 가능. 신규 파일 불필요.
- **CSS 변수 세트**: `app/globals.css` `:root`/`.dark`(실제 import되는 유일 전역 CSS). 데드인 `styles/globals.css`는 건드리지 않음.
- **cn merge 등록**: 신규 semantic classGroup은 `src/shared/lib/utils/cn.ts:5-12`에 추가.
- 기존 `primary/secondary/v2.*`는 **삭제하지 않고 유지**(대량 참조처 보호)하되, 신규 코드·마이그레이션 대상은 semantic 토큰으로 유도. 최종 통일은 확인필요 3번 결정 후 후속 정리.

---

## 실행 계획 (단계별)

### 1단계 — semantic 토큰 셋 & CSS 변수 스캐폴딩 (색은 현행 값 그대로)
- **무엇/어디**: `tailwind.config.ts` `colors`에 semantic 토큰 추가, `app/globals.css` `:root`/`.dark`에 대응 변수 정의.
- **토큰 셋(초안, palette-agnostic)**:
  - 배경: `surface`(페이지), `surface-elevated`(카드/모달), `surface-sunken`(인풋/뮤트영역)
  - 라인: `border-default`, `border-strong`
  - 텍스트: `text-primary`(본문), `text-muted`(보조), `text-inverse`(브랜드/딥 배경 위)
  - 브랜드: `brand`, `brand-hover`, `brand-subtle`
  - 상태: `accent`, `danger`, `success`, `warning`
  - 오버레이: `overlay`(모달 백드롭)
- **중요**: 이 단계에서 `.dark` 변수 값은 **기존 다크 팔레트/그레이 값과 동일하게, `:root`는 현재 라이트 값과 동일하게** 채워 넣는다 → 화면 변화 0(회귀 방지). 값 확정(확인필요 2)은 이후 이 변수만 교체.
- **cn**: `src/shared/lib/utils/cn.ts` classGroup에 신규 토큰 등록.
- **검증**: `npm run build` / 타입체크 통과, 로컬 실행 시 화면 픽셀 동일(스냅샷/육안). 아직 어떤 컴포넌트도 토큰 미사용이므로 무변화가 정상.

### 2단계 — 전역/인프라 하드코딩 치환 (가장 상단부터)
- **무엇/어디**:
  - `app/globals.css:116-123` body `@apply` → `bg-surface text-text-primary`, `.dark body` 규칙 제거(변수 스왑으로 대체).
  - `app/layout.tsx:122` body className `bg-white dark:bg-gray-900` → `bg-surface`.
  - `app/globals.css` HEX(navigation-button `#6b7280`(228), swiper `#e5e7eb`(219,222), grid `#4f46e5/#6366f1`(326-341)) → `var(--color-*)`로 치환, 대응 `.dark` 규칙 제거.
  - `app/providers.tsx:169-170` 스켈레톤 색 → 토큰 변수(`getComputedStyle` 또는 상수 매핑) 참조로 정리(스켈레톤은 JS 값이므로 CSS var 읽기 or 토큰 상수화).
- **검증**: 라이트/`.dark` 강제 적용(`html.dark` 토글) 상태에서 body·스와이퍼·네비버튼·스켈레톤 색 정상. 변수 세트 임시 교체 실험으로 "한 곳 변경→전체 반영" 최초 확인.

### 3단계 — 공용 UI(FSD `src/shared/ui` + `components/elements`, `components/modal`) 치환
- **무엇/어디**: 재사용 빈도 높은 공용 컴포넌트부터 semantic 토큰 적용.
  - 매핑 규칙(하단 표) 적용, 색상용 `dark:` 유틸 제거.
  - 대상 예: `src/shared/ui/modal/*`, `src/shared/ui/form/*`, `components/elements/{card,button,sidebar,modal,dropdown}/*`, `components/modal/*`.
- **진행 방식**: 배치(디렉토리) 단위. 배치마다 커밋 + 육안 QA.
- **검증**: 각 배치 후 대표 화면(모달 열기, 카드 목록, 폼)에서 라이트/다크 육안 확인, `git diff`로 의미 매핑 오류(특히 `text-white`) 검수.

### 4단계 — 레거시 `views/*` 페이지 & 취약 페이지 보강
- **무엇/어디**: `views/*`(페이지 셸) 치환. 리뷰 지적 취약 페이지 우선:
  - `views/main/home.tsx`, `views/my-characters/home.tsx`, `views/search/home.tsx`, `app/(routes)/payment/*`, `views/chat/detail.tsx`(1600줄, 대비중요).
- **주의**: `views/chat/detail.tsx`는 대형·시각 비중 큼 → 단독 배치로 분리, 채팅 버블/배경 대비 집중 검수.
- **검증**: 각 페이지 라이트/다크 진입 시 흰 배경 튐 없음, 텍스트 대비 WCAG 확인.

### 5단계 — 다크(색상) `dark:` 잔재 정리 & 전략 일원화
- **무엇/어디**: 2~4단계에서 semantic 치환된 부분의 색상 `dark:` 유틸 제거 완료 확인. 남은 원시 그레이 방식(22파일) 잔재를 토큰으로 흡수.
- **검증**: `grep`로 `dark:(bg|text|border)-(gray|dark)-` 잔여 카운트 추적, 목표치까지 감소. (레이아웃/불투명도 등 색상 아닌 `dark:`는 유지 가능.)

### 6단계 — 토글 UI 복구 (확인필요 1이 "2모드"인 경우에만)
- **무엇/어디**: `components/common/header.tsx:241-251`, `components/elements/sidebar/HeaderSidebar.tsx:77-85` 주석 해제·정상화. `useThemeStore.toggleDarkMode`(`store/useStoreData.ts:661`) 연결 확인.
- **"단일 신규 무드 상시 적용"이면**: 토글 대신 `useThemeStore` 기본값/`app/layout.tsx:61-93` 초기 스크립트만 조정.
- **검증**: 토글 클릭 시 즉시 전환·새로고침 후 유지(persist), FOUC 없음.

### 7단계 — 한글 웹폰트 (확인필요 4 결정 시)
- **무엇/어디**: `app/layout.tsx:17-22` Poppins에 한글 폰트 추가(`next/font`로 Pretendard/Noto Sans KR local 또는 google), `tailwind.config.ts:30-32` `fontFamily.sans` 폴백 체인에 삽입.
- **검증**: 한글 텍스트 렌더 폰트 확인, CLS/로딩 성능 측정.

### 하드코딩 → semantic 매핑 표 (2~4단계 공통 기준)

| 기존 | 치환 | 비고 |
|---|---|---|
| `bg-white` | `bg-surface` / 카드·모달은 `bg-surface-elevated` | 문맥 구분 |
| `bg-gray-900`(다크 body) | 제거(변수 스왑) | |
| `text-gray-900`, `text-black` | `text-text-primary` | |
| `text-gray-500/600`, `icons #6b7280` | `text-text-muted` | |
| `text-white` | `text-text-inverse` | ⚠️ 브랜드버튼 위인지 다크배경 위인지 **수동 판별** |
| `border-gray-200/300` | `border-border-default` | |
| `#432df1`, `#4f46e5`, `v2.purple` | `brand` 계열 | 확인필요 3 통일 후 |

---

## 안전한 대량 치환(425+55) 전략

- **자동화 + 리뷰 병행**: 매핑 표를 규칙으로 하는 codemod(sed/jscodeshift 스타일 스크립트)로 **1차 기계 치환** 후, 반드시 `git diff` 수동 검수. 스크립트는 리포 소스가 아닌 일회성 도구로 취급(계획 단계에서는 미실행).
- **`text-white`·`bg-white`는 반자동**: 문맥 의존(브랜드 위 vs 표면) → 자동 일괄 금지, 파일별 검토.
- **배치 단위 진행**: 디렉토리/피처 단위로 잘라 커밋 → 실패 시 롤백 범위 최소화.
- **회귀 기준선**: 1단계에서 값 무변경으로 만들어두면, 각 배치의 `git diff`가 "클래스명만 바뀌고 렌더 색 동일"이어야 정상. 대표 화면 스크린샷 전/후 비교.
- **잔여 추적 지표**: `grep -c` 로 원시 유틸/HEX/`dark:` 색상 카운트를 배치마다 기록해 감소 추세 확인(425→0, 55→0 목표).

---

## 영향 범위 & 리스크

- **파급**: 전역 CSS·layout·providers(인프라) + 114개 tsx + `tailwind.config.ts`. 사실상 전 화면.
- **회귀 위험**: 1단계 값 동일화로 억제. 위험 최상위는 `text-white`/`bg-white` 오매핑(대비 파괴), `views/chat/detail.tsx` 대형 파일.
- **보안 민감 화면**: `app/(routes)/payment/*`, TossPayments 결제 UI는 색 치환이 **로직에 영향 없어야** 함 — className만 수정, 상태/토큰/결제 값 로직 불변 확인.
- **RGB 채널 방식 필수 조건**: 변수는 `R G B` 숫자만(단위·`#` 없이). 형식 틀리면 alpha 유틸 깨짐 → 1단계에서 규약 고정.
- **롤백**: 배치 커밋 단위 revert. 최악의 경우 semantic 토큰은 추가분이라, 컴포넌트 치환만 되돌리면 기존 팔레트로 복귀 가능(1단계 토큰 자체는 무해).
- **데드 파일**: `styles/globals.css` 미사용 확인됨 — 이번 범위 제외(혼동 방지 위해 별도 정리 이슈 권장).

---

## 검증 방법

- **빌드/타입**: 각 단계 후 `npm run build`(또는 프로젝트 스크립트) + `tsc --noEmit` 통과.
- **시각 회귀**: 라이트/`.dark` 두 상태에서 대표 플로우(홈·검색·캐릭터 목록·모달·채팅방·결제·설정) 육안 QA. 가능하면 전/후 스크린샷 비교.
- **토큰 스왑 스모크 테스트**: `:root`/`.dark` 변수 한 세트를 임시 다른 색으로 바꿔 **전 화면이 그 색으로 일괄 변하는지** 확인 → 목표 달성 판정 기준.
- **잔여 카운트**: `grep`로 원시 유틸/HEX/색상 `dark:` 잔량 추적(감소 확인).
- **접근성**: 주요 텍스트/배경 대비비 WCAG AA 확인(특히 다크·신규 무드).

---

## 범위 밖 (하지 않을 것)

- 실제 브랜드/무드 색상 값 확정 (디자인 결정 대기 — 확인필요 2).
- `primary` vs `v2.*` 최종 통합 삭제 (확인필요 3 결정 후 후속 작업).
- 데드 파일 `styles/globals.css` 정리 (별도 이슈).
- 색상과 무관한 레이아웃/애니메이션/간격 리팩터.
- 한글 폰트 도입은 확인필요 4 결정 시에만 7단계로 수행(미결정 시 보류).
