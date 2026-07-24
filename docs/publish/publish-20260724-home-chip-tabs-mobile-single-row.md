# 홈 칩 탭 모바일 1행(가로 스크롤) 반응형 개선 — 퍼블리싱 결과

- 작성 일자: 2026-07-24
- 근거 계획: [`docs/plan/plan-20260724-home-chip-tabs-mobile-single-row.md`](../plan/plan-20260724-home-chip-tabs-mobile-single-row.md)
- 선행 참고 문서: [`docs/publish/publish-20260722-home-tag-ranking-tabs.md`](./publish-20260722-home-tag-ranking-tabs.md) — 특히 ④ 절(행 우선 순서 보정)의 768/1280px 2줄 고정 실측 결과가 이번 회귀 기준선.
- 담당: code-publisher — 계획의 **1단계(`[담당: publisher]`)** 만 수행. `views/main/home.tsx`는 writer 담당 파일이라 수정하지 않음(계획 지시 그대로 준수).

## 퍼블리싱 요약

`components/elements/tabs/ButtonTabs.tsx`의 `variant='chip'` 분기를 CSS 전용 이중 렌더(계획 접근안 (a))로 교체했다. `md`(768px) 미만은 `tabs.map`으로 전체를 **1행**에 나열해 바깥 `overflow-x-auto` 컨테이너로 가로 스크롤하고, `md` 이상은 기존 `chipTopRow`/`chipBottomRow` **2행 고정** 구조를 그대로 유지한다. `renderTabButton`, 배열 분할 계산, 스크롤 컨테이너, `underline` variant는 전부 무변경이며, Playwright 합성 실측으로 360/768/1280px 6개 시나리오(17칩/7칩) 전부 계획의 기대 동작과 일치함을 확인했다.

## 변경 파일

- `components/elements/tabs/ButtonTabs.tsx:217-245` — chip 분기 JSX를 `flex md:hidden w-max gap-[14px]`(모바일 1행, `tabs.map`) + `hidden md:flex flex-col items-start gap-[14px]`(md 이상, 기존 2행 구조 이식) Fragment로 교체. 주석(`:219-223`)을 신규 동작(모바일 1행/md+ 2행)에 맞게 갱신. 바깥 스크롤 컨테이너(`:222`)·`renderTabButton`(`:185-215`)·`chipRowSplit`/`chipTopRow`/`chipBottomRow`(`:180-182`)·`underline` 분기(`:246-249`)는 무변경.
  - 반응형 전략: Tailwind `md:` 브레이크포인트(min-width 768px)를 이용한 CSS 전용 이중 블록 — 모바일 퍼스트로 기본은 1행(`flex`)이고 `md:hidden`으로 숨김 전환, 2행 블록은 기본 `hidden`이고 `md:flex`로 노출. JS 분기·훅 없이 SSR 안전.
- `views/main/home.tsx` — **수정하지 않음**(writer 담당 파일, 계획 지시 준수).

## 반응형 / 웹뷰 점검

Playwright(Chromium, `C:\temp\pw-qa\node_modules` 로컬 설치분) 합성 레이아웃 실측 — 실제 마크업 구조(`relative flex overflow-x-auto hide-scrollbar [-webkit-overflow-scrolling:touch]` → `flex md:hidden w-max gap-[14px]` / `hidden md:flex flex-col items-start gap-[14px]` → `flex w-max gap-[14px]` 행)를 그대로 재현한 정적 HTML + `@media (min-width: 768px)`로 실측(스크래치패드 임시 스크립트, 프로젝트에 파일 추가 없음).

### 360px (모바일, `md` 미만) — 1행 + 내부 가로 스크롤

| 항목 | 17칩 | 7칩(폴백) |
|---|---|---|
| 표시 블록 | 모바일 블록만(`display:flex`), md+ 블록은 `display:none` | 동일 |
| 줄 수(rowCount) | **1** | **1** |
| 내부 가로 스크롤 발생 | 예(328px < 2247px) | 예(328px < 917px) |
| 페이지 레벨 가로 스크롤 | 없음 | 없음 |
| 첫 칩 left | 16px(좌측 정렬) | 16px |
| 배열 순서(좌→우) | 원본 순서 그대로(추천→랭킹→...→드라마) | 원본 순서 그대로 |
| 스크롤 끝까지 이동 시 마지막 칩 도달 | 가능 | 가능 |

### 768px / 1280px (`md` 이상) — 2행 고정, 회귀 없음

| 항목 | 17칩 | 7칩(폴백) |
|---|---|---|
| 표시 블록 | md+ 블록만(`display:flex`), 모바일 블록은 `display:none` | 동일 |
| 줄 수(rowCount) | **2**(양쪽 폭 동일) | **2**(양쪽 폭 동일) |
| 행 우선 순서 정확(`rowOrderCorrect`) | `[true, true]` | `[true, true]` |
| 1행 전체 인덱스 < 2행 전체 인덱스(`rowMajorOrderCorrect`) | true | true |
| 1행 구성 | 추천~판타지(9개) | 추천~인기(4개) |
| 2행 구성 | 일상~드라마(8개) | 남자~성별모름(3개) |
| 첫 칩 left | 16px | 16px |
| 페이지 레벨 가로 스크롤 | 없음 | 없음 |
| 내부 가로 스크롤 필요 | 768px: 예(736<1183) / 1280px: 아니오(1183<1280, 이미 다 표시) | 768px·1280px 모두 아니오(518px 이내) |
| 전체 칩 스크롤로 도달 가능 | 예 | 예 |

→ `docs/publish/publish-20260722-home-tag-ranking-tabs.md` ④ 절의 768/1280px 실측(줄 수 2, 행 우선 순서, 좌측 정렬, `rowMajorOrderCorrect` 등)과 **완전히 동일** — 회귀 없음.

### 이중 블록 렌더 확인 (계획 요구 항목)

- 360px에서 `mobileBlockVisible: true` / `desktopBlockVisible: false`, `visibleChipCount`(실제 화면에 보이는 칩 수, `offsetParent`/`getClientRects` 기준)가 모바일 블록 칩 수(17 또는 7)와 정확히 일치 — md+ 블록은 DOM에는 존재하나 `display:none`이라 렌더(가시성) 안 됨.
- 768px/1280px에서 반대로 `desktopBlockVisible: true` / `mobileBlockVisible: false`, `visibleChipCount`가 md+ 블록 칩 수와 일치.
- 두 블록 모두 DOM에는 항상 존재(칩 최대 17×2 중복)하나 숨김 쪽은 `display:none`이라 포커스·AT 대상에서 제외됨(계획의 리스크 평가와 일치).

### 웹뷰 관련 고려사항

- 바깥 스크롤 컨테이너(`overflow-x-auto hide-scrollbar [-webkit-overflow-scrolling:touch]`)는 무변경이므로 iOS WebView 모멘텀 스크롤·전역 스크롤바 숨김(`app/globals.css`)이 1행/2행 어느 쪽 렌더에도 그대로 적용됨.
- 새 창/팝업, 클립보드 등은 이번 변경과 무관(탭 클릭은 기존과 동일하게 `router.push` 인앱 라우팅만 사용).

### 터치 타겟

- 칩 `h-[45px] min-w-[119px]` 무변경 확인(실측 `chipHeight: 45`, `chipMinWidthOk: true` — 44px 이상 전부 충족).

## 검증

- `npx tsc --noEmit` — 통과(에러 없음).
- `npx biome lint components/elements/tabs/ButtonTabs.tsx` — 이번 변경으로 새로 발생한 이슈 없음. 잔존 2건(미사용 `React` import, 해시태그 버튼 `type` 누락 1건)은 이번 세션 시작 전부터 존재하던 사항으로(`git diff` 대조 결과 내 편집 범위 밖), 계획에서 허용한 "해시태그 버튼 type 누락 1건 잔존 허용"과 일치. `React` 미사용 import는 계획에 언급되지 않았으나 이번 변경과 무관한 별건이라 범위 밖으로 유지.
- Playwright(Chromium) 합성 레이아웃 실측 — 위 두 표 참조. 360px(1행+내부스크롤+원본순서+좌측정렬+끝까지 도달) 및 768/1280px(2행 고정+행우선순서+회귀없음) 6개 시나리오(17칩×3폭 + 7칩×3폭) 전부 계획의 검증 기준 충족.

## 계획과 달라진 점 / 로직 연결 필요 / 미완 · 후속

- 계획과 달라진 점: 없음. 계획 1단계 그대로 구현.
- 로직 연결 필요: 없음(순수 CSS/마크업 변경, props/콜백 인터페이스 변경 없음).
- 미완·후속:
  - 실기기/실브라우저 육안 검증(767↔768px 경계 리사이즈 시 실제 체감 전환, 실 데이터 태그 라벨 길이)은 미실행 — 개발 서버 기동 후 확인 권장.
  - `React` 미사용 import lint 경고는 이번 작업 범위 밖이라 정리하지 않음. 필요 시 별건으로 요청 바람.

---

## 추가 요청 반영 — 모바일 칩 폭 글자 맞춤 (2026-07-24, 후속)

> 사용자 추가 요청: "첨부 스크린샷(모바일)처럼 모바일(md 미만)에서는 칩 박스가 글자 크기에 맞게 줄어들어야 한다 — 현재는 `min-w-[119px]` 때문에 짧은 라벨도 119px 고정 폭으로 넓게 나온다."

### 변경 파일

- `components/elements/tabs/ButtonTabs.tsx:198` — `renderTabButton`의 chip 클래스에서 `min-w-[119px]` → `md:min-w-[119px]`로 변경.
  ```diff
  - 'inline-flex h-[45px] min-w-[119px] shrink-0 items-center justify-center whitespace-nowrap rounded-full px-4 text-sm md:text-base font-medium transition-colors',
  + 'inline-flex h-[45px] md:min-w-[119px] shrink-0 items-center justify-center whitespace-nowrap rounded-full px-4 text-sm md:text-base font-medium transition-colors',
  ```
  - 모바일(`md` 미만): 최소폭 없음 → 칩 폭이 콘텐츠(글자 + `px-4` 좌우 16px 패딩)에 맞게 축소.
  - `md` 이상(2줄 레이아웃): 기존 `min-w-[119px]` 그대로 유지 — 회귀 없음.
  - **높이 `h-[45px]`는 유지**(CLAUDE.md 터치 타겟 최소 44px 규칙). 폭도 짧은 2글자 라벨(예: "추천")이 실측 60px로 44px 이상을 충분히 확보해 규칙을 위반하지 않는다.
  - `gap-[14px]`(칩 간격)는 사용자가 명시 요청하지 않아 재량 변경 없이 그대로 유지.
  - `underline` variant, `md` 이상 2줄 레이아웃, `views/main/home.tsx`는 무변경.

### Playwright 실측 결과 (칩 폭 실측 포함)

**360px(모바일, `md` 미만) — 칩 폭이 라벨 길이에 따라 가변, 전부 44px 이상:**

| 라벨 | 폭(px) |
|---|---|
| 추천/랭킹/최신/인기/남자/여자/일상/힐링/액션/추리 (2글자) | 60 |
| SF (2글자, 영문) | 50 |
| 로맨스/판타지/스릴러/코미디/드라마 (3글자) | 74 |
| 성별모름 (4글자) | 88 |

- 17칩·7칩 모두 `allChipsAtLeast119Width: false`(더 이상 119px 고정 아님), `allChipsMeetMinTouchWidth44: true`(44px 미만 없음, 최소 실측 50px) 확인.
- 1행 유지(`rowCount: 1`), 페이지 레벨 가로 스크롤 없음, 내부 가로 스크롤 정상 발생(17칩: 328<1332px, 7칩: 328<532px), 첫 칩 `left: 16px`(좌측 정렬 유지), 배열 순서(`rowOrderCorrect: [true]`)·스크롤 끝까지 마지막 칩 도달 가능 모두 유지.

**768px/1280px(`md` 이상) — 칩 폭 119px 고정, 회귀 없음:**

| 시나리오 | 폭(px) 전체 | 줄 수 |
|---|---|---|
| 17칩 × 768/1280px | 전부 119 | 2 |
| 7칩(폴백) × 768/1280px | 전부 119 | 2 |

`allChipsAtLeast119Width: true`, `rowOrderCorrect: [true, true]`, `rowMajorOrderCorrect: true`, 첫 칩 `left: 16px` — 이전 섹션(모바일 1행 도입) 실측과 동일, 회귀 없음.

### 반응형 / 웹뷰 점검

- 360px에서 칩 개별 폭이 콘텐츠 기준으로 줄어들며 스크린샷 의도(짧은 라벨은 좁은 박스)를 충족.
- 터치 타겟: 폭 최소 실측값 50px(≥44px), 높이 45px(≥44px) 모두 CLAUDE.md 규칙 충족 — 스크린샷처럼 높이를 낮추지 않아 규칙 위반 없음.
- `md` 이상 2줄 레이아웃·가로 스크롤 컨테이너·터치 스와이프는 이전 섹션과 동일하게 무변경.

### 검증

- `npx tsc --noEmit` — 통과(에러 없음).
- `npx biome lint components/elements/tabs/ButtonTabs.tsx` — 이번 변경으로 새 이슈 없음(잔존 2건은 이전과 동일, 범위 밖).
- Playwright(Chromium) 합성 레이아웃 실측 — 위 표 참조. 360px(가변 폭 + 44px 이상 + 1행 + 좌측정렬 + 순서유지 + 스크롤가능) 및 768/1280px(119px 고정 회귀 없음) 6개 시나리오 전부 충족.

### 계획과 달라진 점 / 로직 연결 필요 / 미완 · 후속

- 계획과 달라진 점: 없음(사용자 추가 요청 그대로 구현).
- 로직 연결 필요: 없음.
- 미완·후속: 실기기 육안 검증(스크린샷 대비 시각적 밀도 체감, 실제 API 태그 라벨 길이)은 미실행 — 개발 서버 기동 후 확인 권장. 칩 간격(`gap-[14px]`)·높이(`h-[45px]`)는 요청 범위 밖이라 유지했으며, 추가 조정이 필요하면 별도 요청 바람.

---

## 추가 요청 반영 — md+ 폭 기준 자동 개행(flex-wrap) 전환, "2줄 고정" 요구 폐기 (2026-07-24, 후속)

> 사용자 추가 요청: "데스크톱 스크린샷에서 14칩(정적 4 + 태그 10)이 7/7로 나뉘어 오른쪽에 큰 여백이 남는다." → 원인은 `md`+ 2줄 레이아웃이 배열 개수 절반 분할(`Math.ceil(tabs.length/2)`) 방식이라 폭과 무관하게 항상 절반씩 나뉘기 때문(예: 14개 → 7/7 고정, 실제 폭에 몇 개가 들어갈 수 있는지는 무시됨). 제시된 선택지 중 사용자가 **1번: `md` 이상을 폭 기준 자동 개행(flex-wrap)으로 전환, "2줄 고정" 요구는 폐기**를 선택했다.
>
> 참고: 이 시점 기준 `views/main/home.tsx`의 정적 탭이 4개(추천/랭킹/최신/인기, `남자`/`여자`/`성별모름` 제거됨)로 이전 세션(7개) 대비 변경되어 있어, 14칩(4+태그10)/4칩(폴백) 시나리오로 재검증했다.

### 원인 분석 (배열 분할 vs 폭 기준 개행)

- 기존 `chipRowSplit = Math.ceil(tabs.length / 2)` → `chipTopRow`/`chipBottomRow`로 **탭 개수를 절반씩 정확히 나눔**. 이 방식은 "각 줄에 몇 개의 칩이 실제로 들어갈 수 있는가"(칩 폭·컨테이너 폭)를 전혀 고려하지 않는다. 14개면 폭과 무관하게 항상 7/7 → 1행에 여유 폭이 있어도 강제로 절반만 채우고 나머지는 2행으로 밀려나 우측에 큰 여백이 남는다(사용자가 스크린샷으로 지적한 현상).
- 이번 변경은 CSS `flex-wrap`으로 전환해 **각 줄이 실제 폭이 허용하는 만큼 칩을 채우고, 넘치는 칩만 다음 줄로 자동 이동**하도록 했다. 줄 수는 더 이상 고정 2가 아니라 탭 개수·칩 폭·컨테이너 폭에 따라 가변(이번 실측 기준 768px에서 3줄, 1280px에서 2줄 — "2줄 고정" 요구는 이번 요청으로 명시적으로 폐기됨).

### 변경 파일

- `components/elements/tabs/ButtonTabs.tsx` — `md` 이상 chip 블록을 `flex-wrap` 자동 개행으로 교체하고 이제 쓰이지 않는 배열 분할 변수를 제거.
  - 제거: `chipRowSplit`/`chipTopRow`/`chipBottomRow`(구 `:178-182`) — md+ 렌더가 더 이상 배열을 절반으로 나누지 않으므로 사용처가 없어짐. `npx tsc --noEmit`으로 unused 잔존 없음 확인.
  - md+ 블록 교체:
    ```diff
    - <div className="hidden md:flex flex-col items-start gap-[14px]">
    -   <div className="flex w-max gap-[14px]">
    -     {chipTopRow.map((tab, index) => renderTabButton(tab, index))}
    -   </div>
    -   {chipBottomRow.length > 0 && (
    -     <div className="flex w-max gap-[14px]">
    -       {chipBottomRow.map((tab, index) => renderTabButton(tab, chipRowSplit + index))}
    -     </div>
    -   )}
    - </div>
    + <div className="hidden md:flex md:w-full flex-wrap justify-start gap-[14px]">
    +   {tabs.map((tab, index) => renderTabButton(tab, index))}
    + </div>
    ```
  - **핵심 함정과 대응**: 바깥 스크롤 컨테이너(`relative flex overflow-x-auto ...`)의 직계 자식이라 md+ 블록도 flex 아이템이다. flex 아이템은 기본적으로 콘텐츠의 max-content 폭으로 계산되므로, 폭 제약이 없으면 `flex-wrap`을 걸어도 개행이 일어나지 않고 한 줄로 계속 늘어난다(2026-07-22 publish 문서의 "추가 요청 반영 ①"에서도 유사하게 "컨테이너의 직접 자식"이어야 개행이 걸린다는 점을 확인한 바 있음). 이를 막기 위해 `md:w-full`을 추가해 md+ 블록이 부모(스크롤 컨테이너)의 가용 폭을 명시적으로 차지하도록 강제했고, 그 결과 그 폭 안에서 `flex-wrap`이 정상적으로 개행된다(아래 실측으로 확인). 개행되므로 md+에서는 내부 가로 스크롤이 더 이상 필요 없고 자연히 발생하지 않는다(모바일 1행 블록은 `w-max`를 유지해 바깥 `overflow-x-auto`로 계속 가로 스크롤).
  - 모바일(md 미만) 1행 블록(`flex md:hidden w-max gap-[14px]`)은 **무변경**.
  - `renderTabButton`, `underline` variant, `views/main/home.tsx`는 무변경.

### Playwright 실측 결과 (현재 실제 탭 수 기준: 14칩 = 정적 4 + 태그 최대 10 / 4칩 = 정적 탭만 폴백)

**360px(md 미만) — 회귀 없음, 1행 + 내부 가로 스크롤:**

| 시나리오 | 줄 수 | 내부 가로 스크롤 | 페이지 가로 스크롤 | 첫 칩 left | 순서 |
|---|---|---|---|---|---|
| 14칩 | 1 | 예(328<1082px) | 없음 | 16px | 원본 순서 그대로 |
| 4칩(폴백) | 1 | 아니오(282px로 이미 다 들어감) | 없음 | 16px | 원본 순서 그대로 |

**768px/1280px(md 이상) — 폭 기준 자동 개행, 각 줄 최대한 채움, 페이지 가로 스크롤 없음:**

| 시나리오 | 폭 | 줄 수 | 각 줄 구성(좌→우, 행 우선) | 각 줄 우측 여백 | 내부 가로 스크롤 |
|---|---|---|---|---|---|
| 14칩 | 768px | **3** | [추천,랭킹,최신,인기,로맨스] / [판타지,일상,스릴러,코미디,힐링] / [액션,SF,추리,드라마] | 85px / 85px / 218px(마지막 줄, 자연스러움) | 없음 |
| 14칩 | 1280px | **2** | [추천,랭킹,최신,인기,로맨스,판타지,일상,스릴러,코미디] / [힐링,액션,SF,추리,드라마] | 65px / 597px(마지막 줄) | 없음 |
| 4칩(폴백) | 768px | **1** | [추천,랭킹,최신,인기] | 0px(정확히 채움) | 없음 |
| 4칩(폴백) | 1280px | **1** | [추천,랭킹,최신,인기] | 0px | 없음 |

- 각 줄 우측 여백(마지막 줄 제외)이 칩 1개 폭(약 119+14=133px) 미만(768px: 85px, 1280px: 65px)으로, **다음 칩이 더 들어갈 수 없어서 개행된 것**임을 확인 — "꽉 채우고 넘치는 것만 다음 줄로" 요구 그대로 충족. 마지막 줄은 콘텐츠가 적어 남는 여백이 크지만 이는 자연스러운 마지막 줄 특성(더 이상 채울 칩이 없음)이며 문제가 아니다.
- `rowOrderCorrect`(각 줄 내부 좌→우 = 원본 순서) · `rowMajorOrderCorrect`(이전 줄의 마지막 인덱스 < 다음 줄의 첫 인덱스, 즉 행 우선 순서) 모두 전 시나리오에서 `true` — flex-wrap 기본 동작(소스 순서 그대로 배치)만으로 행 우선 순서가 자동 보장됨(별도 배열 분할 로직 불필요, 이전 grid-flow-col의 지그재그 문제 재발 없음).
- 첫 칩 `left`는 전 시나리오 16px로 좌측 정렬 유지.
- 이전에 사용자가 스크린샷으로 지적한 "14칩 7/7 분할로 우측 큰 여백" 문제는 재현되지 않음 — 768px 3줄(5/5/4), 1280px 2줄(9/5)로 폭에 맞게 가변 분할됨.

### 반응형 / 웹뷰 점검

- 360px: 이전 섹션(모바일 1행 도입)과 동일하게 무변경·회귀 없음.
- 768px/1280px: 개행 방식으로 전환되며 md+에서는 내부 가로 스크롤이 더 이상 발생하지 않음(모든 칩이 화면 안에 보임). 바깥 `overflow-x-auto hide-scrollbar [-webkit-overflow-scrolling:touch]`는 여전히 모바일 1행 블록을 위해 유지되며 md+에는 실질적으로 스크롤할 내용이 없어 no-op.
- 터치 타겟: 칩 크기(`h-[45px]`, md 이상 `min-w-[119px]`) 무변경.
- "2줄 고정" 요구 폐기에 따라, 태그 랭킹 API 응답 개수가 달라져도(예: 10개보다 적거나 많아짐) 줄 수가 자동으로 재계산되어 항상 폭을 최대한 채우고 남는 것만 다음 줄로 넘어간다(이전 방식은 개수가 바뀔 때마다 절반 분할선이 바뀌어 우측 여백 문제가 재발할 수 있었음 — 이번 변경으로 근본 해결).

### 검증

- `npx tsc --noEmit` — 통과(에러 없음, `chipRowSplit`/`chipTopRow`/`chipBottomRow` 제거 후 unused 잔존 없음 확인).
- `npx biome lint components/elements/tabs/ButtonTabs.tsx` — 이번 변경으로 새 이슈 없음(잔존 2건은 이전과 동일, 범위 밖).
- Playwright(Chromium) 합성 레이아웃 실측 — 위 두 표 참조. 14칩/4칩 × 360/768/1280px 6개 시나리오 전부 요구사항(360px 회귀 없음, 768/1280px 폭 기준 자동 개행·꽉 채움·행 우선 순서·좌측 정렬·페이지 가로 스크롤 없음) 충족.

### 계획과 달라진 점 / 로직 연결 필요 / 미완 · 후속

- **"md+ 2줄 고정" 요구가 이번 사용자 선택(1번)으로 명시적으로 폐기됨** — 원 계획(`plan-20260724-home-chip-tabs-mobile-single-row.md`)과 2026-07-22 publish 문서 ③④ 절에서 채택했던 "2줄 고정 + 배열 분할" 방식은 이번 변경으로 대체되었다. 모바일(md 미만) 1행 + 가로 스크롤 요구는 그대로 유지.
- 로직 연결 필요: 없음(순수 CSS/마크업 변경).
- 미완·후속: 실기기 육안 검증(개행 시 줄 수 변화에 따른 아래 콘텐츠와의 세로 간격 변화, 실제 API 태그 개수·라벨 길이 반영 시 줄 구성)은 미실행 — 개발 서버 기동 후 확인 권장. `underline` variant·`home.tsx`는 이번에도 무변경.
