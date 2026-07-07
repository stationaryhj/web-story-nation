# StoryNation — 테마 semantic 토큰화 구현 결과 (7단계: 전역 크롬 & 메인 추천 섹션)

- **작성 일자**: 2026-07-06
- **근거 계획**: `docs/plan/plan-20260706-theming-semantic-tokens-v2.md` (4·5단계 후속, 6단계 산출물에서 "미전환(범위 밖)"으로 분류된 영역 중 일부)
- **선행 구현**: `docs/write/write-20260706-theming-step4-shared-ui.md`(4단계) · `docs/write/write-20260706-theming-step5-views.md`(5단계) · `docs/write/write-20260706-theming-step6-dark-cleanup.md`(6단계, 미전환 영역 최초 분류) — 매핑·문맥 판단 관행을 그대로 계승
- **구현 범위**: 이번 배치(A) 9개 파일 — `components/common/{header,footer,MobileGNB}.tsx`, `components/main/RecommendSection.tsx`, `components/main/recommend/{AuthorRankingSection,CreateCharacterSection,LatestCharactersSection,CharacterRankingSection,EtcCharactersSection}.tsx`
- **검증**: `npx tsc --noEmit` 통과 · `npm run build` 통과(24 라우트) · `npx biome check --write` 대상 9파일 포맷 정리

---

## 구현 요약

계획 1~6단계에서 구축된 semantic 토큰(`surface`/`surface-sunken`/`border-default`/`brand`/`brand-hover`/`brand/10`/`overlay`/`text-primary`/`text-muted`/`text-inverse`)을 기준으로, 6단계 산출물이 "미전환(범위 밖)"으로 분류했던 30개 파일 중 "전역 크롬"(헤더·푸터·모바일 GNB) 3개와 "메인 추천 섹션" 6개, 총 9개 파일의 하드코딩 색상 유틸(`secondary-*`, `primary-*`, `dark-*` 등)과 색상용 `dark:` 접두 유틸을 semantic 클래스로 치환했다. 대상 스코프의 색상 `dark:`(`gray|dark|slate|zinc|neutral`) 잔량은 **51건 → 10건**으로 감소했으며, 남은 10건 전부 헤더·푸터의 **주석 처리된 죽은 코드**(6단계 문서가 이미 문서화한 항목과 동일 블록)로 확인했다.

`header.tsx`의 `useThemeStore`(`isDarkMode`/`toggleDarkMode`) 상태·로고 분기·성인모드 토글 이벤트 핸들러는 전혀 건드리지 않고 className만 교체했다.

---

## 변경 파일

### `components/common/header.tsx`
- `header.tsx:48` — "세이프티 필터" 라벨 `text-secondary-700 hover:text-primary-600 dark:text-dark-secondary-400 dark:hover:text-dark-primary-600` → `text-text-primary hover:text-brand-hover`
- `header.tsx:189` — 헤더 배경 `bg-white dark:bg-dark-background-light` → `bg-surface-sunken`(크롬 면). `shadow-sm dark:shadow-dark-primary-300/20`은 그림자 색이라 유지(색상 아닌 dark: 보존 지시에 따름)
- `header.tsx:198` — 로고 링크(a11y 텍스트) `text-primary-600 dark:text-dark-primary-600` → `text-brand-hover`
- `header.tsx:220-222` — 네비 링크 active/inactive `hover:text-primary-500.../text-primary-500.../text-secondary-700...` → `hover:text-brand`(inactive hover) / `text-brand`(active) / `text-text-primary`(inactive)
- `header.tsx:261,272,284` — 설정/장바구니/모바일 메뉴 버튼 3곳 동일 패턴 `text-secondary-700 hover:text-primary-600 dark:...` → `text-text-primary hover:text-brand-hover`
- `useThemeStore`(`isDarkMode`/`toggleDarkMode`), `isDarkMode ? '/images/logo.svg' : '/images/logo.svg'` 분기, 성인모드 토글 로직·이벤트 핸들러 **무변경**

### `components/common/footer.tsx`
- `footer.tsx:29` — 푸터 배경/보더 `bg-white dark:bg-dark-background-light border-t border-secondary-100 dark:border-dark-secondary-200` → `bg-surface-sunken border-t border-border-default`
- `footer.tsx:33` — 타이틀 `text-primary-600 dark:text-dark-primary-600` → `text-brand-hover`
- `footer.tsx:34-35` — 회사명/주소 목록 `dark:text-dark-secondary-500`(라이트 미지정) / `text-secondary-600/80 dark:text-dark-secondary-500/80` → `text-text-muted` / `text-text-muted/80`
- `footer.tsx:44` — 이메일 링크 hover `hover:text-primary-500 dark:hover:text-primary-400` → `hover:text-brand`
- `footer.tsx:84,90,99` — "법적 정보" 헤딩·약관/개인정보 링크 `text-secondary-900 dark:...` / `text-secondary-600 dark:... hover:text-primary-500 dark:...` → `text-text-primary` / `text-text-muted hover:text-brand`
- `footer.tsx:159` — 하단 카피라이트 라인 `border-secondary-100 dark:border-dark-secondary-200 text-secondary-500 dark:text-dark-secondary-500` → `border-border-default text-text-muted`
- **미변경(죽은 코드)**: 주석 처리된 "서비스"/"소셜" 블록(원본 57~85, 113~161행) 9건 — 6단계 문서가 이미 죽은 코드로 분류한 항목과 동일, 렌더 경로 없음

### `components/common/MobileGNB.tsx`
- `MobileGNB.tsx:99` — GNB 바 배경/보더 `bg-white dark:bg-dark-background-light border-t border-secondary-100 dark:border-dark-secondary-200/10` → `bg-surface-sunken border-t border-border-default`
- `MobileGNB.tsx:120,124` — active/inactive 아이콘·라벨 `text-primary-500 dark:text-dark-primary-500` / `text-secondary-600 dark:text-dark-secondary-400` → `text-brand` / `text-text-muted` (Link 텍스트, 아이콘 2곳 동일 패턴)

### `components/main/RecommendSection.tsx`
- `RecommendSection.tsx:43` — 앱 다운로드 섹션 타이틀 `text-secondary-900 dark:text-dark-secondary-100` → `text-text-primary`
- `RecommendSection.tsx:46` — 안내문 `text-secondary-600 dark:text-dark-secondary-400` → `text-text-muted`
- `RecommendSection.tsx:55,70` — Android/iOS 앱 다운로드 버튼 `bg-secondary-900 dark:bg-dark-secondary-800 text-white ... hover:bg-secondary-800 dark:hover:bg-dark-secondary-700` → `bg-overlay text-text-inverse ... hover:bg-overlay/90`(항상 어두운 배지 성격으로 판단, `overlay` 토큰이 라이트/다크 공통 `0 0 0` 값이라 5단계 `views/chat-list/home.tsx` Toast 선례와 동일 원칙)
- `RecommendSection.tsx:41`(원본, 미변경) — `bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-dark-primary-900/50 dark:to-dark-secondary-900/50` 그라데이션 배경은 `from-`/`to-` 유틸이라 이번 검증 grep 패턴(`bg|text|border`)에 잡히지 않고, 제공된 semantic 토큰 목록에 그라데이션에 대응하는 항목이 없어 **미변경(확인 필요)**

### `components/main/recommend/AuthorRankingSection.tsx`
- `AuthorRankingSection.tsx:73` — 섹션 배경 `bg-secondary-50 dark:bg-dark-secondary-900/30` → `bg-surface`
- `AuthorRankingSection.tsx:78` — 타이틀 `text-secondary-900 dark:text-dark-secondary-700` → `text-text-primary`
- `AuthorRankingSection.tsx:83` — "랭킹 더보기" 버튼 `text-primary-600 hover:text-primary-700 dark:...` → `text-brand hover:text-brand-hover`(4단계 `CardGrid.tsx` "더보기 링크" 선례 `text-brand hover:text-brand-hover`와 동일 패턴으로 통일, 원본 600/700 조합이 브랜드 토큰 2종에 정확히 대응하지 않아 링크류 공통 관례를 따름 — **확인 필요**)
- `AuthorRankingSection.tsx:88` — 안내문 `text-secondary-500 dark:text-dark-secondary-500` → `text-text-muted`

### `components/main/recommend/CreateCharacterSection.tsx`
- `CreateCharacterSection.tsx:26` — 섹션 배경(핑크 틴트) `bg-primary-50 dark:bg-dark-primary-900/30` → `bg-brand/10`
- `CreateCharacterSection.tsx:28` — 타이틀 `text-secondary-900 dark:text-dark-secondary-200` → `text-text-primary`
- `CreateCharacterSection.tsx:31` — 본문 `text-secondary-600 dark:text-dark-secondary-400` → `text-text-muted`
- `CreateCharacterSection.tsx:37` — CTA 버튼 `bg-primary-500 hover:bg-primary-600 text-white dark:bg-dark-primary-600 dark:hover:bg-dark-primary-700` → `bg-brand hover:bg-brand-hover text-text-inverse`

### `components/main/recommend/LatestCharactersSection.tsx`
- `LatestCharactersSection.tsx:19` — 타이틀 `text-secondary-900 dark:text-dark-secondary-700` → `text-text-primary`
- `LatestCharactersSection.tsx:24` — "더 보기" 버튼 `text-primary-600 hover:text-primary-700 dark:...` → `text-brand hover:text-brand-hover`(AuthorRankingSection과 동일 원칙, **확인 필요** 표시 동일)

### `components/main/recommend/CharacterRankingSection.tsx`
- `CharacterRankingSection.tsx:81` — 타이틀 `text-secondary-900 dark:text-dark-secondary-700` → `text-text-primary`
- `CharacterRankingSection.tsx:86` — "랭킹 더보기" 버튼 `text-primary-600 hover:text-primary-700 dark:...` → `text-brand hover:text-brand-hover`(동일 원칙)
- `CharacterRankingSection.tsx:91` — 안내문 `text-secondary-500 dark:text-dark-secondary-500` → `text-text-muted`

### `components/main/recommend/EtcCharactersSection.tsx`
- `EtcCharactersSection.tsx:19` — 타이틀 `text-secondary-900 dark:text-dark-secondary-700` → `text-text-primary`
- `EtcCharactersSection.tsx:27` — "더 보기" 버튼 `text-primary-600 hover:text-primary-700 dark:...` → `text-brand hover:text-brand-hover`(동일 원칙)
- `EtcCharactersSection.tsx:32` — 안내문 `text-secondary-500 dark:text-dark-secondary-500` → `text-text-muted`

---

## 색상 `dark:` 잔량 (`grep -cE "dark:(bg|text|border)-(gray|dark|slate|zinc|neutral)"`)

| 파일 | 치환 전 | 치환 후 |
|---|---|---|
| `components/common/header.tsx` | 9 | **1**(주석 처리된 다크모드 토글 버튼, 240~251행 — 죽은 코드) |
| `components/common/footer.tsx` | 17 | **9**(주석 처리된 "서비스"/"소셜" 블록 — 죽은 코드, 6단계 문서 기존 분류와 동일) |
| `components/common/MobileGNB.tsx` | 5 | **0** |
| `components/main/RecommendSection.tsx` | 4 | **0** |
| `components/main/recommend/AuthorRankingSection.tsx` | 4 | **0** |
| `components/main/recommend/CreateCharacterSection.tsx` | 4 | **0** |
| `components/main/recommend/LatestCharactersSection.tsx` | 2 | **0** |
| `components/main/recommend/CharacterRankingSection.tsx` | 3 | **0** |
| `components/main/recommend/EtcCharactersSection.tsx` | 3 | **0** |
| **합계** | **51** | **10**(전부 죽은 코드) |

---

## 검증 결과

- **타입**: `npx tsc --noEmit` — 오류 없음(편집 직후 1회, Biome 포맷 후 1회 재검증)
- **빌드**: `npm run build` — 성공, 24개 라우트 정상 생성(2회 재검증)
- **포맷**: `npx biome check --write <9개 대상 파일>` 실행 — 싱글쿼트/세미콜론/2-space/import 정렬 적용. 함께 보고된 `useButtonType`(버튼 `type` 누락, `CreateCharacterSection.tsx`·`EtcCharactersSection.tsx`·`LatestCharactersSection.tsx`)·`noArrayIndexKey`(`EtcCharactersSection.tsx`) 경고는 **색상 변경 전부터 존재하던 기존 이슈**로 이번 작업과 무관해 미수정(4·5·6단계와 동일 방침, 범위 밖)
- **로직 불변 확인**: `header.tsx`의 `useThemeStore`/`useSettingsStore` 훅 사용, `isAdultModeEnabled`/`handleAdultModeToggle`/`toggleDarkMode`/로고 이미지 분기, `HeaderSidebar` prop 전달 등 상태·이벤트 핸들러는 `git diff` 상 무변경(className 문자열만 교체)

---

## 계획과 달라진 점 / 미완 · 후속 필요

### 확인 필요 (제품/디자인 컨펌 권장)
1. **"더보기/더 보기" 버튼 4곳**(`AuthorRankingSection`, `LatestCharactersSection`, `CharacterRankingSection`, `EtcCharactersSection`)의 `text-primary-600 hover:text-primary-700` → `text-brand hover:text-brand-hover` 매핑 — 계획 매핑 표는 `primary-600`을 `brand-hover`로 명시하지만, 4단계 `CardGrid.tsx`의 동일한 "더보기" 어포던스가 이미 `text-brand hover:text-brand-hover`로 구현되어 있어 앱 전역 "더보기" 링크 스타일 일관성을 우선해 통일했습니다. 원본 시안이 실제로 더 어두운 강조(600/700)를 의도했다면 재검토가 필요합니다.
2. **`RecommendSection.tsx`의 앱 다운로드 버튼**(`bg-secondary-900 dark:bg-dark-secondary-800` → `bg-overlay text-text-inverse hover:bg-overlay/90`) — 원본의 다크 모드 값(`dark-secondary-800`=`#F1F5F9`, 밝은 색)이 `text-white`와 결합하면 다크 모드에서 거의 안 보이는 상태였던 것으로 추정(기존 버그성 팔레트 매핑). "항상 어두운 배지"라는 시각적 의도로 판단해 `overlay`(라이트/다크 공통 `rgb(0 0 0)`)로 고정했습니다 — 5단계 `views/chat-list/home.tsx` Toast 선례와 동일 원칙이나, 원래 디자인 의도가 테마 반응형이었다면 되돌림 필요.
3. **`RecommendSection.tsx:41`의 그라데이션 배경**(`bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-dark-primary-900/50 dark:to-dark-secondary-900/50`)은 `from-`/`to-` 유틸이라 이번 지시의 검증 grep 패턴(`bg|text|border`)에는 잡히지 않고, 제공된 semantic 토큰 목록에 그라데이션 배경에 대응하는 항목이 없어 **미변경**으로 남겼습니다. 후속 처리 필요 시 디자인 확인 후 별도 그라데이션 토큰 정의 또는 단색 대체가 필요합니다.

### 후속 필요
- 6단계 문서의 "미전환 224건/30파일" 중 이번 배치(A) 9개 파일만 처리했습니다. 나머지 캐릭터 생성 폼(`components/form/character/*`), DM 편집(`src/features/edit-character/ui/EditStory.tsx` 등), 채팅 리스트(`components/chat/*`), 공용 엘리먼트 하위(`components/elements/{tabs,tags,list,navigation,selectbox}`)는 **여전히 미전환 상태**이며 이번 배치 범위 밖입니다. 후속 배치(B, C…) 계획/작업 필요.
- `APP_THEME='dark'` 실사용 육안 회귀 테스트는 여전히 미수행 — 나머지 배치 완료 후 전체 플로우 QA 권장.
