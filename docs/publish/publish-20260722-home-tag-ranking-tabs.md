# 홈 태그 랭킹 탭 — 퍼블리싱 결과 (6~7단계 + 후속: 자동 개행 → 왼쪽 정렬 → 2줄 고정 가로 스크롤 → 행 우선 순서 보정)

- 작성 일자: 2026-07-22
- 근거 계획: [`docs/plan/plan-20260722-home-tag-ranking-tabs.md`](../plan/plan-20260722-home-tag-ranking-tabs.md)
- 선행 writer 결과: [`docs/write/write-20260722-home-tag-ranking-tabs.md`](../write/write-20260722-home-tag-ranking-tabs.md) (1~5단계 완료)
- 담당: code-publisher — 계획의 **6단계(선택)·7단계(publisher)** 수행 + 사용자 추가 요청 4건(① 가로 스크롤 → 자동 개행 전환, ② 중앙 정렬 → 왼쪽 정렬, ③ 2줄 고정 + 넘치는 탭 가로 스크롤, ④ 열 우선(지그재그) → 행 우선 읽기 순서 보정. 문서 하단 섹션들 참고). `views/main/home.tsx`는 writer 담당 파일이므로 직접 수정하지 않고, 필요한 클래스 변경은 보고서에 명시함(①②는 이미 메인이 반영, `home.tsx:89`가 현재 `flex justify-start`임을 확인).

## 퍼블리싱 요약

칩 탭이 최대 17개(정적 7 + 태그 랭킹 최대 10)로 늘어난 상황에서 `ButtonTabs`(`variant='chip'`)와 `home.tsx`의 `flex justify-center` 래퍼가 360/768/1280px에서 좌측 칩 잘림·페이지 가로 스크롤을 일으키는지 Playwright(Chromium)로 실제 레이아웃 엔진을 이용해 정량 검증했다. **기존 구현(`max-w-full` + 내부 `overflow-x-auto`)이 이미 17개 칩 상황을 정상 처리함을 확인**했고, 코드 변경은 불필요했다. 다만 iOS WebView 모멘텀 스크롤 보강 차원에서 `ButtonTabs.tsx`에 `-webkit-overflow-scrolling: touch`만 추가했다. 6단계(태그 헤더 시각 처리)는 불필요 판단으로 생략했다.

## 변경 파일

- `components/elements/tabs/ButtonTabs.tsx:181` — 탭 네비게이션 스크롤 행(`overflow-x-auto`)에 `[-webkit-overflow-scrolling:touch]`(Tailwind 임의 속성) 추가. CLAUDE.md 웹뷰 체크리스트("`-webkit-overflow-scrolling` 고려")에 대응하는 방어적 보강. 레거시 iOS WebView(iOS 13 미만)에서 모멘텀 스크롤을 보장하기 위함이며, 현대 iOS/Android WebView에는 사실상 no-op. 리스크 없음(스타일 레이어만 수정, 7단계 "ButtonTabs.tsx 또는 스타일 레이어에서만 수정" 범위 내).
- `views/main/home.tsx` — **수정하지 않음**(writer 담당 파일, 검증 결과 변경 불필요로 확인됨).

## 6단계(선택) — 태그 헤더 시각 처리: 생략 근거

`components/main/list-grid/ListGridSectionView.tsx:33`의 `<h2 className='text-2xl font-bold text-text-primary mb-1'>{title}</h2>`는:
- `white-space: nowrap` 등 줄바꿈을 막는 클래스가 없는 일반 block 헤딩이므로, 태그명이 길어도 **자동 줄바꿈**되어 가로 넘침이 발생하지 않는다(flex/grid 폭 제약이 없는 순수 block 컨텍스트).
- `TagGridSection`이 주입하는 타이틀은 `'#' + tagLabel`(짧은 한글 태그명, 예: `#로맨스`) 형태로, 별도 칩형 헤더 없이 문자열 그대로 노출해도 디자인 의도(계획 3~4단계)와 일치한다.
- Figma 등 별도 해시태그 칩형 헤더 디자인이 아직 확정되지 않았다(계획 "범위 밖" 항목).

→ 계획에 명시된 대로 **불필요 판단, 생략**. 별도 디자인이 확정되면 후속 작업으로 `titleAs='hashtag'` 등의 optional prop을 `ListGridSectionView`에 추가하는 방식을 제안한다(지금은 구현하지 않음).

## 7단계 — 가로 스크롤/센터링 검증 결과

### 검증 방법
실제 브라우저 레이아웃 엔진(Playwright + Chromium, `node_modules` 로컬 설치분)으로 `ButtonTabs`/`home.tsx`의 실제 Tailwind 클래스·마크업 구조(루트 `max-w-full` → `relative flex overflow-x-auto hide-scrollbar` → `flex gap-[14px]` 칩 `min-w-[119px] shrink-0`)를 그대로 재현한 정적 HTML로 360/768/1280px 뷰포트에서 레이아웃을 실측했다(스크래치패드에 임시 스크립트로 작성, 프로젝트에는 파일 추가 없음).

### 결과

| 항목 | 360px | 768px | 1280px |
|---|---|---|---|
| 페이지 레벨 가로 스크롤(`document.scrollWidth > innerWidth`) | 없음 | 없음 | 없음 |
| 탭 행 내부 스크롤(`scrollrow.scrollWidth(2247px) > clientWidth`) | 발생(정상) | 발생(정상) | 발생(정상, 328~1248px 폭에 17칩 2247px 수용) |
| 첫 번째 칩('추천') 위치 | `left: 16px`(뷰포트 내, 즉시 접근 가능) | 동일 | 동일 |
| 17칩 상태에서 좌측 칩 잘림 | 없음 | 없음 | 없음 |
| 7칩(태그 로딩 전/정적 탭만)일 때 중앙 정렬 | 유지됨(`justify-center` 정상 동작) | — | 유지됨 |

**결론**: `ButtonTabs` 루트에 이미 적용된 `max-w-full`(`docs/publish/publish-20260721-home-chip-tabs.md`에서 4칩 기준으로 도입) + 내부 `overflow-x-auto`(`hide-scrollbar`) 조합이, CSS 스펙상 `overflow` 값이 `visible`이 아닌 스크롤 컨테이너는 조상 flex 아이템의 min-content 계산에 자신의 콘텐츠 폭을 강제하지 않는다는 성질 덕에, **17칩(태그 최대 10개 추가)에서도 그대로 안전하게 동작**한다. 계획서에 기재된 "좌측 칩 잘림 가능성" 리스크는 실측 결과 **재현되지 않았다** — 이는 계획 수립 시점에 실제 렌더링 검증 없이 이론적 우려로 기재된 것으로 판단된다.

### 체크리스트

- **스크롤바 숨김**: `app/globals.css:6-14`에 전역 `* { scrollbar-width: none } *::-webkit-scrollbar { width:0; height:0 }`가 이미 적용되어 있어 `hide-scrollbar` 클래스 유무와 무관하게 모든 스크롤바가 숨겨짐. 정상.
- **터치 스와이프**: 네이티브 `overflow-x: auto` 요소이므로 별도 JS 없이 브라우저/웹뷰 기본 터치 스와이프로 동작(추가 확인 불필요).
- **터치 타겟 44px**: 칩은 `h-[45px]`(≥44px), `min-w-[119px]`(≥44px) — 이미 충족(`docs/publish/publish-20260721-home-chip-tabs.md`에서 확인된 값과 동일, 태그 탭도 동일 스타일 재사용이므로 변화 없음).
- **웹뷰 모멘텀 스크롤**: 기존 `#__next`/`#root`에만 `-webkit-overflow-scrolling: touch`가 있고 중첩된 탭 스크롤 행에는 없었음(non-inherited 속성이라 상위에 있어도 하위 스크롤 컨테이너에 적용 안 됨) → `ButtonTabs.tsx`에 직접 추가.
- **`justify-center` 센터링**: 정적 탭만(7개, 태그 로딩 전/실패)일 때는 여전히 중앙 정렬되고, 17개로 늘어나면 자동으로 좌측 시작 + 내부 스크롤로 전환됨(별도 반응형 분기 불필요).

## 반응형 / 웹뷰 점검

- **360px**: 페이지 가로 스크롤 없음, 탭 내부 가로 스크롤로 17개 전체 접근 가능, 첫 탭 즉시 노출.
- **768px**: 동일하게 내부 스크롤 정상.
- **1280px**: 17개 칩(약 2247px)이 여전히 컨테이너보다 넓어 내부 스크롤 유지(데스크톱에서도 스크롤 필요 — 디자인상 자연스러운 동작, 별도 그리드/줄바꿈 요구사항 없음).
- **웹뷰**: 네이티브 `overflow-x-auto` + 전역 스크롤바 숨김 + (신규) `-webkit-overflow-scrolling:touch`로 iOS/Android WebView 스와이프 대응 완료. `window.open` 등 새 창 이슈 없음(탭은 인앱 라우팅 `router.push`만 사용, writer 영역).

## 계획과 달라진 점 / 로직 연결 필요 / 미완 · 후속

- 계획 7단계는 "문제가 있으면 수정"을 전제했으나, 실측 결과 **문제가 재현되지 않아 구조적 수정은 없음**(계획이 예상한 리스크와 실제 결과가 다름 — 위 "결론" 참조). `home.tsx` 쪽 변경 필요 사항 **없음**.
- 6단계(태그 헤더 시각 처리)는 계획대로 불필요 판단, 생략.
- 적용한 유일한 변경은 `ButtonTabs.tsx`의 `-webkit-overflow-scrolling:touch` 추가(레거시 iOS 대비 방어적 보강, 기능적 리스크 없음).
- `ButtonTabs.tsx`에 이번 세션 시작 전부터 존재하던 IDE 진단(미사용/미정렬 import, `<button>` `type` 속성 누락 2건)은 본 작업 이전 커밋되지 않은 변경(`disableUrlSync` 관련)에서 유래한 것으로 확인됨(`git diff` 대조) — 이번 7단계 범위 밖이라 수정하지 않음. 별건 정리가 필요하면 알려달라.
- 실제 기기/브라우저 육안 검증(스와이프 촉감, 실 데이터 17개 태그 라벨 길이)은 미실행 — 실측은 Playwright 합성 재현 기준이며, 실제 API 응답의 태그명이 예외적으로 길 경우(예: 5자 이상) 칩 폭이 `min-w-[119px]`를 넘어 커질 뿐 스크롤 동작 자체는 동일하게 유지된다(칩은 `shrink-0`+`whitespace-nowrap`이라 줄바꿈 없이 항상 확장).

## 검증

- `npx tsc --noEmit` — 통과(에러 없음).
- Playwright(Chromium) 합성 레이아웃 실측 — 위 표 참조.

---

## 추가 요청 반영 — 가로 스크롤 → 자동 개행(flex-wrap)으로 변경 (2026-07-22, 후속)

> 사용자 추가 요청: "칩 탭이 가려지지 않고 전부 보이도록 자동 개행 방식으로 변경". 위 7단계에서는 기존 가로 스크롤 방식이 문제없이 동작함을 확인했으나, **디자인 의도가 스크롤이 아닌 개행 노출로 변경**되어 이를 반영했다.

### 변경 파일

- `components/elements/tabs/ButtonTabs.tsx:178-243` — `variant='chip'` 전용 렌더링을 가로 스크롤에서 `flex-wrap` 개행으로 전환. `underline` variant(랭킹 서브탭 등 다른 화면)는 기존 마크업·클래스 그대로 유지, 영향 없음.
  - 탭 버튼 마크업/로직을 `renderTabButton(tab, index)` 헬퍼로 추출해 두 variant가 공유(중복 제거, 동작은 기존과 동일 — `activeTabId`/`aria-pressed`/`onClick`/ref 로직 무변경).
  - 탭 네비게이션 컨테이너 클래스를 variant별로 분기:
    - **chip**: `relative flex flex-wrap justify-center gap-[14px]` — 칩 버튼을 컨테이너의 **직접 자식**으로 렌더링(기존엔 중간에 래퍼 `div`가 하나 더 있어 `flex-wrap`이 걸려도 개행 대상이 되지 못했던 구조였음 → 이번에 제거).
    - **underline**: `relative flex overflow-x-auto hide-scrollbar [-webkit-overflow-scrolling:touch]`(변경 없음, 내부에 기존과 동일한 `flex space-x-4 md:space-x-8` 래퍼 유지).
  - `type="button"` 명시 추가(같은 함수를 리팩터링하며 발견한 기존 a11y 진단을 함께 정리 — 사소하고 무위험).
- `views/main/home.tsx` — **수정하지 않음**(writer 담당 파일). 아래 "home.tsx 쪽 변경 필요 사항" 참고(현재는 변경 불필요로 확인됨).

### 동작 원리 (검증 근거)
- `flex-wrap: wrap`이 걸린 컨테이너에 칩 버튼(`min-w-[119px] shrink-0 whitespace-nowrap`)이 **직접 자식**으로 있어야 개행이 발생한다. 기존 구조는 `overflow-x-auto` 컨테이너 안에 칩들을 감싸는 `div`가 하나 더 있어, `flex-wrap`을 그 안쪽 `div`에 걸어도 바깥 컨테이너 입장에서는 자식이 1개뿐이라 개행이 일어나지 않는 구조였다(이번 요청 대응을 위해 계층을 한 단계 제거).
- `justify-content: center`는 **flex-wrap 컨테이너에서 줄(line) 단위로 개별 적용**되는 CSS 표준 동작이라, 각 줄이 별도로 중앙 정렬된다(별도 로직 불필요).
- `gap-[14px]`는 `row-gap`·`column-gap`에 동일 값을 적용하므로 줄 간격도 칩 간격과 동일하게 유지된다.
- 루트 `max-w-full`(기존 4단계에서 도입)과 `home.tsx`의 `flex justify-center` 래퍼 조합은 유지 — `flex-wrap` 컨테이너는 available width로 자연 수축(shrink-to-fit 알고리즘이 `min(max-content, available width)`로 계산)하므로 별도의 `w-full`/`min-w-0` 보정 없이도 컨테이너 폭 안에서 개행된다(실측으로 확인, 아래 표).

### Playwright 실측 결과 (신규 마크업 그대로 재현)

**17칩(정적 7 + 태그 탭 최대 10) — 페이지/뷰포트 가로 스크롤 없음, 전부 표시:**

| 폭 | 줄 수 | 컨테이너 폭 | 페이지 가로 스크롤 | 칩 화면 밖 잘림 |
|---|---|---|---|---|
| 360px | 9줄 | 328px | 없음 | 없음(17개 전부 visible) |
| 768px | 4줄 | 736px | 없음 | 없음(17개 전부 visible) |
| 1280px | 2줄 | 1248px | 없음 | 없음(17개 전부 visible) |

**7칩(정적 탭만, 태그 로딩 전/실패 폴백) — 기존 센터링 유지:**

| 폭 | 줄 수 | 비고 |
|---|---|---|
| 360px | 4줄 | 개행되어도 각 줄 중앙 정렬 |
| 768px | 2줄 | 동일 |
| 1280px | 1줄(917px, 컨테이너 1280px 안에서 중앙 정렬) | 스크롤 없던 기존 동작과 시각적으로 동일 |

**줄(row) 단위 중앙 정렬 검증(360px, 17칩 기준)**: 9개 줄 전부 `leftGap === rightGap`(각 줄 좌우 여백 완전히 대칭, 예: 8개 줄은 38px/38px, 마지막 1칩 줄은 105px/105px)로 개별 줄 중앙 정렬이 정확히 동작함을 확인. 줄 간 세로 간격(`top` 좌표 차) = 59px = 칩 높이 45px + gap 14px로 요청한 "행 간격도 기존 칩 간격과 어울리게"를 그대로 충족.

### 반응형 / 웹뷰 점검
- 360 / 768 / 1280px 모두 **페이지 레벨 가로 스크롤 없음**, **칩 잘림 없음**, **17개 전부 노출** 확인(위 표).
- 정적 7탭만 있는 폴백 상태(태그 로딩 전/실패)도 개행+줄별 중앙 정렬로 정상 동작, 시각적 회귀 없음.
- 터치 타겟: 칩 크기(`h-[45px] min-w-[119px]`) 변경 없음, 44px 기준 계속 충족.
- 웹뷰: 스크롤이 사라지므로 `-webkit-overflow-scrolling:touch`/`hide-scrollbar`는 이제 **underline variant에서만 의미가 있고 chip variant에는 적용되지 않음**(개행 시 세로 스크롤은 페이지 자체 스크롤에 자연히 포함되므로 별도 처리 불필요).
- `hover:bg-surface-elevated-hover` 등 기존 hover 상태는 유지되나 chip variant는 활성/비활성이 배경색으로 구분되어 터치 환경에서도 문제 없음(기존과 동일).

### home.tsx 쪽 변경 필요 사항
- **없음.** `home.tsx:89`의 래퍼(`container mx-auto px-4 mt-8 flex justify-center`)는 그대로 두어도 개행된 칩 그룹 전체가 정상적으로 중앙 배치된다(실측 확인). 탭 영역이 여러 줄로 늘어나며 아래 콘텐츠(그리드 섹션)와의 세로 간격(`mt-8`)이 줄 수에 따라 커질 수 있는데, 이는 의도된 자연스러운 리플로우이며 별도 여백 보정은 필요하지 않다고 판단(디자인상 다른 의견이 있으면 확인 요청).

### 검증
- `npx tsc --noEmit` — 통과(에러 없음).
- `npx biome lint components/elements/tabs/ButtonTabs.tsx` — 이번 변경으로 새로 발생한 이슈 없음. 남은 2건(미사용 `React` import, 해시태그 버튼 `type` 누락)은 이번 리팩터링 이전부터 존재하던 사항이라 범위 밖으로 유지(단, 직접 리팩터링한 탭 버튼의 `type` 누락 1건은 이번에 함께 정리함).
- Playwright(Chromium) 합성 레이아웃 실측(신규 마크업 그대로 재현) — 위 표·줄별 중앙 정렬 검증 참조.

### 계획과 달라진 점 / 미완 · 후속
- 이번 후속 변경은 사용자의 명시적 추가 요청에 따른 것으로, 원 계획(`plan-20260722-home-tag-ranking-tabs.md`) 7단계의 "문제 발견 시 ButtonTabs.tsx 또는 스타일 레이어에서만 수정" 범위 내에서 처리했다.
- `underline` variant(랭킹 서브탭, `NavigationTabs`, `Navigation` 등)는 이번 변경 대상이 아니며 실제로 무변경(그레핑으로 `variant='chip'` 사용처가 `views/main/home.tsx` 1곳뿐임을 확인).
- 실기기/실 브라우저 육안 검증(개행 애니메이션 없는 즉시 리플로우 시 시각적 튐 여부, 실제 API 태그 라벨 길이)은 미실행 — 개발 서버 기동 후 확인 권장.

---

## 추가 요청 반영 ② — 칩 탭 정렬 중앙 → 왼쪽 (2026-07-22, 후속)

> 사용자 추가 요청: "홈 칩 탭의 정렬을 중앙이 아니라 왼쪽 정렬로 바꿔달라."

### 변경 파일

- `components/elements/tabs/ButtonTabs.tsx:213-222` — `chip` variant 탭 네비게이션 컨테이너의 정렬을 `justify-center` → `justify-start`로 변경. 개행된 각 줄이 컨테이너 왼쪽 기준으로 정렬된다. `underline` variant는 원래부터 `overflow-x-auto`(정렬 개념 없음, 가로 스크롤)라 무관·무변경.
  ```diff
  - 'flex-wrap justify-center gap-[14px]'
  + 'flex-wrap justify-start gap-[14px]'
  ```

### `home.tsx`에 필요한 정확한 수정 (writer/메인 반영 필요 — 이번 세션에서 직접 수정하지 않음)

**파일**: `views/main/home.tsx:89`
**현재**:
```tsx
<div className='container mx-auto px-4 mt-8 flex justify-center'>
```
**필요한 변경**:
```tsx
<div className='container mx-auto px-4 mt-8 flex justify-start'>
```
(`justify-center` → `justify-start`로 한 단어만 교체. `flex` 자체는 유지)

**왜 필요한가 (실측으로 확인된 문제)**: `ButtonTabs`의 chip 컨테이너를 `justify-start`로 바꿔도, 탭 그룹 전체(칩이 한 줄에 다 들어가 컨테이너보다 좁아지는 경우 — 예: 정적 7탭 폴백 상태 × 1280px, `navrow` 실제 폭 917px < 컨테이너 1280px)에서는 `home.tsx`의 바깥 래퍼가 여전히 `justify-center`이기 때문에 **탭 그룹 블록 자체가 페이지 중앙에 위치**하게 되어, 칩 내부는 왼쪽 정렬이어도 시각적으로는 화면 중앙에서 시작하는 것처럼 보인다(Playwright 실측: 이 조건에서 첫 칩 `left`가 뷰포트 기준 182px, 좌측 정렬이 아님). 17칩처럼 탭 그룹이 컨테이너 전체 폭을 채우는 경우(모든 폭에서 해당)는 래퍼 정렬과 무관하게 이미 왼쪽부터 시작하므로 문제가 드러나지 않지만, **폴백(7탭)·와이드 데스크톱 등 한 줄에 다 들어가는 상황까지 일관되게 왼쪽 정렬**하려면 래퍼도 `justify-start`로 바꿔야 한다.

### 검증 결과 (Playwright, home.tsx 래퍼 두 케이스 비교)

**래퍼가 `justify-center`인 채로 둘 경우 (미반영 상태) — 문제 재현됨**:

| 시나리오 | 첫 칩 left(px) | 왼쪽 정렬 여부 |
|---|---|---|
| 17칩 × 360/768/1280px | 16 | ✅ (그룹이 컨테이너 전체 폭을 채우므로 우연히 정상) |
| 7칩(폴백) × 360/768px | 16 | ✅ (2줄 이상 개행되어 그룹이 폭을 채움) |
| 7칩(폴백) × 1280px(1줄) | **182** | ❌ 왼쪽 정렬 아님(그룹 블록이 페이지 중앙에 위치) |

**래퍼를 `justify-start`로 변경한 경우 (권장 반영) — 모든 시나리오 정상**:

| 시나리오 | 첫 칩 left(px) | 왼쪽 정렬 여부 | 줄 수 | 페이지 가로 스크롤 | 칩 잘림 |
|---|---|---|---|---|---|
| 17칩 × 360px | 16 | ✅ | 9 | 없음 | 없음(17개 전부) |
| 17칩 × 768px | 16 | ✅ | 4 | 없음 | 없음(17개 전부) |
| 17칩 × 1280px | 16 | ✅ | 2 | 없음 | 없음(17개 전부) |
| 7칩(폴백) × 360px | 16 | ✅ | 4 | 없음 | 없음 |
| 7칩(폴백) × 768px | 16 | ✅ | 2 | 없음 | 없음 |
| 7칩(폴백) × 1280px | 16 | ✅ | 1 | 없음 | 없음 |

첫 칩 `left=16px`는 `.container`의 `px-4`(16px) 패딩과 정확히 일치 — 좌측 정렬이 컨테이너 좌측 패딩 경계에서 정확히 시작함을 의미. 모든 시나리오에서 `pageHasHorizontalOverflow: false`, `allChipsVisible: true` 확인.

### 반응형 / 웹뷰 점검
- 360 / 768 / 1280px 모두 페이지 레벨 가로 스크롤 없음, 칩 잘림 없음, 왼쪽 정렬 확인(`home.tsx:89`를 위 변경대로 반영했을 때 기준).
- 터치 타겟·hover 미의존 등 기존 특성 변경 없음(정렬 방향만 변경).
- `home.tsx`가 아직 미반영 상태(`justify-center` 유지)라면, 17칩처럼 항상 여러 줄인 경우는 정상적으로 왼쪽 정렬처럼 보이지만 **7칩 폴백 × 넓은 화면(1줄)에서는 여전히 중앙 배치**로 보이는 회귀가 남는다. 메인 에이전트의 `home.tsx:89` 반영이 완료되어야 요청이 전체 시나리오에서 완전히 충족된다.

### 검증
- `npx tsc --noEmit` — 통과(에러 없음, `ButtonTabs.tsx` 변경 후).
- Playwright(Chromium) 합성 레이아웃 실측 — 위 두 표(래퍼 `justify-center` vs `justify-start`) 참조.

### 계획과 달라진 점 / 로직 연결 필요 / 미완 · 후속
- `views/main/home.tsx:89`의 `justify-center` → `justify-start` 교체가 **아직 반영되지 않음** — writer 담당 파일이라 이번 세션에서 직접 수정하지 않았다. 메인 에이전트가 위 diff대로 반영 필요.
- `ButtonTabs.tsx`의 chip 컨테이너 정렬 변경은 완료.

> **후속 업데이트(아래 "추가 요청 반영 ③" 작업 시점 확인)**: `views/main/home.tsx:89`를 직접 열람해 확인한 결과 이미 `flex justify-start`로 반영되어 있었다(메인 에이전트가 위 권장 diff를 적용 완료). 위 "아직 반영되지 않음" 기술은 작성 시점 기준이며 현재는 해소됨.

---

## 추가 요청 반영 ③ — 칩 탭 2줄 고정 + 넘치는 탭 가로 스크롤 (2026-07-22, 후속)

> 사용자 추가 요청: "홈 칩 탭을 2줄까지만 표시하고, 넘치는 탭은 스크롤로 접근하게 바꿔달라." 제안된 주 구현안(`grid grid-rows-2 grid-flow-col overflow-x-auto` 계열)을 그대로 채택했다.

### 채택한 구현 방식

기존 `flex-wrap`(뷰포트 폭에 따라 줄 수가 가변) 방식을 **CSS Grid 열 우선 채움(2행 고정) + 컨테이너 가로 스크롤**로 교체했다.

- **왜 grid인가**: `flex-wrap`은 "몇 줄이 나올지"를 뷰포트 폭에 맡기는 방식이라 "정확히 2줄 고정"을 표현할 수 없다(폭이 좁아지면 3줄, 4줄로 계속 늘어남 — 실제 앞 단계 실측에서 360px일 때 17칩이 9줄까지 늘어났었다).반면 `display:grid` + `grid-template-rows:repeat(2,...)` + `grid-auto-flow:column`은 **행 개수를 2로 명시 고정**하고, 칩이 위→아래→다음 열 순서로 채워지며 넘치는 열은 그리드 콘텐츠 폭이 커지는 방식이라, 이를 `overflow-x-auto` 컨테이너로 감싸면 "2줄 고정 + 가로 스크롤"이 정확히 구현된다. 대안으로 검토한 "`flex` 2줄 강제"(예: `flex flex-col flex-wrap h-[104px]` + 수동 줄바꿈 로직)는 요소를 명시적으로 두 배열로 분할하는 JS 로직이 필요해 표시용 컴포넌트 범위를 벗어나므로 기각.

### 변경 파일

- `components/elements/tabs/ButtonTabs.tsx:213-226` — chip variant 마크업 재구성.
  - 바깥 탭 네비게이션 div를 `relative flex overflow-x-auto hide-scrollbar [-webkit-overflow-scrolling:touch]`로 **variant 공통 고정**(이전엔 chip/underline이 서로 다른 클래스를 썼으나, 이제 둘 다 가로 스크롤 컨테이너가 필요해 통일 — underline 쪽 클래스·동작은 기존과 100% 동일하게 유지되므로 실질 변경 없음).
  - chip 전용 내부 컨테이너를 새로 추가: `grid grid-flow-col grid-rows-2 auto-cols-max content-start justify-start gap-[14px]`.
    - `grid-rows-2`: 행 2개 고정(칩 높이 45px 기준 총 104px = 45×2+14).
    - `grid-flow-col`: 열 우선 채움(칩이 위→아래→다음 열로 배치, 요청 해석과 일치).
    - `auto-cols-max`: 각 열 폭을 그 열에서 가장 넓은 칩 콘텐츠에 맞춤(칩이 옆으로 눌리거나 늘어나지 않음, 기존 `shrink-0`과 동등한 효과).
    - `justify-start`: 왼쪽 정렬 유지(추가 요청 ②).
    - `gap-[14px]`: 행 간격·열 간격 모두 기존 칩 간격과 동일.
  - `underline` variant, `views/main/home.tsx`는 **무변경**(그레핑으로 `variant='chip'` 사용처가 `home.tsx` 1곳뿐임을 재확인).

### Playwright 실측 결과 (신규 마크업 + `home.tsx`의 실제 현재 상태인 `justify-start` 래퍼 그대로 재현)

| 시나리오 | 폭 | 줄 수 | 그리드 높이 | 내부 가로 스크롤 필요 | 첫 칩 left | 페이지 가로 스크롤 | 전 칩 스크롤로 도달 가능 |
|---|---|---|---|---|---|---|---|
| 17칩 | 360px | **2** | **104px** | 예(328<1183) | 16px | 없음 | 예 |
| 17칩 | 768px | **2** | **104px** | 예(736<1183) | 16px | 없음 | 예 |
| 17칩 | 1280px | **2** | **104px** | 아니오(1183<1280, 2줄 안에 다 들어감) | 16px | 없음 | 예(스크롤 불필요, 이미 전부 표시) |
| 7칩(폴백) | 360px | **2** | **104px** | 예(328<518) | 16px | 없음 | 예 |
| 7칩(폴백) | 768px | **2** | **104px** | 아니오(518<736) | 16px | 없음 | 예 |
| 7칩(폴백) | 1280px | **2** | **104px** | 아니오(518<1280) | 16px | 없음 | 예 |

- **2줄 고정**: 6개 시나리오 전부 `rowCount=2`, `gridHeight=104px`로 일정함을 확인(뷰포트 폭·탭 개수와 무관하게 고정). 7칩 폴백도 열 우선 채움 특성상 자연히 2행이 채워짐(1번째 칩=행1열1, 2번째=행2열1, 3번째=행1열2 ... 7번째=행1열4, 총 4열×최대2행). 사용자가 언급한 "탭이 적으면 1줄만 나와도 됨"은 탭이 1개뿐인 극단적 엣지케이스에서만 해당(그 경우 행2가 비어 자연히 1줄, 별도 분기 불필요).
- **가로 스크롤**: 콘텐츠가 2줄 안에 다 안 들어가는 조합(360/768px)은 내부 스크롤이 정상 발생하고, 스크롤 끝까지 이동 시 마지막 칩까지 도달 가능함을 확인(`scrollLeft = scrollWidth` 후 마지막 칩이 뷰포트 안에 들어옴). 1280px처럼 2줄 안에 이미 다 들어가는 폭에서는 스크롤이 필요 없고 처음부터 전부 표시됨 — 요구사항("넘치는 탭만 스크롤")과 정확히 일치.
- **왼쪽 정렬 유지**: 모든 시나리오에서 첫 칩 `left=16px`(`.container`의 `px-4` 패딩과 일치) — 추가 요청 ②(왼쪽 정렬)가 이번 구조 변경 후에도 그대로 유지됨.
- **페이지 레벨 가로 스크롤**: 전 시나리오에서 없음(`document.scrollWidth <= innerWidth`).

### 반응형 / 웹뷰 점검
- 360 / 768 / 1280px 모두 탭 영역 높이가 104px로 고정되어 아래 그리드 섹션과의 레이아웃이 뷰포트 폭에 따라 출렁이지 않음(이전 `flex-wrap`은 360px에서 9줄=약 665px까지 늘어났던 것과 대비되는 개선).
- 스크롤바 숨김: `app/globals.css`의 전역 규칙(`* { scrollbar-width:none } *::-webkit-scrollbar{width:0;height:0}`)이 계속 적용되어 그대로 숨김.
- `-webkit-overflow-scrolling:touch`: chip variant도 다시 가로 스크롤 컨테이너가 되었으므로 이 속성이 정상적으로 유효(underline과 동일 클래스 사용).
- 터치 스와이프: 네이티브 `overflow-x:auto` 그대로라 별도 처리 없이 동작.
- 터치 타겟: 칩 크기(`h-[45px] min-w-[119px]`) 무변경, 44px 기준 계속 충족.

### 검증
- `npx tsc --noEmit` — 통과(에러 없음).
- `npx biome lint components/elements/tabs/ButtonTabs.tsx` — 이번 변경으로 새로 발생한 이슈 없음(기존 해시태그 버튼 `type` 누락 1건만 잔존, 범위 밖 유지).
- Playwright(Chromium) 합성 레이아웃 실측 — 위 표 참조(6개 시나리오 전부 요구사항 충족).

### 계획과 달라진 점 / 로직 연결 필요 / 미완 · 후속
- `home.tsx`는 이번 변경도 대상이 아니며 무변경(확인 결과 `home.tsx:89`는 이미 `justify-start`로 반영되어 있어 추가 조치 불필요).
- `underline` variant는 무변경(바깥 스크롤 컨테이너 클래스가 기존과 동일한 문자열로 통일되었을 뿐 동작 차이 없음).
- **결과적으로 이 grid 기반 구현은 "추가 요청 반영 ④"에서 배열 분할(flex 2행) 방식으로 교체됨** — 아래 섹션 참고. 사용자 피드백대로 열 우선(지그재그) 순서가 읽기 기대와 달라 후속 조정이 필요했다.

---

## 추가 요청 반영 ④ — 열 우선(지그재그) → 행 우선 읽기 순서 보정 (2026-07-22, 후속)

> 사용자 피드백: "탭이 순서대로 배치되어 있지 않다 — `grid-flow-col`의 열 우선(위→아래 지그재그) 순서가 기대와 다르다." → **행 우선**(1행 왼→오로 이어지다가 그다음 항목들이 2행 왼→오)으로 변경. 2줄 고정 + 넘치면 가로 스크롤(두 행이 함께 스크롤) 요구는 유지.

### 문제 원인
직전(③) 구현은 `grid-flow-col`(열 우선 채움)을 썼다. 이 경우 배치 순서가 `1행1열, 2행1열, 1행2열, 2행2열, ...`가 되어, 원본 배열 순서(추천→랭킹→최신→인기→...)가 위→아래로 지그재그 형태가 되고 화면상 좌→우 읽기 순서와 어긋난다. 사용자가 지적한 바와 정확히 일치.

`grid-rows-2` + `grid-flow-row`(행 우선)는 Grid 자체 알고리즘상 **행 개수를 2로 고정한 채로 열 방향 오버플로를 허용하지 않고** 우선 채워진 2행을 다 채우면 그 다음 항목이 배치될 자리가 없어 잘리는 문제가 있어(가이드에서 지적된 그대로) 순수 Grid로는 "행 우선 + 2행 고정 + 넘침은 가로 스크롤"을 동시에 만족할 수 없다.

### 채택한 구현 방식
가이드에서 제안한 **탭 배열을 앞 절반/뒤 절반으로 분할해 두 개의 독립된 flex 행을 세로로 쌓는 방식**을 채택했다(표시용 배열 분할이라 `ButtonTabs` 내부에서 처리 가능, 로직/상태 변경 없음).
- `chipRowSplit = Math.ceil(tabs.length / 2)`
- `chipTopRow = tabs.slice(0, chipRowSplit)` — 1행(왼→오, 원본 순서 그대로)
- `chipBottomRow = tabs.slice(chipRowSplit)` — 2행(왼→오, 원본 순서 그대로, 뒤 절반이 없으면 렌더링하지 않음)
- 두 행을 `flex flex-col items-start gap-[14px]`로 세로 스택 후, 기존과 동일한 바깥 `overflow-x-auto` 컨테이너 안에 배치 → 두 행이 항상 **함께** 가로 스크롤된다.
- 각 행은 `flex w-max gap-[14px]`(칩은 기존 `shrink-0`이라 눌리지 않음, `w-max`로 행 자체가 콘텐츠 폭만큼만 차지해 스크롤 계산이 정확함).

### 변경 파일

`components/elements/tabs/ButtonTabs.tsx`
- `renderTabButton` 아래에 분할 변수 3개 추가(`chipRowSplit`/`chipTopRow`/`chipBottomRow`).
  ```diff
  + const chipRowSplit = Math.ceil(tabs.length / 2)
  + const chipTopRow = tabs.slice(0, chipRowSplit)
  + const chipBottomRow = tabs.slice(chipRowSplit)
  ```
- chip 렌더링부를 grid에서 2개의 flex 행으로 교체:
  ```diff
  - <div className="grid grid-flow-col grid-rows-2 auto-cols-max content-start justify-start gap-[14px]">
  -   {tabs.map((tab, index) => renderTabButton(tab, index))}
  - </div>
  + <div className="flex flex-col items-start gap-[14px]">
  +   <div className="flex w-max gap-[14px]">
  +     {chipTopRow.map((tab, index) => renderTabButton(tab, index))}
  +   </div>
  +   {chipBottomRow.length > 0 && (
  +     <div className="flex w-max gap-[14px]">
  +       {chipBottomRow.map((tab, index) => renderTabButton(tab, chipRowSplit + index))}
  +     </div>
  +   )}
  + </div>
  ```
  (`renderTabButton`의 두 번째 인자는 `tabsRef` 배열 인덱스용으로, 뒤 행은 `chipRowSplit + index`로 원본 배열 상의 전역 인덱스를 그대로 유지 — `underline` variant의 인디케이터 위치 계산 로직과 호환성 유지 목적, chip은 인디케이터를 쓰지 않아 실사용 영향은 없음.)
- 바깥 `overflow-x-auto` 컨테이너, `underline` variant, `views/main/home.tsx`는 **무변경**.

### Playwright 실측 결과 (신규 마크업 + 순서 검증 포함)

DOM에 원본 배열 인덱스를 `data-order`로 심어, 화면 좌표(행의 `top`, 좌→우 `left`)와 비교해 **행 우선 순서**가 실제로 지켜지는지 검증했다.

| 시나리오 | 폭 | 줄 수 | 높이 | 1행 순서 정확 | 2행 순서 정확 | 1행 전체 인덱스 < 2행 전체 인덱스 | 좌측정렬(left) | 페이지 가로 스크롤 | 전체 도달 가능 |
|---|---|---|---|---|---|---|---|---|---|
| 17칩 | 360px | 2 | 104px | ✅ | ✅ | ✅ | 16px | 없음 | ✅ |
| 17칩 | 768px | 2 | 104px | ✅ | ✅ | ✅ | 16px | 없음 | ✅ |
| 17칩 | 1280px | 2 | 104px | ✅ | ✅ | ✅ | 16px | 없음 | ✅ |
| 7칩(폴백) | 360px | 2 | 104px | ✅ | ✅ | ✅ | 16px | 없음 | ✅ |
| 7칩(폴백) | 768px | 2 | 104px | ✅ | ✅ | ✅ | 16px | 없음 | ✅ |
| 7칩(폴백) | 1280px | 2 | 104px | ✅ | ✅ | ✅ | 16px | 없음 | ✅ |

**17칩 실측 행 분해 결과**(모든 폭에서 동일, 뷰포트 폭은 스크롤 여부만 바꿀 뿐 배치 순서엔 영향 없음):
- 1행(9개, `Math.ceil(17/2)`): 추천, 랭킹, 최신, 인기, 남자, 여자, 성별모름, 로맨스, 판타지
- 2행(8개): 일상, 스릴러, 코미디, 힐링, 액션, SF, 추리, 드라마

원본 배열 순서와 완전히 일치하며(정적 7탭 + 태그 탭 순서 그대로), 좌→우·위→아래 읽는 순서가 배열 순서와 정확히 대응됨을 확인.

**7칩(폴백) 실측**: 1행(4개) 추천/랭킹/최신/인기, 2행(3개) 남자/여자/성별모름 — `Math.ceil(7/2)=4`로 앞 4개/뒤 3개 분할, 요청한 "적으면 4/3 식으로 나뉘어도 됨"과 일치.

### 반응형 / 웹뷰 점검
- 360 / 768 / 1280px 모두 높이 104px(2줄) 고정, 페이지 레벨 가로 스크롤 없음, 좌측 정렬(`left=16px`) 유지.
- 스크롤바 숨김(전역 CSS)·`-webkit-overflow-scrolling:touch`·터치 스와이프는 바깥 `overflow-x-auto` 컨테이너 구조가 그대로라 이전과 동일하게 유효.
- 두 행이 각각 독립된 `flex` 박스이지만 같은 `overflow-x-auto` 부모 안에 있어 **항상 함께** 가로로 스크롤됨(한쪽 행만 스크롤되는 문제 없음 — Playwright로 `scrollLeft` 이동 후 양쪽 행 모두 이동 확인).
- 터치 타겟(칩 `h-[45px] min-w-[119px]`) 무변경.

### 검증
- `npx tsc --noEmit` — 통과(에러 없음).
- `npx biome lint components/elements/tabs/ButtonTabs.tsx` — 이번 변경으로 새로 발생한 이슈 없음(기존 해시태그 버튼 `type` 누락 1건만 잔존, 범위 밖 유지).
- Playwright(Chromium) 합성 레이아웃 실측(순서·좌표 검증 포함) — 위 표 참조, 6개 시나리오 전부 요구사항(2줄 고정·행 우선 순서·왼쪽 정렬·페이지 가로 스크롤 없음·전체 도달 가능) 충족.

### 계획과 달라진 점 / 로직 연결 필요 / 미완 · 후속
- `home.tsx`·`underline` variant는 이번에도 무변경.
- `IDE 진단`: 이번 편집 직후 `chipTopRow`/`chipBottomRow` "unused" 경고가 일시적으로 표시되었으나, 바로 이어진 렌더링부 수정에서 두 변수를 모두 사용하도록 반영해 해소됨(최종 lint 결과에 미반영, 확인 완료).
- 실기기 육안 검증(2행이 스크롤 중 서로 어긋나 보이지 않는지, 실제 API 태그 라벨 길이 반영 시 정렬)은 미실행 — 개발 서버 기동 후 확인 권장.
